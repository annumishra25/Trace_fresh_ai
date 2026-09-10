function AlertCenter() {
  return (
    <div className="glass-card border border-slate-800/80 rounded-3xl p-6 bg-slate-900/80 backdrop-blur-xl shadow-2xl relative overflow-hidden space-y-3">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 opacity-80" />
      <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center justify-between">
        <span>Alert Center</span>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 glow-rose">2 Active</span>
      </h2>

      <div className="space-y-2 text-xs">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-200 font-semibold">⚠️ Temp Excursion (TF-NODE-01)</span>
          <span className="font-mono text-amber-400 font-bold">29.5°C</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-200 font-semibold">⚠️ Ethylene Gas Spike (TF-NODE-02)</span>
          <span className="font-mono text-rose-400 font-bold">1.45 ppm</span>
        </div>
      </div>
    </div>
  );
}

export default AlertCenter;