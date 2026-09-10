import { useTelemetry } from "../../context/TelemetryContext";

function DeviceHealthCard({ nodeId = "TF-NODE-01" }) {
  const { nodes, latestTelemetryMap, selectedNodeId, setSelectedNodeId } = useTelemetry();

  const node = nodes.find((n) => n.nodeId === nodeId) || {
    nodeId,
    name: `Smart Node ${nodeId}`,
    status: "OFFLINE",
    firmwareVersion: "0.1.0"
  };

  const isSelected = selectedNodeId === nodeId;
  const latestTel = latestTelemetryMap[nodeId] || node.latestTelemetry || {};
  const isHardware = String(node.source || latestTel.source).toLowerCase() === "hardware";
  const battery = node.batteryPercent ?? latestTel.device?.batteryPercent ?? null;
  const signal = node.signalStrengthDbm ?? latestTel.device?.signalStrengthDbm ?? null;
  const firmware = node.firmwareVersion || latestTel.device?.firmwareVersion || "0.1.0";
  const lastSeen = node.lastSeen ? new Date(node.lastSeen).toLocaleTimeString() : "Never";

  // Calculate healthy sensor count
  const sensors = node.sensorAvailability || {};
  const sensorKeys = Object.keys(sensors);
  const healthyCount = sensorKeys.filter((k) => sensors[k] === "OK").length;
  const totalSensors = sensorKeys.length > 0 ? sensorKeys.length : 5;

  const getStatusBadge = (status) => {
    switch (status) {
      case "ONLINE":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 glow-emerald">● ONLINE</span>;
      case "SIMULATED":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-500/40 glow-blue">● SIMULATED</span>;
      case "STALE":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">● STALE</span>;
      case "ERROR":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 glow-rose">● ERROR</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-slate-800 text-slate-400 border border-slate-700">● OFFLINE</span>;
    }
  };

  return (
    <div
      className={`glass-card glass-card-hover rounded-3xl p-6 shadow-2xl transition-all duration-300 relative overflow-hidden ${
        isSelected ? "border-blue-500/80 ring-2 ring-blue-500/30 glow-blue" : "border-slate-800 hover:border-slate-700"
      }`}
    >
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700">
              {node.nodeId}
            </span>
            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
              isHardware ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-slate-800 text-slate-400 border-slate-700"
            }`}>
              {isHardware ? "📡 HARDWARE" : "SIMULATED"}
            </span>
          </div>
          <h3 className="text-xl font-black text-white mt-2.5">
            {node.name || `TraceFresh Node ${nodeId}`}
          </h3>
        </div>

        <div className="flex flex-col items-end gap-2">
          {getStatusBadge(node.status)}
          <button
            onClick={() => setSelectedNodeId(nodeId)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              isSelected ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105" : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
          >
            {isSelected ? "✓ Active Node" : "Select Node"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5 relative z-10">
        <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800/80">
          <p className="text-[11px] text-slate-400 font-mono">Last Sync</p>
          <p className="text-sm font-bold text-white mt-1 font-mono">{lastSeen}</p>
        </div>

        <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800/80">
          <p className="text-[11px] text-slate-400 font-mono">Firmware</p>
          <p className="text-sm font-bold text-white mt-1 font-mono">{firmware}</p>
        </div>

        <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800/80">
          <p className="text-[11px] text-slate-400 font-mono">Wi-Fi RSSI</p>
          <p className="text-sm font-bold text-cyan-400 mt-1 font-mono">
            {signal != null ? `${signal} dBm` : "N/A"}
          </p>
        </div>

        <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800/80">
          <p className="text-[11px] text-slate-400 font-mono">Battery</p>
          <p className="text-sm font-bold text-emerald-400 mt-1 font-mono">
            {battery != null ? `${battery}%` : "N/A"}
          </p>
        </div>
      </div>

      <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between text-xs text-slate-300 relative z-10">
        <div className="flex items-center gap-2 font-medium">
          <span className="text-slate-400 font-mono">Sensors:</span>
          <span className="font-bold text-emerald-400 font-mono">{healthyCount} / {totalSensors} Healthy</span>
        </div>
        <div>
          <span className="text-slate-400 font-mono">Assigned Shipment: </span>
          <span className="font-bold text-slate-100 font-mono">{node.assignedShipmentId || "SHIP-APL-110"}</span>
        </div>
      </div>
    </div>
  );
}

export default DeviceHealthCard;