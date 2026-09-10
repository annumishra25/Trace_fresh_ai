import json
import math
import os
import threading
from datetime import datetime, timezone

ROUTES_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "routes.json")
_file_lock = threading.Lock()

# Configuration constants
MAX_GPS_SPEED_KMH = 150.0  # Speed jump outlier threshold
STOP_SPEED_THRESHOLD_KMH = 3.0  # Speed below this is considered stopped
STOP_DURATION_THRESHOLD_MINUTES = 10  # Duration for a prolonged stop
ROUTE_WARNING_DEVIATION_METERS = 200.0  # Minor deviation warning
ROUTE_OFF_ROUTE_DEVIATION_METERS = 1000.0  # Major off-route threshold
OFF_ROUTE_HYSTERESIS_COUNT = 3  # Points required to trigger OFF_ROUTE
GPS_STALE_TIMEOUT_SECONDS = 120  # Timeout for stale GPS signal


def haversine_distance_km(lat1, lon1, lat2, lon2):
    """Calculate the great-circle distance between two points in kilometers."""
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 0.0
    
    # Earth radius in kilometers
    R = 6371.0
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2.0) ** 2)
    
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


def point_to_segment_distance_meters(p_lat, p_lon, a_lat, a_lon, b_lat, b_lon):
    """
    Calculate minimum distance in meters from point P to line segment AB.
    """
    if a_lat == b_lat and a_lon == b_lon:
        return haversine_distance_km(p_lat, p_lon, a_lat, a_lon) * 1000.0

    # Approximate planar projection for short segment distances
    ref_lat = math.radians(p_lat)
    kx = 111320.0 * math.cos(ref_lat)
    ky = 110540.0

    px = p_lon * kx
    py = p_lat * ky
    ax = a_lon * kx
    ay = a_lat * ky
    bx = b_lon * kx
    by = b_lat * ky

    abx = bx - ax
    aby = by - ay
    apx = px - ax
    apy = py - ay

    ab2 = abx * abx + aby * aby
    if ab2 == 0:
        return haversine_distance_km(p_lat, p_lon, a_lat, a_lon) * 1000.0

    t = (apx * abx + apy * aby) / ab2
    t = max(0.0, min(1.0, t))

    proj_x = ax + t * abx
    proj_y = ay + t * aby

    proj_lon = proj_x / kx
    proj_lat = proj_y / ky

    return haversine_distance_km(p_lat, p_lon, proj_lat, proj_lon) * 1000.0


def validate_gps_point(point):
    """
    Validate GPS coordinate parameters.
    Returns (is_valid, reason).
    """
    if not isinstance(point, dict):
        return False, "Point is not a dictionary"

    lat = point.get("latitude")
    lon = point.get("longitude")

    if lat is None or lon is None:
        return False, "Missing latitude or longitude"

    try:
        lat = float(lat)
        lon = float(lon)
    except (ValueError, TypeError):
        return False, "Latitude or longitude is not a valid float"

    if lat < -90.0 or lat > 90.0:
        return False, f"Latitude {lat} out of range [-90, 90]"

    if lon < -180.0 or lon > 180.0:
        return False, f"Longitude {lon} out of range [-180, 180]"

    # Reject 0,0 fix unless specifically intended
    if abs(lat) < 0.0001 and abs(lon) < 0.0001:
        return False, "GPS position is 0,0 (No Fix)"

    status = point.get("status")
    if status == "NO_FIX":
        return False, "GPS status reports NO_FIX"

    return True, "OK"


