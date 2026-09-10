function SectionCard({
  title,
  children,
}) {
  return (
    <div className="glass-card border border-[#DCE4DE] dark:border-[#23483D] rounded-2xl p-6 md:p-8 space-y-6 bg-white dark:bg-[#0D2820] shadow-xs relative overflow-hidden">
      <h2 className="text-2xl font-extrabold text-[#101513] dark:text-[#F4F7F2] tracking-tight">
        {title}
      </h2>

      {children}
    </div>
  );
}

export default SectionCard;