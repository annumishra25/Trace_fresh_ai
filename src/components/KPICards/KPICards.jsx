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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* Health Score */}
      <div className="glass-card glass-card-hover rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-emerald-200/90 uppercase tracking-wider">Produce Health Index</span>
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/40 glow-emerald">
            <Activity size={18} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-4xl font-black text-emerald-400 font-mono tracking-tight">
            {Number(sensorData.healthScore || 94).toFixed(1)}
          </span>
          <span className="text-emerald-200/80 text-xs font-mono font-bold">/ 100</span>
        </div>
        <div className="w-full h-1.5 bg-[#03140e] rounded-full mt-3 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full transition-all duration-500" style={{ width: `${sensorData.healthScore || 94}%` }}></div>
        </div>
      </div>

      {/* Shelf Life */}
      <div className="glass-card glass-card-hover rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-emerald-200/90 uppercase tracking-wider">Remaining Shelf Life</span>
          <div className="w-9 h-9 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/40 glow-mint">
            <Calendar size={18} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-4xl font-black text-white font-mono tracking-tight">
            {shelfLife}
          </span>
          <span className="text-emerald-200/80 text-xs font-mono font-bold">Days</span>
        </div>
        <p className="text-[11px] text-emerald-300/70 font-mono mt-2.5">Statistically projected duration</p>
      </div>

      {/* Spoilage Risk */}
      <div className="glass-card glass-card-hover rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-emerald-200/90 uppercase tracking-wider">Spoilage Risk Index</span>
          <div className="w-9 h-9 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40 glow-rose">
            <Flame size={18} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className={`text-4xl font-black font-mono tracking-tight ${spoilageRisk > 40 ? 'text-rose-400' : 'text-emerald-300'}`}>
            {spoilageRisk}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#03140e] rounded-full mt-3 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${spoilageRisk > 40 ? 'bg-rose-500' : 'bg-emerald-400'}`} style={{ width: `${spoilageRisk}%` }}></div>
        </div>
      </div>

      {/* Node / Batch Status */}
      <div className="glass-card glass-card-hover rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-emerald-200/90 uppercase tracking-wider">Smart Node Telemetry</span>
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/40 glow-emerald">
            <Radio size={18} />
          </div>
        </div>
        <div className="mt-3">
          <span className={`text-2xl font-black uppercase font-mono tracking-tight ${nodeStatus === "ONLINE" || nodeStatus === "SIMULATED" ? "text-emerald-400" : "text-amber-400"}`}>
            ● {nodeStatus}
          </span>
        </div>
        <p className="text-[11px] text-emerald-300/70 font-mono mt-2.5">ESP32 / RPi Smart Bridge</p>
      </div>
    </div>
  );
}

export default KPICards;