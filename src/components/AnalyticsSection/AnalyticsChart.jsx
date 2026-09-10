import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

function AnalyticsChart({ title, data = [], dataKey, color = "#2563eb" }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-400 text-sm">No telemetry available</p>
      </div>
    );
  }

  const gradId = `grad_${dataKey}_${color.replace("#", "")}`;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100 hover:shadow-lg transition-all">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">Live Stream</span>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="time" stroke="#64748b" textAnchor="end" />
          <YAxis stroke="#64748b" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2.5}
            fillOpacity={1}
            fill={`url(#${gradId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AnalyticsChart;
