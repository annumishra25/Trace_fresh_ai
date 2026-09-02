import { useEffect, useMemo, useState } from "react";
import { fetchAllBatches } from "../services/batchApi";
import BatchQRCodeCard from "../components/qr/BatchQRCodeCard";
import CreateBatchModal from "../components/qr/CreateBatchModal";
import UpdateBatchModal from "../components/qr/UpdateBatchModal";
import { Plus, RefreshCcw, QrCode, Search } from "lucide-react";

const QRCodeCenter = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

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

  return (
    <div className="min-h-screen bg-slate-100 px-4 md:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-4 py-2 text-sm font-medium mb-4">
            TraceFresh AI • QR Batch Identity Layer
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight">
            QR Code Control Center
          </h1>

          <p className="text-slate-600 text-lg mt-3 max-w-4xl leading-7">
            Create, manage, and update TraceFresh digital produce batches.
            Every batch here is linked to a QR-powered consumer freshness passport.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by batch ID, fruit, source, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-slate-200 rounded-2xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={loadBatches}
              className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-5 py-3 rounded-2xl font-medium"
            >
              <RefreshCcw size={18} />
              Refresh
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-medium"
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
            accent="text-blue-600"
          />
          <SummaryTile
            title="Verified Fresh"
            value={batches.filter((b) => b.latestAssessment?.status === "VERIFIED FRESH").length}
            accent="text-green-600"
          />
          <SummaryTile
            title="Monitor"
            value={batches.filter((b) => b.latestAssessment?.status === "MONITOR").length}
            accent="text-amber-500"
          />
          <SummaryTile
            title="QR Ready"
            value={batches.length}
            accent="text-purple-600"
          />
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl shadow-md p-10 text-center">
            <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
            <h2 className="text-2xl font-bold text-slate-900">Loading QR batch records...</h2>
          </div>
        ) : errorMsg ? (
          <div className="bg-white rounded-3xl shadow-md p-10 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Unable to load QR center</h2>
            <p className="text-slate-600">{errorMsg}</p>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-md p-10 text-center">
            <QrCode size={42} className="mx-auto text-slate-400 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-3">No batches found</h2>
            <p className="text-slate-600">
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
    </div>
  );
};

const SummaryTile = ({ title, value, accent }) => (
  <div className="bg-white rounded-3xl shadow-md p-5">
    <p className="text-slate-500 text-sm">{title}</p>
    <p className={`text-3xl font-bold mt-2 ${accent}`}>{value}</p>
  </div>
);

export default QRCodeCenter;