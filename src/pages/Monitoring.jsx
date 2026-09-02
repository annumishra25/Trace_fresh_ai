import KPICards from "../components/KPICards/KPICards";
import FruitCard from "../components/FruitCard/FruitCard";
import PredictionCard from "../components/PredictionCard/PredictionCard";
import SensorGrid from "../components/SensorGrid/SensorGrid";
import StatusCard from "../components/StatusCard/StatusCard";
import ExplainabilityCard from "../components/ExplainabilityCard/ExplainabilityCard";
import DigitalTwin from "../components/DigitalTwin/DigitalTwin";
import InspectionInfo from "../components/InspectionInfo/InspectionInfo";
import BatchScanControl from "../components/monitoring/BatchScanControl";
import { MonitoringBatchProvider } from "../context/MonitoringBatchContext";

function Monitoring() {
  return (
    <MonitoringBatchProvider>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">
          Live Monitoring Console
        </h1>

        <BatchScanControl />

        <KPICards />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FruitCard />
          <PredictionCard />
        </div>

        <SensorGrid />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusCard />
          <ExplainabilityCard />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <DigitalTwin />
          <InspectionInfo />
        </div>
      </div>
    </MonitoringBatchProvider>
  );
}

export default Monitoring;