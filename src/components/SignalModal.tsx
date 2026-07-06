import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MessageSquare,
  Megaphone,
  GitCompareArrows,
  Zap,
  Newspaper,
  Share2,
} from "lucide-react";
import type { Signal } from "@/lib/sim-data";
import { SENTIMENT_COLOR, INTENSITY_COLOR } from "@/lib/sim-data";

function intensityTone(intensity: Signal["intensity"]): string {
  if (intensity === "critical") return "var(--rose-signal)";
  if (intensity === "high") return "var(--amber-signal)";
  if (intensity === "medium") return "var(--cyan)";
  return "var(--emerald-signal)";
}

function divergenceCopy(d: number): { citizen: string; official: string; gap: string; impact: string } {
  const pct = Math.round(d * 100);
  return {
    citizen: `Citizens on X foreground lived impact — jobs, prices, mobility, security — and demand visible accountability.`,
    official: `Official channels and mainstream media frame the topic through diplomacy, process and risk hedging.`,
    gap: `${pct}-pt gap concentrated on framing of who benefits and how fast change is realistic.`,
    impact:
      pct > 50
        ? "High legitimacy risk: official narrative may lose ground without rapid recalibration."
        : pct > 25
          ? "Moderate divergence: under-covered citizen angle is a clear story opportunity."
          : "Mild divergence: a narrowing-gap story worth tracking for trend reversal.",
  };
}

export function SignalModal({ signal, onClose }: { signal: Signal | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {signal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md grid place-items-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong rounded-3xl max-w-3xl w-full p-6 relative max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Top: title + chips */}
            <Header signal={signal} />

            {/* Metrics row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-5">
              <Stat label="Posts" value={signal.posts.toLocaleString()} />
              <Stat label="Engagement" value={signal.engagement.toLocaleString()} />
              <Stat
                label="Divergence"
                value={`${Math.round(signal.divergence * 100)}%`}
                accent
                bar={Math.round(signal.divergence * 100)}
                tone={signal.divergence > 0.5 ? "var(--rose-signal)" : signal.divergence > 0.25 ? "var(--amber-signal)" : "var(--emerald-signal)"}
              />
              <Stat
                label="Velocity 1h"
                value={`${signal.velocity > 0 ? "+" : ""}${Math.round(signal.velocity)}%`}
                accent={signal.velocity > 50}
                bar={Math.max(0, Math.min(100, Math.round(signal.velocity)))}
                tone={signal.velocity > 50 ? "var(--cyan)" : "var(--muted-foreground)"}
              />
            </div>

            {/* 4 insight cards */}
            <InsightCards signal={signal} />

            {/* Actionable */}
            <Actionable signal={signal} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Header({ signal }: { signal: Signal }) {
  const tone = intensityTone(signal.intensity);
  return (
    <div className="mb-4 pr-10">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-mono uppercase tracking-[0.18em] border"
          style={{ background: `${tone}1f`, color: tone, borderColor: `${tone}55` }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full pulse-dot"
            style={{ background: INTENSITY_COLOR[signal.intensity] }}
          />
          {signal.intensity} intensity
        </span>
        <span className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
          {signal.region} · {signal.subregion} · {signal.source}
        </span>
      </div>
      <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan mb-1">
        {signal.topic} · {signal.sentiment} cluster
      </div>
      <h2 className="text-2xl font-display font-semibold leading-tight">{signal.headline}</h2>
    </div>
  );
}

function InsightCards({ signal }: { signal: Signal }) {
  const copy = divergenceCopy(signal.divergence);
  const cards = [
    {
      title: "Citizen Perspective",
      body: copy.citizen,
      tone: "cyan",
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      title: "Official Narrative",
      body: copy.official,
      tone: "muted",
      icon: <Megaphone className="w-4 h-4" />,
    },
    {
      title: "Key Divergence",
      body: copy.gap,
      tone: "amber",
      icon: <GitCompareArrows className="w-4 h-4" />,
    },
    {
      title: "Potential Impact",
      body: copy.impact,
      tone: signal.divergence > 0.5 ? "rose" : "emerald",
      icon: <Zap className="w-4 h-4" />,
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-5">
      {cards.map((c) => {
        const color =
          c.tone === "cyan"
            ? "var(--cyan)"
            : c.tone === "amber"
              ? "var(--amber-signal)"
              : c.tone === "rose"
                ? "var(--rose-signal)"
                : c.tone === "emerald"
                  ? "var(--emerald-signal)"
                  : "var(--muted-foreground)";
        return (
          <div
            key={c.title}
            className="rounded-xl border border-border bg-secondary/30 p-3.5 border-l-2 space-y-1.5"
            style={{ borderLeftColor: color }}
          >
            <div className="flex items-center gap-2" style={{ color }}>
              {c.icon}
              <h3 className="font-display font-semibold text-[13px] tracking-[0.12em] uppercase">
                {c.title}
              </h3>
            </div>
            <p className="text-[13px] text-foreground/90 leading-relaxed">{c.body}</p>
          </div>
        );
      })}
    </div>
  );
}

function Actionable({ signal }: { signal: Signal }) {
  const angle = `Underreported angle: ${signal.subregion} citizens are framing "${signal.topic}" through ${signal.sentiment} terms while ${signal.source.toLowerCase()} coverage leans process-first. ${Math.round(signal.divergence * 100)}-pt gap = a clear story hook.`;

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${signal.topic} — ${Math.round(signal.divergence * 100)}-pt citizen-vs-official gap in ${signal.region}. ${signal.headline} via @ElenchosPulse`;
  const shareHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <section className="rounded-xl bg-secondary/40 border border-border p-4 space-y-3">
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.22em]" style={{ color: "var(--cyan)" }}>
          <Newspaper className="w-3.5 h-3.5" /> Journalist Angle
        </div>
        <p className="text-[13px] text-foreground/90 leading-relaxed">{angle}</p>
      </div>
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
        <span className="text-[10.5px] font-mono uppercase tracking-wider text-muted-foreground">
          <span className="px-2 py-0.5 rounded-md mr-1" style={{ background: `${SENTIMENT_COLOR[signal.sentiment]}22`, color: SENTIMENT_COLOR[signal.sentiment] }}>{signal.sentiment}</span>
          ID {signal.id.slice(0, 12)}
        </span>
        <a
          href={shareHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border border-cyan/40 text-cyan hover:bg-cyan/10 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" /> Share on X
        </a>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  accent,
  bar,
  tone,
}: {
  label: string;
  value: string;
  accent?: boolean;
  bar?: number;
  tone?: string;
}) {
  const color = tone ?? "var(--cyan)";
  return (
    <div className="rounded-lg bg-secondary/40 border border-border p-2.5 space-y-1.5">
      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`text-lg font-display font-semibold tabular-nums ${accent ? "text-glow-cyan" : ""}`}
        style={accent && tone ? { color } : undefined}
      >
        {value}
      </div>
      {typeof bar === "number" && (
        <div className="h-1.5 rounded-full bg-border/60 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.max(0, Math.min(100, bar))}%`,
              background: `linear-gradient(90deg, ${color}aa, ${color})`,
              boxShadow: `0 0 6px ${color}88`,
            }}
          />
        </div>
      )}
    </div>
  );
}
