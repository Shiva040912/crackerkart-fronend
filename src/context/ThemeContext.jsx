import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useLocation } from "react-router-dom";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const location = useLocation();

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  const isAdminRoute =
    location.pathname.startsWith("/admin");

  useEffect(() => {
    document.body.classList.remove(
      "light-theme",
      "dark-theme",
      "admin-theme"
    );

    if (isAdminRoute) {
      document.body.classList.add("admin-theme");
      return;
    }

    document.body.classList.add(
      theme === "dark"
        ? "dark-theme"
        : "light-theme"
    );

    localStorage.setItem("theme", theme);
  }, [theme, isAdminRoute]);

  const toggleTheme = () => {
    if (isAdminRoute) return;

    setTheme((previousTheme) =>
      previousTheme === "light"
        ? "dark"
        : "light"
    );
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        isAdminRoute,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () =>
  useContext(ThemeContext);