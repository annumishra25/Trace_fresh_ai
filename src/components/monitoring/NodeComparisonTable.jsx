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
    <div className="bg-white border border-[#DDE4DF] rounded-2xl p-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-extrabold px-2.5 py-1 bg-[#E4F5EC] text-[#064C3B] border border-[#C3E9D5] rounded-md inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#064C3B]" />
            Side-by-Side Node Diagnostics
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#111715] mt-2 tracking-tight">
            Multi-Node Environmental & Device Comparison
          </h2>
          <p className="text-[#56635D] text-xs sm:text-sm mt-1 font-semibold">
            Real-time telemetry comparison between registered smart monitoring nodes
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#DDE4DF] bg-[#FAFBF8] text-[#064C3B] font-extrabold text-xs uppercase tracking-wider">
              <th className="py-3.5 px-4 rounded-l-lg">Telemetry Metric</th>
              <th className="py-3.5 px-4 text-center">
                <span className="bg-white text-[#064C3B] border border-[#DDE4DF] px-2.5 py-1 rounded-md mr-1.5 text-xs font-extrabold shadow-xs">TF-NODE-01</span>
                <span className="text-[#56635D] text-xs font-bold lowercase">(Container A)</span>
              </th>
              <th className="py-3.5 px-4 text-center rounded-r-lg">
                <span className="bg-white text-[#064C3B] border border-[#DDE4DF] px-2.5 py-1 rounded-md mr-1.5 text-xs font-extrabold shadow-xs">TF-NODE-02</span>
                <span className="text-[#56635D] text-xs font-bold lowercase">(Container B)</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDE4DF]">
            {metrics.map((m, idx) => (
              <tr key={idx} className="hover:bg-[#FAFBF8] transition-colors">
                <td className="py-3.5 px-4 font-bold text-[#111715]">{m.label}</td>
                <td className="py-3.5 px-4 text-center font-bold text-[#111715]">
                  {m.isStatus ? (
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                      m.val1 === "ONLINE" || m.val1 === "SIMULATED"
                        ? "bg-[#E4F5EC] text-[#064C3B] border border-[#C3E9D5]"
                        : "bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]"
                    }`}>
                      {m.val1}
                    </span>
                  ) : (
                    <span>{m.val1}</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-center font-bold text-[#111715]">
                  {m.isStatus ? (
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                      m.val2 === "ONLINE" || m.val2 === "SIMULATED"
                        ? "bg-[#E4F5EC] text-[#064C3B] border border-[#C3E9D5]"
                        : "bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]"
                    }`}>
                      {m.val2}
                    </span>
                  ) : (
                    <span>{m.val2}</span>
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
