import { useMonitoringBatch } from "../../context/MonitoringBatchContext";

function ExplainabilityCard() {
  const { activeBatch } = useMonitoringBatch();

  if (!activeBatch) {
    return (
      <div className="bg-white border border-[#DCE4DE] rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-extrabold text-[#101513] mb-2">AI Explanation</h2>
        <p className="text-xs text-[#4E5B55] font-medium">No explainability data available yet.</p>
      </div>
    );
  }

  const assessment = activeBatch.latestAssessment || {};
  const reasons = assessment.reasons || [];

  return (
    <div className="bg-white border border-[#DCE4DE] rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-extrabold text-[#101513] mb-1">AI Decision Explanation</h2>

      <p className="text-xs text-[#4E5B55] font-medium mb-4">
        Why TraceFresh AI assigned the current freshness classification.
      </p>

      {assessment.qualityAdvisory && (
        <div className="mb-4 p-4 rounded-xl bg-[#F7F8F3] border border-[#DCE4DE]">
          <p className="text-xs font-bold text-[#78837D] uppercase tracking-wider mb-1">Quality Advisory</p>
          <p className="text-sm font-semibold text-[#101513]">{assessment.qualityAdvisory}</p>
        </div>
      )}

      <div className="space-y-2 text-xs font-bold text-[#063C2F]">
        {reasons.length > 0 ? (
          reasons.map((reason, index) => (
            <p key={index} className="p-2 rounded-lg bg-[#DDF2E8] border border-[#16805F]/20">✓ {reason}</p>
          ))
        ) : (
          <p className="text-[#4E5B55] font-medium">No reason codes available.</p>
        )}
      </div>
    </div>
  );
}

export default ExplainabilityCard;