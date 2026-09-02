import { useSensorData } from "../../context/SensorContext";

function KPICards() {

  const { sensorData } = useSensorData();

  const spoilageRisk = Math.max(
    0,
    100 - sensorData.healthScore
  );

  const shelfLife = Math.max(
    1,
    Math.round(sensorData.healthScore / 10)
  );

  return (
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
          {shelfLife} Days
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-5">
        <h3 className="text-gray-500">
          Spoilage Risk
          
        </h3>

        <p className="text-4xl font-bold text-orange-500">
          {spoilageRisk}%
          
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-5">
        <h3 className="text-gray-500">
          Status
        </h3>

        <p className="text-4xl font-bold text-green-600">
          {sensorData.status}
        </p>
      </div>

    </div>
  );
}

export default KPICards;