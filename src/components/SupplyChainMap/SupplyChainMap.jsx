import { useMemo } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issues in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Create custom SVG DivIcons for map markers
const createCustomIcon = (bgColor, iconText) => {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="
        background-color: ${bgColor};
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 13px;
        border: 2px solid white;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
      ">
        ${iconText}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const waypointIcon = createCustomIcon("#3b82f6", "📍");
const originIcon = createCustomIcon("#10b981", "🏭");
const destinationIcon = createCustomIcon("#8b5cf6", "🏬");

const vehicleIconHardware = createCustomIcon("#059669", "🚛");
const vehicleIconSimulated = createCustomIcon("#3b82f6", "🛰️");
const vehicleIconDeviation = createCustomIcon("#d97706", "⚠️");
const vehicleIconOffRoute = createCustomIcon("#dc2626", "🚨");

function SupplyChainMap({ route, activeNodeId }) {
  const waypoints = route?.waypoints || [];
  const actualTrack = route?.actualTrack || [];
  const origin = route?.origin;
  const destination = route?.destination;
  const routeCondition = route?.routeCondition || "ON_ROUTE";

  // Coordinates for Planned Route Polyline
  const plannedPositions = useMemo(() => {
    if (waypoints.length > 0) {
      return waypoints.map(w => [w.latitude, w.longitude]);
    }
    if (origin && destination) {
      return [
        [origin.latitude, origin.longitude],
        [destination.latitude, destination.longitude]
      ];
    }
    return [];
  }, [waypoints, origin, destination]);

  // Coordinates for Actual Track Polyline
  const actualPositions = useMemo(() => {
    return actualTrack.map(t => [t.latitude, t.longitude]);
  }, [actualTrack]);

  // Current Vehicle Position (latest point or origin fallback)
  const currentPos = useMemo(() => {
    if (actualPositions.length > 0) {
      return actualPositions[actualPositions.length - 1];
    }
    if (origin) {
      return [origin.latitude, origin.longitude];
    }
    return [13.0827, 80.2707]; // Chennai Default
  }, [actualPositions, origin]);

  const latestTrackPoint = actualTrack.length > 0 ? actualTrack[actualTrack.length - 1] : null;

  // Determine Vehicle Marker Icon
  const vehicleIcon = useMemo(() => {
    if (routeCondition === "OFF_ROUTE") return vehicleIconOffRoute;
    if (routeCondition === "ROUTE_DEVIATION") return vehicleIconDeviation;
    if (latestTrackPoint?.source === "hardware") return vehicleIconHardware;
    return vehicleIconSimulated;
  }, [routeCondition, latestTrackPoint]);

  // Polyline color for actual track
  const actualPolylineColor = useMemo(() => {
    if (routeCondition === "OFF_ROUTE") return "#ef4444";
    if (routeCondition === "ROUTE_DEVIATION") return "#f59e0b";
    return "#10b981";
  }, [routeCondition]);

  return (
    <div className="relative w-full h-[450px] rounded-2xl overflow-hidden shadow-lg border border-slate-200">
      <MapContainer
        center={currentPos}
        zoom={9}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Planned Route Line */}
        {plannedPositions.length > 1 && (
          <Polyline
            positions={plannedPositions}
            pathOptions={{
              color: "#3b82f6",
              weight: 4,
              dashArray: "8, 8",
              opacity: 0.7
            }}
          />
        )}

        {/* Actual Traveled Track Line */}
        {actualPositions.length > 1 && (
          <Polyline
            positions={actualPositions}
            pathOptions={{
              color: actualPolylineColor,
              weight: 5,
              opacity: 0.9
            }}
          />
        )}

        {/* Origin Marker */}
        {origin && (
          <Marker position={[origin.latitude, origin.longitude]} icon={originIcon}>
            <Popup>
              <div className="p-1">
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">ORIGIN</span>
                <h4 className="font-bold text-sm text-slate-900 mt-1">{origin.name}</h4>
                <p className="text-xs text-slate-500 font-mono">{origin.latitude.toFixed(4)}, {origin.longitude.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker position={[destination.latitude, destination.longitude]} icon={destinationIcon}>
            <Popup>
              <div className="p-1">
                <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">DESTINATION</span>
                <h4 className="font-bold text-sm text-slate-900 mt-1">{destination.name}</h4>
                <p className="text-xs text-slate-500 font-mono">{destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Intermediate Waypoints */}
        {waypoints.map((wp, idx) => (
          <Marker key={`wp-${idx}`} position={[wp.latitude, wp.longitude]} icon={waypointIcon}>
            <Popup>
              <div className="p-1">
                <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">Waypoint #{wp.sequence || idx + 1}</span>
                <h4 className="font-bold text-sm text-slate-900 mt-1">{wp.name}</h4>
                <p className="text-xs text-slate-500">Status: <strong className="text-blue-600">{wp.status || "PENDING"}</strong></p>
              </div>
            </Popup>
            <Tooltip permanent direction="top" offset={[0, -20]} className="text-xs font-semibold bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-sm">
              {wp.sequence}. {wp.name}
            </Tooltip>
          </Marker>
        ))}

        {/* Live Vehicle / Node Marker */}
        {latestTrackPoint && (
          <Marker position={currentPos} icon={vehicleIcon}>
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-bold text-sm text-slate-900 font-mono">
                    {route?.nodeId || activeNodeId}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    latestTrackPoint.source === "hardware"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {latestTrackPoint.source === "hardware" ? "📡 HARDWARE" : "🛰️ SIMULATED"}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <p><strong>Speed:</strong> {latestTrackPoint.speedKmh ?? 0} km/h</p>
                  <p><strong>Accuracy:</strong> ±{latestTrackPoint.accuracyM ?? 4} m</p>
                  <p><strong>Route Condition:</strong> <span className="font-bold text-emerald-600">{routeCondition}</span></p>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    Updated: {new Date(latestTrackPoint.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Interactive Map Legend Overlay */}
      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-200 text-xs space-y-1.5 z-[1000]">
        <div className="font-bold text-slate-800 mb-1">Route Legend</div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-blue-500 border-b border-dashed border-blue-500"></span>
          <span className="text-slate-600">Planned Route</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-1 bg-emerald-500 rounded-full"></span>
          <span className="text-slate-600">Actual GPS Track</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-emerald-600 rounded-full border border-white"></span>
          <span className="text-slate-600">Live Vehicle ({route?.nodeId || activeNodeId})</span>
        </div>
      </div>
    </div>
  );
}

export default SupplyChainMap;
