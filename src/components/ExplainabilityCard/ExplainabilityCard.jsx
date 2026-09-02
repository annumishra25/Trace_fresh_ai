import { useMonitoringBatch } from "../../context/MonitoringBatchContext";

function ExplainabilityCard() {
  const { activeBatch } = useMonitoringBatch();

  if (!activeBatch) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">AI Explanation</h2>
        <p className="text-slate-500">No explainability data available yet.</p>
      </div>
    );
  }

  const assessment = activeBatch.latestAssessment || {};
  const reasons = assessment.reasons || [];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-bold mb-2">AI Explanation</h2>

      <p className="text-sm text-slate-500 mb-4">
        Why TraceFresh assigned the current freshness status.
      </p>

      {assessment.qualityAdvisory && (
        <div className="mb-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">Quality Advisory</p>
          <p className="text-slate-800">{assessment.qualityAdvisory}</p>
        </div>
      )}

      <div className="space-y-3">
        {reasons.length > 0 ? (
          reasons.map((reason, index) => (
            <p key={index}>✓ {reason}</p>
          ))
        ) : (
          <p className="text-slate-500">No reason codes available.</p>
        )}
      </div>
    </div>
  );
}

export default ExplainabilityCard;