import { useMonitoringBatch } from "../../context/MonitoringBatchContext";

function StatusCard() {
  const { activeBatch } = useMonitoringBatch();

  if (!activeBatch) {
    return (
      <div className="glass-card border border-slate-800/80 rounded-3xl p-6 bg-slate-900/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 opacity-80" />
        <h2 className="text-xl font-bold text-slate-100 mb-4 tracking-tight">Current System Status</h2>
        <p className="text-slate-400 text-sm">No active batch selected.</p>
      </div>
    );
  }

  const assessment = activeBatch.latestAssessment || {};
  const status = assessment.status || "N/A";
  const riskLevel = assessment.riskLevel || "N/A";
  const suspicious = assessment.suspiciousQualityFlag;
  const lastUpdated =
    activeBatch.traceability?.lastScanTime || activeBatch.lastUpdated;

  const statusBadgeStyle =
    status === "VERIFIED FRESH"
      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 glow-emerald"
      : status === "MONITOR"
      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
      : "bg-rose-500/10 text-rose-400 border border-rose-500/30 glow-rose";

  return (
    <div className="glass-card border border-slate-800/80 rounded-3xl p-6 bg-slate-900/80 backdrop-blur-xl shadow-2xl relative overflow-hidden space-y-4">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 opacity-80" />

      <h2 className="text-xl font-bold text-slate-100 tracking-tight">Current Batch Status</h2>

      <div className={`rounded-2xl p-4 shadow-inner ${statusBadgeStyle}`}>
        <div className="text-xs uppercase tracking-wider font-bold opacity-80">Overall Batch Status</div>
        <div className="text-2xl font-black tracking-tight mt-0.5">{status}</div>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
          <span className="text-slate-400 font-medium">Risk Level</span>
          <span className="font-bold text-slate-100 font-mono">{riskLevel}</span>
        </div>

        <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
          <span className="text-slate-400 font-medium">Freshness Score</span>
          <span className="font-bold text-emerald-400 font-mono text-sm">
            {assessment.freshnessScore ?? "N/A"}
          </span>
        </div>

        <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
          <span className="text-slate-400 font-medium">Spoilage Risk</span>
          <span className="font-bold text-amber-400 font-mono text-sm">
            {assessment.spoilageRisk ?? "N/A"}%
          </span>
        </div>

        <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
          <span className="text-slate-400 font-medium">Suspicious Pattern</span>
          <span
            className={
              suspicious ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"
            }
          >
            {suspicious ? "Flagged" : "Not Detected"}
          </span>
        </div>

        <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
          <span className="text-slate-400 font-medium">Storage Condition</span>
          <span className="font-semibold text-slate-200">
            {activeBatch.latestSensors?.storageCondition || "--"}
          </span>
        </div>

        <div className="flex justify-between items-center py-1">
          <span className="text-slate-400 font-medium">Last Update</span>
          <span className="font-mono text-slate-300">
            {lastUpdated ? new Date(lastUpdated).toLocaleString() : "--"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default StatusCard;