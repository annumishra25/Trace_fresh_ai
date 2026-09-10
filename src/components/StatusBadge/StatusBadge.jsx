function StatusBadge({ status }) {

  const colors = {
    ONLINE: "bg-[#DDF2E8] dark:bg-[#123B2F] text-[#063C2F] dark:text-[#36B88A] border border-[#16805F]/30",
    WARNING: "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/40",
    OFFLINE: "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300/40",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${colors[status] || colors.ONLINE}`}
    >
      ● {status}
    </span>
  );
}

export default StatusBadge;