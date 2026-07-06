import { useEffect, useRef, useState } from "react";

export type CountFormat = "number" | "percent" | "compact";

function fmt(n: number, format: CountFormat, decimals: number): string {
  if (format === "percent") return `${n.toFixed(decimals)}%`;
  if (format === "compact") {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return `${Math.round(n)}`;
  }
  return Math.round(n).toLocaleString();
}

/**
 * Animates 0 → target on mount and whenever `target` changes.
 * Returns a formatted string ready to render.
 */
export function useCountUp(
  target: number,
  opts: { duration?: number; format?: CountFormat; decimals?: number } = {}
): string {
  const { duration = 1200, format = "number", decimals = 1 } = opts;
  const [val, setVal] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = Number.isFinite(target) ? target : 0;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return fmt(val, format, decimals);
}
