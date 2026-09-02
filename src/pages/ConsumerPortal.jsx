import { useSensorData } from "../context/SensorContext";

function ConsumerPortal() {

  const { sensorData } = useSensorData();

  return (

    <div className="space-y-6">

      <h1 className="text-4xl font-bold">
        Consumer Freshness Passport
      </h1>

      {/* Product Overview */}

      <div className="bg-white rounded-2xl shadow-md p-6">

        <div className="flex justify-between items-center">

          <div>

            <h2 className="text-3xl font-bold">
              🍎 Premium Apple
            </h2>

            <p className="text-gray-500">
              Batch ID: TF-APL-2026-001
            </p>

          </div>

          <div className="text-right">

            <p className="text-sm text-gray-500">
              AI Verification
            </p>

            <p className="text-green-600 font-bold text-xl">
              VERIFIED FRESH
            </p>

          </div>

        </div>

      </div>

      {/* KPI Layer */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="bg-white rounded-2xl shadow-md p-5">

          <h3 className="text-gray-500">
            Health Score
          </h3>

          <p className="text-4xl font-bold text-green-600">
            {Number(sensorData.healthScore).toFixed(2)}
          </p>

        </div>

        <div className="bg-white rounded-2xl shadow-md p-5">

          <h3 className="text-gray-500">
            Shelf Life
          </h3>

          <p className="text-4xl font-bold text-blue-600">
            {sensorData.shelfLife} Days
          </p>

        </div>

        <div className="bg-white rounded-2xl shadow-md p-5">

          <h3 className="text-gray-500">
            Spoilage Risk
          </h3>

          <p className="text-4xl font-bold text-orange-500">
            {Number(sensorData.spoilageRisk).toFixed(2)}%
          </p>

        </div>

        <div className="bg-white rounded-2xl shadow-md p-5">

          <h3 className="text-gray-500">
            Risk Level
          </h3>

          <p className="text-4xl font-bold text-red-500">
            {sensorData.riskLevel}
          </p>

        </div>

      </div>

      {/* Farm Information */}

      <div className="bg-white rounded-2xl shadow-md p-6">

        <h2 className="text-2xl font-bold mb-4">
          Farm Information
        </h2>

        <div className="grid md:grid-cols-3 gap-4">

          <div>
            <p className="text-gray-500">
              Farm ID
            </p>

            <p className="font-bold">
              TN-APL-2026-004
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Harvest Date
            </p>

            <p className="font-bold">
              12 June 2026
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Region
            </p>

            <p className="font-bold">
              Tamil Nadu
            </p>
          </div>

        </div>

      </div>

      {/* Storage Conditions */}

      <div className="bg-white rounded-2xl shadow-md p-6">

        <h2 className="text-2xl font-bold mb-4">
          Storage Conditions
        </h2>

        <div className="grid md:grid-cols-5 gap-4">

          <div>
            <p className="text-gray-500">
              Temperature
            </p>

            <p className="font-bold">
              {sensorData.temperature} °C
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Humidity
            </p>

            <p className="font-bold">
              {sensorData.humidity} %
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              VOC
            </p>

            <p className="font-bold">
              {sensorData.voc} ppb
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              CO₂
            </p>

            <p className="font-bold">
              {sensorData.co2} ppm
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Ethylene
            </p>

            <p className="font-bold">
              {sensorData.ethylene} ppm
            </p>
          </div>

        </div>

      </div>

      {/* Supply Chain Journey */}

      <div className="bg-white rounded-2xl shadow-md p-6">

        <h2 className="text-2xl font-bold mb-6">
          Supply Chain Journey
        </h2>

        <div className="grid grid-cols-5 gap-4 text-center">

          <div>🌱 Harvested</div>
          <div>📦 Packed</div>
          <div>🚚 Transported</div>
          <div>🏬 Warehouse</div>
          <div>🛒 Retail</div>

        </div>

      </div>

    </div>

  );
}

export default ConsumerPortal;