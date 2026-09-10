import { useEffect, useState } from "react";
import { fetchAllBatches, ingestBatchScan } from "../../services/batchApi";
import { useMonitoringBatch } from "../../context/MonitoringBatchContext";
import { useSensorData } from "../../context/SensorContext";
import { useTelemetry } from "../../context/TelemetryContext";

function BatchScanControl() {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [ingesting, setIngesting] = useState(false);
  const [visualClass, setVisualClass] = useState("");
  const [confidence, setConfidence] = useState(0.9);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    selectedBatch,
    setSelectedBatch,
    scanResult,
    setScanResult,
  } = useMonitoringBatch();

  const { inspectBatch, sensorData } = useSensorData();
  const { nodes, selectedNodeId, setSelectedNodeId, activeTelemetry, isLiveMode, toggleMode } = useTelemetry();

  useEffect(() => {
    loadBatches();
  }, []);

  useEffect(() => {
    if (!selectedBatchId || batches.length === 0) return;

    const batch = batches.find((b) => b.batchId === selectedBatchId) || null;
    if (batch && selectedBatch?.batchId !== batch.batchId) {
      setSelectedBatch(batch);
      setScanResult(null);
      setVisualClass(
        batch.latestAssessment?.visualClass || `fresh${batch.fruitType}`
      );
      setConfidence(batch.latestAssessment?.confidence ?? 0.9);
    }
  }, [selectedBatchId, batches]);

  const loadBatches = async () => {
    try {
      const data = await fetchAllBatches();
      setBatches(data);

      if (data.length > 0 && !selectedBatchId) {
        setSelectedBatchId(data[0].batchId);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to load batches");
    }
  };

  const handleRunScan = async () => {
    if (!selectedBatch) {
      setErrorMsg("Please select a batch first");
      return;
    }

    setIngesting(true);
    setErrorMsg("");

    try {
      const tempVal = activeTelemetry?.sensors?.temperature?.value ?? sensorData.temperature ?? 25;
      const humVal = activeTelemetry?.sensors?.humidity?.value ?? sensorData.humidity ?? 60;
      const vocVal = activeTelemetry?.sensors?.voc?.value ?? sensorData.voc ?? 1.8;

      const payload = {
        fruitType: selectedBatch.fruitType,
        visualClass,
        confidence: Number(confidence),
        temperature: Number(tempVal),
        humidity: Number(humVal),
        mq135: Number(vocVal),
        node: selectedNodeId || selectedBatch.traceability?.node || selectedBatch.location || "Smart Node 01",
      };

      const updated = await ingestBatchScan(selectedBatch.batchId, payload);
      setScanResult(updated);
      setSelectedBatch(updated);

      const refreshed = await fetchAllBatches();
      setBatches(refreshed);
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || "Failed to ingest live scan");
    } finally {
      setIngesting(false);
    }
  };

  const current = scanResult || selectedBatch;

  return (
    <div className="glass-card border border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6 bg-slate-900/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 opacity-80" />
      
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm">
              TraceFresh Telemetry & Batch Pipeline
            </span>

            <button
              onClick={toggleMode}
              className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-sm ${
                isLiveMode
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 glow-emerald hover:bg-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
              }`}
            >
              ● {isLiveMode ? "LIVE TELEMETRY MODE" : "DEMO MODE (Static)"}
            </button>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">
            Push Smart Node Telemetry into Batch Passport
          </h2>

          <p className="text-slate-400 mt-2 max-w-3xl text-sm leading-relaxed">
            Select a smart node device and shipment batch to stream telemetry into the TraceFresh data pipeline and update the digital food passport.
          </p>
        </div>

        <div className="bg-slate-950/60 rounded-2xl px-4 py-3 min-w-[260px] border border-slate-800/80 shadow-inner">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Monitoring Node</p>
          <select
            value={selectedNodeId}
            onChange={(e) => setSelectedNodeId(e.target.value)}
            className="w-full mt-2 rounded-xl border border-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 bg-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            {nodes.map((n) => (
              <option key={n.nodeId} value={n.nodeId}>
                {n.nodeId} — {n.status} ({n.assignedBatchId || "Unassigned"})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Select Batch
          </label>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 text-slate-100 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-medium transition-colors"
          >
            {batches.map((batch) => (
              <option key={batch.batchId} value={batch.batchId}>
                {batch.displayName} — {batch.batchId}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Visual Classification Class
          </label>
          <input
            value={visualClass}
            onChange={(e) => setVisualClass(e.target.value)}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 text-slate-100 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-medium transition-colors"
            placeholder="freshapple / freshbanana / freshorange"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            AI Model Confidence
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={confidence}
            onChange={(e) => setConfidence(e.target.value)}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 text-slate-100 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-medium transition-colors"
          />
        </div>
      </div>

      {current && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <InfoCard
            label="Current Batch"
            value={current.displayName}
            subValue={current.batchId}
          />
          <InfoCard
            label="Fruit Type"
            value={(current.fruitType || "-").toUpperCase()}
          />
          <InfoCard
            label="Current Status"
            value={current.latestAssessment?.status || "N/A"}
          />
          <InfoCard
            label="Current Risk"
            value={current.latestAssessment?.riskLevel || "N/A"}
          />
        </div>
      )}

      <div className="bg-slate-950/70 rounded-3xl border border-slate-800/80 p-5 space-y-4 shadow-inner">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-100 tracking-tight">
              Telemetry Ingestion & Inspection Snapshot
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Active telemetry payload from node <span className="font-semibold font-mono text-blue-400">{selectedNodeId}</span>
            </p>
          </div>

          <button
            onClick={inspectBatch}
            disabled={sensorData.inspecting}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg glow-purple disabled:opacity-60 transition-all cursor-pointer"
          >
            {sensorData.inspecting ? "Running AI Inspection..." : "Inspect Batch"}
          </button>
        </div>

        {activeTelemetry?.sensors ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            <MetricCard label="Temperature" value={`${activeTelemetry.sensors.temperature?.value ?? "--"} °C`} />
            <MetricCard label="Humidity" value={`${activeTelemetry.sensors.humidity?.value ?? "--"} %`} />
            <MetricCard label="CO₂" value={`${activeTelemetry.sensors.co2?.value ?? "--"} ppm`} />
            <MetricCard label="VOC" value={`${activeTelemetry.sensors.voc?.value ?? "--"} ppm`} />
            <MetricCard label="Gas" value={`${activeTelemetry.sensors.gas?.value ?? "--"} ppm`} />
          </div>
        ) : (
          <div className="text-slate-400 text-sm py-2">
            No telemetry packet received from node {selectedNodeId} yet. Run the telemetry simulator or select another node.
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <button
          onClick={handleRunScan}
          disabled={ingesting}
          className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide shadow-lg glow-emerald disabled:opacity-60 transition-all cursor-pointer flex-1 text-center"
        >
          {ingesting ? "Processing Telemetry Pipeline..." : "Ingest Telemetry into Batch Passport"}
        </button>

        {current && (
          <a
            href={`/passport/${current.batchId}`}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-sm text-center transition-all cursor-pointer shadow-md"
          >
            Open Batch Digital Passport
          </a>
        )}
      </div>

      {errorMsg && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 p-4 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {scanResult && (
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/30 p-6 space-y-4 shadow-xl">
          <div>
            <h3 className="text-2xl font-bold text-slate-100 tracking-tight">
              TraceFresh Scan & Telemetry Result
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Batch <span className="font-semibold font-mono text-emerald-400">{scanResult.batchId}</span> was updated from node telemetry.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <ResultCard label="Freshness" value={scanResult.latestAssessment?.freshnessScore} />
            <ResultCard label="Shelf Life" value={`${scanResult.latestAssessment?.shelfLifeDays} d`} />
            <ResultCard label="Spoilage Risk" value={`${scanResult.latestAssessment?.spoilageRisk}%`} />
            <ResultCard label="Risk Level" value={scanResult.latestAssessment?.riskLevel} />
            <ResultCard label="Status" value={scanResult.latestAssessment?.status} />
            <ResultCard label="Storage" value={scanResult.latestSensors?.storageCondition} />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value, subValue }) {
  return (
    <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 shadow-inner">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-base font-bold text-slate-100 mt-1">{value}</p>
      {subValue && <p className="text-xs font-mono text-slate-400 mt-0.5">{subValue}</p>}
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-3.5 shadow-sm">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="text-lg font-bold text-slate-100 mt-1 font-mono">{value}</p>
    </div>
  );
}

function ResultCard({ label, value }) {
  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-3.5 shadow-sm">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="text-lg font-bold text-emerald-400 mt-1 font-mono">{value ?? "N/A"}</p>
    </div>
  );
}

export default BatchScanControl;