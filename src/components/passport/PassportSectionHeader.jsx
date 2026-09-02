const PassportSectionHeader = ({ title, subtitle }) => {
  return (
    <div className="mb-5">
      <h3 className="text-2xl md:text-3xl font-bold text-slate-900">
        {title}
      </h3>

      {subtitle && (
        <p className="text-slate-500 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default PassportSectionHeader;