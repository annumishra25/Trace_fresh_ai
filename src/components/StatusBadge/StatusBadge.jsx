function StatusBadge({ status, className = "" }) {
  const normalized = String(status || "UNKNOWN").toUpperCase();

  const colors = {
    ONLINE: "bg-emerald-50 text-emerald-800 border-emerald-200",
    HEALTHY: "bg-emerald-50 text-emerald-800 border-emerald-200",
    OPTIMAL: "bg-emerald-50 text-emerald-800 border-emerald-200",
    ACTIVE: "bg-blue-50 text-blue-800 border-blue-200",
    WARNING: "bg-amber-50 text-amber-800 border-amber-200",
    CRITICAL: "bg-rose-50 text-rose-800 border-rose-200",
    ERROR: "bg-rose-50 text-rose-800 border-rose-200",
    OFFLINE: "bg-slate-100 text-slate-700 border-slate-200",
    CALIBRATING: "bg-purple-50 text-purple-800 border-purple-200",
    PENDING: "bg-sky-50 text-sky-800 border-sky-200"
  };

  const badgeStyle = colors[normalized] || colors.ONLINE;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wider uppercase border ${badgeStyle} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {status}
    </span>
  );
}

export default StatusBadge;