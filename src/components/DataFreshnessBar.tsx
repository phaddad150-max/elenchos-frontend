import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { timeAgo } from "@/components/topic-analysis/utils";

interface Props {
  /** ISO timestamp from backend when available */
  sourceUpdatedAt?: string | null;
  /** Client-side refresh timestamp */
  refreshedAt?: Date | null;
  onRefresh?: () => void | Promise<void>;
  label?: string;
  className?: string;
}

export function DataFreshnessBar({
  sourceUpdatedAt,
  refreshedAt,
  onRefresh,
  label = "Last updated",
  className = "",
}: Props) {
  const [busy, setBusy] = useState(false);
  const displayIso = sourceUpdatedAt ?? refreshedAt?.toISOString() ?? null;

  const handleRefresh = async () => {
    if (!onRefresh || busy) return;
    setBusy(true);
    try {
      await onRefresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono text-muted-foreground w-full sm:w-auto ${className}`}>
      <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-full border border-border bg-secondary/40 min-h-[36px] sm:min-h-0">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-signal pulse-dot shrink-0" />
        <span className="hidden sm:inline">{label}</span>
        <span className="text-foreground tabular-nums" suppressHydrationWarning>
          {displayIso ? timeAgo(displayIso) : "—"}
        </span>
      </span>
      {onRefresh && (
        <button
          type="button"
          onClick={handleRefresh}
          disabled={busy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-cyan/40 text-cyan bg-cyan/10 hover:bg-cyan/20 active:bg-cyan/25 transition-colors disabled:opacity-50 min-h-[36px] touch-manipulation"
          title="Refresh cached data"
        >
          <RefreshCw className={`w-3 h-3 ${busy ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">{busy ? "Refreshing…" : "Refresh"}</span>
        </button>
      )}
    </div>
  );
}