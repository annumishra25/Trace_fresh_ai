function DigitalTwin() {

  const devices = [
    "Camera",
    "SHT45",
    "SGP40",
    "SCD41",
    "Ethylene",
    "HX711",
    "GPS",
    "4G LTE"
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">

      <h2 className="text-2xl font-bold mb-5">
        Device Health Matrix
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {devices.map((device) => (

          <div
            key={device}
            className="
              bg-green-50
              rounded-xl
              p-4
              text-center
            "
          >

            <div className="font-semibold">
              {device}
            </div>

            <div className="text-green-600">
              ● Healthy
            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default DigitalTwin;