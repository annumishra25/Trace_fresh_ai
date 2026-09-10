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
    <div className="bg-white border-b border-[#DDE4DF] text-[#111715] px-6 h-16 flex items-center justify-between gap-4 sticky top-0 z-40 shadow-xs">
      {/* Title Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-extrabold tracking-tight text-[#111715] flex items-center gap-2">
            <span className="text-[#064C3B]">TraceFresh AI</span>
            <span className="w-2 h-2 rounded-full bg-[#064C3B]"></span>
          </h2>
          <span className="text-[10px] font-mono font-bold bg-[#E4F5EC] text-[#064C3B] px-2.5 py-0.5 rounded-md border border-[#C3E9D5]">
            ENTERPRISE
          </span>
        </div>
        <p className="text-xs text-[#111715] font-semibold hidden sm:block">
          Real-Time Food Quality Intelligence & Multi-Modal Supply Chain Monitoring
        </p>
      </div>

      {/* Right Controls Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Live Clock Counter */}
        <div className="hidden lg:flex items-center gap-2 bg-[#FAFBF8] px-3 py-1.5 rounded-xl border border-[#DDE4DF] text-[#111715] text-xs font-mono font-bold">
          <Clock3 size={15} className="text-[#064C3B]" />
          <span>{currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
        </div>

        {/* Day / Night Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            isDark
              ? "bg-[#0D2821] text-[#42B98E] border-[#23473D]"
              : "bg-white text-[#064C3B] border-[#DDE4DF] hover:bg-[#FAFBF8]"
          }`}
          title="Click to toggle Day Mode / Night Mode theme"
        >
          {isDark ? <Sun size={15} className="text-[#42B98E]" /> : <Moon size={15} className="text-[#064C3B]" />}
          <span>{isDark ? "DAY MODE" : "NIGHT MODE"}</span>
        </button>

        {/* System Connection Badge */}
        <button
          onClick={toggleMode}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            isLiveMode
              ? "bg-[#E4F5EC] text-[#064C3B] border-[#C3E9D5]"
              : "bg-[#FAFBF8] text-[#111715] border-[#DDE4DF] hover:bg-[#F4F7F4]"
          }`}
          title="Click to toggle Online vs Demo mode"
        >
          <Wifi size={15} className="text-[#064C3B]" />
          <span>{isLiveMode ? "ONLINE" : "DEMO MODE"}</span>
        </button>

        {/* Interactive Notification Bell Icon & Drawer */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpenAlerts(!isOpenAlerts)}
            className="p-2 rounded-xl bg-white hover:bg-[#FAFBF8] text-[#064C3B] border border-[#DDE4DF] transition-all cursor-pointer relative font-bold"
            aria-label="Toggle notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>


          {/* Floating Dropdown Drawer Overlay */}
          {isOpenAlerts && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-[#DDE4DF] rounded-2xl shadow-xl z-50 overflow-hidden text-[#111715]">
              {/* Drawer Header */}
              <div className="p-4 border-b border-[#DDE4DF] flex items-center justify-between bg-[#FAFBF8]">
                <div className="flex items-center gap-2">
                  <Bell size={17} className="text-[#064C3B]" />
                  <h3 className="font-bold text-sm text-[#111715]">System Alerts & Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsOpenAlerts(false)}
                  className="text-[#78837D] hover:text-[#111715] p-1 rounded-lg hover:bg-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Controls Bar */}
              <div className="p-3 bg-white border-b border-[#DDE4DF] flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1 font-mono">
                  {["ALL", "CRITICAL", "WARNING"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        activeFilter === f
                          ? "bg-[#064C3B] text-white"
                          : "text-[#56635D] hover:text-[#111715]"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-[#064C3B] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck size={12} /> Mark Read
                  </button>
                </div>
              </div>

              {/* Notification List Body */}
              <div className="max-h-80 overflow-y-auto divide-y divide-[#EAEFEA] p-2 space-y-1">
                {filteredNotifications.length === 0 ? (
                  <div className="py-8 text-center text-[#78837D] text-xs flex flex-col items-center gap-2">
                    <ShieldCheck size={28} className="text-[#78837D]" />
                    <span>No active notifications for selected filter.</span>
                  </div>
                ) : (
                  filteredNotifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl transition-colors relative group ${
                        item.read ? "opacity-75 bg-[#FAFBF8]" : "bg-white border border-[#DDE4DF]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5">{getSeverityIcon(item.severity)}</div>
                          <div>
                            <div className="text-xs font-bold text-[#111715] flex items-center gap-1.5">
                              <span>{item.title}</span>
                              {!item.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#064C3B] inline-block"></span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#56635D] mt-1 leading-snug">{item.message}</p>
                            <span className="text-[10px] text-[#78837D] font-mono mt-1.5 block">
                              {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => dismissNotification(item.id)}
                          className="text-[#78837D] hover:text-[#111715] p-1 opacity-0 group-hover:opacity-100 transition cursor-pointer"
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
              <div className="p-3 bg-[#FAFBF8] border-t border-[#DDE4DF] flex items-center justify-between">
                <span className="text-[10px] text-[#78837D] font-mono">Presenters Quick Demo:</span>
                <button
                  onClick={simulateDemoAlert}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-[#064C3B] text-white hover:bg-[#04382B] shadow transition cursor-pointer"
                >
                  ⚡ Trigger Demo Alert
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logged In User Profile & Logout */}
        <div className="flex items-center gap-2.5 bg-white px-3.5 py-1.5 rounded-xl border border-[#DDE4DF]">
          <div className="w-6 h-6 rounded-lg bg-[#064C3B] text-white flex items-center justify-center font-bold text-xs">
            {user?.username ? user.username.charAt(0).toUpperCase() : <User size={13} />}
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-[#111715]">{user?.username || "Admin"}</div>
            <div className="text-[9px] font-bold text-[#064C3B] uppercase tracking-wide">
              {role || "OPERATOR"}
            </div>
          </div>

          {logout && (
            <button
              onClick={logout}
              className="p-1 text-[#78837D] hover:text-rose-600 transition ml-1 cursor-pointer"
              title="Logout"
            >
              <LogOut size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Topbar;