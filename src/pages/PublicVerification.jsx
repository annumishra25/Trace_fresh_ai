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
      <div className="min-h-screen bg-white text-[#000000] flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm w-full">
          <div className="w-12 h-12 border-4 border-[#063C2F] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-lg font-extrabold text-[#063C2F]">Verifying Product Passport</h2>
          <p className="text-xs text-[#000000] font-mono">Querying TraceFresh Trust Protocol Registry...</p>
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
        return { bg: "bg-[#DDF2E8] text-[#063C2F] border border-[#16805F]", icon: "✓", label: "VERIFIED AUTHENTIC BATCH" };
      case "IN_TRANSIT":
        return { bg: "bg-[#E0F2FE] text-[#0369A1] border border-[#0284C7]", icon: "🚛", label: "VERIFIED IN TRANSIT" };
      case "MONITOR":
        return { bg: "bg-[#FEF3C7] text-[#92400E] border border-[#D97706]", icon: "⚡", label: "CONDITION MONITORED" };
      case "ATTENTION_REQUIRED":
      case "ATTENTION":
        return { bg: "bg-[#FFEDD5] text-[#C2410C] border border-[#EA580C]", icon: "⚠️", label: "ATTENTION ADVISORY" };
      case "REVOKED":
        return { bg: "bg-[#FEE2E2] text-[#991B1B] border border-[#DC2626]", icon: "⛔", label: "QR CODE REVOKED" };
      case "INVALID":
        return { bg: "bg-[#F3F4F6] text-[#1F2937] border border-[#9CA3AF]", icon: "❌", label: "INVALID QR CODE" };
      default:
        return { bg: "bg-[#F3F4F6] text-[#000000] border border-[#9CA3AF]", icon: "ℹ️", label: status };
    }
  };

  const badge = getStatusBadge(verificationStatus);

  return (
    <div className="min-h-screen bg-white text-[#000000] font-sans antialiased selection:bg-[#DDF2E8] selection:text-[#063C2F]">
      {/* Consumer Navigation Bar */}
      <header className="border-b border-[#D1D5DB] bg-white sticky top-0 z-50 px-4 py-3 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <div>
              <h1 className="text-sm font-black text-[#063C2F] tracking-wide">TraceFresh</h1>
              <p className="text-[10px] text-[#063C2F] font-mono font-bold">Digital Product Passport</p>
            </div>
          </div>

          <Link
            to="/qrcode"
            className="text-xs text-[#063C2F] hover:bg-[#DDF2E8] bg-[#F4F7F4] px-3.5 py-1.5 rounded-xl border border-[#D1D5DB] font-bold transition-colors"
          >
            Operator Portal →
          </Link>
        </div>
      </header>

      {/* Demo Evaluator Bar */}
      <div className="bg-[#F4F7F4] border-b border-[#D1D5DB] px-4 py-3">
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#063C2F] uppercase tracking-wider flex items-center gap-1">
              <span>🧪</span> CONSUMER VERIFICATION DEMO SCENARIOS
            </span>
            <span className="text-[10px] text-[#000000] font-mono font-bold">Test public scan responses</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
            {demoScenarios.map((sc) => (
              <button
                key={sc.id}
                onClick={() => loadDemoScenario(sc.id)}
                className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                  activeDemo === sc.id
                    ? "bg-[#063C2F] text-white font-bold border-[#063C2F] shadow-sm"
                    : "bg-white text-[#000000] border-[#D1D5DB] hover:bg-[#E6EFEA]"
                }`}
              >
                <div className="text-[11px] truncate font-bold">{sc.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Verification Status Header */}
        <div className="bg-white rounded-3xl p-6 border border-[#D1D5DB] space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase ${badge.bg}`}>
              <span>{badge.icon}</span> {badge.label}
            </span>
            <span className="text-[11px] font-mono text-[#000000] font-bold bg-[#F4F7F4] px-3 py-1 rounded-lg border border-[#D1D5DB] truncate">
              TOKEN: {token || publicToken || "TR-VER-89A7B3E1F4C2D0E5"}
            </span>
          </div>

          {/* Invalid / Revoked Banner */}
          {!verified ? (
            <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl space-y-2">
              <h3 className="text-lg font-bold text-rose-900">{title || "Verification Failed"}</h3>
              <p className="text-xs text-rose-800 leading-relaxed font-semibold">{message}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-[10px] text-[#063C2F] uppercase tracking-widest font-bold">VERIFIED PRODUCE IDENTITY</span>
              <h2 className="text-3xl font-black text-[#000000]">{product?.name || "Fresh Apples"}</h2>
              <div className="flex items-center gap-3 text-xs text-[#000000] font-mono flex-wrap font-bold">
                <span>Batch: <strong className="text-[#063C2F]">{product?.batchCode}</strong></span>
                <span>•</span>
                <span>Commodity: <strong className="text-[#063C2F]">{product?.commodity}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* If Verified, Display Passport Modules */}
        {verified && (
          <>
            {/* Condition & Freshness Indicator */}
            <div className="bg-white rounded-3xl p-6 border border-[#D1D5DB] space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#063C2F]">
                    TraceFresh Condition Indicator
                  </span>
                  <div className="text-3xl font-black text-[#000000] mt-1">
                    {conditionIndicator?.freshnessIndex} <span className="text-sm font-normal text-[#000000]">/ 100</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-[#DDF2E8] text-[#063C2F] border border-[#16805F]">
                    {conditionIndicator?.rating}
                  </span>
                  <div className="text-xs font-mono text-[#000000] font-bold mt-1">
                    Est. Shelf Life: <strong className="text-[#063C2F]">{conditionIndicator?.estimatedShelfLifeDays} Days</strong>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-[#E5E7EB] rounded-full overflow-hidden p-0.5 border border-[#D1D5DB]">
                <div
                  className="h-full rounded-full bg-[#063C2F] transition-all duration-500"
                  style={{ width: `${conditionIndicator?.freshnessIndex}%` }}
                ></div>
              </div>

              <div className="bg-[#F4F7F4] p-3.5 rounded-xl border border-[#D1D5DB] text-xs text-[#000000] leading-relaxed font-semibold">
                💡 <span className="font-extrabold text-[#063C2F]">Consumer Advisory:</span> {conditionIndicator?.advisoryText}
              </div>
            </div>

            {/* Journey & Origin Map Card */}
            <div className="bg-white rounded-3xl p-6 border border-[#D1D5DB] space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#D1D5DB] pb-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#063C2F] flex items-center gap-2">
                  <span>🗺️</span> Verified Journey & Origin
                </h3>
                <span className="text-[11px] font-mono bg-[#E0F2FE] text-[#0369A1] px-2.5 py-0.5 rounded font-bold border border-[#0284C7]">
                  {journey?.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#F4F7F4] p-4 rounded-2xl border border-[#D1D5DB] space-y-1">
                  <span className="text-[10px] font-extrabold text-[#063C2F] uppercase">Farm Origin</span>
                  <div className="text-sm font-black text-[#000000]">{journey?.origin}</div>
                </div>
                <div className="bg-[#F4F7F4] p-4 rounded-2xl border border-[#D1D5DB] space-y-1">
                  <span className="text-[10px] font-extrabold text-[#063C2F] uppercase">Destination Hub</span>
                  <div className="text-sm font-black text-[#000000]">{journey?.destination}</div>
                </div>
              </div>

              <p className="text-xs text-[#000000] bg-[#F4F7F4] p-3 rounded-xl border border-[#D1D5DB] font-mono font-bold">
                📍 {journey?.transitSummary}
              </p>
            </div>

            {/* Environment & Visual Summaries Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Environment Summary */}
              <div className="bg-white p-5 rounded-3xl border border-[#D1D5DB] space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-[#063C2F] font-extrabold text-xs uppercase tracking-wider">
                  <span>🌡️</span> Storage Environment
                </div>
                <div className="text-sm font-black text-[#000000]">{environmentSummary?.headline}</div>
                <div className="space-y-1.5 text-xs text-[#000000] font-mono bg-[#F4F7F4] p-3 rounded-xl border border-[#D1D5DB] font-bold">
                  <div>Temp: <span className="text-[#063C2F]">{environmentSummary?.temperatureRating}</span></div>
                  <div>Humidity: <span className="text-[#063C2F]">{environmentSummary?.humidityRating}</span></div>
                </div>
              </div>

              {/* Visual Inspection Summary */}
              <div className="bg-white p-5 rounded-3xl border border-[#D1D5DB] space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-[#0369A1] font-extrabold text-xs uppercase tracking-wider">
                  <span>📷</span> Visual Surface Inspection
                </div>
                <div className="text-sm font-black text-[#000000]">{inspectionSummary?.headline}</div>
                <div className="space-y-1.5 text-xs text-[#000000] font-mono bg-[#F4F7F4] p-3 rounded-xl border border-[#D1D5DB] font-bold">
                  <div>Status: <span className="text-[#063C2F]">{inspectionSummary?.latestStatus}</span></div>
                  <div>Scans Completed: <span className="text-[#063C2F]">{inspectionSummary?.inspectionsCompleted}</span></div>
                </div>
              </div>
            </div>

            {/* Simplified Journey Timeline */}
            <div className="bg-white rounded-3xl p-6 border border-[#D1D5DB] space-y-4 shadow-sm">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#063C2F] flex items-center gap-2">
                <span>⏱️</span> Journey Timeline Log
              </h3>
              <div className="space-y-3">
                {timeline?.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-[#F4F7F4] p-3 rounded-xl border border-[#D1D5DB]">
                    <span className="text-xs font-mono font-bold text-[#063C2F] bg-[#DDF2E8] px-2 py-0.5 rounded border border-[#16805F]">
                      {item.time}
                    </span>
                    <span className="text-xs text-[#000000] font-bold">{item.event}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Trust Evidence Drawers */}
            <div className="bg-white rounded-3xl p-6 border border-[#D1D5DB] space-y-3 shadow-sm">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#063C2F] flex items-center gap-2">
                <span>🛡️</span> Trust & Verification Evidence
              </h3>

              <div className="space-y-2">
                {trustEvidence?.map((item, idx) => (
                  <div key={idx} className="bg-[#F4F7F4] rounded-2xl border border-[#D1D5DB] overflow-hidden">
                    <button
                      onClick={() => setActiveDrawer(activeDrawer === idx ? null : idx)}
                      className="w-full text-left p-3.5 text-xs font-bold text-[#000000] flex items-center justify-between hover:bg-[#E6EFEA] transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-[#063C2F] font-bold">✓</span> {item.claim}
                      </span>
                      <span className="text-[#063C2F]">{activeDrawer === idx ? "▲" : "▼"}</span>
                    </button>
                    {activeDrawer === idx && (
                      <div className="p-3.5 border-t border-[#D1D5DB] text-xs text-[#000000] font-semibold leading-relaxed bg-white">
                        {item.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Footer & Integrity Checksum */}
            <footer className="bg-[#F4F7F4] rounded-3xl p-5 border border-[#D1D5DB] text-center space-y-2">
              <div className="text-[11px] font-mono text-[#000000] font-bold">
                Passport ID: <span className="text-[#063C2F]">{passportId}</span>
              </div>
              <div className="text-[10px] font-mono text-[#000000] truncate max-w-full font-semibold">
                Data Integrity Hash: {passportHash}
              </div>
              <div className="text-[10px] text-[#000000] font-medium">
                Verified by TraceFresh AI Trust Protocol • Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : "Just now"}
              </div>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}


