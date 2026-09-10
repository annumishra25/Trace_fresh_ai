import { useTelemetry } from "../../context/TelemetryContext";

function NodeComparisonTable() {
  const { nodes, latestTelemetryMap } = useTelemetry();

  const node1 = nodes.find((n) => n.nodeId === "TF-NODE-01") || nodes[0] || {};
  const node2 = nodes.find((n) => n.nodeId === "TF-NODE-02") || nodes[1] || {};

  const tel1 = latestTelemetryMap["TF-NODE-01"] || node1.latestTelemetry || {};
  const tel2 = latestTelemetryMap["TF-NODE-02"] || node2.latestTelemetry || {};

  const s1 = tel1.sensors || {};
  const s2 = tel2.sensors || {};

  const formatSensorVal = (sensorObj, defaultUnit) => {
    if (!sensorObj) return "N/A";
    if (sensorObj.status === "MISSING") return "Not Connected";
    if (sensorObj.status === "ERROR") return "Sensor Error";
    if (sensorObj.value == null) return "N/A";
    return `${sensorObj.value} ${sensorObj.unit || defaultUnit}`;
  };

  const getGpsVal = (gpsObj) => {
    if (!gpsObj) return "NO FIX";
    if (gpsObj.status === "LOCKED" && gpsObj.latitude != null) {
      return `${gpsObj.latitude.toFixed(4)}, ${gpsObj.longitude.toFixed(4)}`;
    }
    return gpsObj.status || "NO FIX";
  };

  const metrics = [
    {
      label: "Node Status",
      val1: node1.status || "OFFLINE",
      val2: node2.status || "OFFLINE",
      isStatus: true
    },
    {
      label: "Data Source",
      val1: (node1.source || tel1.source || "simulator").toUpperCase(),
      val2: (node2.source || tel2.source || "simulator").toUpperCase(),
    },
    {
      label: "Temperature (°C)",
      val1: formatSensorVal(s1.temperature, "°C"),
      val2: formatSensorVal(s2.temperature, "°C"),
    },
    {
      label: "Humidity (%)",
      val1: formatSensorVal(s1.humidity, "%"),
      val2: formatSensorVal(s2.humidity, "%"),
    },
    {
      label: "CO₂ Concentration (ppm)",
      val1: formatSensorVal(s1.co2, "ppm"),
      val2: formatSensorVal(s2.co2, "ppm"),
    },
    {
      label: "VOC Level (ppm)",
      val1: formatSensorVal(s1.voc, "ppm"),
      val2: formatSensorVal(s2.voc, "ppm"),
    },
    {
      label: "Combustible Gas (ppm)",
      val1: formatSensorVal(s1.gas, "ppm"),
      val2: formatSensorVal(s2.gas, "ppm"),
    },
    {
      label: "GPS Location / Lock",
      val1: getGpsVal(tel1.gps),
      val2: getGpsVal(tel2.gps),
    },
    {
      label: "Battery Level (%)",
      val1: node1.batteryPercent != null ? `${node1.batteryPercent}%` : "N/A",
      val2: node2.batteryPercent != null ? `${node2.batteryPercent}%` : "N/A",
    },
    {
      label: "Wi-Fi Signal (4G/LTE)",
      val1: node1.signalStrengthDbm != null ? `${node1.signalStrengthDbm} dBm` : "N/A",
      val2: node2.signalStrengthDbm != null ? `${node2.signalStrengthDbm} dBm` : "N/A",
    },
    {
      label: "Firmware Version",
      val1: node1.firmwareVersion || tel1.device?.firmwareVersion || "0.1.0",
      val2: node2.firmwareVersion || tel2.device?.firmwareVersion || "0.1.0",
    },
  ];

  return (
    <div className="glass-card border border-slate-800/80 rounded-3xl p-6 md:p-8 relative overflow-hidden bg-slate-900/80 backdrop-blur-xl shadow-2xl">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-80" />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full inline-flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Side-by-Side Node Diagnostics
          </span>
          <h2 className="text-2xl font-bold text-slate-100 mt-2 tracking-tight">
            Multi-Node Environmental & Device Comparison
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Real-time telemetry comparison between registered smart monitoring nodes
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-950/60 text-slate-300 font-bold">
              <th className="py-3.5 px-4 rounded-l-xl">Telemetry Metric</th>
              <th className="py-3.5 px-4 text-center">
                <span className="font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-md mr-1.5 text-xs font-semibold shadow-sm">TF-NODE-01</span>
                <span className="text-slate-400 text-xs font-normal">(Container A)</span>
              </th>
              <th className="py-3.5 px-4 text-center rounded-r-xl">
                <span className="font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-md mr-1.5 text-xs font-semibold shadow-sm">TF-NODE-02</span>
                <span className="text-slate-400 text-xs font-normal">(Container B)</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {metrics.map((m, idx) => (
              <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-medium text-slate-300">{m.label}</td>
                <td className="py-3.5 px-4 text-center font-semibold text-slate-100">
                  {m.isStatus ? (
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                      m.val1 === "ONLINE" || m.val1 === "SIMULATED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 glow-emerald"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    }`}>
                      {m.val1}
                    </span>
                  ) : (
                    <span className="font-mono text-slate-200">{m.val1}</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-center font-semibold text-slate-100">
                  {m.isStatus ? (
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                      m.val2 === "ONLINE" || m.val2 === "SIMULATED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 glow-emerald"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    }`}>
                      {m.val2}
                    </span>
                  ) : (
                    <span className="font-mono text-slate-200">{m.val2}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default NodeComparisonTable;
