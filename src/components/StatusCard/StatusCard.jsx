import { useMonitoringBatch } from "../../context/MonitoringBatchContext";

function StatusCard() {
  const { activeBatch } = useMonitoringBatch();

  if (!activeBatch) {
    return (
      <div className="bg-white border border-[#DCE4DE] rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <h2 className="text-xl font-extrabold text-[#101513] mb-4 tracking-tight">Current System Status</h2>
        <p className="text-[#4E5B55] text-xs font-medium">No active batch selected.</p>
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
      ? "bg-[#DDF2E8] text-[#063C2F] border border-[#16805F]/30"
      : status === "MONITOR"
      ? "bg-[#FEF3C7] text-[#92400E] border border-[#D97706]/30"
      : "bg-[#FEE2E2] text-[#991B1B] border border-[#DC2626]/30";

  return (
    <div className="bg-white border border-[#DCE4DE] rounded-2xl p-6 shadow-sm space-y-4 relative overflow-hidden">
      <h2 className="text-xl font-extrabold text-[#101513] tracking-tight">Current Batch Status</h2>

      <div className={`rounded-xl p-4 ${statusBadgeStyle}`}>
        <div className="text-xs uppercase tracking-wider font-bold opacity-80">Overall Batch Status</div>
        <div className="text-2xl font-extrabold tracking-tight mt-0.5">{status}</div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center py-1.5 border-b border-[#E8EEE7]">
          <span className="text-[#78837D] font-semibold">Risk Level</span>
          <span className="font-bold text-[#101513]">{riskLevel}</span>
        </div>

        <div className="flex justify-between items-center py-1.5 border-b border-[#E8EEE7]">
          <span className="text-[#78837D] font-semibold">Freshness Score</span>
          <span className="font-extrabold text-[#063C2F] text-sm">
            {assessment.freshnessScore ?? "N/A"}
          </span>
        </div>

        <div className="flex justify-between items-center py-1.5 border-b border-[#E8EEE7]">
          <span className="text-[#78837D] font-semibold">Spoilage Risk</span>
          <span className="font-bold text-[#D97706] text-sm">
            {assessment.spoilageRisk ?? "N/A"}%
          </span>
        </div>

        <div className="flex justify-between items-center py-1.5 border-b border-[#E8EEE7]">
          <span className="text-[#78837D] font-semibold">Suspicious Pattern</span>
          <span
            className={
              suspicious ? "text-[#DC2626] font-bold" : "text-[#063C2F] font-bold"
            }
          >
            {suspicious ? "Flagged" : "Not Detected"}
          </span>
        </div>

        <div className="flex justify-between items-center py-1.5 border-b border-[#E8EEE7]">
          <span className="text-[#78837D] font-semibold">Storage Condition</span>
          <span className="font-bold text-[#101513]">
            {activeBatch.latestSensors?.storageCondition || "--"}
          </span>
        </div>

        <div className="flex justify-between items-center py-1.5">
          <span className="text-[#78837D] font-semibold">Last Update</span>
          <span className="font-medium text-[#4E5B55]">
            {lastUpdated ? new Date(lastUpdated).toLocaleString() : "--"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default StatusCard;