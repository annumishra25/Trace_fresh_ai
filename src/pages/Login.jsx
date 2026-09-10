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
      <div className="min-h-screen bg-[#03140e] text-white flex items-center justify-center p-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Authenticating session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#03140e] text-white flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-black relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="fixed top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-500/15 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 relative z-10">

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 rounded-full text-xs font-mono text-emerald-300 shadow-sm">
            <ShieldCheck size={14} className="text-emerald-400" /> TraceFresh AI Trust Platform
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Operator Authentication</h1>
          <p className="text-xs text-emerald-200/80">Sign in to access dashboard monitoring, devices, and QR control</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#092a1f]/85 backdrop-blur-xl border border-emerald-800/60 p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 opacity-90" />

          {error && (
            <div className="bg-rose-950/80 border border-rose-800 p-3.5 rounded-2xl text-xs text-rose-200 leading-relaxed font-sans flex items-start gap-2">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-200 uppercase tracking-wider block">Username</label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/60" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username (admin, operator, viewer)"
                  autoComplete="username"
                  className="w-full bg-[#03140e] border border-emerald-800/80 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-emerald-300/40 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-200 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/60" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="w-full bg-[#03140e] border border-emerald-800/80 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-emerald-300/40 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Authenticating..." : "Sign In to Dashboard"}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Fill & Sign In Buttons */}
          <div className="pt-4 border-t border-emerald-800/60 space-y-3">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-300/80 uppercase tracking-wider">
              <KeyRound size={12} className="text-emerald-400" />
              <span>One-Click Login Accounts</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFillAndSubmit("admin", "TraceFresh#2026!Admin")}
                disabled={loading}
                className="p-2.5 rounded-xl bg-[#03140e] hover:bg-emerald-900/40 border border-emerald-800/80 text-[11px] font-bold text-emerald-400 text-center transition-colors flex flex-col items-center gap-0.5 cursor-pointer"
              >
                <span>👑 Admin</span>
                <span className="text-[9px] text-emerald-200/60 font-normal">Full Access</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFillAndSubmit("operator", "TraceFresh#2026!Op")}
                disabled={loading}
                className="p-2.5 rounded-xl bg-[#03140e] hover:bg-emerald-900/40 border border-emerald-800/80 text-[11px] font-bold text-teal-300 text-center transition-colors flex flex-col items-center gap-0.5 cursor-pointer"
              >
                <span>🛠️ Operator</span>
                <span className="text-[9px] text-emerald-200/60 font-normal">Manage Ops</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFillAndSubmit("viewer", "TraceFresh#2026!View")}
                disabled={loading}
                className="p-2.5 rounded-xl bg-[#03140e] hover:bg-emerald-900/40 border border-emerald-800/80 text-[11px] font-bold text-white text-center transition-colors flex flex-col items-center gap-0.5 cursor-pointer"
              >
                <span>👁️ Viewer</span>
                <span className="text-[9px] text-emerald-200/60 font-normal">Read Only</span>
              </button>
            </div>

            <div className="bg-[#03140e]/80 p-2.5 rounded-xl border border-emerald-800/60 font-mono text-[10px] text-emerald-200/70 space-y-1">
              <div className="font-bold text-white text-[11px]">🔑 Default Credentials:</div>
              <div>• <span className="text-emerald-400 font-bold">admin</span> / <span className="text-white">TraceFresh#2026!Admin</span></div>
              <div>• <span className="text-teal-300 font-bold">operator</span> / <span className="text-white">TraceFresh#2026!Op</span></div>
              <div>• <span className="text-emerald-200 font-bold">viewer</span> / <span className="text-white">TraceFresh#2026!View</span></div>
            </div>
          </div>
        </div>

        <footer className="text-center text-[10px] font-mono text-emerald-300/50">
          TraceFresh-AI Trust Platform v1.0 • Dark Green & White Edition
        </footer>
      </div>
    </div>
  );
}

