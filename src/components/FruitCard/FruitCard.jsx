import { useSensorData } from "../../context/SensorContext";

function FruitCard() {
  const { sensorData } = useSensorData();

  const inspection = sensorData.inspection;

  if (!inspection) {
    return (
      <div className="glass-card border border-slate-800/80 rounded-3xl p-6 bg-slate-900/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-80" />
        <h2 className="text-xl font-bold text-slate-100 mb-4 tracking-tight">Live Camera Feed</h2>

        <div className="h-56 flex items-center justify-center rounded-2xl border-2 border-dashed border-slate-800 bg-slate-950/60 text-slate-400 text-sm">
          Click <strong className="mx-1 text-slate-200">Inspect Batch</strong> to capture an image.
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card border border-slate-800/80 rounded-3xl p-6 bg-slate-900/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-80" />

      <h2 className="text-xl font-bold text-slate-100 mb-4 tracking-tight">
        Live Camera Feed
      </h2>

      <div className="relative rounded-2xl overflow-hidden mb-4 border border-slate-800 shadow-xl group">
        <img
          src={inspection.capture.image_url}
          alt="Captured Fruit"
          className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
          <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Batch ID</span>
          <span className="font-mono font-bold text-slate-200 bg-slate-950/80 px-2.5 py-0.5 rounded border border-slate-800 text-xs">
            {inspection.capture.batch_id}
          </span>
        </div>

        <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
          <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Fruit</span>
          <span className="font-bold text-slate-100 capitalize">
            {inspection.capture.fruit_type}
          </span>
        </div>

        <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
          <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Node</span>
          <span className="font-mono font-semibold text-blue-400 text-xs">
            {inspection.capture.node_id}
          </span>
        </div>

        <div className="flex justify-between items-center py-1.5">
          <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Captured At</span>
          <span className="font-mono text-slate-300 text-xs">
            {new Date(
              inspection.capture.timestamp
            ).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default FruitCard;