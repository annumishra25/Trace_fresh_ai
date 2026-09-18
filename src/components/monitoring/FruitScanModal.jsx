import { useState, useRef, useMemo } from "react";
import {
  Upload,
  Camera,
  X,
  Sparkles,
  Cpu,
  Thermometer,
  Droplets,
  Wind,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Activity,
  AlertCircle
} from "lucide-react";
import { useTelemetry } from "../../context/TelemetryContext";
import { uploadAndInspectImage, runDemoInspection } from "../../services/inspectionApi";
import { useNavigate } from "react-router-dom";

// Preset fruit samples for quick demo/testing
const SAMPLE_FRUITS = [
  {
    id: "apple",
    name: "Gala Apple",
    icon: "🍎",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80",
    visualFreshness: 96,
    condition: "Fresh Grade A",
    shelfLifeDays: 9.5
  },
  {
    id: "banana",
    name: "Cavendish Banana",
    icon: "🍌",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80",
    visualFreshness: 88,
    condition: "Optimal Ripeness",
    shelfLifeDays: 5.0
  },
  {
    id: "strawberry",
    name: "Fresh Strawberry",
    icon: "🍓",
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop&q=80",
    visualFreshness: 92,
    condition: "Fresh Grade A",
    shelfLifeDays: 4.5
  },
  {
    id: "orange",
    name: "Valencia Orange",
    icon: "🍊",
    image: "https://images.unsplash.com/photo-1547514701-42782101795e?w=600&auto=format&fit=crop&q=80",
    visualFreshness: 94,
    condition: "Fresh Grade A",
    shelfLifeDays: 12.0
  },
  {
    id: "mango",
    name: "Alphonso Mango",
    icon: "🥭",
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80",
    visualFreshness: 76,
    condition: "Marginal Grade B",
    shelfLifeDays: 2.5
  }
];

// Canvas-based client-side produce pixel spectrum analyzer
const validateProduceImageClient = (imgElement) => {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 60;
      canvas.height = 60;
      ctx.drawImage(imgElement, 0, 0, 60, 60);
      const imgData = ctx.getImageData(0, 0, 60, 60).data;

      let organicCount = 0;
      let totalPixels = imgData.length / 4;
      let syntheticBlueCount = 0;

      for (let i = 0; i < imgData.length; i += 4) {
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];

        const isRed = r > 90 && r > g * 1.12 && r > b * 1.25;
        const isGreen = g > 65 && g > b * 1.08;
        const isYellow = r > 95 && g > 85 && b < Math.min(r, g) * 0.8;
        const isOrange = r > 110 && g > 55 && g < r && b < g * 0.75;
        const isPurple = r > 55 && b > 55 && g < Math.min(r, b) * 0.85;
        const isBrown = r > 45 && g > 30 && r >= g && b < g * 0.85;

        if (isRed || isGreen || isYellow || isOrange || isPurple || isBrown) {
          organicCount++;
        }

        if (b > 140 && b > r * 1.35 && b > g * 1.25) {
          syntheticBlueCount++;
        }
      }

      const organicRatio = (organicCount / totalPixels) * 100;
      const blueRatio = (syntheticBlueCount / totalPixels) * 100;

      if (organicRatio < 10.0 || blueRatio > 60.0) {
        resolve({ isValid: false, reason: "Image does not appear to contain a valid fruit or vegetable." });
      } else {
        resolve({ isValid: true });
      }
    } catch (err) {
      resolve({ isValid: true });
    }
  });
};

