import { useState, useEffect } from "react";
import { useTelemetry } from "../context/TelemetryContext";
import { getRoutes, getRouteById, triggerDemoReplay } from "../services/routeApi";
import SupplyChainMap from "../components/SupplyChainMap/SupplyChainMap";

function Logistics() {
  const { activeTelemetry, selectedNodeId, isLiveMode } = useTelemetry();
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState("ROUTE-001");
  const [currentRoute, setCurrentRoute] = useState(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayStep, setReplayStep] = useState(0);

  // Load routes on mount and poll every 4 seconds
  useEffect(() => {
    let isMounted = true;

    const fetchRouteData = async () => {
      const allRoutes = await getRoutes();
      if (!isMounted) return;
      setRoutes(allRoutes);

      if (allRoutes.length > 0) {
        const active = allRoutes.find(r => r.routeId === selectedRouteId) || allRoutes[0];
        setCurrentRoute(prev => (prev?.routeId === active.routeId && prev?.lastUpdated === active.lastUpdated ? prev : active));
      }
    };

    fetchRouteData();
    const interval = setInterval(fetchRouteData, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedRouteId]);

  // Handle Demo Replay Step
  const handleNextReplayStep = async () => {
    setIsReplaying(true);
    const nextStep = (replayStep % 10) + 1;
    setReplayStep(nextStep);
    const updated = await triggerDemoReplay(selectedRouteId, nextStep);
    if (updated) {
      setCurrentRoute(updated);
    }
  };

  const handleResetReplay = async () => {
    setReplayStep(0);
    setIsReplaying(false);
    const refreshed = await getRouteById(selectedRouteId);
    if (refreshed) {
      setCurrentRoute(refreshed);
    }
  };

  // Derive metrics
  const actualRoute = currentRoute?.actualRoute || {};
  const gpsQuality = currentRoute?.gpsQuality || {};
  const waypoints = currentRoute?.waypoints || [];
  const events = currentRoute?.events || [];
  const routeCondition = currentRoute?.routeCondition || "ON_ROUTE";

  const liveTemp = activeTelemetry?.sensors?.temperature?.value != null
    ? `${activeTelemetry.sensors.temperature.value}°C`
    : "5.8°C";

  const liveHum = activeTelemetry?.sensors?.humidity?.value != null
    ? `${activeTelemetry.sensors.humidity.value}%`
    : "71.2%";

  const lat = activeTelemetry?.gps?.latitude || currentRoute?.actualTrack?.slice(-1)[0]?.latitude || 13.0827;
  const lon = activeTelemetry?.gps?.longitude || currentRoute?.actualTrack?.slice(-1)[0]?.longitude || 80.2707;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Logistics Intelligence Center
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            GPS Fleet Tracking, Waypoint Monitoring & Delay/Deviation Engine
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Shipment Route Switcher */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold shadow-xs">
            <span className="text-slate-500">Route:</span>
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="bg-slate-50 text-blue-600 font-extrabold px-2 py-1 rounded-lg outline-none cursor-pointer border border-slate-200"
            >
              {routes.map((r) => (
                <option key={r.routeId} value={r.routeId}>
                  {r.shipmentId} ({r.name})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 shadow-xs">
            <span>Node:</span>
            <span className="font-mono font-black text-blue-600">{currentRoute?.nodeId || selectedNodeId}</span>
            <span className="text-slate-300">|</span>
            <span className={isLiveMode ? "text-emerald-600 font-extrabold" : "text-amber-600 font-extrabold"}>
              {isLiveMode ? "📡 HARDWARE" : "🛰️ SIMULATED"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Map & Route Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Supply Chain Map */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="font-black text-slate-900 text-xl tracking-tight">
                  Real-Time GPS Route Map
                </h3>
                <p className="text-xs text-slate-500">
                  Comparing Planned Route (Dashed) vs Actual GPS Track (Solid)
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wide border ${
                  routeCondition === "OFF_ROUTE"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : routeCondition === "ROUTE_DEVIATION"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                  {routeCondition === "OFF_ROUTE" ? "🚨 OFF ROUTE" : routeCondition === "ROUTE_DEVIATION" ? "⚠️ ROUTE DEVIATION" : "✓ ON ROUTE"}
                </span>
              </div>
            </div>

            {/* Map Container */}
            <SupplyChainMap route={currentRoute} activeNodeId={selectedNodeId} />
          </div>

          {/* Interactive Expo Demo / Route Replay Panel */}
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-5 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-500/20 text-blue-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border border-blue-500/40">
                  EXPO DEMO MODE
                </span>
                <h4 className="font-extrabold text-sm text-white">
                  Interactive Route Replay Stream
                </h4>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Simulate transit progression, traffic stops, route deviation, and recovery for live demonstrations.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleNextReplayStep}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>▶ Step Replay</span>
                <span className="bg-blue-950 px-2 py-0.5 rounded-lg text-[10px] font-mono">#{replayStep}/10</span>
              </button>

              <button
                onClick={handleResetReplay}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-700 transition cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Route Progress & Delay Panel */}
        <div className="space-y-6">
          {/* Transit Progress Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="font-black text-slate-900 text-lg border-b pb-3 border-slate-100">
              Shipment Progress & ETA
            </h3>

            <div>
              <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                <span className="text-slate-600">Route Completion</span>
                <span className="text-blue-600 font-black text-sm font-mono">{actualRoute.progressPercent ?? 0}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${actualRoute.progressPercent ?? 0}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Distance Traveled</p>
                <p className="font-black text-slate-900 text-lg mt-0.5">
                  {actualRoute.distanceKm ?? 0} <span className="text-xs text-slate-500 font-normal">/ {currentRoute?.plannedRoute?.distanceKm ?? 0} km</span>
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Expected Arrival</p>
                <p className="font-black text-emerald-600 text-sm mt-1 font-mono">
                  {currentRoute?.plannedRoute?.expectedArrivalTime
                    ? new Date(currentRoute.plannedRoute.expectedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : "08:30 AM"}
                </p>
              </div>
            </div>

            {/* Delay Card */}
            <div className={`p-4 rounded-2xl border ${
              actualRoute.delayStatus === "DELAYED"
                ? "bg-rose-50 border-rose-200 text-rose-900"
                : actualRoute.delayStatus === "AT_RISK"
                ? "bg-amber-50 border-amber-200 text-amber-900"
                : "bg-emerald-50 border-emerald-200 text-emerald-900"
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Delay Status</span>
                <span className="font-black text-sm font-mono">
                  {actualRoute.delayMinutes > 0 ? `+${actualRoute.delayMinutes} Min Delay` : "On Schedule"}
                </span>
              </div>

              <p className="text-xs mt-1 leading-relaxed opacity-90">
                <strong>Primary Reason:</strong> {actualRoute.delayReason || "Proceeding according to schedule."}
              </p>
            </div>
          </div>

          {/* Route Deviation Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="font-black text-slate-900 text-lg border-b pb-3 border-slate-100">
              Route Deviation Metrics
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Current Deviation</p>
                <p className="font-black text-slate-900 text-lg mt-0.5 font-mono">
                  {actualRoute.currentDeviationMeters ?? 0} <span className="text-xs text-slate-500 font-normal">m</span>
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Max Deviation</p>
                <p className="font-black text-slate-900 text-lg mt-0.5 font-mono">
                  {actualRoute.maxDeviationMeters ?? 0} <span className="text-xs text-slate-500 font-normal">m</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-slate-600 font-bold">Off-Route Events Logged:</span>
              <span className="font-black text-amber-600 font-mono">{actualRoute.deviationEventCount ?? 0} Events</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Node ID</p>
          <p className="text-2xl font-black text-blue-600 font-mono mt-1">
            {currentRoute?.nodeId || selectedNodeId}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Monitored Cold Storage Unit</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Live GPS Location</p>
          <p className="text-base font-black text-slate-900 font-mono mt-1">
            {lat.toFixed(4)}, {lon.toFixed(4)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Accuracy ±{gpsQuality.averageAccuracyMeters || 4}m</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Cargo Temperature</p>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1">{liveTemp}</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">✓ Cold Chain Compliant</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Cargo Humidity</p>
          <p className="text-2xl font-black text-blue-600 font-mono mt-1">{liveHum}</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">✓ Optimal Range</p>
        </div>
      </div>

      {/* Route Waypoints & Event Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Planned Waypoints Sequence */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <h3 className="font-black text-slate-900 text-lg mb-4">
            Planned Route Waypoints ({waypoints.length})
          </h3>

          <div className="space-y-4 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {waypoints.map((wp, idx) => (
              <div key={idx} className="flex items-start gap-4 relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-2xs border ${
                  wp.status === "PASSED"
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}>
                  {wp.sequence || idx + 1}
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex-1 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{wp.name}</h4>
                    <p className="text-xs text-slate-500 font-mono">
                      {wp.latitude.toFixed(4)}, {wp.longitude.toFixed(4)}
                    </p>
                  </div>

                  <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                    wp.status === "PASSED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}>
                    {wp.status || "PENDING"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Route Event Timeline */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <h3 className="font-black text-slate-900 text-lg mb-4">
            Route Event Timeline ({events.length})
          </h3>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {events.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No events recorded yet.</p>
            ) : (
              events.map((evt, idx) => (
                <div
                  key={evt.id || idx}
                  className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                    evt.severity === "HIGH"
                      ? "bg-rose-50 border-rose-200 text-rose-900"
                      : evt.severity === "WARNING"
                      ? "bg-amber-50 border-amber-200 text-amber-900"
                      : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="uppercase text-[10px] tracking-wider bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                      {evt.eventType}
                    </span>
                    <span className="font-mono text-[11px] opacity-80">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="font-extrabold text-sm text-slate-900">{evt.description}</p>
                  {evt.durationMinutes && (
                    <p className="text-[11px] font-mono text-slate-600">Duration: {evt.durationMinutes} minutes</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Logistics;