import { useState, useEffect, useRef, useMemo } from "react";
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
  Sun,
  Moon
} from "lucide-react";
import { useTelemetry } from "../context/TelemetryContext";
import { useSensorData } from "../context/SensorContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function Topbar() {
  const { isLiveMode, activeTelemetry, connectionStatus, toggleMode, selectedNodeId } = useTelemetry();
  const { sensorData } = useSensorData();
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOpenAlerts, setIsOpenAlerts] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const dropdownRef = useRef(null);

  // Initial list of interactive demo & live notifications
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

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // React to live sensor alerts from SensorContext
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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpenAlerts(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "ALL") return notifications;
    return notifications.filter((n) => n.severity === activeFilter);
  }, [notifications, activeFilter]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const simulateDemoAlert = () => {
    const demoAlerts = [
      {
        id: `demo-${Date.now()}`,
        title: "⚡ Scaled Temperature Excursion",
        message: `Node ${selectedNodeId} temperature scaled to 29.8°C — Decision Engine updated.`,
        severity: "CRITICAL",
        timestamp: new Date().toISOString(),
        read: false
      },
      {
        id: `demo-${Date.now()}`,
        title: "🚨 Ethylene Gas Spike Alert",
        message: `Node ${selectedNodeId} ethylene gas scaled to 3.2 ppm — Spoilage risk elevated.`,
        severity: "WARNING",
        timestamp: new Date().toISOString(),
        read: false
      }
    ];
    const picked = demoAlerts[Math.floor(Math.random() * demoAlerts.length)];
    setNotifications((prev) => [picked, ...prev]);
  };

  const getSeverityIcon = (sev) => {
    switch (sev) {
      case "CRITICAL":
        return <Flame size={16} className="text-rose-500" />;
      case "WARNING":
        return <AlertTriangle size={16} className="text-amber-500" />;
      default:
        return <Info size={16} className="text-blue-400" />;
    }
  };

  return (
    <div className="bg-[#07261c]/95 backdrop-blur-md border-b border-emerald-900/60 text-white px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-40 shadow-md">
      {/* Title Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <span>TraceFresh AI</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </h2>
          <span className="text-[10px] font-mono font-bold bg-[#03140e] text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/50">
            ENTERPRISE DASHBOARD
          </span>
        </div>
        <p className="text-xs text-emerald-100/80 mt-0.5">
          Real-Time Food Quality Intelligence & Multi-Modal Supply Chain Monitoring
        </p>
      </div>

      {/* Right Controls Bar */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Live Clock Counter */}
        <div className="flex items-center gap-2 bg-[#093124] px-3 py-1.5 rounded-xl border border-emerald-700/50 text-white text-xs font-mono font-semibold">
          <Clock3 size={15} className="text-emerald-300" />
          <span>{currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
        </div>

        {/* Day / Night Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer shadow-sm ${
            isDark
              ? "bg-[#093124] text-emerald-300 border-emerald-500/40 hover:bg-emerald-800/40 glow-emerald"
              : "bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500"
          }`}
          title="Click to toggle Day Mode / Night Mode theme"
        >
          {isDark ? <Sun size={15} className="text-emerald-400 animate-spin-slow" /> : <Moon size={15} className="text-white" />}
          <span>{isDark ? "☀️ DAY MODE" : "🌙 NIGHT MODE"}</span>
        </button>

        {/* System Connection Badge */}
        <button
          onClick={toggleMode}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            isLiveMode
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
              : "bg-teal-500/20 text-teal-200 border-teal-500/40 hover:bg-teal-500/30"
          }`}
          title="Click to toggle Online vs Demo mode"
        >
          <Wifi size={15} className={isLiveMode ? "text-emerald-400 animate-pulse" : "text-teal-300"} />
          <span>{isLiveMode ? "ONLINE (Live Backend)" : "DEMO MODE (Sliders)"}</span>
        </button>

        {/* Interactive Notification Bell Icon & Drawer */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpenAlerts(!isOpenAlerts)}
            className="p-2 rounded-xl bg-[#093124] hover:bg-emerald-800/40 text-emerald-100 border border-emerald-700/50 transition-all cursor-pointer relative"
            aria-label="Toggle notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#03140e] animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Floating Dropdown Drawer Overlay */}
          {isOpenAlerts && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#07261c] border border-emerald-800/80 rounded-3xl shadow-2xl z-50 overflow-hidden text-white animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Drawer Header */}
              <div className="p-4 border-b border-emerald-900/80 flex items-center justify-between bg-[#03140e]">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-emerald-400" />
                  <h3 className="font-bold text-sm text-white">System Alerts & Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-300 rounded-full border border-rose-500/30">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsOpenAlerts(false)}
                  className="text-emerald-300/70 hover:text-white p-1 rounded-lg hover:bg-emerald-900/50"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Controls Bar */}
              <div className="p-3 bg-[#093124]/60 border-b border-emerald-800/60 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1 font-mono">
                  {["ALL", "CRITICAL", "WARNING"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                        activeFilter === f
                          ? "bg-emerald-700 text-white border border-emerald-500"
                          : "text-emerald-300/70 hover:text-emerald-100"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck size={12} /> Mark Read
                  </button>
                </div>
              </div>

              {/* Notification List Body */}
              <div className="max-h-80 overflow-y-auto divide-y divide-emerald-900/60 p-2 space-y-1">
                {filteredNotifications.length === 0 ? (
                  <div className="py-8 text-center text-emerald-300/60 text-xs flex flex-col items-center gap-2">
                    <ShieldCheck size={28} className="text-emerald-500/50" />
                    <span>No active notifications for selected filter.</span>
                  </div>
                ) : (
                  filteredNotifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl transition-colors relative group ${
                        item.read ? "bg-[#03140e]/40 opacity-80" : "bg-[#093124]/70 border border-emerald-700/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5">{getSeverityIcon(item.severity)}</div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{item.title}</span>
                              {!item.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                              )}
                            </div>
                            <p className="text-[11px] text-emerald-100/90 mt-1 leading-snug">{item.message}</p>
                            <span className="text-[10px] text-emerald-300/60 font-mono mt-1.5 block">
                              {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => dismissNotification(item.id)}
                          className="text-emerald-400/60 hover:text-white p-1 opacity-0 group-hover:opacity-100 transition"
                          title="Dismiss"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Demo Presentation Helper Footer */}
              <div className="p-3 bg-[#03140e] border-t border-emerald-900/80 flex items-center justify-between">
                <span className="text-[10px] text-emerald-300/70 font-mono">Presenters Quick Demo:</span>
                <button
                  onClick={simulateDemoAlert}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition cursor-pointer"
                >
                  ⚡ Trigger Demo Alert
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logged In User Profile & Logout */}
        <div className="flex items-center gap-2.5 bg-[#093124] px-3.5 py-1.5 rounded-2xl border border-emerald-700/50">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-extrabold text-xs text-slate-950">
            {user?.username ? user.username.charAt(0).toUpperCase() : <User size={14} />}
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-white">{user?.username || "Admin"}</div>
            <div className="text-[9px] font-black text-emerald-400 uppercase tracking-wide">
              {role || "OPERATOR"}
            </div>
          </div>

          {logout && (
            <button
              onClick={logout}
              className="p-1 text-emerald-300/70 hover:text-rose-400 transition ml-1"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Topbar;