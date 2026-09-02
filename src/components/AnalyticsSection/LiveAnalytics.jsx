import {
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import {
  useSensorData
} from "../../context/SensorContext";

function LiveAnalytics() {

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
        Live Temperature Stream
      </h2>

      <ResponsiveContainer
        width="100%"
        height={350}
      >

        <LineChart
          data={sensorData.history}
        >

          <CartesianGrid
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="time"
          />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="temperature"
            stroke="#2563eb"
            strokeWidth={3}
            dot={false}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>

  );
}

export default LiveAnalytics;