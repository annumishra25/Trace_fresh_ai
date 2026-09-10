import { useAuth } from "../../context/AuthContext";
import { LogOut, UserCheck } from "lucide-react";

function Header() {
  const { user, role, isAuthenticated, logout } = useAuth();

  const getRoleBadge = (r) => {
    switch (r) {
      case "ADMIN":
        return "bg-[#DDF2E8] text-[#063C2F] border border-[#16805F]/30";
      case "OPERATOR":
        return "bg-[#E0F2FE] text-[#0369A1] border border-[#0284C7]/30";
      default:
        return "bg-[#F1F4EE] text-[#4E5B55] border border-[#DCE4DE]";
    }
  };

  return (
    <div className="bg-white text-[#101513] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DCE4DE] shadow-sm">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#063C2F]">TraceFresh AI</h1>
          <span className="text-[10px] font-mono font-bold bg-[#DDF2E8] text-[#063C2F] px-2.5 py-0.5 rounded-full border border-[#16805F]/20">
            Step 9 Enterprise
          </span>
        </div>
        <p className="text-xs text-[#4E5B55] mt-0.5 font-medium">
          AI-Powered Food Supply-Chain Monitoring & Digital Product Passport Platform
        </p>
      </div>

      {isAuthenticated && (
        <div className="flex items-center gap-3 bg-[#F7F8F3] px-4 py-2 rounded-2xl border border-[#DCE4DE]">
          <div className="flex items-center gap-2">
            <UserCheck size={16} className="text-[#063C2F]" />
            <div className="text-left">
              <div className="text-xs font-bold text-[#101513]">{user?.username}</div>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${getRoleBadge(role)}`}>
                {role}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 text-[#4E5B55] hover:text-[#DC2626] bg-white hover:bg-[#FEE2E2] rounded-xl border border-[#DCE4DE] transition-colors ml-2 shadow-xs"
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