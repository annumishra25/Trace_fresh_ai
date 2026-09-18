import React from "react";

export function DataCard({
  title,
  subtitle,
  action,
  children,
  footer,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  noPadding = false
}) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all duration-200 overflow-hidden flex flex-col ${className}`}>
      {(title || subtitle || action) && (
        <div className={`p-5 border-b border-slate-100 flex items-center justify-between gap-4 ${headerClassName}`}>
          <div>
            {title && <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={`flex-1 ${noPadding ? "" : "p-5"} ${bodyClassName}`}>
        {children}
      </div>
      {footer && (
        <div className="p-4 bg-slate-50/70 border-t border-slate-100 text-xs text-slate-600 font-medium">
          {footer}
        </div>
      )}
    </div>
  );
}

export default DataCard;
