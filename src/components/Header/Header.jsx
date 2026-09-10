import { useAuth } from "../../context/AuthContext";
import { LogOut, UserCheck } from "lucide-react";

function Header() {
  const { user, role, isAuthenticated, logout } = useAuth();

  const getRoleBadge = (r) => {
    switch (r) {
      case "ADMIN":
        return "bg-emerald-400 text-slate-950";
      case "OPERATOR":
        return "bg-sky-400 text-slate-950";
      default:
        return "bg-slate-300 text-slate-900";
    }
  };

  return (
    <div className="bg-slate-900 text-white px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black tracking-tight text-white">TraceFresh AI</h1>
          <span className="text-[10px] font-mono font-bold bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-slate-700">
            Step 9 Hardened
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          AI-Powered Food Supply-Chain Monitoring & Digital Product Passport Platform
        </p>
      </div>

      {isAuthenticated && (
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2">
            <UserCheck size={16} className="text-emerald-400" />
            <div className="text-left">
              <div className="text-xs font-bold text-slate-200">{user?.username}</div>
              <span className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${getRoleBadge(role)}`}>
                {role}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors ml-2"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default Header;