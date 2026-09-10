function SensorCard({ title, value, unit = "", status = "OK", source = null }) {
  const getStatusBadge = () => {
    switch (status) {
      case "OK":
        return <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold glow-emerald">OK</span>;
      case "MISSING":
        return <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-semibold">Not Connected</span>;
      case "ERROR":
        return <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold glow-rose">Sensor Error</span>;
      case "STALE":
        return <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">Stale</span>;
      case "CALIBRATING":
        return <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-bold">Calibrating</span>;
      default:
        return <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">{status}</span>;
    }
  };

  const getSourceBadge = () => {
    if (!source) return null;
    const isHw = String(source).toLowerCase() === "hardware";
    return (
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>Data Source</span>
        <span className={`font-mono font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
          isHw ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-950 text-slate-400 border border-slate-800"
        }`}>
          {isHw ? "📡 HARDWARE" : source}
        </span>
      </div>
    );
  };

  const formattedValue = (status === "MISSING" || status === "ERROR" || value === null || value === undefined) 
    ? (status === "MISSING" ? "Sensor Unavailable" : "Error") 
    : `${value} ${unit}`.trim();

  return (
    <div className="glass-card border border-slate-800/80 rounded-2xl p-5 bg-slate-900/80 backdrop-blur-xl shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all duration-200">
      <div className="flex items-center justify-between">
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{title}</h3>
        {getStatusBadge()}
      </div>

      <div className="mt-3">
        <p className={`text-2xl font-bold font-mono tracking-tight ${status === "MISSING" ? "text-slate-500 text-base" : "text-slate-100"}`}>
          {formattedValue}
        </p>
      </div>

      {getSourceBadge()}
    </div>
  );
}

export default SensorCard;