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
    `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
      isActive
        ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg shadow-emerald-950/60 font-bold scale-[1.02] border border-emerald-400/30"
        : "text-emerald-100/90 hover:text-white hover:bg-emerald-900/40"
    }`;

  return (
    <div className="w-64 h-screen bg-[#03140e] text-white flex flex-col justify-between fixed left-0 top-0 border-r border-emerald-900/60 z-30 shadow-2xl">
      {/* Header + Navigation Menu */}
      <div className="overflow-y-auto">
        <div className="p-6 border-b border-emerald-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-green-300 flex items-center justify-center text-slate-950 font-black text-lg shadow-md shadow-emerald-500/30">
              TF
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white">
                TRACEFRESH
              </h1>
              <p className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider">
                AI FOOD ENGINE
              </p>
            </div>
          </div>
        </div>

        {/* Primary Navigation Sections */}
        <div className="p-4 space-y-5">
          <div>
            <p className="px-3 text-[10px] font-mono font-bold uppercase text-emerald-300/80 tracking-wider mb-2">
              Monitoring & Intelligence
            </p>
            <div className="space-y-1">
              <NavLink to="/" className={menuClass}>
                <LayoutDashboard size={18} />
                Overview Dashboard
              </NavLink>

              <NavLink to="/monitoring" className={menuClass}>
                <Camera size={18} />
                Multi-Node Console
              </NavLink>

              <NavLink to="/analytics" className={menuClass}>
                <BarChart3 size={18} />
                Analytics & ML
              </NavLink>

              <NavLink to="/traceability" className={menuClass}>
                <Package size={18} />
                Batch Traceability
              </NavLink>
            </div>
          </div>

          <div>
            <p className="px-3 text-[10px] font-mono font-bold uppercase text-emerald-300/80 tracking-wider mb-2">
              Logistics & Portals
            </p>
            <div className="space-y-1">
              <NavLink to="/consumer" className={menuClass}>
                <QrCode size={18} />
                Consumer Passport
              </NavLink>

              <NavLink to="/logistics" className={menuClass}>
                <Truck size={18} />
                Route & Fleet
              </NavLink>

              <NavLink to="/warehouse" className={menuClass}>
                <Warehouse size={18} />
                Digital Twin Hub
              </NavLink>

              <NavLink to="/qrcode" className={menuClass}>
                <QrCode size={18} />
                QR Center
              </NavLink>
            </div>
          </div>

          <div>
            <p className="px-3 text-[10px] font-mono font-bold uppercase text-emerald-300/80 tracking-wider mb-2">
              Hardware & Settings
            </p>
            <div className="space-y-1">
              <NavLink to="/devices" className={menuClass}>
                <Cpu size={18} />
                Smart Nodes
              </NavLink>

              <NavLink to="/settings" className={menuClass}>
                <Settings size={18} />
                Platform Config
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Status Badge */}
      <div className="p-4 border-t border-emerald-900/60 bg-[#03140e] space-y-2">
        <div className="bg-[#07261c] p-3 rounded-2xl border border-emerald-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Radio size={14} className={isLiveMode ? "text-emerald-400 animate-pulse" : "text-teal-300"} />
            <div>
              <div className="text-[11px] font-bold text-white">
                {selectedNodeId || "TF-NODE-01"}
              </div>
              <div className="text-[9px] text-emerald-200/70 font-mono">
                {isLiveMode ? "LIVE BACKEND" : "DEMO SLIDERS"}
              </div>
            </div>
          </div>

          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            ONLINE
          </span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-emerald-300/60 font-mono pt-1">
          <span className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-400" /> v1.0.0 Hardened
          </span>
          <span>Build 2026.09</span>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;