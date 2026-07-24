import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Sparkles, Share2, TrendingUp, ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";
import type { FeedCitizenSignal, TopicSnapshot } from "@/lib/dashboard-data";
import { cleanHeadline } from "@/lib/utils";
import { sentimentTone } from "@/lib/score-colors";

function TrendIcon({ trend }: { trend?: string | null }) {
  const t = (trend ?? "").toLowerCase();
  if (/(rising|improving|up|positive)/.test(t))
    return <span className="inline-flex items-center gap-1 text-emerald-signal text-xs font-mono"><ArrowUpRight className="w-3 h-3" />Improving</span>;
  if (/(declining|falling|down|negative|worsening)/.test(t))
    return <span className="inline-flex items-center gap-1 text-rose-signal text-xs font-mono"><ArrowDownRight className="w-3 h-3" />Declining</span>;
  return <span className="inline-flex items-center gap-1 text-muted-foreground text-xs font-mono"><ArrowRight className="w-3 h-3" />Stable</span>;
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
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors z-10" aria-label="Close">
              <X className="w-4 h-4" />
            </button>

            <Body signal={signal} snapshot={snapshot} />
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

function dedupeSentences(...parts: Array<string | null | undefined>): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of parts) {
    if (!part) continue;
    const sentences = part.replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+/);
    for (const s of sentences) {
      const trimmed = s.trim();
      if (!trimmed) continue;
      const key = trimmed.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (key.length < 8 || seen.has(key)) continue;
      seen.add(key);
      out.push(trimmed);
    }
  }
  return out.join(" ");
}

