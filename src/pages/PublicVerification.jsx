import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicVerification, getPublicDemoScenario } from "../services/qrPassportApi";

export default function PublicVerification() {
  const { publicToken } = useParams();
  const [passportData, setPassportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDemo, setActiveDemo] = useState(null);
  const [activeDrawer, setActiveDrawer] = useState(null);

  const demoScenarios = [
    { id: "VERIFIED_GOOD", label: "🟢 Verified Optimal", desc: "Fresh produce pass" },
    { id: "VERIFIED_MONITOR", label: "🟡 In-Transit Monitor", desc: "Minor temp variance" },
    { id: "VERIFIED_ATTENTION", label: "🟠 Attention Advisory", desc: "Delay + exposure warning" },
    { id: "IN_TRANSIT", label: "🚛 Active Transit", desc: "Live monitoring en route" },
    { id: "COMPLETED", label: "✅ Delivery Complete", desc: "Verified delivery" },
    { id: "REVOKED_QR", label: "⛔ Revoked QR", desc: "Deactivated token" },
    { id: "INVALID_QR", label: "❌ Invalid QR", desc: "Token not found" },
    { id: "INSUFFICIENT_DATA", label: "⏳ Pending Data", desc: "Awaiting telemetry" }
  ];

  useEffect(() => {
    if (publicToken) {
      loadPublicPassport(publicToken);
    } else {
      loadDemoScenario("VERIFIED_GOOD");
    }
  }, [publicToken]);

  const loadPublicPassport = async (token) => {
    setLoading(true);
    try {
      const data = await getPublicVerification(token);
      setPassportData(data);
    } catch (err) {
      console.error("Failed to load public verification:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadDemoScenario = async (scenarioId) => {
    setActiveDemo(scenarioId);
    setLoading(true);
    try {
      const data = await getPublicDemoScenario(scenarioId);
      setPassportData(data);
    } catch (err) {
      console.error("Failed to load demo scenario:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm w-full">
          <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-lg font-bold">Verifying Product Passport</h2>
          <p className="text-xs text-slate-400 font-mono">Querying TraceFresh Trust Protocol Registry...</p>
        </div>
      </div>
    );
  }

  const {
    verified,
    verificationStatus,
    publicToken: token,
    title,
    message,
    product,
    journey,
    environmentSummary,
    inspectionSummary,
    conditionIndicator,
    timeline,
    trustEvidence,
    passportId,
    passportHash,
    lastUpdated
  } = passportData || {};

  const getStatusBadge = (status) => {
    switch (status) {
      case "VERIFIED":
      case "COMPLETED":
        return { bg: "bg-emerald-500 text-white", icon: "✓", label: "VERIFIED AUTHENTIC BATCH" };
      case "IN_TRANSIT":
        return { bg: "bg-sky-500 text-white", icon: "🚛", label: "VERIFIED IN TRANSIT" };
      case "MONITOR":
        return { bg: "bg-amber-500 text-white", icon: "⚡", label: "CONDITION MONITORED" };
      case "ATTENTION_REQUIRED":
      case "ATTENTION":
        return { bg: "bg-orange-500 text-white", icon: "⚠️", label: "ATTENTION ADVISORY" };
      case "REVOKED":
        return { bg: "bg-rose-600 text-white", icon: "⛔", label: "QR CODE REVOKED" };
      case "INVALID":
        return { bg: "bg-slate-700 text-slate-200", icon: "❌", label: "INVALID QR CODE" };
      default:
        return { bg: "bg-slate-700 text-white", icon: "ℹ️", label: status };
    }
  };

  const badge = getStatusBadge(verificationStatus);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-black">
      {/* Consumer Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <div>
              <h1 className="text-sm font-black text-white tracking-wide">TraceFresh</h1>
              <p className="text-[10px] text-emerald-400 font-mono">Digital Product Passport</p>
            </div>
          </div>
          <Link
            to="/qrcode"
            className="text-xs text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 font-medium transition-colors"
          >
            Operator Portal →
          </Link>
        </div>
      </header>

      {/* Demo Evaluator Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3">
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <span>🧪</span> CONSUMER VERIFICATION DEMO SCENARIOS
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Test public scan responses</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
            {demoScenarios.map((sc) => (
              <button
                key={sc.id}
                onClick={() => loadDemoScenario(sc.id)}
                className={`p-2 rounded-lg text-left border transition-all ${
                  activeDemo === sc.id
                    ? "bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-sm"
                    : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="text-[11px] truncate">{sc.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Verification Status Header */}
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase ${badge.bg}`}>
              <span>{badge.icon}</span> {badge.label}
            </span>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 truncate">
              TOKEN: {token || publicToken || "TR-VER-89A7B3E1F4C2D0E5"}
            </span>
          </div>

          {/* Invalid / Revoked Banner */}
          {!verified ? (
            <div className="bg-rose-950/60 border border-rose-800 p-5 rounded-2xl space-y-2">
              <h3 className="text-lg font-bold text-rose-300">{title || "Verification Failed"}</h3>
              <p className="text-xs text-rose-200 leading-relaxed">{message}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">VERIFIED PRODUCE IDENTITY</span>
              <h2 className="text-3xl font-black text-white">{product?.name || "Fresh Apples"}</h2>
              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono flex-wrap">
                <span>Batch: <strong className="text-slate-200">{product?.batchCode}</strong></span>
                <span>•</span>
                <span>Commodity: <strong className="text-slate-200">{product?.commodity}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* If Verified, Display Passport Modules */}
        {verified && (
          <>
            {/* Condition & Freshness Indicator */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 rounded-3xl p-6 border border-slate-800 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    TraceFresh Condition Indicator
                  </span>
                  <div className="text-3xl font-black text-white mt-1">
                    {conditionIndicator?.freshnessIndex} <span className="text-sm font-normal text-slate-400">/ 100</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {conditionIndicator?.rating}
                  </span>
                  <div className="text-xs font-mono text-slate-400 mt-1">
                    Est. Shelf Life: <strong className="text-slate-200">{conditionIndicator?.estimatedShelfLifeDays} Days</strong>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 transition-all duration-500"
                  style={{ width: `${conditionIndicator?.freshnessIndex}%` }}
                ></div>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                💡 <span className="font-semibold text-slate-200">Consumer Advisory:</span> {conditionIndicator?.advisoryText}
              </div>
            </div>

            {/* Journey & Origin Map Card */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <span>🗺️</span> Verified Journey & Origin
                </h3>
                <span className="text-[11px] font-mono bg-slate-800 px-2.5 py-0.5 rounded text-sky-400">
                  {journey?.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Farm Origin</span>
                  <div className="text-sm font-bold text-white">{journey?.origin}</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Destination Hub</span>
                  <div className="text-sm font-bold text-white">{journey?.destination}</div>
                </div>
              </div>

              <p className="text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800 font-mono">
                📍 {journey?.transitSummary}
              </p>
            </div>

            {/* Environment & Visual Summaries Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Environment Summary */}
              <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
                  <span>🌡️</span> Storage Environment
                </div>
                <div className="text-sm font-bold text-white">{environmentSummary?.headline}</div>
                <div className="space-y-1.5 text-xs text-slate-400 font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div>Temp: <span className="text-slate-200">{environmentSummary?.temperatureRating}</span></div>
                  <div>Humidity: <span className="text-slate-200">{environmentSummary?.humidityRating}</span></div>
                </div>
              </div>

              {/* Visual Inspection Summary */}
              <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-sky-400 font-extrabold text-xs uppercase tracking-wider">
                  <span>📷</span> Visual Surface Inspection
                </div>
                <div className="text-sm font-bold text-white">{inspectionSummary?.headline}</div>
                <div className="space-y-1.5 text-xs text-slate-400 font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div>Status: <span className="text-slate-200">{inspectionSummary?.latestStatus}</span></div>
                  <div>Scans Completed: <span className="text-slate-200">{inspectionSummary?.inspectionsCompleted}</span></div>
                </div>
              </div>
            </div>

            {/* Simplified Journey Timeline */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <span>⏱️</span> Journey Timeline Log
              </h3>
              <div className="space-y-3">
                {timeline?.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                      {item.time}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">{item.event}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Trust Evidence Drawers */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <span>🛡️</span> Trust & Verification Evidence
              </h3>

              <div className="space-y-2">
                {trustEvidence?.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                    <button
                      onClick={() => setActiveDrawer(activeDrawer === idx ? null : idx)}
                      className="w-full text-left p-3.5 text-xs font-bold text-slate-200 flex items-center justify-between hover:bg-slate-900/50 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-emerald-400">✓</span> {item.claim}
                      </span>
                      <span className="text-slate-500">{activeDrawer === idx ? "▲" : "▼"}</span>
                    </button>
                    {activeDrawer === idx && (
                      <div className="p-3.5 border-t border-slate-800/80 text-xs text-slate-400 font-sans leading-relaxed bg-slate-900/30">
                        {item.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Footer & Integrity Checksum */}
            <footer className="bg-slate-900/50 rounded-3xl p-5 border border-slate-800 text-center space-y-2">
              <div className="text-[11px] font-mono text-slate-500">
                Passport ID: <span className="text-slate-300">{passportId}</span>
              </div>
              <div className="text-[10px] font-mono text-slate-600 truncate max-w-full">
                Data Integrity Hash: {passportHash}
              </div>
              <div className="text-[10px] text-slate-500">
                Verified by TraceFresh AI Trust Protocol • Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : "Just now"}
              </div>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
