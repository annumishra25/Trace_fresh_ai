import React from "react";
import { CheckCircle2, Clock, AlertTriangle, Info } from "lucide-react";

export function Timeline({ events = [], className = "" }) {
  if (!events || events.length === 0) return null;

  const getStatusIcon = (type) => {
    switch (type) {
      case "SUCCESS":
      case "COMPLETED":
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case "WARNING":
        return <AlertTriangle size={16} className="text-amber-500" />;
      case "PENDING":
      case "IN_PROGRESS":
        return <Clock size={16} className="text-blue-500" />;
      default:
        return <Info size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className={`relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 ${className}`}>
      {events.map((event, index) => (
        <div key={event.id || index} className="relative flex items-start gap-4 group">
          <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
            {getStatusIcon(event.status || event.type)}
          </div>
          <div className="flex-1 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-blue-200 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-slate-900">{event.title}</h4>
              {event.timestamp && (
                <span className="text-[10px] font-mono font-medium text-slate-400">
                  {event.timestamp}
                </span>
              )}
            </div>
            {event.description && (
              <p className="text-xs text-slate-500 mt-1 font-medium leading-snug">
                {event.description}
              </p>
            )}
            {event.location && (
              <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <span>📍 {event.location}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Timeline;
