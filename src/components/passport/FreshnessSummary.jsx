const SummaryCard = ({
  title,
  value,
  subtitle,
  colorClass = "text-[#111715]",
  accentClass = "from-[#064C3B] to-[#042E25]"
}) => {
  return (
    <div className="bg-white rounded-2xl border border-[#DDE4DF] shadow-xs p-6 relative overflow-hidden">
      <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${accentClass}`} />
      <p className="text-[#56635D] text-xs font-extrabold uppercase tracking-wider">{title}</p>
      <p className={`text-3xl md:text-4xl font-extrabold mt-2 ${colorClass}`}>
        {value}
      </p>
      {subtitle && <p className="text-[#56635D] text-xs font-semibold mt-2">{subtitle}</p>}
    </div>
  );
};

const FreshnessSummary = ({ assessment }) => {
  const riskColor =
    assessment.riskLevel === "GOOD"
      ? "text-[#064C3B]"
      : assessment.riskLevel === "MONITOR"
      ? "text-[#D97706]"
      : "text-[#DC2626]";

  const riskAccent =
    assessment.riskLevel === "GOOD"
      ? "from-[#064C3B] to-[#0B6B52]"
      : assessment.riskLevel === "MONITOR"
      ? "from-[#D97706] to-[#B45309]"
      : "from-[#DC2626] to-[#B91C1C]";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SummaryCard
        title="Health Score"
        value={assessment.freshnessScore.toFixed(2)}
        subtitle="AI-derived overall freshness and quality score"
        colorClass="text-[#064C3B]"
        accentClass="from-[#064C3B] to-[#0B6B52]"
      />

      <SummaryCard
        title="Shelf Life"
        value={`${assessment.shelfLifeDays} Days`}
        subtitle="Estimated remaining shelf life under current conditions"
        colorClass="text-[#111715]"
        accentClass="from-[#111715] to-[#064C3B]"
      />

      <SummaryCard
        title="Spoilage Risk"
        value={`${assessment.spoilageRisk.toFixed(2)}%`}
        subtitle="Estimated deterioration risk based on current signals"
        colorClass="text-[#D97706]"
        accentClass="from-[#D97706] to-[#B45309]"
      />

      <SummaryCard
        title="Risk Level"
        value={assessment.riskLevel}
        subtitle="Current operational quality status for this batch"
        colorClass={riskColor}
        accentClass={riskAccent}
      />
    </div>
  );
};

export default FreshnessSummary;