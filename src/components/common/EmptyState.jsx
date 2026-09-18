import React from "react";
import { Inbox } from "lucide-react";

export function EmptyState({
  icon: Icon = Inbox,
  title = "No Data Available",
  description = "There are no records matching your request at this time.",
  action,
  className = ""
}) {
  return (
    <div className={`py-12 px-6 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-4 shadow-2xs">
        <Icon size={24} />
      </div>
      <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

export default EmptyState;
