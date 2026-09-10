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
    <div className="glass-card border border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6 bg-slate-900/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 opacity-80" />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-2xl font-black text-slate-100 tracking-tight">
              Multi-Modal Fusion & Explainable Freshness Engine
            </h3>
            <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/30">
              STEP 7 ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Real-time weighted multi-signal decision support engine (Batch: <span className="font-mono font-bold text-slate-100">{batchId}</span> | Node: <span className="font-semibold text-slate-100">{selectedNodeId}</span>)
          </p>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center gap-3 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 shadow-inner">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-300">Fusion Confidence</div>
            <div className="text-base font-extrabold text-slate-100 font-mono">
              {(confidence.overallConfidence * 100).toFixed(1)}%
              <span className={`ml-1 text-[11px] font-bold ${confidence.rating === 'HIGH' ? 'text-emerald-400' : confidence.rating === 'MODERATE' ? 'text-amber-400' : 'text-rose-400'}`}>
                ({confidence.rating})
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-200 font-bold text-xs">
            {confidence.rating === 'HIGH' ? '🛡️' : confidence.rating === 'MODERATE' ? '⚡' : '⚠️'}
          </div>
        </div>
      </div>

      {/* Demo Scenario Selector */}
      <div className="bg-slate-950/70 rounded-2xl p-4 border border-slate-800/80 space-y-3 shadow-inner">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
            <span>🧪</span> DEMO SCENARIO EVALUATOR
          </span>
          <span className="text-[11px] text-slate-300 font-mono">Select scenario to trigger multi-modal fusion</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {demoScenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => handleRunDemo(sc.id)}
              disabled={loading}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer shadow-sm ${
                activeScenario === sc.id
                  ? "bg-blue-600 text-white border-blue-500 glow-blue shadow-md"
                  : "bg-slate-900 text-slate-200 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80"
              }`}
            >
              <div className="text-xs font-bold truncate">{sc.label}</div>
              <div className={`text-[10px] truncate ${activeScenario === sc.id ? "text-slate-100" : "text-slate-300"}`}>
                {sc.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("OVERVIEW")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "OVERVIEW"
              ? "bg-blue-600 text-white shadow-md glow-blue"
              : "text-slate-300 hover:text-white hover:bg-slate-800/80"
          }`}
        >
          📊 Condition & Freshness Overview
        </button>
        <button
          onClick={() => setActiveTab("EVIDENCE")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "EVIDENCE"
              ? "bg-blue-600 text-white shadow-md glow-blue"
              : "text-slate-300 hover:text-white hover:bg-slate-800/80"
          }`}
        >
          🔍 Evidence & Explainability
        </button>
        <button
          onClick={() => setActiveTab("TRACE")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "TRACE"
              ? "bg-blue-600 text-white shadow-md glow-blue"
              : "text-slate-300 hover:text-white hover:bg-slate-800/80"
          }`}
        >
          ⚙️ Decision Trace Inspector
        </button>
        <button
          onClick={() => setActiveTab("PASSPORT")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "PASSPORT"
              ? "bg-blue-600 text-white shadow-md glow-blue"
              : "text-slate-300 hover:text-white hover:bg-slate-800/80"
          }`}
        >
          📦 Digital Passport Summary
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-6">
          {/* Main Status Banner */}
          <div className={`${statusBadge.bg} p-5 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all border border-white/10`}>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-black/30 px-2.5 py-1 rounded-md text-white">
                EVALUATION RESULT
              </span>
              <h4 className="text-2xl font-black mt-1 text-white tracking-tight">{statusBadge.text}</h4>
              <p className="text-xs text-white/90 mt-0.5 font-medium">{statusBadge.desc}</p>
            </div>
            <div className="bg-slate-950/40 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-200">Composite Risk Score</div>
              <div className="text-3xl font-black text-white font-mono">{overallRiskScore} <span className="text-xs font-normal">/ 100</span></div>
            </div>
          </div>

          {/* Freshness Index & Estimated Shelf-Life Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Freshness Card */}
            <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80 space-y-4 shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Prototype Freshness Index</div>
                  <div className="text-3xl font-black text-slate-100 mt-1 font-mono">
                    {freshnessIndex.score} <span className="text-sm font-semibold text-slate-400">/ 100</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-extrabold border shadow-sm ${
                  freshnessIndex.score >= 70 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 glow-emerald' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {freshnessIndex.rating}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(100 - freshnessIndex.score)}`}
                    style={{ width: `${freshnessIndex.score}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-300 font-mono">
                  <span>0 (CRITICAL)</span>
                  <span>50 (FAIR)</span>
                  <span>100 (EXCELLENT)</span>
                </div>
              </div>
            </div>

            {/* Shelf-Life Card */}
            <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80 space-y-4 shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Estimated Shelf Life</div>
                  <div className="text-3xl font-black text-slate-100 mt-1 font-mono">
                    {estimatedShelfLife.remainingDays} <span className="text-sm font-semibold text-slate-400">Days</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30">
                    NON-GUARANTEED ESTIMATE
                  </span>
                  <div className="text-xs font-mono text-slate-300 mt-1">
                    Range: {estimatedShelfLife.minDays} - {estimatedShelfLife.maxDays} days
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-200 bg-slate-900/90 p-3 rounded-xl border border-slate-800 font-sans leading-relaxed">
                {estimatedShelfLife.disclaimer}
              </div>
            </div>
          </div>

          {/* Component Risk Breakdown (0-100) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">
                Multi-Modal Component Risk Breakdown
              </h4>
              <span className="text-xs text-slate-300">Sum of Weighted Signals + Cross-Interactions</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sensor Risk Card */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 shadow-inner space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌡️</span>
                    <div>
                      <div className="text-xs font-extrabold text-slate-100">Sensor Risk</div>
                      <div className="text-[10px] text-slate-300 font-mono">Weight: 40%</div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black border font-mono ${getRiskColor(componentRisks.sensorRisk.score)}`}>
                    {componentRisks.sensorRisk.score} / 100
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full ${getProgressColor(componentRisks.sensorRisk.score)}`}
                    style={{ width: `${componentRisks.sensorRisk.score}%` }}
                  ></div>
                </div>
                <div className="text-[11px] text-slate-300 font-mono bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                  Rating: <span className="font-bold text-slate-100">{componentRisks.sensorRisk.rating}</span> | Conf: {(componentRisks.sensorRisk.confidence * 100).toFixed(0)}%
                </div>
              </div>

              {/* Route Risk Card */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 shadow-inner space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🚛</span>
                    <div>
                      <div className="text-xs font-extrabold text-slate-100">Route Risk</div>
                      <div className="text-[10px] text-slate-300 font-mono">Weight: 25%</div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black border font-mono ${getRiskColor(componentRisks.routeRisk.score)}`}>
                    {componentRisks.routeRisk.score} / 100
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full ${getProgressColor(componentRisks.routeRisk.score)}`}
                    style={{ width: `${componentRisks.routeRisk.score}%` }}
                  ></div>
                </div>
                <div className="text-[11px] text-slate-300 font-mono bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                  Rating: <span className="font-bold text-slate-100">{componentRisks.routeRisk.rating}</span> | Conf: {(componentRisks.routeRisk.confidence * 100).toFixed(0)}%
                </div>
              </div>

              {/* Visual Risk Card */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 shadow-inner space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📷</span>
                    <div>
                      <div className="text-xs font-extrabold text-slate-100">Visual Risk</div>
                      <div className="text-[10px] text-slate-300 font-mono">Weight: 35%</div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black border font-mono ${getRiskColor(componentRisks.visualRisk.score)}`}>
                    {componentRisks.visualRisk.score} / 100
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full ${getProgressColor(componentRisks.visualRisk.score)}`}
                    style={{ width: `${componentRisks.visualRisk.score}%` }}
                  ></div>
                </div>
                <div className="text-[11px] text-slate-300 font-mono bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                  Rating: <span className="font-bold text-slate-100">{componentRisks.visualRisk.rating}</span> | Conf: {(componentRisks.visualRisk.confidence * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>

          {/* Cross-Signal Interaction Badges */}
          {crossSignalInteractions && crossSignalInteractions.activeRules?.length > 0 && (
            <div className="bg-amber-500/10 rounded-2xl p-4 border border-amber-500/30 space-y-2">
              <div className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <span>💥</span> Active Cross-Signal Interaction Multipliers
              </div>
              <div className="flex flex-wrap gap-2">
                {crossSignalInteractions.activeRules.map((rule, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-200 border border-amber-500/40"
                  >
                    <span>⚡</span> {rule.rule} (Multiplier: x{rule.multiplier})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EVIDENCE & EXPLAINABILITY */}
      {activeTab === "EVIDENCE" && explanation && (
        <div className="space-y-6">
          {/* Action Summary */}
          <div className="bg-slate-950/80 text-white p-5 rounded-2xl border border-slate-800 space-y-2 shadow-inner">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
              SYNTHESIZED EXPLANATION
            </span>
            <h4 className="text-xl font-bold tracking-tight">{explanation.summaryText}</h4>
            <div className="text-xs text-slate-200 bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono">
              💡 Actionable Driver: {explanation.actionableDriver}
            </div>
          </div>

          {/* Primary Action Recommendation */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-start gap-3 glow-emerald">
            <div className="text-2xl">📋</div>
            <div>
              <div className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                Recommended Operator Action
              </div>
              <div className="text-sm font-bold text-slate-100 mt-0.5">
                {explanation.recommendation}
              </div>
            </div>
          </div>

          {/* Evidence Drilldown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-3 shadow-inner">
              <h5 className="text-xs font-extrabold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <span>📌</span> Primary Actionable Drivers
              </h5>
              <ul className="space-y-2">
                {explanation.primaryDrivers?.map((driver, i) => (
                  <li key={i} className="text-xs text-slate-200 bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                    <span className="text-amber-400 font-bold">•</span> {driver}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-3 shadow-inner">
              <h5 className="text-xs font-extrabold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <span>🔎</span> Multi-Modal Findings Log
              </h5>
              <ul className="space-y-2">
                {explanation.evidenceStatements?.map((stmt, i) => (
                  <li key={i} className="text-xs text-slate-200 bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                    <span className="text-blue-400 font-bold">✓</span> {stmt}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Confidence Penalty Details */}
          {confidencePenalties && confidencePenalties.appliedPenalties?.length > 0 && (
            <div className="bg-rose-500/10 p-4 rounded-2xl border border-rose-500/30 space-y-2">
              <div className="text-xs font-extrabold text-rose-300 uppercase tracking-wider flex items-center gap-2">
                <span>⚠️</span> Applied Confidence Penalties
              </div>
              <ul className="space-y-1">
                {confidencePenalties.appliedPenalties.map((pen, idx) => (
                  <li key={idx} className="text-xs text-rose-200 flex items-center justify-between font-mono bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span>{pen.reason}</span>
                    <span className="font-bold text-rose-400">Multiplier: x{pen.multiplier}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DECISION TRACE INSPECTOR */}
      {activeTab === "TRACE" && decisionTrace && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-100">Decision Trace Log</h4>
              <p className="text-xs text-slate-300 mt-0.5">Machine-readable execution trace for auditability</p>
            </div>
            <button
              onClick={() => setShowTraceJson(!showTraceJson)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              {showTraceJson ? "Show Formatted Step View" : "View Raw JSON"}
            </button>
          </div>

          {showTraceJson ? (
            <pre className="bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-96 border border-slate-800">
              {JSON.stringify(decisionTrace, null, 2)}
            </pre>
          ) : (
            <div className="space-y-3">
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-2 font-mono text-xs shadow-inner">
                <div className="flex justify-between border-b pb-2 border-slate-800">
                  <span className="text-slate-300">Evaluation Timestamp:</span>
                  <span className="font-bold text-slate-100">{decisionTrace.evaluationTimestamp}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-slate-800">
                  <span className="text-slate-300">Batch ID:</span>
                  <span className="font-bold text-slate-100">{decisionTrace.batchId}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-slate-800">
                  <span className="text-slate-300">Fusion Base Weights:</span>
                  <span className="font-bold text-slate-100">Sensor: 0.40 | Route: 0.25 | Vision: 0.35</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-slate-800">
                  <span className="text-slate-300">Base Risk (Weighted):</span>
                  <span className="font-bold text-slate-100">{decisionTrace.baseWeightedRisk?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-slate-800">
                  <span className="text-slate-300">Interaction Multiplier:</span>
                  <span className="font-bold text-slate-100">x{decisionTrace.interactionMultiplier?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-slate-800">
                  <span className="text-slate-300">Final Risk Score:</span>
                  <span className="font-bold text-rose-400">{decisionTrace.finalRiskScore} / 100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Conflict Tag:</span>
                  <span className="font-bold text-purple-400">{decisionTrace.conflictResolution?.conflictDetected ? "YES (SIGNAL CONFLICT)" : "NONE"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DIGITAL PASSPORT SUMMARY */}
      {activeTab === "PASSPORT" && passportSummary && (
        <div className="space-y-4">
          <div className="bg-slate-950 p-5 rounded-2xl space-y-2 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                STEP 8 PASSPORT READY
              </span>
              <span className="text-xs font-mono bg-slate-800 px-2.5 py-1 rounded text-slate-300 border border-slate-700">
                Schema: v1.0.0
              </span>
            </div>
            <h4 className="text-lg font-bold text-slate-100">Standardized Digital Product Passport Summary</h4>
            <p className="text-xs text-slate-300">
              Export format prepared for Step 8 QR Code and Consumer Portal integration.
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 font-mono text-xs space-y-3 shadow-inner">
            <div className="grid grid-cols-2 gap-4 border-b pb-3 border-slate-800">
              <div>
                <span className="text-slate-300 text-[10px] block">BATCH CODE</span>
                <span className="font-bold text-slate-100">{passportSummary.batchId}</span>
              </div>
              <div>
                <span className="text-slate-300 text-[10px] block">PRODUCE ITEM</span>
                <span className="font-bold text-slate-100">{passportSummary.produceType}</span>
              </div>
              <div>
                <span className="text-slate-300 text-[10px] block">ORIGIN NODE</span>
                <span className="font-bold text-slate-100">{passportSummary.originNode}</span>
              </div>
              <div>
                <span className="text-slate-300 text-[10px] block">VERIFIED FRESHNESS</span>
                <span className="font-bold text-emerald-400">{passportSummary.freshnessIndex} / 100 ({passportSummary.freshnessRating})</span>
              </div>
            </div>

            <div>
              <span className="text-slate-300 text-[10px] block mb-1">STAKEHOLDER RECOMMENDATION</span>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-sans text-xs text-slate-100 leading-relaxed">
                {passportSummary.summaryStatement}
              </div>
            </div>

            <pre className="bg-slate-950 text-sky-400 p-4 rounded-2xl overflow-x-auto max-h-64 border border-slate-800">
              {JSON.stringify(passportSummary, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
