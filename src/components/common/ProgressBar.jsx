import React from "react";

export function ProgressBar({
  value = 0,
  max = 100,
  label,
  showValue = true,
  color = "blue",
  size = "md",
  className = ""
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colorStyles = {
    blue: "bg-blue-600",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    violet: "bg-violet-600",
    gradient: "bg-gradient-to-r from-blue-600 to-emerald-500"
  };

  const heightStyles = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4"
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1.5">
          {label && <span>{label}</span>}
          {showValue && <span className="font-mono text-slate-500">{percentage.toFixed(1)}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightStyles[size] || heightStyles.md}`}>
        <div
          className={`${colorStyles[color] || colorStyles.blue} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        ></div>
      </div>
    </div>
  );
}

export default ProgressBar;
