import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MessageSquare,
  Sparkles,
  Share2,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { FeedCitizenSignal, TopicSnapshot } from "@/lib/dashboard-data";
import { cleanHeadline } from "@/lib/utils";
import { sentimentTone } from "@/lib/score-colors";
import { LIVE_TOPIC_KEYS } from "@/lib/topic-catalog";
import { isMostlyCoveredBy, uniqueProse } from "@/lib/curated-text";

function TrendIcon({ trend }: { trend?: string | null }) {
  const t = (trend ?? "").toLowerCase();
  if (/(rising|improving|up|positive)/.test(t))
    return (
      <span className="inline-flex items-center gap-1 text-emerald-signal text-xs font-mono">
        <ArrowUpRight className="w-3 h-3" />
        Improving
      </span>
    );
  if (/(declining|falling|down|negative|worsening)/.test(t))
    return (
      <span className="inline-flex items-center gap-1 text-rose-signal text-xs font-mono">
        <ArrowDownRight className="w-3 h-3" />
        Declining
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground text-xs font-mono">
      <ArrowRight className="w-3 h-3" />
      Stable
    </span>
  );
}

function topicPathId(topic: string): string | null {
  const entry = Object.entries(LIVE_TOPIC_KEYS).find(
    ([, cfg]) => cfg.rootKey === topic || cfg.headerLabel === topic,
  );
  return entry?.[0] ?? null;
}

