import { ShieldCheck, QrCode, MapPin, Clock3 } from "lucide-react";

const fruitEmojiMap = {
  apple: "🍎",
  banana: "🍌",
  orange: "🍊"
};

const PassportHero = ({ batch }) => {
  const fruitEmoji = fruitEmojiMap[batch.fruitType] || "🍎";
  const status = batch.latestAssessment.status || "VERIFIED";

  const statusStyles =
    status === "VERIFIED FRESH"
      ? {
          text: "text-green-700",
          badge: "bg-green-50 border-green-200"
        }
      : status === "MONITOR"
      ? {
          text: "text-amber-700",
          badge: "bg-amber-50 border-amber-200"
        }
      : {
          text: "text-red-700",
          badge: "bg-red-50 border-red-200"
        };

  return (
    <div className="bg-white rounded-3xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 px-6 md:px-8 py-5 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="uppercase tracking-[0.2em] text-xs md:text-sm text-blue-100">
              TraceFresh AI Live Passport
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mt-2">
              Batch Quality Passport
            </h2>
          </div>

          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm">
            <QrCode size={16} />
            QR-Linked Batch Record
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div className="text-5xl md:text-6xl">{fruitEmoji}</div>

              <div>
                <h3 className="text-3xl md:text-5xl font-bold text-slate-900">
                  {batch.displayName}
                </h3>
                <p className="text-slate-600 text-lg mt-2">
                  Batch ID: {batch.batchId}
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-4 py-2 text-sm font-medium">
                    <ShieldCheck size={16} />
                    Live AI Freshness Passport
                  </div>

                  <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 rounded-full px-4 py-2 text-sm font-medium">
                    {batch.fruitType.toUpperCase()} BATCH
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-slate-500 text-sm">Source</p>
                <p className="font-semibold text-slate-900 mt-2">
                  {batch.source}
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <MapPin size={14} />
                  Current Location
                </div>
                <p className="font-semibold text-slate-900 mt-2">
                  {batch.location}
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Clock3 size={14} />
                  Last Verified
                </div>
                <p className="font-semibold text-slate-900 mt-2">
                  {new Date(batch.lastUpdated).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`xl:min-w-[280px] rounded-3xl border p-6 text-center ${statusStyles.badge}`}
          >
            <p className="text-slate-500 text-sm">AI Verification Status</p>
            <p className={`text-3xl md:text-4xl font-extrabold mt-3 ${statusStyles.text}`}>
              {status}
            </p>
            <p className="text-slate-600 text-sm mt-3">
              Confidence: {(batch.latestAssessment.confidence * 100).toFixed(1)}%
            </p>

            <div className="mt-4 inline-flex items-center gap-2 bg-white/70 rounded-full px-4 py-2 border border-white/60 text-sm text-slate-700">
              <ShieldCheck size={16} className="text-green-600" />
              TraceFresh AI Verified
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassportHero;