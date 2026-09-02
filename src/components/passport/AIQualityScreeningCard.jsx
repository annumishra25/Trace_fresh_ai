import { ShieldCheck, AlertTriangle, Eye, Sparkles } from "lucide-react";
import PassportSectionHeader from "./PassportSectionHeader";

const InfoTile = ({ label, value, colorClass = "text-slate-900" }) => {
  return (
    <div className="bg-slate-50 rounded-2xl p-4">
      <p className="text-slate-500 text-sm">{label}</p>
      <p className={`text-lg md:text-xl font-bold mt-2 ${colorClass}`}>
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
    <div className="bg-white rounded-3xl shadow-md p-6">
      <PassportSectionHeader
        title="AI Quality Screening"
        subtitle="Non-destructive visual and storage-condition screening summary for this batch"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <InfoTile
          label="Visual Assessment"
          value={visualAssessment}
          colorClass="text-slate-900"
        />

        <InfoTile
          label="Screening Confidence"
          value={`${(latestAssessment.confidence * 100).toFixed(1)}%`}
          colorClass="text-blue-600"
        />

        <InfoTile
          label="Suspicious Pattern Flag"
          value={flagged ? "YES" : "NO"}
          colorClass={flagged ? "text-amber-600" : "text-green-600"}
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
              ? "text-green-600"
              : latestAssessment.freshnessScore >= 65
              ? "text-amber-500"
              : "text-red-500"
          }
        />
      </div>

      <div
        className={`rounded-2xl border p-5 ${
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

          <div className="flex-1">
            <h4
              className={`text-xl font-bold ${
                flagged ? "text-amber-700" : "text-green-700"
              }`}
            >
              {flagged
                ? "Potential Abnormal Quality / Ripening Pattern"
                : "No Major Suspicious Quality Pattern Detected"}
            </h4>

            <p className="text-slate-700 leading-7 mt-3">
              {latestAssessment.qualityAdvisory}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 bg-white/80 rounded-full px-4 py-2 border border-slate-200 text-sm text-slate-700">
                <Eye size={16} className="text-slate-600" />
                Visual + sensor-backed screening
              </div>

              <div className="inline-flex items-center gap-2 bg-white/80 rounded-full px-4 py-2 border border-slate-200 text-sm text-slate-700">
                <Sparkles size={16} className="text-slate-600" />
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