function AlertCenter() {
  return (
    <div className="bg-white border border-[#DCE4DE] rounded-2xl p-6 shadow-sm space-y-3 relative overflow-hidden">
      <h2 className="text-xl font-extrabold text-[#101513] tracking-tight flex items-center justify-between">
        <span>Alert Center</span>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FEE2E2] text-[#991B1B] border border-[#DC2626]/20">2 Active Alerts</span>
      </h2>

      <div className="space-y-2 text-xs">
        <div className="p-3 rounded-xl bg-[#F7F8F3] border border-[#DCE4DE] flex items-center justify-between">
          <span className="text-[#101513] font-semibold">⚠️ Temp Excursion (TF-NODE-01)</span>
          <span className="font-bold text-[#D97706]">29.5°C</span>
        </div>
        <div className="p-3 rounded-xl bg-[#F7F8F3] border border-[#DCE4DE] flex items-center justify-between">
          <span className="text-[#101513] font-semibold">⚠️ Ethylene Gas Spike (TF-NODE-02)</span>
          <span className="font-bold text-[#DC2626]">1.45 ppm</span>
        </div>
      </div>
    </div>
  );
}

export default AlertCenter;