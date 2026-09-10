import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { loginUser, getCurrentUser } from "../services/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("tf_auth_token") || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const savedToken = localStorage.getItem("tf_auth_token");
      if (savedToken) {
        try {
          const userData = await getCurrentUser(savedToken);
          if (userData && isMounted) {
            setUser(userData);
            setToken(savedToken);
          } else if (isMounted) {
            localStorage.removeItem("tf_auth_token");
            setToken(null);
            setUser(null);
          }
        } catch {
          if (isMounted) {
            localStorage.removeItem("tf_auth_token");
            setToken(null);
            setUser(null);
          }
        }
      } else if (isMounted) {
        setToken(null);
        setUser(null);
      }
      if (isMounted) {
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await loginUser(username, password);
    if (data && data.token && data.user) {
      localStorage.setItem("tf_auth_token", data.token);
      setToken(data.token);
      setUser(data.user);
      setLoading(false);
      return data.user;
    }
    return null;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("tf_auth_token");
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      role: user?.role || "VIEWER",
      isAuthenticated: !!token && !!user,
      loading,
      login,
      logout
    }),
    [token, user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

