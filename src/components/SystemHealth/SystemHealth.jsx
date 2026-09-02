function SystemHealth() {

  const systems = [
    "AI Engine",
    "Camera",
    "Sensors",
    "4G LTE",
    "GPS",
    "Cloud Sync"
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">

      <h2 className="text-2xl font-bold mb-5">
        System Health
      </h2>

      <div className="space-y-4">

        {systems.map((item) => (
          <div
            key={item}
            className="flex justify-between"
          >
            <span>{item}</span>

            <span className="text-green-600 font-semibold">
              Healthy
            </span>
          </div>
        ))}

      </div>

    </div>
  );
}

export default SystemHealth;