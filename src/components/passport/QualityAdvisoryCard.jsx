import { AlertTriangle, ShieldCheck } from "lucide-react";
import PassportSectionHeader from "./PassportSectionHeader";

const QualityAdvisoryCard = ({ assessment }) => {
  const flagged = assessment.suspiciousQualityFlag;

  return (
    <div className="bg-white rounded-3xl shadow-md p-6">
      <PassportSectionHeader
        title="Quality Advisory"
        subtitle="AI-supported freshness and suspicious quality screening summary"
      />

      <div
        className={`rounded-2xl p-5 border ${
          flagged
            ? "bg-amber-50 border-amber-200"
            : "bg-green-50 border-green-200"
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="mt-1">
            {flagged ? (
              <AlertTriangle className="text-amber-500" size={28} />
            ) : (
              <ShieldCheck className="text-green-600" size={28} />
            )}
          </div>

          <div>
            <h4
              className={`text-xl font-bold ${
                flagged ? "text-amber-700" : "text-green-700"
              }`}
            >
              {flagged
                ? "Suspicious / Monitor Pattern"
                : "No Major Concern Detected"}
            </h4>

            <p className="text-slate-700 mt-3 leading-7">
              {assessment.qualityAdvisory}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityAdvisoryCard;