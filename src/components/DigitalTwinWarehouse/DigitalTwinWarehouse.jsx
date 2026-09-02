function DigitalTwinWarehouse() {

  const zones = [
    {
      name: "Zone A1",
      temperature: "4°C",
      occupancy: "82%",
      risk: "LOW",
      color: "bg-green-100"
    },

    {
      name: "Zone A2",
      temperature: "5°C",
      occupancy: "70%",
      risk: "LOW",
      color: "bg-green-100"
    },

    {
      name: "Zone B1",
      temperature: "9°C",
      occupancy: "91%",
      risk: "MEDIUM",
      color: "bg-yellow-100"
    },

    {
      name: "Zone B2",
      temperature: "12°C",
      occupancy: "95%",
      risk: "HIGH",
      color: "bg-red-100"
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">

      <h2 className="text-2xl font-bold mb-5">
        Warehouse Digital Twin
      </h2>

      <div className="grid grid-cols-2 gap-4">

        {zones.map((zone) => (

          <div
            key={zone.name}
            className={`${zone.color} p-5 rounded-xl`}
          >

            <h3 className="font-bold text-xl">
              {zone.name}
            </h3>

            <p>
              Temperature: {zone.temperature}
            </p>

            <p>
              Occupancy: {zone.occupancy}
            </p>

            <p>
              Risk: {zone.risk}
            </p>

          </div>

        ))}

      </div>

    </div>
  );
}

export default DigitalTwinWarehouse;
