import { useSensorData }
from "../../context/SensorContext";

function PredictivePanel() {

  const { sensorData } =
    useSensorData();

  const futureShelfLife =
    Math.max(
      0,
      sensorData.shelfLife - 1.2
    );

  const degradationRate =
    (
      (100 -
      sensorData.healthScore)
      / 10
    ).toFixed(2);

  const estimatedSpoilageDate =
    new Date(
      Date.now() +
      futureShelfLife *
      24 *
      60 *
      60 *
      1000
    ).toLocaleDateString();

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
        Predictive Intelligence
      </h2>

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4
        gap-4
      ">

        <div className="
          bg-blue-50
          p-4
          rounded-xl
        ">
          <p>
            Current Shelf Life
          </p>

          <p className="
            text-3xl
            font-bold
          ">
            {sensorData.shelfLife}
          </p>
        </div>

        <div className="
          bg-yellow-50
          p-4
          rounded-xl
        ">
          <p>
            Predicted (24h)
          </p>

          <p className="
            text-3xl
            font-bold
          ">
            {futureShelfLife.toFixed(1)}
          </p>
        </div>

        <div className="
          bg-red-50
          p-4
          rounded-xl
        ">
          <p>
            Degradation Rate
          </p>

          <p className="
            text-3xl
            font-bold
          ">
            {degradationRate}
          </p>
        </div>

        <div className="
          bg-green-50
          p-4
          rounded-xl
        ">
          <p>
            Estimated Spoilage
          </p>

          <p className="
            text-xl
            font-bold
          ">
            {estimatedSpoilageDate}
          </p>
        </div>

      </div>

    </div>

  );
}

export default PredictivePanel;