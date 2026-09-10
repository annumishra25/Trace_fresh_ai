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
    <div className="bg-white border border-[#DCE4DE] rounded-2xl p-6 shadow-sm space-y-4 relative overflow-hidden">
      <h2 className="text-xl font-extrabold text-[#101513] tracking-tight">
        System Health Diagnostics
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {systems.map((item) => (
          <div
            key={item}
            className="flex items-center justify-between p-3 rounded-xl bg-[#F7F8F3] border border-[#DCE4DE]"
          >
            <span className="text-xs font-semibold text-[#101513]">{item}</span>

            <span className="text-xs font-bold text-[#063C2F] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#16805F]" /> Operational
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SystemHealth;