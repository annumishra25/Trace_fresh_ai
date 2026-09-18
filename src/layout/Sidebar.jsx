import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  GitCommit,
  UserCheck,
  Truck,
  Warehouse,
  Cpu,
  Settings,
  QrCode,
  X,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { useTelemetry } from "../context/TelemetryContext";

export function Sidebar({ isOpen, onClose }) {
  const { selectedNodeId, isLiveMode } = useTelemetry();

  const navItems = [
    { label: "Overview", path: "/", icon: LayoutDashboard },
    { label: "Monitoring", path: "/monitoring", icon: Activity },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    { label: "Traceability", path: "/traceability", icon: GitCommit },
    { label: "Consumer Portal", path: "/consumer", icon: UserCheck },
    { label: "Logistics", path: "/logistics", icon: Truck },
    { label: "Warehouse", path: "/warehouse", icon: Warehouse },
    { label: "Devices", path: "/devices", icon: Cpu },
    { label: "Settings", path: "/settings", icon: Settings },
    { label: "QR Center", path: "/qr-center", icon: QrCode },
  ];

  const menuClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
      isActive
        ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30"
        : "text-slate-400 hover:text-white hover:bg-white/10"
    }`;

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-[#0B0F17] text-slate-100 border-r border-slate-800">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-blue-600/30">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black tracking-tight text-white leading-none">
                  TRACEFRESH
                </h1>
                <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-1">
                Food Intelligence Platform
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close navigation sidebar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Menu Links */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-190px)]">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={menuClass}
              >
                <IconComponent size={18} className="shrink-0" />
                <span className="tracking-tight">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Node & System Status Pill */}
      <div className="p-4 border-t border-slate-800/80 bg-[#070A10] space-y-2">
        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <div>
              <div className="text-[11px] font-bold text-white font-mono">
                {selectedNodeId || "TF-NODE-01"}
              </div>
              <div className="text-[9px] text-emerald-400 font-mono font-semibold">
                {isLiveMode ? "LIVE BACKEND" : "DEMO MODE"}
              </div>
            </div>
          </div>

          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            ONLINE
          </span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
          <span className="flex items-center gap-1 font-semibold">
            <ShieldCheck size={12} className="text-blue-400" /> Enterprise v1.0
          </span>
          <span>2026.09</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-screen fixed left-0 top-0 z-30 shadow-xl">
        {sidebarContent}
      </aside>

      {/* Mobile Off-Canvas Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          ></div>
          {/* Drawer */}
          <aside className="fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

export default Sidebar;
