import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Radio,
  Activity,
  Search,
  Sparkles,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Info,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import {
  fetchTopicComparison,
  isExpired,
  type TopicComparison,
} from "@/lib/topic-comparisons";
import { triggerCompareRun } from "@/lib/compare-dispatch.functions";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare — Elenchos" },
      {
        name: "description",
        content:
          "Search any topic and see how citizen voice compares with traditional sources — polls, academics, government, mainstream media.",
      },
      { property: "og:title", content: "Compare — Elenchos" },
      {
        property: "og:description",
        content:
          "Where mainstream framing and citizen conversation diverge, on any topic.",
      },
      { property: "og:url", content: "https://elenchos.live/compare" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/compare" }],
  }),

  component: ComparePage,
});

const SUGGESTIONS = [
  "Arab–Israeli normalization",
  "Iran protests and the regime",
  "Lebanon's economic collapse",
  "Gulf labor reform",
  "Gaza ceasefire negotiations",
  "Saudi Vision 2030",
];

type LoadState =
  | { kind: "idle" }
  | { kind: "loading"; topic: string }
  | { kind: "ready"; topic: string; data: TopicComparison }
  | { kind: "missing"; topic: string }
  | { kind: "dispatched"; topic: string; message: string }
  | { kind: "error"; topic: string; message: string };

function ComparePage() {
  const dispatchFn = useServerFn(triggerCompareRun);
  const [state, setState] = useState<LoadState>({ kind: "idle" });

  const lookup = async (topic: string) => {
    const t = topic.trim();
    if (t.length < 2) return;
    setState({ kind: "loading", topic: t });
    try {
      const row = await fetchTopicComparison(t);
      if (row) {
        setState({ kind: "ready", topic: t, data: row });
      } else {
        setState({ kind: "missing", topic: t });
      }
    } catch (e) {
      setState({ kind: "error", topic: t, message: (e as Error).message });
    }
  };

  const dispatch = useMutation({
    mutationFn: (topic: string) => dispatchFn({ data: { topic } }),
    onSuccess: (res, topic) => {
      if (res.ok) {
        setState({ kind: "dispatched", topic, message: res.message });
      } else {
        setState({ kind: "error", topic, message: res.message });
      }
    },
  });

  // Auto-poll Supabase for fresh results after a dispatch (every 10s, up to ~3min).
  useEffect(() => {
    if (state.kind !== "dispatched") return;
    let cancelled = false;
    const topic = state.topic;
    const startedAt = Date.now();
    const MAX_MS = 3 * 60 * 1000;
    const poll = async () => {
      if (cancelled) return;
      try {
        const row = await fetchTopicComparison(topic);
        if (cancelled) return;
        if (row && !isExpired(row)) {
          const generated = row.generated_at ? new Date(row.generated_at).getTime() : 0;
          // Only consider it "fresh" if generated after the dispatch started.
          if (!generated || generated >= startedAt - 30_000) {
            setState({ kind: "ready", topic, data: row });
            return;
          }
        }
      } catch {}
      if (Date.now() - startedAt < MAX_MS && !cancelled) {
        setTimeout(poll, 10_000);
      }
    };
    const t = setTimeout(poll, 8_000);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [state]);

  const currentTopic = state.kind !== "idle" ? state.topic : "";

  return (
    <div className="min-h-screen relative flex flex-col">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1400px] mx-auto w-full px-6 py-8 space-y-8 relative flex-1">
        <div className="rounded-xl border border-amber-signal/40 bg-amber-signal/10 px-4 py-2.5 text-[12px] font-mono text-amber-signal flex items-start gap-2">
          <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-amber-signal pulse-dot shrink-0" />
          <span className="text-foreground/80">
            Real public posts analyzed via our system. Citizen views are
            high-level paraphrases only. Samples can be limited due to
            regional factors.
          </span>
        </div>


        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.28em] text-cyan">
            <span className="w-1 h-3.5 bg-cyan rounded-sm" />
            Compare · On-Demand Narrative Gap
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-semibold tracking-tight leading-[1]">
            Search any topic. See the gap.
          </h1>
          <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
            Enter a topic with enough public discourse. Elenchos pulls signals
            from public conversation and contrasts them with traditional sources —
            polls, academics, government statements, mainstream media — then
            quantifies the divergence.
          </p>
        </header>

        <SearchBar
          onSubmit={lookup}
          loading={state.kind === "loading" || dispatch.isPending}
          initial={currentTopic}
        />

        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground self-center mr-1">
            Try
          </span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => lookup(s)}
              disabled={state.kind === "loading" || dispatch.isPending}
              className="text-xs font-mono px-2.5 py-1 rounded border border-border bg-secondary/30 hover:border-cyan hover:text-cyan transition-colors disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {state.kind === "idle" && <EmptyState key="empty" />}
          {state.kind === "loading" && (
            <LoadingState key="loading" topic={state.topic} />
          )}
          {state.kind === "ready" && (
            <ResultBlock
              key={state.topic}
              topic={state.topic}
              data={state.data}
              onDispatch={() => dispatch.mutate(state.topic)}
              dispatching={dispatch.isPending}
            />
          )}
          {state.kind === "missing" && (
            <MissingState
              key="missing"
              topic={state.topic}
              onDispatch={() => dispatch.mutate(state.topic)}
              dispatching={dispatch.isPending}
            />
          )}
          {state.kind === "dispatched" && (
            <DispatchedState
              key="dispatched"
              topic={state.topic}
              message={state.message}
              onRetry={() => lookup(state.topic)}
            />
          )}
          {state.kind === "error" && (
            <ErrorState
              key="error"
              message={state.message}
              onRetry={() => lookup(state.topic)}
            />
          )}
        </AnimatePresence>
      </main>

      <SiteFooter />
    </div>
  );
}

