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
      ? "bg-[#E4F5EC] text-[#064C3B] border-[#C3E9D5]"
      : status === "MONITOR"
      ? "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]"
      : status === "ALERT"
      ? "bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]"
      : "bg-[#FAFBF8] text-[#111715] border-[#DDE4DF]";

  const qrStatusClass =
    qrStatus === "ACTIVE"
      ? "bg-[#E4F5EC] text-[#064C3B] border-[#C3E9D5]"
      : qrStatus === "REVOKED"
      ? "bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]"
      : "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]";

  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col gap-6 border border-[#DDE4DF] shadow-xs">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-extrabold text-[#111715]">
              {batch.displayName}
            </h3>
            <span className={`text-xs px-3 py-1 rounded-full font-extrabold border ${qrStatusClass}`}>
              QR: {qrStatus}
            </span>
          </div>
          <p className="text-[#56635D] mt-1 font-semibold text-xs">
            Batch ID: <strong className="text-[#064C3B]">{batch.batchId}</strong> | QR ID: <strong className="text-[#111715]">{qrRecord?.qrId || "QR-" + batch.batchId}</strong>
          </p>
          <p className="text-[#56635D] text-xs mt-1 font-semibold">
            {batch.source} • {batch.location}
          </p>
        </div>

        <div
          className={`px-4 py-1.5 rounded-full border text-xs font-extrabold uppercase tracking-wider ${statusClass}`}
        >
          {status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        {/* QR PANEL */}
        <div className="bg-[#FAFBF8] rounded-xl p-4 flex flex-col items-center border border-[#DDE4DF] min-h-[340px]">
          <div className="w-full flex items-center justify-between mb-3">
            <div className="inline-flex items-center gap-2 text-[#111715] font-extrabold text-xs">
              <QrCode size={16} className="text-[#064C3B]" />
              Public Verification QR
            </div>

            <span className="text-[10px] font-extrabold bg-[#E4F5EC] text-[#064C3B] px-2 py-0.5 rounded border border-[#C3E9D5]">
              Step 8 Ready
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-xs border border-[#DDE4DF] flex items-center justify-center">
            <QRCode
              id={`qr-${batch.batchId}`}
              value={publicVerifyUrl}
              size={170}
              bgColor="#FFFFFF"
              fgColor={qrStatus === "ACTIVE" ? "#111715" : "#56635D"}
              level="M"
            />
          </div>

          <div className="mt-3 w-full text-center">
            <p className="text-xs text-[#56635D] font-semibold">
              Public Token: <span className="font-extrabold text-[#064C3B]">{publicToken}</span>
            </p>
          </div>

          <div className="mt-3 w-full bg-white rounded-xl border border-[#DDE4DF] p-2.5 text-center">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#56635D] mb-0.5">
              Consumer Verification URL
            </p>
            <p className="text-[11px] text-[#064C3B] font-bold break-all">{publicVerifyUrl}</p>
          </div>

          <div className="mt-3 w-full flex flex-col gap-2">
            <a
              href={publicVerifyUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#064C3B] hover:bg-[#042E25] text-white px-4 py-2 rounded-xl font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <ExternalLink size={14} />
              Verify Public Passport
            </a>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadQR}
                className="inline-flex items-center justify-center gap-1.5 bg-[#FAFBF8] hover:bg-[#F1F4EE] text-[#111715] px-3 py-1.5 rounded-xl font-extrabold text-xs border border-[#DDE4DF] transition cursor-pointer"
              >
                <Download size={14} />
                SVG
              </button>
              {qrStatus === "ACTIVE" ? (
                <button
                  onClick={handleDeactivate}
                  className="inline-flex items-center justify-center gap-1.5 bg-[#FEE2E2] hover:bg-[#fca5a5] text-[#991B1B] border border-[#FCA5A5] px-3 py-1.5 rounded-xl font-extrabold text-xs transition cursor-pointer"
                >
                  <Slash size={14} />
                  Revoke
                </button>
              ) : (
                <button
                  onClick={handleReissue}
                  className="inline-flex items-center justify-center gap-1.5 bg-[#FEF3C7] hover:bg-[#fde68a] text-[#92400E] border border-[#FDE68A] px-3 py-1.5 rounded-xl font-extrabold text-xs transition cursor-pointer"
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
            <div className="bg-[#FAFBF8] border border-[#DDE4DF] rounded-xl p-4">
              <p className="text-[#56635D] text-xs font-extrabold uppercase tracking-wider">Freshness Score</p>
              <p className="text-2xl font-extrabold text-[#064C3B] mt-1">
                {freshnessScore}
              </p>
            </div>

            <div className="bg-[#FAFBF8] border border-[#DDE4DF] rounded-xl p-4">
              <p className="text-[#56635D] text-xs font-extrabold uppercase tracking-wider">Spoilage Risk</p>
              <p className="text-2xl font-extrabold text-[#D97706] mt-1">
                {spoilageRisk}%
              </p>
            </div>

            <div className="bg-[#FAFBF8] border border-[#DDE4DF] rounded-xl p-4">
              <p className="text-[#56635D] text-xs font-extrabold uppercase tracking-wider">Fruit Type</p>
              <p className="text-lg font-extrabold text-[#111715] mt-1 uppercase">
                {batch.fruitType}
              </p>
            </div>

            <div className="bg-[#FAFBF8] border border-[#DDE4DF] rounded-xl p-4">
              <p className="text-[#56635D] text-xs font-extrabold uppercase tracking-wider">Last Scan</p>
              <p className="text-xs font-bold text-[#111715] mt-1 leading-relaxed">
                {lastScan}
              </p>
            </div>
          </div>

          <div className="bg-[#FAFBF8] border border-[#DDE4DF] rounded-xl p-4">
            <p className="text-[#56635D] text-xs font-extrabold uppercase tracking-wider">Sanitized Public Verification Token</p>
            <p className="text-sm font-extrabold text-[#064C3B] mt-1">
              {publicToken}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 bg-[#FAFBF8] hover:bg-[#F1F4EE] text-[#111715] border border-[#DDE4DF] px-4 py-2.5 rounded-xl font-extrabold text-xs transition cursor-pointer"
            >
              <Copy size={16} />
              {copied ? "Copied!" : "Copy Verification URL"}
            </button>

            <button
              onClick={() => onOpenUpdate(batch)}
              className="inline-flex items-center gap-2 bg-[#D97706] hover:bg-[#b45309] text-white px-4 py-2.5 rounded-xl font-extrabold text-xs transition shadow-xs cursor-pointer"
            >
              <RefreshCcw size={16} />
              Update Batch Scan
            </button>

            <button
              onClick={handleReissue}
              className="inline-flex items-center gap-2 bg-[#064C3B] hover:bg-[#042E25] text-white px-4 py-2.5 rounded-xl font-extrabold text-xs transition shadow-xs cursor-pointer"
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