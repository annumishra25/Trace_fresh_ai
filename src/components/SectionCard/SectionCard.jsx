function SectionCard({
  title,
  subtitle,
  children,
  action
}) {
  return (
    <div className="bg-white border border-[#DDE4DF] rounded-2xl p-6 space-y-4 shadow-xs relative overflow-hidden">
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAEFEA] pb-3">
          <div>
            {title && (
              <h2 className="text-lg font-extrabold text-[#111715] tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-[#56635D] font-medium mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      {children}
    </div>
  );
}

export default SectionCard;
