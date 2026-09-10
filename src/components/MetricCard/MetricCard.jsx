function MetricCard({
  title,
  value,
  unit,
}) {
  return (
    <div className="glass-card glass-card-hover rounded-3xl p-6 shadow-2xl relative overflow-hidden bg-[#092a1f]/85 backdrop-blur-xl border border-emerald-800/50">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-300 opacity-90" />

      <h3 className="text-emerald-300/90 text-xs font-mono font-bold uppercase tracking-wider">
        {title}
      </h3>

      <div className="flex items-baseline gap-2 mt-3">
        <span className="text-4xl font-black text-white font-mono tracking-tight">
          {value}
        </span>

        {unit && (
          <span className="text-emerald-200 text-sm font-mono font-bold">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export default MetricCard;