def is_gps_outlier(prev_point, curr_point, max_speed_kmh=MAX_GPS_SPEED_KMH):
    """
    Detect impossible position jumps between consecutive GPS readings.
    """
    if not prev_point or not curr_point:
        return False

    val_prev, _ = validate_gps_point(prev_point)
    val_curr, _ = validate_gps_point(curr_point)
    if not val_prev or not val_curr:
        return False

    dist_km = haversine_distance_km(
        prev_point["latitude"], prev_point["longitude"],
        curr_point["latitude"], curr_point["longitude"]
    )

    t_prev_str = prev_point.get("timestamp")
    t_curr_str = curr_point.get("timestamp")

    if not t_prev_str or not t_curr_str:
        return False

    try:
        t_prev = datetime.fromisoformat(t_prev_str.replace("Z", "+00:00"))
        t_curr = datetime.fromisoformat(t_curr_str.replace("Z", "+00:00"))
        delta_seconds = abs((t_curr - t_prev).total_seconds())
    except Exception:
        return False

    if delta_seconds <= 0:
        return dist_km > 0.5  # Instantaneous jump > 500m is an outlier

    implied_speed_kmh = (dist_km / delta_seconds) * 3600.0
    return implied_speed_kmh > max_speed_kmh


def calculate_min_deviation_meters(point_lat, point_lon, waypoints):
    """
    Calculate perpendicular distance in meters from point to the polyline
    formed by ordered waypoints.
    """
    if not waypoints or len(waypoints) == 0:
        return 0.0

    if len(waypoints) == 1:
        w = waypoints[0]
        return haversine_distance_km(point_lat, point_lon, w["latitude"], w["longitude"]) * 1000.0

    min_dist = float("inf")
    for i in range(len(waypoints) - 1):
        w1 = waypoints[i]
        w2 = waypoints[i + 1]
        dist = point_to_segment_distance_meters(
            point_lat, point_lon,
            w1["latitude"], w1["longitude"],
            w2["latitude"], w2["longitude"]
        )
        if dist < min_dist:
            min_dist = dist

    return round(min_dist, 1)


