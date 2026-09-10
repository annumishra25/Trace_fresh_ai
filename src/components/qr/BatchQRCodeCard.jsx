import { useMemo, useState, useEffect } from "react";
import QRCode from "react-qr-code";
import {
  Copy,
  Download,
  ExternalLink,
  RefreshCcw,
  QrCode,
  ShieldCheck,
  Slash
} from "lucide-react";

import { FRONTEND_BASE_URL } from "../../config/appConfig";
import { getQrByBatch, deactivateQr, createQrIdentity } from "../../services/qrPassportApi";

const BatchQRCodeCard = ({ batch, onOpenUpdate }) => {
  const [copied, setCopied] = useState(false);
  const [qrRecord, setQrRecord] = useState(null);
  const [loadingQr, setLoadingQr] = useState(true);

  useEffect(() => {
    fetchBatchQr();
  }, [batch.batchId]);

  const fetchBatchQr = async () => {
    setLoadingQr(true);
    let record = await getQrByBatch(batch.batchId);
    if (!record) {
      record = await createQrIdentity(batch.batchId);
    }
    setQrRecord(record);
    setLoadingQr(false);
  };

  const publicToken = qrRecord?.publicToken || `TR-VER-89A7B3E1F4C2D0E5`;
  const qrStatus = qrRecord?.status || "ACTIVE";

  const publicVerifyUrl = useMemo(() => {
    return `${FRONTEND_BASE_URL}/verify/${publicToken}`;
  }, [publicToken]);

  const freshnessScore = batch?.latestAssessment?.freshnessScore ?? "--";
  const spoilageRisk = batch?.latestAssessment?.spoilageRisk ?? "--";
  const status = batch?.latestAssessment?.status ?? "UNKNOWN";

  const lastScan = batch?.traceability?.lastScanTime
    ? new Date(batch.traceability.lastScanTime).toLocaleString()
    : "N/A";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicVerifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy URL", err);
    }
  };

  const handleDeactivate = async () => {
    if (!qrRecord) return;
    if (window.confirm(`Deactivate QR identity ${qrRecord.qrId}? This will revoke consumer verification for this batch token.`)) {
      await deactivateQr(qrRecord.qrId, "Deactivated by Operator via Control Center");
      fetchBatchQr();
    }
  };

  const handleReissue = async () => {
    if (window.confirm(`Issue a new QR identity for batch ${batch.batchId}? The old QR token will be marked as REPLACED.`)) {
      await createQrIdentity(batch.batchId, null, true);
      fetchBatchQr();
    }
  };

  const handleDownloadQR = () => {
    try {
      const svg = document.getElementById(`qr-${batch.batchId}`);
      if (!svg) {
        console.error("QR SVG not found");
        return;
      }

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const blob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${batch.batchId}-tracefresh-qr.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download QR", error);
    }
  };

  const statusClass =
    status === "VERIFIED FRESH"
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold"
      : status === "MONITOR"
      ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold"
      : status === "ALERT"
      ? "bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold"
      : "bg-slate-800 text-slate-300 border-slate-700 font-bold";

  const qrStatusClass =
    qrStatus === "ACTIVE"
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
      : qrStatus === "REVOKED"
      ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
      : "bg-amber-500/20 text-amber-300 border-amber-500/40";

  return (
    <div className="glass-card bg-slate-900/80 rounded-3xl p-6 flex flex-col gap-6 border border-slate-800 shadow-xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-black text-slate-100">
              {batch.displayName}
            </h3>
            <span className={`text-xs px-3 py-1 rounded-full font-bold border ${qrStatusClass}`}>
              QR: {qrStatus}
            </span>
          </div>
          <p className="text-slate-400 mt-1 font-mono text-xs">
            Batch ID: <strong className="text-blue-400">{batch.batchId}</strong> | QR ID: <strong className="text-cyan-300">{qrRecord?.qrId || "QR-" + batch.batchId}</strong>
          </p>
          <p className="text-slate-300 text-sm mt-1 font-medium">
            {batch.source} • {batch.location}
          </p>
        </div>

        <div
          className={`px-4 py-2 rounded-full border text-xs font-black uppercase tracking-wider ${statusClass}`}
        >
          {status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        {/* QR PANEL */}
        <div className="bg-slate-950/80 rounded-2xl p-4 flex flex-col items-center border border-slate-800 min-h-[340px]">
          <div className="w-full flex items-center justify-between mb-3">
            <div className="inline-flex items-center gap-2 text-slate-200 font-bold text-xs">
              <QrCode size={16} className="text-emerald-400" />
              Public Verification QR
            </div>

            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
              Step 8 Ready
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200 flex items-center justify-center">
            <QRCode
              id={`qr-${batch.batchId}`}
              value={publicVerifyUrl}
              size={170}
              bgColor="#FFFFFF"
              fgColor={qrStatus === "ACTIVE" ? "#0f172a" : "#94a3b8"}
              level="M"
            />
          </div>

          <div className="mt-3 w-full text-center">
            <p className="text-xs text-slate-400 leading-5">
              Public Token: <span className="font-mono font-bold text-emerald-400">{publicToken}</span>
            </p>
          </div>

          <div className="mt-3 w-full bg-slate-900 rounded-2xl border border-slate-800 p-2.5 text-center">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">
              Consumer Verification URL
            </p>
            <p className="text-[11px] text-blue-400 font-mono break-all font-bold">{publicVerifyUrl}</p>
          </div>

          <div className="mt-3 w-full flex flex-col gap-2">
            <a
              href={publicVerifyUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl font-black text-xs shadow-md transition-colors cursor-pointer"
            >
              <ExternalLink size={14} />
              Verify Public Passport
            </a>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadQR}
                className="inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl font-bold text-xs border border-slate-700 transition cursor-pointer"
              >
                <Download size={14} />
                SVG
              </button>
              {qrStatus === "ACTIVE" ? (
                <button
                  onClick={handleDeactivate}
                  className="inline-flex items-center justify-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  <Slash size={14} />
                  Revoke
                </button>
              ) : (
                <button
                  onClick={handleReissue}
                  className="inline-flex items-center justify-center gap-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  <RefreshCcw size={14} />
                  Reissue
                </button>
              )}
            </div>
          </div>
        </div>

        {/* BATCH INFO */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Freshness Score</p>
              <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
                {freshnessScore}
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Spoilage Risk</p>
              <p className="text-2xl font-black text-amber-400 font-mono mt-1">
                {spoilageRisk}%
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Fruit Type</p>
              <p className="text-lg font-black text-slate-100 mt-1 uppercase">
                {batch.fruitType}
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Last Scan</p>
              <p className="text-xs font-bold font-mono text-slate-200 mt-1 leading-relaxed">
                {lastScan}
              </p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Sanitized Public Verification Token</p>
            <p className="text-sm font-mono font-black text-cyan-300 mt-1">
              {publicToken}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
            >
              <Copy size={16} />
              {copied ? "Copied!" : "Copy Verification URL"}
            </button>

            <button
              onClick={() => onOpenUpdate(batch)}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl font-black text-xs transition shadow-md cursor-pointer"
            >
              <RefreshCcw size={16} />
              Update Batch Scan
            </button>

            <button
              onClick={handleReissue}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-md cursor-pointer"
            >
              <ShieldCheck size={16} />
              Issue New QR Token
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchQRCodeCard;