import { CheckCircle2 } from "lucide-react";
import PassportSectionHeader from "./PassportSectionHeader";

const ReasonCodesPanel = ({ reasons }) => {
  return (
    <div className="bg-white rounded-3xl shadow-md p-6">
      <PassportSectionHeader
        title="Why this status was assigned"
        subtitle="Key AI and environmental factors influencing the current quality status"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reasons.map((reason, index) => (
          <div
            key={index}
            className="flex items-start gap-3 bg-slate-50 rounded-2xl p-4"
          >
            <CheckCircle2 className="text-green-600 mt-1 shrink-0" size={20} />
            <p className="text-slate-700 leading-6">{reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReasonCodesPanel;