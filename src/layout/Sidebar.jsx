import {
  LayoutDashboard,
  Camera,
  BarChart3,
  Package,
  Cpu,
  Settings,
  Truck,
  QrCode,
  Warehouse
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar() {

  const menuClass = ({ isActive }) =>
    `flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
      isActive
        ? "bg-blue-600 text-white shadow-lg"
        : "hover:bg-slate-800 text-slate-300"
    }`;

  return (
    <div
      className="
        w-64
        h-screen
        bg-slate-950
        text-white
        flex
        flex-col
        justify-between
        fixed
        left-0
        top-0
      "
    >

      {/* Header + Menu */}

      <div>

        <div className="p-6 border-b border-slate-800">

          <h1 className="text-3xl font-bold">
            TRACEFRESH AI
          </h1>

          <p className="text-slate-400 mt-2">
            Food Intelligence Platform
          </p>

        </div>

        <div className="p-4 space-y-2">

          <NavLink to="/" className={menuClass}>
            <LayoutDashboard size={20} />
            Overview
          </NavLink>

          <NavLink to="/monitoring" className={menuClass}>
            <Camera size={20} />
            Monitoring
          </NavLink>

          <NavLink to="/analytics" className={menuClass}>
            <BarChart3 size={20} />
            Analytics
          </NavLink>

          <NavLink to="/traceability" className={menuClass}>
            <Package size={20} />
            Traceability
          </NavLink>

          <NavLink to="/consumer" className={menuClass}>
            <QrCode size={20} />
            Consumer Portal
          </NavLink>

          <NavLink to="/logistics" className={menuClass}>
            <Truck size={20} />
            Logistics
          </NavLink>

          <NavLink to="/warehouse" className={menuClass}>
            <Warehouse size={20} />
            Warehouse
          </NavLink>

          <NavLink to="/devices" className={menuClass}>
            <Cpu size={20} />
            Devices
          </NavLink>

          <NavLink to="/settings" className={menuClass}>
            <Settings size={20} />
            Settings
          </NavLink>

          <NavLink to="/qrcode" className={menuClass}>
            <QrCode size={20} />
            QR Center
          </NavLink>

        </div>

      </div>

      {/* Footer */}

      <div className="p-4 border-t border-slate-800">

        <div className="text-green-400 font-medium">
          ● Platform Operational
        </div>

        <div className="text-xs text-slate-500 mt-1">
          Version 1.0.0
        </div>

      </div>

    </div>
  );
}

export default Sidebar;