import { useEffect, useState } from "react";
import { THEME_STORAGE_KEY, initialTheme, toggleTheme, type Theme } from "./lib/theme";

export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(() =>
    initialTheme(
      localStorage.getItem(THEME_STORAGE_KEY),
      window.matchMedia("(prefers-color-scheme: dark)").matches
    )
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return { theme, toggle: () => setTheme(toggleTheme) };
}
