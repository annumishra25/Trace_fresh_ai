import { useSensorData } from "../context/SensorContext";

function ConsumerPortal() {
  const { sensorData } = useSensorData();

  return (
    <div className="space-y-6 pb-12">
      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
        Consumer Freshness Passport
      </h1>

      {/* Product Overview */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-4 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 flex items-center gap-2">
              <span>🍎 Premium Red Apple</span>
            </h2>
            <p className="text-slate-500 font-mono text-xs mt-1 font-semibold">
              Batch ID: <span className="text-blue-600 font-bold">TF-APL-2026-001</span>
            </p>
          </div>

          <div className="text-left md:text-right bg-emerald-50 px-5 py-3 rounded-2xl border border-emerald-200">
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              AI Verification Status
            </p>
            <p className="text-emerald-700 font-black text-xl mt-0.5">
              VERIFIED FRESH
            </p>
          </div>
        </div>
      </div>

      {/* KPI Layer */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            Health Score
          </h3>
          <p className="text-4xl font-black text-emerald-600 font-mono mt-1">
            {Number(sensorData?.healthScore || 94).toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            Shelf Life
          </h3>
          <p className="text-4xl font-black text-blue-600 font-mono mt-1">
            {sensorData?.shelfLife || 9} Days
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            Spoilage Risk
          </h3>
          <p className="text-4xl font-black text-amber-600 font-mono mt-1">
            {Number(sensorData?.spoilageRisk || 8).toFixed(2)}%
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            Risk Level
          </h3>
          <p className="text-4xl font-black text-emerald-600 mt-1">
            {sensorData?.riskLevel || "LOW"}
          </p>
        </div>
      </div>

      {/* Farm Information */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 space-y-4 shadow-xs">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Origin Farm Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Farm ID</p>
            <p className="font-mono font-black text-slate-900 text-base mt-1">TN-APL-2026-004</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Harvest Date</p>
            <p className="font-mono font-black text-slate-900 text-base mt-1">12 June 2026</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Region</p>
            <p className="font-black text-slate-900 text-base mt-1">Coimbatore, Tamil Nadu</p>
          </div>
        </div>
      </div>

      {/* Storage Conditions */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 space-y-4 shadow-xs">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Monitored Storage Conditions
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Temperature</p>
            <p className="font-black font-mono text-amber-600 text-xl mt-1">{sensorData?.temperature || 24.8} °C</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Humidity</p>
            <p className="font-black font-mono text-blue-600 text-xl mt-1">{sensorData?.humidity || 62} %</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">VOC</p>
            <p className="font-black font-mono text-slate-900 text-xl mt-1">{sensorData?.voc || 140} ppb</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">CO₂</p>
            <p className="font-black font-mono text-slate-900 text-xl mt-1">{sensorData?.co2 || 420} ppm</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Ethylene</p>
            <p className="font-black font-mono text-emerald-600 text-xl mt-1">{sensorData?.ethylene || 0.21} ppm</p>
          </div>
        </div>
      </div>

      {/* Supply Chain Journey */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 space-y-4 shadow-xs">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Verified Supply Chain Journey
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[
            { icon: "🌱", label: "Harvested", desc: "Verified Origin" },
            { icon: "📦", label: "Packed", desc: "Quality Inspected" },
            { icon: "🚚", label: "Transported", desc: "Cold Chain 4.5°C" },
            { icon: "🏬", label: "Warehouse", desc: "Digital Twin Twin" },
            { icon: "🛒", label: "Retail Store", desc: "Shelf Ready" }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-center space-y-1">
              <div className="text-2xl">{item.icon}</div>
              <p className="font-black text-slate-900 text-sm">{item.label}</p>
              <p className="text-[10px] text-emerald-600 font-mono font-bold">✓ {item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ConsumerPortal;