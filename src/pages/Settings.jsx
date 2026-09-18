import SectionCard from "../components/SectionCard/SectionCard";
import MetricCard from "../components/MetricCard/MetricCard";
import StatusBadge from "../components/StatusBadge/StatusBadge";

function Settings() {
  return (
    <div className="space-y-6 pb-12">
      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
        Platform Governance Center
      </h1>

      {/* AI Governance */}
      <SectionCard title="AI Governance">
        <div className="flex justify-between mb-6">
          <StatusBadge status="ONLINE" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard title="Model Version" value="1.0" unit="" />
          <MetricCard title="Confidence" value="85" unit="%" />
          <MetricCard title="Inference" value="1.8" unit="sec" />
          <MetricCard title="Accuracy" value="96.4" unit="%" />
        </div>
      </SectionCard>

      {/* Inspection Policies */}
      <SectionCard title="Inspection Policies">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-xs tracking-wider bg-slate-50">
                <th className="py-3 px-4">Policy</th>
                <th className="py-3 px-4 text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              <tr className="hover:bg-slate-50 transition">
                <td className="py-3.5 px-4 font-extrabold text-slate-900">Inspection Frequency</td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-600">5 Minutes</td>
              </tr>
              <tr className="hover:bg-slate-50 transition">
                <td className="py-3.5 px-4 font-extrabold text-slate-900">Alert Generation</td>
                <td className="py-3.5 px-4 text-right font-bold text-emerald-600">Immediate</td>
              </tr>
              <tr className="hover:bg-slate-50 transition">
                <td className="py-3.5 px-4 font-extrabold text-slate-900">Escalation Policy</td>
                <td className="py-3.5 px-4 text-right font-bold text-blue-600">Enabled</td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Data Governance */}
      <SectionCard title="Data Governance">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard title="Sensor Retention" value="365" unit="Days" />
          <MetricCard title="Image Retention" value="180" unit="Days" />
          <MetricCard title="Cloud Backup" value="24" unit="hrs" />
          <MetricCard title="Sync Rate" value="30" unit="sec" />
        </div>
      </SectionCard>

      {/* Connectivity */}
      <SectionCard title="Connectivity Configuration">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard title="Cloud" value="ON" unit="" />
          <MetricCard title="GPS" value="ON" unit="" />
          <MetricCard title="4G" value="ON" unit="" />
          <MetricCard title="API" value="ACTIVE" unit="" />
        </div>
      </SectionCard>

      {/* Platform Info */}
      <SectionCard title="Platform Information">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              <tr className="hover:bg-slate-50 transition">
                <td className="py-3.5 px-4 font-extrabold text-slate-900">Platform</td>
                <td className="py-3.5 px-4 text-right font-bold text-slate-900">TraceFresh AI</td>
              </tr>
              <tr className="hover:bg-slate-50 transition">
                <td className="py-3.5 px-4 font-extrabold text-slate-900">Deployment Mode</td>
                <td className="py-3.5 px-4 text-right font-bold text-blue-600">Edge + Cloud</td>
              </tr>
              <tr className="hover:bg-slate-50 transition">
                <td className="py-3.5 px-4 font-extrabold text-slate-900">Environment</td>
                <td className="py-3.5 px-4 text-right font-bold text-emerald-600">Production</td>
              </tr>
              <tr className="hover:bg-slate-50 transition">
                <td className="py-3.5 px-4 font-extrabold text-slate-900">Version</td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">1.0.0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

export default Settings;