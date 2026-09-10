import { useEffect, useState } from "react";
import AnalyticsChart from "../components/AnalyticsSection/AnalyticsChart";
import LiveMultiSensorAnalytics from "../components/AnalyticsSection/LiveMultiSensorAnalytics";
import AIInsights from "../components/AIInsights/AIInsights";
import PredictivePanel from "../components/PredictivePanel/PredictivePanel";
import { useTelemetry } from "../context/TelemetryContext";

function Analytics() {
  const { selectedNodeId, setSelectedNodeId, nodes, getNodeTelemetryHistory, activeTelemetry } = useTelemetry();
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadHistory = async (isInitial = false) => {
      if (isInitial) setLoading(true);
      const records = await getNodeTelemetryHistory(selectedNodeId, 50);
      if (!isMounted) return;

      const formatted = records.map((rec) => {
        const timeStr = rec.timestamp
          ? new Date(rec.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
          : "--";
        const s = rec.sensors || {};
        return {
          time: timeStr,
          temperature: s.temperature?.value ?? null,
          humidity: s.humidity?.value ?? null,
          co2: s.co2?.value ?? null,
          voc: s.voc?.value ?? null,
          gas: s.gas?.value ?? null
        };
      });

      setHistoryData(formatted);
      if (isInitial) setLoading(false);
    };

    loadHistory(true);
    const interval = setInterval(() => loadHistory(false), 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedNodeId, getNodeTelemetryHistory]);

  const hasHistory = historyData.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-100 tracking-tight">
            Environmental Intelligence Center
          </h1>
          <p className="text-slate-300 mt-1 text-sm font-medium">
            Real-time Telemetry Analytics & Multi-Sensor Historical Trends
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800 shadow-md">
          <label className="text-xs font-bold text-slate-300">Selected Node:</label>
          <select
            value={selectedNodeId}
            onChange={(e) => setSelectedNodeId(e.target.value)}
            className="rounded-xl border border-slate-700 px-3 py-1.5 text-xs font-extrabold text-slate-100 bg-slate-950 outline-none focus:border-blue-500 transition"
          >
            {nodes.map((n) => (
              <option key={n.nodeId} value={n.nodeId}>
                {n.nodeId} — {n.status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Stream Chart */}
      {hasHistory ? (
        <AnalyticsChart
          title={`Live Temperature Stream (${selectedNodeId})`}
          data={historyData}
          dataKey="temperature"
        />
      ) : (
        <div className="glass-card bg-slate-900/80 rounded-3xl border border-slate-800 p-12 text-center text-slate-300 font-medium">
          No telemetry available for node <span className="font-bold text-blue-400">{selectedNodeId}</span> yet.
          <p className="text-xs text-slate-400 mt-1">Run the telemetry simulator to generate time-series telemetry.</p>
        </div>
      )}

      <LiveMultiSensorAnalytics historyData={historyData} />

      {/* Executive KPI Layer */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="glass-card bg-slate-900/80 rounded-3xl p-5 border border-slate-800/80">
          <h3 className="text-slate-300 text-xs font-bold uppercase tracking-wider">Live Temperature</h3>
          <p className="text-4xl font-black text-slate-100 font-mono mt-1">
            {activeTelemetry?.sensors?.temperature?.value != null ? `${activeTelemetry.sensors.temperature.value}°C` : "5.5°C"}
          </p>
        </div>

        <div className="glass-card bg-slate-900/80 rounded-3xl p-5 border border-slate-800/80">
          <h3 className="text-slate-300 text-xs font-bold uppercase tracking-wider">Live Humidity</h3>
          <p className="text-4xl font-black text-cyan-300 font-mono mt-1">
            {activeTelemetry?.sensors?.humidity?.value != null ? `${activeTelemetry.sensors.humidity.value}%` : "71%"}
          </p>
        </div>

        <div className="glass-card bg-slate-900/80 rounded-3xl p-5 border border-slate-800/80">
          <h3 className="text-slate-300 text-xs font-bold uppercase tracking-wider">Spoilage Risk</h3>
          <p className="text-4xl font-black text-amber-400 font-mono mt-1">8%</p>
        </div>

        <div className="glass-card bg-slate-900/80 rounded-3xl p-5 border border-slate-800/80">
          <h3 className="text-slate-300 text-xs font-bold uppercase tracking-wider">AI Confidence</h3>
          <p className="text-4xl font-black text-emerald-400 font-mono mt-1">96.4%</p>
        </div>
      </div>

      {/* Trend Analytics Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {hasHistory ? (
          <>
            <AnalyticsChart title="Temperature Trend (°C)" data={historyData} dataKey="temperature" color="#3b82f6" />
            <AnalyticsChart title="Humidity Trend (%)" data={historyData} dataKey="humidity" color="#10b981" />
            <AnalyticsChart title="CO₂ Concentration Trend (ppm)" data={historyData} dataKey="co2" color="#f43f5e" />
            <AnalyticsChart title="VOC Trend (ppm)" data={historyData} dataKey="voc" color="#f97316" />
            <AnalyticsChart title="Combustible Gas Trend (ppm)" data={historyData} dataKey="gas" color="#a855f7" />
          </>
        ) : (
          <div className="xl:col-span-2 glass-card bg-slate-900/80 rounded-3xl p-8 text-center text-slate-300 border border-slate-800">
            No telemetry available for historical trend charts.
          </div>
        )}
      </div>

      {/* Shelf Life Forecast */}
      <div className="glass-card bg-slate-900/80 rounded-3xl p-6 md:p-8 border border-slate-800 space-y-4">
        <h2 className="text-2xl font-black text-slate-100 tracking-tight">
          Shelf Life Forecast Diagnostics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl">
            <p className="text-slate-300 text-xs font-bold uppercase tracking-wider">Current Shelf Life</p>
            <p className="text-3xl font-black text-emerald-400 font-mono mt-1">9 Days</p>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl">
            <p className="text-slate-300 text-xs font-bold uppercase tracking-wider">Projected Shelf Life</p>
            <p className="text-3xl font-black text-amber-400 font-mono mt-1">7 Days</p>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl">
            <p className="text-slate-300 text-xs font-bold uppercase tracking-wider">Critical Threshold</p>
            <p className="text-3xl font-black text-rose-400 font-mono mt-1">3 Days</p>
          </div>
        </div>
      </div>

      <AIInsights />
      <PredictivePanel />
    </div>
  );
}

export default Analytics;
