import SectionCard from "../components/SectionCard/SectionCard";
import MetricCard from "../components/MetricCard/MetricCard";
import AlertCenter from "../components/AlertCenter/AlertCenter";
import SystemHealth from "../components/SystemHealth/SystemHealth";

function Overview() {
  return (
    <div className="space-y-6 max-w-[1500px] mx-auto">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DDE4DF]">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111715] tracking-tight">
            Executive Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#56635D] mt-1">
            Real-time telemetry, produce freshness analytics & supply chain risk matrix
          </p>
        </div>
      </div>

      {/* Executive KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <MetricCard
          title="PLATFORM HEALTH"
          value="98"
          unit="%"
          trend="↑ 2.4%"
          subtitle="from last period"
        />

        <MetricCard
          title="ACTIVE DEVICES"
          value="9"
          subtitle="All nodes operational"
        />

        <MetricCard
          title="MONITORED BATCHES"
          value="48"
          trend="+6"
          subtitle="this week"
        />

        <MetricCard
          title="OPEN ALERTS"
          value="2"
          subtitle="Requires attention"
        />
      </div>

      {/* Compact System Status Panel */}
      <div className="bg-white border border-[#DDE4DF] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#064C3B] animate-pulse"></div>
          <div>
            <div className="text-[10px] font-bold uppercase text-[#56635D] tracking-wider">SYSTEM STATUS</div>
            <div className="text-sm font-semibold text-[#111715] mt-0.5">
              All core telemetry bridges and AI prediction models operational
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#E4F5EC] text-[#064C3B] border border-[#C3E9D5]">
            ● ONLINE
          </span>
          <span className="text-[11px] font-mono text-[#78837D] hidden md:inline">
            Last synced: 20:19:30
          </span>
        </div>
      </div>

      {/* Latest Inspection Summary */}
      <SectionCard title="Latest Inspection Summary" subtitle="Real-time optical & thermal freshness diagnostic snapshot">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-[#FAFBF8] p-4 rounded-xl border border-[#DDE4DF]">
            <div className="text-[10px] font-mono font-bold uppercase text-[#56635D]">FRUIT TYPE</div>
            <div className="text-xl font-extrabold text-[#111715] mt-1">Apple</div>
          </div>

          <div className="bg-[#FAFBF8] p-4 rounded-xl border border-[#DDE4DF]">
            <div className="text-[10px] font-mono font-bold uppercase text-[#56635D]">CONDITION</div>
            <div className="text-xl font-extrabold text-[#064C3B] mt-1 flex items-center gap-1.5">
              Fresh <span className="w-2 h-2 rounded-full bg-[#064C3B]"></span>
            </div>
          </div>

          <div className="bg-[#FAFBF8] p-4 rounded-xl border border-[#DDE4DF]">
            <div className="text-[10px] font-mono font-bold uppercase text-[#56635D]">CONFIDENCE</div>
            <div className="text-xl font-extrabold text-[#111715] mt-1">96.4%</div>
          </div>

          <div className="bg-[#FAFBF8] p-4 rounded-xl border border-[#DDE4DF]">
            <div className="text-[10px] font-mono font-bold uppercase text-[#56635D]">HEALTH SCORE</div>
            <div className="text-xl font-extrabold text-[#111715] mt-1">94 <span className="text-xs text-[#56635D] font-normal">/ 100</span></div>
            <div className="w-full h-1.5 bg-[#EAEFEA] rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-[#064C3B] rounded-full" style={{ width: '94%' }}></div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Supply Chain Risk */}
      <SectionCard title="Supply Chain Risk Distribution" subtitle="Current batch distribution by risk category across all active logistics nodes">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#DDE4DF] bg-[#F4F7F4] text-[#064C3B] font-bold text-xs uppercase tracking-wider">
                <th className="py-3 px-4 rounded-l-lg">Risk Category</th>
                <th className="py-3 px-4 text-center">Batch Count</th>
                <th className="py-3 px-4 text-center rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE4DF]">
              <tr className="hover:bg-[#FAFBF8] transition-colors">
                <td className="py-3.5 px-4 font-semibold text-[#111715]">Safe Range</td>
                <td className="py-3.5 px-4 text-center font-bold text-[#064C3B]">42</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#E4F5EC] text-[#064C3B] border border-[#C3E9D5]">
                    Optimal
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#FAFBF8] transition-colors">
                <td className="py-3.5 px-4 font-semibold text-[#111715]">Warning Threshold</td>
                <td className="py-3.5 px-4 text-center font-bold text-[#D97706]">5</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                    Warning
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#FAFBF8] transition-colors">
                <td className="py-3.5 px-4 font-semibold text-[#111715]">Critical Spoilage</td>
                <td className="py-3.5 px-4 text-center font-bold text-[#DC2626]">1</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]">
                    Critical
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
      <SectionCard title="Fleet Performance Summary" subtitle="Daily telemetry performance indicators">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="INSPECTIONS TODAY"
            value="124"
            subtitle="scans registered"
          />

          <MetricCard
            title="PREDICTION ACCURACY"
            value="98.2"
            unit="%"
            trend="↑ 0.4%"
          />

          <MetricCard
            title="AVG INSPECTION TIME"
            value="1.8"
            unit="sec"
            subtitle="edge inferencing speed"
          />
        </div>
      </SectionCard>
    </div>
  );
}

export default Overview;