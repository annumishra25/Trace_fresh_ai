import { useMonitoringBatch } from "../../context/MonitoringBatchContext";

function InspectionInfo() {
  const { activeBatch } = useMonitoringBatch();

  if (!activeBatch) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Inspection Summary</h2>
        <p className="text-slate-500">No inspection summary available yet.</p>
      </div>
    );
  }

  const assessment = activeBatch.latestAssessment || {};
  const trace = activeBatch.traceability || {};

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">
        Inspection Summary
      </h2>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span>Batch ID</span>
          <span className="font-semibold">{activeBatch.batchId}</span>
        </div>

        <div className="flex justify-between">
          <span>Fruit</span>
          <span className="font-semibold capitalize">
            {activeBatch.fruitType || "--"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Condition</span>
          <span className="text-green-600 font-semibold">
            {assessment.status || "--"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Inspection Time</span>
          <span>
            {trace.lastScanTime
              ? new Date(trace.lastScanTime).toLocaleString()
              : "--"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Node</span>
          <span>{trace.node || activeBatch.location || "--"}</span>
        </div>

        <div className="flex justify-between">
          <span>Lot ID</span>
          <span>{trace.lotId || "--"}</span>
        </div>

        <div className="flex justify-between">
          <span>Shipment ID</span>
          <span>{trace.shipmentId || "--"}</span>
        </div>

        <div className="flex justify-between">
          <span>Packed Date</span>
          <span>{trace.packedDate || "--"}</span>
        </div>

        <div className="flex justify-between">
          <span>Model Version</span>
          <span>TraceFresh AI v1.0</span>
        </div>
      </div>
    </div>
  );
}

export default InspectionInfo;