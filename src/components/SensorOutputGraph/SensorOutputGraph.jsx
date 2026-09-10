import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from "recharts";
import { useTelemetry } from "../../context/TelemetryContext";

const METRIC_CONFIGS = {
  temperature: { label: "Temperature", unit: "°C", color: "#f59e0b", stroke: "#d97706", threshold: 25, key: "temperature" },
  humidity: { label: "Humidity", unit: "%", color: "#06b6d4", stroke: "#0891b2", threshold: 85, key: "humidity" },
  co2: { label: "CO₂ Concentration", unit: "ppm", color: "#10b981", stroke: "#059669", threshold: 1000, key: "co2" },
  voc: { label: "VOC Concentration", unit: "ppm", color: "#8b5cf6", stroke: "#7c3aed", threshold: 3.0, key: "voc" },
  gas: { label: "Spoilage / Ethylene Gas", unit: "ppm", color: "#f43f5e", stroke: "#e11d48", threshold: 1.0, key: "gas" }
};

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-mono">
        <p className="font-bold text-slate-400 mb-1">⏰ {label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="font-bold">
            {entry.name}: {entry.value} {entry.unit}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

function SensorOutputGraph() {
  const { selectedNodeId, activeTelemetry, getNodeTelemetryHistory } = useTelemetry();
  const [activeMetric, setActiveMetric] = useState("temperature");
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load telemetry history & append latest telemetry packet
  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      setIsLoading(true);
      const records = await getNodeTelemetryHistory(selectedNodeId, 30);
      if (!isMounted) return;

      if (records && records.length > 0) {
        const formatted = records.map((rec, idx) => {
          const timeStr = rec.timestamp
            ? new Date(rec.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
            : `T-${records.length - idx}`;
          const s = rec.sensors || {};
          return {
            time: timeStr,
            temperature: s.temperature?.value ?? 5.5,
            humidity: s.humidity?.value ?? 71.0,
            co2: s.co2?.value ?? 600,
            voc: s.voc?.value ?? 1.5,
            gas: s.gas?.value ?? 0.42,
            battery: rec.device?.batteryPercent ?? 85
          };
        });
        setChartData(formatted);
      } else if (activeTelemetry?.sensors) {
        const s = activeTelemetry.sensors;
        setChartData([
          {
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            temperature: s.temperature?.value ?? 5.5,
            humidity: s.humidity?.value ?? 71.0,
            co2: s.co2?.value ?? 600,
            voc: s.voc?.value ?? 1.5,
            gas: s.gas?.value ?? 0.42,
            battery: activeTelemetry.device?.batteryPercent ?? 85
          }
        ]);
      }
      setIsLoading(false);
    };

    fetchHistory();
  }, [selectedNodeId]);

  // Dynamically update chart when new activeTelemetry packet arrives
  const activePacketId = activeTelemetry?.telemetryId || activeTelemetry?.timestamp;
  useEffect(() => {
    if (!activeTelemetry?.sensors) return;
    const s = activeTelemetry.sensors;
    const timeStr = activeTelemetry.timestamp
      ? new Date(activeTelemetry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    const newPoint = {
      time: timeStr,
      temperature: s.temperature?.value ?? 5.5,
      humidity: s.humidity?.value ?? 71.0,
      co2: s.co2?.value ?? 600,
      voc: s.voc?.value ?? 1.5,
      gas: s.gas?.value ?? 0.42,
      battery: activeTelemetry.device?.batteryPercent ?? 85
    };

    setChartData((prev) => {
      if (prev.length === 0) return [newPoint];
      const lastPoint = prev[prev.length - 1];
      if (
        lastPoint.temperature === newPoint.temperature &&
        lastPoint.humidity === newPoint.humidity &&
        lastPoint.co2 === newPoint.co2 &&
        lastPoint.gas === newPoint.gas
      ) {
        return prev;
      }
      if (lastPoint.time === timeStr) {
        return [...prev.slice(0, -1), newPoint];
      }
      return [...prev.slice(-29), newPoint];
    });
  }, [activePacketId]);

  const cfg = METRIC_CONFIGS[activeMetric];
  const latestValue = chartData.length > 0 ? chartData[chartData.length - 1][cfg.key] : "--";
  const isBreached = typeof latestValue === "number" && latestValue > cfg.threshold;

  return (
    <div className="glass-card glass-card-hover rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header & Metric Selector Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-black text-white">
              📊 Real-Time Hardware Sensor Output Graph
            </h3>
            <span className="text-xs font-mono font-bold bg-slate-800 text-cyan-300 px-3 py-1 rounded-full border border-slate-700">
              {selectedNodeId}
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Live time-series graph response to hardware telemetry & manual slider adjustments.
          </p>
        </div>

        {/* Metric Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto">
          {Object.keys(METRIC_CONFIGS).map((mKey) => (
            <button
              key={mKey}
              onClick={() => setActiveMetric(mKey)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeMetric === mKey
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 scale-105"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {METRIC_CONFIGS[mKey].label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric KPI Indicator Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
        <div className="bg-slate-900/90 p-4.5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono font-bold text-slate-400 uppercase">Current Reading</p>
            <p className="text-3xl font-black text-white mt-1 font-mono">
              {latestValue} <span className="text-sm font-semibold text-slate-400">{cfg.unit}</span>
            </p>
          </div>
          <span className="w-4 h-4 rounded-full animate-pulse-glow" style={{ backgroundColor: cfg.color, boxShadow: `0 0 15px ${cfg.color}` }}></span>
        </div>

        <div className="bg-slate-900/90 p-4.5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono font-bold text-slate-400 uppercase">Warning Threshold</p>
            <p className="text-3xl font-black text-amber-400 mt-1 font-mono">
              &gt; {cfg.threshold} <span className="text-sm font-semibold text-slate-400">{cfg.unit}</span>
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg">LIMIT</span>
        </div>

        <div className={`p-4.5 rounded-2xl border flex items-center justify-between transition-all ${
          isBreached ? "bg-rose-500/20 border-rose-500/50 text-rose-300 glow-rose" : "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 glow-emerald"
        }`}>
          <div>
            <p className="text-xs font-bold uppercase opacity-80 font-mono">Condition Status</p>
            <p className="text-xl font-black mt-1">
              {isBreached ? "⚠️ THRESHOLD BREACH" : "✓ OPTIMAL RANGE"}
            </p>
          </div>
          <span className="text-2xl">{isBreached ? "🚨" : "🛡️"}</span>
        </div>
      </div>

      {/* Main Recharts Area */}
      <div className="h-80 w-full pt-2 relative z-10">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${cfg.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={cfg.color} stopOpacity={0.5} />
                  <stop offset="95%" stopColor={cfg.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                axisLine={{ stroke: "#334155" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                axisLine={{ stroke: "#334155" }}
                tickLine={false}
                unit={cfg.unit}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={cfg.threshold}
                label={{ value: `Max Limit: ${cfg.threshold} ${cfg.unit}`, fill: "#f43f5e", fontSize: 11, fontWeight: "bold" }}
                stroke="#f43f5e"
                strokeDasharray="4 4"
              />
              <Area
                type="monotone"
                dataKey={cfg.key}
                name={cfg.label}
                unit={cfg.unit}
                stroke={cfg.stroke}
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#gradient-${cfg.key})`}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs">
            Loading telemetry data stream...
          </div>
        )}
      </div>
    </div>
  );
}

export default SensorOutputGraph;
