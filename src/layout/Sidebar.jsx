import {
  LayoutDashboard,
  Camera,
  BarChart3,
  Package,
  Cpu,
  Settings,
  Truck,
  QrCode,
  Warehouse,
  ShieldCheck,
  Radio
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTelemetry } from "../context/TelemetryContext";

function Sidebar() {
  const { selectedNodeId, isLiveMode } = useTelemetry();

  const menuClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold transition-all duration-150 cursor-pointer ${
      isActive
        ? "bg-[#E4F5EC] text-[#064C3B] font-bold border-l-4 border-[#064C3B] rounded-r-lg"
        : "text-[#56635D] hover:text-[#111715] hover:bg-[#F4F7F4] rounded-lg"
    }`;

  return (
    <div className="w-64 h-screen bg-white text-[#111715] flex flex-col justify-between fixed left-0 top-0 border-r border-[#DDE4DF] z-30 shadow-xs">
      {/* Header + Navigation Menu */}
      <div className="overflow-y-auto">
        {/* Brand Area */}
        <div className="p-5 border-b border-[#DDE4DF]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#064C3B] flex items-center justify-center text-white font-extrabold text-base shadow-xs">
              TF
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-[#064C3B]">
                TRACEFRESH
              </h1>
              <p className="text-[10px] text-[#56635D] font-mono font-bold uppercase tracking-wider">
                FOOD SUPPLY-CHAIN AI
              </p>
            </div>
          </div>
        </div>

        {/* Primary Navigation Sections */}
        <div className="p-3.5 space-y-6">
          <div>
            <p className="px-3 text-[10px] font-mono font-bold uppercase text-[#78837D] tracking-wider mb-2">
              Monitoring & Intelligence
            </p>
            <div className="space-y-1">
              <NavLink to="/" className={menuClass}>
                <LayoutDashboard size={17} />
                Overview Dashboard
              </NavLink>

              <NavLink to="/monitoring" className={menuClass}>
                <Camera size={17} />
                Multi-Node Console
              </NavLink>

              <NavLink to="/analytics" className={menuClass}>
                <BarChart3 size={17} />
                Analytics & ML
              </NavLink>

              <NavLink to="/traceability" className={menuClass}>
                <Package size={17} />
                Batch Traceability
              </NavLink>
            </div>
          </div>

          <div>
            <p className="px-3 text-[10px] font-mono font-bold uppercase text-[#78837D] tracking-wider mb-2">
              Logistics & Portals
            </p>
            <div className="space-y-1">
              <NavLink to="/consumer" className={menuClass}>
                <QrCode size={17} />
                Consumer Passport
              </NavLink>

              <NavLink to="/logistics" className={menuClass}>
                <Truck size={17} />
                Route & Fleet
              </NavLink>

              <NavLink to="/warehouse" className={menuClass}>
                <Warehouse size={17} />
                Digital Twin Hub
              </NavLink>

              <NavLink to="/qrcode" className={menuClass}>
                <QrCode size={17} />
                QR Center
              </NavLink>
            </div>
          </div>

          <div>
            <p className="px-3 text-[10px] font-mono font-bold uppercase text-[#78837D] tracking-wider mb-2">
              Hardware & Settings
            </p>
            <div className="space-y-1">
              <NavLink to="/devices" className={menuClass}>
                <Cpu size={17} />
                Smart Nodes
              </NavLink>

              <NavLink to="/settings" className={menuClass}>
                <Settings size={17} />
                Platform Config
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Status Badge */}
      <div className="p-4 border-t border-[#DDE4DF] bg-[#FAFBF8] space-y-2">
        <div className="bg-white p-3 rounded-xl border border-[#DDE4DF] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Radio size={14} className="text-[#064C3B]" />
            <div>
              <div className="text-[11px] font-bold text-[#111715]">
                {selectedNodeId || "TF-NODE-01"}
              </div>
              <div className="text-[9px] text-[#56635D] font-mono">
                {isLiveMode ? "LIVE BACKEND" : "DEMO SLIDERS"}
              </div>
            </div>
          </div>

          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#E4F5EC] text-[#064C3B] border border-[#C3E9D5]">
            ONLINE
          </span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-[#78837D] font-mono pt-1">
          <span className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-[#064C3B]" /> v1.0.0 Enterprise
          </span>
          <span>Build 2026.09</span>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;