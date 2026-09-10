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
    <div className="bg-white border border-[#DCE4DE] rounded-2xl p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden">
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-[#DDF2E8] text-[#063C2F] border border-[#16805F]/20">
              TraceFresh Telemetry & Batch Pipeline
            </span>

            <button
              onClick={toggleMode}
              className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold border transition-all cursor-pointer ${
                isLiveMode
                  ? "bg-[#DDF2E8] text-[#063C2F] border-[#16805F]/30"
                  : "bg-[#FEF3C7] text-[#92400E] border-[#D97706]/30"
              }`}
            >
              ● {isLiveMode ? "LIVE TELEMETRY MODE" : "DEMO MODE (Static)"}
            </button>
          </div>

          <h2 className="text-2xl font-extrabold text-[#101513] tracking-tight">
            Push Smart Node Telemetry into Batch Passport
          </h2>

          <p className="text-[#4E5B55] mt-1 max-w-3xl text-xs sm:text-sm font-medium leading-relaxed">
            Select a smart node device and shipment batch to stream telemetry into the TraceFresh data pipeline and update the digital food passport.
          </p>
        </div>

        <div className="bg-[#F7F8F3] rounded-xl px-4 py-3 min-w-[260px] border border-[#DCE4DE]">
          <p className="text-xs text-[#78837D] font-bold uppercase tracking-wider">Active Monitoring Node</p>
          <select
            value={selectedNodeId}
            onChange={(e) => setSelectedNodeId(e.target.value)}
            className="w-full mt-2 rounded-lg border border-[#DCE4DE] px-3 py-2 text-xs font-bold text-[#101513] bg-white outline-none focus:border-[#063C2F] transition-colors"
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
          <label className="block text-xs font-bold uppercase tracking-wider text-[#78837D] mb-2">
            Select Batch
          </label>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="w-full rounded-xl border border-[#DCE4DE] bg-white text-[#101513] px-4 py-3 outline-none focus:border-[#063C2F] text-xs font-semibold transition-colors"
          >
            {batches.map((batch) => (
              <option key={batch.batchId} value={batch.batchId}>
                {batch.displayName} — {batch.batchId}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#78837D] mb-2">
            Visual Classification Class
          </label>
          <input
            value={visualClass}
            onChange={(e) => setVisualClass(e.target.value)}
            className="w-full rounded-xl border border-[#DCE4DE] bg-white text-[#101513] px-4 py-3 outline-none focus:border-[#063C2F] text-xs font-semibold transition-colors"
            placeholder="freshapple / freshbanana / freshorange"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#78837D] mb-2">
            AI Model Confidence
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={confidence}
            onChange={(e) => setConfidence(e.target.value)}
            className="w-full rounded-xl border border-[#DCE4DE] bg-white text-[#101513] px-4 py-3 outline-none focus:border-[#063C2F] text-xs font-semibold transition-colors"
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

      <div className="bg-[#F7F8F3] rounded-2xl border border-[#DCE4DE] p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-[#101513] tracking-tight">
              Telemetry Ingestion & Inspection Snapshot
            </h3>
            <p className="text-[#4E5B55] text-xs mt-1 font-medium">
              Active telemetry payload from node <span className="font-bold text-[#063C2F]">{selectedNodeId}</span>
            </p>
          </div>

          <button
            onClick={inspectBatch}
            disabled={sensorData.inspecting}
            className="px-4 py-2 rounded-xl bg-[#063C2F] hover:bg-[#042E25] text-white font-bold text-xs uppercase tracking-wider disabled:opacity-60 transition-all cursor-pointer"
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
          <div className="text-[#4E5B55] text-xs py-2 font-medium">
            No telemetry packet received from node {selectedNodeId} yet. Run the telemetry simulator or select another node.
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <button
          onClick={handleRunScan}
          disabled={ingesting}
          className="px-6 py-3 rounded-xl bg-[#063C2F] hover:bg-[#042E25] text-white font-bold text-xs uppercase tracking-wider disabled:opacity-60 transition-all cursor-pointer flex-1 text-center"
        >
          {ingesting ? "Processing Telemetry Pipeline..." : "Ingest Telemetry into Batch Passport"}
        </button>

        {current && (
          <a
            href={`/passport/${current.batchId}`}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-xl bg-[#F1F4EE] hover:bg-[#E8EEE7] text-[#063C2F] border border-[#DCE4DE] font-bold text-xs uppercase tracking-wider text-center transition-all cursor-pointer"
          >
            Open Batch Digital Passport
          </a>
        )}
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-[#DC2626]/30 bg-[#FEE2E2] text-[#991B1B] p-4 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {scanResult && (
        <div className="rounded-2xl border border-[#16805F]/30 bg-[#DDF2E8] p-5 space-y-4">
          <div>
            <h3 className="text-xl font-extrabold text-[#063C2F] tracking-tight">
              TraceFresh Scan & Telemetry Result
            </h3>
            <p className="text-[#063C2F] text-xs mt-1 font-medium">
              Batch <span className="font-bold">{scanResult.batchId}</span> was updated from node telemetry.
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
    <div className="bg-[#F7F8F3] rounded-xl p-4 border border-[#DCE4DE]">
      <p className="text-xs font-bold text-[#78837D] uppercase tracking-wider">{label}</p>
      <p className="text-sm font-extrabold text-[#101513] mt-1">{value}</p>
      {subValue && <p className="text-xs font-semibold text-[#063C2F] mt-0.5">{subValue}</p>}
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-[#DCE4DE] p-3 shadow-xs">
      <p className="text-xs font-medium text-[#78837D]">{label}</p>
      <p className="text-base font-bold text-[#101513] mt-1">{value}</p>
    </div>
  );
}

function ResultCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-[#16805F]/20 p-3 shadow-xs">
      <p className="text-xs font-semibold text-[#063C2F]">{label}</p>
      <p className="text-base font-extrabold text-[#063C2F] mt-1">{value ?? "N/A"}</p>
    </div>
  );
}

export default BatchScanControl;