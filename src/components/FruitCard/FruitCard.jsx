import { useSensorData } from "../../context/SensorContext";

function FruitCard() {
  const { sensorData } = useSensorData();

  const inspection = sensorData.inspection;

  if (!inspection) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-5">
        <h2 className="text-xl font-bold mb-4">Live Camera Feed</h2>

        <div className="h-56 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-500">
          Click <strong className="mx-1">Inspect Batch</strong> to capture an image.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-5">

      <h2 className="text-xl font-bold mb-4">
        Live Camera Feed
      </h2>

      <img
        src={inspection.capture.image_url}
        alt="Captured Fruit"
        className="rounded-xl w-full h-56 object-cover mb-4"
      />

      <div className="space-y-2 text-sm">

        <div className="flex justify-between">
          <span className="text-gray-500">Batch ID</span>
          <span className="font-semibold">
            {inspection.capture.batch_id}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Fruit</span>
          <span className="font-semibold">
            {inspection.capture.fruit_type}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Node</span>
          <span className="font-semibold">
            {inspection.capture.node_id}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Captured At</span>
          <span className="font-semibold">
            {new Date(
              inspection.capture.timestamp
            ).toLocaleString()}
          </span>
        </div>

      </div>

    </div>
  );
}

export default FruitCard;