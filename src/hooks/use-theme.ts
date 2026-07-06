import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

const KEY = "cp-theme";

export function useTheme(): [Theme, (t: Theme) => void, () => void] {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && (localStorage.getItem(KEY) as Theme)) || "dark";
    setTheme(stored);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    try {
      localStorage.setItem(KEY, theme);
    } catch {}
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return [theme, setTheme, toggle];
}
