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
      <div className="bg-white dark:bg-[#0D2820] border border-[#DCE4DE] dark:border-[#23483D] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#78837D] dark:text-[#AEBBB4] uppercase tracking-wider">Produce Health Index</span>
          <div className="w-9 h-9 rounded-xl bg-[#F1F4EE] dark:bg-[#12342A] text-[#063C2F] dark:text-[#36B88A] flex items-center justify-center border border-[#DCE4DE] dark:border-[#23483D]">
            <Activity size={18} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-[#101513] dark:text-[#F4F7F2] tracking-tight font-sans">
            {Number(sensorData.healthScore || 94).toFixed(1)}
          </span>
          <span className="text-[#78837D] dark:text-[#AEBBB4] text-xs font-semibold">/ 100</span>
        </div>
        <div className="w-full h-2 bg-[#E8EEE7] dark:bg-[#184035] rounded-full mt-3 overflow-hidden">
          <div className="h-full bg-[#063C2F] dark:bg-[#36B88A] rounded-full transition-all duration-500" style={{ width: `${sensorData.healthScore || 94}%` }}></div>
        </div>
      </div>

      {/* Shelf Life */}
      <div className="bg-white dark:bg-[#0D2820] border border-[#DCE4DE] dark:border-[#23483D] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#78837D] dark:text-[#AEBBB4] uppercase tracking-wider">Remaining Shelf Life</span>
          <div className="w-9 h-9 rounded-xl bg-[#F1F4EE] dark:bg-[#12342A] text-[#063C2F] dark:text-[#36B88A] flex items-center justify-center border border-[#DCE4DE] dark:border-[#23483D]">
            <Calendar size={18} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-[#101513] dark:text-[#F4F7F2] tracking-tight font-sans">
            {shelfLife}
          </span>
          <span className="text-[#78837D] dark:text-[#AEBBB4] text-xs font-semibold">Days</span>
        </div>
        <p className="text-xs text-[#4E5B55] dark:text-[#AEBBB4] font-medium mt-2">Statistically projected duration</p>
      </div>

      {/* Spoilage Risk */}
      <div className="bg-white dark:bg-[#0D2820] border border-[#DCE4DE] dark:border-[#23483D] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#78837D] dark:text-[#AEBBB4] uppercase tracking-wider">Spoilage Risk Index</span>
          <div className="w-9 h-9 rounded-xl bg-[#FDF2F2] dark:bg-[#3D1A1A] text-[#DC2626] flex items-center justify-center border border-[#FCA5A5]/30">
            <Flame size={18} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className={`text-3xl font-extrabold tracking-tight font-sans ${spoilageRisk > 40 ? 'text-[#DC2626]' : 'text-[#101513] dark:text-[#F4F7F2]'}`}>
            {spoilageRisk}%
          </span>
        </div>
        <div className="w-full h-2 bg-[#E8EEE7] dark:bg-[#184035] rounded-full mt-3 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${spoilageRisk > 40 ? 'bg-[#DC2626]' : 'bg-[#16805F]'}`} style={{ width: `${spoilageRisk}%` }}></div>
        </div>
      </div>

      {/* Node / Batch Status */}
      <div className="bg-white dark:bg-[#0D2820] border border-[#DCE4DE] dark:border-[#23483D] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#78837D] dark:text-[#AEBBB4] uppercase tracking-wider">Smart Node Telemetry</span>
          <div className="w-9 h-9 rounded-xl bg-[#F1F4EE] dark:bg-[#12342A] text-[#063C2F] dark:text-[#36B88A] flex items-center justify-center border border-[#DCE4DE] dark:border-[#23483D]">
            <Radio size={18} />
          </div>
        </div>
        <div className="mt-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold tracking-wide bg-[#DDF2E8] text-[#063C2F] dark:bg-[#12342A] dark:text-[#36B88A] border border-[#16805F]/20 uppercase">
            ● {nodeStatus}
          </span>
        </div>
        <p className="text-xs text-[#4E5B55] dark:text-[#AEBBB4] font-medium mt-2.5">ESP32 / RPi Smart Bridge</p>
      </div>
    </div>
  );
}
}

export default KPICards;