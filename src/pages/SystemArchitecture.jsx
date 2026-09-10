function SystemArchitecture() {
  const layers = [
    { title: "Sensor Layer", desc: "ESP32, SHT45 Temp/Humidity, SCD41 CO₂, MQ135 Air Quality & Vision Module", icon: "📡" },
    { title: "MQTT & IoT Communication Layer", desc: "Real-Time Telemetry Broker & Sensor Stream Pipeline", icon: "🌐" },
    { title: "Backend Processing Layer", desc: "Python Flask Microservices, Verification Engines & REST APIs", icon: "⚙️" },
    { title: "AI Multi-Modal Intelligence Layer", desc: "Multi-Modal Sensor Fusion, Spoilage Model & CNN Visual Classifier", icon: "🧠" },
    { title: "Database & Ledger Layer", desc: "Persistent Batch Audit Records, Quality Diagnostics & GPS History", icon: "🗄️" },
    { title: "Enterprise Dashboard Layer", desc: "Real-Time Telemetry Analytics, Digital Twin & Route Replay", icon: "📊" },
    { title: "Consumer Verification Portal Layer", desc: "QR Code Identity, Public Passport Lookup & Transparency Trust Verification", icon: "📱" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-black text-slate-100 tracking-tight">
        System Architecture & Technical Stack
      </h1>

      <div className="glass-card bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl">
        <div className="space-y-3">
          {layers.map((layer, index) => (
            <div
              key={index}
              className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 flex items-center justify-between gap-4 hover:border-blue-500/40 transition group"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl p-2.5 bg-slate-900 rounded-xl border border-slate-800">{layer.icon}</span>
                <div>
                  <h3 className="font-extrabold text-slate-100 text-base">{layer.title}</h3>
                  <p className="text-xs text-slate-300 mt-0.5">{layer.desc}</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
                LAYER 0{index + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SystemArchitecture;