function SectionCard({
  title,
  children,
}) {
  return (
    <div className="glass-card border border-emerald-800/50 rounded-3xl p-6 md:p-8 space-y-6 bg-[#092a1f]/85 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 opacity-90" />

      <h2 className="text-2xl font-bold text-white tracking-tight">
        {title}
      </h2>

      {children}
    </div>
  );
}

export default SectionCard;