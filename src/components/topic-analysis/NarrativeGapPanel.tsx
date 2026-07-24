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
  shareUrl?: string;
  sentimentScore?: number | null;
};

/**
 * Dual-target narrative gap comparison:
 * - Left box  = citizen narrative only
 * - Right box = official/media narrative only
 * - Center    = gap score (+ severity badge at top) — never dumps frame text
 * - Detail    = only if overview adds NEW synthesis (not a restatement)
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
  const citizen = citizenFrame.trim();
  const official = officialMediaFrame.trim();
  // Only show a short clash label if it's distinct — never paste box bodies under the score
  const headline =
    gapHeadline.trim().length > 0 &&
    gapHeadline.trim().length <= 72 &&
    !/\bvs\.?\b/i.test(gapHeadline)
      ? gapHeadline.trim()
      : "";
  const overview = fullOverview.trim();
  const hasDual = Boolean(citizen && official);
  const color = hasScore ? divergenceColor(score!) : "var(--muted-foreground)";
  const band = hasScore ? divergenceBand(score!) : "—";

  if (!hasScore && !overview && !citizen && !official) return null;

  const shareText = buildInsightShareText({
    topicLabel,
    sentimentScore,
    divergenceScore: score,
    citizenFrame: citizen,
    officialMediaFrame: official,
    gapHeadline: headline,
    divergenceGap: overview,
  });
  const href =
    typeof window !== "undefined"
      ? buildTwitterShareHref(shareText, shareUrl ?? window.location.href)
      : "#";

  // Expand only when dual frames exist AND overview was pre-filtered as novel.
  // Never expand when overview is empty or when we only have one side (overview is that side).
  const showOverviewToggle = Boolean(overview) && hasDual;

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
            className="inline-flex items-center gap-1 min-h-[36px] md:min-h-0 px-2.5 py-1.5 md:py-0.5 rounded-full text-[10px] font-mono border border-cyan/40 text-cyan hover:bg-cyan/10 touch-manipulation"
            onClick={(e) => e.stopPropagation()}
          >
            <Share2 className="w-3 h-3" /> X
          </a>
        </div>
      </div>

      {/* Comparison table: Citizens | score | Official — narratives only inside their boxes */}
      <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-2 sm:gap-3 px-3 sm:px-4 pb-3 items-stretch">
        <FrameCard
          icon={<Users className="w-3.5 h-3.5" />}
          label="Citizens on X"
          accent="var(--cyan)"
          body={
            citizen ||
            "No distinct citizen frame in this snapshot yet. Run Pass 1 to refresh structured gap frames."
          }
          muted={!citizen}
        />

        <div className="flex flex-col items-center justify-center gap-1 py-1 md:px-3 min-w-[5.25rem] order-first md:order-none self-center">
          <div className="relative w-16 h-16 sm:w-[4.25rem] sm:h-[4.25rem] shrink-0">
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
          <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground text-center leading-none">
            Gap score
          </div>
          {/* Short clash label only — never a dump of the box bodies */}
          {headline ? (
            <p className="text-[10px] sm:text-[11px] font-mono text-center leading-snug max-w-[9.5rem] px-0.5 text-muted-foreground">
              {headline}
            </p>
          ) : null}
        </div>

        <FrameCard
          icon={<Newspaper className="w-3.5 h-3.5" />}
          label="Official / media"
          accent="var(--amber-signal)"
          body={
            official ||
            "No distinct official/media frame in this snapshot yet. Run Pass 1 to refresh structured gap frames."
          }
          muted={!official}
        />
      </div>

      {/* Optional synthesis — only when it is not a restatement of the boxes */}
      {showOverviewToggle && (
        <div className="relative border-t border-border/60">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-center gap-1.5 min-h-[44px] md:min-h-0 px-3 py-2.5 md:py-2 text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground hover:bg-secondary/20 transition-colors touch-manipulation"
          >
            {expanded ? "Hide synthesis" : "Why this gap matters"}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
          {expanded && (
            <p className="px-3 sm:px-4 pb-3 text-[13px] text-foreground/90 leading-relaxed">
              {overview}
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
  const [open, setOpen] = useState(false);
  const long = body.length > 140;

  return (
    <div
      className="rounded-xl border bg-background/50 p-3 sm:p-3.5 flex flex-col gap-2 min-h-[6.5rem] h-full"
      style={{ borderColor: `${accent}44`, borderTopWidth: 2, borderTopColor: accent }}
    >
      <div
        className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.16em] shrink-0"
        style={{ color: accent }}
      >
        {icon}
        {label}
      </div>
      <p
        className={`text-[13px] sm:text-[14px] leading-snug flex-1 ${
          open ? "" : "line-clamp-3"
        } ${muted ? "text-muted-foreground italic" : "text-foreground/90"}`}
      >
        {body}
      </p>
      {long && !muted && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="self-start text-[11px] font-mono text-cyan hover:underline min-h-[36px] md:min-h-0 py-0.5 touch-manipulation"
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
