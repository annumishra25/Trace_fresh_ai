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
  temperature: { label: "Temperature", unit: "°C", color: "#D97706", stroke: "#B45309", threshold: 25, key: "temperature" },
  humidity: { label: "Humidity", unit: "%", color: "#0284C7", stroke: "#0369A1", threshold: 85, key: "humidity" },
  co2: { label: "CO₂ Concentration", unit: "ppm", color: "#064C3B", stroke: "#042E25", threshold: 1000, key: "co2" },
  voc: { label: "VOC Concentration", unit: "ppm", color: "#7C3AED", stroke: "#6D28D9", threshold: 3.0, key: "voc" },
  gas: { label: "Spoilage / Ethylene Gas", unit: "ppm", color: "#DC2626", stroke: "#B91C1C", threshold: 1.0, key: "gas" }
};

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white text-[#111715] p-3 rounded-xl shadow-lg border border-[#DDE4DF] text-xs font-mono">
        <p className="font-extrabold text-[#56635D] mb-1">⏰ {label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="font-extrabold">
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
    <div className="bg-white border border-[#DDE4DF] rounded-2xl p-6 md:p-8 shadow-xs space-y-6 relative overflow-hidden">
      {/* Header & Metric Selector Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10 border-b border-[#DDE4DF] pb-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#111715] tracking-tight">
              Real-Time Hardware Sensor Output Graph
            </h3>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-[#E4F5EC] text-[#064C3B] border border-[#C3E9D5]">
              ● {selectedNodeId}
            </span>
          </div>
          <p className="text-[#56635D] text-xs mt-1 font-semibold">
            Live time-series graph response to hardware telemetry & manual slider adjustments.
          </p>
        </div>

        {/* Metric Tabs */}
        <div className="flex items-center gap-1.5 bg-[#FAFBF8] p-1.5 rounded-xl border border-[#DDE4DF] overflow-x-auto">
          {Object.keys(METRIC_CONFIGS).map((mKey) => (
            <button
              key={mKey}
              onClick={() => setActiveMetric(mKey)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                activeMetric === mKey
                  ? "bg-[#064C3B] text-white shadow-xs"
                  : "text-[#111715] hover:text-[#064C3B]"
              }`}
            >
              {METRIC_CONFIGS[mKey].label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric KPI Indicator Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
        <div className="bg-[#FAFBF8] p-4 rounded-xl border border-[#DDE4DF] flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold text-[#56635D] uppercase tracking-wider">Current Reading</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#111715] mt-1">
              {latestValue} <span className="text-sm font-bold text-[#56635D]">{cfg.unit}</span>
            </p>
          </div>
          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: cfg.color }}></span>
        </div>

        <div className="bg-[#FAFBF8] p-4 rounded-xl border border-[#DDE4DF] flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold text-[#56635D] uppercase tracking-wider">Warning Threshold</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#D97706] mt-1">
              &gt; {cfg.threshold} <span className="text-sm font-bold text-[#56635D]">{cfg.unit}</span>
            </p>
          </div>
          <span className="text-xs font-extrabold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] px-2.5 py-1 rounded-lg">LIMIT</span>
        </div>

        <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
          isBreached ? "bg-[#FEE2E2] border-[#FCA5A5] text-[#991B1B]" : "bg-[#E4F5EC] border-[#C3E9D5] text-[#064C3B]"
        }`}>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider opacity-90">Condition Status</p>
            <p className="text-lg font-extrabold mt-0.5">
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
                  <stop offset="5%" stopColor={cfg.color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={cfg.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EEE7" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: "#56635D", fontWeight: 700 }}
                axisLine={{ stroke: "#DDE4DF" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#56635D", fontWeight: 700 }}
                axisLine={{ stroke: "#DDE4DF" }}
                tickLine={false}
                unit={cfg.unit}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={cfg.threshold}
                label={{ value: `Max Limit: ${cfg.threshold} ${cfg.unit}`, fill: "#DC2626", fontSize: 11, fontWeight: "bold" }}
                stroke="#DC2626"
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
          <div className="h-full flex items-center justify-center text-[#56635D] font-bold text-xs">
            Loading telemetry data stream...
          </div>
        )}
      </div>
    </div>
  );
}

export default SensorOutputGraph;

