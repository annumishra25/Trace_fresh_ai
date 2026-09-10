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
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#E4F5EC] text-[#064C3B] border border-[#C3E9D5]">● ONLINE</span>;
      case "SIMULATED":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#FAFBF8] text-[#064C3B] border border-[#DDE4DF]">● SIMULATED</span>;
      case "STALE":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">● STALE</span>;
      case "ERROR":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]">● ERROR</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#F4F7F4] text-[#111715] border border-[#DDE4DF]">● OFFLINE</span>;
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl p-5 border shadow-xs transition-all duration-200 relative overflow-hidden ${
        isSelected ? "ring-2 ring-[#064C3B] border-[#064C3B]" : "border-[#DDE4DF] hover:border-[#C3E9D5]"
      }`}
    >
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold bg-[#FAFBF8] text-[#064C3B] px-2.5 py-1 rounded-md border border-[#DDE4DF]">
              {node.nodeId}
            </span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
              isHardware ? "bg-[#E4F5EC] text-[#064C3B] border-[#C3E9D5]" : "bg-[#FAFBF8] text-[#111715] border-[#DDE4DF]"
            }`}>
              {isHardware ? "📡 HARDWARE" : "SIMULATED"}
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-[#111715] mt-2.5">
            {node.name || `TraceFresh Node ${nodeId}`}
          </h3>
        </div>

        <div className="flex flex-col items-end gap-2">
          {getStatusBadge(node.status)}
          <button
            onClick={() => setSelectedNodeId(nodeId)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isSelected ? "bg-[#064C3B] text-white shadow-xs" : "bg-[#FAFBF8] text-[#111715] border border-[#DDE4DF] hover:bg-[#F4F7F4]"
            }`}
          >
            {isSelected ? "✓ Active Node" : "Select Node"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 relative z-10">
        <div className="bg-[#FAFBF8] p-3 rounded-xl border border-[#DDE4DF]">
          <p className="text-[10px] font-bold uppercase text-[#111715]">Last Sync</p>
          <p className="text-sm font-bold text-[#111715] mt-1">{lastSeen}</p>
        </div>

        <div className="bg-[#FAFBF8] p-3 rounded-xl border border-[#DDE4DF]">
          <p className="text-[10px] font-bold uppercase text-[#111715]">Firmware</p>
          <p className="text-sm font-bold text-[#111715] mt-1">{firmware}</p>
        </div>

        <div className="bg-[#FAFBF8] p-3 rounded-xl border border-[#DDE4DF]">
          <p className="text-[10px] font-bold uppercase text-[#111715]">Wi-Fi RSSI</p>
          <p className="text-sm font-bold text-[#064C3B] mt-1">
            {signal != null ? `${signal} dBm` : "N/A"}
          </p>
        </div>

        <div className="bg-[#FAFBF8] p-3 rounded-xl border border-[#DDE4DF]">
          <p className="text-[10px] font-bold uppercase text-[#111715]">Battery</p>
          <p className="text-sm font-bold text-[#064C3B] mt-1">
            {battery != null ? `${battery}%` : "N/A"}
          </p>
        </div>
      </div>

      <div className="border-t border-[#DDE4DF] pt-3 flex items-center justify-between text-xs relative z-10">
        <div className="flex items-center gap-2 font-medium">
          <span className="text-[#111715] font-bold">Sensors:</span>
          <span className="font-extrabold text-[#064C3B]">{healthyCount} / {totalSensors} Healthy</span>
        </div>
        <div>
          <span className="text-[#111715] font-semibold">Shipment: </span>
          <span className="font-extrabold text-[#111715]">{node.assignedShipmentId || "SHIP-APL-110"}</span>
        </div>
      </div>
    </div>
  );
}

export default DeviceHealthCard;