function SectionCard({
  title,
  children,
}) {
  return (
    <div className="bg-white border border-[#D1D5DB] rounded-2xl p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden">
      <h2 className="text-2xl font-extrabold text-[#063C2F] tracking-tight">
        {title}
      </h2>

      {children}
    </div>
  );
}

export default SectionCard;