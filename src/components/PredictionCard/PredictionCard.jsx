import { useState } from "react";
import { Sparkles, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { useSensorData } from "../../context/SensorContext";
import { useTelemetry } from "../../context/TelemetryContext";

function PredictionCard() {
  const { sensorData, inspectBatch } = useSensorData();
  const { selectedNodeId } = useTelemetry();
  const [isRunningScan, setIsRunningScan] = useState(false);

  const inspection = sensorData?.inspection;

  // Defaults matching the reference dashboard
  const predictionClass = inspection?.prediction || inspection?.classification?.class || "freshoranges";
  const confidence = inspection?.confidence || 91.25;
  const fruitType = sensorData?.fruitType || inspection?.capture?.fruit_type || "Orange";
  const batchId = sensorData?.batchId || inspection?.capture?.batch_id || "TF-APL-2026-001";
  const scanTime = inspection?.capture?.timestamp
    ? new Date(inspection.capture.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "1:10:43 PM";

  const isFresh = !predictionClass.toLowerCase().includes("rotten");

  const qualityAssessment = inspection?.qualityAssessment || (
    sensorData?.temperature > 25
      ? "WARNING (THERMAL EXCURSION)"
      : isFresh
      ? "OPTIMAL / FRESH (HIGH GRADE)"
      : "CRITICAL (SPOILAGE RISK)"
  );

  // Class probabilities breakdown
  const probabilities = inspection?.probabilities || {
    freshapples: 1.8,
    freshbanana: 1.8,
    freshoranges: Number(confidence.toFixed(1)),
    rottenapples: 1.8,
    rottenbanana: 1.2,
    rottenoranges: 0.8
  };

  const handleRunAiScan = async () => {
    setIsRunningScan(true);
    if (inspectBatch) {
      await inspectBatch();
    }
    setTimeout(() => {
      setIsRunningScan(false);
    }, 600);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
      <div>
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>AI Vision Prediction</span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono font-medium mt-0.5">
              TensorFlow & Vision Pixel Classifier
            </p>
          </div>

          <button
            onClick={handleRunAiScan}
            disabled={isRunningScan}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs shadow-purple-500/20 transition-all cursor-pointer"
          >
            {isRunningScan ? <RefreshCw size={13} className="animate-spin" /> : <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>}
            <span>Run AI Scan</span>
          </button>
        </div>

        {/* Prediction Class Pill */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prediction Class</span>
          <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
            {predictionClass}
          </span>
        </div>

        {/* Model Accuracy & Confidence Metric & Progress Bar */}
        <div className="py-3 border-b border-slate-100 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-500 uppercase tracking-wider">Accuracy / Model Confidence</span>
            <span className="font-mono font-black text-emerald-600 text-sm">{Number(confidence).toFixed(2)}%</span>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFresh ? "bg-emerald-500" : "bg-rose-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, confidence))}%` }}
            ></div>
          </div>
        </div>

        {/* Top Probability Breakdown Grid */}
        <div className="py-3 border-b border-slate-100">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Top Probability Breakdown
          </span>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-medium">
            {Object.entries(probabilities).slice(0, 4).map(([cls, prob]) => (
              <div key={cls} className="flex items-center justify-between bg-slate-50/70 px-2.5 py-1 rounded-lg border border-slate-100">
                <span className="text-slate-600 capitalize text-[11px] font-semibold truncate">{cls}</span>
                <span className={`font-mono font-bold text-[11px] ${cls === predictionClass ? "text-emerald-600 font-black" : "text-slate-500"}`}>
                  {typeof prob === "number" ? prob.toFixed(1) : prob}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Information Attributes */}
        <div className="space-y-2 py-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Fruit Type</span>
            <span className="font-bold text-slate-900 capitalize">{fruitType}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Batch ID</span>
            <span className="font-mono font-bold text-slate-900">{batchId}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Scan Time</span>
            <span className="font-mono font-semibold text-slate-700">{scanTime}</span>
          </div>
        </div>
      </div>

      {/* Quality Assessment Footer Badge */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">Quality Assessment:</span>
        <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${
          qualityAssessment.includes("WARNING")
            ? "bg-amber-50 text-amber-800 border-amber-200"
            : qualityAssessment.includes("CRITICAL")
            ? "bg-rose-50 text-rose-800 border-rose-200"
            : "bg-emerald-50 text-emerald-800 border-emerald-200"
        }`}>
          {qualityAssessment}
        </span>
      </div>
    </div>
  );
}

export default PredictionCard;