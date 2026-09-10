import { ShieldCheck, AlertTriangle, Eye, Sparkles } from "lucide-react";
import PassportSectionHeader from "./PassportSectionHeader";

const InfoTile = ({ label, value, colorClass = "text-[#111715]" }) => {
  return (
    <div className="bg-[#FAFBF8] border border-[#DDE4DF] rounded-xl p-4">
      <p className="text-[#56635D] text-xs font-extrabold uppercase tracking-wider">{label}</p>
      <p className={`text-base md:text-lg font-extrabold mt-1 ${colorClass}`}>
        {value}
      </p>
    </div>
  );
};

const AIQualityScreeningCard = ({ batch }) => {
  const { latestAssessment } = batch;
  const flagged = latestAssessment.suspiciousQualityFlag;

  const visualAssessment =
    latestAssessment.visualClass === "freshapple"
      ? "Fresh Apple"
      : latestAssessment.visualClass === "freshbanana"
      ? "Fresh Banana"
      : latestAssessment.visualClass === "freshorange"
      ? "Fresh Orange"
      : latestAssessment.visualClass;

  return (
    <div className="bg-white rounded-2xl border border-[#DDE4DF] shadow-xs p-6">
      <PassportSectionHeader
        title="AI Quality Screening"
        subtitle="Non-destructive visual and storage-condition screening summary for this batch"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <InfoTile
          label="Visual Assessment"
          value={visualAssessment}
          colorClass="text-[#111715]"
        />

        <InfoTile
          label="Screening Confidence"
          value={`${(latestAssessment.confidence * 100).toFixed(1)}%`}
          colorClass="text-[#064C3B]"
        />

        <InfoTile
          label="Suspicious Pattern Flag"
          value={flagged ? "YES" : "NO"}
          colorClass={flagged ? "text-[#D97706]" : "text-[#064C3B]"}
        />

        <InfoTile
          label="Freshness Interpretation"
          value={
            latestAssessment.freshnessScore >= 85
              ? "Strong Freshness"
              : latestAssessment.freshnessScore >= 65
              ? "Monitor Freshness"
              : "Elevated Deterioration Risk"
          }
          colorClass={
            latestAssessment.freshnessScore >= 85
              ? "text-[#064C3B]"
              : latestAssessment.freshnessScore >= 65
              ? "text-[#D97706]"
              : "text-[#DC2626]"
          }
        />
      </div>

      <div
        className={`rounded-xl border p-5 ${
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

          <div className="flex-1">
            <h4
              className={`text-lg font-extrabold ${
                flagged ? "text-[#92400E]" : "text-[#064C3B]"
              }`}
            >
              {flagged
                ? "Potential Abnormal Quality / Ripening Pattern"
                : "No Major Suspicious Quality Pattern Detected"}
            </h4>

            <p className="text-[#111715] font-semibold leading-relaxed mt-2 text-xs md:text-sm">
              {latestAssessment.qualityAdvisory}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 bg-white rounded-full px-3.5 py-1 border border-[#DDE4DF] text-xs font-extrabold text-[#111715]">
                <Eye size={14} className="text-[#56635D]" />
                Visual + sensor-backed screening
              </div>

              <div className="inline-flex items-center gap-2 bg-white rounded-full px-3.5 py-1 border border-[#DDE4DF] text-xs font-extrabold text-[#111715]">
                <Sparkles size={14} className="text-[#56635D]" />
                TraceFresh AI advisory layer
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIQualityScreeningCard;