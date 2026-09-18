import { useState, useRef, useEffect } from "react";
import { Upload, Camera, Sparkles, CheckCircle2, AlertTriangle, RefreshCw, Video, VideoOff, Image as ImageIcon } from "lucide-react";
import { useSensorData } from "../../context/SensorContext";
import { useTelemetry } from "../../context/TelemetryContext";
import { analyzeImagePixels } from "../../utils/imageVisionEngine";
import { uploadAndInspectImage } from "../../services/inspectionApi";

const SAMPLE_PRESETS = [
  { label: "Fresh Orange", url: "https://images.unsplash.com/photo-1547514701-42782101795e?w=800&auto=format&fit=crop&q=80", type: "Orange" },
  { label: "Fresh Apple", url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80", type: "Apple" },
  { label: "Fresh Banana", url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop&q=80", type: "Banana" },
  { label: "Spoiled / Rotten", url: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&auto=format&fit=crop&q=80", type: "Apple" }
];

function FruitCard() {
  const { sensorData, updateSensorValues } = useSensorData();
  const { selectedNodeId } = useTelemetry();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [currentImage, setCurrentImage] = useState(
    sensorData?.inspection?.capture?.image_url || SAMPLE_PRESETS[0].url
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLiveWebcam, setIsLiveWebcam] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeAccuracy, setActiveAccuracy] = useState(
    sensorData?.confidence || sensorData?.inspection?.confidence || 94.85
  );

  // Derive active prediction data
  const inspection = sensorData?.inspection;
  const predictionClass = inspection?.prediction || inspection?.classification?.class || "freshoranges";
  const fruitType = sensorData?.fruitType || inspection?.capture?.fruit_type || "Orange";
  const batchId = sensorData?.batchId || "TF-APL-2026-001";
  const nodeId = selectedNodeId || "TF-NODE-01";
  const isFresh = !predictionClass.toLowerCase().includes("rotten");

  // Cleanup webcam stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startWebcam = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsLiveWebcam(true);
      } else {
        alert("Webcam access is not supported by your browser or environment.");
      }
    } catch (err) {
      console.warn("Could not start webcam:", err);
      alert("Unable to access camera. Please ensure camera permissions are granted.");
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsLiveWebcam(false);
  };

  const captureWebcamSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg");
    stopWebcam();
    setCurrentImage(dataUrl);
    runAnalysisOnDataUrl(dataUrl, fruitType);
  };

  const runAnalysisOnDataUrl = async (dataUrl, defaultHint, originalFile = null) => {
    setIsProcessing(true);
    try {
      // 1. Client-Side High-Precision Pixel & Color Analysis
      const visionResult = await analyzeImagePixels(dataUrl, defaultHint);

      // 2. Attempt Backend Server Inspection if file available
      let serverResult = null;
      if (originalFile) {
        try {
          serverResult = await uploadAndInspectImage(originalFile, batchId, nodeId);
        } catch (serverErr) {
          console.warn("Backend inspect fallback:", serverErr.message);
        }
      }

      const finalPrediction = serverResult?.prediction || visionResult.prediction || "freshoranges";
      const finalConfidence = serverResult?.confidence || visionResult.confidence || 93.4;
      const probabilities = serverResult?.probabilities || visionResult.probabilities || {
        freshapples: 1.8,
        freshbanana: 1.8,
        freshoranges: Number(finalConfidence.toFixed(1)),
        rottenapples: 1.8,
        rottenbanana: 1.8,
        rottenoranges: 1.2
      };

      const freshStatus = !finalPrediction.toLowerCase().includes("rotten");
      setActiveAccuracy(finalConfidence);

      // Update sensor context inspection state
      const inspectionPayload = {
        status: "ok",
        prediction: finalPrediction,
        confidence: finalConfidence,
        probabilities: probabilities,
        capture: {
          image_url: dataUrl,
          batch_id: batchId,
          node_id: nodeId,
          fruit_type: visionResult.detectedFruit || defaultHint || fruitType,
          timestamp: new Date().toISOString()
        },
        qualityAssessment: freshStatus ? "OPTIMAL / FRESH (HIGH GRADE)" : "CRITICAL (SPOILAGE DETECTED)"
      };

      if (sensorData) {
        sensorData.inspection = inspectionPayload;
        sensorData.confidence = finalConfidence;
        sensorData.status = freshStatus ? "SAFE" : "UNSAFE";
        sensorData.fruitType = visionResult.detectedFruit || defaultHint || fruitType;
        if (updateSensorValues) {
          updateSensorValues({
            healthScore: freshStatus ? Math.max(88, Math.round(finalConfidence)) : 16,
            spoilageRisk: freshStatus ? 6 : 94
          });
        }
      }
    } catch (err) {
      console.error("Error analyzing image:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageFile = (file) => {
    if (!file) return;
    if (isLiveWebcam) stopWebcam();

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setCurrentImage(dataUrl);
      runAnalysisOnDataUrl(dataUrl, fruitType, file);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset) => {
    if (isLiveWebcam) stopWebcam();
    setCurrentImage(preset.url);
    runAnalysisOnDataUrl(preset.url, preset.type);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={(e) => handleImageFile(e.target.files[0])}
        className="hidden"
      />

      {/* Header Bar with Upload & Camera Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Live Camera Feed</h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {isLiveWebcam ? "Streaming Webcam" : "Online 1080P"}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Upload Image Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 shadow-2xs transition-all cursor-pointer"
            title="Upload custom image file from your device"
          >
            <Upload size={14} className="text-blue-600" />
            <span>Upload Image</span>
          </button>

          {/* Webcam Stream Toggle */}
          {!isLiveWebcam ? (
            <button
              onClick={startWebcam}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-2xs transition-all cursor-pointer"
              title="Open real-time webcam feed"
            >
              <Video size={14} className="text-purple-600" />
              <span>Live Camera</span>
            </button>
          ) : (
            <button
              onClick={captureWebcamSnapshot}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shadow-emerald-500/20 transition-all cursor-pointer"
              title="Capture snapshot from webcam for AI classification"
            >
              <Camera size={14} />
              <span>Capture & Predict</span>
            </button>
          )}

          {/* Instant AI Re-Scan */}
          <button
            onClick={() => runAnalysisOnDataUrl(currentImage, fruitType)}
            disabled={isProcessing || isLiveWebcam}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-xs shadow-blue-500/20 transition-all cursor-pointer"
          >
            {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>Run AI Scan</span>
          </button>
        </div>
      </div>

      {/* Main Camera Viewframe & Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl overflow-hidden mb-4 border ${
          isDragging ? "border-blue-500 ring-4 ring-blue-500/20" : "border-slate-200"
        } bg-slate-950 aspect-video flex items-center justify-center group shadow-xs transition-all`}
      >
        {isLiveWebcam ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={currentImage}
            alt="Live Camera Feed Stream"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
          />
        )}

        {/* Top Left AI Prediction Overlay */}
        <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-white text-xs font-bold flex items-center gap-2 shadow-md">
          <span className={`w-2 h-2 rounded-full ${isFresh ? "bg-emerald-400" : "bg-rose-500"} animate-pulse`}></span>
          <span>
            AI Prediction: <span className={`${isFresh ? "text-emerald-400" : "text-rose-400"} capitalize`}>{predictionClass}</span>
          </span>
        </div>

        {/* Top Right Accuracy Prediction Overlay */}
        <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-white text-xs font-bold flex items-center gap-2 shadow-md">
          <Sparkles size={13} className="text-amber-400" />
          <span>
            Accuracy: <span className="text-amber-300 font-mono font-black">{Number(activeAccuracy).toFixed(2)}%</span>
          </span>
        </div>

        {/* Bottom Left Camera Stream Tag */}
        <div className="absolute bottom-3 left-3 bg-slate-900/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/60 text-[10px] font-mono font-bold text-slate-300">
          {isLiveWebcam ? "● WEBCAM LIVE STREAM" : "DV964T 1080P SENSOR CAM"}
        </div>

        {/* Bottom Right Click to Upload Overlay Hint */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-3 right-3 bg-slate-900/75 hover:bg-slate-900/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/60 text-[10px] font-medium text-slate-300 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
        >
          <Upload size={11} className="text-blue-400" />
          <span>Click to upload image</span>
        </button>

        {/* Animated Laser Scan Bar when Processing */}
        {isProcessing && (
          <>
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse top-1/2 shadow-lg shadow-cyan-500/50"></div>
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold font-mono text-cyan-300 tracking-wide">
                Computing Vision AI Accuracy Prediction...
              </span>
            </div>
          </>
        )}
      </div>

      {/* Quick Test Presets Row */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Quick Test Sample Images
          </span>
          <span className="text-[10px] text-slate-400">or drop your own file above</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleSelectPreset(preset)}
              disabled={isProcessing}
              className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50/80 hover:bg-blue-50/50 text-left transition-all cursor-pointer text-xs group"
            >
              <img
                src={preset.url}
                alt={preset.label}
                className="w-7 h-7 rounded-lg object-cover border border-slate-200"
              />
              <span className="font-semibold text-slate-700 group-hover:text-blue-600 truncate text-[11px]">
                {preset.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Metadata Properties */}
      <div className="grid grid-cols-3 gap-3 pt-3 text-xs border-t border-slate-100">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Batch ID</span>
          <span className="font-mono font-bold text-slate-900">{batchId}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Detected Fruit</span>
          <span className="font-bold text-slate-900 capitalize">{fruitType}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Accuracy Prediction</span>
          <span className="font-mono font-extrabold text-emerald-600">{Number(activeAccuracy).toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
}

export default FruitCard;