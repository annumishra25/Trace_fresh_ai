import { Cpu, Camera, Radio, Wifi, Navigation, CloudCheck, CheckCircle2 } from "lucide-react";

function SystemHealth() {
  const systems = [
    { name: "AI Engine", icon: Cpu },
    { name: "Camera Array", icon: Camera },
    { name: "Sensors Grid", icon: Radio },
    { name: "4G LTE Gateway", icon: Wifi },
    { name: "GPS Telemetry", icon: Navigation },
    { name: "Cloud Pipeline", icon: CloudCheck }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-500" />
          <span>System Health Diagnostics</span>
        </h2>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
          6/6 Operational
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {systems.map(({ name, icon: Icon }) => (
          <div
            key={name}
            className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 transition-all hover:border-blue-300"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <Icon size={15} />
              </div>
              <span className="text-xs font-semibold text-slate-900">{name}</span>
            </div>

            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Operational
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SystemHealth;