class RouteEngineService:
    def __init__(self, storage_path=ROUTES_FILE):
        self.storage_path = storage_path
        self._ensure_storage_exists()

    def _ensure_storage_exists(self):
        os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)
        if not os.path.exists(self.storage_path):
            with open(self.storage_path, "w") as f:
                json.dump([], f, indent=2)

    def load_routes(self):
        with _file_lock:
            try:
                with open(self.storage_path, "r") as f:
                    return json.load(f)
            except Exception:
                return []

    def save_routes(self, routes):
        with _file_lock:
            with open(self.storage_path, "w") as f:
                json.dump(routes, f, indent=2)

    def get_route_by_id(self, route_id):
        routes = self.load_routes()
        for r in routes:
            if r.get("routeId") == route_id:
                return r
        return None

    def get_route_by_node_id(self, node_id):
        routes = self.load_routes()
        for r in routes:
            status = r.get("status", "IN_TRANSIT")
            if r.get("nodeId") == node_id and status in ["PLANNED", "IN_TRANSIT"]:
                return r
        return None

    def get_route_by_shipment_id(self, shipment_id):
        routes = self.load_routes()
        for r in routes:
            if r.get("shipmentId") == shipment_id:
                return r
        return None

    def create_route(self, route_data):
        routes = self.load_routes()
        route_id = route_data.get("routeId", f"ROUTE-{len(routes) + 1:03d}")
        route_data["routeId"] = route_id
        if "status" not in route_data:
            route_data["status"] = "IN_TRANSIT"
        
        # Calculate planned distance if not provided
        if not route_data.get("plannedRoute", {}).get("distanceKm"):
            waypoints = route_data.get("waypoints", [])
            planned_dist = 0.0
            for i in range(len(waypoints) - 1):
                planned_dist += haversine_distance_km(
                    waypoints[i]["latitude"], waypoints[i]["longitude"],
                    waypoints[i+1]["latitude"], waypoints[i+1]["longitude"]
                )
            if "plannedRoute" not in route_data:
                route_data["plannedRoute"] = {}
            route_data["plannedRoute"]["distanceKm"] = round(planned_dist, 1)

        if "actualRoute" not in route_data:
            route_data["actualRoute"] = {
                "distanceKm": 0.0,
                "durationMinutes": 0,
                "actualDepartureTime": None,
                "estimatedArrivalTime": None,
                "delayMinutes": 0,
                "delayStatus": "ON_TIME",
                "delayReason": "Route initialized",
                "progressPercent": 0,
                "currentDeviationMeters": 0,
                "maxDeviationMeters": 0,
                "offRouteDurationMinutes": 0,
                "deviationEventCount": 0
            }

        if "actualTrack" not in route_data:
            route_data["actualTrack"] = []
        if "events" not in route_data:
            route_data["events"] = []
        if "gpsQuality" not in route_data:
            route_data["gpsQuality"] = {
                "pointsReceived": 0,
                "validPoints": 0,
                "rejectedPoints": 0,
                "averageAccuracyMeters": 0.0,
                "longestGapSeconds": 0,
                "gpsState": "GPS_NO_FIX"
            }

        # Check duplicate
        for i, r in enumerate(routes):
            if r.get("routeId") == route_id:
                routes[i] = route_data
                self.save_routes(routes)
                return route_data

        routes.append(route_data)
        self.save_routes(routes)
        return route_data

    def process_gps_point(self, node_id, gps_payload):
        """
        Main GPS ingestion engine.
        Validates point, updates actual track, calculates deviation, progress,
        stop status, delay, and event logging.
        """
        route = self.get_route_by_node_id(node_id)
        if not route:
            return None

        gps_quality = route.setdefault("gpsQuality", {
            "pointsReceived": 0,
            "validPoints": 0,
            "rejectedPoints": 0,
            "averageAccuracyMeters": 0.0,
            "longestGapSeconds": 0,
            "gpsState": "GPS_NO_FIX"
        })
        gps_quality["pointsReceived"] += 1

        is_valid, reason = validate_gps_point(gps_payload)
        if not is_valid:
            gps_quality["rejectedPoints"] += 1
            gps_quality["gpsState"] = "GPS_NO_FIX" if gps_payload.get("status") == "NO_FIX" else "GPS_STALE"
            self._update_route_in_list(route)
            return {
                "status": "REJECTED",
                "reason": reason,
                "routeId": route["routeId"]
            }

        # Check for GPS outlier jump
        actual_track = route.setdefault("actualTrack", [])
        last_valid_point = actual_track[-1] if actual_track else None

        if last_valid_point and is_gps_outlier(last_valid_point, gps_payload):
            gps_quality["rejectedPoints"] += 1
            self._update_route_in_list(route)
            return {
                "status": "REJECTED",
                "reason": "GPS_OUTLIER_SPEED_JUMP",
                "routeId": route["routeId"]
            }

        # Valid point processing
        gps_quality["validPoints"] += 1
        gps_quality["gpsState"] = "GPS_LOCKED"
        acc = gps_payload.get("accuracyM") or gps_payload.get("accuracy", 5.0)
        curr_avg_acc = gps_quality.get("averageAccuracyMeters", 0.0)
        n_valid = gps_quality["validPoints"]
        gps_quality["averageAccuracyMeters"] = round(((curr_avg_acc * (n_valid - 1)) + float(acc)) / n_valid, 1)

        # Track point entry
        track_point = {
            "timestamp": gps_payload.get("timestamp") or datetime.now(timezone.utc).isoformat(),
            "latitude": float(gps_payload["latitude"]),
            "longitude": float(gps_payload["longitude"]),
            "speedKmh": float(gps_payload.get("speedKmh") or gps_payload.get("speed", 0.0)),
            "accuracyM": float(acc),
            "nodeId": node_id,
            "source": gps_payload.get("source", "hardware")
        }
        actual_track.append(track_point)

        # Update actual distance
        actual_route = route.setdefault("actualRoute", {})
        if last_valid_point:
            step_dist = haversine_distance_km(
                last_valid_point["latitude"], last_valid_point["longitude"],
                track_point["latitude"], track_point["longitude"]
            )
            actual_route["distanceKm"] = round(actual_route.get("distanceKm", 0.0) + step_dist, 2)

        # Deviation calculation
        waypoints = route.get("waypoints", [])
        deviation_meters = calculate_min_deviation_meters(
            track_point["latitude"], track_point["longitude"], waypoints
        )
        actual_route["currentDeviationMeters"] = deviation_meters
        actual_route["maxDeviationMeters"] = max(actual_route.get("maxDeviationMeters", 0), deviation_meters)

        # Route condition logic (with hysteresis)
        prev_condition = route.get("routeCondition", "ON_ROUTE")
        new_condition = "ON_ROUTE"
        if deviation_meters > ROUTE_OFF_ROUTE_DEVIATION_METERS:
            # Check consecutive off-route points
            recent_devs = [
                calculate_min_deviation_meters(p["latitude"], p["longitude"], waypoints)
                for p in actual_track[-OFF_ROUTE_HYSTERESIS_COUNT:]
            ]
            if len(recent_devs) >= OFF_ROUTE_HYSTERESIS_COUNT and all(d > ROUTE_OFF_ROUTE_DEVIATION_METERS for d in recent_devs):
                new_condition = "OFF_ROUTE"
            else:
                new_condition = "ROUTE_DEVIATION"
        elif deviation_meters > ROUTE_WARNING_DEVIATION_METERS:
            new_condition = "ROUTE_DEVIATION"
        else:
            new_condition = "ON_ROUTE"

        route["routeCondition"] = new_condition

        # Log event on condition change
        if prev_condition != new_condition:
            if new_condition in ["ROUTE_DEVIATION", "OFF_ROUTE"]:
                actual_route["deviationEventCount"] = actual_route.get("deviationEventCount", 0) + 1
                self.add_event(route, {
                    "eventType": "ROUTE_DEVIATION" if new_condition == "ROUTE_DEVIATION" else "OFF_ROUTE",
                    "timestamp": track_point["timestamp"],
                    "description": f"Shipment entered {new_condition} ({deviation_meters:.0f}m off planned route)",
                    "location": {"latitude": track_point["latitude"], "longitude": track_point["longitude"]},
                    "severity": "WARNING" if new_condition == "ROUTE_DEVIATION" else "HIGH"
                })
            elif new_condition == "ON_ROUTE" and prev_condition in ["ROUTE_DEVIATION", "OFF_ROUTE"]:
                self.add_event(route, {
                    "eventType": "ROUTE_RECOVERY",
                    "timestamp": track_point["timestamp"],
                    "description": f"Shipment returned to planned route ({deviation_meters:.0f}m deviation)",
                    "location": {"latitude": track_point["latitude"], "longitude": track_point["longitude"]},
                    "severity": "INFO"
                })

        # Progress calculation
        planned_dist = route.get("plannedRoute", {}).get("distanceKm", 100.0)
        if waypoints and len(waypoints) > 1:
            dest = waypoints[-1]
            dist_to_dest = haversine_distance_km(
                track_point["latitude"], track_point["longitude"],
                dest["latitude"], dest["longitude"]
            )
            prog = max(0, min(100, int(((planned_dist - dist_to_dest) / planned_dist) * 100)))
            actual_route["progressPercent"] = prog
        else:
            actual_route["progressPercent"] = min(100, int((actual_route["distanceKm"] / max(1.0, planned_dist)) * 100))

        # Check for prolonged stop
        speed = track_point["speedKmh"]
        if speed < STOP_SPEED_THRESHOLD_KMH:
            route["transitState"] = "STOPPED"
            # Calculate stop duration
            stop_points = []
            for p in reversed(actual_track):
                if p.get("speedKmh", 0) < STOP_SPEED_THRESHOLD_KMH:
                    stop_points.append(p)
                else:
                    break
            if len(stop_points) >= 3:
                first_stop_t = datetime.fromisoformat(stop_points[-1]["timestamp"].replace("Z", "+00:00"))
                curr_t = datetime.fromisoformat(track_point["timestamp"].replace("Z", "+00:00"))
                duration_min = round((curr_t - first_stop_t).total_seconds() / 60.0, 1)
                
                if duration_min >= STOP_DURATION_THRESHOLD_MINUTES and not self._has_recent_event(route, "STOP_DELAY", minutes=15):
                    self.add_event(route, {
                        "eventType": "STOP_DELAY",
                        "timestamp": track_point["timestamp"],
                        "description": f"Vehicle stationary for {duration_min:.0f} minutes",
                        "location": {"latitude": track_point["latitude"], "longitude": track_point["longitude"]},
                        "durationMinutes": duration_min,
                        "severity": "WARNING"
                    })
                    actual_route["delayReason"] = f"{duration_min:.0f}-minute stationary period detected"
                    actual_route["delayStatus"] = "AT_RISK" if duration_min < 20 else "DELAYED"
        else:
            route["transitState"] = "IN_TRANSIT"

        self._update_route_in_list(route)
        return {
            "status": "ACCEPTED",
            "routeId": route["routeId"],
            "progressPercent": actual_route["progressPercent"],
            "routeCondition": route["routeCondition"],
            "deviationMeters": deviation_meters
        }

    def add_event(self, route, event):
        events = route.setdefault("events", [])
        event["id"] = f"EVT-{len(events) + 1:03d}"
        events.append(event)

    def _has_recent_event(self, route, event_type, minutes=15):
        events = route.get("events", [])
        if not events:
            return False
        now = datetime.now(timezone.utc)
        for e in reversed(events):
            if e.get("eventType") == event_type:
                t_str = e.get("timestamp")
                if t_str:
                    try:
                        t = datetime.fromisoformat(t_str.replace("Z", "+00:00"))
                        if (now - t).total_seconds() < (minutes * 60):
                            return True
                    except Exception:
                        pass
        return False

    def _update_route_in_list(self, route):
        routes = self.load_routes()
        for i, r in enumerate(routes):
            if r.get("routeId") == route.get("routeId"):
                routes[i] = route
                self.save_routes(routes)
                return True
        routes.append(route)
        self.save_routes(routes)
        return True

    def generate_demo_replay_step(self, route_id, step_index):
        """
        Interactive route replay stream generator for Expo demonstrations.
        Step index maps to pre-programmed waypoints with events.
        """
        route = self.get_route_by_id(route_id)
        if not route:
            return None

        waypoints = route.get("waypoints", [])
        if not waypoints:
            return route

        total_steps = 10
        step_index = min(step_index, total_steps)

        # Interpolate position between origin and destination
        origin = route["origin"]
        dest = route["destination"]

        frac = step_index / float(total_steps)
        lat = origin["latitude"] + frac * (dest["latitude"] - origin["latitude"])
        lon = origin["longitude"] + frac * (dest["longitude"] - origin["longitude"])

        # Inject intentional demo deviation & delay at step 6
        if step_index == 6:
            lat += 0.015  # Inject ~1.8km deviation
            speed = 0.0
            source = "demo_replay"
            status_reason = "Demo Replay: Unexpected stationary traffic delay"
        elif step_index >= 7:
            speed = 55.0
            source = "demo_replay"
            status_reason = "Demo Replay: Returned to planned corridor"
        else:
            speed = 62.0
            source = "demo_replay"
            status_reason = "Demo Replay: Normal transit"

        gps_payload = {
            "latitude": round(lat, 5),
            "longitude": round(lon, 5),
            "speedKmh": speed,
            "accuracyM": 4.0,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "LOCKED",
            "source": source
        }

        # Override node ID to process
        res = self.process_gps_point(route.get("nodeId", "TF-NODE-01"), gps_payload)
        route = self.get_route_by_id(route_id)
        if route:
            route["actualRoute"]["delayReason"] = status_reason
            self._update_route_in_list(route)

        return self.get_route_by_id(route_id)
