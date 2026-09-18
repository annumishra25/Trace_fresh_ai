import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("light");
    root.classList.remove("dark");
  }, [theme]);

  const toggleTheme = () => {
    // Always stay in light mode
    setTheme("light");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: false }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return { theme: "light", toggleTheme: () => {}, isDark: false };
  }
  return context;
}
