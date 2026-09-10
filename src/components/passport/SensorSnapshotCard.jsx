import PassportSectionHeader from "./PassportSectionHeader";

const SensorCard = ({ label, value, colorClass = "text-[#111715]" }) => {
  return (
    <div className="bg-[#FAFBF8] border border-[#DDE4DF] rounded-xl p-4">
      <p className="text-[#56635D] text-xs font-extrabold uppercase tracking-wider">{label}</p>
      <p className={`text-2xl md:text-3xl font-extrabold mt-1 ${colorClass}`}>
        {value}
      </p>
    </div>
  );
};

const SensorSnapshotCard = ({ sensors }) => {
  return (
    <div className="bg-white rounded-2xl border border-[#DDE4DF] shadow-xs p-6">
      <PassportSectionHeader
        title="Storage Condition Snapshot"
        subtitle="Environmental conditions captured during the latest quality assessment"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <SensorCard
          label="Temperature"
          value={`${sensors.temperature}°C`}
          colorClass="text-[#D97706]"
        />
        <SensorCard
          label="Humidity"
          value={`${sensors.humidity}%`}
          colorClass="text-[#064C3B]"
        />
        <SensorCard
          label="Gas / MQ135"
          value={sensors.mq135}
          colorClass="text-[#111715]"
        />
        <SensorCard
          label="Storage Status"
          value={sensors.storageCondition}
          colorClass="text-[#064C3B]"
        />
      </div>
    </div>
  );
};

export default SensorSnapshotCard;