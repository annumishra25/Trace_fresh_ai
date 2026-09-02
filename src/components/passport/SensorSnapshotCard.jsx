import PassportSectionHeader from "./PassportSectionHeader";

const SensorCard = ({ label, value, colorClass = "text-slate-900" }) => {
  return (
    <div className="bg-slate-50 rounded-2xl p-4">
      <p className="text-slate-500 text-sm">{label}</p>
      <p className={`text-2xl md:text-3xl font-bold mt-2 ${colorClass}`}>
        {value}
      </p>
    </div>
  );
};

const SensorSnapshotCard = ({ sensors }) => {
  return (
    <div className="bg-white rounded-3xl shadow-md p-6">
      <PassportSectionHeader
        title="Storage Condition Snapshot"
        subtitle="Environmental conditions captured during the latest quality assessment"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <SensorCard
          label="Temperature"
          value={`${sensors.temperature}°C`}
          colorClass="text-red-500"
        />
        <SensorCard
          label="Humidity"
          value={`${sensors.humidity}%`}
          colorClass="text-sky-600"
        />
        <SensorCard
          label="Gas / MQ135"
          value={sensors.mq135}
          colorClass="text-amber-600"
        />
        <SensorCard
          label="Storage Status"
          value={sensors.storageCondition}
          colorClass="text-emerald-600"
        />
      </div>
    </div>
  );
};

export default SensorSnapshotCard;