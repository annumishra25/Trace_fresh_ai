function Traceability() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-[#DDE4DF] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111715] tracking-tight">
              Product Traceability & Batch Passport
            </h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-[#E4F5EC] text-[#064C3B] border border-[#C3E9D5]">
              ● VERIFIED PASSPORT
            </span>
          </div>
          <p className="text-[#56635D] text-xs mt-1 font-semibold">
            End-to-end supply chain origin tracking, batch quality diagnostics, and environmental chain of custody.
          </p>
        </div>
      </div>

      {/* Product Summary */}
      <div className="bg-white border border-[#DDE4DF] rounded-2xl p-6 md:p-8 space-y-4 shadow-xs relative overflow-hidden">
        <h2 className="text-xl font-extrabold text-[#111715] tracking-tight border-b border-[#DDE4DF] pb-3">
          Product & Shipment Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="bg-[#FAFBF8] p-4 rounded-xl border border-[#DDE4DF]">
            <span className="text-xs font-extrabold text-[#56635D] uppercase tracking-wider block">Batch ID</span>
            <span className="text-base font-extrabold text-[#064C3B] mt-1 block">TF-APPLE-001</span>
          </div>

          <div className="bg-[#FAFBF8] p-4 rounded-xl border border-[#DDE4DF]">
            <span className="text-xs font-extrabold text-[#56635D] uppercase tracking-wider block">Product Produce</span>
            <span className="text-base font-extrabold text-[#111715] capitalize mt-1 block">Fresh Red Apple</span>
          </div>

          <div className="bg-[#FAFBF8] p-4 rounded-xl border border-[#DDE4DF]">
            <span className="text-xs font-extrabold text-[#56635D] uppercase tracking-wider block">Origin Farm</span>
            <span className="text-base font-extrabold text-[#111715] mt-1 block">Coimbatore Organic Farm</span>
          </div>

          <div className="bg-[#FAFBF8] p-4 rounded-xl border border-[#DDE4DF]">
            <span className="text-xs font-extrabold text-[#56635D] uppercase tracking-wider block">Harvest Date</span>
            <span className="text-base font-extrabold text-[#111715] mt-1 block">18 June 2026</span>
          </div>

          <div className="bg-[#FAFBF8] p-4 rounded-xl border border-[#DDE4DF]">
            <span className="text-xs font-extrabold text-[#56635D] uppercase tracking-wider block">Current Location</span>
            <span className="text-base font-extrabold text-[#064C3B] mt-1 block">Chennai Retail Store</span>
          </div>

          <div className="bg-[#FAFBF8] p-4 rounded-xl border border-[#DDE4DF]">
            <span className="text-xs font-extrabold text-[#56635D] uppercase tracking-wider block">Last Updated</span>
            <span className="text-base font-extrabold text-[#111715] mt-1 block">19 June 2026 02:45 PM</span>
          </div>
        </div>
      </div>

      {/* Quality Card */}
      <div className="bg-white border border-[#DDE4DF] rounded-2xl p-6 md:p-8 space-y-4 shadow-xs relative overflow-hidden">
        <h2 className="text-xl font-extrabold text-[#111715] tracking-tight border-b border-[#DDE4DF] pb-3">
          Quality Assessment Diagnostics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#FAFBF8] p-4 rounded-xl border border-[#DDE4DF]">
            <h3 className="text-xs font-extrabold text-[#56635D] uppercase tracking-wider">Health Score</h3>
            <p className="text-3xl font-extrabold text-[#064C3B] mt-1">
              94 / 100
            </p>
          </div>

          <div className="bg-[#FAFBF8] p-4 rounded-xl border border-[#DDE4DF]">
            <h3 className="text-xs font-extrabold text-[#56635D] uppercase tracking-wider">Freshness Rating</h3>
            <p className="text-3xl font-extrabold text-[#064C3B] mt-1">
              FRESH
            </p>
          </div>

          <div className="bg-[#FAFBF8] p-4 rounded-xl border border-[#DDE4DF]">
            <h3 className="text-xs font-extrabold text-[#56635D] uppercase tracking-wider">AI Model Confidence</h3>
            <p className="text-3xl font-extrabold text-[#111715] mt-1">
              96.4%
            </p>
          </div>

          <div className="bg-[#FAFBF8] p-4 rounded-xl border border-[#DDE4DF]">
            <h3 className="text-xs font-extrabold text-[#56635D] uppercase tracking-wider">Batch Status</h3>
            <p className="text-3xl font-extrabold text-[#064C3B] mt-1">
              SAFE
            </p>
          </div>
        </div>
      </div>

      {/* Journey */}
      <div className="bg-white border border-[#DDE4DF] rounded-2xl p-6 md:p-8 space-y-4 shadow-xs relative overflow-hidden">
        <h2 className="text-xl font-extrabold text-[#111715] tracking-tight border-b border-[#DDE4DF] pb-3">
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
            <div key={idx} className="bg-[#FAFBF8] p-4 rounded-xl border border-[#DDE4DF] flex items-center justify-between hover:bg-[#F1F4EE] transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 bg-white rounded-xl border border-[#DDE4DF]">{step.icon}</span>
                <div>
                  <p className="font-extrabold text-[#111715] text-sm">{step.text}</p>
                  <p className="text-xs text-[#56635D] font-semibold mt-0.5">{step.sub}</p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-[#064C3B] bg-[#E4F5EC] px-3 py-1 rounded-full border border-[#C3E9D5]">
                ✓ VERIFIED
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Storage Conditions */}
      <div className="bg-white border border-[#DDE4DF] rounded-2xl p-6 md:p-8 space-y-4 shadow-xs relative overflow-hidden">
        <h2 className="text-xl font-extrabold text-[#111715] tracking-tight border-b border-[#DDE4DF] pb-3">
          Monitored Storage Conditions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#FAFBF8] p-4 rounded-xl border border-[#DDE4DF]">
            <h3 className="text-xs font-extrabold text-[#56635D] uppercase tracking-wider">Average Temperature</h3>
            <p className="text-2xl font-extrabold text-[#D97706] mt-1">24.8°C</p>
          </div>

          <div className="bg-[#FAFBF8] p-4 rounded-xl border border-[#DDE4DF]">
            <h3 className="text-xs font-extrabold text-[#56635D] uppercase tracking-wider">Relative Humidity</h3>
            <p className="text-2xl font-extrabold text-[#064C3B] mt-1">62%</p>
          </div>

          <div className="bg-[#FAFBF8] p-4 rounded-xl border border-[#DDE4DF]">
            <h3 className="text-xs font-extrabold text-[#56635D] uppercase tracking-wider">Ethylene Gas Level</h3>
            <p className="text-2xl font-extrabold text-[#064C3B] mt-1">0.21 ppm</p>
          </div>
        </div>
      </div>

      {/* AI Inspection Report & Sustainability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#DDE4DF] rounded-2xl p-6 space-y-3 shadow-xs">
          <h2 className="text-xl font-extrabold text-[#111715] tracking-tight">
            AI Inspection Report
          </h2>
          <p className="text-xs text-[#111715] font-semibold leading-relaxed bg-[#FAFBF8] p-4 rounded-xl border border-[#DDE4DF]">
            Latest inspection indicates the fruit is in fresh condition with low spoilage risk. Environmental parameters remain strictly within acceptable safety limits.
          </p>
        </div>

        <div className="bg-white border border-[#DDE4DF] rounded-2xl p-6 space-y-3 shadow-xs">
          <h2 className="text-xl font-extrabold text-[#111715] tracking-tight">
            Sustainability & Compliance Information
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center bg-[#FAFBF8] p-3 rounded-xl border border-[#DDE4DF]">
              <span className="text-[#56635D] font-extrabold">Food Waste Risk</span>
              <span className="font-extrabold text-[#064C3B]">LOW</span>
            </div>
            <div className="flex justify-between items-center bg-[#FAFBF8] p-3 rounded-xl border border-[#DDE4DF]">
              <span className="text-[#56635D] font-extrabold">Remaining Shelf Life</span>
              <span className="font-extrabold text-[#111715]">9 Days</span>
            </div>
            <div className="flex justify-between items-center bg-[#FAFBF8] p-3 rounded-xl border border-[#DDE4DF]">
              <span className="text-[#56635D] font-extrabold">Supply Chain Compliance</span>
              <span className="font-extrabold text-[#064C3B]">✓ VERIFIED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Traceability;