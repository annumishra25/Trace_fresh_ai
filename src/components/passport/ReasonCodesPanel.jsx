import { CheckCircle2 } from "lucide-react";
import PassportSectionHeader from "./PassportSectionHeader";

const ReasonCodesPanel = ({ reasons }) => {
  return (
    <div className="bg-white rounded-2xl border border-[#DDE4DF] shadow-xs p-6">
      <PassportSectionHeader
        title="Why this status was assigned"
        subtitle="Key AI and environmental factors influencing the current quality status"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reasons.map((reason, index) => (
          <div
            key={index}
            className="flex items-start gap-3 bg-[#FAFBF8] border border-[#DDE4DF] rounded-xl p-4"
          >
            <CheckCircle2 className="text-[#064C3B] mt-0.5 shrink-0" size={18} />
            <p className="text-[#111715] font-extrabold text-xs md:text-sm leading-relaxed">{reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReasonCodesPanel;