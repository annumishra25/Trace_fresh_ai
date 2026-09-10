import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, User, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/";

  // Auto redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, from]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const loggedInUser = await login(username, password);
      if (loggedInUser) {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || "Invalid credentials. Please check your username and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillAndSubmit = async (demoUser, demoPwd) => {
    setUsername(demoUser);
    setPassword(demoPwd);
    setError("");
    setLoading(true);
    try {
      const loggedInUser = await login(demoUser, demoPwd);
      if (loggedInUser) {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || "Authentication failed with quick fill.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8F3] dark:bg-[#071A15] text-[#101513] dark:text-[#F4F7F2] flex items-center justify-center p-4 font-sans text-xs">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#063C2F] dark:border-[#36B88A] border-t-transparent rounded-full animate-spin"></div>
          <span className="font-medium text-[#4E5B55] dark:text-[#AEBBB4]">Authenticating session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8F3] dark:bg-[#071A15] text-[#101513] dark:text-[#F4F7F2] flex items-center justify-center p-4 selection:bg-[#063C2F] selection:text-white relative overflow-hidden">
      <div className="max-w-md w-full space-y-6 relative z-10">

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#DDF2E8] border border-[#16805F]/20 px-4 py-1 rounded-full text-xs font-semibold text-[#063C2F] shadow-sm">
            <ShieldCheck size={14} className="text-[#063C2F]" /> TraceFresh AI Trust Platform
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101513] dark:text-[#F4F7F2]">Operator Authentication</h1>
          <p className="text-xs text-[#4E5B55] dark:text-[#AEBBB4] font-medium">Sign in to access dashboard monitoring, devices, and QR control</p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-[#0D2820] border border-[#DCE4DE] dark:border-[#23483D] p-8 rounded-2xl shadow-sm space-y-6 relative overflow-hidden">

          {error && (
            <div className="bg-[#FEE2E2] border border-[#DC2626]/20 p-3.5 rounded-xl text-xs text-[#991B1B] leading-relaxed font-sans flex items-start gap-2">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#78837D] dark:text-[#AEBBB4] uppercase tracking-wider block">Username</label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78837D] dark:text-[#AEBBB4]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username (admin, operator, viewer)"
                  autoComplete="username"
                  className="w-full bg-[#F7F8F3] dark:bg-[#12342A] border border-[#DCE4DE] dark:border-[#23483D] rounded-xl pl-10 pr-4 py-3 text-xs text-[#101513] dark:text-[#F4F7F2] placeholder:text-[#78837D] dark:placeholder:text-[#AEBBB4]/60 focus:outline-none focus:border-[#063C2F] dark:focus:border-[#36B88A] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#78837D] dark:text-[#AEBBB4] uppercase tracking-wider block">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78837D] dark:text-[#AEBBB4]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="w-full bg-[#F7F8F3] dark:bg-[#12342A] border border-[#DCE4DE] dark:border-[#23483D] rounded-xl pl-10 pr-4 py-3 text-xs text-[#101513] dark:text-[#F4F7F2] placeholder:text-[#78837D] dark:placeholder:text-[#AEBBB4]/60 focus:outline-none focus:border-[#063C2F] dark:focus:border-[#36B88A] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#063C2F] hover:bg-[#042E25] dark:bg-[#36B88A] dark:hover:bg-[#2EA077] text-white dark:text-[#042E25] font-bold text-xs tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Authenticating..." : "Sign In to Dashboard"}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Fill & Sign In Buttons */}
          <div className="pt-4 border-t border-[#DCE4DE] dark:border-[#23483D] space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#78837D] dark:text-[#AEBBB4] uppercase tracking-wider">
              <KeyRound size={14} className="text-[#063C2F] dark:text-[#36B88A]" />
              <span>One-Click Login Accounts</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFillAndSubmit("admin", "TraceFresh#2026!Admin")}
                disabled={loading}
                className="p-2.5 rounded-xl bg-[#F1F4EE] hover:bg-[#E8EEE7] dark:bg-[#12342A] dark:hover:bg-[#184035] border border-[#DCE4DE] dark:border-[#23483D] text-xs font-bold text-[#063C2F] dark:text-[#36B88A] text-center transition-colors flex flex-col items-center gap-0.5 cursor-pointer"
              >
                <span>👑 Admin</span>
                <span className="text-[10px] text-[#4E5B55] dark:text-[#AEBBB4] font-normal">Full Access</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFillAndSubmit("operator", "TraceFresh#2026!Op")}
                disabled={loading}
                className="p-2.5 rounded-xl bg-[#F1F4EE] hover:bg-[#E8EEE7] dark:bg-[#12342A] dark:hover:bg-[#184035] border border-[#DCE4DE] dark:border-[#23483D] text-xs font-bold text-[#0B604A] dark:text-[#36B88A] text-center transition-colors flex flex-col items-center gap-0.5 cursor-pointer"
              >
                <span>🛠️ Operator</span>
                <span className="text-[10px] text-[#4E5B55] dark:text-[#AEBBB4] font-normal">Manage Ops</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFillAndSubmit("viewer", "TraceFresh#2026!View")}
                disabled={loading}
                className="p-2.5 rounded-xl bg-[#F1F4EE] hover:bg-[#E8EEE7] dark:bg-[#12342A] dark:hover:bg-[#184035] border border-[#DCE4DE] dark:border-[#23483D] text-xs font-bold text-[#101513] dark:text-[#F4F7F2] text-center transition-colors flex flex-col items-center gap-0.5 cursor-pointer"
              >
                <span>👁️ Viewer</span>
                <span className="text-[10px] text-[#4E5B55] dark:text-[#AEBBB4] font-normal">Read Only</span>
              </button>
            </div>

            <div className="bg-[#F7F8F3] dark:bg-[#12342A] p-3 rounded-xl border border-[#DCE4DE] dark:border-[#23483D] text-xs text-[#4E5B55] dark:text-[#AEBBB4] space-y-1">
              <div className="font-bold text-[#101513] dark:text-[#F4F7F2]">🔑 Default Credentials:</div>
              <div>• <span className="text-[#063C2F] dark:text-[#36B88A] font-bold">admin</span> / <span className="font-medium text-[#101513] dark:text-[#F4F7F2]">TraceFresh#2026!Admin</span></div>
              <div>• <span className="text-[#0B604A] dark:text-[#36B88A] font-bold">operator</span> / <span className="font-medium text-[#101513] dark:text-[#F4F7F2]">TraceFresh#2026!Op</span></div>
              <div>• <span className="text-[#78837D] dark:text-[#AEBBB4] font-bold">viewer</span> / <span className="font-medium text-[#101513] dark:text-[#F4F7F2]">TraceFresh#2026!View</span></div>
            </div>
          </div>
        </div>

        <footer className="text-center text-xs font-medium text-[#78837D] dark:text-[#AEBBB4]">
          TraceFresh AI Operations Platform • Enterprise Edition
        </footer>
      </div>
    </div>
  );
}

