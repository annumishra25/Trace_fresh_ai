import KPICards from "../components/KPICards/KPICards";
import FruitCard from "../components/FruitCard/FruitCard";
import PredictionCard from "../components/PredictionCard/PredictionCard";
import SensorGrid from "../components/SensorGrid/SensorGrid";
import StatusCard from "../components/StatusCard/StatusCard";
import ExplainabilityCard from "../components/ExplainabilityCard/ExplainabilityCard";
import DigitalTwin from "../components/DigitalTwin/DigitalTwin";
import InspectionInfo from "../components/InspectionInfo/InspectionInfo";
import BatchScanControl from "../components/monitoring/BatchScanControl";
import NodeComparisonTable from "../components/monitoring/NodeComparisonTable";
import DeviceHealthCard from "../components/DeviceHealthCard/DeviceHealthCard";
import EnvironmentalExposureCard from "../components/monitoring/EnvironmentalExposureCard";
import VisionInspectionPanel from "../components/monitoring/VisionInspectionPanel";
import FusionDecisionCard from "../components/monitoring/FusionDecisionCard";
import HardwareSensorControl from "../components/HardwareSensorControl/HardwareSensorControl";
import SensorOutputGraph from "../components/SensorOutputGraph/SensorOutputGraph";
import { MonitoringBatchProvider } from "../context/MonitoringBatchContext";
import { useTelemetry } from "../context/TelemetryContext";

function MonitoringHeader() {
  const {
    nodes,
    selectedNodeId,
    setSelectedNodeId,
    activeNode,
    connectionStatus,
    lastUpdated,
    isLiveMode,
    toggleMode
  } = useTelemetry();

  const getStatusBadge = (status) => {
    switch (status) {
      case "ONLINE":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-[#E4F5EC] text-[#064C3B] border border-[#C3E9D5]">● LIVE ONLINE</span>;
      case "SIMULATED":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-[#FAFBF8] text-[#064C3B] border border-[#DDE4DF]">● SIMULATED</span>;
      case "STALE":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">● STALE</span>;
      case "OFFLINE":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]">● OFFLINE</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-[#F4F7F4] text-[#111715] border border-[#DDE4DF]">{status}</span>;
    }
  };

  const getTimeAgo = () => {
    if (!lastUpdated) return "Never";
    const seconds = Math.floor((new Date() - new Date(lastUpdated)) / 1000);
    if (seconds < 5) return "Just now";
    return `${seconds} sec ago`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#DDE4DF] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111715]">
            Multi-Node Monitoring Console
          </h1>
          {getStatusBadge(activeNode.status || connectionStatus)}
        </div>
        <p className="text-[#111715] text-xs mt-1.5 font-semibold">
          Active Monitoring Target: <span className="font-extrabold text-[#064C3B]">{selectedNodeId}</span> — Telemetry Heartbeat: <span className="font-extrabold text-[#064C3B]">{getTimeAgo()}</span>
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap relative z-10">
        {/* Mode Switcher Segmented Control */}
        <div className="flex items-center bg-[#FAFBF8] p-1 rounded-xl border border-[#DDE4DF]">
          <button
            onClick={() => { if (!isLiveMode) toggleMode(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              isLiveMode
                ? "bg-[#064C3B] text-white shadow-xs"
                : "text-[#111715] hover:text-[#064C3B]"
            }`}
          >
            📡 ONLINE MODE
          </button>
          <button
            onClick={() => { if (isLiveMode) toggleMode(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              !isLiveMode
                ? "bg-[#064C3B] text-white shadow-xs"
                : "text-[#111715] hover:text-[#064C3B]"
            }`}
          >
            🎛️ DEMO MODE
          </button>
        </div>

        {/* Node Target Switcher */}
        <div className="flex items-center bg-[#FAFBF8] p-1 rounded-xl border border-[#DDE4DF]">
          <button
            onClick={() => setSelectedNodeId("TF-NODE-01")}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              selectedNodeId === "TF-NODE-01"
                ? "bg-[#064C3B] text-white shadow-xs"
                : "text-[#111715] hover:text-[#064C3B]"
            }`}
          >
            TF-NODE-01
          </button>
          <button
            onClick={() => setSelectedNodeId("TF-NODE-02")}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              selectedNodeId === "TF-NODE-02"
                ? "bg-[#064C3B] text-white shadow-xs"
                : "text-[#111715] hover:text-[#064C3B]"
            }`}
          >
            TF-NODE-02
          </button>
        </div>
      </div>
    </div>
  );
}


function Monitoring() {
  return (
    <div className="space-y-6">
      <MonitoringHeader />

      {/* Dual Device Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DeviceHealthCard nodeId="TF-NODE-01" />
        <DeviceHealthCard nodeId="TF-NODE-02" />
      </div>

      {/* Hardware Model Connection & Manual Sensor Control */}
      <HardwareSensorControl />

      {/* Real-time Sensor Output Graph */}
      <SensorOutputGraph />

      <BatchScanControl />

      <KPICards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FruitCard />
        <PredictionCard />
      </div>

      <SensorGrid />

      {/* Step 5: Environmental Exposure & Sensor ML Engine Card */}
      <EnvironmentalExposureCard />

      {/* Step 6: Vision AI Inspection & Surface Anomaly Panel */}
      <VisionInspectionPanel />

      {/* Step 7: Multi-Modal Fusion Engine & Explainable Freshness Card */}
      <FusionDecisionCard />

      {/* Multi-Node Side-by-Side Diagnostics Comparison */}
      <NodeComparisonTable />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusCard />
        <ExplainabilityCard />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DigitalTwin />
        <InspectionInfo />
      </div>
    </div>
  );
}

export default Monitoring;