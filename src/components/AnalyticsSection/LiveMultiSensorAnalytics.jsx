import {
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from "recharts";

function LiveMultiSensorAnalytics({ historyData = [] }) {
  if (!historyData || historyData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
        <h2 className="text-2xl font-bold mb-3 text-slate-900">
          Environmental Multi-Sensor Overlay
        </h2>
        <div className="py-16 text-center text-slate-400 font-medium">
          No telemetry available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
      <h2 className="text-2xl font-bold mb-5 text-slate-900">
        Environmental Multi-Sensor Overlay
      </h2>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={historyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="time" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#2563eb" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#16a34a" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="co2" name="CO₂ (ppm)" stroke="#dc2626" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="voc" name="VOC (ppm)" stroke="#ea580c" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="gas" name="Gas (ppm)" stroke="#7c3aed" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LiveMultiSensorAnalytics;