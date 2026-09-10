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
  const { selectedNodeId, activeNode, isLiveMode } = useTelemetry();

  const menuClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
      isActive
        ? "bg-[#0B604A] text-white shadow-sm font-bold scale-[1.01]"
        : "text-[#DDF2E8]/80 hover:text-white hover:bg-[#0B604A]/40"
    }`;

  return (
    <div className="w-64 h-screen bg-[#063C2F] text-white flex flex-col justify-between fixed left-0 top-0 border-r border-[#0B604A]/40 z-30 shadow-md rounded-r-2xl">
      {/* Header + Navigation Menu */}
      <div className="overflow-y-auto">
        <div className="p-5 border-b border-[#0B604A]/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#DDF2E8] flex items-center justify-center text-[#063C2F] font-extrabold text-base shadow-sm">
              TF
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white">
                TRACEFRESH
              </h1>
              <p className="text-[10px] text-[#DDF2E8]/80 font-mono font-bold uppercase tracking-wider">
                AI FOOD ENGINE
              </p>
            </div>
          </div>
        </div>

        {/* Primary Navigation Sections */}
        <div className="p-3.5 space-y-5">
          <div>
            <p className="px-3 text-[10px] font-mono font-bold uppercase text-[#AEBBB4] tracking-wider mb-2">
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
            <p className="px-3 text-[10px] font-mono font-bold uppercase text-[#AEBBB4] tracking-wider mb-2">
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
            <p className="px-3 text-[10px] font-mono font-bold uppercase text-[#AEBBB4] tracking-wider mb-2">
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
      <div className="p-4 border-t border-[#0B604A]/40 bg-[#042E25] rounded-br-2xl space-y-2">
        <div className="bg-[#063C2F] p-3 rounded-xl border border-[#0B604A]/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Radio size={14} className="text-[#36B88A]" />
            <div>
              <div className="text-[11px] font-bold text-white">
                {selectedNodeId || "TF-NODE-01"}
              </div>
              <div className="text-[9px] text-[#AEBBB4] font-mono">
                {isLiveMode ? "LIVE BACKEND" : "DEMO SLIDERS"}
              </div>
            </div>
          </div>

          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#16805F]/20 text-[#DDF2E8] border border-[#16805F]/30">
            ONLINE
          </span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-[#AEBBB4] font-mono pt-1">
          <span className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-[#36B88A]" /> v1.0.0 Enterprise
          </span>
          <span>Build 2026.09</span>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;