import React from "react";

export function SectionHeader({ title, subtitle, action, badge, className = "" }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 ${className}`}>
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">{title}</h2>
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2 self-start sm:self-auto">{action}</div>}
    </div>
  );
}

export default SectionHeader;
