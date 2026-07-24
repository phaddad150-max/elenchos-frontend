import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Brain,
  ChevronDown,
  Lightbulb,
  MessageSquare,
  Radio,
  Sparkles,
  Share2,
  TrendingDown,
  TrendingUp,
  Minus,
  Trophy,
  X,
} from "lucide-react";
import { buildInsightShareText, buildTwitterShareHref } from "@/lib/share-insight";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  loadCuratedQaPairs,
  loadCuratedTopicInsights,
  loadTopicSnapshot,
  loadTopicHistory,
  getNarrativeGapFrames,
  type CuratedQaPair,
  type CuratedTopicInsights,
  type QuestionAnalysis,
  type TopicHistoryPoint,
  type TopicSnapshot,
} from "@/lib/dashboard-data";
import {
  buildInsightCards,
  historySentimentSeries,
  sortThreads,
  type InsightCardModel,
} from "./mappers";
import { NarrativeGapPanel } from "./NarrativeGapPanel";
import {
  confidenceColor,
  divergenceColor,
  formatDelta,
  prettySegmentName,
  segScore,
  sentimentColor,
  timeAgo,
} from "./utils";
import { DataFreshnessBar } from "@/components/DataFreshnessBar";
import { clearDashboardCaches } from "@/lib/data-cache";

type LiveData = TopicSnapshot;

const BUNDLE_TIMEOUT_MS = 20_000;

