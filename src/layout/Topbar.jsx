import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  Bell,
  Wifi,
  Clock3,
  CheckCheck,
  X,
  AlertTriangle,
  Info,
  Flame,
  ShieldCheck,
  User,
  LogOut,
  Search,
  Camera,
  Menu,
  Activity
} from "lucide-react";
import { useTelemetry } from "../context/TelemetryContext";
import { useSensorData } from "../context/SensorContext";
import { useAuth } from "../context/AuthContext";
import FruitScanModal from "../components/monitoring/FruitScanModal";

const routeTitleMap = {
  "/": "Overview",
  "/monitoring": "Monitoring",
  "/analytics": "Analytics",
  "/traceability": "Traceability",
  "/consumer": "Consumer Portal",
  "/logistics": "Logistics",
  "/warehouse": "Warehouse",
  "/devices": "Devices",
  "/settings": "Settings",
  "/qrcode": "QR Center",
  "/qr-center": "QR Center"
};

export function Topbar({ onOpenMobileSidebar }) {
  const location = useLocation();
  const { isLiveMode, toggleMode, selectedNodeId } = useTelemetry();
  const { sensorData } = useSensorData();
  const { user, role, logout } = useAuth();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOpenAlerts, setIsOpenAlerts] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const dropdownRef = useRef(null);

  const currentPageTitle = routeTitleMap[location.pathname] || "Dashboard";

  const [notifications, setNotifications] = useState([
    {
      id: "n-1",
      title: "Temperature Excursion Warning",
      message: "Node TF-NODE-01 reported 26.5°C thermal reading exceeding 25°C limit.",
      severity: "CRITICAL",
      timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
      read: false
    },
    {
      id: "n-2",
      title: "Spoilage Gas Emission Alert",
      message: "Ethylene / Spoilage gas reading at 1.45 ppm on shipment container A.",
      severity: "WARNING",
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      read: false
    },
    {
      id: "n-3",
      title: "Multi-Modal Fusion Verified",
      message: "AI Fusion Engine verified produce freshness index at 94/100.",
      severity: "INFO",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      read: true
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (sensorData?.alerts && sensorData.alerts.length > 0) {
      const newAlerts = sensorData.alerts.map((alt, idx) => ({
        id: `sensor-alt-${idx}-${Date.now()}`,
        title: alt.title || "Sensor Anomaly Detected",
        message: alt.message || `Observed value ${alt.value} on ${alt.metric}`,
        severity: alt.severity || "WARNING",
        timestamp: new Date().toISOString(),
        read: false
      }));
      setNotifications((prev) => {
        const existingTitles = new Set(prev.map((n) => n.title));
        const filtered = newAlerts.filter((n) => !existingTitles.has(n.title));
        if (filtered.length === 0) return prev;
        return [...filtered, ...prev];
      });
    }
  }, [sensorData?.alerts]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpenAlerts(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "ALL") return notifications;
    return notifications.filter((n) => n.severity === activeFilter);
  }, [notifications, activeFilter]);

  const markAllAsRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const dismissNotification = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  const getSeverityIcon = (sev) => {
    switch (sev) {
      case "CRITICAL": return <Flame size={16} className="text-rose-500" />;
      case "WARNING": return <AlertTriangle size={16} className="text-amber-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
        {/* Left Area: Mobile Menu Toggle + Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Open sidebar menu"
          >
            <Menu size={20} />
          </button>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span className="font-semibold text-slate-700">TraceFresh AI</span>
              <span>/</span>
              <span className="text-blue-600 font-bold">{currentPageTitle}</span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight hidden sm:block">
              {currentPageTitle}
            </h1>
          </div>
        </div>

        {/* Center: System Operational Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>System: Operational</span>
        </div>

        {/* Right Area: Search, Actions, Clock, Connection Status, Notifications, User */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Fruit Scan AI Action Button */}
          <button
            onClick={() => setIsScanModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
            title="Upload fruit photo for AI vision inspection"
          >
            <Camera size={14} />
            <span className="hidden sm:inline">Fruit Scan AI</span>
          </button>

          {/* Clock Display */}
          <div className="hidden xl:flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-mono font-medium">
            <Clock3 size={14} className="text-blue-600" />
            <span>{currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
          </div>

          {/* Backend Connection Status Badge Toggle */}
          <button
            onClick={toggleMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isLiveMode
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-700 border-slate-200"
            }`}
            title="Toggle Live backend vs Demo mode"
          >
            <Wifi size={14} className={isLiveMode ? "text-emerald-600" : "text-slate-400"} />
            <span className="hidden sm:inline">{isLiveMode ? "ONLINE" : "DEMO"}</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpenAlerts(!isOpenAlerts)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer relative"
              aria-label="Toggle notifications menu"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {isOpenAlerts && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden text-slate-900">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-blue-600" />
                    <h3 className="font-bold text-sm">System Alerts</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  <button onClick={() => setIsOpenAlerts(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                    <X size={16} />
                  </button>
                </div>
                
                <div className="p-3 bg-white border-b border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    {["ALL", "CRITICAL", "WARNING"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          activeFilter === f
                            ? "bg-blue-600 text-white"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <button onClick={markAllAsRead} className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer">
                    <CheckCheck size={13} /> Mark Read
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
                  {filteredNotifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">No notifications.</div>
                  ) : filteredNotifications.map((item) => (
                    <div key={item.id} className={`p-3 rounded-xl transition-all relative group ${item.read ? "opacity-60 bg-slate-50" : "bg-white border border-slate-200/80"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5">{getSeverityIcon(item.severity)}</div>
                          <div>
                            <div className="text-xs font-bold flex items-center gap-1.5">
                              <span>{item.title}</span>
                              {!item.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block"></span>}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{item.message}</p>
                            <span className="text-[10px] text-slate-400 font-mono mt-1 block">{new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        </div>
                        <button onClick={() => dismissNotification(item.id)} className="text-slate-400 hover:text-slate-600 p-1 opacity-0 group-hover:opacity-100 transition cursor-pointer">
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              {user?.username ? user.username.charAt(0).toUpperCase() : <User size={14} />}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-extrabold leading-tight text-slate-900">{user?.username || "Admin User"}</div>
              <div className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">{role || "OPERATOR"}</div>
            </div>
            {logout && (
              <button onClick={logout} className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer" title="Logout">
                <LogOut size={13} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Fruit Scan Modal */}
      <FruitScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
      />
    </>
  );
}

export default Topbar;
