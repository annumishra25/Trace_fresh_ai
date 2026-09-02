import { useEffect, useState } from "react";
import { ingestBatchScan } from "../../services/batchApi";

const UpdateBatchModal = ({ batch, isOpen, onClose, onBatchUpdated }) => {
  const [form, setForm] = useState({
    visualClass: "",
    confidence: 0.9,
    temperature: 25,
    humidity: 60,
    mq135: 180,
    node: ""
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (batch) {
      setForm({
        visualClass:
          batch.latestAssessment?.visualClass || `fresh${batch.fruitType}`,
        confidence: batch.latestAssessment?.confidence ?? 0.9,
        temperature: batch.latestSensors?.temperature ?? 25,
        humidity: batch.latestSensors?.humidity ?? 60,
        mq135: batch.latestSensors?.mq135 ?? 180,
        node: batch.traceability?.node || batch.location || ""
      });
    }
  }, [batch]);

  if (!isOpen || !batch) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: ["confidence", "temperature", "humidity", "mq135"].includes(name)
        ? value
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");

    try {
      const payload = {
        fruitType: batch.fruitType,
        visualClass: form.visualClass,
        confidence: Number(form.confidence),
        temperature: Number(form.temperature),
        humidity: Number(form.humidity),
        mq135: Number(form.mq135),
        node: form.node
      };

      const updated = await ingestBatchScan(batch.batchId, payload);
      onBatchUpdated(updated);
      onClose();
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || "Failed to ingest batch scan");
    } finally {
      setSaving(false);
    }
  };

  const expectedFreshClass = `fresh${batch.fruitType}`;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                Ingest New Batch Scan
              </h2>
              <p className="text-slate-500 mt-1">
                Submit fresh sensor and visual scan inputs. TraceFresh AI will
                automatically assess freshness, spoilage risk, and advisory status.
              </p>
            </div>

            <button
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 rounded-xl px-4 py-2"
            >
              Close
            </button>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 mb-6">
            <p className="text-slate-900 font-semibold">{batch.displayName}</p>
            <p className="text-slate-500 text-sm">Batch ID: {batch.batchId}</p>
            <p className="text-slate-500 text-sm mt-1">
              Expected fresh visual class:{" "}
              <span className="font-semibold text-slate-700">
                {expectedFreshClass}
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <Input
                label="Visual Class"
                name="visualClass"
                value={form.visualClass}
                onChange={handleChange}
                placeholder={expectedFreshClass}
              />

              <Input
                label="Confidence"
                name="confidence"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={form.confidence}
                onChange={handleChange}
              />

              <Input
                label="Temperature °C"
                name="temperature"
                type="number"
                step="0.1"
                value={form.temperature}
                onChange={handleChange}
              />

              <Input
                label="Humidity %"
                name="humidity"
                type="number"
                step="0.1"
                value={form.humidity}
                onChange={handleChange}
              />

              <Input
                label="MQ135"
                name="mq135"
                type="number"
                step="1"
                value={form.mq135}
                onChange={handleChange}
              />

              <Input
                label="Traceability Node"
                name="node"
                value={form.node}
                onChange={handleChange}
                placeholder="Warehouse / transport node"
              />
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                What TraceFresh AI will calculate automatically
              </h3>
              <ul className="text-slate-700 text-sm md:text-base leading-7 list-disc pl-5">
                <li>Freshness score</li>
                <li>Shelf life estimate</li>
                <li>Spoilage risk percentage</li>
                <li>Risk level and status</li>
                <li>Quality advisory and suspicious quality flag</li>
                <li>Reason codes and storage condition summary</li>
              </ul>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4">
                {errorMsg}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 font-medium"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium disabled:opacity-60"
              >
                {saving ? "Ingesting..." : "Run TraceFresh Scan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-2">
      {label}
    </label>
    <input
      {...props}
      className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

export default UpdateBatchModal;