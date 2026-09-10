import { useMonitoringBatch } from "../../context/MonitoringBatchContext";

function InspectionInfo() {
  const { activeBatch } = useMonitoringBatch();

  if (!activeBatch) {
    return (
      <div className="bg-white border border-[#DDE4DF] rounded-2xl p-6 shadow-xs">
        <h2 className="text-xl font-extrabold text-[#111715] mb-2 tracking-tight">Inspection Summary</h2>
        <p className="text-[#56635D] text-xs font-semibold">No inspection summary available yet.</p>
      </div>
    );
  }

  const assessment = activeBatch.latestAssessment || {};
  const trace = activeBatch.traceability || {};

  return (
    <div className="bg-white border border-[#DDE4DF] rounded-2xl p-6 shadow-xs space-y-4">
      <h2 className="text-xl font-extrabold text-[#111715] tracking-tight">
        Inspection Summary
      </h2>

      <div className="space-y-2.5 text-xs font-semibold text-[#111715]">
        <div className="flex justify-between py-1.5 border-b border-[#E8EEE7]">
          <span className="text-[#56635D]">Batch ID</span>
          <span className="font-extrabold text-[#064C3B]">{activeBatch.batchId}</span>
        </div>

        <div className="flex justify-between py-1.5 border-b border-[#E8EEE7]">
          <span className="text-[#56635D]">Fruit</span>
          <span className="font-extrabold capitalize">
            {activeBatch.fruitType || "--"}
          </span>
        </div>

        <div className="flex justify-between py-1.5 border-b border-[#E8EEE7]">
          <span className="text-[#56635D]">Condition</span>
          <span className="text-[#064C3B] font-extrabold">
            {assessment.status || "--"}
          </span>
        </div>

        <div className="flex justify-between py-1.5 border-b border-[#E8EEE7]">
          <span className="text-[#56635D]">Inspection Time</span>
          <span className="text-[#56635D]">
            {trace.lastScanTime
              ? new Date(trace.lastScanTime).toLocaleString()
              : "--"}
          </span>
        </div>

        <div className="flex justify-between py-1.5 border-b border-[#E8EEE7]">
          <span className="text-[#56635D]">Node</span>
          <span className="font-extrabold">{trace.node || activeBatch.location || "--"}</span>
        </div>

        <div className="flex justify-between py-1.5 border-b border-[#E8EEE7]">
          <span className="text-[#56635D]">Lot ID</span>
          <span>{trace.lotId || "--"}</span>
        </div>

        <div className="flex justify-between py-1.5 border-b border-[#E8EEE7]">
          <span className="text-[#56635D]">Shipment ID</span>
          <span>{trace.shipmentId || "--"}</span>
        </div>

        <div className="flex justify-between py-1.5 border-b border-[#E8EEE7]">
          <span className="text-[#56635D]">Packed Date</span>
          <span>{trace.packedDate || "--"}</span>
        </div>

        <div className="flex justify-between py-1.5">
          <span className="text-[#56635D]">Model Version</span>
          <span className="font-extrabold text-[#064C3B]">TraceFresh AI v1.0</span>
        </div>
      </div>
    </div>
  );
}

export default InspectionInfo;