import { useState, useEffect, useRef } from "react";
import { useTelemetry } from "../../context/TelemetryContext";
import { uploadAndInspectImage, runDemoInspection, getBatchInspectionHistory } from "../../services/inspectionApi";

function VisionInspectionPanel() {
  const { selectedNodeId } = useTelemetry();
  const [inspection, setInspection] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState("HEALTHY");
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const fileInputRef = useRef(null);

  const batchId = "TF-APL-2026-001";

  // Initial demo load on mount
  useEffect(() => {
    handleRunDemo("HEALTHY", true);
    fetchBatchHistory();
  }, []);

  const fetchBatchHistory = async () => {
    const data = await getBatchInspectionHistory(batchId);
    setHistory(data);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const result = await uploadAndInspectImage(file, batchId, selectedNodeId);
    if (result) {
      setInspection(result);
      fetchBatchHistory();
    }
    setLoading(false);
  };

  const handleRunDemo = async (scenario, skipLoading = false) => {
    setSelectedDemo(scenario);
    if (!skipLoading) setLoading(true);
    const result = await runDemoInspection(scenario, batchId, selectedNodeId);
    if (result) {
      setInspection(result);
      fetchBatchHistory();
    }
    if (!skipLoading) setLoading(false);
  };

  const quality = inspection?.imageQuality || { qualityScore: 95, status: "GOOD", issues: [] };
  const detections = inspection?.detections || [];
  const severityEval = inspection?.severityAssessment || {};
  const classification = inspection?.classification || {};
  const modelMeta = inspection?.model || {};

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30 glow-rose";
      case "HIGH":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "MEDIUM":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 glow-emerald";
    }
  };

  const getBoxColor = (label) => {
    switch (label) {
      case "MOLD_LIKE":
      case "ROT_LIKE_DAMAGE":
        return "#f43f5e"; // rose
      case "DISCOLORATION":
      case "BRUISING":
        return "#f59e0b"; // amber
      case "WAX_LIKE_APPEARANCE":
        return "#10b981"; // emerald
      default:
        return "#3b82f6"; // blue
    }
  };

  return (
    <div className="glass-card border border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6 bg-slate-900/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 opacity-80" />

      {/* Header & Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl font-bold text-slate-100 tracking-tight">
              Vision AI Inspection & Surface Anomaly Console
            </h3>
            <span className="text-[10px] font-bold bg-slate-800 text-blue-400 px-2 py-0.5 rounded border border-slate-700 font-mono">
              {modelMeta.modelName || "fruit_model_v4"} ({modelMeta.type || "PROTOTYPE"})
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Detecting Mold-like patches, Discoloration, Bruising & Surface Sheen (Node: <span className="font-semibold font-mono text-blue-400">{selectedNodeId}</span>)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border shadow-sm ${getSeverityBadge(severityEval.severity)}`}>
            {severityEval.overallVisualStatus || "VERIFIED_FRESH"}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-extrabold border bg-slate-800/80 text-slate-300 border-slate-700/80">
            Quality: {quality.qualityScore}% ({quality.status})
          </span>
        </div>
      </div>

      {/* Demo Scenario Selector Quick Bar */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 shadow-inner space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Expo Demo Inspection Scenarios
          </span>
          <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono border border-blue-500/20">
            PROTOTYPE DECISION-SUPPORT
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { id: "HEALTHY", label: "✓ Fresh Produce" },
            { id: "MOLD", label: "🍄 Mold-Like Patch" },
            { id: "DISCOLORATION", label: "🍂 Discoloration" },
            { id: "BRUISING", label: "🟣 Surface Bruising" },
            { id: "WAX", label: "✨ Wax-Like Sheen" }
          ].map((scen) => (
            <button
              key={scen.id}
              onClick={() => handleRunDemo(scen.id)}
              disabled={loading}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                selectedDemo === scen.id
                  ? "bg-blue-600 text-white glow-blue"
                  : "bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800"
              }`}
            >
              {scen.label}
            </button>
          ))}

          {/* Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg glow-emerald cursor-pointer ml-auto flex items-center gap-1.5"
          >
            📷 Upload Image
          </button>
        </div>
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Bounding Box Overlay Canvas */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 flex flex-col items-center justify-center space-y-3 relative overflow-hidden min-h-[320px] shadow-inner">
          {loading ? (
            <div className="flex flex-col items-center gap-2 py-16">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-slate-400">Analyzing Produce Surface AI Model...</p>
            </div>
          ) : (
            <>
              <div className="relative w-full max-w-[380px] h-[300px] bg-slate-950 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center border border-slate-800">
                {/* Background Sample Image */}
                <img
                  src={
                    selectedDemo === "MOLD"
                      ? "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=60"
                      : selectedDemo === "DISCOLORATION" || selectedDemo === "BRUISING"
                      ? "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=60"
                      : "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=60"
                  }
                  alt="Produce Inspection"
                  className="w-full h-full object-cover opacity-90"
                />

                {/* SVG Bounding Box Layer */}
                {showBoundingBoxes && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400">
                    {detections.map((d) => {
                      const box = d.bbox || { x: 100, y: 100, width: 150, height: 150 };
                      const strokeColor = getBoxColor(d.label);
                      return (
                        <g key={d.id}>
                          <rect
                            x={box.x}
                            y={box.y}
                            width={box.width}
                            height={box.height}
                            fill={strokeColor}
                            fillOpacity="0.25"
                            stroke={strokeColor}
                            strokeWidth="3"
                            strokeDasharray="4,4"
                            rx="8"
                          />
                          <rect
                            x={box.x}
                            y={Math.max(0, box.y - 24)}
                            width={160}
                            height={22}
                            fill={strokeColor}
                            rx="4"
                          />
                          <text
                            x={box.x + 6}
                            y={Math.max(14, box.y - 8)}
                            fill="white"
                            fontSize="11"
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            {d.label} ({Math.round(d.confidence * 100)}%)
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                )}
              </div>

              <div className="flex items-center justify-between w-full px-2 text-xs">
                <span className="text-slate-400">
                  Classification: <strong className="text-slate-100 capitalize">{classification.label || "Fresh Produce"}</strong> ({classification.confidence}% conf)
                </span>

                <button
                  onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                  className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer transition-colors"
                >
                  {showBoundingBoxes ? "Hide Bounding Boxes" : "Show Bounding Boxes"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Detection Details & Explainability Panel */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="bg-slate-950/70 rounded-2xl p-5 border border-slate-800/80 space-y-3 shadow-inner">
            <h4 className="font-bold text-slate-100 text-sm flex items-center justify-between">
              <span>Detected Surface Anomalies ({detections.length})</span>
              <span className="text-xs font-normal text-slate-400">
                Affected Area: <strong className="text-slate-200">{inspection?.totalAreaPercent || 0}%</strong>
              </span>
            </h4>

            {detections.length === 0 ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-emerald-400 text-xs font-semibold glow-emerald">
                ✓ No visible surface anomalies detected. Produce surface appears healthy.
              </div>
            ) : (
              <div className="space-y-2">
                {detections.map((d) => (
                  <div key={d.id} className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100 font-mono">{d.label}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getSeverityBadge(d.severity)}`}>
                        {d.severity}
                      </span>
                    </div>

                    <p className="text-slate-300">{d.explanation}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                      <span>Confidence: {Math.round(d.confidence * 100)}%</span>
                      <span>Area: {d.areaPercent}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Explainability Reasoning */}
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-xs space-y-1.5 text-blue-200 shadow-sm">
            <h5 className="font-bold text-blue-400 text-xs flex items-center gap-1">
              <span>💡 Explainable Vision Reason:</span>
            </h5>
            <p className="leading-relaxed opacity-90 text-slate-300">
              {severityEval.summary || "Visual profile matches acceptable fresh produce standards."}
            </p>
          </div>
        </div>
      </div>

      {/* Batch Visual Inspection Timeline */}
      <div className="pt-2">
        <h4 className="font-bold text-slate-100 text-sm mb-3">
          Batch Inspection History Timeline ({history.length})
        </h4>

        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {history.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No previous inspection history recorded.</p>
          ) : (
            history.map((h) => (
              <div key={h.inspectionId} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-xs flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                <div>
                  <span className="font-bold text-slate-200 font-mono">{h.inspectionId}</span>
                  <span className="text-slate-500 mx-2">|</span>
                  <span className="capitalize text-slate-300">{h.classification?.label || "Inspection"}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(h.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadge(h.severityAssessment?.severity)}`}>
                    {h.severityAssessment?.overallVisualStatus || "OK"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default VisionInspectionPanel;
