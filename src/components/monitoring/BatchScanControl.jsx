import { useEffect, useState } from "react";
import { fetchAllBatches, ingestBatchScan } from "../../services/batchApi";
import { useMonitoringBatch } from "../../context/MonitoringBatchContext";
import { useSensorData } from "../../context/SensorContext";
const SENSOR_API = "http://127.0.0.1:5000/api/sensors";

function BatchScanControl() {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [loadingSensors, setLoadingSensors] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [visualClass, setVisualClass] = useState("");
  const [confidence, setConfidence] = useState(0.9);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    selectedBatch,
    setSelectedBatch,
    liveSensors,
    setLiveSensors,
    scanResult,
    setScanResult,
  } = useMonitoringBatch();

  const {
  inspectBatch,
  sensorData,
} = useSensorData();

  useEffect(() => {
    loadBatches();
  }, []);

  useEffect(() => {
    if (!selectedBatchId || batches.length === 0) return;

    const batch = batches.find((b) => b.batchId === selectedBatchId) || null;
    setSelectedBatch(batch);
    setScanResult(null);

    if (batch) {
      setVisualClass(
        batch.latestAssessment?.visualClass || `fresh${batch.fruitType}`
      );
      setConfidence(batch.latestAssessment?.confidence ?? 0.9);
    }
  }, [selectedBatchId, batches, setSelectedBatch, setScanResult]);

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

  const fetchLiveSensors = async () => {
    setLoadingSensors(true);
    setErrorMsg("");

    try {
      const res = await fetch(SENSOR_API);
      if (!res.ok) throw new Error("Failed to fetch live sensors");
      const data = await res.json();
      setLiveSensors(data);
    } catch (error) {
      console.error(error);
      setErrorMsg("Unable to fetch live sensor data from backend");
    } finally {
      setLoadingSensors(false);
    }
  };

  const handleRunScan = async () => {
    if (!selectedBatch) {
      setErrorMsg("Please select a batch first");
      return;
    }

    if (!liveSensors) {
      setErrorMsg("Fetch live sensor data before running TraceFresh scan");
      return;
    }

    setIngesting(true);
    setErrorMsg("");

    try {
      const payload = {
        fruitType: selectedBatch.fruitType,
        visualClass,
        confidence: Number(confidence),
        temperature: Number(sensorData.temperature ?? 25),
        humidity: Number(sensorData.humidity ?? 60),
        mq135: Number(sensorData.voc ?? 180),
        node:
          selectedBatch.traceability?.node ||
          selectedBatch.location ||
          "Live Monitoring Console",
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
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
        <div>
          <p className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 mb-3">
            TraceFresh Batch Intelligence Bridge
          </p>

          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Push Live Monitoring Data into a Batch Passport
          </h2>

          <p className="text-slate-500 mt-2 max-w-3xl">
            Select a batch, fetch the latest live sensor readings, and run a
            TraceFresh assessment. The same scan updates the batch, QR record,
            and consumer freshness passport.
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl px-4 py-3 min-w-[240px]">
          <p className="text-sm text-slate-500">Monitoring → Batch Pipeline</p>
          <p className="text-lg font-bold text-slate-900 mt-1">
            Live scan → AI assessment → QR passport
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-1">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Select Batch
          </label>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          >
            {batches.map((batch) => (
              <option key={batch.batchId} value={batch.batchId}>
                {batch.displayName} — {batch.batchId}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Visual Class
          </label>
          <input
            value={visualClass}
            onChange={(e) => setVisualClass(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="freshapple / freshbanana / freshorange"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Confidence
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={confidence}
            onChange={(e) => setConfidence(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
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

      <div className="bg-slate-50 rounded-3xl border border-slate-100 p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Live Sensor Snapshot
            </h3>
            <p className="text-slate-500 mt-1">
              Pull current backend sensor values before ingesting the batch scan.
            </p>
          </div>

          <button
  onClick={inspectBatch}
  disabled={sensorData.inspecting}
  className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-60"
>
  {sensorData.inspecting
    ? "Running AI Inspection..."
    : "Inspect Batch"}
</button>
        </div>

        {sensorData.inspection ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            <MetricCard label="Temperature" value={`${sensorData.temperature} °C`} />
            <MetricCard label="Humidity" value={`${sensorData.humidity} %`} />
            <MetricCard label="VOC / Gas" value={sensorData.voc} />
            <MetricCard label="CO₂" value={sensorData.co2} />
            <MetricCard label="Ethylene" value={sensorData.ethylene} />
          </div>
        ) : (
          <div className="text-slate-500 text-sm">
            No live sensor data loaded yet. Click{" "}
            <span className="font-semibold">Fetch Live Sensors</span>.
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <button
          onClick={handleRunScan}
          disabled={ingesting}
          className="px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-60"
        >
          {ingesting ? "Running TraceFresh Scan..." : "Push Live Scan to Batch"}
        </button>

        {current && (
          <a
            href={`/passport/${current.batchId}`}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-center"
          >
            Open Batch Passport
          </a>
        )}
      </div>

      {errorMsg && (
        <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 p-4">
          {errorMsg}
        </div>
      )}

      {scanResult && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 space-y-5">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">
              TraceFresh Scan Result
            </h3>
            <p className="text-slate-600 mt-1">
              Batch <span className="font-semibold">{scanResult.batchId}</span>{" "}
              was updated from live monitoring data.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <ResultCard
              label="Freshness"
              value={scanResult.latestAssessment?.freshnessScore}
            />
            <ResultCard
              label="Shelf Life"
              value={`${scanResult.latestAssessment?.shelfLifeDays} d`}
            />
            <ResultCard
              label="Spoilage Risk"
              value={`${scanResult.latestAssessment?.spoilageRisk}%`}
            />
            <ResultCard
              label="Risk Level"
              value={scanResult.latestAssessment?.riskLevel}
            />
            <ResultCard
              label="Status"
              value={scanResult.latestAssessment?.status}
            />
            <ResultCard
              label="Storage"
              value={scanResult.latestSensors?.storageCondition}
            />
          </div>

          <div className="bg-white rounded-2xl border border-emerald-100 p-4">
            <p className="text-sm font-semibold text-slate-500 mb-2">
              Quality Advisory
            </p>
            <p className="text-slate-800">
              {scanResult.latestAssessment?.qualityAdvisory}
            </p>
          </div>

          {scanResult.latestAssessment?.reasons?.length > 0 && (
            <div className="bg-white rounded-2xl border border-emerald-100 p-4">
              <p className="text-sm font-semibold text-slate-500 mb-3">
                Reason Codes
              </p>
              <ul className="space-y-2 text-slate-700 list-disc pl-5">
                {scanResult.latestAssessment.reasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value, subValue }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-lg font-bold text-slate-900 mt-1">{value}</p>
      {subValue && <p className="text-sm text-slate-500 mt-1">{subValue}</p>}
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function ResultCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-xl font-bold text-slate-900 mt-1">{value ?? "N/A"}</p>
    </div>
  );
}

export default BatchScanControl;