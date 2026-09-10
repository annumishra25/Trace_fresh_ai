function AlertCenter() {
  return (
    <div className="bg-white border border-[#DDE4DF] rounded-2xl p-6 shadow-xs space-y-4 relative overflow-hidden">
      <h2 className="text-lg font-extrabold text-[#111715] tracking-tight flex items-center justify-between">
        <span>Alert Center</span>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]">2 Active Alerts</span>
      </h2>

      <div className="space-y-2 text-xs">
        <div className="p-3.5 rounded-xl bg-[#FAFBF8] border border-[#DDE4DF] flex items-center justify-between font-medium">
          <span className="text-[#111715] font-semibold flex items-center gap-2">
            <span className="text-[#D97706]">⚠️</span> Temp Excursion (TF-NODE-01)
          </span>
          <span className="font-bold font-mono text-[#D97706]">29.5°C</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#FAFBF8] border border-[#DDE4DF] flex items-center justify-between font-medium">
          <span className="text-[#111715] font-semibold flex items-center gap-2">
            <span className="text-[#DC2626]">⚠️</span> Ethylene Gas Spike (TF-NODE-02)
          </span>
          <span className="font-bold font-mono text-[#DC2626]">1.45 ppm</span>
        </div>
      </div>
    </div>
  );
}

export default AlertCenter;