import React from "react";

export function LoadingState({ message = "Loading dashboard telemetry...", rows = 3, className = "" }) {
  return (
    <div className={`p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-semibold text-slate-600 font-mono">{message}</span>
      </div>
      <div className="space-y-2.5 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-100 rounded-lg animate-pulse" style={{ width: `${100 - i * 15}%` }}></div>
        ))}
      </div>
    </div>
  );
}

export default LoadingState;
