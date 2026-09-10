import { useSensorData } from "../../context/SensorContext";

function FruitCard() {
  const { sensorData } = useSensorData();

  const inspection = sensorData.inspection;

  if (!inspection) {
    return (
      <div className="bg-white border border-[#DCE4DE] rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <h2 className="text-xl font-extrabold text-[#101513] mb-4 tracking-tight">Live Camera Feed</h2>

        <div className="h-56 flex items-center justify-center rounded-xl border-2 border-dashed border-[#DCE4DE] bg-[#F7F8F3] text-[#4E5B55] text-xs font-medium">
          Click <strong className="mx-1 text-[#063C2F]">Inspect Batch</strong> to capture an image.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#DCE4DE] rounded-2xl p-6 shadow-sm relative overflow-hidden">
      <h2 className="text-xl font-extrabold text-[#101513] mb-4 tracking-tight">
        Live Camera Feed
      </h2>

      <div className="relative rounded-xl overflow-hidden mb-4 border border-[#DCE4DE] shadow-xs group">
        <img
          src={inspection.capture.image_url}
          alt="Captured Fruit"
          className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center py-2 border-b border-[#E8EEE7]">
          <span className="text-[#78837D] text-xs uppercase tracking-wider font-semibold">Batch ID</span>
          <span className="font-bold text-[#063C2F] bg-[#F1F4EE] px-2.5 py-0.5 rounded border border-[#DCE4DE] text-xs">
            {inspection.capture.batch_id}
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-[#E8EEE7]">
          <span className="text-[#78837D] text-xs uppercase tracking-wider font-semibold">Fruit</span>
          <span className="font-bold text-[#101513] capitalize">
            {inspection.capture.fruit_type}
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-[#E8EEE7]">
          <span className="text-[#78837D] text-xs uppercase tracking-wider font-semibold">Node</span>
          <span className="font-bold text-[#063C2F] text-xs">
            {inspection.capture.node_id}
          </span>
        </div>

        <div className="flex justify-between items-center py-2">
          <span className="text-[#78837D] text-xs uppercase tracking-wider font-semibold">Captured At</span>
          <span className="font-semibold text-[#4E5B55] text-xs">
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