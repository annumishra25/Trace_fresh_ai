function SystemArchitecture() {

  const layers = [
    "Sensor Layer (ESP32 + Sensors)",
    "MQTT Communication Layer",
    "Backend Processing Layer",
    "AI Intelligence Layer",
    "Database Layer",
    "Dashboard Layer",
    "Consumer Portal Layer",
  ];

  return (
    <div className="space-y-6">

      <h1 className="text-4xl font-bold">
        System Architecture
      </h1>

      <div className="bg-white rounded-2xl shadow-md p-6">

        <div className="space-y-4">

          {layers.map((layer, index) => (

            <div
              key={index}
              className="
                bg-blue-50
                p-4
                rounded-xl
                text-lg
                font-semibold
              "
            >
              {layer}
            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default SystemArchitecture;