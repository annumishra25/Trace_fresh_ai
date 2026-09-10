function MetricCard({
  title,
  value,
  unit,
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D1D5DB] relative overflow-hidden">
      <h3 className="text-[#063C2F] text-xs font-mono font-extrabold uppercase tracking-wider">
        {title}
      </h3>

      <div className="flex items-baseline gap-2 mt-3">
        <span className="text-4xl font-extrabold text-[#000000] font-mono tracking-tight">
          {value}
        </span>

        {unit && (
          <span className="text-[#000000] text-sm font-mono font-bold">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export default MetricCard;