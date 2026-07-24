import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AlertTriangle, ChevronDown, Share2, GitCompareArrows } from "lucide-react";
import { divergenceBand, divergenceColor } from "@/lib/score-colors";
import { buildInsightShareText, buildTwitterShareHref } from "@/lib/share-insight";
import type { NarrativeGapPoint } from "@/lib/dashboard-data";

export type NarrativeGapPanelProps = {
  topicLabel: string;
  score: number | null;
  citizenFrame?: string;
  officialMediaFrame?: string;
  gapHeadline?: string;
  fullOverview?: string;
  scoreRationale?: string;
  gapPoints?: NarrativeGapPoint[];
  shareUrl?: string;
  sentimentScore?: number | null;
};

/**
 * Comparative narrative gap (shared by every live topic via TopicAnalysisPage):
 * - Score strip = score + why that score
 * - Identified gaps = concrete paired claims only (no duplicate dual summary boxes)
 */
export function NarrativeGapPanel({
  topicLabel,
  score,
  citizenFrame = "",
  officialMediaFrame = "",
  gapHeadline = "",
  fullOverview = "",
  scoreRationale = "",
  gapPoints = [],
  shareUrl,
  sentimentScore,
}: NarrativeGapPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const hasScore = typeof score === "number" && !Number.isNaN(score);
  const citizen = citizenFrame.trim();
  const official = officialMediaFrame.trim();
  const rationale = scoreRationale.trim();
  const points = (gapPoints ?? []).filter(
    (g) => (g.claim_citizen ?? "").trim() || (g.claim_official_media ?? "").trim(),
  );
  const headline =
    gapHeadline.trim().length > 0 &&
    gapHeadline.trim().length <= 72 &&
    !/\bvs\.?\b/i.test(gapHeadline)
      ? gapHeadline.trim()
      : "";
  const overview = fullOverview.trim();
  const color = hasScore ? divergenceColor(score!) : "var(--muted-foreground)";
  const band = hasScore ? divergenceBand(score!) : "—";

  if (!hasScore && !overview && !citizen && !official && points.length === 0) return null;

  const shareText = buildInsightShareText({
    topicLabel,
    sentimentScore,
    divergenceScore: score,
    citizenFrame: citizen || points[0]?.claim_citizen,
    officialMediaFrame: official || points[0]?.claim_official_media,
    gapHeadline: headline || points[0]?.why_it_matters,
    divergenceGap: overview || rationale,
  });
  const href =
    typeof window !== "undefined"
      ? buildTwitterShareHref(shareText, shareUrl ?? window.location.href)
      : "#";

  const showOverviewToggle = Boolean(overview);

  return (
    <section
      className="rounded-xl border overflow-hidden relative"
      style={{ borderColor: `${color}44` }}
      aria-label="Citizen versus official and media narrative gap"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background: `radial-gradient(320px circle at 50% 0%, ${color}18, transparent 70%)`,
        }}
      />

      <div className="relative px-3 sm:px-4 pt-3 pb-2 flex items-start sm:items-center justify-between gap-2 flex-wrap">
        <div
          className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.16em] sm:tracking-[0.18em] max-w-[min(100%,18rem)] sm:max-w-none leading-snug"
          style={{ color }}
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Narrative gap · citizen vs official / media</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
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
            className="inline-flex items-center gap-1 min-h-[40px] sm:min-h-[36px] px-2.5 py-1.5 rounded-full text-[10px] font-mono border border-cyan/40 text-cyan hover:bg-cyan/10 active:bg-cyan/15 touch-manipulation"
            onClick={(e) => e.stopPropagation()}
          >
            <Share2 className="w-3 h-3" /> X
          </a>
        </div>
      </div>

      {/* Score strip */}
      <div className="relative mx-3 sm:mx-4 mb-3 rounded-xl border border-border/70 bg-background/60 px-3 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
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
                  className="text-lg sm:text-xl font-display font-semibold tabular-nums"
                  style={{ color }}
                >
                  {hasScore ? score : "—"}
                </span>
              </div>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
              Gap score · 0–100
            </div>
            <div className="text-sm font-display font-semibold" style={{ color }}>
              {band}
            </div>
            {/* Helper only when no rationale (avoid clutter on mobile) */}
            {!rationale ? (
              <p className="text-[11px] text-muted-foreground leading-snug">
                Higher = wider split between citizens on X and official + media frames.
              </p>
            ) : (
              <p className="hidden sm:block text-[11px] text-muted-foreground leading-snug max-w-xs">
                Higher = wider split between citizens on X and official + media frames.
              </p>
            )}
          </div>
        </div>
        {rationale ? (
          <div className="sm:border-l sm:border-border/70 sm:pl-4 min-w-0 flex-1 pt-2 sm:pt-0 border-t border-border/50 sm:border-t-0">
            <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-0.5">
              Why this score
            </div>
            <p className="text-[13px] text-foreground/90 leading-snug">{rationale}</p>
            {headline ? (
              <p className="mt-1 text-[12px] font-mono text-muted-foreground">{headline}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Identified gaps — single comparison layer for all topics */}
      {points.length > 0 ? (
        <div className="relative border-t border-border/60 px-3 sm:px-4 py-3 space-y-2.5">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.16em] text-foreground/80">
            <GitCompareArrows className="w-3.5 h-3.5 text-cyan shrink-0" />
            Identified gaps · what each side claims
          </div>
          <div className="space-y-2">
            {points.map((gp, i) => (
              <GapPointRow key={i} index={i + 1} point={gp} color={color} />
            ))}
          </div>
        </div>
      ) : citizen || official ? (
        <div className="relative border-t border-border/60 px-3 sm:px-4 py-3 space-y-2.5">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.16em] text-foreground/80">
            <GitCompareArrows className="w-3.5 h-3.5 text-cyan shrink-0" />
            Identified gaps · what each side claims
          </div>
          <GapPointRow
            index={1}
            point={{
              claim_citizen: citizen || undefined,
              claim_official_media: official || undefined,
              why_it_matters: rationale || headline || undefined,
            }}
            color={color}
          />
        </div>
      ) : null}

      {showOverviewToggle && (
        <div className="relative border-t border-border/60">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-0 px-3 py-2.5 sm:py-2 text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground hover:bg-secondary/20 active:bg-secondary/30 transition-colors touch-manipulation"
          >
            {expanded ? "Hide synthesis" : "Brief synthesis"}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
          {expanded && (
            <p className="px-3 sm:px-4 pb-3 text-[13px] text-foreground/90 leading-relaxed break-words">
              {overview}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function GapPointRow({
  index,
  point,
  color,
}: {
  index: number;
  point: NarrativeGapPoint;
  color: string;
}) {
  const cit = (point.claim_citizen ?? "").trim();
  const off = (point.claim_official_media ?? "").trim();
  const why = (point.why_it_matters ?? "").trim();

  return (
    <div
      className="rounded-xl border bg-background/50 p-3 space-y-2.5"
      style={{ borderColor: `${color}33` }}
    >
      <div className="flex items-start gap-2 min-w-0">
        <span
          className="inline-flex items-center justify-center w-5 h-5 mt-0.5 rounded-md text-[10px] font-mono font-semibold shrink-0"
          style={{ color, background: `${color}18`, border: `1px solid ${color}44` }}
        >
          {index}
        </span>
        {why ? (
          <p className="text-[12px] sm:text-[13px] font-display font-semibold text-foreground/90 leading-snug min-w-0 break-words">
            {why}
          </p>
        ) : (
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Gap {index}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="rounded-lg border border-cyan/25 bg-cyan/[0.05] px-2.5 py-2 min-w-0">
          <div className="text-[9px] font-mono uppercase tracking-[0.14em] text-cyan mb-1">
            Citizens say
          </div>
          <ExpandableText
            text={cit || "—"}
            className="text-[12px] sm:text-[13px] text-foreground/90 leading-snug break-words"
            clampLines={4}
          />
        </div>
        <div className="rounded-lg border border-amber-signal/30 bg-amber-signal/[0.06] px-2.5 py-2 min-w-0">
          <div className="text-[9px] font-mono uppercase tracking-[0.14em] text-amber-signal mb-1">
            Official / media say
          </div>
          <ExpandableText
            text={off || "—"}
            className="text-[12px] sm:text-[13px] text-foreground/90 leading-snug break-words"
            clampLines={4}
          />
        </div>
      </div>
    </div>
  );
}

function ExpandableText({
  text,
  className = "",
  clampLines = 3,
}: {
  text: string;
  className?: string;
  clampLines?: number;
}) {
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(text.length > 120);
  const ref = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    if (open) return;
    const el = ref.current;
    if (!el) return;
    const check = () => {
      // Long text always gets a toggle; also measure real clamp overflow
      setOverflows(text.length > 120 || el.scrollHeight > el.clientHeight + 2);
    };
    check();
    const t = window.setTimeout(check, 80);
    return () => window.clearTimeout(t);
  }, [text, open, clampLines]);

  useEffect(() => {
    setOpen(false);
  }, [text]);

  const clampClass = !open
    ? clampLines === 4
      ? "line-clamp-4"
      : clampLines === 2
        ? "line-clamp-2"
        : "line-clamp-3"
    : "";

  return (
    <div className="min-w-0">
      <p ref={ref} className={`${className} ${clampClass}`}>
        {text}
      </p>
      {(overflows || open) && text !== "—" && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-1 inline-flex items-center text-[11px] font-mono text-cyan hover:underline min-h-[40px] sm:min-h-[32px] py-1 touch-manipulation"
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
