import { useState } from "react";
import { createBatch } from "../../services/batchApi";

const initialForm = {
  batchId: "",
  fruitType: "apple",
  displayName: "",
  source: "",
  location: "",
  lotId: "",
  packedDate: "",
  shipmentId: "",
  node: ""
};

const CreateBatchModal = ({ isOpen, onClose, onBatchCreated }) => {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");

    try {
      const payload = {
        batchId: form.batchId,
        fruitType: form.fruitType,
        displayName: form.displayName || form.batchId,
        source: form.source,
        location: form.location,
        latestAssessment: {
          visualClass: `fresh${form.fruitType}`,
          confidence: 0.9,
          freshnessScore: 90,
          shelfLifeDays: 7,
          spoilageRisk: 10,
          riskLevel: "GOOD",
          status: "VERIFIED FRESH",
          qualityAdvisory:
            "Initial batch created. No suspicious quality pattern detected in the demo setup.",
          suspiciousQualityFlag: false,
          reasons: [
            "Initial batch created through QR control center",
            "Awaiting live hardware-linked reassessment"
          ]
        },
        latestSensors: {
          temperature: 25,
          humidity: 60,
          mq135: 180,
          storageCondition: "Good"
        },
        traceability: {
          lotId: form.lotId,
          packedDate: form.packedDate,
          shipmentId: form.shipmentId,
          node: form.node || form.location
        }
      };

      const created = await createBatch(payload);
      onBatchCreated(created);
      setForm(initialForm);
      onClose();
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || "Failed to create batch");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-800 text-slate-100">
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-start justify-between gap-4 border-b pb-4 border-slate-800">
            <div>
              <h2 className="text-3xl font-black text-slate-100 tracking-tight">Create New Batch</h2>
              <p className="text-slate-300 text-sm mt-1">
                Generate a new TraceFresh digital batch identity and QR-linked passport.
              </p>
            </div>

            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl px-4 py-2 text-xs border border-slate-700 transition cursor-pointer"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Batch ID" name="batchId" value={form.batchId} onChange={handleChange} required />
              <Input label="Display Name" name="displayName" value={form.displayName} onChange={handleChange} required />
              <SelectFruit value={form.fruitType} onChange={handleChange} />
              <Input label="Source" name="source" value={form.source} onChange={handleChange} required />
              <Input label="Location" name="location" value={form.location} onChange={handleChange} required />
              <Input label="Lot ID" name="lotId" value={form.lotId} onChange={handleChange} />
              <Input label="Packed Date" name="packedDate" type="date" value={form.packedDate} onChange={handleChange} />
              <Input label="Shipment ID" name="shipmentId" value={form.shipmentId} onChange={handleChange} />
              <Input label="Traceability Node" name="node" value={form.node} onChange={handleChange} />
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
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-60"
              >
                {saving ? "Creating..." : "Create Batch"}
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
    <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
    <input
      {...props}
      className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const SelectFruit = ({ value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-2">Fruit Type</label>
    <select
      name="fruitType"
      value={value}
      onChange={onChange}
      className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="apple">Apple</option>
      <option value="banana">Banana</option>
      <option value="orange">Orange</option>
    </select>
  </div>
);

export default CreateBatchModal;