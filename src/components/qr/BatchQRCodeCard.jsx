import { useMemo, useState } from "react";
import QRCode from "react-qr-code";
import {
  Copy,
  Download,
  ExternalLink,
  RefreshCcw,
  QrCode,
} from "lucide-react";

import { FRONTEND_BASE_URL } from "../../config/appConfig";

const BatchQRCodeCard = ({ batch, onOpenUpdate }) => {
  const [copied, setCopied] = useState(false);

  const passportUrl = useMemo(() => {
    if (batch?.passportUrl && batch.passportUrl.trim() !== "") {
      return batch.passportUrl;
    }
    return `${FRONTEND_BASE_URL}/passport/${batch.batchId}`;
  }, [batch]);

  const freshnessScore = batch?.latestAssessment?.freshnessScore ?? "--";
  const spoilageRisk = batch?.latestAssessment?.spoilageRisk ?? "--";
  const status = batch?.latestAssessment?.status ?? "UNKNOWN";

  const lastScan = batch?.traceability?.lastScanTime
    ? new Date(batch.traceability.lastScanTime).toLocaleString()
    : "N/A";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(passportUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy URL", err);
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
      ? "bg-green-50 text-green-700 border-green-200"
      : status === "MONITOR"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : status === "ALERT"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <div className="bg-white rounded-3xl shadow-md p-6 flex flex-col gap-5 border border-slate-100">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">
            {batch.displayName}
          </h3>
          <p className="text-slate-500 mt-1">Batch ID: {batch.batchId}</p>
          <p className="text-slate-500 text-sm mt-1">
            {batch.source} • {batch.location}
          </p>
        </div>

        <div
          className={`px-4 py-2 rounded-full border text-sm font-semibold ${statusClass}`}
        >
          {status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
        {/* QR PANEL */}
        <div className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center border border-slate-200 min-h-[320px]">
          <div className="w-full flex items-center justify-between mb-3">
            <div className="inline-flex items-center gap-2 text-slate-700 font-semibold">
              <QrCode size={18} />
              Batch QR
            </div>

            <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-full">
              Live Passport
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center">
            <QRCode
              id={`qr-${batch.batchId}`}
              value={passportUrl}
              size={180}
              bgColor="#FFFFFF"
              fgColor="#0f172a"
              level="M"
            />
          </div>

          <div className="mt-4 w-full text-center">
            <p className="text-xs text-slate-500 leading-5 break-all">
              Scan to open TraceFresh consumer freshness passport
            </p>
          </div>

          <div className="mt-4 w-full bg-white rounded-2xl border border-slate-200 p-3">
            <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">
              QR Destination
            </p>
            <p className="text-xs text-slate-700 break-all">{passportUrl}</p>
          </div>

          <div className="mt-4 w-full flex flex-col gap-2">
            <a
              href={passportUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium"
            >
              <ExternalLink size={16} />
              Open Passport
            </a>

            <button
              onClick={handleDownloadQR}
              className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-xl font-medium"
            >
              <Download size={16} />
              Download QR
            </button>
          </div>
        </div>

        {/* BATCH INFO */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-slate-500 text-sm">Freshness Score</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {freshnessScore}
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-slate-500 text-sm">Spoilage Risk</p>
              <p className="text-2xl font-bold text-orange-500 mt-2">
                {spoilageRisk}%
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-slate-500 text-sm">Fruit Type</p>
              <p className="text-lg font-bold text-slate-900 mt-2 uppercase">
                {batch.fruitType}
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-slate-500 text-sm">Last Scan</p>
              <p className="text-sm font-semibold text-slate-900 mt-2 leading-5">
                {lastScan}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-slate-500 text-sm">Passport URL</p>
            <p className="text-sm text-slate-700 mt-2 break-all">
              {passportUrl}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-xl font-medium"
            >
              <Copy size={16} />
              {copied ? "Copied!" : "Copy URL"}
            </button>

            <button
              onClick={() => onOpenUpdate(batch)}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-medium"
            >
              <RefreshCcw size={16} />
              Update Batch Scan
            </button>

            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-xl font-medium">
              <QrCode size={16} />
              QR Ready
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchQRCodeCard;