function SectionCard({
  title,
  subtitle,
  children,
  action,
  className = ""
}) {
  return (
    <section className={`bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm relative overflow-hidden transition-all duration-200 ${className}`}>
      {(title || action) && (          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            {title && (
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>{title}</span>
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}

      <div>{children}</div>
    </section>
  );
}

export default SectionCard;

