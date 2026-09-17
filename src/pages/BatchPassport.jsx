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
import { useSensorData } from "../context/SensorContext";

const BatchPassport = () => {
  const { batchId } = useParams();
  const sensorCtx = useSensorData();
  const sensorData = sensorCtx?.sensorData;

  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let isMounted = true;
    const loadBatch = async (isSilent = false) => {
      try {
        if (!isSilent) setLoading(true);
        setErrorMsg("");

        const batchData = await fetchBatchById(batchId);
        if (isMounted) {
          setBatch(batchData);
        }
      } catch (error) {
        console.error("Failed to load batch passport:", error);
        if (isMounted && !isSilent) {
          setErrorMsg("Unable to load this TraceFresh batch passport right now.");
        }
      } finally {
        if (isMounted && !isSilent) {
          setLoading(false);
        }
      }
    };

    if (batchId) {
      loadBatch(false);
      const interval = setInterval(() => {
        loadBatch(true);
      }, 2000);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
  }, [batchId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-[#DDE4DF] p-10 text-center max-w-xl w-full shadow-xs">
          <div className="w-12 h-12 border-4 border-[#064C3B] border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#111715] mb-3">
            Loading TraceFresh Passport
          </h1>
          <p className="text-[#56635D] text-sm font-semibold leading-relaxed">
            Fetching the latest batch freshness, traceability, and quality screening record...
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-[#FCA5A5] p-10 text-center max-w-xl w-full shadow-xs">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#991B1B] mb-4">
            Passport Load Failed
          </h1>
          <p className="text-[#111715] text-base font-semibold leading-relaxed mb-6">{errorMsg}</p>
          <p className="text-xs text-[#56635D] font-bold">
            Please verify that the backend is running and the batch ID is valid.
          </p>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-[#DDE4DF] p-10 text-center max-w-xl w-full shadow-xs">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#111715] mb-4">
            Batch Passport Not Found
          </h1>
          <p className="text-[#56635D] text-base font-semibold leading-relaxed">
            The requested TraceFresh AI batch passport could not be found.
          </p>
        </div>
      </div>
    );
  }

  const { latestAssessment, latestSensors, traceability } = batch;

  // Real-time live sensors from dashboard context if matching batchId or fallback to batch.latestSensors
  const activeSensors = (sensorData && (sensorData.batchId === batchId || !sensorData.batchId))
    ? {
        temperature: sensorData.temperature,
        humidity: sensorData.humidity,
        voc: sensorData.voc,
        mq135: sensorData.voc,
        co2: sensorData.co2,
        ethylene: sensorData.ethylene,
        weight: sensorData.weight,
        storageCondition: sensorData.status === "SAFE" ? "Optimal" : "Suboptimal"
      }
    : (latestSensors || {});

  return (
    <div className="space-y-6 pb-10">
      <div>
        <div className="mb-6 bg-white p-6 rounded-2xl border border-[#DDE4DF] shadow-xs">
          <div className="inline-flex items-center gap-2 bg-[#E4F5EC] text-[#064C3B] border border-[#C3E9D5] rounded-full px-4 py-1 text-xs font-extrabold mb-3">
            TraceFresh AI • Consumer Verification Portal
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-[#111715] tracking-tight leading-tight">
            Consumer Freshness Passport
          </h1>

          <p className="text-[#56635D] text-xs md:text-sm mt-2 max-w-4xl font-semibold leading-relaxed">
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
          <SensorSnapshotCard sensors={activeSensors} />
          <ReasonCodesPanel reasons={latestAssessment.reasons} />
          <TraceabilityDetailsCard traceability={traceability} batch={batch} />

          <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#DDE4DF] border-l-4 border-l-[#064C3B] space-y-3 shadow-xs">
            <h3 className="text-xl md:text-2xl font-extrabold text-[#111715] tracking-tight">
              Verification Note
            </h3>
            <p className="text-[#111715] leading-relaxed text-xs md:text-sm font-semibold">
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