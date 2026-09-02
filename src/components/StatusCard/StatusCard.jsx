import { useMonitoringBatch } from "../../context/MonitoringBatchContext";

function StatusCard() {
  const { activeBatch } = useMonitoringBatch();

  if (!activeBatch) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Current System Status</h2>
        <p className="text-slate-500">No active batch selected.</p>
      </div>
    );
  }

  const assessment = activeBatch.latestAssessment || {};
  const status = assessment.status || "N/A";
  const riskLevel = assessment.riskLevel || "N/A";
  const suspicious = assessment.suspiciousQualityFlag;
  const lastUpdated =
    activeBatch.traceability?.lastScanTime || activeBatch.lastUpdated;

  const statusColor =
    status === "VERIFIED FRESH"
      ? "bg-green-100 text-green-700"
      : status === "MONITOR"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Current Batch Status</h2>

      <div className={`rounded-xl p-4 mb-4 ${statusColor}`}>
        <div className="text-sm opacity-80">Overall Batch Status</div>
        <div className="text-2xl font-bold">{status}</div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span>Risk Level</span>
          <span className="font-semibold">{riskLevel}</span>
        </div>

        <div className="flex justify-between">
          <span>Freshness Score</span>
          <span className="font-semibold">
            {assessment.freshnessScore ?? "N/A"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Spoilage Risk</span>
          <span className="font-semibold">
            {assessment.spoilageRisk ?? "N/A"}%
          </span>
        </div>

        <div className="flex justify-between">
          <span>Suspicious Pattern</span>
          <span
            className={
              suspicious ? "text-red-600 font-semibold" : "text-green-600 font-semibold"
            }
          >
            {suspicious ? "Flagged" : "Not Detected"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Storage Condition</span>
          <span className="font-medium">
            {activeBatch.latestSensors?.storageCondition || "--"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Last Update</span>
          <span className="font-medium">
            {lastUpdated ? new Date(lastUpdated).toLocaleString() : "--"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default StatusCard;