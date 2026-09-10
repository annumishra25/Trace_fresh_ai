import { useState, useEffect } from "react";
import { useTelemetry } from "../../context/TelemetryContext";
import { useSensorData } from "../../context/SensorContext";

function HardwareSensorControl() {
  const { selectedNodeId, setSelectedNodeId, activeTelemetry, sendCustomTelemetry, isLiveMode, toggleMode } = useTelemetry();
  const { updateSensorValues } = useSensorData();

  // Local state for sensor inputs
  const [targetNode, setTargetNode] = useState(selectedNodeId || "TF-NODE-01");
  const [hardwareConnected, setHardwareConnected] = useState(true);
  const [isAutoStreaming, setIsAutoStreaming] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const [sensorValues, setSensorValues] = useState({
    temperature: 5.5,
    humidity: 71.0,
    co2: 600,
    voc: 1.5,
    gas: 0.42,
    battery: 88
  });

  // Keep targetNode synced with global selectedNodeId and initialize values on node switch or telemetry update
  useEffect(() => {
    if (selectedNodeId) {
      setTargetNode(selectedNodeId);
      if (activeTelemetry?.sensors) {
        const s = activeTelemetry.sensors;
        setSensorValues({
          temperature: s.temperature?.value ?? 5.5,
          humidity: s.humidity?.value ?? 71.0,
          co2: s.co2?.value ?? 600,
          voc: s.voc?.value ?? 1.5,
          gas: s.gas?.value ?? 0.42,
          battery: activeTelemetry.device?.batteryPercent ?? 88
        });
      }
    }
  }, [selectedNodeId]);

  // Auto-streaming effect when user enables continuous hardware stream simulation
  useEffect(() => {
    if (!isAutoStreaming) return;

    const interval = setInterval(() => {
      setSensorValues((prev) => {
        const tempDrift = (Math.random() * 0.4 - 0.2);
        const humDrift = (Math.random() * 0.8 - 0.4);
        const co2Drift = (Math.random() * 6.0 - 3.0);
        const updated = {
          ...prev,
          temperature: Number(Math.max(-10, Math.min(50, prev.temperature + tempDrift)).toFixed(1)),
          humidity: Number(Math.max(0, Math.min(100, prev.humidity + humDrift)).toFixed(1)),
          co2: Number(Math.max(300, Math.min(3000, prev.co2 + co2Drift)).toFixed(0)),
        };
        sendCustomTelemetry(targetNode, updated, "hardware");
        if (updateSensorValues) updateSensorValues(updated);
        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isAutoStreaming, targetNode, sendCustomTelemetry, updateSensorValues]);

  // Dynamic real-time adaptation of decision engine when scaling slider bars up or down
  const handleChange = (field, val) => {
    const numVal = Number(val);
    const updated = {
      ...sensorValues,
      [field]: numVal
    };
    setSensorValues(updated);

    // Broadcast live telemetry update & recalculate decision engine
    sendCustomTelemetry(targetNode, updated, "manual_slider");
    if (updateSensorValues) {
      updateSensorValues(updated);
    }
    setStatusMsg(`⚡ Decision Engine Adapted: Scaled ${field} to ${numVal}`);
  };

  const handleTransmit = async () => {
    setSelectedNodeId(targetNode);
    const sourceTag = hardwareConnected ? "hardware" : "manual_input";
    await sendCustomTelemetry(targetNode, sensorValues, sourceTag);
    if (updateSensorValues) updateSensorValues(sensorValues);
    setStatusMsg(`✓ Transmitted sensor payload to ${targetNode} at ${new Date().toLocaleTimeString()}`);
    setTimeout(() => setStatusMsg(""), 4000);
  };

  const applyPreset = (presetName) => {
    let preset = {};
    if (presetName === "OPTIMAL") {
      preset = { temperature: 4.5, humidity: 72.0, co2: 520, voc: 0.8, gas: 0.25, battery: 95 };
    } else if (presetName === "HEAT_WARNING") {
      preset = { temperature: 29.5, humidity: 62.0, co2: 950, voc: 3.8, gas: 1.45, battery: 78 };
    } else if (presetName === "SPOILAGE_ALERT") {
      preset = { temperature: 19.8, humidity: 94.0, co2: 1750, voc: 8.2, gas: 4.10, battery: 65 };
    }
    setSensorValues(preset);
    sendCustomTelemetry(targetNode, preset, "preset_simulator");
    if (updateSensorValues) updateSensorValues(preset);
    setStatusMsg(`✓ Applied preset '${presetName}' & adapted Decision Engine for ${targetNode}`);
    setTimeout(() => setStatusMsg(""), 4000);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-700/80 space-y-6">
      {/* Header & Connection / Mode Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/70 pb-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>🔌 Hardware Model & Interactive Sensor Controls</span>
            </h2>
            <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
              isLiveMode ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-purple-500/20 text-purple-300 border-purple-500/40"
            }`}>
              {isLiveMode ? "📡 ONLINE MODE (Live Backend)" : "🎛️ DEMO MODE (Interactive Sliders)"}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {isLiveMode
              ? "Running in Online Mode with real hardware sensor backend data stream."
              : "Demo Mode active: Scale slider bars up or down to dynamically adapt decision engine outputs in real time."}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Main Mode Switcher Toggle */}
          <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-700">
            <button
              onClick={() => { if (!isLiveMode) toggleMode(); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                isLiveMode ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              📡 Online Mode
            </button>
            <button
              onClick={() => { if (isLiveMode) toggleMode(); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                !isLiveMode ? "bg-purple-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              🎛️ Demo Mode (Sliders)
            </button>
          </div>

          {/* Target Node Selector */}
          <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-2xl p-1">
            <span className="text-xs font-semibold px-2 text-slate-400">Node:</span>
            <button
              onClick={() => { setTargetNode("TF-NODE-01"); setSelectedNodeId("TF-NODE-01"); }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                targetNode === "TF-NODE-01" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              TF-NODE-01
            </button>
            <button
              onClick={() => { setTargetNode("TF-NODE-02"); setSelectedNodeId("TF-NODE-02"); }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                targetNode === "TF-NODE-02" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              TF-NODE-02
            </button>
          </div>

          {/* Hardware Connection Toggle */}
          <button
            onClick={() => setHardwareConnected(!hardwareConnected)}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 border transition-all cursor-pointer ${
              hardwareConnected
                ? "bg-emerald-600/30 text-emerald-300 border-emerald-500/50 hover:bg-emerald-600/40"
                : "bg-rose-900/30 text-rose-300 border-rose-500/40 hover:bg-rose-900/50"
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${hardwareConnected ? "bg-emerald-400 animate-pulse" : "bg-rose-500"}`}></span>
            {hardwareConnected ? "HARDWARE CONNECTED" : "HARDWARE DISCONNECTED"}
          </button>
        </div>
      </div>

      {/* Sensor Input Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Temperature Controller */}
        <div className="bg-slate-800/70 p-4 rounded-2xl border border-slate-700/60 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold text-slate-200">🌡️ Temperature (°C)</label>
            <span className="font-mono font-bold text-amber-400 text-sm">{sensorValues.temperature}°C</span>
          </div>
          <input
            type="range"
            min="-10"
            max="50"
            step="0.5"
            value={sensorValues.temperature}
            onChange={(e) => handleChange("temperature", e.target.value)}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <div className="flex justify-between text-[10px] text-slate-200 font-mono">
            <span>-10°C</span>
            <span>25°C (Threshold)</span>
            <span>50°C</span>
          </div>
        </div>

        {/* Humidity Controller */}
        <div className="bg-slate-800/70 p-4 rounded-2xl border border-slate-700/60 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold text-slate-200">💧 Humidity (%)</label>
            <span className="font-mono font-bold text-cyan-400 text-sm">{sensorValues.humidity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={sensorValues.humidity}
            onChange={(e) => handleChange("humidity", e.target.value)}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] text-slate-200 font-mono">
            <span>0%</span>
            <span>75% (Optimum)</span>
            <span>100%</span>
          </div>
        </div>

        {/* CO2 Controller */}
        <div className="bg-slate-800/70 p-4 rounded-2xl border border-slate-700/60 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold text-slate-200">☁️ CO₂ Level (ppm)</label>
            <span className="font-mono font-bold text-emerald-400 text-sm">{sensorValues.co2} ppm</span>
          </div>
          <input
            type="range"
            min="300"
            max="3000"
            step="25"
            value={sensorValues.co2}
            onChange={(e) => handleChange("co2", e.target.value)}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
          <div className="flex justify-between text-[10px] text-slate-200 font-mono">
            <span>300 ppm</span>
            <span>1000 ppm</span>
            <span>3000 ppm</span>
          </div>
        </div>

        {/* VOC Controller */}
        <div className="bg-slate-800/70 p-4 rounded-2xl border border-slate-700/60 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold text-slate-200">🧪 VOC Level (ppm)</label>
            <span className="font-mono font-bold text-purple-400 text-sm">{sensorValues.voc} ppm</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={sensorValues.voc}
            onChange={(e) => handleChange("voc", e.target.value)}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
          />
          <div className="flex justify-between text-[10px] text-slate-200 font-mono">
            <span>0 ppm</span>
            <span>3 ppm</span>
            <span>10 ppm</span>
          </div>
        </div>

        {/* Combustible Spoilage Gas Controller */}
        <div className="bg-slate-800/70 p-4 rounded-2xl border border-slate-700/60 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold text-slate-200">⚠️ Spoilage / Ethylene Gas (ppm)</label>
            <span className="font-mono font-bold text-rose-400 text-sm">{sensorValues.gas} ppm</span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="0.05"
            value={sensorValues.gas}
            onChange={(e) => handleChange("gas", e.target.value)}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-400"
          />
          <div className="flex justify-between text-[10px] text-slate-200 font-mono">
            <span>0 ppm</span>
            <span>1.0 ppm (Warning)</span>
            <span>5.0 ppm</span>
          </div>
        </div>

        {/* Battery Level Controller */}
        <div className="bg-slate-800/70 p-4 rounded-2xl border border-slate-700/60 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold text-slate-200">🔋 Hardware Battery (%)</label>
            <span className="font-mono font-bold text-lime-400 text-sm">{sensorValues.battery}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={sensorValues.battery}
            onChange={(e) => handleChange("battery", e.target.value)}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-lime-400"
          />
          <div className="flex justify-between text-[10px] text-slate-200 font-mono">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Control Actions & Scenario Presets */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-700/70">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Quick Presets:</span>
          <button
            onClick={() => applyPreset("OPTIMAL")}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all cursor-pointer"
          >
            ✓ Optimal Cold Storage
          </button>
          <button
            onClick={() => applyPreset("HEAT_WARNING")}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all cursor-pointer"
          >
            ⚡ Heat Rise Scenario
          </button>
          <button
            onClick={() => applyPreset("SPOILAGE_ALERT")}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all cursor-pointer"
          >
            🚨 Spoilage & Gas Alert
          </button>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          <button
            onClick={() => setIsAutoStreaming(!isAutoStreaming)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold border transition-all cursor-pointer ${
              isAutoStreaming
                ? "bg-amber-500 text-slate-950 border-amber-400 font-black animate-pulse"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
          >
            {isAutoStreaming ? "⏸ STOP AUTO-STREAM" : "▶ START AUTO-STREAM (2s)"}
          </button>

          <button
            onClick={handleTransmit}
            className="px-6 py-2.5 rounded-2xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-2"
          >
            <span>📡 TRANSMIT SENSOR PACKET</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 px-4 py-2 rounded-2xl text-xs font-bold text-center font-mono">
          {statusMsg}
        </div>
      )}
    </div>
  );
}

export default HardwareSensorControl;
