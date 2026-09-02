import SensorCard from "../SensorCard/SensorCard";
import { useMonitoringBatch } from "../../context/MonitoringBatchContext";

function SensorGrid() {
  const { activeBatch, liveSensors } = useMonitoringBatch();

  if (!activeBatch && !liveSensors) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-5 text-slate-500">
        No batch / live sensor data available yet.
      </div>
    );
  }

  const latestSensors = activeBatch?.latestSensors || {};

  const temperature =
    liveSensors?.temperature ?? latestSensors.temperature ?? "--";
  const humidity =
    liveSensors?.humidity ?? latestSensors.humidity ?? "--";
  const voc =
    liveSensors?.voc ?? latestSensors.mq135 ?? "--";
  const co2 =
    liveSensors?.co2 ?? "--";
  const ethylene =
    liveSensors?.ethylene ?? "--";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      <SensorCard title="Temperature" value={`${temperature}°C`} />
      <SensorCard title="Humidity" value={`${humidity}%`} />
      <SensorCard title="VOC / MQ135" value={voc} />
      <SensorCard title="CO₂" value={co2} />
      <SensorCard title="Ethylene" value={ethylene} />
      <SensorCard
        title="Storage Status"
        value={latestSensors.storageCondition || "--"}
      />
    </div>
  );
}

export default SensorGrid;