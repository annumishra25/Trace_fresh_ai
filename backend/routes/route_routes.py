from flask import Blueprint, jsonify, request
from services.route_engine import RouteEngineService

route_bp = Blueprint("route_bp", __name__)
route_service = RouteEngineService()


@route_bp.route("/api/routes", methods=["GET"])
def get_routes():
    """Retrieve all monitored shipment routes."""
    routes = route_service.load_routes()
    return jsonify({
        "status": "success",
        "count": len(routes),
        "data": routes
    }), 200


@route_bp.route("/api/routes/<route_id>", methods=["GET"])
def get_route_by_id(route_id):
    """Retrieve details for a specific route."""
    route = route_service.get_route_by_id(route_id)
    if not route:
        return jsonify({"status": "error", "message": f"Route '{route_id}' not found"}), 404
    return jsonify({
        "status": "success",
        "data": route
    }), 200


@route_bp.route("/api/routes/<route_id>/track", methods=["GET"])
def get_route_track(route_id):
    """Retrieve GPS track history for a specific route."""
    route = route_service.get_route_by_id(route_id)
    if not route:
        return jsonify({"status": "error", "message": f"Route '{route_id}' not found"}), 404

    track = route.get("actualTrack", [])
    return jsonify({
        "status": "success",
        "routeId": route_id,
        "count": len(track),
        "data": track
    }), 200


@route_bp.route("/api/routes/<route_id>/status", methods=["GET"])
def get_route_status(route_id):
    """Retrieve live status, progress, deviation, and delay analysis for a route."""
    route = route_service.get_route_by_id(route_id)
    if not route:
        return jsonify({"status": "error", "message": f"Route '{route_id}' not found"}), 404

    actual_route = route.get("actualRoute", {})
    gps_quality = route.get("gpsQuality", {})

    status_data = {
        "routeId": route["routeId"],
        "shipmentId": route.get("shipmentId"),
        "nodeId": route.get("nodeId"),
        "status": route.get("status", "IN_TRANSIT"),
        "transitState": route.get("transitState", "IN_TRANSIT"),
        "routeCondition": route.get("routeCondition", "ON_ROUTE"),
        "progressPercent": actual_route.get("progressPercent", 0),
        "distanceTraveledKm": actual_route.get("distanceKm", 0.0),
        "plannedDistanceKm": route.get("plannedRoute", {}).get("distanceKm", 0.0),
        "currentDeviationMeters": actual_route.get("currentDeviationMeters", 0),
        "maxDeviationMeters": actual_route.get("maxDeviationMeters", 0),
        "offRouteDurationMinutes": actual_route.get("offRouteDurationMinutes", 0),
        "delayMinutes": actual_route.get("delayMinutes", 0),
        "delayStatus": actual_route.get("delayStatus", "ON_TIME"),
        "delayReason": actual_route.get("delayReason", "Proceeding normally"),
        "estimatedArrivalTime": actual_route.get("estimatedArrivalTime"),
        "gpsState": gps_quality.get("gpsState", "GPS_LOCKED"),
        "lastGpsUpdate": route.get("actualTrack", [{}])[-1].get("timestamp") if route.get("actualTrack") else None
    }

    return jsonify({
        "status": "success",
        "data": status_data
    }), 200


@route_bp.route("/api/routes/<route_id>/events", methods=["GET"])
def get_route_events(route_id):
    """Retrieve event log timeline for a route."""
    route = route_service.get_route_by_id(route_id)
    if not route:
        return jsonify({"status": "error", "message": f"Route '{route_id}' not found"}), 404

    events = route.get("events", [])
    return jsonify({
        "status": "success",
        "routeId": route_id,
        "count": len(events),
        "data": events
    }), 200


@route_bp.route("/api/routes", methods=["POST"])
def create_route():
    """Create or update a route definition."""
    payload = request.get_json()
    if not payload or "shipmentId" not in payload:
        return jsonify({"status": "error", "message": "Missing shipmentId in payload"}), 400

    created = route_service.create_route(payload)
    return jsonify({
        "status": "success",
        "message": f"Route '{created['routeId']}' created successfully",
        "data": created
    }), 201


@route_bp.route("/api/routes/<route_id>/waypoints", methods=["POST"])
def update_waypoints(route_id):
    """Update or add waypoints to an existing route."""
    route = route_service.get_route_by_id(route_id)
    if not route:
        return jsonify({"status": "error", "message": f"Route '{route_id}' not found"}), 404

    payload = request.get_json()
    if not payload or "waypoints" not in payload:
        return jsonify({"status": "error", "message": "Missing waypoints array in payload"}), 400

    route["waypoints"] = payload["waypoints"]
    route_service._update_route_in_list(route)

    return jsonify({
        "status": "success",
        "message": f"Waypoints updated for route '{route_id}'",
        "data": route
    }), 200


@route_bp.route("/api/routes/<route_id>/assign-node", methods=["POST"])
def assign_node(route_id):
    """Assign a physical monitoring node to a route."""
    route = route_service.get_route_by_id(route_id)
    if not route:
        return jsonify({"status": "error", "message": f"Route '{route_id}' not found"}), 404

    payload = request.get_json()
    node_id = payload.get("nodeId") if payload else None

    if not node_id:
        return jsonify({"status": "error", "message": "Missing nodeId in payload"}), 400

    route["nodeId"] = node_id
    route_service._update_route_in_list(route)

    return jsonify({
        "status": "success",
        "message": f"Node '{node_id}' assigned to route '{route_id}'",
        "data": route
    }), 200


@route_bp.route("/api/routes/<route_id>/replay", methods=["POST"])
def trigger_demo_replay(route_id):
    """Trigger a step in the interactive demo route replay stream for expos."""
    payload = request.get_json() or {}
    step_index = payload.get("stepIndex", 1)

    updated_route = route_service.generate_demo_replay_step(route_id, step_index)
    if not updated_route:
        return jsonify({"status": "error", "message": f"Route '{route_id}' not found"}), 404

    return jsonify({
        "status": "success",
        "message": f"Demo replay step {step_index} processed for route '{route_id}'",
        "data": updated_route
    }), 200