function useTopicBundle(rootKey: string) {
  const [data, setData] = useState<LiveData | null>(null);
  const [curated, setCurated] = useState<CuratedTopicInsights | null>(null);
  const [qa, setQa] = useState<CuratedQaPair[]>([]);
  const [history, setHistory] = useState<TopicHistoryPoint[]>([]);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setLoadError(null);

    const timeoutId = window.setTimeout(() => {
      if (!cancelled) {
        setLoadError("Loading timed out — retry or refresh the page.");
        setReady(true);
      }
    }, BUNDLE_TIMEOUT_MS);

    // attempt > 0 means user hit refresh — force re-fetch so new Supabase rows appear.
    const force = attempt > 0;
    Promise.allSettled([
      loadTopicSnapshot(rootKey, force),
      loadCuratedTopicInsights(rootKey, "wow", force),
      loadCuratedQaPairs(rootKey, force),
      loadTopicHistory(rootKey, 8, force),
    ])
      .then((results) => {
        if (cancelled) return;
        const snap = results[0].status === "fulfilled" ? results[0].value : null;
        const ins = results[1].status === "fulfilled" ? results[1].value : null;
        const pairs = results[2].status === "fulfilled" ? results[2].value : [];
        const hist = results[3].status === "fulfilled" ? results[3].value : [];
        setData(snap);
        setCurated(ins);
        setQa(pairs ?? []);
        setHistory(hist ?? []);

        const rejected = results.filter((r) => r.status === "rejected");
        const hasCoreData = Boolean(snap || ins || (pairs?.length ?? 0) > 0);
        if (rejected.length > 0) {
          console.warn("Topic bundle partial failure", rejected);
          if (!hasCoreData) {
            setLoadError("Some briefing data could not be loaded.");
          }
        }
      })
      .catch((e) => {
        if (cancelled) return;
        console.error("Topic bundle load failed", e);
        setLoadError("Could not load intelligence briefing.");
      })
      .finally(() => {
        if (!cancelled) {
          clearTimeout(timeoutId);
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [rootKey, attempt]);

  const retry = () => setAttempt((n) => n + 1);

  return { data, curated, qa, history, ready, loadError, retry };
}

export function TopicAnalysisPage({
  rootKey,
  headerLabel,
}: {
  rootKey: string;
  headerLabel: string;
}) {
  const { data, curated, qa, history, ready, loadError, retry } = useTopicBundle(rootKey);
  const [rawOpen, setRawOpen] = useState(false);
  const [pickedCard, setPickedCard] = useState<InsightCardModel | null>(null);
  const [pickedThread, setPickedThread] = useState<{
    theme?: string;
    headline?: string;
    summary?: string;
    confidence?: string;
    divergence_note?: string;
  } | null>(null);
  const [chartsOpen, setChartsOpen] = useState(false); // mobile default collapsed; desktop always shows
  const [curatedExpanded, setCuratedExpanded] = useState(false);

  const curatedStale = useMemo(() => {
    if (!curated?.generated_at || !data?.last_updated) return false;
    const pipelineAt = data.pipeline_last_updated ?? data.last_updated;
    return new Date(curated.generated_at).getTime() < new Date(pipelineAt).getTime();
  }, [curated?.generated_at, data?.last_updated, data?.pipeline_last_updated]);

  const score = data?.overall_sentiment && typeof data.overall_sentiment === "object"
    ? (data.overall_sentiment.score ?? 0)
    : 0;
  const label = data?.overall_sentiment && typeof data.overall_sentiment === "object"
    ? (data.overall_sentiment.label ?? "—")
    : "—";
  const trend = data?.overall_sentiment && typeof data.overall_sentiment === "object"
    ? (data.overall_sentiment.trend ?? "")
    : "";
  const divergence = typeof data?.divergence_score === "number" ? Math.round(data.divergence_score) : null;
  const sample = data?.sample_size?.toLocaleString() ?? "—";
  const gapFrames = useMemo(() => getNarrativeGapFrames(data), [data]);

  const insightCards = useMemo(
    () => buildInsightCards(qa, data, data?.question_analysis ?? []),
    [qa, data],
  );
  const threads = useMemo(() => sortThreads(curated?.insight_threads ?? []), [curated]);
  const sentimentSeries = useMemo(() => historySentimentSeries(history), [history]);
  const segments = useMemo(
    () => Object.entries(data?.segmented_sentiment ?? {}).map(([k, v]) => ({
      name: prettySegmentName(k),
      score: segScore(v as number | { score?: number }),
    })),
    [data],
  );
  const questionHeat = useMemo(
    () => (data?.question_analysis ?? []).map((q, i) => ({
      name: `Q${i + 1}`,
      score: q.sentiment_score ?? 50,
      full: (q.question ?? "").slice(0, 60),
    })),
    [data],
  );

  if (!ready) {
    return (
      <section className="glass rounded-2xl p-8 border border-cyan/20 text-sm font-mono text-muted-foreground text-center">
        Loading intelligence briefing…
      </section>
    );
  }

  if (!data) {
    return (
      <section className="glass rounded-2xl p-6 border border-amber-signal/30 space-y-3">
        <h3 className="font-display font-semibold">{headerLabel}</h3>
        <p className="text-sm text-muted-foreground">
          {loadError ?? "No live snapshot yet for this topic."}
        </p>
        {loadError && (
          <button
            type="button"
            onClick={retry}
            className="text-[11px] font-mono uppercase tracking-wider text-cyan hover:underline"
          >
            Retry loading
          </button>
        )}
      </section>
    );
  }

  const TrendIcon = /increas|improv|up|posit/i.test(trend)
    ? TrendingUp
    : /decreas|declin|down|neg/i.test(trend)
      ? TrendingDown
      : Minus;

  const handleRefresh = async () => {
    clearDashboardCaches();
    retry();
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {loadError && (
        <div className="rounded-xl border border-amber-signal/40 bg-amber-signal/[0.08] px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-foreground/90">{loadError}</span>
          <button
            type="button"
            onClick={retry}
            className="text-[11px] font-mono uppercase tracking-wider text-cyan hover:underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {curatedStale && (
        <div className="rounded-xl border border-amber-signal/35 bg-amber-signal/[0.06] px-4 py-3 flex items-start gap-2 text-sm text-foreground/90">
          <AlertTriangle className="w-4 h-4 text-amber-signal shrink-0 mt-0.5" />
          <span>
            Curated synthesis is older than the latest snapshot — run Pass 2 curation to refresh headlines and insight cards.
          </span>
        </div>
      )}

      {/* Intelligence Briefing — mobile: stacked panel; desktop: original inline row */}
      <div className="md:hidden -mx-3 px-3 py-2">
        <div className="glass rounded-xl border border-cyan/30 p-4 space-y-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyan">{headerLabel}</div>
            <div className="font-display font-semibold text-xl tracking-tight">Intelligence Briefing</div>
          </div>
          <DataFreshnessBar
            sourceUpdatedAt={data.last_updated ?? curated?.generated_at}
            onRefresh={handleRefresh}
          />
          <div className="grid grid-cols-3 divide-x divide-border/60 border-y border-border/60 py-3">
            <HeroMetric label="Sentiment" value={String(score)} sub={label} color={sentimentColor(score)} mobile />
            <HeroMetric
              label="Divergence"
              value={divergence !== null ? String(divergence) : "—"}
              sub="Citizen vs official"
              color={divergence !== null ? divergenceColor(divergence) : "var(--muted-foreground)"}
              mobile
            />
            <HeroMetric label="Sample" value={sample} sub="posts" color="var(--cyan)" mobile />
          </div>
          <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-muted-foreground">
            <span suppressHydrationWarning>{timeAgo(data.last_updated)}</span>
            <div className="flex items-center gap-2 shrink-0">
              {curated?.hero_confidence && (
                <span
                  className="px-1.5 py-0.5 rounded border uppercase"
                  style={{
                    color: confidenceColor(curated.hero_confidence),
                    borderColor: `${confidenceColor(curated.hero_confidence)}44`,
                  }}
                >
                  {curated.hero_confidence}
                </span>
              )}
              <TrendIcon className="w-5 h-5" style={{ color: sentimentColor(score) }} />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block sticky top-0 z-30 -mx-3 sm:-mx-0 px-3 sm:px-0 py-2 bg-background/85 backdrop-blur-xl border-b border-border/60">
        <div className="glass rounded-xl border border-cyan/30 p-3 sm:p-4 flex flex-wrap items-center gap-3 sm:gap-5">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyan">{headerLabel}</div>
            <div className="font-display font-semibold text-lg sm:text-xl truncate">Intelligence Briefing</div>
          </div>
          <DataFreshnessBar
            sourceUpdatedAt={data.last_updated ?? curated?.generated_at}
            onRefresh={handleRefresh}
            className="shrink-0"
          />
          <HeroMetric label="Sentiment" value={String(score)} sub={label} color={sentimentColor(score)} />
          <HeroMetric
            label="Divergence"
            value={divergence !== null ? String(divergence) : "—"}
            sub="Citizen vs official"
            color={divergence !== null ? divergenceColor(divergence) : "var(--muted-foreground)"}
          />
          <HeroMetric label="Sample" value={sample} sub="posts" color="var(--cyan)" />
          <div className="text-[10px] font-mono text-muted-foreground">
            <span suppressHydrationWarning>{timeAgo(data.last_updated)}</span>
            {curated?.hero_confidence && (
              <span
                className="ml-2 px-1.5 py-0.5 rounded border uppercase"
                style={{
                  color: confidenceColor(curated.hero_confidence),
                  borderColor: `${confidenceColor(curated.hero_confidence)}44`,
                }}
              >
                {curated.hero_confidence}
              </span>
            )}
          </div>
          <TrendIcon className="w-5 h-5 shrink-0" style={{ color: sentimentColor(score) }} />
        </div>
      </div>

      {/* Citizen vs official/media — visual gap (primary scan; long prose collapsed) */}
      <NarrativeGapPanel
        topicLabel={headerLabel}
        score={gapFrames.score ?? divergence}
        citizenFrame={gapFrames.citizenFrame}
        officialMediaFrame={gapFrames.officialMediaFrame}
        gapHeadline={gapFrames.gapHeadline}
        fullOverview={gapFrames.fullOverview}
        sentimentScore={score}
      />

      {curated?.hero_headline && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-cyan/35 bg-cyan/[0.06] p-4 sm:p-5 space-y-2"
        >
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-cyan">
            <Sparkles className="w-3.5 h-3.5" /> Curated synthesis
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-semibold leading-tight">{curated.hero_headline}</h2>
          {curated.hero_summary && (
            <>
              <p
                className={`text-sm text-foreground/90 leading-relaxed ${
                  curatedExpanded ? "" : "line-clamp-2 md:line-clamp-2"
                }`}
              >
                {curated.hero_summary}
              </p>
              {/* Mobile: explicit read more when clamped */}
              {curated.hero_summary.length > 100 && (
                <button
                  type="button"
                  onClick={() => setCuratedExpanded((v) => !v)}
                  className="md:hidden text-[11px] font-mono text-cyan hover:underline min-h-[40px] touch-manipulation"
                >
                  {curatedExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </>
          )}
          <div className="flex flex-wrap gap-2 text-[10px] font-mono">
            {formatDelta(curated.sentiment_delta) && (
              <span className="px-2 py-0.5 rounded-full border border-border">Sentiment {formatDelta(curated.sentiment_delta)}</span>
            )}
            {formatDelta(curated.divergence_delta) && (
              <span className="px-2 py-0.5 rounded-full border border-border">Divergence {formatDelta(curated.divergence_delta)}</span>
            )}
            {curated.comparison_window && (
              <span className="text-muted-foreground uppercase">vs {curated.comparison_window}</span>
            )}
          </div>
        </motion.div>
      )}

      {rootKey === "fifa-world-cup-2026" && (
        <Link
          to="/trackers/football"
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 rounded-xl border border-emerald-signal/35 bg-emerald-signal/[0.06] px-4 py-3 hover:border-emerald-signal/55 active:bg-emerald-signal/10 transition-colors group touch-manipulation"
        >
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.16em] sm:tracking-[0.18em] text-emerald-signal">
            <Trophy className="w-4 h-4 shrink-0" />
            <span>Gladiator Podium · Football Index</span>
          </div>
          <span className="text-xs text-muted-foreground group-hover:text-foreground">Fan rankings by player discourse →</span>
        </Link>
      )}

      {/* Narrative threads — tappable; full text in sheet/modal */}
      {threads.length > 0 && (
        <section className="space-y-3">
          <SectionLabel icon={<Lightbulb className="w-3.5 h-3.5" />} title="Narrative Threads" sub="Tap for full text" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {threads.map((t, i) => (
              <button
                key={`${t.theme}-${i}`}
                type="button"
                onClick={() => setPickedThread(t)}
                className="text-left rounded-xl border border-border bg-secondary/20 p-4 space-y-1.5 hover:border-cyan/40 active:bg-secondary/40 transition-colors touch-manipulation min-h-[44px]"
                style={{ borderLeft: `3px solid ${confidenceColor(t.confidence)}` }}
              >
                <div className="flex justify-between gap-2 text-[10px] font-mono uppercase text-muted-foreground">
                  <span>{t.theme ?? "Thread"}</span>
                  {t.confidence && <span style={{ color: confidenceColor(t.confidence) }}>{t.confidence}</span>}
                </div>
                {t.headline && <h4 className="font-display font-semibold text-sm">{t.headline}</h4>}
                {t.summary && (
                  <p className="text-[13px] text-foreground/85 leading-relaxed line-clamp-2 md:line-clamp-2">
                    {t.summary}
                  </p>
                )}
                <span className="text-[10px] font-mono text-cyan md:hidden">Read full →</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Insight cards — mobile: substance-first chip score; desktop: existing score-hero layout */}
      {insightCards.length > 0 && (
      <section className="space-y-3">
        <SectionLabel
          icon={<Brain className="w-3.5 h-3.5" />}
          title="Key Insights"
          sub={`${insightCards.length} · tap to read`}
        />
        {/* Mobile: horizontal snap carousel */}
        <div className="md:hidden flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory custom-scroll">
          {insightCards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => setPickedCard(card)}
              className="snap-center shrink-0 w-[min(100%,20rem)] text-left rounded-xl border border-border bg-background/50 p-4 space-y-2.5 hover:border-cyan/40 active:scale-[0.99] transition-all touch-manipulation"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-display font-semibold text-[15px] leading-snug flex-1">
                  {card.title}
                </h4>
                <span
                  className="shrink-0 text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded border"
                  style={{
                    color: sentimentColor(card.score),
                    borderColor: `${sentimentColor(card.score)}55`,
                    background: `${sentimentColor(card.score)}14`,
                  }}
                  title="Calculated sentiment metric (not a citizen insight)"
                >
                  {card.score}
                </span>
              </div>
              {card.summary && (
                <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-3">
                  {card.summary}
                </p>
              )}
              <span className="text-[10px] font-mono text-cyan">Open full insight →</span>
            </button>
          ))}
        </div>
        {/* Desktop: original grid with score emphasis */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-3">
          {insightCards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => setPickedCard(card)}
              className="text-left rounded-xl border border-border bg-background/40 hover:border-cyan/40 p-4 space-y-2 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-lg font-display font-semibold tabular-nums"
                  style={{ color: sentimentColor(card.score) }}
                >
                  {card.score}
                </span>
                {card.wowDelta != null && card.wowDelta !== 0 && (
                  <span className="text-[10px] font-mono text-muted-foreground">WoW {formatDelta(card.wowDelta)}</span>
                )}
              </div>
              <h4 className="font-display font-semibold text-sm leading-snug line-clamp-2">{card.title}</h4>
              <p className="text-[12px] text-muted-foreground line-clamp-2">{card.summary}</p>
              <div className="flex flex-wrap gap-1">
                {card.audiences.map((a) => (
                  <span key={a} className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-secondary border border-border">
                    {a}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>
      )}

      {/* Visual analytics — collapsed by default on mobile only */}
      <section className="space-y-3">
        <button
          type="button"
          onClick={() => setChartsOpen((v) => !v)}
          className="md:pointer-events-none w-full md:w-auto flex items-center justify-between md:justify-start gap-2 min-h-[44px] md:min-h-0 touch-manipulation"
        >
          <SectionLabel icon={<Radio className="w-3.5 h-3.5" />} title="Visual Analytics" />
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground md:hidden transition-transform ${chartsOpen ? "rotate-180" : ""}`}
          />
        </button>
        <div className={`${chartsOpen ? "grid" : "hidden"} md:grid grid-cols-1 lg:grid-cols-2 gap-4`}>
          <ChartPanel title="Sentiment trend">
            {sentimentSeries.length > 1 ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={sentimentSeries}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <Tooltip contentStyle={{ background: "var(--background)", border: "1px solid var(--border)" }} />
                  <Line type="monotone" dataKey="score" stroke="var(--cyan)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="History populates after multiple snapshot runs" />
            )}
          </ChartPanel>
          <ChartPanel title="Question heatmap">
            {questionHeat.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={questionHeat}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <Tooltip
                    contentStyle={{ background: "var(--background)", border: "1px solid var(--border)" }}
                    formatter={(v) => [v, "Score"]}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.full ?? ""}
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {questionHeat.map((e, i) => (
                      <Cell key={i} fill={sentimentColor(e.score)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </ChartPanel>
          <ChartPanel title="Fan segments">
            {segments.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={segments} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {segments.map((e, i) => (
                      <Cell key={i} fill={sentimentColor(e.score)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </ChartPanel>
          <ChartPanel title="Historical comparison">
            <div className="flex flex-wrap gap-3 p-2">
              <ComparePill label="WoW sentiment" value={formatDelta(curated?.sentiment_delta)} />
              <ComparePill label="WoW divergence" value={formatDelta(curated?.divergence_delta)} />
              <ComparePill label="Window" value={curated?.comparison_window?.toUpperCase() ?? "WOW"} />
              {curated?.evolution_note && (
                <p className="w-full text-[13px] text-muted-foreground leading-relaxed mt-2">
                  {curated.evolution_note}
                </p>
              )}
            </div>
          </ChartPanel>
        </div>
      </section>

      {/* Raw data collapsible */}
      <div className="rounded-xl border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => setRawOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground hover:bg-secondary/30"
        >
          <span className="flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5" /> Raw data & methodology
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${rawOpen ? "rotate-180" : ""}`} />
        </button>
        {rawOpen && (
          <div className="px-4 pb-4 space-y-3 text-sm border-t border-border pt-3">
            <p className="text-muted-foreground text-[12px] leading-relaxed">
              Based on <strong className="text-foreground">{sample}</strong> public posts (paraphrased aggregates only — no usernames or direct quotes stored).
            </p>
            {data.narrative_summary && (
              <div>
                <div className="text-[10px] font-mono uppercase text-cyan mb-1">Full citizen narrative</div>
                <p className="text-foreground/90 text-[13px] leading-relaxed">{data.narrative_summary}</p>
              </div>
            )}
            {gapFrames.fullOverview && (
              <div>
                <div className="text-[10px] font-mono uppercase text-amber-signal mb-1">Full gap overview</div>
                <p className="text-foreground/90 text-[13px] leading-relaxed">{gapFrames.fullOverview}</p>
              </div>
            )}
            {(data.question_analysis ?? []).length > 0 && (
              <div className="grid gap-2 max-h-64 overflow-y-auto custom-scroll">
                {(data.question_analysis as QuestionAnalysis[]).map((q, i) => (
                  <div key={i} className="text-[12px] p-2 rounded border border-border bg-secondary/20">
                    <div className="font-mono text-cyan text-[10px]">Q{i + 1} · {q.sentiment_score}/100</div>
                    <div className="text-muted-foreground mt-0.5">{q.question}</div>
                    {q.summary && <div className="mt-1">{q.summary}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Insight detail: mobile bottom sheet · desktop centered modal */}
      {pickedCard && (
        <DetailOverlay onClose={() => setPickedCard(null)}>
          <div className="text-[10px] font-mono uppercase text-cyan tracking-[0.18em]">Insight detail</div>
          <h3 className="text-xl font-display font-semibold leading-snug">{pickedCard.title}</h3>
          {pickedCard.summary && (
            <p className="text-[15px] sm:text-sm text-foreground/90 leading-relaxed">{pickedCard.summary}</p>
          )}
          {pickedCard.evidence.length > 0 && (
            <ul className="space-y-2 text-[14px] sm:text-[13px]">
              {pickedCard.evidence.map((e, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-cyan font-mono shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span
              className="text-[11px] font-mono px-2 py-1 rounded border"
              style={{
                color: sentimentColor(pickedCard.score),
                borderColor: `${sentimentColor(pickedCard.score)}55`,
              }}
              title="Calculated metric — not the insight itself"
            >
              Metric {pickedCard.score}
              {pickedCard.label ? ` · ${pickedCard.label}` : ""}
            </span>
            {pickedCard.wowDelta != null && pickedCard.wowDelta !== 0 && (
              <span className="text-[11px] font-mono text-muted-foreground">
                WoW {formatDelta(pickedCard.wowDelta)}
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <a
              href={buildTwitterShareHref(
                buildInsightShareText({
                  topicLabel: headerLabel,
                  insightTitle: pickedCard.title,
                  sentimentScore: pickedCard.score,
                  divergenceScore: divergence,
                  divergenceGap: gapFrames.fullOverview,
                  citizenFrame: gapFrames.citizenFrame,
                  officialMediaFrame: gapFrames.officialMediaFrame,
                }),
                typeof window !== "undefined" ? window.location.href : "https://elenchos.live",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 min-h-[48px] sm:min-h-[40px] px-4 rounded-full text-[12px] font-mono border border-cyan/40 text-cyan hover:bg-cyan/10 touch-manipulation"
            >
              <Share2 className="w-3.5 h-3.5" /> Share on X
            </a>
            <button
              type="button"
              onClick={() => setPickedCard(null)}
              className="inline-flex items-center justify-center min-h-[48px] sm:min-h-[40px] px-4 rounded-full text-[12px] font-mono border border-border text-muted-foreground hover:bg-secondary touch-manipulation"
            >
              Close
            </button>
          </div>
        </DetailOverlay>
      )}

      {pickedThread && (
        <DetailOverlay onClose={() => setPickedThread(null)}>
          <div className="text-[10px] font-mono uppercase text-cyan tracking-[0.18em]">
            {pickedThread.theme ?? "Narrative thread"}
          </div>
          {pickedThread.headline && (
            <h3 className="text-xl font-display font-semibold leading-snug">{pickedThread.headline}</h3>
          )}
          {pickedThread.summary && (
            <p className="text-[15px] sm:text-sm text-foreground/90 leading-relaxed">{pickedThread.summary}</p>
          )}
          {pickedThread.divergence_note && (
            <div className="rounded-lg border border-amber-signal/30 bg-amber-signal/[0.06] p-3 text-[13px] leading-relaxed">
              <div className="text-[10px] font-mono uppercase text-amber-signal mb-1">Gap note</div>
              {pickedThread.divergence_note}
            </div>
          )}
          <button
            type="button"
            onClick={() => setPickedThread(null)}
            className="inline-flex items-center justify-center min-h-[48px] sm:min-h-[40px] px-4 rounded-full text-[12px] font-mono border border-border text-muted-foreground hover:bg-secondary touch-manipulation"
          >
            Close
          </button>
        </DetailOverlay>
      )}
    </div>
  );
}

/** Mobile bottom sheet · desktop centered modal — full text always readable */
function DetailOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md"
      onClick={onClose}
      role="presentation"
    >
      {/* Mobile sheet */}
      <div
        className="md:hidden absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-2xl border border-border border-b-0 bg-background shadow-2xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-3 animate-in slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-center pb-1">
          <span className="w-10 h-1 rounded-full bg-border" aria-hidden />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-secondary min-h-[44px] min-w-[44px] grid place-items-center touch-manipulation"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
        {children}
      </div>
      {/* Desktop modal — unchanged centered glass */}
      <div className="hidden md:grid place-items-center p-4 h-full">
        <div
          className="glass-strong rounded-2xl max-w-lg w-full p-5 space-y-3 max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function HeroMetric({
  label,
  value,
  sub,
  color,
  mobile = false,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
  mobile?: boolean;
}) {
  if (mobile) {
    return (
      <div className="text-center px-1 min-w-0">
        <div className="text-[9px] font-mono uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
        <div className="text-2xl font-display font-semibold tabular-nums leading-none mt-1" style={{ color }}>
          {value}
        </div>
        <div className="text-[9px] font-mono text-muted-foreground truncate mt-0.5 px-0.5">{sub}</div>
      </div>
    );
  }
  return (
    <div className="text-center min-w-[4.5rem]">
      <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xl sm:text-2xl font-display font-semibold tabular-nums" style={{ color }}>
        {value}
      </div>
      <div className="text-[9px] font-mono text-muted-foreground truncate max-w-[5rem]">{sub}</div>
    </div>
  );
}

function SectionLabel({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-cyan">
      {icon}
      {title}
      {sub && <span className="text-muted-foreground normal-case tracking-normal text-[10px]">· {sub}</span>}
    </div>
  );
}

function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-3 sm:p-4">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">{title}</div>
      {children}
    </div>
  );
}

function EmptyChart({ label = "No data yet" }: { label?: string }) {
  return (
    <div className="h-[180px] grid place-items-center text-[11px] font-mono text-muted-foreground border border-dashed border-border rounded-lg">
      {label}
    </div>
  );
}

function ComparePill({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="px-3 py-2 rounded-lg border border-border bg-secondary/30">
      <div className="text-[9px] font-mono uppercase text-muted-foreground">{label}</div>
      <div className="text-sm font-display font-semibold tabular-nums">{value ?? "—"}</div>
    </div>
  );
}