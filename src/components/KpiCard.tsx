import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useCountUp, type CountFormat } from "@/hooks/use-count-up";

interface Props {
  label: string;
  value: string | number;
  /** When value is numeric, controls formatting of the count-up animation. */
  format?: CountFormat;
  /** Optional suffix appended after the animated number (e.g. "%", "/100"). */
  unit?: string;
  delta?: string;
  icon: LucideIcon;
  variant?: "cyan" | "emerald" | "magenta" | "amber" | "rose" | "violet";
  description: string;
  detail: string;
  onClick?: () => void;
  tick?: boolean;
}

export function KpiCard({
  label,
  value,
  format = "compact",
  unit,
  delta,
  icon: Icon,
  variant = "cyan",
  description,
  detail,
  onClick,
  tick,
}: Props) {
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (tick) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 800);
      return () => clearTimeout(t);
    }
  }, [value, tick]);

  const [expanded, setExpanded] = useState(false);

  // All KPI accents use the brand blue for a unified, formal palette.
  const numberColor = "var(--cyan)";
  const accentColor: Record<NonNullable<Props["variant"]>, string> = {
    cyan: "var(--cyan)",
    emerald: "var(--cyan)",
    magenta: "var(--cyan)",
    amber: "var(--cyan)",
    rose: "var(--cyan)",
    violet: "var(--cyan)",
  };

  const numericTarget = typeof value === "number" ? value : NaN;
  const animated = useCountUp(Number.isFinite(numericTarget) ? numericTarget : 0, { format });
  const displayValue = typeof value === "number" ? animated : value;

  return (
    <motion.div
      layout
      onClick={() => {
        setExpanded((v) => !v);
        onClick?.();
      }}
      className={`kpi-card kpi-cyan glass rounded-2xl p-4 cursor-pointer group`}
      whileTap={{ scale: 0.985 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-mono">
          <Icon className="w-3 h-3" style={{ color: accentColor[variant] }} strokeWidth={2.4} />
          {label}
        </div>
      </div>
      <div
        className={`text-3xl md:text-4xl font-display font-semibold tabular-nums leading-none ${flash ? "ticker-flash" : ""}`}
        style={{ color: numberColor, textShadow: `0 0 18px ${numberColor}55` }}
      >
        {displayValue}
        {unit && typeof value === "number" && (
          <span className="text-base font-mono text-muted-foreground ml-1">{unit}</span>
        )}
      </div>
      {description && (
        <p className="text-[11px] text-muted-foreground leading-relaxed mt-2 line-clamp-2">
          {description}
        </p>
      )}
      {delta && (
        <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
          <span className="w-1 h-1 rounded-full bg-cyan pulse-dot" /> {delta}
        </div>
      )}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-border text-[11px] text-muted-foreground leading-relaxed">
              {detail}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
