import { motion, AnimatePresence } from "framer-motion";
import { X, Share2 } from "lucide-react";
import type { Signal } from "@/lib/sim-data";
import { INTENSITY_COLOR } from "@/lib/sim-data";

function intensityTone(intensity: Signal["intensity"]): string {
  if (intensity === "critical") return "var(--rose-signal)";
  if (intensity === "high") return "var(--amber-signal)";
  if (intensity === "medium") return "var(--cyan)";
  return "var(--emerald-signal)";
}

/** Only show metrics we actually have — never invent posts / engagement / velocity. */
function realStats(signal: Signal): Array<{
  label: string;
  value: string;
  bar?: number;
  tone?: string;
  accent?: boolean;
}> {
  const out: Array<{
    label: string;
    value: string;
    bar?: number;
    tone?: string;
    accent?: boolean;
  }> = [];

  if (typeof signal.posts === "number" && signal.posts > 0) {
    out.push({ label: "Sample size", value: signal.posts.toLocaleString() });
  }
  if (
    typeof signal.engagement === "number" &&
    signal.engagement > 0 &&
    signal.engagement !== signal.posts
  ) {
    out.push({ label: "Engagement", value: signal.engagement.toLocaleString() });
  }
  if (signal.divergenceKnown === true && typeof signal.divergence === "number") {
    const pct =
      signal.divergence > 1
        ? Math.round(signal.divergence)
        : Math.round(signal.divergence * 100);
    if (pct >= 0 && pct <= 100) {
      out.push({
        label: "Divergence",
        value: `${pct}%`,
        accent: true,
        bar: pct,
        tone:
          pct > 50
            ? "var(--rose-signal)"
            : pct > 25
              ? "var(--amber-signal)"
              : "var(--emerald-signal)",
      });
    }
  }
  if (typeof signal.velocity === "number" && signal.velocity !== 0) {
    out.push({
      label: "Velocity",
      value: `${signal.velocity > 0 ? "+" : ""}${Math.round(signal.velocity)}%`,
      accent: signal.velocity > 50,
      bar: Math.max(0, Math.min(100, Math.abs(Math.round(signal.velocity)))),
      tone: signal.velocity > 50 ? "var(--cyan)" : "var(--muted-foreground)",
    });
  }
  return out;
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
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md grid place-items-end sm:place-items-center p-0 sm:p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong rounded-t-3xl sm:rounded-3xl max-w-3xl w-full p-5 sm:p-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pb-6 relative max-h-[92vh] sm:max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors z-10 min-h-[40px] min-w-[40px] touch-manipulation"
            >
              <X className="w-4 h-4" />
            </button>

            <Header signal={signal} />

            {(() => {
              const stats = realStats(signal);
              if (!stats.length) {
                return (
                  <p className="text-[12px] font-mono text-muted-foreground mb-5 rounded-lg border border-border/70 bg-secondary/30 px-3 py-2.5">
                    Awaiting metric aggregation for this map point — sample headline only. Open the
                    topic page for full briefing scores when available.
                  </p>
                );
              }
              return (
                <div
                  className={`grid gap-2.5 mb-5 ${
                    stats.length === 1
                      ? "grid-cols-1"
                      : stats.length === 2
                        ? "grid-cols-2"
                        : stats.length === 3
                          ? "grid-cols-2 md:grid-cols-3"
                          : "grid-cols-2 md:grid-cols-4"
                  }`}
                >
                  {stats.map((s) => (
                    <Stat key={s.label} {...s} />
                  ))}
                </div>
              );
            })()}

            {/* Real excerpt only — no invented citizen/official templates */}
            {(signal.excerpt?.trim() || signal.headline?.trim()) && (
              <div className="rounded-xl border border-border bg-secondary/30 p-3.5 mb-5 space-y-1.5">
                <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-cyan">
                  Sample brief
                </div>
                <p className="text-[13.5px] text-foreground/90 leading-relaxed">
                  {signal.excerpt?.trim() || signal.headline}
                </p>
              </div>
            )}

            <FooterShare signal={signal} />
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
          {signal.region}
          {signal.source ? ` · ${signal.source}` : ""}
        </span>
      </div>
      <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan mb-1">
        {signal.topic}
        {signal.sentiment ? ` · ${signal.sentiment}` : ""}
      </div>
      <h2 className="text-xl sm:text-2xl font-display font-semibold leading-tight">
        {signal.headline}
      </h2>
    </div>
  );
}

function FooterShare({ signal }: { signal: Signal }) {
  const shareUrl = typeof window !== "undefined" ? window.location.href : "https://elenchos.live";
  const shareText = `${signal.topic}: ${signal.headline} via @elenchospulse`;
  const shareHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
      <span className="text-[10.5px] font-mono uppercase tracking-wider text-muted-foreground truncate">
        Map signal · directional sample
      </span>
      <a
        href={shareHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border border-cyan/40 text-cyan hover:bg-cyan/10 transition-colors min-h-[36px] touch-manipulation shrink-0"
      >
        <Share2 className="w-3.5 h-3.5" /> Share on X
      </a>
    </div>
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
        className={`text-lg font-display font-semibold tabular-nums ${accent ? "text-glow-cyan" : "text-cyan"}`}
        style={tone ? { color } : { color: "var(--cyan)" }}
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
            }}
          />
        </div>
      )}
    </div>
  );
}
