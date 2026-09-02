import AnalyticsChart from "../components/AnalyticsSection/AnalyticsChart";
import { useSensorData } from "../context/SensorContext";
import LiveMultiSensorAnalytics
from "../components/AnalyticsSection/LiveMultiSensorAnalytics";
import AIInsights
from "../components/AIInsights/AIInsights";
import PredictivePanel
from "../components/PredictivePanel/PredictivePanel";


function Analytics() {
const { sensorData } = useSensorData();
const temperatureData = [
{ time: "10:00", value: 24 },
{ time: "11:00", value: 25 },
{ time: "12:00", value: 26 },
{ time: "13:00", value: 25 },
{ time: "14:00", value: 24 },
];

const humidityData = [
{ time: "10:00", value: 60 },
{ time: "11:00", value: 62 },
{ time: "12:00", value: 64 },
{ time: "13:00", value: 63 },
{ time: "14:00", value: 65 },
];

const vocData = [
{ time: "10:00", value: 100 },
{ time: "11:00", value: 110 },
{ time: "12:00", value: 120 },
{ time: "13:00", value: 115 },
{ time: "14:00", value: 118 },
];

const co2Data = [
{ time: "10:00", value: 420 },
{ time: "11:00", value: 430 },
{ time: "12:00", value: 450 },
{ time: "13:00", value: 440 },
{ time: "14:00", value: 435 },
];

const ethyleneData = [
{ time: "10:00", value: 0.10 },
{ time: "11:00", value: 0.15 },
{ time: "12:00", value: 0.20 },
{ time: "13:00", value: 0.22 },
{ time: "14:00", value: 0.25 },
];

const weightData = [
{ time: "10:00", value: 250 },
{ time: "11:00", value: 249 },
{ time: "12:00", value: 248 },
{ time: "13:00", value: 247 },
{ time: "14:00", value: 245 },
];

const healthData = [
{ time: "10:00", value: 96 },
{ time: "11:00", value: 95 },
{ time: "12:00", value: 94 },
{ time: "13:00", value: 94 },
{ time: "14:00", value: 93 },
];

return ( <div className="space-y-6">

```
 <h1 className="text-4xl font-bold">
  Environmental Intelligence Center
</h1>

<AnalyticsChart
  title="Live Temperature Stream"
  data={sensorData.history}
  dataKey="temperature"
/>

<LiveMultiSensorAnalytics />

  {/* Executive KPI Layer */}

  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

    <div className="bg-white rounded-2xl shadow-md p-5">
      <h3 className="text-gray-500">
        Avg Temperature
      </h3>

      <p className="text-4xl font-bold">
        25.1°C
      </p>
    </div>

    <div className="bg-white rounded-2xl shadow-md p-5">
      <h3 className="text-gray-500">
        Avg Humidity
      </h3>

      <p className="text-4xl font-bold">
        63%
      </p>
    </div>

    <div className="bg-white rounded-2xl shadow-md p-5">
      <h3 className="text-gray-500">
        Spoilage Risk
      </h3>

      <p className="text-4xl font-bold text-orange-500">
        8%
      </p>
    </div>

    <div className="bg-white rounded-2xl shadow-md p-5">
      <h3 className="text-gray-500">
        AI Confidence
      </h3>

      <p className="text-4xl font-bold text-green-600">
        96.4%
      </p>
    </div>

  </div>

  {/* Trend Analytics */}

  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

    <AnalyticsChart
      title="Temperature Trend"
      data={temperatureData}
      dataKey="value"
    />

    <AnalyticsChart
      title="Humidity Trend"
      data={humidityData}
      dataKey="value"
    />

    <AnalyticsChart
      title="VOC Trend"
      data={vocData}
      dataKey="value"
    />

    <AnalyticsChart
      title="CO₂ Trend"
      data={co2Data}
      dataKey="value"
    />

    <AnalyticsChart
      title="Ethylene Trend"
      data={ethyleneData}
      dataKey="value"
    />

    <AnalyticsChart
      title="Weight Trend"
      data={weightData}
      dataKey="value"
    />

    <AnalyticsChart
      title="Health Score Trend"
      data={healthData}
      dataKey="value"
    />

  </div>

  {/* Shelf Life Forecast */}

  <div className="bg-white rounded-2xl shadow-md p-6">

    <h2 className="text-2xl font-bold mb-4">
      Shelf Life Forecast
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      <div className="bg-green-50 p-4 rounded-xl">
        <p>Current Shelf Life</p>
        <p className="text-3xl font-bold">
          9 Days
        </p>
      </div>

      <div className="bg-yellow-50 p-4 rounded-xl">
        <p>Projected Shelf Life</p>
        <p className="text-3xl font-bold">
          7 Days
        </p>
      </div>

      <div className="bg-red-50 p-4 rounded-xl">
        <p>Critical Threshold</p>
        <p className="text-3xl font-bold">
          3 Days
        </p>
      </div>

    </div>

  </div>

  {/* AI Insights */}

<AIInsights />

{/* Predictive Intelligence */}

<PredictivePanel />

</div>

);
}

export default Analytics;
