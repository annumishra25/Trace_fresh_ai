import { Activity, TrendingUp, TrendingDown } from "lucide-react";

function MetricCard({
  title,
  value,
  unit,
  trend,
  subtitle,
  icon: Icon = Activity,
  color = "blue",
  valueColor
}) {
  const isPositiveTrend = trend && (trend.includes("↑") || trend.includes("+"));
  const isNegativeTrend = trend && (trend.includes("↓") || trend.includes("-"));

  const colorStyles = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    rose: "bg-rose-50 text-rose-600 border-rose-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    violet: "bg-violet-50 text-violet-600 border-violet-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200"
  };

  const iconColorStyle = colorStyles[color] || colorStyles.blue;

  const valueTextColor = valueColor
    ? valueColor
    : color === "emerald"
    ? "text-emerald-600"
    : color === "amber"
    ? "text-amber-600"
    : color === "rose"
    ? "text-rose-600"
    : color === "violet" || color === "purple"
    ? "text-purple-600"
    : "text-slate-900";

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 group">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
          {title}
        </h3>
        <div className={`p-2.5 rounded-xl border ${iconColorStyle} transition-transform group-hover:scale-105`}>
          <Icon size={18} />
        </div>
      </div>

      <div className="flex items-baseline gap-1.5 mt-3">
        <span className={`text-3xl sm:text-4xl font-black tracking-tight ${valueTextColor}`}>
          {value}
        </span>

        {unit && (
          <span className="text-slate-500 text-sm font-semibold font-mono">
            {unit}
          </span>
        )}
      </div>

      {(trend || subtitle) && (
        <div className="mt-3 flex items-center gap-2 text-xs font-medium">
          {trend && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${
                isPositiveTrend
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : isNegativeTrend
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              {isPositiveTrend ? <TrendingUp size={11} /> : isNegativeTrend ? <TrendingDown size={11} /> : null}
              {trend}
            </span>
          )}
          {subtitle && <span className="text-slate-500 text-[11px]">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}

export default MetricCard;


