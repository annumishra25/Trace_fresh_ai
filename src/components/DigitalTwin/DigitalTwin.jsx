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
    <div className="bg-white border border-[#DDE4DF] rounded-2xl p-6 shadow-xs">
      <h2 className="text-xl font-extrabold text-[#111715] mb-4 tracking-tight">
        Device Health Matrix
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {devices.map((device) => (
          <div
            key={device}
            className="bg-[#FAFBF8] border border-[#DDE4DF] rounded-xl p-4 text-center space-y-1"
          >
            <div className="font-extrabold text-[#111715] text-sm">
              {device}
            </div>
            <div className="text-xs font-extrabold text-[#064C3B]">
              ● Healthy
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DigitalTwin;