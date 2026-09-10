import { useState, useEffect } from "react";
import { useTelemetry } from "../../context/TelemetryContext";
import {
  evaluateBatchFusion,
  runFusionDemoScenario,
  getFusionDecisionTrace,
  getPassportSummary
} from "../../services/fusionApi";

const DEFAULT_FUSION_RESULT = {
  fusionStatus: "NORMAL",
  overallRiskScore: 8,
  freshnessIndex: { score: 94, rating: "EXCELLENT" },
  confidence: { overallConfidence: 0.96, rating: "HIGH" },
  componentRisks: {
    sensorRisk: { score: 10, rating: "LOW", confidence: 0.95 },
    routeRisk: { score: 5, rating: "LOW", confidence: 0.98 },
    visualRisk: { score: 8, rating: "LOW", confidence: 0.96 }
  },
  crossSignalInteractions: { activeRules: [] },
  explanation: {
    summaryText: "Multi-modal analysis confirms produce is fresh with low risk across temperature, route, and surface features.",
    actionableDriver: "Optimal Cold Storage Conditions",
    recommendation: "Proceed with standard distribution route.",
    primaryDrivers: ["Cold chain temperature strictly maintained at 5.5°C.", "No visual mold or surface discoloration."],
    evidenceStatements: ["Sensors OK", "Vision OK", "GPS Locked"]
  },
  estimatedShelfLife: {
    remainingDays: 9,
    minDays: 8,
    maxDays: 10,
    disclaimer: "Non-guaranteed statistical projection based on environmental parameters."
  },
  confidencePenalties: { appliedPenalties: [] }
};

