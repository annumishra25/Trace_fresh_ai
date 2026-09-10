import { useSensorData } from "../../context/SensorContext";

function PredictionCard() {
  const { sensorData } = useSensorData();

  const inspection = sensorData.inspection;

  if (!inspection) {
    return (
      <div className="bg-white border border-[#DCE4DE] rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <h2 className="text-xl font-extrabold text-[#101513] mb-4 tracking-tight">AI Prediction</h2>

        <div className="h-40 flex items-center justify-center rounded-xl border-2 border-dashed border-[#DCE4DE] bg-[#F7F8F3] text-[#4E5B55] text-xs font-medium">
          Click <strong className="mx-1 text-[#063C2F]">Inspect Batch</strong> to run AI analysis.
        </div>
      </div>
    );
  }

  const prediction = inspection.prediction;
  const confidence = inspection.confidence;
  const isFresh = prediction.toLowerCase().includes("fresh");

  return (
    <div className="bg-white border border-[#DCE4DE] rounded-2xl p-6 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-extrabold text-[#101513] tracking-tight">
          AI Prediction
        </h2>

        <span
          className={`text-xs font-bold px-3 py-1 rounded-md border uppercase tracking-wider ${
            isFresh
              ? "bg-[#DDF2E8] text-[#063C2F] border-[#16805F]/20"
              : "bg-[#FEE2E2] text-[#991B1B] border-[#DC2626]/20"
          }`}
        >
          {isFresh ? "FRESH" : "ROTTEN"}
        </span>
      </div>

      <div className="space-y-3">
        <div className="bg-[#F7F8F3] p-4 rounded-xl border border-[#DCE4DE] flex items-center justify-between">
          <span className="text-xs uppercase font-semibold text-[#78837D] tracking-wider">Classification</span>
          <span className="text-base font-extrabold text-[#101513]">{prediction}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#F7F8F3] p-3 rounded-xl border border-[#DCE4DE]">
            <span className="text-xs font-medium text-[#78837D] block">Confidence</span>
            <span className="text-lg font-extrabold text-[#063C2F] mt-0.5 block">{confidence.toFixed(2)}%</span>
          </div>

          <div className="bg-[#F7F8F3] p-3 rounded-xl border border-[#DCE4DE]">
            <span className="text-xs font-medium text-[#78837D] block">Fruit Type</span>
            <span className="text-lg font-extrabold text-[#101513] capitalize mt-0.5 block">{sensorData.fruitType}</span>
          </div>
        </div>

        <div className="space-y-2 text-xs pt-2">
          <div className="flex justify-between items-center py-1.5 border-b border-[#E8EEE7]">
            <span className="text-[#78837D] font-medium">Batch ID</span>
            <span className="font-bold text-[#101513]">{sensorData.batchId}</span>
          </div>

          <div className="flex justify-between items-center py-1.5">
            <span className="text-[#78837D] font-medium">Captured At</span>
            <span className="font-semibold text-[#4E5B55]">{inspection.capture.timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PredictionCard;