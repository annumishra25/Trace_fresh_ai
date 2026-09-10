import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import PassportHero from "../components/passport/PassportHero";
import FreshnessSummary from "../components/passport/FreshnessSummary";
import QualityAdvisoryCard from "../components/passport/QualityAdvisoryCard";
import SensorSnapshotCard from "../components/passport/SensorSnapshotCard";
import ReasonCodesPanel from "../components/passport/ReasonCodesPanel";
import TraceabilityDetailsCard from "../components/passport/TraceabilityDetailsCard";
import PassportTrustStrip from "../components/passport/PassportTrustStrip";
import AIQualityScreeningCard from "../components/passport/AIQualityScreeningCard";

import { fetchBatchById } from "../services/batchApi";

const BatchPassport = () => {
  const { batchId } = useParams();

  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const loadBatch = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const batchData = await fetchBatchById(batchId);
        setBatch(batchData);
      } catch (error) {
        console.error("Failed to load batch passport:", error);
        setErrorMsg("Unable to load this TraceFresh batch passport right now.");
      } finally {
        setLoading(false);
      }
    };

    if (batchId) {
      loadBatch();
    }
  }, [batchId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card bg-slate-900/90 rounded-3xl border border-slate-800 p-10 text-center max-w-xl w-full shadow-2xl">
          <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100 mb-3">
            Loading TraceFresh Passport
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Fetching the latest batch freshness, traceability, and quality screening record...
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card bg-slate-900/90 rounded-3xl border border-slate-800 p-10 text-center max-w-xl w-full shadow-2xl">
          <h1 className="text-3xl md:text-4xl font-black text-rose-400 mb-4">
            Passport Load Failed
          </h1>
          <p className="text-slate-200 text-base leading-relaxed mb-6">{errorMsg}</p>
          <p className="text-xs text-slate-400">
            Please verify that the backend is running and the batch ID is valid.
          </p>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card bg-slate-900/90 rounded-3xl border border-slate-800 p-10 text-center max-w-xl w-full shadow-2xl">
          <h1 className="text-3xl md:text-4xl font-black text-slate-100 mb-4">
            Batch Passport Not Found
          </h1>
          <p className="text-slate-300 text-base leading-relaxed">
            The requested TraceFresh AI batch passport could not be found.
          </p>
        </div>
      </div>
    );
  }

  const { latestAssessment, latestSensors, traceability } = batch;

  return (
    <div className="space-y-6 pb-10">
      <div>
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-full px-4 py-1.5 text-xs font-bold mb-3">
            TraceFresh AI • Consumer Verification Portal
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-100 tracking-tight leading-tight">
            Consumer Freshness Passport
          </h1>

          <p className="text-slate-300 text-sm mt-2 max-w-4xl leading-relaxed">
            A QR-linked batch quality passport powered by TraceFresh AI for
            freshness verification, spoilage monitoring, traceability, and
            suspicious quality screening.
          </p>
        </div>

        <div className="space-y-6">
          <PassportHero batch={batch} />
          <PassportTrustStrip batch={batch} />
          <FreshnessSummary assessment={latestAssessment} />
          <AIQualityScreeningCard batch={batch} />
          <QualityAdvisoryCard assessment={latestAssessment} />
          <SensorSnapshotCard sensors={latestSensors} />
          <ReasonCodesPanel reasons={latestAssessment.reasons} />
          <TraceabilityDetailsCard traceability={traceability} batch={batch} />

          <div className="glass-card bg-slate-900/80 rounded-3xl p-6 md:p-8 border border-slate-800 border-l-4 border-l-blue-500 space-y-3">
            <h3 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight">
              Verification Note
            </h3>
            <p className="text-slate-200 leading-relaxed text-sm md:text-base">
              This quality passport was generated by TraceFresh AI using visual
              fruit analysis and environmental condition monitoring. The
              advisory and screening outcome are intended as quality-support
              indicators for freshness monitoring, spoilage assessment, and
              suspicious storage / ripening pattern screening. This passport is
              not a substitute for certified laboratory chemical testing or
              official food safety certification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchPassport;