import { ShieldCheck, Clock3, Cpu, MapPin } from "lucide-react";

const TrustItem = ({ icon, label, value }) => {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 flex items-start gap-3">
      <div className="mt-1 text-blue-600">{icon}</div>
      <div>
        <p className="text-slate-500 text-xs uppercase tracking-wide">{label}</p>
        <p className="text-slate-900 font-semibold mt-1">{value}</p>
      </div>
    </div>
  );
};

const PassportTrustStrip = ({ batch }) => {
  return (
    <div className="bg-white rounded-3xl shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <TrustItem
          icon={<ShieldCheck size={20} />}
          label="Passport Status"
          value="Active & Verified"
        />

        <TrustItem
          icon={<Cpu size={20} />}
          label="Verification Engine"
          value="TraceFresh AI"
        />

        <TrustItem
          icon={<Clock3 size={20} />}
          label="Last Scan"
          value={new Date(batch.traceability.lastScanTime).toLocaleString()}
        />

        <TrustItem
          icon={<MapPin size={20} />}
          label="Traceability Node"
          value={batch.traceability.node}
        />
      </div>
    </div>
  );
};

export default PassportTrustStrip;