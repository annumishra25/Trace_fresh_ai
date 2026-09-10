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
      <div className="bg-white border border-[#DDE4DF] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#56635D] uppercase tracking-wider">Produce Health Index</span>
          <div className="w-9 h-9 rounded-xl bg-[#FAFBF8] text-[#064C3B] flex items-center justify-center border border-[#DDE4DF]">
            <Activity size={18} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-[#111715] tracking-tight font-sans">
            {Number(sensorData.healthScore || 94).toFixed(1)}
          </span>
          <span className="text-[#56635D] text-xs font-bold">/ 100</span>
        </div>
        <div className="w-full h-2 bg-[#E8EEE7] rounded-full mt-3 overflow-hidden">
          <div className="h-full bg-[#064C3B] rounded-full transition-all duration-500" style={{ width: `${sensorData.healthScore || 94}%` }}></div>
        </div>
      </div>

      {/* Shelf Life */}
      <div className="bg-white border border-[#DDE4DF] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#56635D] uppercase tracking-wider">Remaining Shelf Life</span>
          <div className="w-9 h-9 rounded-xl bg-[#FAFBF8] text-[#064C3B] flex items-center justify-center border border-[#DDE4DF]">
            <Calendar size={18} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-[#111715] tracking-tight font-sans">
            {shelfLife}
          </span>
          <span className="text-[#56635D] text-xs font-bold">Days</span>
        </div>
        <p className="text-xs text-[#56635D] font-semibold mt-2">Statistically projected duration</p>
      </div>

      {/* Spoilage Risk */}
      <div className="bg-white border border-[#DDE4DF] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#56635D] uppercase tracking-wider">Spoilage Risk Index</span>
          <div className="w-9 h-9 rounded-xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center border border-[#FCA5A5]">
            <Flame size={18} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className={`text-3xl font-extrabold tracking-tight font-sans ${spoilageRisk > 40 ? 'text-[#DC2626]' : 'text-[#111715]'}`}>
            {spoilageRisk}%
          </span>
        </div>
        <div className="w-full h-2 bg-[#E8EEE7] rounded-full mt-3 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${spoilageRisk > 40 ? 'bg-[#DC2626]' : 'bg-[#064C3B]'}`} style={{ width: `${spoilageRisk}%` }}></div>
        </div>
      </div>

      {/* Node / Batch Status */}
      <div className="bg-white border border-[#DDE4DF] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#56635D] uppercase tracking-wider">Smart Node Telemetry</span>
          <div className="w-9 h-9 rounded-xl bg-[#FAFBF8] text-[#064C3B] flex items-center justify-center border border-[#DDE4DF]">
            <Radio size={18} />
          </div>
        </div>
        <div className="mt-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-extrabold tracking-wide bg-[#E4F5EC] text-[#064C3B] border border-[#C3E9D5] uppercase">
            ● {nodeStatus}
          </span>
        </div>
        <p className="text-xs text-[#56635D] font-semibold mt-2.5">ESP32 / RPi Smart Bridge</p>
      </div>
    </div>
  );
}

export default KPICards;