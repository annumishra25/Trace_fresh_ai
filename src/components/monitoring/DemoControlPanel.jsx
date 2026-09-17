import { useSensorData } from "../../context/SensorContext";
import {
  Thermometer,
  Droplets,
  Wind,
  Zap,
  Scale,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Camera,
  Layers,
} from "lucide-react";

function DemoControlPanel() {
  const {
    demoSensors,
    updateDemoSensor,
    setDemoPreset,
    resetDemoSensors,
    sensorData,
    inspectBatch,
  } = useSensorData();

  const getTempColor = (val) => {
    if (val <= 8) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (val <= 25) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  const getHumColor = (val) => {
    if (val >= 75 && val <= 92) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (val >= 60 && val < 75) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  const getVocColor = (val) => {
    if (val <= 150) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (val <= 200) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  const getEthColor = (val) => {
    if (val <= 0.2) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (val <= 0.4) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  const getStatusBadge = (status) => {
    if (status === "SAFE" || status === "EXCELLENT" || status === "VERIFIED FRESH") {
      return {
        bg: "bg-emerald-500",
        text: "text-emerald-700",
        pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: <CheckCircle2 size={18} className="text-emerald-600" />,
      };
    }
    if (status === "WARNING") {
      return {
        bg: "bg-amber-500",
        text: "text-amber-700",
        pill: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <AlertTriangle size={18} className="text-amber-600" />,
      };
    }
    return {
      bg: "bg-rose-500",
      text: "text-rose-700",
      pill: "bg-rose-50 text-rose-700 border-rose-200",
      icon: <XCircle size={18} className="text-rose-600" />,
    };
  };

  const statusBadge = getStatusBadge(sensorData.status);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-indigo-900/50 space-y-6 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Panel Header */}
      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
              <Sparkles size={14} className="text-purple-400" />
              Demo Simulation Sandbox
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Live AI Recalculation Active
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Manual Sensor Slider Controls
          </h2>

          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Drag the sliders below to vary environmental sensor parameters. TraceFresh AI will instantly recalculate Health Score, Spoilage Risk %, Shelf Life, and Quality Advisories.
          </p>
        </div>

        {/* Quick Presets Toolbar */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-800/80 backdrop-blur-md p-2 rounded-2xl border border-slate-700/60">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
            Presets:
          </span>

          <button
            onClick={() => setDemoPreset("OPTIMAL")}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900 transition-all flex items-center gap-1.5 shadow-sm"
          >
            🟢 Optimal (Fresh)
          </button>

          <button
            onClick={() => setDemoPreset("THERMAL_EXCURSION")}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-700/50 hover:bg-amber-900 transition-all flex items-center gap-1.5 shadow-sm"
          >
            🟡 High Temp (33.5°C)
          </button>

          <button
            onClick={() => setDemoPreset("VOC_SPOILAGE")}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-950/80 text-orange-300 border border-orange-700/50 hover:bg-orange-900 transition-all flex items-center gap-1.5 shadow-sm"
          >
            🟠 High VOC Gas
          </button>

          <button
            onClick={() => setDemoPreset("CRITICAL_ROT")}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-700/50 hover:bg-rose-900 transition-all flex items-center gap-1.5 shadow-sm"
          >
            🔴 Critical Rot Hazard
          </button>

          <button
            onClick={resetDemoSensors}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
            title="Reset Sliders to Default"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* 6 Sliders Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* 1. Temperature Slider */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 space-y-3 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <Thermometer size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200 text-sm">Temperature</h3>
                <p className="text-xs text-slate-400">Cold Chain Target: 2–8°C</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-xl text-sm font-bold border ${getTempColor(demoSensors.temperature)}`}>
              {Number(demoSensors.temperature).toFixed(1)} °C
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="50"
            step="0.5"
            value={demoSensors.temperature}
            onChange={(e) => updateDemoSensor("temperature", e.target.value)}
            className="w-full accent-orange-500 bg-slate-700 h-2 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>0.0°C (Freezing)</span>
            <span className="text-emerald-400 font-bold">2-8°C (Optimal)</span>
            <span>50.0°C (Extreme)</span>
          </div>
        </div>

        {/* 2. Humidity Slider */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 space-y-3 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Droplets size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200 text-sm">Relative Humidity</h3>
                <p className="text-xs text-slate-400">Optimal Range: 80–90%</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-xl text-sm font-bold border ${getHumColor(demoSensors.humidity)}`}>
              {Number(demoSensors.humidity).toFixed(1)} %
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={demoSensors.humidity}
            onChange={(e) => updateDemoSensor("humidity", e.target.value)}
            className="w-full accent-blue-500 bg-slate-700 h-2 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>0% (Dry)</span>
            <span className="text-emerald-400 font-bold">80-90% (Ideal)</span>
            <span>100% (Sat.)</span>
          </div>
        </div>

        {/* 3. VOC Gas Slider */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 space-y-3 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Wind size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200 text-sm">VOC Organic Gas (MQ135)</h3>
                <p className="text-xs text-slate-400">Normal Range: &lt;150 ppm</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-xl text-sm font-bold border ${getVocColor(demoSensors.voc)}`}>
              {Math.round(demoSensors.voc)} ppm
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="600"
            step="5"
            value={demoSensors.voc}
            onChange={(e) => updateDemoSensor("voc", e.target.value)}
            className="w-full accent-purple-500 bg-slate-700 h-2 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>0 ppm (Clean)</span>
            <span className="text-amber-400 font-semibold">&gt;200 ppm (Decay)</span>
            <span>600 ppm (Critical)</span>
          </div>
        </div>

        {/* 4. Ethylene Gas Slider */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 space-y-3 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Zap size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200 text-sm">Ethylene Gas (C₂H₄)</h3>
                <p className="text-xs text-slate-400">Ripening Gas (&lt;0.20 ppm)</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-xl text-sm font-bold border ${getEthColor(demoSensors.ethylene)}`}>
              {Number(demoSensors.ethylene).toFixed(2)} ppm
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="3"
            step="0.05"
            value={demoSensors.ethylene}
            onChange={(e) => updateDemoSensor("ethylene", e.target.value)}
            className="w-full accent-emerald-500 bg-slate-700 h-2 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>0.00 ppm</span>
            <span className="text-rose-400 font-semibold">&gt;0.40 ppm (Senescence)</span>
            <span>3.00 ppm</span>
          </div>
        </div>

        {/* 5. CO2 Concentration Slider */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 space-y-3 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200 text-sm">CO₂ Concentration</h3>
                <p className="text-xs text-slate-400">Respiration (&lt;500 ppm)</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-xl text-sm font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {Math.round(demoSensors.co2)} ppm
            </span>
          </div>

          <input
            type="range"
            min="300"
            max="2500"
            step="25"
            value={demoSensors.co2}
            onChange={(e) => updateDemoSensor("co2", e.target.value)}
            className="w-full accent-cyan-500 bg-slate-700 h-2 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>300 ppm (Fresh Air)</span>
            <span className="text-amber-400 font-semibold">&gt;500 ppm (Elevated)</span>
            <span>2500 ppm</span>
          </div>
        </div>

        {/* 6. Produce Weight Slider */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 space-y-3 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                <Scale size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200 text-sm">Sample Weight</h3>
                <p className="text-xs text-slate-400">Produce Mass Tracking</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-xl text-sm font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
              {Number(demoSensors.weight).toFixed(1)} g
            </span>
          </div>

          <input
            type="range"
            min="50"
            max="500"
            step="2.5"
            value={demoSensors.weight}
            onChange={(e) => updateDemoSensor("weight", e.target.value)}
            className="w-full accent-yellow-500 bg-slate-700 h-2 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>50.0 g (Light)</span>
            <span className="text-slate-300">250.0 g (Std)</span>
            <span>500.0 g (Heavy)</span>
          </div>
        </div>
      </div>

      {/* Dynamic AI Analysis Feedback Dashboard */}
      <div className="relative z-10 bg-slate-800/90 rounded-2xl p-6 border border-slate-700/80 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Dynamic AI Intelligence Output</h3>
              <p className="text-xs text-slate-400">Recalculated in real time based on active manual slider inputs</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-xl text-sm font-bold border flex items-center gap-2 ${statusBadge.pill}`}>
              {statusBadge.icon}
              <span>AI Assessment: {sensorData.status}</span>
            </span>

            <button
              onClick={() => inspectBatch()}
              disabled={sensorData.inspecting}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Camera size={16} />
              <span>{sensorData.inspecting ? "Scanning..." : "Inspect Camera Image"}</span>
            </button>
          </div>
        </div>

        {/* Calculated Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50">
            <p className="text-xs text-slate-400 font-medium">Health Score</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-3xl font-extrabold ${sensorData.healthScore >= 85 ? "text-emerald-400" : sensorData.healthScore >= 60 ? "text-amber-400" : "text-rose-400"}`}>
                {Number(sensorData.healthScore).toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${sensorData.healthScore >= 85 ? "bg-emerald-500" : sensorData.healthScore >= 60 ? "bg-amber-500" : "bg-rose-500"}`}
                style={{ width: `${Math.max(0, Math.min(100, sensorData.healthScore))}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50">
            <p className="text-xs text-slate-400 font-medium">Spoilage Risk</p>
            <p className={`text-3xl font-extrabold mt-1 ${sensorData.spoilageRisk <= 15 ? "text-emerald-400" : sensorData.spoilageRisk <= 40 ? "text-amber-400" : "text-rose-400"}`}>
              {Number(sensorData.spoilageRisk).toFixed(1)}%
            </p>
            <p className="text-[11px] text-slate-400 mt-2 font-mono">Risk: {sensorData.riskLevel}</p>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50">
            <p className="text-xs text-slate-400 font-medium">Est. Shelf Life</p>
            <p className="text-3xl font-extrabold text-cyan-400 mt-1">
              {Number(sensorData.shelfLife).toFixed(1)} Days
            </p>
            <p className="text-[11px] text-slate-400 mt-2">Remaining fresh duration</p>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50">
            <p className="text-xs text-slate-400 font-medium">Excursions Detected</p>
            <p className={`text-3xl font-extrabold mt-1 ${(sensorData.thresholdExcursions?.length || 0) === 0 ? "text-emerald-400" : "text-amber-400"}`}>
              {sensorData.thresholdExcursions?.length || 0}
            </p>
            <p className="text-[11px] text-slate-400 mt-2 font-mono">Alert triggers</p>
          </div>
        </div>

        {/* Reason Codes / Explanations generated by AI */}
        {sensorData.reasons && sensorData.reasons.length > 0 && (
          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/50 space-y-2">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              AI Multi-Modal Reasoning &amp; Advisory Notes:
            </p>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-2">
              {sensorData.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="text-purple-400 font-bold mt-0.5">•</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DemoControlPanel;
