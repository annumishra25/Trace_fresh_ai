import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export function ErrorState({
  title = "Failed to load telemetry",
  message = "An error occurred while connecting to backend services.",
  onRetry,
  className = ""
}) {
  return (
    <div className={`p-6 rounded-2xl border border-rose-200 bg-rose-50/50 text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle size={20} className="text-rose-500 mt-0.5 shrink-0" />
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">{title}</h4>
          <p className="text-xs text-rose-600 mt-0.5 font-medium">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer shrink-0"
        >
          <RefreshCw size={13} />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}

export default ErrorState;
