import { useSensorData } from "../../context/SensorContext";

function PredictionCard() {
  const { sensorData } = useSensorData();

  const inspection = sensorData.inspection;

  if (!inspection) {
    return (
      <div className="glass-card border border-slate-800/80 rounded-3xl p-6 bg-slate-900/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-80" />
        <h2 className="text-xl font-bold text-slate-100 mb-4 tracking-tight">AI Prediction</h2>

        <div className="h-40 flex items-center justify-center rounded-2xl border-2 border-dashed border-slate-800 bg-slate-950/60 text-slate-400 text-sm">
          Click <strong className="mx-1 text-slate-200">Inspect Batch</strong> to run AI analysis.
        </div>
      </div>
    );
  }

  const prediction = inspection.prediction;
  const confidence = inspection.confidence;
  const isFresh = prediction.toLowerCase().includes("fresh");

  return (
    <div className="glass-card border border-slate-800/80 rounded-3xl p-6 bg-slate-900/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-80" />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">
          AI Prediction
        </h2>

        <span
          className={`text-xs font-black px-3 py-1 rounded-full border shadow-md uppercase tracking-wider ${
            isFresh
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 glow-emerald"
              : "bg-rose-500/10 text-rose-400 border-rose-500/30 glow-rose"
          }`}
        >
          {isFresh ? "FRESH" : "ROTTEN"}
        </span>
      </div>

      <div className="space-y-3">
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Classification</span>
          <span className="text-base font-extrabold text-slate-100 font-mono">{prediction}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block">Confidence</span>
            <span className="text-lg font-bold text-blue-400 font-mono mt-0.5 block">{confidence.toFixed(2)}%</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block">Fruit Type</span>
            <span className="text-lg font-bold text-slate-200 capitalize mt-0.5 block">{sensorData.fruitType}</span>
          </div>
        </div>

        <div className="space-y-2 text-xs pt-2">
          <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Batch ID</span>
            <span className="font-mono text-slate-200 font-semibold">{sensorData.batchId}</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400">Captured At</span>
            <span className="font-mono text-slate-300">{inspection.capture.timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PredictionCard;