function Body({ signal, snapshot }: { signal: FeedCitizenSignal; snapshot?: TopicSnapshot | null }) {
  const curated = signal.curated_insight;
  const tone = sentimentTone(signal.sentiment_score, signal.sentiment_label);
  const score = typeof signal.sentiment_score === "number" ? Math.round(signal.sentiment_score) : null;
  const updated = signal.last_updated ? new Date(signal.last_updated).toLocaleString() : "—";
  const insights = snapshot?.key_insights?.filter(Boolean).slice(0, 4) ?? [];
  const threads = curated?.insight_threads?.filter((t) => t.headline || t.summary).slice(0, 4) ?? [];

  const rawHeadline = cleanHeadline(
    curated?.hero_headline ?? signal.headline ?? signal.summary ?? signal.topic,
  );
  const headline = shortenHeadline(rawHeadline, 160);
  const citizenNarrative = dedupeSentences(
    curated?.hero_summary ?? signal.summary,
    snapshot?.narrative_summary,
  );
  const divergence =
    typeof signal.divergence_score === "number"
      ? Math.round(signal.divergence_score)
      : typeof snapshot?.divergence_score === "number"
        ? Math.round(snapshot.divergence_score)
        : null;
  const windowLabel = (signal.comparison_window ?? "wow").toLowerCase() === "mom" ? "MoM" : "WoW";
  const headlineKey = headline.toLowerCase().replace(/[^a-z0-9]/g, "");
  const excerptKey = (signal.excerpt ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const narrativeKey = citizenNarrative.toLowerCase().replace(/[^a-z0-9]/g, "");
  const showExcerpt =
    !!signal.excerpt &&
    excerptKey.length > 8 &&
    !narrativeKey.includes(excerptKey) &&
    !headlineKey.includes(excerptKey);

  const shareText = `${signal.topic} — ${headline} via @ElenchosPulse`;
  const shareHref = typeof window !== "undefined"
    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`
    : "#";

  return (
    <>
      <div className="mb-4 pr-10">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-mono uppercase tracking-[0.18em] border"
            style={{ background: `${tone.color}1f`, color: tone.color, borderColor: `${tone.color}55` }}>
            <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: tone.color }} />
            {signal.sentiment_label ?? tone.band}
          </span>
          <TrendIcon trend={signal.trend} />
          <span className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            {signal.source ?? "Citizen signal"} · {updated}
          </span>
        </div>
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan mb-1">
          {signal.topic}
        </div>
        <h2 className="text-2xl font-display font-semibold leading-tight">
          {headline}
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <Stat label="Sentiment" value={score !== null ? `${score}/100` : "—"} color={tone.color} bar={score ?? 0} />
        <Stat label="Divergence" value={divergence !== null ? `${divergence}` : "—"} color="var(--rose-signal)" />
        <Stat label="Sample size" value={(signal.sample_size ?? 0).toLocaleString()} color="var(--cyan)" />
        <Stat
          label={`Trend · ${windowLabel}`}
          value={
            typeof signal.sentiment_delta === "number"
              ? `${signal.sentiment_delta > 0 ? "+" : ""}${signal.sentiment_delta}`
              : (signal.trend ?? "Stable")
          }
          color={signal.sentiment_delta != null && signal.sentiment_delta < 0 ? "var(--rose-signal)" : "var(--emerald-signal)"}
        />
      </div>

      {curated?.evolution_note && (
        <div className="rounded-xl border border-cyan/30 bg-cyan/5 p-3.5 mb-3">
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-cyan mb-1">
            Evolution · {windowLabel}
          </div>
          <p className="text-[13px] text-foreground/90 leading-relaxed">{curated.evolution_note}</p>
        </div>
      )}

      {citizenNarrative && (
        <div className="rounded-xl border border-border bg-secondary/30 p-3.5 mb-3 border-l-2 border-l-cyan/60">
          <div className="flex items-center gap-2 text-cyan mb-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <h3 className="font-display font-semibold text-[12px] tracking-[0.14em] uppercase">Citizen Narrative</h3>
          </div>
          <p className="text-[13px] text-foreground/90 leading-relaxed">{citizenNarrative}</p>
        </div>
      )}

      {showExcerpt && (
        <div className="rounded-xl border border-border bg-background/40 p-3.5 mb-3 italic text-[13px] text-foreground/85 leading-relaxed">
          "{signal.excerpt}"
        </div>
      )}

      {threads.length > 0 ? (
        <div className="rounded-xl border border-border bg-secondary/30 p-3.5 mb-3">
          <div className="flex items-center gap-2 text-cyan mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <h3 className="font-display font-semibold text-[12px] tracking-[0.14em] uppercase">Insight threads</h3>
          </div>
          <ul className="space-y-2">
            {threads.map((it, i) => (
              <li key={i} className="text-[13px] text-foreground/90 leading-relaxed">
                <span className="text-cyan font-mono mr-2">{String(i + 1).padStart(2, "0")}</span>
                {it.headline && <span className="font-medium">{it.headline}</span>}
                {it.summary && (
                  <span className={it.headline ? " block text-muted-foreground mt-0.5" : ""}>{it.summary}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : insights.length > 0 ? (
        <div className="rounded-xl border border-border bg-secondary/30 p-3.5 mb-3">
          <div className="flex items-center gap-2 text-cyan mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <h3 className="font-display font-semibold text-[12px] tracking-[0.14em] uppercase">Key insights</h3>
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

      <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
        <span className="text-[10.5px] font-mono uppercase tracking-wider text-muted-foreground">
          Signal #{signal.id}
        </span>
        <a href={shareHref} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border border-cyan/40 text-cyan hover:bg-cyan/10 transition-colors">
          <Share2 className="w-3.5 h-3.5" /> Share on X
        </a>
      </div>
    </>
  );
}

function Stat({ label, value, color, bar }: { label: string; value: string; color: string; bar?: number }) {
  return (
    <div className="rounded-lg bg-secondary/40 border border-border p-2.5 space-y-1.5">
      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="text-base font-display font-semibold tabular-nums" style={{ color }}>{value}</div>
      {typeof bar === "number" && (
        <div className="h-1.5 rounded-full bg-border/60 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, bar))}%`, background: `linear-gradient(90deg, ${color}aa, ${color})`, boxShadow: `0 0 6px ${color}88` }} />
        </div>
      )}
    </div>
  );
}