function SearchBar({
  onSubmit,
  loading,
  initial,
}: {
  onSubmit: (t: string) => void;
  loading: boolean;
  initial: string;
}) {
  const [value, setValue] = useState(initial);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value);
      }}
      className="glass rounded-2xl p-2 flex items-center gap-2 border border-cyan/30"
      style={{
        boxShadow: "0 0 32px color-mix(in oklab, var(--cyan) 12%, transparent)",
      }}
    >
      <Search className="w-5 h-5 ml-3 text-cyan shrink-0" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter a topic — e.g. 'Gulf youth unemployment' or 'Iran sanctions'"
        className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground py-3"
        disabled={loading}
        autoFocus
      />
      <Button
        type="submit"
        disabled={loading || value.trim().length < 2}
        className="bg-cyan text-background hover:bg-cyan/90 font-mono uppercase tracking-[0.18em] text-xs h-10 px-4"
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5" /> Analyze
          </>
        )}
      </Button>
    </form>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="glass rounded-2xl p-10 text-center space-y-2 border-dashed"
    >
      <Sparkles className="w-6 h-6 text-cyan mx-auto" />
      <div className="text-sm text-muted-foreground">
        Enter a topic above to see the citizen-vs-official narrative gap.
      </div>
    </motion.div>
  );
}

function LoadingState({ topic }: { topic: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="glass rounded-2xl p-6 space-y-3"
    >
      <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan flex items-center gap-2">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching cached
        analysis
      </div>
      <div className="text-sm text-muted-foreground">
        Looking up the latest run for{" "}
        <span className="text-foreground font-medium">"{topic}"</span>…
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-lg bg-secondary/40 animate-pulse border border-border"
          />
        ))}
      </div>
    </motion.div>
  );
}

function MissingState({
  topic,
  onDispatch,
  dispatching,
}: {
  topic: string;
  onDispatch: () => void;
  dispatching: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="glass rounded-2xl p-6 space-y-3"
    >
      <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-amber-signal flex items-center gap-2">
        <Info className="w-3.5 h-3.5" /> No cached analysis
      </div>
      <div className="text-sm text-foreground/85">
        No recent analysis found for{" "}
        <span className="text-foreground font-medium">"{topic}"</span>.
      </div>
      <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
        Trigger a fresh run — Elenchos will pull signals and synthesize them
        with our AI backend (usually 60–120s). Reload after a minute or two to see the
        results.
      </p>
      <Button
        onClick={onDispatch}
        disabled={dispatching}
        className="bg-cyan text-background hover:bg-cyan/90 font-mono uppercase tracking-[0.18em] text-xs h-9 px-4"
      >
        {dispatching ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Dispatching
          </>
        ) : (
          <>
            <RefreshCw className="w-3.5 h-3.5" /> Run fresh analysis
          </>
        )}
      </Button>
    </motion.div>
  );
}

