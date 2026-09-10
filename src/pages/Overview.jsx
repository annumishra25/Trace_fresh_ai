import SectionCard from "../components/SectionCard/SectionCard";
import MetricCard from "../components/MetricCard/MetricCard";
import StatusBadge from "../components/StatusBadge/StatusBadge";
import AlertCenter from "../components/AlertCenter/AlertCenter";
import SystemHealth from "../components/SystemHealth/SystemHealth";

function Overview() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-black text-white tracking-tight">
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
          <span className="font-bold text-white text-sm">
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-emerald-800/80 bg-[#03140e]/80 text-emerald-200 font-bold">
                <th className="py-3 px-4 rounded-l-xl">Category</th>
                <th className="py-3 px-4 text-center">Count</th>
                <th className="py-3 px-4 text-center rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-800/50">
              <tr className="hover:bg-emerald-900/30 transition-colors">
                <td className="py-3 px-4 font-bold text-white">Safe</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-emerald-300">42</td>
                <td className="py-3 px-4 text-center text-lg">🟢</td>
              </tr>
              <tr className="hover:bg-emerald-900/30 transition-colors">
                <td className="py-3 px-4 font-bold text-white">Warning</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-emerald-300">5</td>
                <td className="py-3 px-4 text-center text-lg">🟡</td>
              </tr>
              <tr className="hover:bg-emerald-900/30 transition-colors">
                <td className="py-3 px-4 font-bold text-white">Critical</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-emerald-300">1</td>
                <td className="py-3 px-4 text-center text-lg">🔴</td>
              </tr>
            </tbody>
          </table>
        </div>
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