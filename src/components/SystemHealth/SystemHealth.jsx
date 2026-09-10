function SystemHealth() {
  const systems = [
    "AI Engine",
    "Camera",
    "Sensors",
    "4G LTE",
    "GPS",
    "Cloud Sync"
  ];

  return (
    <div className="bg-white border border-[#DDE4DF] rounded-2xl p-6 shadow-xs space-y-4 relative overflow-hidden">
      <h2 className="text-lg font-extrabold text-[#111715] tracking-tight">
        System Health Diagnostics
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {systems.map((item) => (
          <div
            key={item}
            className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAFBF8] border border-[#DDE4DF]"
          >
            <span className="text-xs font-semibold text-[#111715]">{item}</span>

            <span className="text-xs font-bold text-[#064C3B] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#064C3B]" /> Operational
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SystemHealth;