function MetricCard({
  title,
  value,
  unit,
}) {
  return (
    <div className="glass-card glass-card-hover rounded-2xl p-6 shadow-xs relative overflow-hidden bg-white dark:bg-[#0D2820] border border-[#DCE4DE] dark:border-[#23483D]">
      <h3 className="text-[#78837D] dark:text-[#AEBBB4] text-xs font-mono font-bold uppercase tracking-wider">
        {title}
      </h3>

      <div className="flex items-baseline gap-2 mt-3">
        <span className="text-4xl font-extrabold text-[#101513] dark:text-[#F4F7F2] font-mono tracking-tight">
          {value}
        </span>

        {unit && (
          <span className="text-[#4E5B55] dark:text-[#AEBBB4] text-sm font-mono font-semibold">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export default MetricCard;