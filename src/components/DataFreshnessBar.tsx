import { timeAgo } from "@/components/topic-analysis/utils";

interface Props {
  /** ISO timestamp from backend when available */
  sourceUpdatedAt?: string | null;
  /** Client-side load timestamp (fallback only) */
  refreshedAt?: Date | null;
  /**
   * Optional re-fetch control. Prefer only on hard load errors —
   * pipeline data is updated by manual workflows, not continuous live streams.
   */
  onRefresh?: () => void | Promise<void>;
  label?: string;
  className?: string;
}

/**
 * Shows when the *source sample* was last written (Supabase), not a live ticker.
 * No pulsing "live" affordance — beta users should not expect continuous feeds.
 */
export function DataFreshnessBar({
  sourceUpdatedAt,
  refreshedAt,
  onRefresh,
  label = "Sample updated",
  className = "",
}: Props) {
  const displayIso = sourceUpdatedAt ?? refreshedAt?.toISOString() ?? null;

  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono text-muted-foreground w-full sm:w-auto ${className}`}
    >
      <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-full border border-border bg-secondary/40 min-h-[36px] sm:min-h-0">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 shrink-0" aria-hidden />
        <span className="hidden sm:inline text-muted-foreground">{label}</span>
        <span className="text-foreground tabular-nums" suppressHydrationWarning>
          {displayIso ? timeAgo(displayIso) : "—"}
        </span>
      </span>
      {onRefresh ? (
        <button
          type="button"
          onClick={() => void onRefresh()}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors min-h-[36px] touch-manipulation text-[10px] font-mono uppercase tracking-wider"
          title="Reload this page's data from the database"
        >
          Reload
        </button>
      ) : null}
    </div>
  );
}
