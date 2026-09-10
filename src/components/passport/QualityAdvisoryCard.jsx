import { AlertTriangle, ShieldCheck } from "lucide-react";
import PassportSectionHeader from "./PassportSectionHeader";

const QualityAdvisoryCard = ({ assessment }) => {
  const flagged = assessment.suspiciousQualityFlag;

  return (
    <div className="bg-white rounded-2xl border border-[#DDE4DF] shadow-xs p-6">
      <PassportSectionHeader
        title="Quality Advisory"
        subtitle="AI-supported freshness and suspicious quality screening summary"
      />

      <div
        className={`rounded-xl p-5 border ${
          flagged
            ? "bg-[#FEF3C7] border-[#FDE68A]"
            : "bg-[#E4F5EC] border-[#C3E9D5]"
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="mt-0.5">
            {flagged ? (
              <AlertTriangle className="text-[#D97706]" size={28} />
            ) : (
              <ShieldCheck className="text-[#064C3B]" size={28} />
            )}
          </div>

          <div>
            <h4
              className={`text-lg font-extrabold ${
                flagged ? "text-[#92400E]" : "text-[#064C3B]"
              }`}
            >
              {flagged
                ? "Suspicious / Monitor Pattern"
                : "No Major Concern Detected"}
            </h4>

            <p className="text-[#111715] font-semibold mt-2 leading-relaxed text-xs md:text-sm">
              {assessment.qualityAdvisory}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityAdvisoryCard;