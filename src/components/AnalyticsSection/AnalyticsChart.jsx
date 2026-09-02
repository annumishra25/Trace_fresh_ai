import {
LineChart,
Line,
XAxis,
YAxis,
CartesianGrid,
Tooltip,
ResponsiveContainer,
Area,
AreaChart
} from "recharts";

function AnalyticsChart({
title,
data,
dataKey
}) {
return ( <div
   className="
     bg-white
     rounded-2xl
     shadow-md
     p-6
     hover:shadow-xl
     transition-all
   "
 >

```
  <div className="flex justify-between mb-5">

    <h2 className="text-xl font-bold">
      {title}
    </h2>

    <div className="text-green-600 text-sm font-medium">
      Live
    </div>

  </div>

  <ResponsiveContainer
    width="100%"
    height={300}
  >

    <AreaChart data={data}>

      <defs>

        <linearGradient
          id="colorData"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >

          <stop
            offset="5%"
            stopColor="#2563eb"
            stopOpacity={0.4}
          />

          <stop
            offset="95%"
            stopColor="#2563eb"
            stopOpacity={0}
          />

        </linearGradient>

      </defs>

      <CartesianGrid
        strokeDasharray="3 3"
      />

      <XAxis dataKey="time" />

      <YAxis />

      <Tooltip />

      <Area
        type="monotone"
        dataKey={dataKey}
        stroke="#2563eb"
        fillOpacity={1}
        fill="url(#colorData)"
      />

      <Line
        type="monotone"
        dataKey={dataKey}
        stroke="#2563eb"
        strokeWidth={3}
        dot={false}
      />

    </AreaChart>

  </ResponsiveContainer>

</div>

);
}

export default AnalyticsChart;
