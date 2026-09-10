import SectionCard from "../components/SectionCard/SectionCard";
import MetricCard from "../components/MetricCard/MetricCard";
import StatusBadge from "../components/StatusBadge/StatusBadge";
import AlertCenter from "../components/AlertCenter/AlertCenter";
import SystemHealth from "../components/SystemHealth/SystemHealth";

function Overview() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DCE4DE] dark:border-[#23483D]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101513] dark:text-[#F4F7F2] tracking-tight">
            Executive Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#4E5B55] dark:text-[#AEBBB4] mt-1">
            Real-time telemetry, produce freshness analytics & supply chain risk matrix
          </p>
        </div>
      </div>

      {/* Executive KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
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
          <span className="font-semibold text-[#101513] dark:text-[#F4F7F2] text-sm">
            All core telemetry bridges and AI prediction models operational
          </span>
        </div>
      </SectionCard>

      {/* Latest Inspection */}
      <SectionCard title="Latest Inspection Summary">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            title="Fruit Type"
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
              <tr className="border-b border-[#DCE4DE] dark:border-[#23483D] bg-[#F1F4EE] dark:bg-[#12342A] text-[#063C2F] dark:text-[#36B88A] font-bold text-xs uppercase tracking-wider">
                <th className="py-3 px-4 rounded-l-lg">Risk Category</th>
                <th className="py-3 px-4 text-center">Batch Count</th>
                <th className="py-3 px-4 text-center rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4DE] dark:divide-[#23483D]">
              <tr className="hover:bg-[#F7F8F3] dark:hover:bg-[#12342A]/50 transition-colors">
                <td className="py-3 px-4 font-semibold text-[#101513] dark:text-[#F4F7F2]">Safe Range</td>
                <td className="py-3 px-4 text-center font-bold text-[#063C2F] dark:text-[#36B88A]">42</td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DDF2E8] text-[#063C2F] border border-[#16805F]/20">
                    Optimal
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#F7F8F3] dark:hover:bg-[#12342A]/50 transition-colors">
                <td className="py-3 px-4 font-semibold text-[#101513] dark:text-[#F4F7F2]">Warning Threshold</td>
                <td className="py-3 px-4 text-center font-bold text-[#D97706]">5</td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#D97706]/20">
                    Elevated
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#F7F8F3] dark:hover:bg-[#12342A]/50 transition-colors">
                <td className="py-3 px-4 font-semibold text-[#101513] dark:text-[#F4F7F2]">Critical Spoilage</td>
                <td className="py-3 px-4 text-center font-bold text-[#DC2626]">1</td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#991B1B] border border-[#DC2626]/20">
                    Immediate Action
                  </span>
                </td>
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