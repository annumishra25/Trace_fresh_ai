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
    <div className="glass-card border border-slate-800/80 rounded-3xl p-6 bg-slate-900/80 backdrop-blur-xl shadow-2xl relative overflow-hidden space-y-4">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-80" />

      <h2 className="text-xl font-bold text-slate-100 tracking-tight">
        System Health Diagnostics
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {systems.map((item) => (
          <div
            key={item}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80"
          >
            <span className="text-xs font-semibold text-slate-200">{item}</span>

            <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Operational
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SystemHealth;