import SectionCard from "../components/SectionCard/SectionCard";
import MetricCard from "../components/MetricCard/MetricCard";
import StatusBadge from "../components/StatusBadge/StatusBadge";

function Settings() {
  return (
    <div className="space-y-6">

      <h1 className="text-4xl font-bold">
        Platform Governance Center
      </h1>

      {/* AI Governance */}

      <SectionCard title="AI Governance">

        <div className="flex justify-between mb-6">

          <StatusBadge status="ONLINE" />

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          <MetricCard
            title="Model Version"
            value="1.0"
            unit=""
          />

          <MetricCard
            title="Confidence"
            value="85"
            unit="%"
          />

          <MetricCard
            title="Inference"
            value="1.8"
            unit="sec"
          />

          <MetricCard
            title="Accuracy"
            value="96.4"
            unit="%"
          />

        </div>

      </SectionCard>

      {/* Inspection Policies */}

      <SectionCard title="Inspection Policies">

        <table className="w-full">

          <thead>

            <tr className="border-b">

              <th className="text-left py-3">
                Policy
              </th>

              <th>Value</th>

            </tr>

          </thead>

          <tbody>

            <tr className="border-b">
              <td className="py-3">
                Inspection Frequency
              </td>
              <td>5 Minutes</td>
            </tr>

            <tr className="border-b">
              <td className="py-3">
                Alert Generation
              </td>
              <td>Immediate</td>
            </tr>

            <tr>
              <td className="py-3">
                Escalation Policy
              </td>
              <td>Enabled</td>
            </tr>

          </tbody>

        </table>

      </SectionCard>

      {/* Data Governance */}

      <SectionCard title="Data Governance">

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          <MetricCard
            title="Sensor Retention"
            value="365"
            unit="Days"
          />

          <MetricCard
            title="Image Retention"
            value="180"
            unit="Days"
          />

          <MetricCard
            title="Cloud Backup"
            value="24"
            unit="hrs"
          />

          <MetricCard
            title="Sync Rate"
            value="30"
            unit="sec"
          />

        </div>

      </SectionCard>

      {/* Connectivity */}

      <SectionCard title="Connectivity Configuration">

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          <MetricCard
            title="Cloud"
            value="ON"
            unit=""
          />

          <MetricCard
            title="GPS"
            value="ON"
            unit=""
          />

          <MetricCard
            title="4G"
            value="ON"
            unit=""
          />

          <MetricCard
            title="API"
            value="ACTIVE"
            unit=""
          />

        </div>

      </SectionCard>

      {/* Platform Info */}

      <SectionCard title="Platform Information">

        <table className="w-full">

          <tbody>

            <tr className="border-b">
              <td className="py-3">
                Platform
              </td>
              <td>TraceFresh AI</td>
            </tr>

            <tr className="border-b">
              <td className="py-3">
                Deployment Mode
              </td>
              <td>Edge + Cloud</td>
            </tr>

            <tr className="border-b">
              <td className="py-3">
                Environment
              </td>
              <td>Production</td>
            </tr>

            <tr>
              <td className="py-3">
                Version
              </td>
              <td>1.0.0</td>
            </tr>

          </tbody>

        </table>

      </SectionCard>

    </div>
  );
}

export default Settings;