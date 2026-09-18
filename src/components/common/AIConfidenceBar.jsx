import React from "react";
import { Sparkles } from "lucide-react";

export function AIConfidenceBar({ confidence = 0, label = "AI Model Confidence", className = "" }) {
  const score = Math.min(100, Math.max(0, Number(confidence) || 0));

  let colorClass = "bg-emerald-500";
  let badgeColor = "text-emerald-700 bg-emerald-50 border-emerald-200";

  if (score < 60) {
    colorClass = "bg-rose-500";
    badgeColor = "text-rose-700 bg-rose-50 border-rose-200";
  } else if (score < 80) {
    colorClass = "bg-amber-500";
    badgeColor = "text-amber-700 bg-amber-50 border-amber-200";
  }

  return (
    <div className={`p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Sparkles size={14} className="text-violet-600" />
          <span>{label}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-[11px] border ${badgeColor}`}>
          {score.toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
}

export default AIConfidenceBar;
