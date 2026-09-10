const PassportSectionHeader = ({ title, subtitle }) => {
  return (
    <div className="mb-5">
      <h3 className="text-xl md:text-2xl font-extrabold text-[#111715] tracking-tight">
        {title}
      </h3>

      {subtitle && (
        <p className="text-[#56635D] text-xs font-semibold mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default PassportSectionHeader;