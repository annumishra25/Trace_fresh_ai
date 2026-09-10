import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Verifying TraceFresh Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center space-y-4 border border-slate-200 shadow-xl">
          <span className="text-4xl">🚫</span>
          <h2 className="text-2xl font-bold text-slate-900">Permission Denied</h2>
          <p className="text-xs text-slate-600">
            Your role (<strong className="text-slate-800">{role}</strong>) does not have authorization to access this operational feature.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
}
