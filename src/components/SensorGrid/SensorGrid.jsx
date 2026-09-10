import SensorCard from "../SensorCard/SensorCard";
import { useMonitoringBatch } from "../../context/MonitoringBatchContext";
import { useTelemetry } from "../../context/TelemetryContext";

function SensorGrid() {
  const { activeBatch, liveSensors } = useMonitoringBatch();
  const { activeTelemetry, selectedNodeId } = useTelemetry();

  const sensors = activeTelemetry?.sensors || {};
  const source = (activeTelemetry?.source || "simulator").toUpperCase();
  const latestSensors = activeBatch?.latestSensors || {};

  const tempVal = sensors.temperature?.value ?? liveSensors?.temperature ?? latestSensors.temperature ?? 5.5;
  const humVal = sensors.humidity?.value ?? liveSensors?.humidity ?? latestSensors.humidity ?? 71.0;
  const co2Val = sensors.co2?.value ?? liveSensors?.co2 ?? 600.0;
  const vocVal = sensors.voc?.value ?? liveSensors?.voc ?? 1.5;
  const gasVal = sensors.gas?.value ?? liveSensors?.ethylene ?? 0.42;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-slate-500 font-medium px-1">
        <span>Active Telemetry Grid ({selectedNodeId})</span>
        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
          Source: {source} | Sync: Active
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <SensorCard
          title="Temperature"
          value={typeof tempVal === "number" ? tempVal.toFixed(1) : tempVal}
          unit="°C"
          status={sensors.temperature?.status || "OK"}
          source={source}
        />
        <SensorCard
          title="Humidity"
          value={typeof humVal === "number" ? humVal.toFixed(1) : humVal}
          unit="%"
          status={sensors.humidity?.status || "OK"}
          source={source}
        />
        <SensorCard
          title="CO₂ Level"
          value={typeof co2Val === "number" ? co2Val.toFixed(0) : co2Val}
          unit="ppm"
          status={sensors.co2?.status || "OK"}
          source={source}
        />
        <SensorCard
          title="VOC Concentration"
          value={typeof vocVal === "number" ? vocVal.toFixed(2) : vocVal}
          unit="ppm"
          status={sensors.voc?.status || "OK"}
          source={source}
        />
        <SensorCard
          title="Spoilage / Combustible Gas"
          value={typeof gasVal === "number" ? gasVal.toFixed(2) : gasVal}
          unit="ppm"
          status={sensors.gas?.status || "OK"}
          source={source}
        />
      </div>
    </div>
  );
}

export default SensorGrid;