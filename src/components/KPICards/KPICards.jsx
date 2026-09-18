import { useSensorData } from "../../context/SensorContext";
import { useTelemetry } from "../../context/TelemetryContext";
import { Activity, Calendar, Flame, Radio } from "lucide-react";

function KPICards() {
  const { sensorData } = useSensorData();
  const { activeNode } = useTelemetry();

  const spoilageRisk = Math.max(
    0,
    100 - (sensorData.healthScore || 94)
  );

  const shelfLife = Math.max(
    1,
    Math.round((sensorData.healthScore || 94) / 10)
  );

  const nodeStatus = activeNode?.status || "ONLINE";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {/* Health Score */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Produce Health Index</span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <Activity size={18} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            {Number(sensorData.healthScore || 94).toFixed(1)}
          </span>
          <span className="text-slate-500 text-xs font-bold">/ 100</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full mt-3 overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${sensorData.healthScore || 94}%` }}></div>
        </div>
      </div>

      {/* Shelf Life */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Remaining Shelf Life</span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <Calendar size={18} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            {shelfLife}
          </span>
          <span className="text-slate-500 text-xs font-bold">Days</span>
        </div>
        <p className="text-xs text-slate-500 font-semibold mt-2">Statistically projected duration</p>
      </div>

      {/* Spoilage Risk */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Spoilage Risk Index</span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
            <Flame size={18} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className={`text-3xl font-extrabold tracking-tight font-sans ${spoilageRisk > 40 ? 'text-rose-600' : 'text-slate-900'}`}>
            {spoilageRisk}%
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full mt-3 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${spoilageRisk > 40 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${spoilageRisk}%` }}></div>
        </div>
      </div>

      {/* Node / Batch Status */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Smart Node Telemetry</span>
          <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-200">
            <Radio size={18} />
          </div>
        </div>
        <div className="mt-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-extrabold tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
            ● {nodeStatus}
          </span>
        </div>
        <p className="text-xs text-slate-500 font-semibold mt-2.5">ESP32 / RPi Smart Bridge</p>
      </div>
    </div>
  );
}

export default KPICards;