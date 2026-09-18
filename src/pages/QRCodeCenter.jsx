import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllBatches } from "../services/batchApi";
import BatchQRCodeCard from "../components/qr/BatchQRCodeCard";
import CreateBatchModal from "../components/qr/CreateBatchModal";
import UpdateBatchModal from "../components/qr/UpdateBatchModal";
import { Plus, RefreshCcw, QrCode, Search, ShieldCheck, ExternalLink } from "lucide-react";

const QRCodeCenter = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [verifyTokenInput, setVerifyTokenInput] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showScannerModal, setShowScannerModal] = useState(false);

  const loadBatches = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await fetchAllBatches();
      setBatches(data);
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to load batch QR records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const filteredBatches = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return batches;

    return batches.filter((batch) => {
      return (
        batch.batchId?.toLowerCase().includes(query) ||
        batch.displayName?.toLowerCase().includes(query) ||
        batch.fruitType?.toLowerCase().includes(query) ||
        batch.source?.toLowerCase().includes(query) ||
        batch.location?.toLowerCase().includes(query)
      );
    });
  }, [batches, search]);

  const handleBatchCreated = (newBatch) => {
    setBatches((prev) => [newBatch, ...prev]);
  };

  const handleOpenUpdate = (batch) => {
    setSelectedBatch(batch);
    setShowUpdateModal(true);
  };

  const handleBatchUpdated = (updatedBatch) => {
    setBatches((prev) =>
      prev.map((batch) =>
        batch.batchId === updatedBatch.batchId ? updatedBatch : batch
      )
    );
  };

  const handleQuickVerify = (e) => {
    e.preventDefault();
    if (!verifyTokenInput.trim()) return;
    const token = verifyTokenInput.trim();
    navigate(`/verify/${token}`);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-4 py-1.5 text-xs font-bold mb-3">
              TraceFresh AI • QR Identity & Passport Layer
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              QR Code Control Center
            </h1>

            <p className="text-slate-500 text-sm mt-2 max-w-4xl leading-relaxed font-medium">
              Manage unique QR identities, issue consumer public verification tokens, and inspect batch passport status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowScannerModal(true)}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl font-bold text-xs transition-colors shadow-md cursor-pointer"
            >
              <QrCode size={18} className="text-emerald-400" />
              Simulate QR Scanner
            </button>
          </div>
        </div>

        {/* Quick Public Token Lookup Bar */}
        <div className="bg-white rounded-3xl p-6 mb-6 text-slate-900 border border-slate-200 shadow-xs">
          <form onSubmit={handleQuickVerify} className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1">
              <label className="text-xs font-black uppercase tracking-wider text-emerald-700 block mb-1">
                🔍 Quick Public Verification Token Lookup
              </label>
              <input
                type="text"
                value={verifyTokenInput}
                onChange={(e) => setVerifyTokenInput(e.target.value)}
                placeholder="Enter token (e.g. TR-VER-89A7B3E1F4C2D0E5)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <ShieldCheck size={16} />
              Verify Passport →
            </button>
          </form>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 mb-6 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by batch ID, fruit, source, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 transition"
              />
            </div>

            <button
              onClick={loadBatches}
              className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-2xl font-bold text-xs border border-slate-200 transition cursor-pointer"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <Plus size={18} />
              Create New Batch
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          <SummaryTile
            title="Total Batches"
            value={batches.length}
            accent="text-blue-600 font-mono"
          />
          <SummaryTile
            title="Verified Fresh"
            value={batches.filter((b) => b.latestAssessment?.status === "VERIFIED FRESH").length}
            accent="text-emerald-600 font-mono"
          />
          <SummaryTile
            title="Monitor"
            value={batches.filter((b) => b.latestAssessment?.status === "MONITOR").length}
            accent="text-amber-600 font-mono"
          />
          <SummaryTile
            title="Active QR Tokens"
            value={batches.length}
            accent="text-violet-600 font-mono"
          />
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-xs">
            <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
            <h2 className="text-2xl font-black text-slate-900">Loading QR batch records...</h2>
          </div>
        ) : errorMsg ? (
          <div className="bg-white rounded-3xl border border-rose-200 p-10 text-center shadow-xs">
            <h2 className="text-2xl font-black text-rose-600 mb-3">Unable to load QR center</h2>
            <p className="text-slate-600">{errorMsg}</p>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-xs">
            <QrCode size={42} className="mx-auto text-slate-400 mb-4" />
            <h2 className="text-2xl font-black text-slate-900 mb-3">No batches found</h2>
            <p className="text-slate-500 font-medium">
              Try adjusting your search or create a new batch.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBatches.map((batch) => (
              <BatchQRCodeCard
                key={batch.batchId}
                batch={batch}
                onOpenUpdate={handleOpenUpdate}
              />
            ))}
          </div>
        )}
      </div>

      <CreateBatchModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onBatchCreated={handleBatchCreated}
      />

      <UpdateBatchModal
        batch={selectedBatch}
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedBatch(null);
        }}
        onBatchUpdated={handleBatchUpdated}
      />

      {/* QR Scanner Simulator Modal */}
      {showScannerModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <QrCode size={20} className="text-emerald-600" />
                <h3 className="text-lg font-black text-slate-900">QR Code Scanner Simulator</h3>
              </div>
              <button
                onClick={() => setShowScannerModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Simulate scanning a physical QR code box identity. Select a batch to resolve its token to the consumer portal.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {batches.map((b) => (
                <button
                  key={b.batchId}
                  onClick={() => {
                    setShowScannerModal(false);
                    navigate(`/verify/TR-VER-89A7B3E1F4C2D0E5`);
                  }}
                  className="w-full text-left p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">{b.displayName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">Batch: {b.batchId}</div>
                  </div>
                  <ExternalLink size={14} className="text-blue-600" />
                </button>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowScannerModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryTile = ({ title, value, accent }) => (
  <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
    <p className={`text-3xl font-black mt-2 ${accent}`}>{value}</p>
  </div>
);

export default QRCodeCenter;