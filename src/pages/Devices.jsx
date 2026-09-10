import SectionCard from "../components/SectionCard/SectionCard";
import StatusBadge from "../components/StatusBadge/StatusBadge";
import HealthBar from "../components/HealthBar/HealthBar";
import MetricCard from "../components/MetricCard/MetricCard";
import DeviceHealthCard from "../components/DeviceHealthCard/DeviceHealthCard";
import HardwareSensorControl from "../components/HardwareSensorControl/HardwareSensorControl";
import { useTelemetry } from "../context/TelemetryContext";

function Devices() {
  const { nodes, selectedNodeId, setSelectedNodeId } = useTelemetry();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-100 tracking-tight">
            Device Management & Operations Center
          </h1>
          <p className="text-slate-300 mt-1 text-sm font-medium">
            Registered Smart Monitoring Nodes, Calibration Matrix & Health Diagnostics
          </p>
        </div>
      </div>

      {/* Device Health Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DeviceHealthCard nodeId="TF-NODE-01" />
        <DeviceHealthCard nodeId="TF-NODE-02" />
      </div>

      {/* Hardware Model Connection & Control Panel */}
      <HardwareSensorControl />

      {/* Sensor Calibration & Health Matrix */}
      <SectionCard title="Sensor Calibration & Health Matrix">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-300 font-bold uppercase text-xs tracking-wider">
                <th className="py-3 px-4">Sensor Subsystem</th>
                <th className="py-3 px-4 text-center">Node 01 Status</th>
                <th className="py-3 px-4 text-center">Node 02 Status</th>
                <th className="py-3 px-4 text-center">Calibration State</th>
                <th className="py-3 px-4 text-center">Health Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              <tr className="hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-4 font-extrabold text-slate-100">Temperature (DHT11 / SHT45)</td>
                <td className="text-center"><span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs">🟢 OK</span></td>
                <td className="text-center"><span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs">🟢 OK</span></td>
                <td className="text-center"><span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold text-xs">CALIBRATED</span></td>
                <td className="text-center font-black text-emerald-400 font-mono">99%</td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-4 font-extrabold text-slate-100">Humidity (%RH Sensor)</td>
                <td className="text-center"><span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs">🟢 OK</span></td>
                <td className="text-center"><span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs">🟢 OK</span></td>
                <td className="text-center"><span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold text-xs">CALIBRATED</span></td>
                <td className="text-center font-black text-emerald-400 font-mono">98%</td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-4 font-extrabold text-slate-100">CO₂ Concentration (SCD41 NDIR)</td>
                <td className="text-center"><span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-bold text-xs">⚪ MISSING</span></td>
                <td className="text-center"><span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs">🟢 OK</span></td>
                <td className="text-center"><span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs">REQUIRED</span></td>
                <td className="text-center font-black text-emerald-400 font-mono">95%</td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-4 font-extrabold text-slate-100">VOC / Air Quality (MQ135 Analog)</td>
                <td className="text-center"><span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs">🟢 OK</span></td>
                <td className="text-center"><span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs">🟢 OK</span></td>
                <td className="text-center"><span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs">REQUIRED</span></td>
                <td className="text-center font-black text-emerald-400 font-mono">97%</td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-4 font-extrabold text-slate-100">GPS Position (NEO-6M UART)</td>
                <td className="text-center"><span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs">🟢 LOCKED</span></td>
                <td className="text-center"><span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs">🟢 LOCKED</span></td>
                <td className="text-center"><span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold text-xs">CALIBRATED</span></td>
                <td className="text-center font-black text-emerald-400 font-mono">99%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Edge Compute Node */}
      <SectionCard title="Edge Compute Node">
        <div className="flex justify-between mb-6">
          <StatusBadge status="ONLINE" />
          <HealthBar value={98} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard title="CPU Usage" value="32" unit="%" />
          <MetricCard title="Memory Usage" value="48" unit="%" />
          <MetricCard title="Storage" value="61" unit="%" />
          <MetricCard title="Uptime" value="124" unit="hrs" />
        </div>
      </SectionCard>

      {/* Vision System */}
      <SectionCard title="Vision Intelligence System">
        <div className="flex justify-between mb-6">
          <StatusBadge status="ONLINE" />
          <HealthBar value={97} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard title="Images Captured" value="1248" unit="" />
          <MetricCard title="Detection Accuracy" value="96.4" unit="%" />
          <MetricCard title="Inference Time" value="1.8" unit="sec" />
          <MetricCard title="Last Inspection" value="2" unit="sec ago" />
        </div>
      </SectionCard>

      {/* Communication Layer */}
      <SectionCard title="Communication Layer">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard title="4G/LTE Signal" value="-61" unit="dBm" />
          <MetricCard title="GPS Satellites" value="11" unit="" />
          <MetricCard title="Location Accuracy" value="1.2" unit="m" />
          <MetricCard title="Data Throughput" value="248" unit="KB/min" />
        </div>
      </SectionCard>
    </div>
  );
}

export default Devices;