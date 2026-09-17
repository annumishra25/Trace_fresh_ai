import { useSensorData } from "../../context/SensorContext";
import { Activity, Sliders, Radio, Zap } from "lucide-react";

function ModeSwitcherBar() {
  const { monitoringMode, setMonitoringMode } = useSensorData();

  const isLive = monitoringMode === "live";

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
      <div className="flex items-center gap-3">
        <div
          className={`p-3 rounded-2xl flex items-center justify-center transition-colors ${
            isLive
              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
              : "bg-purple-50 text-purple-600 border border-purple-100"
          }`}
        >
          {isLive ? <Radio className="animate-pulse" size={24} /> : <Sliders size={24} />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Operational Mode
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isLive
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-purple-100 text-purple-800"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isLive ? "bg-emerald-500 animate-ping" : "bg-purple-600"
                }`}
              />
              {isLive ? "Live Telemetry Active" : "Interactive Demo Active"}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">
            {isLive ? "Live Hardware & Monitoring Mode" : "Interactive Demo & Simulation Mode"}
          </h2>
        </div>
      </div>

      {/* Mode Switcher Toggle Pill */}
      <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 self-start md:self-auto border border-slate-200">
        <button
          onClick={() => setMonitoringMode("live")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
            isLive
              ? "bg-white text-emerald-700 shadow-sm border border-slate-200/60"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <Activity size={16} />
          <span>Live Mode</span>
        </button>

        <button
          onClick={() => setMonitoringMode("demo")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
            !isLive
              ? "bg-purple-600 text-white shadow-md shadow-purple-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <Zap size={16} />
          <span>Demo Mode (Sliders)</span>
        </button>
      </div>
    </div>
  );
}

export default ModeSwitcherBar;
