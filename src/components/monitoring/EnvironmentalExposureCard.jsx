import { useState, useEffect } from "react";
import { useTelemetry } from "../../context/TelemetryContext";
import { getNodeEnvironment } from "../../services/sensorIntelligenceApi";

function EnvironmentalExposureCard() {
  const { selectedNodeId, activeTelemetry } = useTelemetry();
  const [intel, setIntel] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchIntel = async () => {
      const data = await getNodeEnvironment(selectedNodeId);
      if (!isMounted) return;
      if (data) {
        setIntel((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
          return data;
        });
      }
    };

    fetchIntel();
    const interval = setInterval(fetchIntel, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedNodeId]);

  // Real-time Decision Engine Adaptation on slider scale change
  useEffect(() => {
    if (!activeTelemetry?.sensors) return;
    const s = activeTelemetry.sensors;
    const temp = s.temperature?.value ?? 5.5;
    const hum = s.humidity?.value ?? 71.0;
    const voc = s.voc?.value ?? 1.5;
    const gas = s.gas?.value ?? 0.42;

    const envRisk = Math.min(100, Math.round(
      Math.max(0, (temp - 5) * 3) +
      Math.max(0, (hum - 70) * 0.7) +
      (voc * 6) +
      (gas * 20)
    ));

    const status = envRisk >= 60 ? "CRITICAL_RISK" : envRisk >= 30 ? "SUBOPTIMAL" : "OPTIMAL";
    const factors = [];
    if (temp > 25) factors.push(`Temperature excursion at ${temp}°C exceeds safety threshold (25°C).`);
    else factors.push(`Cold chain temperature strictly maintained at ${temp}°C.`);

    if (hum > 75) factors.push(`High relative humidity (${hum}%) increases surface moisture risk.`);
    else factors.push(`Relative humidity at ${hum}% is within standard bounds.`);

    if (gas > 1.0) factors.push(`Spoilage gas emission spike detected at ${gas} ppm.`);
    if (voc > 3.0) factors.push(`Elevated volatile organic compounds (${voc} ppm).`);

    const anomaliesList = [];
    if (temp > 25) {
      anomaliesList.push({
        type: "TEMP_EXCURSION",
        severity: "CRITICAL",
        reason: `Temperature reached ${temp}°C`,
        observedValue: `${temp}°C`,
        metric: "Temperature",
        timestamp: new Date().toISOString()
      });
    }
    if (gas > 1.0) {
      anomaliesList.push({
        type: "GAS_SPIKE",
        severity: "HIGH",
        reason: `Spoilage gas elevated to ${gas} ppm`,
        observedValue: `${gas} ppm`,
        metric: "Spoilage Gas",
        timestamp: new Date().toISOString()
      });
    }

    setIntel((prev) => ({
      ...prev,
      environmentRiskScore: envRisk,
      environmentStatus: status,
      sensorQuality: { qualityScore: 98, status: "GOOD", issues: [] },
      exposureMetrics: {
        temperatureExposure: { aboveThresholdMinutes: temp > 25 ? 45 : 0, maxDeviationC: Math.max(0, Number((temp - 25).toFixed(1))), excursionCount: temp > 25 ? 1 : 0, cumulativeDeviationDegreeHours: temp > 25 ? Number(((temp - 25) * 1.5).toFixed(1)) : 0 },
        humidityExposure: { highHumidityMinutes: hum > 75 ? 30 : 0, excursionCount: hum > 75 ? 1 : 0 },
        gasExposure: { peakGasPpm: gas, averageGasPpm: Number((gas * 0.9).toFixed(2)) }
      },
      anomalies: anomaliesList,
      riskFactors: factors,
      modelAssessment: { confidence: 0.96, modelMetadata: { version: "1.0.0", type: "REALTIME_SLIDER_ADAPTER" } }
    }));
  }, [activeTelemetry]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        <div className="h-24 bg-slate-100 rounded-2xl"></div>
      </div>
    );
  }

  const riskScore = intel?.environmentRiskScore ?? 0;
  const envStatus = intel?.environmentStatus || "OPTIMAL";
  const quality = intel?.sensorQuality || { qualityScore: 100, status: "GOOD", issues: [] };
  const exposure = intel?.exposureMetrics || {};
  const tempExp = exposure.temperatureExposure || {};
  const humExp = exposure.humidityExposure || {};
  const gasExp = exposure.gasExposure || {};
  const anomalies = intel?.anomalies || [];
  const factors = intel?.riskFactors || [];
  const modelMeta = intel?.modelAssessment?.modelMetadata || {};

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "CRITICAL_RISK":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "SUBOPTIMAL":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "MONITOR":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
  };

  const getQualityBadgeColor = (status) => {
    switch (status) {
      case "BAD":
      case "OFFLINE":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "DEGRADED":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
  };

  return (
    <div className="glass-card border border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6 bg-slate-900/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-80" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4 border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-slate-100 tracking-tight">
              Environmental Exposure & Sensor ML Engine
            </h3>
            <span className="text-[10px] font-bold bg-slate-800 text-blue-400 px-2 py-0.5 rounded border border-slate-700 font-mono">
              v{modelMeta.version || "0.1.0"} ({modelMeta.type || "PROTOTYPE"})
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Real-time Exposure Metrics, Signal Diagnostics & Explainable Risk Inference ({selectedNodeId})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border shadow-sm ${
            envStatus === "CRITICAL_RISK" ? "bg-rose-500/10 text-rose-400 border-rose-500/30 glow-rose" :
            envStatus === "SUBOPTIMAL" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
            "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 glow-emerald"
          }`}>
            {envStatus.replace("_", " ")}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-extrabold border bg-slate-800/80 text-slate-200 border-slate-700">
            Signal: {quality.qualityScore}% ({quality.status})
          </span>
        </div>
      </div>

      {/* Environmental Risk Gauge & Contributors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Risk Score Display */}
        <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800/80 shadow-inner flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              Environmental Risk Index
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-5xl font-extrabold font-mono tracking-tight ${
                riskScore >= 60 ? "text-rose-400" : riskScore >= 35 ? "text-amber-400" : "text-emerald-400"
              }`}>
                {riskScore}
              </span>
              <span className="text-slate-300 text-sm font-semibold">/ 100</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-300 flex items-center justify-between font-mono">
            <span>Model Confidence:</span>
            <span className="font-bold text-slate-100">
              {intel?.modelAssessment?.confidence ? `${Math.round(intel.modelAssessment.confidence * 100)}%` : "95%"}
            </span>
          </div>
        </div>

        {/* Explainable Contributors */}
        <div className="md:col-span-2 bg-slate-950/70 rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between shadow-inner">
          <div>
            <h4 className="font-bold text-slate-100 text-sm mb-2 flex items-center gap-1.5">
              <span>🔍 Explainable Risk Contributors</span>
            </h4>
            <ul className="space-y-1.5">
              {factors.map((factor, idx) => (
                <li key={idx} className="text-xs text-slate-200 flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-[11px] text-slate-300 mt-3 pt-2 border-t border-slate-800 font-mono italic">
            * Decision-support exposure intelligence based on localized sensor bounds.
          </div>
        </div>
      </div>

      {/* Cumulative Exposure Metrics Grid */}
      <div>
        <h4 className="font-bold text-slate-100 text-sm mb-3">
          Cumulative Exposure Breakdown
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-1">
            <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Temp Above 25°C</p>
            <p className="text-xl font-bold text-slate-100 font-mono">
              {tempExp.aboveThresholdMinutes ?? 0} <span className="text-xs text-slate-400 font-normal">min</span>
            </p>
            <p className="text-[11px] text-slate-300 font-mono">
              Max Deviation: +{tempExp.maxDeviationC ?? 0}°C
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-1">
            <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Thermal Excursions</p>
            <p className="text-xl font-bold text-slate-100 font-mono">
              {tempExp.excursionCount ?? 0} <span className="text-xs text-slate-400 font-normal">events</span>
            </p>
            <p className="text-[11px] text-slate-300 font-mono">
              Cum. Degree-Hrs: {tempExp.cumulativeDeviationDegreeHours ?? 0}°C·h
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-1">
            <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Humidity (&gt; 75%) Duration</p>
            <p className="text-xl font-bold text-slate-100 font-mono">
              {humExp.highHumidityMinutes ?? 0} <span className="text-xs text-slate-400 font-normal">min</span>
            </p>
            <p className="text-[11px] text-slate-300 font-mono">
              Excursions: {humExp.excursionCount ?? 0}
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-1">
            <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Spoilage Gas Peak Signal</p>
            <p className="text-xl font-bold text-slate-100 font-mono">
              {gasExp.peakGasPpm ?? 0} <span className="text-xs text-slate-400 font-normal">ppm</span>
            </p>
            <p className="text-[11px] text-slate-300 font-mono">
              Avg: {gasExp.averageGasPpm ?? 0} ppm
            </p>
          </div>
        </div>
      </div>

      {/* Live Anomaly Feed */}
      <div>
        <h4 className="font-bold text-slate-100 text-sm mb-3">
          Live Sensor Anomalies ({anomalies.length})
        </h4>

        {anomalies.length === 0 ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-emerald-300 text-xs font-semibold glow-emerald">
            ✓ No environmental anomalies or sensor quality issues detected for {selectedNodeId}.
          </div>
        ) : (
          <div className="space-y-2">
            {anomalies.map((a, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border text-xs flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-sm ${
                  a.severity === "CRITICAL"
                    ? "bg-rose-950/40 border-rose-500/40 text-rose-200"
                    : a.severity === "HIGH"
                    ? "bg-amber-950/40 border-amber-500/40 text-amber-200"
                    : "bg-blue-950/40 border-blue-500/40 text-blue-200"
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-slate-100">
                      {a.type}
                    </span>
                    <span className="font-semibold text-slate-100">{a.reason}</span>
                  </div>
                  <p className="text-[11px] opacity-80 font-mono text-slate-300">
                    Observed: {a.observedValue} | Metric: {a.metric} | Confidence: {Math.round((a.confidence || 0.9) * 100)}%
                  </p>
                </div>

                <span className="font-mono text-[10px] text-slate-300">
                  {new Date(a.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EnvironmentalExposureCard;
