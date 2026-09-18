import React from "react";

function DigitalTwinWarehouse() {
  const zones = [
    {
      name: "Zone A1",
      temperature: "4°C",
      occupancy: "82%",
      risk: "LOW",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      accent: "from-emerald-500 to-teal-500"
    },
    {
      name: "Zone A2",
      temperature: "5°C",
      occupancy: "70%",
      risk: "LOW",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      accent: "from-emerald-500 to-cyan-500"
    },
    {
      name: "Zone B1",
      temperature: "9°C",
      occupancy: "91%",
      risk: "MEDIUM",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      accent: "from-amber-500 to-orange-500"
    },
    {
      name: "Zone B2",
      temperature: "12°C",
      occupancy: "95%",
      risk: "HIGH",
      badgeColor: "bg-rose-50 text-rose-800 border-rose-200",
      accent: "from-rose-500 to-red-500"
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-emerald-500 to-indigo-500" />

      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>Warehouse Digital Twin</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Real-Time Spatial Environmental Monitoring & Capacity Allocation
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {zones.map((zone) => (
          <div
            key={zone.name}
            className="bg-slate-900 p-6 rounded-2xl border border-slate-800 relative overflow-hidden hover:border-slate-700 transition-all shadow-md space-y-4 text-white"
          >
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${zone.accent}`} />

            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xl text-white">
                {zone.name}
              </h3>
              <span className={`text-xs font-black font-mono px-3 py-1 rounded-full border ${zone.badgeColor}`}>
                {zone.risk} RISK
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm pt-2">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Temperature</span>
                <span className="text-xl font-black text-white font-mono mt-1 block">{zone.temperature}</span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Occupancy</span>
                <span className="text-xl font-black text-cyan-400 font-mono mt-1 block">{zone.occupancy}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DigitalTwinWarehouse;