function DispatchedState({
  topic,
  message,
  onRetry,
}: {
  topic: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="glass rounded-2xl p-6 space-y-3 border border-cyan/30"
    >
      <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan flex items-center gap-2">
        <RefreshCw className="w-3.5 h-3.5" /> Fresh run dispatched
      </div>
      <div className="text-sm text-foreground/85">{message}</div>
      <div className="text-xs text-muted-foreground">
        Topic: <span className="text-foreground">"{topic}"</span>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={onRetry}
        className="font-mono uppercase tracking-[0.18em] text-xs"
      >
        Reload results
      </Button>
    </motion.div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="glass rounded-2xl p-6 space-y-3 border"
      style={{
        borderColor: "color-mix(in oklab, var(--rose-signal) 45%, transparent)",
      }}
    >
      <div
        className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em]"
        style={{ color: "var(--rose-signal)" }}
      >
        <AlertTriangle className="w-3.5 h-3.5" /> Something went wrong
      </div>
      <div className="text-sm text-muted-foreground">{message}</div>
      <Button size="sm" variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────
// Results — bound to real topic_comparisons row
// ────────────────────────────────────────────────────────────

function gapTone(score: number): { color: string; label: string } {
  if (score >= 65)
    return { color: "var(--rose-signal)", label: "Severe gap" };
  if (score >= 40)
    return { color: "var(--amber-signal)", label: "Moderate gap" };
  return { color: "var(--emerald-signal)", label: "Aligned" };
}

function ResultBlock({
  topic,
  data,
  onDispatch,
  dispatching,
}: {
  topic: string;
  data: TopicComparison;
  onDispatch: () => void;
  dispatching: boolean;
}) {
  const score = Math.max(0, Math.min(100, data.divergence_score ?? 0));
  const tone = gapTone(score);
  const citizenSample = data.sample_size?.citizen ?? 0;
  const officialSample = data.sample_size?.official ?? 0;
  const expired = isExpired(data);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Small-sample warning — identical generic copy on every topic */}
      <div className="rounded-xl border border-amber-signal/30 bg-amber-signal/[0.06] px-4 py-3 text-[12px] font-mono text-foreground/80 leading-relaxed flex gap-2.5 items-start">
        <Info className="w-4 h-4 text-amber-signal mt-0.5 shrink-0" />
        <span>
          Based on{" "}
          <span className="text-foreground font-medium tabular-nums">
            {citizenSample}
          </span>{" "}
          recent public posts after authenticity &amp; quality filters. Samples
          can be smaller than traditional polls due to regional factors, speech
          realities, and quality/spam filters. All citizen views are paraphrased
          aggregates — no usernames, direct quotes, or individual accounts are
          stored. Interpret with appropriate caution. See methodology in About.
        </span>
      </div>

      {/* Hero: divergence score + summary */}
      <div className="glass rounded-2xl p-5 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5 items-center">
        <div
          className="relative w-32 h-32 rounded-full grid place-items-center mx-auto md:mx-0"
          style={{
            background: `conic-gradient(${tone.color} ${score * 3.6}deg, var(--border) 0deg)`,
          }}
        >
          <div className="absolute inset-2 rounded-full bg-background grid place-items-center">
            <div className="text-center">
              <div
                className="text-5xl font-display font-semibold tabular-nums leading-none"
                style={{ color: tone.color }}
              >
                {score}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mt-1">
                /100
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-[0.18em] border"
              style={{
                color: tone.color,
                borderColor: `${tone.color}55`,
                background: `${tone.color}12`,
              }}
            >
              {tone.label}
            </span>
            {expired && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-mono uppercase tracking-wider border border-amber-signal/40 text-amber-signal bg-amber-signal/10">
                Stale cache
              </span>
            )}
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">
            {data.topic || topic}
          </h2>
          {data.narrative_gap_overview && (
            <p className="text-sm text-foreground/85 leading-relaxed max-w-3xl">
              {data.narrative_gap_overview}
            </p>
          )}
          <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground pt-1">
            <span className="inline-flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan" /> Citizen sample:{" "}
              <span className="text-foreground/90 tabular-nums">
                {citizenSample}
              </span>
            </span>
            <span className="inline-flex items-center gap-1">
              · Official:{" "}
              <span className="text-foreground/90 tabular-nums">
                {officialSample}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Two narrative panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <NarrativePanel
          tone="cyan"
          icon={<Radio className="w-3.5 h-3.5" />}
          label="Citizen Narrative"
          sub="Real conversation · engagement-weighted · paraphrased"
          summary={data.citizen_narrative?.summary}
          chips={data.citizen_narrative?.key_themes ?? []}
          chipLabel="Key themes"
        />
        <NarrativePanel
          tone="muted"
          icon={<Building2 className="w-3.5 h-3.5" />}
          label="Official / Mainstream Narrative"
          sub="Polls · Academics · Government · Mainstream Media"
          summary={data.official_mainstream_narrative?.summary}
          chips={data.official_mainstream_narrative?.key_claims ?? []}
          chipLabel="Key claims"
        />
      </div>

      {/* Key conflicts */}
      {data.key_conflicts && data.key_conflicts.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan flex items-center gap-2">
            <Sparkles className="w-3 h-3" /> Key Conflicts
            <span className="text-muted-foreground normal-case tracking-wider">
              · {data.key_conflicts.length} issues
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {data.key_conflicts.map((c, i) => (
              <ConflictRow key={i} c={c} />
            ))}
          </div>
        </div>
      )}

      {/* Bias notes */}
      {data.bias_notes && (
        <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-1.5">
          <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-amber-signal flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3" /> Bias &amp; sampling notes
          </div>
          <p className="text-[12.5px] text-foreground/80 leading-relaxed">
            {data.bias_notes}
          </p>
        </div>
      )}

      {/* Meta footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border text-[11px] font-mono text-muted-foreground">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span>
            Generated:{" "}
            <span className="text-foreground/90">
              {data.generated_at
                ? new Date(data.generated_at).toLocaleString()
                : "—"}
            </span>
          </span>
          {data.expires_at && (
            <span>
              Cached until:{" "}
              <span className="text-foreground/90">
                {new Date(data.expires_at).toLocaleString()}
              </span>
            </span>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onDispatch}
          disabled={dispatching}
          className="font-mono uppercase tracking-[0.18em] text-[11px] h-8"
        >
          {dispatching ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" /> Dispatching
            </>
          ) : (
            <>
              <RefreshCw className="w-3 h-3" /> Run fresh analysis
            </>
          )}
        </Button>
      </div>
    </motion.section>
  );
}

function NarrativePanel({
  tone,
  icon,
  label,
  sub,
  summary,
  chips,
  chipLabel,
}: {
  tone: "cyan" | "muted";
  icon: React.ReactNode;
  label: string;
  sub: string;
  summary?: string;
  chips: string[];
  chipLabel: string;
}) {
  const color = tone === "cyan" ? "var(--cyan)" : "var(--muted-foreground)";
  return (
    <div
      className="rounded-2xl border p-4 bg-secondary/30 space-y-3"
      style={{
        borderColor: tone === "cyan" ? "var(--cyan)" : "var(--border)",
      }}
    >
      <div>
        <div
          className="text-[10.5px] font-mono uppercase tracking-[0.22em] inline-flex items-center gap-1.5"
          style={{ color }}
        >
          {icon} {label}
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>
      </div>
      {summary && (
        <p className="text-sm text-foreground/85 leading-relaxed">{summary}</p>
      )}
      {chips.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            {chipLabel}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {chips.map((c, i) => (
              <span
                key={i}
                className="inline-flex items-center text-[11px] font-mono px-2 py-0.5 rounded-full border"
                style={{
                  background: `${color}10`,
                  color,
                  borderColor: `${color}40`,
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ConflictRow({ c }: { c: { issue?: string; citizen_view?: string; official_view?: string; gap?: string } }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/20 overflow-hidden">
      {c.issue && (
        <div className="px-3 py-2 text-[12px] font-display font-semibold text-foreground/95 border-b border-border bg-secondary/40">
          {c.issue}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-cyan">
            Citizen view
          </div>
          <div
            className="text-[13px] leading-relaxed rounded-lg px-3 py-2 border"
            style={{
              background: "color-mix(in oklab, var(--cyan) 8%, transparent)",
              borderColor: "color-mix(in oklab, var(--cyan) 30%, transparent)",
            }}
          >
            {c.citizen_view ?? "—"}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            Official view
          </div>
          <div className="text-[13px] leading-relaxed rounded-lg px-3 py-2 border border-border bg-background/40">
            {c.official_view ?? "—"}
          </div>
        </div>
      </div>
      {c.gap && (
        <div className="px-3 pb-3 text-[12px] text-foreground/75 leading-relaxed">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-signal mr-1.5">
            Gap
          </span>
          {c.gap}
        </div>
      )}
    </div>
  );
}
