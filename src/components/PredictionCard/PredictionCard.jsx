import { useSensorData } from "../../context/SensorContext";

function PredictionCard() {
  const { sensorData } = useSensorData();

  const inspection = sensorData.inspection;

  if (!inspection) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-5">
        <h2 className="text-xl font-bold mb-4">AI Prediction</h2>

        <div className="text-gray-500">
          Click <strong>Inspect Batch</strong> to run AI analysis.
        </div>
      </div>
    );
  }

  const prediction = inspection.prediction;

  const confidence = inspection.confidence;

  const isFresh = prediction.toLowerCase().includes("fresh");

  return (
    <div className="bg-white rounded-2xl shadow-md p-5">

      <h2 className="text-xl font-bold mb-4">
        AI Prediction
      </h2>

      <div className="space-y-3">

        <p>
          <strong>Prediction :</strong>{" "}
          {prediction}
        </p>

        <p>
          <strong>Confidence :</strong>{" "}
          {confidence.toFixed(2)}%
        </p>

        <p>
          <strong>Fruit :</strong>{" "}
          {sensorData.fruitType}
        </p>

        <p>
          <strong>Batch :</strong>{" "}
          {sensorData.batchId}
        </p>

        <p>
          <strong>Captured :</strong>{" "}
          {inspection.capture.timestamp}
        </p>

        <div
          className={`text-2xl font-bold ${
            isFresh
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {isFresh ? "FRESH" : "ROTTEN"}
        </div>

      </div>

    </div>
  );
}

export default PredictionCard;