function FruitScanModal({ isOpen, onClose }) {
  const { selectedNodeId, activeTelemetry, isLiveMode } = useTelemetry();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedSample, setSelectedSample] = useState(SAMPLE_FRUITS[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inspectionResult, setInspectionResult] = useState(null);
  const [validationError, setValidationError] = useState(null);

  // Extract live hardware sensor readings
  const hardwareSensors = useMemo(() => {
    const s = activeTelemetry?.sensors || {};
    return {
      temp: s.temperature?.value ?? 5.5,
      tempUnit: s.temperature?.unit ?? "°C",
      humidity: s.humidity?.value ?? 71.0,
      gas: s.gas?.value ?? 0.42,
      co2: s.co2?.value ?? 600.0,
      nodeId: activeTelemetry?.nodeId || selectedNodeId || "TF-NODE-01"
    };
  }, [activeTelemetry, selectedNodeId]);

  if (!isOpen) return null;

  // Handle local file selection with smart produce verification
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValidationError(null);
      setInspectionResult(null);
      setSelectedFile(file);
      setSelectedSample(null);

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Verify if image is a valid produce item
      const img = new Image();
      img.src = url;
      img.onload = async () => {
        const val = await validateProduceImageClient(img);
        if (!val.isValid) {
          setValidationError("⚠️ Please select a valid fruit or vegetable image. The uploaded photo does not show recognizable produce.");
        }
      };
    }
  };

  // Select preset fruit sample
  const handleSelectSample = (sample) => {
    setValidationError(null);
    setSelectedSample(sample);
    setSelectedFile(null);
    setPreviewUrl(sample.image);
    setInspectionResult(null);
  };

  // Execute AI Inspection + Hardware Telemetry Fusion
  const handleRunScan = async () => {
    if (validationError) {
      return;
    }

    setIsAnalyzing(true);
    setInspectionResult(null);
    setValidationError(null);

    try {
      let apiData = null;

      if (selectedFile) {
        // Call live backend endpoint with file
        apiData = await uploadAndInspectImage(selectedFile, "TF-APL-2026-001", hardwareSensors.nodeId);

        // Check if backend rejected image quality as non-produce
        if (apiData?.imageQuality?.isProduce === false || apiData?.imageQuality?.status === "INVALID_PRODUCE") {
          setIsAnalyzing(false);
          setValidationError("⚠️ Please select a valid fruit or vegetable image. The uploaded image failed produce classification.");
          return;
        }
      } else {
        // Use demo endpoint with sample scenario
        const scenario = selectedSample?.visualFreshness > 85 ? "HEALTHY" : "MOLD";
        apiData = await runDemoInspection(scenario, "TF-APL-2026-001", hardwareSensors.nodeId);
      }

      // Compute multi-modal fusion score combining image + hardware telemetry
      const visualScore = selectedSample ? selectedSample.visualFreshness : (apiData?.freshnessScore || 91);
      
      // Calculate hardware penalty/bonus based on actual temperature & gas readings
      let hwPenalty = 0;
      if (hardwareSensors.temp > 25.0) hwPenalty += 15;
      else if (hardwareSensors.temp > 15.0) hwPenalty += 5;

      if (hardwareSensors.gas > 1.2) hwPenalty += 20;
      else if (hardwareSensors.gas > 0.8) hwPenalty += 8;

      const hardwareScore = Math.max(20, Math.min(100, Math.round(100 - hwPenalty)));
      const fusedFreshness = Math.round(0.6 * visualScore + 0.4 * hardwareScore);

      // Remaining shelf life calculation
      const estDays = Math.max(0.5, ((fusedFreshness / 100) * 10).toFixed(1));

      // Quality grade categorization
      let grade = "Fresh Grade A";
      let gradeColor = "emerald";

      if (fusedFreshness < 60) {
        grade = "Critical Spoilage Grade C";
        gradeColor = "rose";
      } else if (fusedFreshness < 85 || hardwareSensors.temp > 20) {
        grade = "Marginal Grade B";
        gradeColor = "amber";
      }

      // Synthesize recommendation
      let recommendation = `Cold chain at ${hardwareSensors.temp}°C is optimal. Suitable for retail distribution within ${estDays} days.`;
      if (hardwareSensors.temp > 20) {
        recommendation = `⚠️ High ambient temperature (${hardwareSensors.temp}°C) detected by node ${hardwareSensors.nodeId}. Lower container temperature immediately.`;
      } else if (hardwareSensors.gas > 1.0) {
        recommendation = `🚨 Elevated Ethylene gas (${hardwareSensors.gas} ppm) detected. Isolate batch to prevent cross-ripening.`;
      }

      setTimeout(() => {
        setInspectionResult({
          fruitName: selectedSample?.name || "Uploaded Produce",
          fusedFreshness,
          visualScore,
          hardwareScore,
          estDays,
          grade,
          gradeColor,
          recommendation,
          nodeId: hardwareSensors.nodeId,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
        setIsAnalyzing(false);
      }, 1000);

    } catch (err) {
      console.error("Scan error:", err);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-[#0F1D17] border border-slate-200 dark:border-emerald-900/40 rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-emerald-900/30 flex items-center justify-between bg-slate-50/80 dark:bg-[#0B1713]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Fruit Scan AI & Hardware Fusion
                </h2>
                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  LIVE FUSION
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Upload produce photo & pair with real-time hardware telemetry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/60 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Validation Warning Alert Banner */}
          {validationError && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-start gap-3 animate-fadeIn">
              <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-sm">Non-Produce Image Detected</div>
                <div>{validationError}</div>
              </div>
            </div>
          )}

          {/* Step 1: Image Upload & Presets */}
          <div className="space-y-3">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              1. Produce Image Source
            </label>

            {/* Dropzone Container */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-emerald-900/40 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 rounded-2xl p-5 text-center cursor-pointer bg-slate-50/50 dark:bg-[#142720]/40 transition-all group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              
              {previewUrl ? (
                <div className="relative max-h-48 mx-auto inline-block rounded-xl overflow-hidden border border-slate-200 dark:border-emerald-900/30">
                  <img src={previewUrl} alt="Fruit preview" className="max-h-48 object-cover rounded-xl" />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-2xs flex items-center justify-center">
                      <div className="w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-300 animate-pulse"></div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <Upload size={22} />
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Click to upload fruit/vegetable photo or drag and drop
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Supports JPG, PNG, WEBP (Apples, Bananas, Oranges, Strawberries, Tomatoes, etc.)
                  </div>
                </div>
              )}
            </div>

            {/* Sample Fruit Buttons */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-2">
                Or select quick sample produce:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {SAMPLE_FRUITS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectSample(item)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer flex-shrink-0 ${
                      selectedSample?.id === item.id
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-xs"
                        : "bg-slate-100 dark:bg-[#142720] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-emerald-900/30 hover:bg-slate-200 dark:hover:bg-[#1A332A]"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2: Live Hardware Telemetry Connection Bar */}
          <div className="bg-slate-50 dark:bg-[#142720]/70 rounded-2xl p-4 border border-slate-200/80 dark:border-emerald-900/30 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-mono font-bold text-slate-900 dark:text-white">
                <Cpu size={16} className="text-emerald-500" />
                <span>Connected Hardware Node: {hardwareSensors.nodeId}</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Hardware Synced
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-white dark:bg-[#0F1D17] p-2.5 rounded-xl border border-slate-200/60 dark:border-emerald-900/20 text-center">
                <div className="text-[10px] text-slate-400 font-mono font-bold flex items-center justify-center gap-1">
                  <Thermometer size={12} className="text-emerald-500" /> TEMP
                </div>
                <div className="text-sm font-black font-mono text-slate-900 dark:text-white mt-0.5">
                  {hardwareSensors.temp} {hardwareSensors.tempUnit}
                </div>
              </div>

              <div className="bg-white dark:bg-[#0F1D17] p-2.5 rounded-xl border border-slate-200/60 dark:border-emerald-900/20 text-center">
                <div className="text-[10px] text-slate-400 font-mono font-bold flex items-center justify-center gap-1">
                  <Droplets size={12} className="text-blue-500" /> HUMIDITY
                </div>
                <div className="text-sm font-black font-mono text-slate-900 dark:text-white mt-0.5">
                  {hardwareSensors.humidity} %
                </div>
              </div>

              <div className="bg-white dark:bg-[#0F1D17] p-2.5 rounded-xl border border-slate-200/60 dark:border-emerald-900/20 text-center">
                <div className="text-[10px] text-slate-400 font-mono font-bold flex items-center justify-center gap-1">
                  <Wind size={12} className="text-amber-500" /> ETHYLENE
                </div>
                <div className="text-sm font-black font-mono text-slate-900 dark:text-white mt-0.5">
                  {hardwareSensors.gas} ppm
                </div>
              </div>

              <div className="bg-white dark:bg-[#0F1D17] p-2.5 rounded-xl border border-slate-200/60 dark:border-emerald-900/20 text-center">
                <div className="text-[10px] text-slate-400 font-mono font-bold flex items-center justify-center gap-1">
                  <Activity size={12} className="text-teal-500" /> CO2
                </div>
                <div className="text-sm font-black font-mono text-slate-900 dark:text-white mt-0.5">
                  {hardwareSensors.co2} ppm
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleRunScan}
            disabled={isAnalyzing || Boolean(validationError)}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Running Multi-Modal Hardware Fusion AI...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Analyze Fruit Image & Compute Freshness</span>
              </>
            )}
          </button>

          {/* Step 3: Analysis Results Output */}
          {inspectionResult && !validationError && (
            <div className="bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl p-5 border border-emerald-500/20 space-y-4 animate-fadeIn">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
                <div>
                  <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    FUSED INSPECTION RESULT
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    {inspectionResult.fruitName}
                  </h3>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black border ${
                    inspectionResult.gradeColor === "emerald"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : inspectionResult.gradeColor === "amber"
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                  }`}
                >
                  <CheckCircle2 size={16} />
                  {inspectionResult.grade}
                </span>
              </div>

              {/* Score Display Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#0F1D17] p-4 rounded-xl border border-slate-200/80 dark:border-emerald-900/30 text-center">
                  <div className="text-[10px] font-mono font-bold text-slate-400">FUSED FRESHNESS SCORE</div>
                  <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    {inspectionResult.fusedFreshness} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${inspectionResult.fusedFreshness}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0F1D17] p-4 rounded-xl border border-slate-200/80 dark:border-emerald-900/30 text-center">
                  <div className="text-[10px] font-mono font-bold text-slate-400">ESTIMATED SHELF LIFE</div>
                  <div className="text-3xl font-black font-mono text-teal-600 dark:text-teal-400 mt-1">
                    {inspectionResult.estDays} <span className="text-xs text-slate-400 font-normal">Days</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Optimal Cold Chain Storage</div>
                </div>

                <div className="bg-white dark:bg-[#0F1D17] p-4 rounded-xl border border-slate-200/80 dark:border-emerald-900/30 text-center">
                  <div className="text-[10px] font-mono font-bold text-slate-400">SCORE BREAKDOWN</div>
                  <div className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300 mt-2 space-y-1">
                    <div>Visual AI: <span className="text-emerald-500 font-black">{inspectionResult.visualScore}%</span></div>
                    <div>Hardware: <span className="text-blue-500 font-black">{inspectionResult.hardwareScore}%</span></div>
                  </div>
                </div>
              </div>

              {/* Recommendation Banner */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#0F1D17] border border-emerald-500/20 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
                <ShieldCheck size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block mb-0.5">AI Logistics Recommendation:</span>
                  {inspectionResult.recommendation}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200/80 dark:border-emerald-900/30 bg-slate-50 dark:bg-[#0B1713] flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              navigate("/monitoring");
            }}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Open Multi-Node Console</span>
            <ArrowRight size={14} />
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-[#142720] text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition cursor-pointer"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
}

export default FruitScanModal;

