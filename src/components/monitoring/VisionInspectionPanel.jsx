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
    <div className="bg-white border border-[#DCE4DE] rounded-2xl p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden">
      {/* Header & Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-[#DCE4DE]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl font-extrabold text-[#101513] tracking-tight">
              Vision AI Inspection & Surface Anomaly Console
            </h3>
            <span className="text-[10px] font-bold bg-[#F1F4EE] text-[#063C2F] px-2 py-0.5 rounded border border-[#DCE4DE]">
              {modelMeta.modelName || "fruit_model_v4"} ({modelMeta.type || "PROTOTYPE"})
            </span>
          </div>
          <p className="text-xs text-[#4E5B55] mt-1 font-medium">
            Detecting Mold-like patches, Discoloration, Bruising & Surface Sheen (Node: <span className="font-bold text-[#063C2F]">{selectedNodeId}</span>)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase border ${
            severityEval.severity === "CRITICAL" ? "bg-[#FEE2E2] text-[#991B1B] border-[#DC2626]/20" :
            severityEval.severity === "HIGH" ? "bg-[#FEF3C7] text-[#92400E] border-[#D97706]/20" :
            "bg-[#DDF2E8] text-[#063C2F] border-[#16805F]/20"
          }`}>
            {severityEval.overallVisualStatus || "VERIFIED_FRESH"}
          </span>
          <span className="px-3 py-1 rounded-md text-xs font-bold border bg-[#F1F4EE] text-[#101513] border-[#DCE4DE]">
            Quality: {quality.qualityScore}% ({quality.status})
          </span>
        </div>
      </div>

      {/* Demo Scenario Selector Quick Bar */}
      <div className="bg-[#F7F8F3] border border-[#DCE4DE] rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#78837D]">
            Expo Demo Inspection Scenarios
          </span>
          <span className="text-[10px] bg-[#DDF2E8] text-[#063C2F] px-2 py-0.5 rounded font-bold border border-[#16805F]/20">
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
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedDemo === scen.id
                  ? "bg-[#063C2F] text-white shadow-sm"
                  : "bg-white text-[#101513] border border-[#DCE4DE] hover:bg-[#F1F4EE]"
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
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#063C2F] hover:bg-[#042E25] text-white transition shadow-sm cursor-pointer ml-auto flex items-center gap-1.5"
          >
            📷 Upload Image
          </button>
        </div>
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Bounding Box Overlay Canvas */}
        <div className="bg-[#F7F8F3] rounded-xl p-4 border border-[#DCE4DE] flex flex-col items-center justify-center space-y-3 relative overflow-hidden min-h-[320px]">
          {loading ? (
            <div className="flex flex-col items-center gap-2 py-16">
              <div className="w-8 h-8 border-4 border-[#063C2F] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-[#4E5B55]">Analyzing Produce Surface AI Model...</p>
            </div>
          ) : (
            <>
              <div className="relative w-full max-w-[380px] h-[300px] bg-[#101513] rounded-xl overflow-hidden shadow-md flex items-center justify-center border border-[#DCE4DE]">
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
                <span className="text-[#4E5B55]">
                  Classification: <strong className="text-[#101513] capitalize">{classification.label || "Fresh Produce"}</strong> ({classification.confidence}% conf)
                </span>

                <button
                  onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                  className="text-[#063C2F] font-bold hover:underline cursor-pointer transition-colors"
                >
                  {showBoundingBoxes ? "Hide Bounding Boxes" : "Show Bounding Boxes"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Detection Details & Explainability Panel */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="bg-[#F7F8F3] rounded-xl p-5 border border-[#DCE4DE] space-y-3">
            <h4 className="font-extrabold text-[#101513] text-sm flex items-center justify-between">
              <span>Detected Surface Anomalies ({detections.length})</span>
              <span className="text-xs font-semibold text-[#78837D]">
                Affected Area: <strong className="text-[#101513]">{inspection?.totalAreaPercent || 0}%</strong>
              </span>
            </h4>

            {detections.length === 0 ? (
              <div className="bg-[#DDF2E8] border border-[#16805F]/30 p-4 rounded-xl text-[#063C2F] text-xs font-bold">
                ✓ No visible surface anomalies detected. Produce surface appears healthy.
              </div>
            ) : (
              <div className="space-y-2">
                {detections.map((d) => (
                  <div key={d.id} className="bg-white p-3 rounded-xl border border-[#DCE4DE] text-xs space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#101513]">{d.label}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-[#FEE2E2] text-[#991B1B] border-[#DC2626]/20">
                        {d.severity}
                      </span>
                    </div>

                    <p className="text-[#4E5B55]">{d.explanation}</p>
                    <div className="flex items-center justify-between text-xs text-[#78837D] font-medium pt-1">
                      <span>Confidence: {Math.round(d.confidence * 100)}%</span>
                      <span>Area: {d.areaPercent}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Explainability Reasoning */}
          <div className="bg-[#DDF2E8] border border-[#16805F]/30 p-4 rounded-xl text-xs space-y-1 text-[#063C2F]">
            <h5 className="font-bold text-[#063C2F] text-xs flex items-center gap-1">
              <span>💡 Explainable Vision Reason:</span>
            </h5>
            <p className="leading-relaxed font-semibold">
              {severityEval.summary || "Visual profile matches acceptable fresh produce standards."}
            </p>
          </div>
        </div>
      </div>

      {/* Batch Visual Inspection Timeline */}
      <div className="pt-2">
        <h4 className="font-extrabold text-[#101513] text-sm mb-3">
          Batch Inspection History Timeline ({history.length})
        </h4>

        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {history.length === 0 ? (
            <p className="text-xs text-[#78837D] italic">No previous inspection history recorded.</p>
          ) : (
            history.map((h) => (
              <div key={h.inspectionId} className="bg-[#F7F8F3] p-3 rounded-xl border border-[#DCE4DE] text-xs flex items-center justify-between hover:bg-[#F1F4EE] transition-colors">
                <div>
                  <span className="font-bold text-[#101513]">{h.inspectionId}</span>
                  <span className="text-[#78837D] mx-2">|</span>
                  <span className="capitalize text-[#4E5B55] font-semibold">{h.classification?.label || "Inspection"}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#78837D]">
                    {new Date(h.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-[#DDF2E8] text-[#063C2F] border-[#16805F]/20">
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
