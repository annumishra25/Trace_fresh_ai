function Traceability() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-black text-slate-100 tracking-tight">
        Product Traceability & Batch Passport
      </h1>

      {/* Product Summary */}
      <div className="glass-card border border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-4 bg-slate-900/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-80" />

        <h2 className="text-2xl font-black text-slate-100 tracking-tight">
          Product & Shipment Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Batch ID</span>
            <span className="text-base font-black text-blue-400 font-mono mt-1 block">TF-APPLE-001</span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Product Produce</span>
            <span className="text-base font-black text-slate-100 capitalize mt-1 block">Fresh Red Apple</span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Origin Farm</span>
            <span className="text-base font-black text-slate-100 mt-1 block">Coimbatore Organic Farm</span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Harvest Date</span>
            <span className="text-base font-black text-slate-100 font-mono mt-1 block">18 June 2026</span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Current Location</span>
            <span className="text-base font-black text-emerald-400 mt-1 block">Chennai Retail Store</span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Last Updated</span>
            <span className="text-base font-black text-slate-200 font-mono mt-1 block">19 June 2026 02:45 PM</span>
          </div>
        </div>
      </div>

      {/* Quality Card */}
      <div className="glass-card border border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-4 bg-slate-900/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-80" />

        <h2 className="text-2xl font-black text-slate-100 tracking-tight">
          Quality Assessment Diagnostics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Health Score</h3>
            <p className="text-3xl font-black text-emerald-400 font-mono mt-1 glow-emerald">
              94 / 100
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Freshness Rating</h3>
            <p className="text-3xl font-black text-emerald-400 mt-1">
              FRESH
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">AI Model Confidence</h3>
            <p className="text-3xl font-black text-cyan-300 font-mono mt-1">
              96.4%
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Batch Status</h3>
            <p className="text-3xl font-black text-emerald-400 mt-1">
              SAFE
            </p>
          </div>
        </div>
      </div>

      {/* Journey */}
      <div className="glass-card border border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-4 bg-slate-900/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 opacity-80" />

        <h2 className="text-2xl font-black text-slate-100 tracking-tight">
          Product Supply Chain Journey
        </h2>

        <div className="space-y-3 text-sm">
          {[
            { icon: "🌱", text: "Harvested at Coimbatore Farm", sub: "Verified origin coordinates & organic harvest protocol" },
            { icon: "📦", text: "Quality Checked & Packed", sub: "Optical surface check passed (0 mold, 0 bruising)" },
            { icon: "🚚", text: "Transported Under Controlled Conditions", sub: "Cold chain maintained at 4.5°C during 180 km transit" },
            { icon: "🏬", text: "Stored at Distribution Center", sub: "Inbound warehouse inspection score 95/100" },
            { icon: "🛒", text: "Delivered to Retail Store", sub: "Available on retail shelves — Freshness guaranteed" }
          ].map((step, idx) => (
            <div key={idx} className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 bg-slate-900 rounded-xl border border-slate-800">{step.icon}</span>
                <div>
                  <p className="font-extrabold text-slate-100 text-sm">{step.text}</p>
                  <p className="text-xs text-slate-300 mt-0.5">{step.sub}</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                VERIFIED
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Storage Conditions */}
      <div className="glass-card border border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-4 bg-slate-900/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-teal-500 to-emerald-500 opacity-80" />

        <h2 className="text-2xl font-black text-slate-100 tracking-tight">
          Monitored Storage Conditions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Average Temperature</h3>
            <p className="text-2xl font-black text-amber-400 font-mono mt-1">24.8°C</p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Relative Humidity</h3>
            <p className="text-2xl font-black text-cyan-300 font-mono mt-1">62%</p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Ethylene Gas Level</h3>
            <p className="text-2xl font-black text-emerald-400 font-mono mt-1">0.21 ppm</p>
          </div>
        </div>
      </div>

      {/* AI Inspection Report & Sustainability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card border border-slate-800/80 rounded-3xl p-6 space-y-3 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
          <h2 className="text-xl font-black text-slate-100 tracking-tight">
            AI Inspection Report
          </h2>
          <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
            Latest inspection indicates the fruit is in fresh condition with low spoilage risk. Environmental parameters remain strictly within acceptable safety limits.
          </p>
        </div>

        <div className="glass-card border border-slate-800/80 rounded-3xl p-6 space-y-3 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
          <h2 className="text-xl font-black text-slate-100 tracking-tight">
            Sustainability & Compliance Information
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-300 font-semibold">Food Waste Risk</span>
              <span className="font-extrabold text-emerald-400">LOW</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-300 font-semibold">Remaining Shelf Life</span>
              <span className="font-extrabold text-cyan-300 font-mono">9 Days</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-300 font-semibold">Supply Chain Compliance</span>
              <span className="font-extrabold text-emerald-400">✓ VERIFIED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Traceability;