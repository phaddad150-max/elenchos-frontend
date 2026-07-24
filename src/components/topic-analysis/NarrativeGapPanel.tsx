import { useState } from "react";
import { AlertTriangle, ChevronDown, Share2, Users, Newspaper } from "lucide-react";
import { divergenceBand, divergenceColor } from "@/lib/score-colors";
import { buildInsightShareText, buildTwitterShareHref } from "@/lib/share-insight";

export type NarrativeGapPanelProps = {
  topicLabel: string;
  score: number | null;
  citizenFrame?: string;
  officialMediaFrame?: string;
  gapHeadline?: string;
  fullOverview?: string;
  /** Optional deep link for share */
  shareUrl?: string;
  sentimentScore?: number | null;
};

/**
 * Visual dual-panel: citizens vs official/media, with gap meter.
 * Long prose stays collapsed — no wall of text by default.
 */
export function NarrativeGapPanel({
  topicLabel,
  score,
  citizenFrame = "",
  officialMediaFrame = "",
  gapHeadline = "",
  fullOverview = "",
  shareUrl,
  sentimentScore,
}: NarrativeGapPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const hasScore = typeof score === "number" && !Number.isNaN(score);
  const hasDual = Boolean(citizenFrame.trim() && officialMediaFrame.trim());
  const color = hasScore ? divergenceColor(score!) : "var(--muted-foreground)";
  const band = hasScore ? divergenceBand(score!) : "—";

  if (!hasScore && !fullOverview.trim() && !hasDual) return null;

  const shareText = buildInsightShareText({
    topicLabel,
    sentimentScore,
    divergenceScore: score,
    citizenFrame,
    officialMediaFrame,
    gapHeadline,
    divergenceGap: fullOverview,
  });
  const href =
    typeof window !== "undefined"
      ? buildTwitterShareHref(shareText, shareUrl ?? window.location.href)
      : "#";

  return (
    <section
      className="rounded-xl border overflow-hidden relative"
      style={{ borderColor: `${color}44` }}
      aria-label="Citizen versus official and media narrative gap"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(320px circle at 50% 0%, ${color}18, transparent 70%)`,
        }}
      />

      <div className="relative px-3 sm:px-4 pt-3 pb-2 flex items-center justify-between gap-2 flex-wrap">
        <div
          className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.18em]"
          style={{ color }}
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          Narrative gap
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono border"
            style={{ color, borderColor: `${color}55`, background: `${color}14` }}
          >
            {band}
          </span>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border border-cyan/40 text-cyan hover:bg-cyan/10"
            onClick={(e) => e.stopPropagation()}
          >
            <Share2 className="w-3 h-3" /> X
          </a>
        </div>
      </div>

      {/* Desktop: citizens | meter | official/media · Mobile: stack */}
      <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-2 sm:gap-3 px-3 sm:px-4 pb-3 items-stretch">
        <FrameCard
          icon={<Users className="w-3.5 h-3.5" />}
          label="Citizens on X"
          accent="var(--cyan)"
          body={
            citizenFrame.trim() ||
            (fullOverview
              ? "Citizen emphasis summarized in gap note below"
              : "Citizen frame not yet published for this snapshot")
          }
          muted={!citizenFrame.trim()}
        />

        <div className="flex flex-col items-center justify-center gap-1 py-2 md:px-3 min-w-[5.5rem]">
          <div className="relative w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] shrink-0">
            <div
              className="absolute inset-0 rounded-full grid place-items-center"
              style={{
                background: hasScore
                  ? `conic-gradient(${color} ${score! * 3.6}deg, var(--border) 0deg)`
                  : "var(--border)",
              }}
            >
              <div className="absolute inset-1.5 rounded-full bg-background grid place-items-center">
                <span
                  className="text-xl sm:text-2xl font-display font-semibold tabular-nums"
                  style={{ color }}
                >
                  {hasScore ? score : "—"}
                </span>
              </div>
            </div>
          </div>
          <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground text-center">
            Gap score
          </div>
          {gapHeadline.trim() ? (
            <p className="text-[11px] sm:text-xs font-display font-semibold text-center leading-snug max-w-[11rem] line-clamp-2">
              {gapHeadline.trim()}
            </p>
          ) : null}
        </div>

        <FrameCard
          icon={<Newspaper className="w-3.5 h-3.5" />}
          label="Official / media"
          accent="var(--amber-signal)"
          body={
            officialMediaFrame.trim() ||
            (fullOverview
              ? "Official/media frame summarized in gap note below"
              : "Official/media frame not yet published for this snapshot")
          }
          muted={!officialMediaFrame.trim()}
        />
      </div>

      {/* Legacy: single overview when no dual frames */}
      {!hasDual && fullOverview.trim() && (
        <p className="relative px-3 sm:px-4 pb-2 text-[12px] sm:text-[13px] text-foreground/85 leading-relaxed line-clamp-2">
          {fullOverview.trim()}
        </p>
      )}

      {(fullOverview.trim() || hasDual) && (
        <div className="relative border-t border-border/60">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground hover:bg-secondary/20 transition-colors"
          >
            {expanded ? "Hide full gap note" : "Full gap note"}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
          {expanded && fullOverview.trim() && (
            <p className="px-3 sm:px-4 pb-3 text-[12px] sm:text-[13px] text-foreground/90 leading-relaxed">
              {fullOverview.trim()}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function FrameCard({
  icon,
  label,
  accent,
  body,
  muted,
}: {
  icon: React.ReactNode;
  label: string;
  accent: string;
  body: string;
  muted?: boolean;
}) {
  return (
    <div
      className="rounded-xl border bg-background/50 p-3 flex flex-col gap-1.5 min-h-[5.5rem]"
      style={{ borderColor: `${accent}44`, borderTopWidth: 2, borderTopColor: accent }}
    >
      <div
        className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.16em]"
        style={{ color: accent }}
      >
        {icon}
        {label}
      </div>
      <p
        className={`text-[12px] sm:text-[13px] leading-snug line-clamp-3 ${
          muted ? "text-muted-foreground italic" : "text-foreground/90"
        }`}
      >
        {body}
      </p>
    </div>
  );
}
