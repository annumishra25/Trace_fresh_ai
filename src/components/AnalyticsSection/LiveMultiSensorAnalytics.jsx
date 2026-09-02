import {
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from "recharts";

import { useSensorData }
from "../../context/SensorContext";

function LiveMultiSensorAnalytics() {

  const { sensorData } =
    useSensorData();

  return (

    <div className="
      bg-white
      rounded-2xl
      shadow-md
      p-6
    ">

      <h2 className="
        text-2xl
        font-bold
        mb-5
      ">
        Environmental Intelligence
      </h2>

      <ResponsiveContainer
        width="100%"
        height={450}
      >

        <LineChart
          data={sensorData.history}
        >

          <CartesianGrid
            strokeDasharray="3 3"
          />

          <XAxis dataKey="time" />

          <YAxis />

          <Tooltip />

          <Legend />

          <Line
            type="monotone"
            dataKey="temperature"
            stroke="#2563eb"
            dot={false}
          />

          <Line
            type="monotone"
            dataKey="humidity"
            stroke="#16a34a"
            dot={false}
          />

          <Line
            type="monotone"
            dataKey="voc"
            stroke="#ea580c"
            dot={false}
          />

          <Line
            type="monotone"
            dataKey="co2"
            stroke="#dc2626"
            dot={false}
          />

          <Line
            type="monotone"
            dataKey="ethylene"
            stroke="#7c3aed"
            dot={false}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>

  );
}

export default LiveMultiSensorAnalytics;