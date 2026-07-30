import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

/** Compact icon toggle — sits in the main nav, not a second tab strip. */
export function ThemePreferenceTabs({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      role="group"
      aria-label="Color theme"
      className={`inline-flex items-center rounded-full border border-border bg-secondary/40 p-0.5 ${className}`}
    >
      <button
        type="button"
        aria-label="Dark theme"
        aria-pressed={isDark}
        onClick={() => setTheme("dark")}
        className={`p-1.5 sm:p-2 rounded-full transition-colors ${
          isDark
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        aria-label="Light theme"
        aria-pressed={!isDark}
        onClick={() => setTheme("light")}
        className={`p-1.5 sm:p-2 rounded-full transition-colors ${
          !isDark
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
