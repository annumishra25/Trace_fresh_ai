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
          text: "text-[#064C3B]",
          badge: "bg-[#E4F5EC] border-[#C3E9D5]"
        }
      : status === "MONITOR"
      ? {
          text: "text-[#92400E]",
          badge: "bg-[#FEF3C7] border-[#FDE68A]"
        }
      : {
          text: "text-[#991B1B]",
          badge: "bg-[#FEE2E2] border-[#FCA5A5]"
        };

  return (
    <div className="bg-white rounded-2xl border border-[#DDE4DF] shadow-xs overflow-hidden">
      <div className="bg-[#064C3B] px-6 md:px-8 py-5 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="uppercase tracking-[0.2em] text-xs font-extrabold text-white/90">
              TraceFresh AI Live Passport
            </p>
            <h2 className="text-xl md:text-2xl font-extrabold mt-1">
              Batch Quality Passport
            </h2>
          </div>

          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-extrabold">
            <QrCode size={16} />
            QR-Linked Batch Record
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div className="text-4xl md:text-5xl">{fruitEmoji}</div>

              <div>
                <h3 className="text-2xl md:text-4xl font-extrabold text-[#111715]">
                  {batch.displayName}
                </h3>
                <p className="text-[#064C3B] font-extrabold text-sm md:text-base mt-1">
                  Batch ID: {batch.batchId}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-2 bg-[#E4F5EC] text-[#064C3B] border border-[#C3E9D5] rounded-full px-3.5 py-1.5 text-xs font-extrabold">
                    <ShieldCheck size={16} />
                    Live AI Freshness Passport
                  </div>

                  <div className="inline-flex items-center gap-2 bg-[#FAFBF8] text-[#111715] border border-[#DDE4DF] rounded-full px-3.5 py-1.5 text-xs font-extrabold">
                    {batch.fruitType.toUpperCase()} BATCH
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-[#FAFBF8] border border-[#DDE4DF] rounded-xl p-4">
                <p className="text-[#56635D] text-xs font-extrabold uppercase tracking-wider">Source</p>
                <p className="font-extrabold text-[#111715] mt-1 text-sm">
                  {batch.source}
                </p>
              </div>

              <div className="bg-[#FAFBF8] border border-[#DDE4DF] rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-[#56635D] text-xs font-extrabold uppercase tracking-wider">
                  <MapPin size={14} />
                  Current Location
                </div>
                <p className="font-extrabold text-[#064C3B] mt-1 text-sm">
                  {batch.location}
                </p>
              </div>

              <div className="bg-[#FAFBF8] border border-[#DDE4DF] rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-[#56635D] text-xs font-extrabold uppercase tracking-wider">
                  <Clock3 size={14} />
                  Last Verified
                </div>
                <p className="font-extrabold text-[#111715] mt-1 text-sm">
                  {new Date(batch.lastUpdated).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`xl:min-w-[280px] rounded-2xl border p-6 text-center shadow-xs ${statusStyles.badge}`}
          >
            <p className="text-[#56635D] text-xs font-extrabold uppercase tracking-wider">AI Verification Status</p>
            <p className={`text-2xl md:text-3xl font-extrabold mt-2 ${statusStyles.text}`}>
              {status}
            </p>
            <p className="text-[#111715] text-xs font-bold mt-2">
              Confidence: {(batch.latestAssessment.confidence * 100).toFixed(1)}%
            </p>

            <div className="mt-4 inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 border border-[#DDE4DF] text-xs font-extrabold text-[#064C3B]">
              <ShieldCheck size={16} className="text-[#064C3B]" />
              TraceFresh AI Verified
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassportHero;