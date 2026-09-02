import SectionCard from "../components/SectionCard/SectionCard";
import MetricCard from "../components/MetricCard/MetricCard";
import StatusBadge from "../components/StatusBadge/StatusBadge";
import AlertCenter from "../components/AlertCenter/AlertCenter";
import SystemHealth from "../components/SystemHealth/SystemHealth";

function Overview() {
  return (
    <div className="space-y-6">

      <h1 className="text-4xl font-bold">
        Executive Operations Dashboard
      </h1>

      {/* Executive KPIs */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <MetricCard
          title="Platform Health"
          value="98"
          unit="%"
        />

        <MetricCard
          title="Active Devices"
          value="9"
          unit=""
        />

        <MetricCard
          title="Monitored Batches"
          value="48"
          unit=""
        />

        <MetricCard
          title="Open Alerts"
          value="2"
          unit=""
        />

      </div>

      {/* System Status */}

      <SectionCard title="System Status">

        <div className="flex items-center gap-4">

          <StatusBadge status="ONLINE" />

          <span className="font-medium">
            All core systems operational
          </span>

        </div>

      </SectionCard>

      {/* Latest Inspection */}

      <SectionCard title="Latest Inspection Summary">

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          <MetricCard
            title="Fruit"
            value="Apple"
            unit=""
          />

          <MetricCard
            title="Condition"
            value="Fresh"
            unit=""
          />

          <MetricCard
            title="Confidence"
            value="96.4"
            unit="%"
          />

          <MetricCard
            title="Health Score"
            value="94"
            unit="/100"
          />

        </div>

      </SectionCard>

      {/* Supply Chain Risk */}

      <SectionCard title="Supply Chain Risk Distribution">

        <table className="w-full">

          <thead>

            <tr className="border-b">

              <th className="text-left py-3">
                Category
              </th>

              <th>Count</th>

              <th>Status</th>

            </tr>

          </thead>

          <tbody>

            <tr className="border-b">

              <td className="py-3">
                Safe
              </td>

              <td>42</td>

              <td>🟢</td>

            </tr>

            <tr className="border-b">

              <td className="py-3">
                Warning
              </td>

              <td>5</td>

              <td>🟡</td>

            </tr>

            <tr>

              <td className="py-3">
                Critical
              </td>

              <td>1</td>

              <td>🔴</td>

            </tr>

          </tbody>

        </table>

      </SectionCard>

      {/* Operations Layer */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <AlertCenter />

        <SystemHealth />

      </div>

      {/* Fleet Summary */}

      <SectionCard title="Fleet Performance Summary">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <MetricCard
            title="Inspections Today"
            value="124"
            unit=""
          />

          <MetricCard
            title="Successful Predictions"
            value="98.2"
            unit="%"
          />

          <MetricCard
            title="Avg Inspection Time"
            value="1.8"
            unit="sec"
          />

        </div>

      </SectionCard>

    </div>
  );
}

export default Overview;