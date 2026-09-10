function MetricCard({
  title,
  value,
  unit,
  trend,
  subtitle
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#DDE4DF] relative overflow-hidden transition-all hover:border-[#C3E9D5]">
      <h3 className="text-[#56635D] text-[11px] font-mono font-bold uppercase tracking-wider">
        {title}
      </h3>

      <div className="flex items-baseline gap-1.5 mt-2">
        <span className="text-3xl sm:text-4xl font-extrabold text-[#111715] tracking-tight font-mono">
          {value}
        </span>

        {unit && (
          <span className="text-[#56635D] text-sm font-semibold font-mono">
            {unit}
          </span>
        )}
      </div>

      {(trend || subtitle) && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#56635D] font-medium">
          {trend && <span className="text-[#064C3B] font-bold bg-[#E4F5EC] px-1.5 py-0.5 rounded text-[10px]">{trend}</span>}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}

export default MetricCard;
