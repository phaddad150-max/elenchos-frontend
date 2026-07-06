import { FlaskConical } from "lucide-react";

export function SimulatedDataBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300 text-[10px] font-mono uppercase tracking-[0.18em] " +
        className
      }
      title="This tracker is showing simulated / preview data while we tune the model. Not live citizen data yet."
      aria-label="Simulated data — preview only"
    >
      <FlaskConical className="w-3 h-3" strokeWidth={2.2} />
      Simulated data · preview
    </span>
  );
}
