import { useSensorData } from "../../context/SensorContext";

function PredictivePanel() {
  const { sensorData } = useSensorData();

  const currentShelfLife = sensorData?.shelfLife || 9;
  const healthScore = sensorData?.healthScore || 94;

  const futureShelfLife = Math.max(0, currentShelfLife - 1.2);
  const degradationRate = ((100 - healthScore) / 10).toFixed(2);
  const estimatedSpoilageDate = new Date(
    Date.now() + futureShelfLife * 24 * 60 * 60 * 1000
  ).toLocaleDateString();

  return (
    <div className="glass-card bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl">
      <h2 className="text-2xl font-black text-slate-100 tracking-tight">
        Predictive Quality & Spoilage Intelligence
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
          <p className="text-slate-300 text-xs font-bold uppercase tracking-wider">
            Current Shelf Life
          </p>
          <p className="text-3xl font-black text-emerald-400 font-mono mt-1">
            {currentShelfLife} Days
          </p>
        </div>

        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
          <p className="text-slate-300 text-xs font-bold uppercase tracking-wider">
            Predicted (24h Outlook)
          </p>
          <p className="text-3xl font-black text-amber-400 font-mono mt-1">
            {futureShelfLife.toFixed(1)} Days
          </p>
        </div>

        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
          <p className="text-slate-300 text-xs font-bold uppercase tracking-wider">
            Degradation Rate
          </p>
          <p className="text-3xl font-black text-rose-400 font-mono mt-1">
            {degradationRate} / day
          </p>
        </div>

        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
          <p className="text-slate-300 text-xs font-bold uppercase tracking-wider">
            Estimated Spoilage Date
          </p>
          <p className="text-xl font-black text-cyan-300 font-mono mt-2">
            {estimatedSpoilageDate}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PredictivePanel;