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
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-md p-10 text-center max-w-xl w-full">
          <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
            Loading TraceFresh Passport
          </h1>
          <p className="text-slate-600 text-lg leading-7">
            Fetching the latest batch freshness, traceability, and quality screening record...
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-md p-10 text-center max-w-xl w-full">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Passport Load Failed
          </h1>
          <p className="text-slate-600 text-lg leading-7 mb-6">{errorMsg}</p>
          <p className="text-sm text-slate-500">
            Please verify that the backend is running and the batch ID is valid.
          </p>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-md p-10 text-center max-w-xl w-full">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Batch Passport Not Found
          </h1>
          <p className="text-slate-600 text-lg leading-7">
            The requested TraceFresh AI batch passport could not be found.
          </p>
        </div>
      </div>
    );
  }

  const { latestAssessment, latestSensors, traceability } = batch;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-4 py-2 text-sm font-medium mb-4">
            TraceFresh AI • Consumer Verification Portal
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight">
            Consumer Freshness Passport
          </h1>

          <p className="text-slate-600 text-lg mt-3 max-w-4xl leading-7">
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

          <div className="bg-white rounded-3xl shadow-md p-6 border-l-4 border-blue-500">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
              Verification Note
            </h3>
            <p className="text-slate-700 leading-7 text-base md:text-lg">
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