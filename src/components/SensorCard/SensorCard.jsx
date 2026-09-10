function SensorCard({ title, value, unit = "", status = "OK", source = null }) {
  const getStatusBadge = () => {
    switch (status) {
      case "OK":
        return <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#DDF2E8] text-[#063C2F] border border-[#16805F]/20 font-bold">OK</span>;
      case "MISSING":
        return <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#F1F4EE] text-[#4E5B55] border border-[#DCE4DE] font-semibold">Not Connected</span>;
      case "ERROR":
        return <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#FEE2E2] text-[#991B1B] border border-[#DC2626]/20 font-bold">Sensor Error</span>;
      case "STALE":
        return <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#FEF3C7] text-[#92400E] border border-[#D97706]/20 font-bold">Stale</span>;
      case "CALIBRATING":
        return <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#E8EEE7] text-[#0B604A] border border-[#0B604A]/20 font-bold">Calibrating</span>;
      default:
        return <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#F1F4EE] text-[#4E5B55] font-semibold">{status}</span>;
    }
  };

  const getSourceBadge = () => {
    if (!source) return null;
    const isHw = String(source).toLowerCase() === "hardware";
    return (
      <div className="mt-3 pt-2.5 border-t border-[#E8EEE7] flex items-center justify-between text-xs text-[#78837D]">
        <span>Data Source</span>
        <span className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
          isHw ? "bg-[#DDF2E8] text-[#063C2F] border border-[#16805F]/20" : "bg-[#F1F4EE] text-[#4E5B55] border border-[#DCE4DE]"
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
    <div className="bg-white border border-[#DCE4DE] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <h3 className="text-[#78837D] text-xs font-semibold uppercase tracking-wider">{title}</h3>
        {getStatusBadge()}
      </div>

      <div className="mt-3">
        <p className={`text-2xl font-extrabold tracking-tight ${status === "MISSING" ? "text-[#78837D] text-base" : "text-[#101513]"}`}>
          {formattedValue}
        </p>
      </div>

      {getSourceBadge()}
    </div>
  );
}

export default SensorCard;