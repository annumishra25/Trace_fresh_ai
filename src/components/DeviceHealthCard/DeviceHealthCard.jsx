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
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#DDF2E8] text-[#063C2F] border border-[#16805F]/20">● ONLINE</span>;
      case "SIMULATED":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#E8EEE7] text-[#0B604A] border border-[#0B604A]/20">● SIMULATED</span>;
      case "STALE":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#FEF3C7] text-[#92400E] border border-[#D97706]/20">● STALE</span>;
      case "ERROR":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#FEE2E2] text-[#991B1B] border border-[#DC2626]/20">● ERROR</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#F1F4EE] text-[#4E5B55] border border-[#DCE4DE]">● OFFLINE</span>;
    }
  };

  return (
    <div
      className={`bg-white dark:bg-[#0D2820] rounded-2xl p-5 border shadow-sm transition-all duration-300 relative overflow-hidden ${
        isSelected ? "ring-2 ring-[#063C2F] dark:ring-[#36B88A] border-[#063C2F] dark:border-[#36B88A]" : "border-[#DCE4DE] dark:border-[#23483D] hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-[#F1F4EE] dark:bg-[#12342A] text-[#063C2F] dark:text-[#36B88A] px-2.5 py-1 rounded-md border border-[#DCE4DE] dark:border-[#23483D]">
              {node.nodeId}
            </span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
              isHardware ? "bg-[#DDF2E8] text-[#063C2F] border-[#16805F]/20" : "bg-[#F1F4EE] dark:bg-[#12342A] text-[#4E5B55] dark:text-[#AEBBB4] border-[#DCE4DE] dark:border-[#23483D]"
            }`}>
              {isHardware ? "📡 HARDWARE" : "SIMULATED"}
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-[#101513] dark:text-[#F4F7F2] mt-2.5">
            {node.name || `TraceFresh Node ${nodeId}`}
          </h3>
        </div>

        <div className="flex flex-col items-end gap-2">
          {getStatusBadge(node.status)}
          <button
            onClick={() => setSelectedNodeId(nodeId)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isSelected ? "bg-[#063C2F] text-white dark:bg-[#36B88A] dark:text-[#042E25] shadow-sm" : "bg-[#F1F4EE] dark:bg-[#12342A] text-[#4E5B55] dark:text-[#AEBBB4] hover:text-[#101513] dark:hover:text-white"
            }`}
          >
            {isSelected ? "✓ Active Node" : "Select Node"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 relative z-10">
        <div className="bg-[#F7F8F3] dark:bg-[#12342A] p-3 rounded-xl border border-[#DCE4DE] dark:border-[#23483D]">
          <p className="text-xs font-medium text-[#78837D] dark:text-[#AEBBB4]">Last Sync</p>
          <p className="text-sm font-bold text-[#101513] dark:text-[#F4F7F2] mt-1">{lastSeen}</p>
        </div>

        <div className="bg-[#F7F8F3] dark:bg-[#12342A] p-3 rounded-xl border border-[#DCE4DE] dark:border-[#23483D]">
          <p className="text-xs font-medium text-[#78837D] dark:text-[#AEBBB4]">Firmware</p>
          <p className="text-sm font-bold text-[#101513] dark:text-[#F4F7F2] mt-1">{firmware}</p>
        </div>

        <div className="bg-[#F7F8F3] dark:bg-[#12342A] p-3 rounded-xl border border-[#DCE4DE] dark:border-[#23483D]">
          <p className="text-xs font-medium text-[#78837D] dark:text-[#AEBBB4]">Wi-Fi RSSI</p>
          <p className="text-sm font-bold text-[#063C2F] dark:text-[#36B88A] mt-1">
            {signal != null ? `${signal} dBm` : "N/A"}
          </p>
        </div>

        <div className="bg-[#F7F8F3] dark:bg-[#12342A] p-3 rounded-xl border border-[#DCE4DE] dark:border-[#23483D]">
          <p className="text-xs font-medium text-[#78837D] dark:text-[#AEBBB4]">Battery</p>
          <p className="text-sm font-bold text-[#063C2F] dark:text-[#36B88A] mt-1">
            {battery != null ? `${battery}%` : "N/A"}
          </p>
        </div>
      </div>

      <div className="border-t border-[#DCE4DE] dark:border-[#23483D] pt-3 flex items-center justify-between text-xs relative z-10">
        <div className="flex items-center gap-2 font-medium">
          <span className="text-[#78837D] dark:text-[#AEBBB4]">Sensors:</span>
          <span className="font-bold text-[#063C2F] dark:text-[#36B88A]">{healthyCount} / {totalSensors} Healthy</span>
        </div>
        <div>
          <span className="text-[#78837D] dark:text-[#AEBBB4]">Shipment: </span>
          <span className="font-semibold text-[#101513] dark:text-[#F4F7F2]">{node.assignedShipmentId || "SHIP-APL-110"}</span>
        </div>
      </div>
    </div>
  );
}

export default DeviceHealthCard;