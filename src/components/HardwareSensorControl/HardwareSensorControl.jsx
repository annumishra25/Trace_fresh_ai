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
    <div className="bg-white text-[#111715] border border-[#DDE4DF] rounded-2xl p-6 shadow-xs space-y-6 relative overflow-hidden">
      {/* Header & Connection / Mode Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE4DF] pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#111715] flex items-center gap-2">
              <span>🔌 Hardware Model & Interactive Sensor Controls</span>
            </h2>
            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md border ${
              isLiveMode ? "bg-[#E4F5EC] text-[#064C3B] border-[#C3E9D5]" : "bg-[#FAFBF8] text-[#064C3B] border-[#DDE4DF]"
            }`}>
              {isLiveMode ? "📡 ONLINE MODE (Live Backend)" : "🎛️ DEMO MODE (Interactive Sliders)"}
            </span>
          </div>
          <p className="text-xs text-[#56635D] mt-1 font-semibold">
            {isLiveMode
              ? "Running in Online Mode with real hardware sensor backend data stream."
              : "Demo Mode active: Scale slider bars up or down to dynamically adapt decision engine outputs in real time."}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Main Mode Switcher Toggle */}
          <div className="flex items-center bg-[#FAFBF8] p-1 rounded-xl border border-[#DDE4DF]">
            <button
              onClick={() => { if (!isLiveMode) toggleMode(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                isLiveMode ? "bg-[#064C3B] text-white shadow-xs" : "text-[#111715] hover:text-[#064C3B]"
              }`}
            >
              📡 Online Mode
            </button>
            <button
              onClick={() => { if (isLiveMode) toggleMode(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                !isLiveMode ? "bg-[#064C3B] text-white shadow-xs" : "text-[#111715] hover:text-[#064C3B]"
              }`}
            >
              🎛️ Demo Mode
            </button>
          </div>

          {/* Target Node Selector */}
          <div className="flex items-center bg-[#FAFBF8] border border-[#DDE4DF] rounded-xl p-1">
            <span className="text-xs font-extrabold px-2 text-[#56635D]">Node:</span>
            <button
              onClick={() => { setTargetNode("TF-NODE-01"); setSelectedNodeId("TF-NODE-01"); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                targetNode === "TF-NODE-01" ? "bg-[#064C3B] text-white" : "text-[#111715] hover:text-[#064C3B]"
              }`}
            >
              TF-NODE-01
            </button>
            <button
              onClick={() => { setTargetNode("TF-NODE-02"); setSelectedNodeId("TF-NODE-02"); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                targetNode === "TF-NODE-02" ? "bg-[#064C3B] text-white" : "text-[#111715] hover:text-[#064C3B]"
              }`}
            >
              TF-NODE-02
            </button>
          </div>

          {/* Hardware Connection Toggle */}
          <button
            onClick={() => setHardwareConnected(!hardwareConnected)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-2 border transition-all cursor-pointer ${
              hardwareConnected
                ? "bg-[#E4F5EC] text-[#064C3B] border-[#C3E9D5]"
                : "bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${hardwareConnected ? "bg-[#064C3B]" : "bg-[#DC2626]"}`}></span>
            {hardwareConnected ? "HARDWARE CONNECTED" : "HARDWARE DISCONNECTED"}
          </button>
        </div>
      </div>

      {/* Sensor Input Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
        {/* Temperature Controller */}
        <div className="bg-[#FAFBF8] p-4 rounded-xl border border-[#DDE4DF] space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-extrabold text-[#111715]">🌡️ Temperature (°C)</label>
            <span className="font-extrabold text-[#D97706] text-sm">{sensorValues.temperature}°C</span>
          </div>
          <input
            type="range"
            min="-10"
            max="50"
            step="0.5"
            value={sensorValues.temperature}
            onChange={(e) => handleChange("temperature", e.target.value)}
            className="w-full h-2 bg-[#E8EEE7] rounded-lg appearance-none cursor-pointer accent-[#064C3B]"
          />
          <div className="flex justify-between text-[10px] text-[#56635D] font-bold">
            <span>-10°C</span>
            <span>25°C (Threshold)</span>
            <span>50°C</span>
          </div>
        </div>

        {/* Humidity Controller */}
        <div className="bg-[#FAFBF8] p-4 rounded-xl border border-[#DDE4DF] space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-extrabold text-[#111715]">💧 Humidity (%)</label>
            <span className="font-extrabold text-[#064C3B] text-sm">{sensorValues.humidity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={sensorValues.humidity}
            onChange={(e) => handleChange("humidity", e.target.value)}
            className="w-full h-2 bg-[#E8EEE7] rounded-lg appearance-none cursor-pointer accent-[#064C3B]"
          />
          <div className="flex justify-between text-[10px] text-[#56635D] font-bold">
            <span>0%</span>
            <span>75% (Optimum)</span>
            <span>100%</span>
          </div>
        </div>

        {/* CO2 Controller */}
        <div className="bg-[#FAFBF8] p-4 rounded-xl border border-[#DDE4DF] space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-extrabold text-[#111715]">☁️ CO₂ Level (ppm)</label>
            <span className="font-extrabold text-[#064C3B] text-sm">{sensorValues.co2} ppm</span>
          </div>
          <input
            type="range"
            min="300"
            max="3000"
            step="25"
            value={sensorValues.co2}
            onChange={(e) => handleChange("co2", e.target.value)}
            className="w-full h-2 bg-[#E8EEE7] rounded-lg appearance-none cursor-pointer accent-[#064C3B]"
          />
          <div className="flex justify-between text-[10px] text-[#56635D] font-bold">
            <span>300 ppm</span>
            <span>1000 ppm</span>
            <span>3000 ppm</span>
          </div>
        </div>

        {/* VOC Controller */}
        <div className="bg-[#FAFBF8] p-4 rounded-xl border border-[#DDE4DF] space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-extrabold text-[#111715]">🧪 VOC Level (ppm)</label>
            <span className="font-extrabold text-[#064C3B] text-sm">{sensorValues.voc} ppm</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={sensorValues.voc}
            onChange={(e) => handleChange("voc", e.target.value)}
            className="w-full h-2 bg-[#E8EEE7] rounded-lg appearance-none cursor-pointer accent-[#064C3B]"
          />
          <div className="flex justify-between text-[10px] text-[#56635D] font-bold">
            <span>0 ppm</span>
            <span>3 ppm</span>
            <span>10 ppm</span>
          </div>
        </div>

        {/* Combustible Spoilage Gas Controller */}
        <div className="bg-[#FAFBF8] p-4 rounded-xl border border-[#DDE4DF] space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-extrabold text-[#111715]">⚠️ Spoilage / Ethylene Gas (ppm)</label>
            <span className="font-extrabold text-[#DC2626] text-sm">{sensorValues.gas} ppm</span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="0.05"
            value={sensorValues.gas}
            onChange={(e) => handleChange("gas", e.target.value)}
            className="w-full h-2 bg-[#E8EEE7] rounded-lg appearance-none cursor-pointer accent-[#DC2626]"
          />
          <div className="flex justify-between text-[10px] text-[#56635D] font-bold">
            <span>0 ppm</span>
            <span>1.0 ppm (Warning)</span>
            <span>5.0 ppm</span>
          </div>
        </div>

        {/* Battery Level Controller */}
        <div className="bg-[#FAFBF8] p-4 rounded-xl border border-[#DDE4DF] space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-extrabold text-[#111715]">🔋 Hardware Battery (%)</label>
            <span className="font-extrabold text-[#064C3B] text-sm">{sensorValues.battery}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={sensorValues.battery}
            onChange={(e) => handleChange("battery", e.target.value)}
            className="w-full h-2 bg-[#E8EEE7] rounded-lg appearance-none cursor-pointer accent-[#064C3B]"
          />
          <div className="flex justify-between text-[10px] text-[#56635D] font-bold">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Control Actions & Scenario Presets */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-4 border-t border-[#DDE4DF] relative z-10">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-extrabold text-[#56635D] uppercase tracking-wider">Quick Presets:</span>
          <button
            onClick={() => applyPreset("OPTIMAL")}
            className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-[#E4F5EC] text-[#064C3B] border border-[#C3E9D5] hover:bg-[#d0f0e0] transition-all cursor-pointer"
          >
            ✓ Optimal Cold Storage
          </button>
          <button
            onClick={() => applyPreset("HEAT_WARNING")}
            className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] hover:bg-[#fde68a] transition-all cursor-pointer"
          >
            ⚡ Heat Rise Scenario
          </button>
          <button
            onClick={() => applyPreset("SPOILAGE_ALERT")}
            className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5] hover:bg-[#fca5a5] transition-all cursor-pointer"
          >
            🚨 Spoilage & Gas Alert
          </button>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          <button
            onClick={() => setIsAutoStreaming(!isAutoStreaming)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
              isAutoStreaming
                ? "bg-[#D97706] text-white border-[#D97706]"
                : "bg-[#FAFBF8] text-[#111715] border-[#DDE4DF]"
            }`}
          >
            {isAutoStreaming ? "⏸ STOP AUTO-STREAM" : "▶ START AUTO-STREAM (2s)"}
          </button>

          <button
            onClick={handleTransmit}
            className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#064C3B] hover:bg-[#042E25] text-white shadow-xs transition-all cursor-pointer flex items-center gap-2"
          >
            <span>📡 TRANSMIT SENSOR PACKET</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="bg-[#E4F5EC] border border-[#C3E9D5] text-[#064C3B] px-4 py-2 rounded-xl text-xs font-bold text-center relative z-10">
          {statusMsg}
        </div>
      )}
    </div>
  );
}

export default HardwareSensorControl;