export function CitizenSignalModal({
  signal,
  snapshot,
  onClose,
}: {
  signal: FeedCitizenSignal | null;
  snapshot?: TopicSnapshot | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {signal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-md grid place-items-end sm:place-items-center p-0 sm:p-4"
        >
          <motion.div
            initial={{ scale: 0.96, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong rounded-t-3xl sm:rounded-3xl max-w-2xl w-full p-5 sm:p-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pb-6 relative max-h-[92vh] sm:max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors z-10 min-h-[40px] min-w-[40px]"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <Body signal={signal} snapshot={snapshot} onClose={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function shortenHeadline(text: string, maxChars = 110): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxChars) return clean;
  const firstSentence = clean.split(/(?<=[.!?])\s+/)[0];
  if (firstSentence && firstSentence.length <= maxChars) return firstSentence;
  const truncated = clean.slice(0, maxChars);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 40 ? truncated.slice(0, lastSpace) : truncated).replace(/[,;:\-–—]+$/, "") + "…";
}

function Body({
  signal,
  snapshot,
  onClose,
}: {
  signal: FeedCitizenSignal;
  snapshot?: TopicSnapshot | null;
  onClose: () => void;
}) {
  const curated = signal.curated_insight;
  const snapScore =
    snapshot?.overall_sentiment && typeof snapshot.overall_sentiment === "object"
      ? snapshot.overall_sentiment.score
      : null;
  const snapLabel =
    snapshot?.overall_sentiment && typeof snapshot.overall_sentiment === "object"
      ? snapshot.overall_sentiment.label
      : null;
  const scoreRaw =
    typeof signal.sentiment_score === "number"
      ? signal.sentiment_score
      : typeof snapScore === "number"
        ? snapScore
        : null;
  const tone = sentimentTone(scoreRaw, signal.sentiment_label ?? snapLabel ?? null);
  const score = typeof scoreRaw === "number" ? Math.round(scoreRaw) : null;
  const updated = signal.last_updated
    ? new Date(signal.last_updated).toLocaleString()
    : snapshot?.last_updated
      ? new Date(snapshot.last_updated).toLocaleString()
      : "—";
  const rawInsights = (snapshot?.key_insights ?? []).filter(Boolean).slice(0, 4) as string[];
  const sampleSize =
    typeof signal.sample_size === "number" && signal.sample_size > 0
      ? signal.sample_size
      : typeof snapshot?.sample_size === "number"
        ? snapshot.sample_size
        : 0;

  const rawHeadline = cleanHeadline(
    curated?.hero_headline ??
      signal.headline ??
      signal.summary ??
      rawInsights[0] ??
      signal.topic,
  );
  const headline = shortenHeadline(rawHeadline, 160);

  // Evolution first — strip internal repeats (same sentence pasted twice in the note).
  const evolutionText = uniqueProse(curated?.evolution_note);

  // Insight threads: drop summary lines that only repeat the headline.
  const threads = (curated?.insight_threads ?? [])
    .filter((t) => t.headline || t.summary)
    .slice(0, 4)
    .map((t) => {
      const headlinePart = (t.headline ?? "").trim();
      const summaryPart = uniqueProse(t.summary, [headlinePart, evolutionText, headline]);
      return { headline: headlinePart || null, summary: summaryPart || null };
    })
    .filter((t) => t.headline || t.summary);

  const threadCorpus = threads
    .map((t) => [t.headline, t.summary].filter(Boolean).join(" "))
    .join(" ");

  // Key insights (non-curated fallback): drop lines already in evolution / threads / headline.
  const insights = rawInsights
    .map((it) => uniqueProse(it, [evolutionText, threadCorpus, headline]))
    .filter((it) => it.length > 0)
    .slice(0, 4);

  const insightCorpus = insights.join(" ");

  /**
   * Citizen narrative — only keep prose that adds beyond threads/insights/evolution.
   * Do NOT fold insight[0] into narrative (that caused double display).
   */
  const narrativeSource =
    curated?.hero_summary?.trim() ||
    signal.summary?.trim() ||
    snapshot?.narrative_summary?.trim() ||
    "";
  const citizenNarrativeRaw = uniqueProse(narrativeSource, [
    evolutionText,
    threadCorpus,
    insightCorpus,
    headline,
  ]);
  const citizenNarrative =
    citizenNarrativeRaw &&
    !isMostlyCoveredBy(citizenNarrativeRaw, `${threadCorpus} ${insightCorpus} ${evolutionText}`)
      ? citizenNarrativeRaw
      : "";

  const divergence =
    typeof signal.divergence_score === "number"
      ? Math.round(signal.divergence_score)
      : typeof snapshot?.divergence_score === "number"
        ? Math.round(snapshot.divergence_score)
        : null;
  const windowLabel = (signal.comparison_window ?? "wow").toLowerCase() === "mom" ? "MoM" : "WoW";

  // Never treat evolution_note as a quote excerpt (feed used to set excerpt = evolution).
  const excerptCandidate =
    signal.excerpt &&
    curated?.evolution_note &&
    uniqueProse(signal.excerpt, [curated.evolution_note]) === ""
      ? ""
      : uniqueProse(signal.excerpt, [
          evolutionText,
          citizenNarrative,
          threadCorpus,
          insightCorpus,
          headline,
        ]);
  const showExcerpt = excerptCandidate.length > 20;

  const pathId = topicPathId(signal.topic);
  const thin =
    !citizenNarrative &&
    !evolutionText &&
    threads.length === 0 &&
    insights.length === 0 &&
    score === null &&
    divergence === null;

  const shareText = `${signal.topic}: ${headline} via @ElenchosPulse`;
  const shareHref =
    typeof window !== "undefined"
      ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`
      : "#";

  return (
    <>
      <div className="mb-4 pr-10">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-mono uppercase tracking-[0.18em] border"
            style={{
              background: `${tone.color}1f`,
              color: tone.color,
              borderColor: `${tone.color}55`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: tone.color }} />
            {signal.sentiment_label ?? tone.band}
          </span>
          {(signal.trend || signal.sentiment_delta != null) && (
            <TrendIcon trend={signal.trend} />
          )}
          <span className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            {signal.source ?? "Citizen signal"} · {updated}
          </span>
        </div>
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan mb-1">
          {signal.topic}
        </div>
        <h2 className="text-2xl font-display font-semibold leading-tight">{headline}</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <Stat
          label="Sentiment"
          value={score !== null ? `${score}/100` : "—"}
          color={tone.color}
          bar={score ?? 0}
        />
        <Stat
          label="Divergence"
          value={divergence !== null ? `${divergence}` : "—"}
          color="var(--rose-signal)"
        />
        <Stat
          label="Sample size"
          value={sampleSize > 0 ? sampleSize.toLocaleString() : "—"}
          color="var(--cyan)"
        />
        <Stat
          label={`Trend · ${windowLabel}`}
          value={
            typeof signal.sentiment_delta === "number"
              ? `${signal.sentiment_delta > 0 ? "+" : ""}${signal.sentiment_delta}`
              : (signal.trend ?? "—")
          }
          color={
            signal.sentiment_delta != null && signal.sentiment_delta < 0
              ? "var(--rose-signal)"
              : "var(--emerald-signal)"
          }
        />
      </div>

      {evolutionText && (
        <div className="rounded-xl border border-cyan/30 bg-cyan/5 p-3.5 mb-3">
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-cyan mb-1">
            Evolution · {windowLabel}
          </div>
          <p className="text-[13px] text-foreground/90 leading-relaxed">{evolutionText}</p>
        </div>
      )}

      {threads.length > 0 ? (
        <div className="rounded-xl border border-border bg-secondary/30 p-3.5 mb-3">
          <div className="flex items-center gap-2 text-cyan mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <h3 className="font-display font-semibold text-[12px] tracking-[0.14em] uppercase">
              Insight threads
            </h3>
          </div>
          <ul className="space-y-2">
            {threads.map((it, i) => (
              <li key={i} className="text-[13px] text-foreground/90 leading-relaxed">
                <span className="text-cyan font-mono mr-2">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {it.headline && <span className="font-medium">{it.headline}</span>}
                {it.summary && (
                  <span className={it.headline ? " block text-muted-foreground mt-0.5" : ""}>
                    {it.summary}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : insights.length > 0 ? (
        <div className="rounded-xl border border-border bg-secondary/30 p-3.5 mb-3">
          <div className="flex items-center gap-2 text-cyan mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <h3 className="font-display font-semibold text-[12px] tracking-[0.14em] uppercase">
              Key insights
            </h3>
          </div>
          <ul className="space-y-1.5">
            {insights.map((it, i) => (
              <li key={i} className="text-[13px] text-foreground/90 leading-relaxed flex gap-2">
                <span className="text-cyan font-mono">{String(i + 1).padStart(2, "0")}</span>
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Narrative only when it adds something threads/insights/evolution do not already say */}
      {citizenNarrative && (
        <div className="rounded-xl border border-border bg-secondary/30 p-3.5 mb-3 border-l-2 border-l-cyan/60">
          <div className="flex items-center gap-2 text-cyan mb-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <h3 className="font-display font-semibold text-[12px] tracking-[0.14em] uppercase">
              Citizen narrative
            </h3>
          </div>
          <p className="text-[13px] text-foreground/90 leading-relaxed">{citizenNarrative}</p>
        </div>
      )}

      {showExcerpt && (
        <div className="rounded-xl border border-border bg-background/40 p-3.5 mb-3 italic text-[13px] text-foreground/85 leading-relaxed">
          &ldquo;{excerptCandidate}&rdquo;
        </div>
      )}

      {thin && (
        <p className="text-[13px] text-muted-foreground leading-relaxed mb-3">
          Limited fields in this feed row. Open the full topic briefing for scores and narrative when
          a deeper sample exists.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
        {pathId ? (
          <Link
            to="/research/topic/$topicId"
            params={{ topicId: pathId }}
            onClick={onClose}
            className="text-[12px] font-medium text-cyan hover:underline"
          >
            Open full topic briefing
          </Link>
        ) : (
          <span className="text-[10.5px] font-mono uppercase tracking-wider text-muted-foreground">
            Sample signal
          </span>
        )}
        <a
          href={shareHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border border-cyan/40 text-cyan hover:bg-cyan/10 transition-colors min-h-[36px]"
        >
          <Share2 className="w-3.5 h-3.5" /> Share on X
        </a>
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  color,
  bar,
}: {
  label: string;
  value: string;
  color: string;
  bar?: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-secondary/25 px-2.5 py-2 min-w-0">
      <div className="text-[9px] font-mono uppercase tracking-[0.14em] text-muted-foreground truncate">
        {label}
      </div>
      <div className="text-[15px] font-display font-semibold tabular-nums mt-0.5 truncate" style={{ color }}>
        {value}
      </div>
      {typeof bar === "number" && bar > 0 && (
        <div className="mt-1.5 h-1 rounded-full bg-border/60 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, bar))}%`, background: color }}
          />
        </div>
      )}
    </div>
  );
}
