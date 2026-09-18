import React from "react";
import { AlertTriangle, AlertCircle, CheckCircle, Info } from "lucide-react";

export function AlertBadge({ level = "INFO", message, icon = true, className = "" }) {
  const configs = {
    CRITICAL: {
      bg: "bg-rose-50 text-rose-800 border-rose-200",
      icon: AlertCircle,
      iconColor: "text-rose-600"
    },
    WARNING: {
      bg: "bg-amber-50 text-amber-800 border-amber-200",
      icon: AlertTriangle,
      iconColor: "text-amber-600"
    },
    HEALTHY: {
      bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
      icon: CheckCircle,
      iconColor: "text-emerald-600"
    },
    SUCCESS: {
      bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
      icon: CheckCircle,
      iconColor: "text-emerald-600"
    },
    INFO: {
      bg: "bg-blue-50 text-blue-800 border-blue-200",
      icon: Info,
      iconColor: "text-blue-600"
    }
  };

  const conf = configs[level?.toUpperCase()] || configs.INFO;
  const IconComp = conf.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${conf.bg} ${className}`}>
      {icon && <IconComp size={15} className={`shrink-0 ${conf.iconColor}`} />}
      <span>{message || level}</span>
    </div>
  );
}

export default AlertBadge;
