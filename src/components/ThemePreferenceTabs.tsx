import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export function ThemePreferenceTabs({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useTheme();

  return (
    <div
      role="tablist"
      aria-label="Theme"
      className={`inline-flex items-center gap-1 rounded-full border border-border bg-background/80 backdrop-blur p-1 ${className}`}
    >
      <button
        type="button"
        role="tab"
        aria-selected={theme === "dark"}
        onClick={() => setTheme("dark")}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.14em] transition-colors ${
          theme === "dark"
            ? "bg-secondary text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
        Dark
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={theme === "light"}
        onClick={() => setTheme("light")}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.14em] transition-colors ${
          theme === "light"
            ? "bg-secondary text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
        Light
      </button>
    </div>
  );
}