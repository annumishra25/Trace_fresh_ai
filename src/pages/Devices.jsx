import SectionCard from "../components/SectionCard/SectionCard";
import StatusBadge from "../components/StatusBadge/StatusBadge";
import HealthBar from "../components/HealthBar/HealthBar";
import MetricCard from "../components/MetricCard/MetricCard";

function Devices() {
  return (
    <div className="space-y-6">

      <h1 className="text-4xl font-bold">
        Device Operations Center
      </h1>

      {/* Edge Node */}

      <SectionCard title="Edge Compute Node">

        <div className="flex justify-between mb-6">

          <StatusBadge status="ONLINE" />

          <HealthBar value={98} />

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          <MetricCard
            title="CPU Usage"
            value="32"
            unit="%"
          />

          <MetricCard
            title="Memory Usage"
            value="48"
            unit="%"
          />

          <MetricCard
            title="Storage"
            value="61"
            unit="%"
          />

          <MetricCard
            title="Uptime"
            value="124"
            unit="hrs"
          />

        </div>

      </SectionCard>

      {/* Vision System */}

      <SectionCard title="Vision Intelligence System">

        <div className="flex justify-between mb-6">

          <StatusBadge status="ONLINE" />

          <HealthBar value={97} />

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          <MetricCard
            title="Images Captured"
            value="1248"
            unit=""
          />

          <MetricCard
            title="Detection Accuracy"
            value="96.4"
            unit="%"
          />

          <MetricCard
            title="Inference Time"
            value="1.8"
            unit="sec"
          />

          <MetricCard
            title="Last Inspection"
            value="2"
            unit="sec ago"
          />

        </div>

      </SectionCard>

      {/* Sensor Health */}

      <SectionCard title="Sensor Health Matrix">

        <table className="w-full">

          <thead>

            <tr className="border-b">

              <th className="text-left py-3">
                Sensor
              </th>

              <th>Status</th>

              <th>Health</th>

              <th>Last Sync</th>

            </tr>

          </thead>

          <tbody>

            <tr className="border-b">
              <td className="py-3">SHT45</td>
              <td>🟢 Online</td>
              <td>99%</td>
              <td>2 sec ago</td>
            </tr>

            <tr className="border-b">
              <td className="py-3">SGP40</td>
              <td>🟢 Online</td>
              <td>98%</td>
              <td>2 sec ago</td>
            </tr>

            <tr className="border-b">
              <td className="py-3">SCD41</td>
              <td>🟢 Online</td>
              <td>99%</td>
              <td>2 sec ago</td>
            </tr>

            <tr className="border-b">
              <td className="py-3">ZE03-C2H4</td>
              <td>🟢 Online</td>
              <td>97%</td>
              <td>2 sec ago</td>
            </tr>

            <tr>
              <td className="py-3">HX711</td>
              <td>🟢 Online</td>
              <td>99%</td>
              <td>2 sec ago</td>
            </tr>

          </tbody>

        </table>

      </SectionCard>

      {/* Connectivity */}

      <SectionCard title="Communication Layer">

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          <MetricCard
            title="4G Signal"
            value="-67"
            unit="dBm"
          />

          <MetricCard
            title="GPS Satellites"
            value="11"
            unit=""
          />

          <MetricCard
            title="Location Accuracy"
            value="1.2"
            unit="m"
          />

          <MetricCard
            title="Data Throughput"
            value="248"
            unit="KB/min"
          />

        </div>

      </SectionCard>

    </div>
  );
}

export default Devices;