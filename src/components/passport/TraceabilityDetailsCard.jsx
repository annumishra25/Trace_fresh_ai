import PassportSectionHeader from "./PassportSectionHeader";

const DetailCard = ({ label, value }) => {
  return (
    <div className="bg-[#FAFBF8] border border-[#DDE4DF] rounded-xl p-4">
      <p className="text-[#56635D] text-xs font-extrabold uppercase tracking-wider">{label}</p>
      <p className="text-base font-extrabold text-[#111715] mt-1">{value}</p>
    </div>
  );
};

const TraceabilityDetailsCard = ({ traceability, batch }) => {
  return (
    <div className="bg-white rounded-2xl border border-[#DDE4DF] shadow-xs p-6">
      <PassportSectionHeader
        title="Traceability Details"
        subtitle="Digital identity and latest supply chain checkpoint information"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <DetailCard label="Batch ID" value={batch.batchId} />
        <DetailCard label="Lot ID" value={traceability.lotId} />
        <DetailCard label="Packed Date" value={traceability.packedDate} />
        <DetailCard
          label="Last Scan Time"
          value={new Date(traceability.lastScanTime).toLocaleString()}
        />
        <DetailCard label="Shipment ID" value={traceability.shipmentId} />
        <DetailCard label="Node / Storage Point" value={traceability.node} />
      </div>
    </div>
  );
};

export default TraceabilityDetailsCard;