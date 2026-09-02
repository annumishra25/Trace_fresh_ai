import { useSensorData }
from "../../context/SensorContext";

function AIInsights() {

  const { sensorData } =
    useSensorData();

  const insights = [];

  if (sensorData.temperature > 28) {
    insights.push(
      "Temperature is above recommended storage conditions."
    );
  }

  if (sensorData.ethylene > 0.5) {
    insights.push(
      "Ethylene concentration is accelerating fruit ripening."
    );
  }

  if (sensorData.voc > 200) {
    insights.push(
      "VOC levels indicate possible spoilage activity."
    );
  }

  if (sensorData.shelfLife < 5) {
    insights.push(
      "Shelf life is becoming critical. Prioritize distribution."
    );
  }

  if (insights.length === 0) {
    insights.push(
      "Storage conditions remain stable. No corrective actions required."
    );
  }

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
        AI Operational Insights
      </h2>

      <div className="space-y-3">

        {insights.map(
          (item, index) => (

            <div
              key={index}
              className="
                bg-blue-50
                p-4
                rounded-xl
              "
            >
              {item}
            </div>

          )
        )}

      </div>

    </div>
  );
}

export default AIInsights;