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
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 glow-emerald">● LIVE ONLINE</span>;
      case "SIMULATED":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-teal-500/20 text-teal-300 border border-teal-500/40 glow-mint">● SIMULATED</span>;
      case "STALE":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">● STALE</span>;
      case "OFFLINE":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-[#03140e] text-slate-300 border border-emerald-800/80">● OFFLINE</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-[#03140e] text-slate-200 border border-emerald-800/80">{status}</span>;
    }
  };

  const getTimeAgo = () => {
    if (!lastUpdated) return "Never";
    const seconds = Math.floor((new Date() - new Date(lastUpdated)) / 1000);
    if (seconds < 5) return "Just now";
    return `${seconds} sec ago`;
  };

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 shadow-2xl border border-emerald-800/80 border-t-2 border-t-emerald-400 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
      {/* Background Subtle Gradient Sparkle */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Multi-Node Monitoring Console</span>
          </h1>
          {getStatusBadge(activeNode.status || connectionStatus)}
        </div>
        <p className="text-slate-300 text-xs mt-1.5 font-sans">
          Active Monitoring Target: <span className="font-mono font-bold text-white">{selectedNodeId}</span> — Telemetry Heartbeat: <span className="font-mono text-emerald-400 font-bold">{getTimeAgo()}</span>
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap relative z-10">
        {/* Mode Switcher Segmented Control */}
        <div className="flex items-center bg-[#03140e] p-1.5 rounded-2xl border border-emerald-800/80 shadow-inner">
          <button
            onClick={() => { if (!isLiveMode) toggleMode(); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              isLiveMode
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 scale-[1.02]"
                : "text-slate-300 hover:text-white"
            }`}
          >
            📡 ONLINE MODE
          </button>
          <button
            onClick={() => { if (isLiveMode) toggleMode(); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              !isLiveMode
                ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/30 scale-[1.02]"
                : "text-slate-300 hover:text-white"
            }`}
          >
            🎛️ DEMO MODE (Sliders)
          </button>
        </div>

        {/* Node Target Switcher */}
        <div className="flex items-center bg-[#03140e] p-1.5 rounded-2xl border border-emerald-800/80 shadow-inner">
          <button
            onClick={() => setSelectedNodeId("TF-NODE-01")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              selectedNodeId === "TF-NODE-01"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-300 hover:text-white"
            }`}
          >
            TF-NODE-01
          </button>
          <button
            onClick={() => setSelectedNodeId("TF-NODE-02")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              selectedNodeId === "TF-NODE-02"
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                : "text-slate-300 hover:text-white"
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