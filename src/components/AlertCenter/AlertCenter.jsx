import { AlertTriangle, Flame, ShieldAlert, BellRing } from "lucide-react";

function AlertCenter() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 relative overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <BellRing size={18} className="text-amber-500" />
          <span>Alert Center</span>
        </h2>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
          2 Active Alerts
        </span>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between font-medium transition-colors hover:bg-slate-100">
          <span className="text-slate-900 font-semibold flex items-center gap-2.5">
            <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
            <span>Temp Excursion (TF-NODE-01)</span>
          </span>
          <span className="font-bold font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            29.5°C
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between font-medium transition-colors hover:bg-slate-100">
          <span className="text-slate-900 font-semibold flex items-center gap-2.5">
            <Flame size={16} className="text-rose-500 flex-shrink-0" />
            <span>Ethylene Gas Spike (TF-NODE-02)</span>
          </span>
          <span className="font-bold font-mono text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            1.45 ppm
          </span>
        </div>
      </div>
    </div>
  );
}

export default AlertCenter;
