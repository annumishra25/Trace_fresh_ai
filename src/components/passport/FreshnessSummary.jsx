const SummaryCard = ({
  title,
  value,
  subtitle,
  colorClass = "text-slate-900",
  accentClass = "from-slate-500 to-slate-700"
}) => {
  return (
    <div className="bg-white rounded-3xl shadow-md p-6 relative overflow-hidden">
      <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${accentClass}`} />
      <p className="text-slate-500 text-base md:text-lg">{title}</p>
      <p className={`text-4xl md:text-5xl font-bold mt-4 ${colorClass}`}>
        {value}
      </p>
      {subtitle && <p className="text-slate-500 text-sm mt-3">{subtitle}</p>}
    </div>
  );
};

const FreshnessSummary = ({ assessment }) => {
  const riskColor =
    assessment.riskLevel === "GOOD"
      ? "text-green-600"
      : assessment.riskLevel === "MONITOR"
      ? "text-amber-500"
      : "text-red-500";

  const riskAccent =
    assessment.riskLevel === "GOOD"
      ? "from-green-500 to-emerald-600"
      : assessment.riskLevel === "MONITOR"
      ? "from-amber-400 to-orange-500"
      : "from-red-500 to-rose-600";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SummaryCard
        title="Health Score"
        value={assessment.freshnessScore.toFixed(2)}
        subtitle="AI-derived overall freshness and quality score"
        colorClass="text-green-600"
        accentClass="from-green-500 to-emerald-600"
      />

      <SummaryCard
        title="Shelf Life"
        value={`${assessment.shelfLifeDays} Days`}
        subtitle="Estimated remaining shelf life under current conditions"
        colorClass="text-blue-600"
        accentClass="from-blue-500 to-cyan-600"
      />

      <SummaryCard
        title="Spoilage Risk"
        value={`${assessment.spoilageRisk.toFixed(2)}%`}
        subtitle="Estimated deterioration risk based on current signals"
        colorClass="text-orange-500"
        accentClass="from-orange-400 to-red-500"
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