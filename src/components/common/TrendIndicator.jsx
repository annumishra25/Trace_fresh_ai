import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function TrendIndicator({ value, label, isPositiveGood = true, className = "" }) {
  if (!value) return null;

  const isUp = String(value).includes("↑") || String(value).startsWith("+") || Number(value) > 0;
  const isNeutral = String(value).includes("0%") || String(value) === "0";

  let colorClasses = "bg-slate-100 text-slate-700 border-slate-200";
  let Icon = Minus;

  if (!isNeutral) {
    if (isUp) {
      Icon = TrendingUp;
      colorClasses = isPositiveGood
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-rose-50 text-rose-700 border-rose-200";
    } else {
      Icon = TrendingDown;
      colorClasses = isPositiveGood
        ? "bg-rose-50 text-rose-700 border-rose-200"
        : "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${colorClasses} ${className}`}>
      <Icon size={12} />
      <span>{value}</span>
      {label && <span className="text-[10px] font-medium opacity-80">{label}</span>}
    </span>
  );
}

export default TrendIndicator;