export default function FusionDecisionCard() {
  const { selectedNodeId, activeTelemetry } = useTelemetry();
  const [fusionResult, setFusionResult] = useState(DEFAULT_FUSION_RESULT);
  const [decisionTrace, setDecisionTrace] = useState(null);
  const [passportSummary, setPassportSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeScenario, setActiveScenario] = useState("ALL_GREEN");
  const [activeTab, setActiveTab] = useState("OVERVIEW"); // OVERVIEW, EVIDENCE, TRACE, PASSPORT
  const [showTraceJson, setShowTraceJson] = useState(false);

  const batchId = "TF-APL-2026-001";

  const demoScenarios = [
    { id: "ALL_GREEN", label: "🟢 Optimal Pass", desc: "Low risk across all signals" },
    { id: "TEMP_EXCURSION", label: "🟡 Temp Excursion + Delay", desc: "Thermal spike + ETA delay" },
    { id: "HIGH_HUMIDITY_MOLD", label: "🟠 Humidity + Mold", desc: "Moisture spike + visual mold" },
    { id: "SIGNAL_CONFLICT_MOLD", label: "⚠️ Signal Conflict", desc: "Sensors normal vs visual mold" },
    { id: "BLURRY_IMAGE_LOW_CONF", label: "🔍 Blurry Image", desc: "Image quality penalty" },
    { id: "STALE_GPS_SEVERITY", label: "📡 Stale GPS", desc: "GPS age penalty" },
    { id: "CRITICAL_MULTI_EXCURSION", label: "🔴 Critical Multi-Excursion", desc: "Severe multi-signal breakdown" }
  ];

  useEffect(() => {
    handleRunDemo("ALL_GREEN", true);
  }, []);

  // Real-time Decision Engine Adaptation on slider scale change
  useEffect(() => {
    if (!activeTelemetry?.sensors) return;
    const s = activeTelemetry.sensors;
    const temp = s.temperature?.value ?? 5.5;
    const hum = s.humidity?.value ?? 71.0;
    const voc = s.voc?.value ?? 1.5;
    const gas = s.gas?.value ?? 0.42;

    const sensorRisk = Math.min(100, Math.round(
      Math.max(0, (temp - 5) * 4) +
      Math.max(0, (hum - 70) * 0.8) +
      (voc * 8) +
      (gas * 18)
    ));

    const overallRisk = Math.min(100, Math.round(sensorRisk * 0.5 + 4));
    const freshnessScore = Math.max(0, Math.min(100, 100 - overallRisk));
    const remainingDays = Number(Math.max(0.5, (freshnessScore / 10).toFixed(1)));

    let status = "NORMAL";
    let recommendation = "Proceed with standard distribution route.";
    let drivers = [];

    if (temp > 25) {
      drivers.push(`Thermal excursion detected at ${temp}°C (Above 25°C limit).`);
    } else {
      drivers.push(`Cold chain temperature maintained at ${temp}°C.`);
    }

    if (gas > 1.0) {
      drivers.push(`Spoilage gas elevated at ${gas} ppm.`);
    }

    if (overallRisk > 65) {
      status = "CRITICAL_ACTION_REQUIRED";
      recommendation = "Immediate cold chain rerouting or expedited dispatch required.";
    } else if (overallRisk > 35) {
      status = "ATTENTION_REQUIRED";
      recommendation = "Prioritize distribution within 48 hours and inspect container.";
    }

    setFusionResult((prev) => ({
      ...prev,
      fusionStatus: status,
      overallRiskScore: overallRisk,
      freshnessIndex: {
        score: freshnessScore,
        rating: freshnessScore >= 80 ? "EXCELLENT" : freshnessScore >= 50 ? "FAIR" : "CRITICAL"
      },
      componentRisks: {
        sensorRisk: { score: sensorRisk, rating: sensorRisk < 25 ? "LOW" : sensorRisk < 60 ? "MEDIUM" : "HIGH", confidence: 0.96 },
        routeRisk: prev?.componentRisks?.routeRisk || { score: 5, rating: "LOW", confidence: 0.98 },
        visualRisk: prev?.componentRisks?.visualRisk || { score: 8, rating: "LOW", confidence: 0.96 }
      },
      explanation: {
        summaryText: `Multi-modal decision engine evaluated live inputs (${temp}°C, ${hum}%, ${gas} ppm gas).`,
        actionableDriver: temp > 25 ? "Temperature Excursion Warning" : gas > 1.0 ? "Spoilage Gas Spike" : "Optimal Cold Storage Conditions",
        recommendation,
        primaryDrivers: drivers,
        evidenceStatements: [
          `Temperature: ${temp}°C`,
          `Humidity: ${hum}%`,
          `Gas / Ethylene: ${gas} ppm`,
          `VOC: ${voc} ppm`
        ]
      },
      estimatedShelfLife: {
        remainingDays,
        minDays: Math.max(0, Math.floor(remainingDays - 1)),
        maxDays: Math.ceil(remainingDays + 1),
        disclaimer: "Real-time decision projection adapted dynamically from scaled sensor input."
      }
    }));
  }, [activeTelemetry]);

  const handleRunDemo = async (scenarioId, skipLoading = false) => {
    setActiveScenario(scenarioId);
    if (!skipLoading) setLoading(true);
    try {
      const result = await runFusionDemoScenario(scenarioId, batchId, selectedNodeId);
      if (result) {
        setFusionResult(result);
        fetchAuxiliaryData();
      }
    } catch (err) {
      console.error("Error executing fusion demo:", err);
    } finally {
      if (!skipLoading) setLoading(false);
    }
  };

  const fetchAuxiliaryData = async () => {
    try {
      const trace = await getFusionDecisionTrace(batchId);
      setDecisionTrace(trace);
      const passport = await getPassportSummary(batchId);
      setPassportSummary(passport);
    } catch (err) {
      console.error("Error fetching auxiliary fusion data:", err);
    }
  };

  if (!fusionResult) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-slate-100 rounded"></div>
      </div>
    );
  }

  const {
    fusionStatus,
    overallRiskScore,
    freshnessIndex,
    confidence,
    componentRisks,
    crossSignalInteractions,
    explanation,
    estimatedShelfLife,
    confidencePenalties
  } = fusionResult;

  const getStatusBadge = (status) => {
    switch (status) {
      case "NORMAL":
        return { bg: "bg-emerald-500 text-white", text: "NORMAL CONDITION", desc: "All signals within safe threshold" };
      case "ATTENTION_REQUIRED":
        return { bg: "bg-amber-500 text-white", text: "ATTENTION REQUIRED", desc: "Minor excursion or signal anomaly" };
      case "WARNING_DISPATCH":
        return { bg: "bg-orange-500 text-white", text: "WARNING: DISPATCH ADVISED", desc: "Elevated risk — prioritize distribution" };
      case "CRITICAL_ACTION_REQUIRED":
        return { bg: "bg-rose-600 text-white", text: "CRITICAL ACTION REQUIRED", desc: "Severe degradation detected" };
      case "SIGNAL_CONFLICT":
        return { bg: "bg-purple-600 text-white", text: "SIGNAL CONFLICT DETECTED", desc: "Discrepancy between sensors and vision" };
      default:
        return { bg: "bg-slate-500 text-white", text: status, desc: "" };
    }
  };

  const statusBadge = getStatusBadge(fusionStatus);

  const getRiskColor = (score) => {
    if (score < 25) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score < 55) return "text-amber-600 bg-amber-50 border-amber-200";
    if (score < 75) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  const getProgressColor = (score) => {
    if (score < 25) return "bg-emerald-500";
    if (score < 55) return "bg-amber-500";
    if (score < 75) return "bg-orange-500";
    return "bg-rose-600";
  };

  return (
    <div className="bg-white border border-[#DCE4DE] rounded-2xl p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DCE4DE] pb-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-2xl font-extrabold text-[#101513] tracking-tight">
              Multi-Modal Fusion & Explainable Freshness Engine
            </h3>
            <span className="px-3 py-1 rounded-md text-xs font-bold uppercase bg-[#DDF2E8] text-[#063C2F] border border-[#16805F]/20">
              STEP 7 ENGINE
            </span>
          </div>
          <p className="text-xs text-[#4E5B55] mt-1 font-medium">
            Real-time weighted multi-signal decision support engine (Batch: <span className="font-bold text-[#101513]">{batchId}</span> | Node: <span className="font-bold text-[#101513]">{selectedNodeId}</span>)
          </p>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center gap-3 bg-[#F7F8F3] p-2.5 rounded-xl border border-[#DCE4DE]">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-[#78837D]">Fusion Confidence</div>
            <div className="text-base font-extrabold text-[#101513]">
              {(confidence.overallConfidence * 100).toFixed(1)}%
              <span className={`ml-1 text-xs font-bold ${confidence.rating === 'HIGH' ? 'text-[#063C2F]' : confidence.rating === 'MODERATE' ? 'text-[#D97706]' : 'text-[#DC2626]'}`}>
                ({confidence.rating})
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-white border border-[#DCE4DE] flex items-center justify-center text-sm font-bold">
            {confidence.rating === 'HIGH' ? '🛡️' : confidence.rating === 'MODERATE' ? '⚡' : '⚠️'}
          </div>
        </div>
      </div>

      {/* Demo Scenario Selector */}
      <div className="bg-[#F7F8F3] rounded-xl p-4 border border-[#DCE4DE] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-[#78837D] tracking-wider flex items-center gap-1.5">
            <span>🧪</span> DEMO SCENARIO EVALUATOR
          </span>
          <span className="text-xs text-[#4E5B55] font-medium">Select scenario to trigger multi-modal fusion</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {demoScenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => handleRunDemo(sc.id)}
              disabled={loading}
              className={`p-2.5 rounded-lg text-left border transition-all cursor-pointer ${
                activeScenario === sc.id
                  ? "bg-[#063C2F] text-white border-[#063C2F] shadow-sm"
                  : "bg-white text-[#101513] border-[#DCE4DE] hover:bg-[#F1F4EE]"
              }`}
            >
              <div className="text-xs font-bold truncate">{sc.label}</div>
              <div className={`text-[10px] truncate ${activeScenario === sc.id ? "text-white/80" : "text-[#78837D]"}`}>
                {sc.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DCE4DE] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("OVERVIEW")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "OVERVIEW"
              ? "bg-[#063C2F] text-white shadow-sm"
              : "text-[#4E5B55] hover:text-[#101513] hover:bg-[#F1F4EE]"
          }`}
        >
          📊 Condition & Freshness Overview
        </button>
        <button
          onClick={() => setActiveTab("EVIDENCE")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "EVIDENCE"
              ? "bg-[#063C2F] text-white shadow-sm"
              : "text-[#4E5B55] hover:text-[#101513] hover:bg-[#F1F4EE]"
          }`}
        >
          🔍 Evidence & Explainability
        </button>
        <button
          onClick={() => setActiveTab("TRACE")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "TRACE"
              ? "bg-[#063C2F] text-white shadow-sm"
              : "text-[#4E5B55] hover:text-[#101513] hover:bg-[#F1F4EE]"
          }`}
        >
          ⚙️ Decision Trace Inspector
        </button>
        <button
          onClick={() => setActiveTab("PASSPORT")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "PASSPORT"
              ? "bg-[#063C2F] text-white shadow-sm"
              : "text-[#4E5B55] hover:text-[#101513] hover:bg-[#F1F4EE]"
          }`}
        >
          📦 Digital Passport Summary
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-6">
          {/* Main Status Banner */}
          <div className={`bg-[#DDF2E8] text-[#063C2F] border border-[#16805F]/30 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4`}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-[#063C2F] px-2.5 py-1 rounded text-white">
                EVALUATION RESULT
              </span>
              <h4 className="text-2xl font-extrabold mt-2 tracking-tight text-[#063C2F]">{statusBadge.text}</h4>
              <p className="text-xs mt-0.5 font-medium text-[#063C2F]">{statusBadge.desc}</p>
            </div>
            <div className="bg-white px-5 py-3 rounded-xl border border-[#DCE4DE] text-center shadow-xs">
              <div className="text-[10px] uppercase font-bold text-[#78837D]">Composite Risk Score</div>
              <div className="text-3xl font-extrabold text-[#101513]">{overallRiskScore} <span className="text-xs font-semibold text-[#78837D]">/ 100</span></div>
            </div>
          </div>

          {/* Freshness Index & Estimated Shelf-Life Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Freshness Card */}
            <div className="bg-[#F7F8F3] p-5 rounded-xl border border-[#DCE4DE] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#78837D] uppercase tracking-wider">Prototype Freshness Index</div>
                  <div className="text-3xl font-extrabold text-[#101513] mt-1">
                    {freshnessIndex.score} <span className="text-xs font-semibold text-[#78837D]">/ 100</span>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-md text-xs font-bold border bg-[#DDF2E8] text-[#063C2F] border-[#16805F]/20">
                  {freshnessIndex.rating}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full h-3 bg-[#E8EEE7] rounded-full overflow-hidden p-0.5 border border-[#DCE4DE]">
                  <div
                    className="h-full rounded-full bg-[#063C2F] transition-all duration-500"
                    style={{ width: `${freshnessIndex.score}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-[#78837D] font-semibold">
                  <span>0 (CRITICAL)</span>
                  <span>50 (FAIR)</span>
                  <span>100 (EXCELLENT)</span>
                </div>
              </div>
            </div>

            {/* Shelf-Life Card */}
            <div className="bg-[#F7F8F3] p-5 rounded-xl border border-[#DCE4DE] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#78837D] uppercase tracking-wider">Estimated Shelf Life</div>
                  <div className="text-3xl font-extrabold text-[#101513] mt-1">
                    {estimatedShelfLife.remainingDays} <span className="text-xs font-semibold text-[#78837D]">Days</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#92400E] font-bold bg-[#FEF3C7] px-2.5 py-1 rounded border border-[#D97706]/20">
                    NON-GUARANTEED ESTIMATE
                  </span>
                  <div className="text-xs text-[#4E5B55] font-semibold mt-1">
                    Range: {estimatedShelfLife.minDays} - {estimatedShelfLife.maxDays} days
                  </div>
                </div>
              </div>

              <div className="text-xs text-[#4E5B55] bg-white p-3 rounded-lg border border-[#DCE4DE] font-medium leading-relaxed">
                {estimatedShelfLife.disclaimer}
              </div>
            </div>
          </div>

          {/* Component Risk Breakdown (0-100) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-[#101513] uppercase tracking-wider">
                Multi-Modal Component Risk Breakdown
              </h4>
              <span className="text-xs text-[#78837D] font-medium">Sum of Weighted Signals + Cross-Interactions</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sensor Risk Card */}
              <div className="bg-[#F7F8F3] p-4 rounded-xl border border-[#DCE4DE] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌡️</span>
                    <div>
                      <div className="text-xs font-extrabold text-[#101513]">Sensor Risk</div>
                      <div className="text-[10px] text-[#78837D] font-semibold">Weight: 40%</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold border bg-white text-[#101513] border-[#DCE4DE]">
                    {componentRisks.sensorRisk.score} / 100
                  </span>
                </div>
                <div className="w-full h-2 bg-[#E8EEE7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#063C2F]"
                    style={{ width: `${componentRisks.sensorRisk.score}%` }}
                  ></div>
                </div>
                <div className="text-xs text-[#4E5B55] font-semibold bg-white p-2 rounded-lg border border-[#DCE4DE]">
                  Rating: <span className="font-bold text-[#101513]">{componentRisks.sensorRisk.rating}</span> | Conf: {(componentRisks.sensorRisk.confidence * 100).toFixed(0)}%
                </div>
              </div>

              {/* Route Risk Card */}
              <div className="bg-[#F7F8F3] p-4 rounded-xl border border-[#DCE4DE] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🚛</span>
                    <div>
                      <div className="text-xs font-extrabold text-[#101513]">Route Risk</div>
                      <div className="text-[10px] text-[#78837D] font-semibold">Weight: 25%</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold border bg-white text-[#101513] border-[#DCE4DE]">
                    {componentRisks.routeRisk.score} / 100
                  </span>
                </div>
                <div className="w-full h-2 bg-[#E8EEE7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#063C2F]"
                    style={{ width: `${componentRisks.routeRisk.score}%` }}
                  ></div>
                </div>
                <div className="text-xs text-[#4E5B55] font-semibold bg-white p-2 rounded-lg border border-[#DCE4DE]">
                  Rating: <span className="font-bold text-[#101513]">{componentRisks.routeRisk.rating}</span> | Conf: {(componentRisks.routeRisk.confidence * 100).toFixed(0)}%
                </div>
              </div>

              {/* Visual Risk Card */}
              <div className="bg-[#F7F8F3] p-4 rounded-xl border border-[#DCE4DE] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📷</span>
                    <div>
                      <div className="text-xs font-extrabold text-[#101513]">Visual Risk</div>
                      <div className="text-[10px] text-[#78837D] font-semibold">Weight: 35%</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold border bg-white text-[#101513] border-[#DCE4DE]">
                    {componentRisks.visualRisk.score} / 100
                  </span>
                </div>
                <div className="w-full h-2 bg-[#E8EEE7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#063C2F]"
                    style={{ width: `${componentRisks.visualRisk.score}%` }}
                  ></div>
                </div>
                <div className="text-xs text-[#4E5B55] font-semibold bg-white p-2 rounded-lg border border-[#DCE4DE]">
                  Rating: <span className="font-bold text-[#101513]">{componentRisks.visualRisk.rating}</span> | Conf: {(componentRisks.visualRisk.confidence * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EVIDENCE & EXPLAINABILITY */}
      {activeTab === "EVIDENCE" && explanation && (
        <div className="space-y-6">
          {/* Action Summary */}
          <div className="bg-[#F7F8F3] p-5 rounded-xl border border-[#DCE4DE] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#063C2F]">
              SYNTHESIZED EXPLANATION
            </span>
            <h4 className="text-xl font-extrabold text-[#101513] tracking-tight">{explanation.summaryText}</h4>
            <div className="text-xs text-[#101513] bg-white p-3 rounded-lg border border-[#DCE4DE] font-semibold">
              💡 Actionable Driver: {explanation.actionableDriver}
            </div>
          </div>

          {/* Primary Action Recommendation */}
          <div className="bg-[#DDF2E8] border border-[#16805F]/30 p-4 rounded-xl flex items-start gap-3">
            <div className="text-xl">📋</div>
            <div>
              <div className="text-xs font-extrabold text-[#063C2F] uppercase tracking-wider">
                Recommended Operator Action
              </div>
              <div className="text-sm font-bold text-[#063C2F] mt-0.5">
                {explanation.recommendation}
              </div>
            </div>
          </div>

          {/* Evidence Drilldown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#F7F8F3] p-4 rounded-xl border border-[#DCE4DE] space-y-3">
              <h5 className="text-xs font-extrabold text-[#101513] uppercase tracking-wider flex items-center gap-2">
                <span>📌</span> Primary Actionable Drivers
              </h5>
              <ul className="space-y-2">
                {explanation.primaryDrivers?.map((driver, i) => (
                  <li key={i} className="text-xs text-[#101513] font-semibold bg-white p-2.5 rounded-lg border border-[#DCE4DE] flex items-center gap-2">
                    <span className="text-[#063C2F] font-bold">•</span> {driver}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#F7F8F3] p-4 rounded-xl border border-[#DCE4DE] space-y-3">
              <h5 className="text-xs font-extrabold text-[#101513] uppercase tracking-wider flex items-center gap-2">
                <span>🔎</span> Multi-Modal Findings Log
              </h5>
              <ul className="space-y-2">
                {explanation.evidenceStatements?.map((stmt, i) => (
                  <li key={i} className="text-xs text-[#101513] font-semibold bg-white p-2.5 rounded-lg border border-[#DCE4DE] flex items-center gap-2">
                    <span className="text-[#063C2F] font-bold">✓</span> {stmt}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DECISION TRACE INSPECTOR */}
      {activeTab === "TRACE" && decisionTrace && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#F7F8F3] p-4 rounded-xl border border-[#DCE4DE]">
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#101513]">Decision Trace Log</h4>
              <p className="text-xs text-[#4E5B55] mt-0.5 font-medium">Machine-readable execution trace for auditability</p>
            </div>
            <button
              onClick={() => setShowTraceJson(!showTraceJson)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#063C2F] text-white cursor-pointer"
            >
              {showTraceJson ? "Show Formatted Step View" : "View Raw JSON"}
            </button>
          </div>

          {showTraceJson ? (
            <pre className="bg-[#F7F8F3] text-[#101513] p-4 rounded-xl text-xs overflow-x-auto max-h-96 border border-[#DCE4DE] font-semibold">
              {JSON.stringify(decisionTrace, null, 2)}
            </pre>
          ) : (
            <div className="space-y-3">
              <div className="bg-[#F7F8F3] p-4 rounded-xl border border-[#DCE4DE] space-y-2 text-xs font-semibold">
                <div className="flex justify-between border-b pb-2 border-[#DCE4DE]">
                  <span className="text-[#78837D]">Evaluation Timestamp:</span>
                  <span className="font-bold text-[#101513]">{decisionTrace.evaluationTimestamp}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-[#DCE4DE]">
                  <span className="text-[#78837D]">Batch ID:</span>
                  <span className="font-bold text-[#101513]">{decisionTrace.batchId}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-[#DCE4DE]">
                  <span className="text-[#78837D]">Fusion Base Weights:</span>
                  <span className="font-bold text-[#101513]">Sensor: 0.40 | Route: 0.25 | Vision: 0.35</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-[#DCE4DE]">
                  <span className="text-[#78837D]">Final Risk Score:</span>
                  <span className="font-bold text-[#DC2626]">{decisionTrace.finalRiskScore} / 100</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DIGITAL PASSPORT SUMMARY */}
      {activeTab === "PASSPORT" && passportSummary && (
        <div className="space-y-4">
          <div className="bg-[#F7F8F3] p-5 rounded-xl space-y-2 border border-[#DCE4DE]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#063C2F]">
                STEP 8 PASSPORT READY
              </span>
              <span className="text-xs bg-white px-2.5 py-1 rounded text-[#101513] border border-[#DCE4DE] font-bold">
                Schema: v1.0.0
              </span>
            </div>
            <h4 className="text-lg font-extrabold text-[#101513]">Standardized Digital Product Passport Summary</h4>
            <p className="text-xs text-[#4E5B55] font-medium">
              Export format prepared for Step 8 QR Code and Consumer Portal integration.
            </p>
          </div>

          <div className="bg-[#F7F8F3] p-4 rounded-xl border border-[#DCE4DE] text-xs space-y-3">
            <div className="grid grid-cols-2 gap-4 border-b pb-3 border-[#DCE4DE]">
              <div>
                <span className="text-[#78837D] text-[10px] font-bold block">BATCH CODE</span>
                <span className="font-bold text-[#101513]">{passportSummary.batchId}</span>
              </div>
              <div>
                <span className="text-[#78837D] text-[10px] font-bold block">PRODUCE ITEM</span>
                <span className="font-bold text-[#101513]">{passportSummary.produceType}</span>
              </div>
              <div>
                <span className="text-[#78837D] text-[10px] font-bold block">ORIGIN NODE</span>
                <span className="font-bold text-[#101513]">{passportSummary.originNode}</span>
              </div>
              <div>
                <span className="text-[#78837D] text-[10px] font-bold block">VERIFIED FRESHNESS</span>
                <span className="font-bold text-[#063C2F]">{passportSummary.freshnessIndex} / 100 ({passportSummary.freshnessRating})</span>
              </div>
            </div>

            <div>
              <span className="text-[#78837D] text-[10px] font-bold block mb-1">STAKEHOLDER RECOMMENDATION</span>
              <div className="bg-white p-3 rounded-lg border border-[#DCE4DE] text-xs text-[#101513] font-semibold leading-relaxed">
                {passportSummary.summaryStatement}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
