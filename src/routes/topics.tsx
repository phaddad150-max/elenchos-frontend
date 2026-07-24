import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  loadCuratedQaPairs,
  loadCuratedTopicInsights,
  loadDashboardData,
  loadDashboardOverview,
  loadTopicHistory,
  loadWowSentimentTrends,
  useSimMode,
  type ContentSource,
  type CuratedQaPair,
  type CuratedTopicInsights,
  type InsightThread,
  type TopicHistoryPoint,
  type TopicSignals,
  type TopicSnapshot,
  type WowTrend,
} from "@/lib/dashboard-data";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Brain,
  ChevronDown,
  MessageSquare,
  ThumbsDown,
  ThumbsUp,
  Sparkles,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Share2,
  Lightbulb,
  AlertTriangle,
  Users,
  Radio,
  Flame,
} from "lucide-react";

import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { DataFreshnessBar } from "@/components/DataFreshnessBar";
import { clearDashboardCaches } from "@/lib/data-cache";
import { FEATURE_TOPICS, getTopic, type FeatureTopic } from "@/lib/feature-topics";
import {
  LIVE_TOPIC_KEYS,
  isLiveTopicId,
  liveTopicConfig,
  isArchivedTopicId,
} from "@/lib/topic-catalog";
import { TopicAnalysisPage } from "@/components/topic-analysis/TopicAnalysisPage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

/** Primary near-real-time monitor (replaces FIFA after tournament close). */
const NEAR_REALTIME_TOPIC_ID = "us-iran-confrontation";

const TOPIC_UPDATE_CADENCE: Record<string, "realtime" | "weekly" | "monthly" | "archived"> = {
  "us-iran-confrontation": "realtime",
  "fifa-world-cup-2026": "archived",
  "arab-israeli-normalization": "weekly",
  "iranian-voices-vs-regime": "weekly",
  "elon-musk-public-voices": "weekly",
  "us-ai-economy-boom": "weekly",
  "new-us-foreign-policy": "weekly",
  "crypto-regulation-financial-markets": "weekly",
  "eu-migration-green-divisions": "weekly",
  "government-performance-corruption": "weekly",
  "crime-safety-lawlessness": "weekly",
  "political-polarization-populism": "weekly",
  "levant-realignment": "monthly",
  "global-ai-race": "monthly",
  "maritime-ai-greece-global-role": "monthly",
  "cuba-sanctions-domino": "monthly",
};

function topicCadence(id: string): "realtime" | "weekly" | "monthly" | "archived" {
  if (isArchivedTopicId(id)) return "archived";
  return TOPIC_UPDATE_CADENCE[id] ?? "weekly";
}

function readDivergenceScore(snapshot?: TopicSnapshot | null): number | undefined {
  if (snapshot == null) return undefined;
  if (typeof snapshot.divergence_score === "number") return Math.round(snapshot.divergence_score);
  const raw = snapshot.narrative_divergence;
  if (typeof raw === "number") return Math.round(raw);
  if (raw && typeof raw === "object" && typeof (raw as { score?: number }).score === "number") {
    return Math.round((raw as { score: number }).score);
  }
  return undefined;
}

function scoreTone(score: number, kind: "sentiment" | "divergence"): string {
  if (kind === "sentiment") {
    return score >= 60 ? "var(--emerald-signal)" : score >= 40 ? "var(--amber-signal)" : "var(--rose-signal)";
  }
  return score >= 60 ? "var(--rose-signal)" : score >= 35 ? "var(--amber-signal)" : "var(--emerald-signal)";
}

function cadenceLabel(
  cadence: "realtime" | "weekly" | "monthly" | "archived",
  short = false,
): string {
  if (short) {
    if (cadence === "realtime") return "Live";
    if (cadence === "weekly") return "Weekly";
    if (cadence === "archived") return "Archived";
    return "Monthly";
  }
  if (cadence === "realtime") return "Live · Near real-time";
  if (cadence === "weekly") return "Weekly refresh";
  if (cadence === "archived") return "Archived tournament";
  return "Monthly refresh";
}

function avgDivergence(t: FeatureTopic) {
  if (!t.compare.length) return 0;
  return Math.round(t.compare.reduce((s, r) => s + r.divergence, 0) / t.compare.length);
}

export const Route = createFileRoute("/topics")({
  head: () => ({
    meta: [
      { title: "Topics — Elenchos" },
      {
        name: "description",
        content:
          "Explore what ordinary citizens are saying about major global issues. Real public conversations, analyzed with care and transparency.",
      },
      { property: "og:title", content: "Topics — Elenchos" },
      {
        property: "og:description",
        content: "Live citizen sentiment from public X discourse, analyzed across nine dimensions per topic.",
      },
      { property: "og:url", content: "https://elenchos.live/topics" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/topics" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Live Topics: Public Square Sentiment",
          description:
            "Live citizen sentiment from public X discourse, analyzed across nine dimensions per topic.",
          url: "https://elenchos.live/topics",
        }),
      },
    ],
  }),

  component: TopicsPage,
});

function TopicsPage() {
  const [, setTick] = useState(0);
  const [refreshedAt, setRefreshedAt] = useState(() => new Date());
  const [sourceUpdatedAt, setSourceUpdatedAt] = useState<string | null>(null);
  const [simMode] = useSimMode();
  useEffect(() => {
    loadDashboardData().then(() => setTick((n) => n + 1));
    loadDashboardOverview().then((o) =>
      setSourceUpdatedAt(o?.generated_at ?? o?.last_updated ?? null),
    );
    loadWowSentimentTrends().then(() => setTick((n) => n + 1));
  }, []);

  const handleRefresh = async () => {
    clearDashboardCaches();
    await loadDashboardData(true);
    const overview = await loadDashboardOverview(true);
    await loadWowSentimentTrends(true);
    setSourceUpdatedAt(overview?.generated_at ?? overview?.last_updated ?? null);
    setTick((n) => n + 1);
    setRefreshedAt(new Date());
  };
  const [selectedId, setSelectedIdState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const t = params.get("topic");
    return t && getTopic(t) ? t : null;
  });
  const setSelectedId = (id: string | null) => {
    setSelectedIdState(id);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("topic", id);
    else url.searchParams.delete("topic");
    window.history.pushState({}, "", url.toString());
  };
  // SSR renders with selectedId=null; sync ?topic= from URL after client hydration.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const t = params.get("topic");
    if (t && getTopic(t)) setSelectedIdState(t);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPop = () => {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("topic");
      setSelectedIdState(t && getTopic(t) ? t : null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const selected = selectedId ? getTopic(selectedId) : null;

  return (
    <div className="min-h-screen relative flex flex-col">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1400px] mx-auto w-full px-2.5 sm:px-4 md:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6 relative flex-1 mobile-safe-bottom overflow-x-clip">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-3">
          <div className="rounded-xl border border-cyan/30 bg-cyan/[0.06] px-3 sm:px-4 py-2.5 text-[11px] sm:text-[12px] font-mono text-cyan flex items-start gap-2 w-full sm:flex-1 sm:min-w-0">
            <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-cyan pulse-dot shrink-0" />
            <span>
              <span className="uppercase tracking-[0.22em] text-[11px] font-semibold mr-1.5">
                Live · Real Data
              </span>
              <span className="text-foreground/80">
                small samples shown transparently.
              </span>
            </span>
          </div>
          <DataFreshnessBar
            sourceUpdatedAt={sourceUpdatedAt}
            refreshedAt={refreshedAt}
            onRefresh={handleRefresh}
          />
        </div>
        <AnimatePresence mode="wait">
          {!selected ? (
            <motion.section
              key="grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <header className="space-y-3">
                <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.28em] text-cyan">
                  <span className="w-1 h-3.5 bg-cyan rounded-sm" />
                  Live Topics
                </div>
                <h1 className="text-[1.55rem] sm:text-4xl md:text-[2.75rem] lg:text-5xl font-display font-semibold tracking-tight leading-[1.1] break-words">
                  Live Topics:{" "}
                  <span className="text-cyan">Public Square Sentiment</span>
                </h1>
                <p className="mt-3 text-sm md:text-[15px] text-muted-foreground max-w-2xl leading-relaxed">
                  Citizen sentiment and narrative divergence from real public discourse on X
                </p>
              </header>

              <h2 className="sr-only">All topics</h2>
              <TopicsFilterableGrid simMode={simMode} onOpen={(id) => setSelectedId(id)} />

            </motion.section>
          ) : (
            <TopicDetail key={selected.id} topic={selected} simMode={simMode} onBack={() => setSelectedId(null)} />
          )}
        </AnimatePresence>
      </main>

      <SiteFooter />
    </div>
  );
}




function readSnapshot(rootKey: string): TopicSnapshot | null {
  if (typeof window === "undefined") return null;
  const root = window.dashboardData;
  if (!root) return null;
  return (root[rootKey] as TopicSnapshot) ?? null;
}

type TopicCategory = "Political" | "Economic" | "Social";

function topicCategory(id: string): TopicCategory {
  if (
    id === "crypto-regulation-financial-markets" ||
    id === "global-ai-race" ||
    id === "us-ai-economy-boom"
  )
    return "Economic";
  if (id === "crime-safety-lawlessness" || id === "political-polarization-populism") return "Social";
  if (id === "fifa-world-cup-2026") return "Social";
  if (id === "elon-musk-public-voices") return "Political";
  return "Political";
}


function readWowTrend(rootKey: string): WowTrend | null {
  if (typeof window === "undefined") return null;
  const map = (window as Window & { wowSentimentTrends?: Record<string, WowTrend> })
    .wowSentimentTrends;
  return map?.[rootKey] ?? null;
}

function TopicsFilterableGrid({
  simMode,
  onOpen,
}: {
  simMode: boolean;
  onOpen: (id: string) => void;
}) {
  const [category, setCategory] = useState<"all" | TopicCategory>("all");
  const [wowTick, setWowTick] = useState(0);

  useEffect(() => {
    loadWowSentimentTrends().then(() => setWowTick((n) => n + 1));
  }, []);

  const filtered = useMemo(() => {
    return FEATURE_TOPICS.filter((t) => {
      if (category !== "all" && topicCategory(t.id) !== category) return false;
      return true;
    });
  }, [category]);

  type Bucket = "live-data" | "live-empty" | "unavailable";
  function bucketOf(t: FeatureTopic): Bucket {
    const cfg = LIVE_TOPIC_KEYS[t.id];
    if (!cfg) return "unavailable";
    const snap = !simMode ? readSnapshot(cfg.rootKey) : null;
    if (snap || simMode) return "live-data";
    return "live-empty";
  }

  const bucketRank: Record<Bucket, number> = {
    "live-data": 0,
    "live-empty": 1,
    "unavailable": 3,
  };

  const { activeTopics, archivedTopics } = useMemo(() => {
    const PRIORITY = [
      NEAR_REALTIME_TOPIC_ID,
      "iranian-voices-vs-regime",
      "arab-israeli-normalization",
      "new-us-foreign-policy",
      "us-ai-economy-boom",
    ];
    const prio = (id: string) => {
      const i = PRIORITY.indexOf(id);
      return i === -1 ? 99 : i;
    };
    /** Live (near real-time) always before weekly, then monthly. */
    const cadenceRank = (id: string) => {
      const c = topicCadence(id);
      if (c === "realtime") return 0;
      if (c === "weekly") return 1;
      if (c === "monthly") return 2;
      return 3;
    };
    const available = [...filtered].filter((t) => bucketOf(t) !== "unavailable");
    const archived = available
      .filter((t) => isArchivedTopicId(t.id))
      .sort((a, b) => prio(a.id) - prio(b.id));
    const active = available
      .filter((t) => !isArchivedTopicId(t.id))
      .sort((a, b) => {
        // 1) Cadence: Live first, then weekly, then monthly
        const ca = cadenceRank(a.id);
        const cb = cadenceRank(b.id);
        if (ca !== cb) return ca - cb;
        // 2) Within same cadence, named priority (near-realtime id first)
        const pa = prio(a.id);
        const pb = prio(b.id);
        if (pa !== pb) return pa - pb;
        // 3) Prefer topics that already have snapshots
        const ba = bucketRank[bucketOf(a)];
        const bb = bucketRank[bucketOf(b)];
        if (ba !== bb) return ba - bb;
        return a.title.localeCompare(b.title);
      });
    return { activeTopics: active, archivedTopics: archived };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, simMode, wowTick]);

  const visibleCount = activeTopics.length + archivedTopics.length;
  const cats: ("all" | TopicCategory)[] = ["all", "Political", "Economic", "Social"];
  const topicGridClass =
    "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 auto-rows-fr items-stretch";

  const renderTopicCard = (t: FeatureTopic, i: number) => {
    const liveKey = LIVE_TOPIC_KEYS[t.id]?.rootKey;
    const snap = liveKey && !simMode ? readSnapshot(liveKey) : null;
    const wow = liveKey && !simMode ? readWowTrend(liveKey) : null;
    return (
      <TopicCard
        key={t.id}
        topic={t}
        delay={i * 0.03}
        cadence={topicCadence(t.id)}
        snapshot={snap}
        wowTrend={wow}
        onOpen={() => onOpen(t.id)}
      />
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 pb-0.5 custom-scroll">
          <div
            className="inline-flex rounded-full border border-border bg-background/40 p-1 text-[11px] sm:text-[12px] font-display font-semibold min-w-max"
            role="tablist"
            aria-label="Filter topics by category"
          >
            {cats.map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={category === c}
                onClick={() => setCategory(c)}
                className={`px-3 sm:px-3.5 py-2 sm:py-1.5 rounded-full tracking-wide transition-colors whitespace-nowrap min-h-[40px] sm:min-h-0 ${
                  category === c
                    ? "bg-cyan/15 text-cyan border border-cyan/40"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {c === "all" ? "All" : c}
              </button>
            ))}
          </div>
        </div>
        <span className="text-[12px] sm:text-[13px] font-display font-medium text-muted-foreground sm:ml-auto shrink-0">
          {visibleCount} topics
        </span>
      </div>

      {visibleCount === 0 && (
        <div className="text-center text-xs font-mono text-muted-foreground py-10 border border-dashed border-border rounded-lg">
          No topics match these filters.
        </div>
      )}

      {activeTopics.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan pulse-dot" />
            <h2 className="text-[11px] font-mono uppercase tracking-[0.24em] text-cyan">
              Topics
            </h2>
            <span className="hidden sm:inline text-[10px] font-mono text-muted-foreground tracking-[0.14em]">
              · Live, weekly &amp; monthly
            </span>
          </div>
          <div className={topicGridClass}>
            {activeTopics.map((t, i) => renderTopicCard(t, i))}
          </div>
        </section>
      )}

      {archivedTopics.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
            <h2 className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
              Archived topics
            </h2>
            <span className="hidden sm:inline text-[10px] font-mono text-muted-foreground tracking-[0.14em]">
              · Historical snapshots · no longer near real-time
            </span>
          </div>
          <div className={`${topicGridClass} opacity-95`}>
            {archivedTopics.map((t, i) => renderTopicCard(t, i))}
          </div>
        </section>
      )}
    </div>
  );
}

function shortTitle(t: string): string {
  const map: Record<string, string> = {
    "Arab–Israeli Normalization": "Arab–Israeli Normalization",
    "Iranian Voices vs Islamic Regime": "Iranian Voices",
    "Iranian Voices vs Regime": "Iranian Voices",
    "Maritime AI Industry & Greece's Global Role": "Greek Maritime AI",
    "The Global AI Race": "Global AI Race",
    "Trump Administration Actions & US Politics": "Trump Admin & US Politics",
    "Crypto Regulation & Financial Markets Volatility": "Crypto & Markets",
    "Eastern Mediterranean Alliance: Greece–Cyprus–Israel": "East Med Alliance",
    "Migration, Green Policies & Internal EU Divisions": "EU Migration & Divisions",
    "Government Performance, Corruption & Scandals": "Government & Corruption",
    "Crime, Safety & Lawlessness": "Crime & Safety",
    "Political Polarization & Populism Rise": "Polarization & Populism",
    "Cuba Sanctions & the Domino Effect": "Cuba Sanctions",
    "US AI Economy Boom & American Technological Renaissance": "US AI Economy Boom",
    "FIFA World Cup 2026": "FIFA World Cup 2026",
    "US-Iran Confrontation: Sanctions, Networks & Regime Pressure": "US–Iran Confrontation",
    "Public Voices on Elon Musk: Trust, Media Frames & Power": "Elon Musk · Public Voices",
  };
  return map[t] ?? t;
}

/** Shared typography + row heights — card shell size stays fixed; type is larger & centered */
const CARD_LABEL =
  "text-[10.5px] md:text-[11px] font-mono uppercase tracking-[0.12em] leading-none text-center";
const CARD_TITLE =
  "text-[16px] md:text-[17px] font-display font-semibold tracking-tight leading-[1.18] text-center w-full";
const CARD_SCORE_LABEL =
  "text-[10.5px] md:text-[11px] font-mono uppercase tracking-[0.12em] text-muted-foreground leading-none text-center";
const CARD_SCORE_VALUE =
  "text-[1.95rem] md:text-[2.05rem] font-display font-semibold tabular-nums leading-none text-center";
const CARD_CTA =
  "w-full inline-flex items-center justify-center rounded-lg font-mono uppercase tracking-[0.12em] font-semibold text-[11.5px] md:text-[12px] min-h-[40px] md:min-h-[36px]";

const TOPIC_CARD_SHELL =
  "topic-card-shell group relative overflow-hidden rounded-xl md:rounded-2xl border border-cyan/30 bg-gradient-to-br from-secondary/30 via-secondary/10 to-cyan/[0.04] p-3 flex flex-col h-full min-w-0 hover:border-cyan/60 md:hover:shadow-[0_0_24px_-12px_var(--cyan-glow)] transition-all touch-manipulation min-h-[248px] md:min-h-[210px] md:h-[210px]";

function TopicCardCadence({
  cadence,
}: {
  cadence: "realtime" | "weekly" | "monthly" | "archived";
}) {
  return (
    <span
      className={`inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full ${CARD_LABEL} ${
        cadence === "realtime"
          ? "text-cyan bg-cyan/10 border border-cyan/30"
          : cadence === "archived"
            ? "text-muted-foreground bg-secondary/40 border border-border/60"
            : "text-muted-foreground bg-background/50 border border-border/50"
      }`}
    >
      {cadence === "realtime" && <span className="w-1.5 h-1.5 rounded-full bg-cyan pulse-dot shrink-0" />}
      <span>{cadenceLabel(cadence, true)}</span>
    </span>
  );
}

function TopicCardScore({
  label,
  shortLabel,
  value,
  color,
}: {
  label: string;
  shortLabel: string;
  value: number | undefined;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-0.5 min-w-0 h-full gap-1.5">
      <span className={CARD_SCORE_LABEL}>
        <span className="md:hidden">{shortLabel}</span>
        <span className="hidden md:inline">{label}</span>
      </span>
      <span className={CARD_SCORE_VALUE} style={{ color }}>
        {typeof value === "number" ? value : "—"}
      </span>
    </div>
  );
}

/** WoW sentiment arrow between topic title and score row. */
function TopicCardWowTrend({ trend }: { trend: WowTrend | null }) {
  if (!trend) {
    return (
      <div
        className="h-8 w-full shrink-0 flex items-center justify-center"
        aria-hidden
      >
        <Minus className="w-5 h-5 text-muted-foreground/35" strokeWidth={2.5} />
      </div>
    );
  }
  const Icon =
    trend.direction === "up"
      ? TrendingUp
      : trend.direction === "down"
        ? TrendingDown
        : Minus;
  const color =
    trend.direction === "up"
      ? "var(--emerald-signal)"
      : trend.direction === "down"
        ? "var(--rose-signal)"
        : "var(--muted-foreground)";
  const label =
    trend.direction === "up"
      ? "Week-over-week sentiment up"
      : trend.direction === "down"
        ? "Week-over-week sentiment down"
        : "Week-over-week sentiment stable";
  const deltaText =
    typeof trend.delta === "number" && !Number.isNaN(trend.delta) && trend.delta !== 0
      ? `${trend.delta > 0 ? "+" : ""}${Math.round(trend.delta)}`
      : null;

  return (
    <div
      className="h-8 w-full shrink-0 flex items-center justify-center gap-1.5 text-center"
      title={deltaText ? `${label} (${deltaText} pts)` : label}
      aria-label={deltaText ? `${label}, ${deltaText} points` : label}
    >
      <Icon className="w-5 h-5 shrink-0" style={{ color }} strokeWidth={2.75} />
      {deltaText && (
        <span className="text-xs md:text-[13px] font-mono font-semibold tabular-nums leading-none" style={{ color }}>
          {deltaText}
        </span>
      )}
    </div>
  );
}

function TopicCard({
  topic,
  delay,
  onOpen,
  snapshot = null,
  wowTrend = null,
  cadence = "weekly",
}: {
  topic: FeatureTopic;
  delay: number;
  onOpen: () => void;
  snapshot?: TopicSnapshot | null;
  wowTrend?: WowTrend | null;
  cadence?: "realtime" | "weekly" | "monthly" | "archived";
}) {
  const os = snapshot?.overall_sentiment;
  const sentiment = typeof os === "object" && os && typeof os.score === "number" ? Math.round(os.score) : undefined;
  const divergence = readDivergenceScore(snapshot);
  const sentimentTone = typeof sentiment === "number" ? scoreTone(sentiment, "sentiment") : "var(--muted-foreground)";
  const divergenceTone = typeof divergence === "number" ? scoreTone(divergence, "divergence") : "var(--muted-foreground)";
  const category = topicCategory(topic.id);

  // Fallback: Pass 1 overall_sentiment.trend label when no curated/history WoW yet
  const resolvedWow: WowTrend | null = (() => {
    if (wowTrend) return wowTrend;
    const label =
      typeof os === "object" && os && typeof os.trend === "string" ? os.trend : null;
    if (!label) return null;
    if (/increas|improv|up|ris|gain/i.test(label)) return { delta: null, direction: "up" };
    if (/decreas|declin|down|fall|wors/i.test(label)) return { delta: null, direction: "down" };
    if (/stable|flat|steady|unchang/i.test(label)) return { delta: null, direction: "flat" };
    return null;
  })();

  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ delay }}
      onClick={onOpen}
      className={`${TOPIC_CARD_SHELL} w-full min-w-0`}
    >
      {/* Slot 1 — meta (fixed height, centered) */}
      <div className="h-9 shrink-0 flex flex-col items-center justify-center gap-1">
        <span className={`${CARD_LABEL} text-cyan truncate max-w-full`}>{category}</span>
        <TopicCardCadence cadence={cadence} />
      </div>

      {/* Slot 2 — title + trend arrow (centered under name, especially mobile) */}
      <div className="shrink-0 w-full flex flex-col items-center justify-center px-1.5">
        <div className="h-[3.5rem] w-full flex items-center justify-center">
          <h3 className={`${CARD_TITLE} text-foreground group-hover:text-cyan transition-colors line-clamp-2 text-center mx-auto`}>
            {shortTitle(topic.title)}
          </h3>
        </div>
        <TopicCardWowTrend trend={resolvedWow} />
      </div>

      {/* Slot 3 — scores (fixed height, always 2 equal columns, centered) */}
      <div className="h-[4.1rem] shrink-0 w-full">
        <div className="grid grid-cols-2 h-full w-full divide-x divide-border/60 items-center justify-items-center">
          <TopicCardScore
            label="Sentiment"
            shortLabel="Sent."
            value={sentiment}
            color={sentimentTone}
          />
          <TopicCardScore
            label="Divergence"
            shortLabel="Div."
            value={divergence}
            color={divergenceTone}
          />
        </div>
      </div>

      {/* Slot 4 — CTA (fixed height) */}
      <span
        className={`${CARD_CTA} mt-auto shrink-0 bg-cyan/15 text-cyan border border-cyan/40 group-hover:bg-cyan group-hover:text-primary-foreground active:bg-cyan active:text-primary-foreground transition-all`}
      >
        <span className="md:hidden">Open →</span>
        <span className="hidden md:inline">View Analysis →</span>
      </span>
    </motion.button>
  );
}









// ────────────────────────────────────────────────────────────────
// Intelligence-report style detail view
// ────────────────────────────────────────────────────────────────

// (Key Monitoring Terms removed per launch spec)

function splitToBullets(text: string, max = 3): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, max);
}

function readTopicOverride(topicId: string): Partial<FeatureTopic> | null {
  if (typeof window === "undefined") return null;
  const data = window.dashboardData as Record<string, unknown> | null | undefined;
  if (!data) return null;
  const topics = (data.topics ?? data.topic_data) as Record<string, unknown> | undefined;
  if (!topics || typeof topics !== "object") return null;
  return (topics[topicId] as Partial<FeatureTopic>) ?? null;
}

type SubGroupKey = "political" | "economic" | "social";

function SubGroupBreakdown({ trackers }: { trackers: FeatureTopic["trackers"] }) {
  const groups: { key: SubGroupKey; label: string; match: RegExp }[] = [
    { key: "political", label: "Political", match: /political|stability/i },
    { key: "economic", label: "Economic", match: /economic|growth/i },
    { key: "social", label: "Social", match: /social|coherence|tolerance/i },
  ];
  const items = groups.map((g) => ({
    ...g,
    tracker: trackers.find((t) => g.match.test(t.label)) ?? null,
  }));
  const [active, setActive] = useState<SubGroupKey>("political");
  const current = items.find((i) => i.key === active) ?? items[0];
  const tracker = current.tracker;
  const score = tracker?.score ?? 0;
  const color =
    score >= 65 ? "var(--emerald-signal)" : score >= 45 ? "var(--amber-signal)" : "var(--rose-signal)";

  return (
    <section className="glass rounded-2xl border border-cyan/20 p-5 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.24em] text-cyan">
          <Users className="w-3.5 h-3.5" /> Sub-group view · Political · Economic · Social
        </div>
        <div className="text-[10.5px] font-mono uppercase tracking-wider text-muted-foreground">
          Filter the alliance signal by dimension
        </div>
      </div>

      <div className="inline-flex rounded-full border border-border bg-background/40 p-1 gap-1">
        {items.map((g) => {
          const isActive = g.key === active;
          return (
            <button
              key={g.key}
              type="button"
              onClick={() => setActive(g.key)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.18em] transition-colors ${
                isActive
                  ? "bg-cyan/15 text-cyan border border-cyan/40"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              {g.label}
            </button>
          );
        })}
      </div>

      {tracker ? (
        <div
          className="rounded-xl border bg-background/40 p-4 flex items-center gap-5"
          style={{ borderColor: color }}
        >
          <div
            className="w-20 h-20 rounded-full grid place-items-center shrink-0"
            style={{ background: `conic-gradient(${color} ${score * 3.6}deg, transparent 0deg)` }}
          >
            <div className="w-[68px] h-[68px] rounded-full bg-background grid place-items-center">
              <span className="text-2xl font-display font-semibold tabular-nums" style={{ color }}>
                {score}
              </span>
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-mono uppercase tracking-[0.22em]" style={{ color }}>
              {current.label} sentiment
            </div>
            <div className="text-lg font-display font-semibold mt-0.5">{tracker.label}</div>
            <p className="text-sm text-muted-foreground leading-relaxed mt-1">{tracker.caption}</p>
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground font-mono">
          No {current.label.toLowerCase()} signal yet.
        </div>
      )}
    </section>
  );
}

function TopicDetail({ topic: baseTopic, onBack, simMode = false }: { topic: FeatureTopic; onBack: () => void; simMode?: boolean }) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const override = readTopicOverride(baseTopic.id);
  const topic: FeatureTopic = override ? { ...baseTopic, ...override } : baseTopic;

  const gap = avgDivergence(topic);
  const overallSentiment = Math.round(topic.trackers.reduce((s, t) => s + t.score, 0) / topic.trackers.length);
  const simA = topic.simulation.pathA.series;
  const trend = simA[simA.length - 1] - simA[0];
  const momentum = Math.max(0, Math.min(100, 50 + trend));
  const negSignal = topic.trackers.find((t) => t.classification === "negative");
  const emotionalIntensity = negSignal ? 100 - negSignal.score : Math.min(100, gap + 25);
  const sampleNum = parseInt(topic.sampleSize.replace(/[^0-9]/g, ""), 10) || 0;
  const engagementVelocity = Math.min(100, Math.round((sampleNum / 600) * 100));

  const metrics = [
    {
      label: "Citizen ↔ Official Gap",
      value: gap,
      tone: gap > 40 ? "rose" : gap > 25 ? "amber" : "emerald",
      hint: gap > 40 ? "Severe divergence" : gap > 25 ? "Notable divergence" : "Aligned",
    },
    {
      label: "Emotional Intensity",
      value: emotionalIntensity,
      tone: emotionalIntensity > 65 ? "rose" : emotionalIntensity > 40 ? "amber" : "emerald",
      hint: "Anger + urgency in citizen posts",
    },
    {
      label: "Narrative Momentum",
      value: momentum,
      tone: momentum > 60 ? "emerald" : momentum < 40 ? "rose" : "amber",
      hint: trend >= 0 ? `+${trend} pts trajectory` : `${trend} pts trajectory`,
    },
    {
      label: "Engagement Velocity",
      value: engagementVelocity,
      tone: engagementVelocity > 60 ? "emerald" : engagementVelocity > 35 ? "amber" : "rose",
      hint: topic.sampleSize,
    },
  ] as const;

  const claims = topic.actionableIntel?.claims ?? splitToBullets(topic.insights.citizenSays, 3);
  const warnings =
    topic.actionableIntel?.warnings ?? splitToBullets(topic.insights.gap + " " + topic.insights.officialSays, 3);
  const opportunities =
    topic.actionableIntel?.opportunities ?? splitToBullets(topic.takeaway + " " + topic.insights.citizenSays, 3);

  const liveCfg = liveTopicConfig(topic.id);
  const { data: liveData } = useLiveTopicData(liveCfg?.rootKey ?? "");
  const { hasCurated } = useCuratedTopicData(liveCfg?.rootKey ?? "");
  const useLive = !simMode && isLiveTopicId(topic.id);
  const contentSource = resolveContentSource({
    hasLiveConfig: Boolean(liveCfg),
    hasLiveData: Boolean(liveData),
    simMode,
    hasCurated,
  });
  const liveScore = typeof liveData?.overall_sentiment === "object" ? liveData?.overall_sentiment?.score : undefined;
  const liveLabel = typeof liveData?.overall_sentiment === "object" ? liveData?.overall_sentiment?.label : undefined;
  const shareUrl = `https://elenchos.live/topics?topic=${encodeURIComponent(topic.id)}`;
  const shareText = useLive && typeof liveScore === "number"
    ? `${topic.title} — Live citizen sentiment: ${liveScore}/100${liveLabel ? ` (${liveLabel})` : ""}. Real voices, paraphrased. via @ElenchosPulse`
    : `${topic.title} — Citizen sentiment ${overallSentiment}/100 across ${topic.trackers.length} dimensions. ${topic.takeaway} via @ElenchosPulse`;
  const shareHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  const sentimentTone = overallSentiment >= 60 ? "emerald" : overallSentiment >= 40 ? "amber" : "rose";

  return (
    <motion.section
      key={topic.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-5"
    >
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 min-w-0">
          <button
            onClick={onBack}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-full text-[13px] font-display font-semibold border border-cyan/45 bg-cyan/10 text-cyan hover:bg-cyan/15 active:bg-cyan/20 transition-colors min-h-[44px] sm:min-h-0 touch-manipulation"
          >
            <ArrowLeft className="w-4 h-4" /> Topics
          </button>
          <span className="text-muted-foreground font-mono text-[12px] hidden sm:inline" aria-hidden>
            /
          </span>
          <span className="text-[12px] sm:text-[13px] font-display font-medium text-muted-foreground truncate max-w-[14rem] sm:max-w-xs hidden sm:inline">
            {shortTitle(topic.title)}
          </span>
        </nav>
        <a
          href={shareHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-1.5 rounded-full text-[12px] font-mono border border-cyan/40 text-cyan hover:bg-cyan/10 active:bg-cyan/15 transition-colors min-h-[44px] sm:min-h-0 touch-manipulation"
        >
          <Share2 className="w-3.5 h-3.5" /> Share on X
        </a>
      </div>

      {/* Header */}
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.22em] sm:tracking-[0.28em] text-cyan">
          <span className="w-1 h-3.5 bg-cyan rounded-sm" />
          {topic.region}
        </div>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-semibold tracking-tight leading-[1.08] break-words">
          {shortTitle(topic.title)}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">{topic.description}</p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <ContentSourceBadge source={contentSource} />
          {contentSource === "static" && (
            <span className="text-[10px] font-mono text-muted-foreground normal-case tracking-normal">
              Simulated editorial data — not live Supabase analysis
            </span>
          )}
        </div>
      </header>

      {/* Live data panel (real Supabase data for mapped topics) */}
      {useLive && liveCfg ? (
        <TopicAnalysisPage rootKey={liveCfg.rootKey} headerLabel={liveCfg.headerLabel} />
      ) : null}

      {!useLive && (
        <>
          {/* Overall Citizen Sentiment */}
          <OverallSentiment score={overallSentiment} trend={trend} tone={sentimentTone} />

          {/* Sub-group breakdown — Eastern Mediterranean alliance only */}
          {topic.id === "levant-realignment" && <SubGroupBreakdown trackers={topic.trackers} />}

          {/* Segmented sentiment (topic-aware) */}
          {topic.segments && topic.segments.items.length > 0 && (
            <SegmentedSentiment
              overall={overallSentiment}
              items={topic.segments.items}
              methodology={topic.segments.methodology}
            />
          )}

          {/* 4 metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {metrics.map((m) => (
              <MetricCard key={m.label} {...m} />
            ))}
          </div>

          {/* Path comparison — topic-specific */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <PathCard
              kind="positive"
              title={topic.pathExamples?.positive.title ?? "Positive Path"}
              pathLabel={topic.pathExamples?.positive.pathLabel ?? topic.simulation.pathA.label}
              series={topic.simulation.pathA.series}
              exampleLabel={topic.pathExamples?.positive.exampleLabel}
              example={
                topic.pathExamples?.positive.exampleBody ??
                "Pathway where citizen-aligned reform and openness compound."
              }
            />
            <PathCard
              kind="risk"
              title={topic.pathExamples?.risk.title ?? "Risk Path"}
              pathLabel={topic.pathExamples?.risk.pathLabel ?? topic.simulation.pathB.label}
              series={topic.simulation.pathB.series}
              exampleLabel={topic.pathExamples?.risk.exampleLabel}
              example={
                topic.pathExamples?.risk.exampleBody ??
                "Pathway where elite paralysis or escalation overrides citizen sentiment."
              }
            />
          </div>

          {/* Actionable Insights */}
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-cyan">
                <Sparkles className="w-3 h-3" /> Actionable Intelligence
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <ContentSourceBadge source="static" compact />
                <div className="text-[10.5px] font-mono uppercase tracking-wider text-muted-foreground">
                  For journalists · researchers · policy advocates
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <InsightCard
                tone="emerald"
                icon={<MessageSquare className="w-4 h-4" />}
                title="Top Citizen Claims"
                bullets={claims}
              />
              <InsightCard
                tone="rose"
                icon={<AlertTriangle className="w-4 h-4" />}
                title="Warning Signals"
                bullets={warnings}
              />
              <InsightCard
                tone="amber"
                icon={<Lightbulb className="w-4 h-4" />}
                title="Opportunity Signals"
                bullets={opportunities}
              />
            </div>
          </section>
        </>
      )}

      {/* AI Synthesis — only for non-live (simulated) topics; live topics use TopicAnalysisPage */}
      {!useLive && (
        <section className="glass rounded-2xl p-5 space-y-3 border-l-2 border-l-cyan">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-cyan">
              <div className="p-1.5 rounded-md bg-cyan/15 border border-cyan/30">
                <Brain className="w-4 h-4" />
              </div>
              <h2 className="font-display font-semibold tracking-[0.18em] uppercase text-sm">AI Synthesis</h2>
            </div>
            <ContentSourceBadge source="static" compact />
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed">
            <span className="text-cyan font-medium">Citizens:</span> {topic.insights.citizenSays}{" "}
            <span className="text-muted-foreground font-medium">Officials & media:</span> {topic.insights.officialSays}{" "}
            <span className="text-amber-signal font-medium">Bottom line —</span> {topic.takeaway}
          </p>
          <div className="text-[10.5px] font-mono uppercase tracking-wider text-muted-foreground pt-1 border-t border-border">
            Sample: {topic.sampleSize} · Confidence: {topic.confidence ?? (gap > 25 ? "High" : "Moderate")}
          </div>
        </section>
      )}

      {/* Feedback */}
      <section className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 rounded-2xl border border-border bg-secondary/30">
        <span className="text-sm text-muted-foreground">Was this intelligence brief useful?</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFeedback("up")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border transition-colors ${
              feedback === "up"
                ? "bg-emerald-signal/15 text-emerald-signal border-emerald-signal/40"
                : "border-border hover:border-emerald-signal/40"
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" /> Yes
          </button>
          <button
            onClick={() => setFeedback("down")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border transition-colors ${
              feedback === "down"
                ? "bg-rose-signal/15 text-rose-signal border-rose-signal/40"
                : "border-border hover:border-rose-signal/40"
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5" /> No
          </button>
        </div>
      </section>
    </motion.section>
  );
}

// ────────────────────────────────────────────────────────────────
// Live data panel — Arab-Israeli Normalization / Abraham Accords
// ────────────────────────────────────────────────────────────────

type SegmentValue = { score: number; label?: string };

type QuestionAnalysis = {
  question?: string;
  answer?: string;
  sentiment_score?: number;
  sentiment_label?: string;
  summary?: string;
  key_points?: string[];
  notable_variations?: string[] | string;
};

type AbrahamData = Pick<
  TopicSnapshot,
  | "overall_sentiment"
  | "segmented_sentiment"
  | "narrative_summary"
  | "key_insights"
  | "question_analysis"
  | "sample_size"
  | "last_updated"
  | "month"
  | "divergence_score"
  | "divergence_gap"
  | "signals"
  | "top_3_key_stories"
  | "narrative_divergence"
>;

function useCuratedTopicData(rootKey: string): {
  insights: CuratedTopicInsights | null;
  qaPairs: CuratedQaPair[];
  hasCurated: boolean;
} {
  const [insights, setInsights] = useState<CuratedTopicInsights | null>(null);
  const [qaPairs, setQaPairs] = useState<CuratedQaPair[]>([]);
  useEffect(() => {
    if (!rootKey) return;
    let cancelled = false;
    Promise.all([loadCuratedTopicInsights(rootKey), loadCuratedQaPairs(rootKey)]).then(
      ([ins, qa]) => {
        if (cancelled) return;
        setInsights(ins);
        setQaPairs(qa);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [rootKey]);
  const hasCurated = Boolean(
    insights?.hero_headline || insights?.hero_summary || (qaPairs?.length ?? 0) > 0,
  );
  return { insights, qaPairs, hasCurated };
}

function useLiveTopicData(rootKey: string): { data: AbrahamData | null; isFallback: boolean } {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    loadDashboardData().then(() => setTick((n) => n + 1));
    const id = setInterval(() => {
      if (typeof window !== "undefined" && window.dashboardData) {
        setTick((n) => n + 1);
        clearInterval(id);
      }
    }, 300);
    return () => clearInterval(id);
  }, [rootKey]);
  if (typeof window === "undefined") return { data: null, isFallback: false };
  const root = window.dashboardData as Record<string, AbrahamData> | null | undefined;
  if (!root) return { data: null, isFallback: false };
  const node = root[rootKey];
  void tick;
  return { data: node ?? null, isFallback: Boolean(window.dashboardMeta?.fallback) };
}

function segScore(v: SegmentValue | number): number {
  return typeof v === "number" ? v : (v?.score ?? 0);
}
function segLabel(v: SegmentValue | number): string | undefined {
  return typeof v === "number" ? undefined : v?.label;
}
function prettySegmentName(k: string): string {
  return k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}


function sentimentColor(score: number): string {
  if (score >= 65) return "var(--emerald-signal)";
  if (score >= 45) return "var(--amber-signal)";
  return "var(--rose-signal)";
}

// Higher divergence == more concern. Color-coded with the same palette
// used across the dashboard: green low, amber medium, red high.
function divergenceColor(score: number): string {
  if (score >= 60) return "var(--rose-signal)";
  if (score >= 35) return "var(--amber-signal)";
  return "var(--emerald-signal)";
}

function divergenceBand(score: number): string {
  if (score >= 60) return "Severe divergence";
  if (score >= 35) return "Notable divergence";
  return "Aligned";
}

function HeroSentimentCard({
  score,
  label,
  trend,
  color,
  sample,
}: {
  score: number;
  label: string;
  trend: string;
  color: string;
  sample: string;
}) {
  return (
    <div className="rounded-xl border bg-background/40 backdrop-blur p-4 sm:p-5 relative overflow-hidden flex flex-col gap-3 sm:gap-4 min-h-[200px] sm:min-h-[240px]" style={{ borderColor: `${color}55` }}>
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-xl opacity-70"
        style={{ background: `radial-gradient(280px circle at 50% 0%, ${color}1f, transparent 65%)` }}
      />
      <div className="relative flex items-center justify-between gap-2 flex-wrap">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.22em]" style={{ color }}>
          <Activity className="w-3 h-3" /> Overall Sentiment
        </div>
        {trend && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border" style={{ color, borderColor: `${color}55`, background: `${color}14` }}>
            <TrendingUp className="w-3 h-3" /> {trend}
          </span>
        )}
      </div>

      <div className="relative flex flex-col sm:flex-row items-center gap-3 sm:gap-5 text-center sm:text-left">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0">
          <div
            className="absolute inset-0 rounded-full grid place-items-center"
            style={{ background: `conic-gradient(${color} ${score * 3.6}deg, var(--border) 0deg)` }}
          >
            <div className="absolute inset-1.5 rounded-full bg-background grid place-items-center">
              <span className="text-3xl sm:text-4xl font-display font-semibold tabular-nums" style={{ color }}>
                {score}
              </span>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-xl sm:text-2xl font-display font-semibold leading-tight" style={{ color }}>
            {label}
          </div>
          <div className="mt-1 text-[11px] sm:text-[12px] font-mono text-muted-foreground">
            Citizen sentiment score · 0–100 scale
          </div>
        </div>
      </div>

      <div className="relative mt-auto text-[10px] sm:text-[11px] font-mono text-muted-foreground border-t border-border pt-2 flex flex-col sm:flex-row items-center sm:justify-between gap-1 sm:gap-0">
        <span>Sample · <span className="text-foreground/80 tabular-nums">{sample}</span></span>
        <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: color }} /> Live</span>
      </div>
    </div>
  );
}

function resolveContentSource(opts: {
  hasLiveConfig: boolean;
  hasLiveData: boolean;
  simMode: boolean;
  hasCurated?: boolean;
}): ContentSource {
  if (opts.hasCurated) return "curated";
  if (opts.hasLiveConfig && !opts.simMode) {
    return opts.hasLiveData ? "live" : "loading";
  }
  return "static";
}

function ContentSourceBadge({ source, compact }: { source: ContentSource; compact?: boolean }) {
  const styles: Record<ContentSource, { label: string; color: string; dot?: boolean }> = {
    live: { label: compact ? "Live" : "Live · streaming", color: "var(--emerald-signal)", dot: true },
    curated: { label: compact ? "Curated" : "Curated synthesis", color: "var(--cyan)", dot: true },
    static: { label: compact ? "Preview" : "Illustrative preview", color: "var(--amber-signal)" },
    loading: { label: compact ? "Queued" : "Awaiting live data", color: "var(--muted-foreground)" },
  };
  const s = styles[source];
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider"
      style={{ color: s.color }}
    >
      {s.dot && <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: s.color }} />}
      {s.label}
    </span>
  );
}

function SignalsStrip({ signals }: { signals: TopicSignals }) {
  const total = signals.total_signals;
  const pos = signals.positive_signals;
  const neg = signals.negative_signals;
  const neu = signals.neutral_signals;
  const keys = signals.key_signals ?? [];
  const hasCounts =
    typeof total === "number" ||
    typeof pos === "number" ||
    typeof neg === "number" ||
    typeof neu === "number";
  if (!hasCounts && keys.length === 0) return null;

  return (
    <div className="relative rounded-xl border border-border bg-background/40 backdrop-blur p-4 space-y-3">
      <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan flex items-center gap-2">
        <Radio className="w-3 h-3" /> Citizen Signals
        <span className="text-muted-foreground normal-case tracking-wider">· extracted from discourse</span>
      </div>
      {hasCounts && (
        <div className="flex flex-wrap gap-2">
          {typeof total === "number" && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono border border-cyan/40 bg-cyan/10 text-cyan">
              Total <span className="tabular-nums font-semibold">{total}</span>
            </span>
          )}
          {typeof pos === "number" && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono border border-emerald-signal/40 bg-emerald-signal/10 text-emerald-signal">
              Positive <span className="tabular-nums font-semibold">{pos}</span>
            </span>
          )}
          {typeof neg === "number" && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono border border-rose-signal/40 bg-rose-signal/10 text-rose-signal">
              Negative <span className="tabular-nums font-semibold">{neg}</span>
            </span>
          )}
          {typeof neu === "number" && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono border border-border bg-secondary/40 text-muted-foreground">
              Neutral <span className="tabular-nums font-semibold text-foreground/80">{neu}</span>
            </span>
          )}
        </div>
      )}
      {keys.length > 0 && (
        <ul className="space-y-1.5">
          {keys.slice(0, 5).map((sig, i) => (
            <li key={i} className="flex gap-2 text-sm text-foreground/90 leading-relaxed">
              <span className="mt-1.5 w-1 h-1 rounded-full shrink-0 bg-cyan" />
              <span>{sig}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function confidenceColor(c?: string): string {
  const v = (c ?? "").toLowerCase();
  if (v === "high") return "var(--emerald-signal)";
  if (v === "low") return "var(--rose-signal)";
  return "var(--amber-signal)";
}

function formatDelta(delta?: number | null): string | null {
  if (typeof delta !== "number" || Number.isNaN(delta) || delta === 0) return null;
  const rounded = Math.round(delta);
  return `${rounded > 0 ? "+" : ""}${rounded}pt`;
}

function CuratedHeroSection({ insights }: { insights: CuratedTopicInsights }) {
  const confColor = confidenceColor(insights.hero_confidence);
  const sentDelta = formatDelta(insights.sentiment_delta);
  const divDelta = formatDelta(insights.divergence_delta);

  return (
    <div className="relative rounded-xl border border-cyan/40 bg-cyan/[0.06] p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-cyan">
          <Sparkles className="w-3.5 h-3.5" /> Curated Synthesis
        </div>
        <ContentSourceBadge source="curated" compact />
      </div>
      {insights.hero_headline && (
        <h3 className="text-xl sm:text-2xl font-display font-semibold leading-tight text-foreground">
          {insights.hero_headline}
        </h3>
      )}
      {insights.hero_summary && (
        <p className="text-sm sm:text-[15px] text-foreground/90 leading-relaxed">{insights.hero_summary}</p>
      )}
      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
        {insights.hero_confidence && (
          <span
            className="px-2 py-0.5 rounded-full border uppercase tracking-wider"
            style={{ color: confColor, borderColor: `${confColor}55`, background: `${confColor}14` }}
          >
            {insights.hero_confidence} confidence
          </span>
        )}
        {sentDelta && (
          <span className="px-2 py-0.5 rounded-full border border-border text-muted-foreground">
            Sentiment {sentDelta}
          </span>
        )}
        {divDelta && (
          <span className="px-2 py-0.5 rounded-full border border-border text-muted-foreground">
            Divergence {divDelta}
          </span>
        )}
        {insights.comparison_window && (
          <span className="text-muted-foreground uppercase tracking-wider">
            vs {insights.comparison_window}
          </span>
        )}
      </div>
      {insights.evolution_note && (
        <p className="text-[12px] sm:text-sm text-muted-foreground leading-relaxed border-t border-border pt-2">
          {insights.evolution_note}
        </p>
      )}
    </div>
  );
}

function InsightThreadsSection({ threads }: { threads: InsightThread[] }) {
  const sorted = [...threads].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
  if (!sorted.length) return null;

  return (
    <div className="relative space-y-3">
      <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan flex items-center gap-2">
        <Lightbulb className="w-3 h-3" /> Insight Threads
        <span className="text-muted-foreground normal-case tracking-wider">· ranked by quality</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sorted.map((t, i) => {
          const c = confidenceColor(t.confidence);
          return (
            <div
              key={`${t.theme}-${i}`}
              className="rounded-xl border border-border bg-background/40 backdrop-blur p-4 space-y-2"
              style={{ borderTop: `2px solid ${c}` }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  {t.theme ?? "Insight"}
                </span>
                {t.confidence && (
                  <span className="text-[10px] font-mono uppercase" style={{ color: c }}>
                    {t.confidence}
                  </span>
                )}
              </div>
              {t.headline && (
                <h4 className="font-display font-semibold text-sm leading-snug">{t.headline}</h4>
              )}
              {t.summary && (
                <p className="text-sm text-foreground/85 leading-relaxed">{t.summary}</p>
              )}
              {t.divergence_note && (
                <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">
                  Gap: {t.divergence_note}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CuratedQaCard({ card }: { card: CuratedQaPair }) {
  const score = Math.max(0, Math.min(100, card.sentiment_score ?? 0));
  const color = sentimentColor(score);
  const evidence = card.key_evidence ?? [];
  const wow = formatDelta(card.wow_delta);
  const mom = formatDelta(card.mom_delta);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group relative h-full text-left flex flex-col rounded-2xl bg-background/40 backdrop-blur border border-border/60 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-cyan/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60"
        >
          <div className="relative h-1 w-full bg-border/50">
            <motion.div
              className="h-full"
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              style={{ background: color }}
            />
          </div>
          <div className="relative flex-1 flex flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {card.theme ?? "Analysis"}
              </span>
              <div className="flex gap-1">
                {wow && <span className="text-[10px] font-mono text-emerald-signal">{wow}</span>}
                {mom && <span className="text-[10px] font-mono text-cyan">{mom}</span>}
              </div>
            </div>
            <h4 className="font-display font-semibold text-[15px] leading-snug text-foreground/95">
              {card.card_title ?? "Insight"}
            </h4>
            {card.card_summary && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{card.card_summary}</p>
            )}
            <div className="mt-auto flex items-center justify-between gap-2">
              <span className="text-2xl font-display font-semibold tabular-nums" style={{ color }}>
                {score}
              </span>
              {card.confidence && (
                <span className="text-[10px] font-mono uppercase" style={{ color: confidenceColor(card.confidence) }}>
                  {card.confidence}
                </span>
              )}
            </div>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-lg leading-snug pr-6">
            {card.card_title ?? "Curated insight"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          {card.card_summary && <p className="leading-relaxed text-foreground/90">{card.card_summary}</p>}
          {evidence.length > 0 && (
            <ul className="space-y-2">
              {evidence.map((e, i) => (
                <li key={i} className="flex gap-2 leading-relaxed">
                  <span className="mt-1.5 w-1 h-1 rounded-full shrink-0 bg-cyan" />
                  <span>{e.point}</span>
                </li>
              ))}
            </ul>
          )}
          {card.divergence_note && (
            <p className="text-[12px] font-mono text-muted-foreground border-t border-border pt-3">
              Divergence: {card.divergence_note}
            </p>
          )}
          {card.source_question && (
            <p className="text-[11px] font-mono text-muted-foreground border-t border-border pt-3">
              Socratic source: {card.source_question}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ThemedQaSection({ cards }: { cards: CuratedQaPair[] }) {
  const byTheme = useMemo(() => {
    const map = new Map<string, CuratedQaPair[]>();
    for (const c of cards) {
      const theme = c.theme ?? "Analysis";
      if (!map.has(theme)) map.set(theme, []);
      map.get(theme)!.push(c);
    }
    for (const [, arr] of map) {
      arr.sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
    }
    return [...map.entries()];
  }, [cards]);

  if (!cards.length) return null;

  return (
    <div className="relative space-y-4">
      <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan flex items-center gap-2">
        <Brain className="w-3 h-3" /> Curated Q&amp;A Insights
        <span className="text-muted-foreground normal-case tracking-wider">· grouped by theme</span>
      </div>
      {byTheme.map(([theme, themeCards]) => (
        <div key={theme} className="space-y-2">
          <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">{theme}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {themeCards.map((c) => (
              <CuratedQaCard key={`${c.question_slug}-${c.id ?? c.rank}`} card={c} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function historySparklinePoints(
  history: TopicHistoryPoint[],
  segmentKey?: string,
): string | null {
  const pts = [...history].reverse();
  if (pts.length < 2) return null;
  const values = pts.map((h) => {
    if (segmentKey && h.segmented_sentiment) {
      const raw = h.segmented_sentiment[segmentKey];
      if (typeof raw === "number") return raw;
      if (raw && typeof raw === "object" && typeof raw.score === "number") return raw.score;
    }
    return typeof h.overall_sentiment?.score === "number" ? h.overall_sentiment.score : 50;
  });
  const w = 80;
  const max = values.length - 1;
  return values
    .map((v, i) => {
      const y = 22 - (v / 100) * 18;
      return `${((i * w) / max).toFixed(1)},${Math.max(2, Math.min(22, y)).toFixed(1)}`;
    })
    .join(" ");
}

function KeyStoriesRow({ stories }: { stories: string[] }) {
  const items = stories.filter((s) => typeof s === "string" && s.trim()).slice(0, 3);
  if (!items.length) return null;

  return (
    <div className="relative space-y-3">
      <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan flex items-center gap-2">
        <Flame className="w-3 h-3" /> Key Stories
        <span className="text-muted-foreground normal-case tracking-wider">· top narratives this cycle</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {items.map((story, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-secondary/30 p-3 flex gap-2.5 items-start"
          >
            <span className="text-[10px] font-mono tabular-nums text-cyan/80 mt-0.5 shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-sm text-foreground/90 leading-relaxed">{story}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroDivergenceCard({ data }: { data: AbrahamData }) {
  // Prefer `divergence_score` (latest_topic_snapshots), fall back to legacy
  // `narrative_divergence` block. Summary from narrative_divergence.summary,
  // then divergence_gap (Pass 1 Grok prose).
  let score: number | null = null;
  let label: string | null = null;
  let summary: string | null = null;
  if (typeof data.divergence_score === "number") {
    score = Math.round(data.divergence_score);
  }
  const raw = data.narrative_divergence;
  if (raw && typeof raw === "object") {
    const r = raw as { score?: number; label?: string; summary?: string };
    if (score === null && typeof r.score === "number") score = Math.round(r.score);
    if (typeof r.label === "string") label = r.label;
    if (typeof r.summary === "string") summary = r.summary;
  } else if (score === null && typeof raw === "number") {
    score = Math.round(raw);
  }
  if (!summary && typeof data.divergence_gap === "string" && data.divergence_gap.trim()) {
    summary = data.divergence_gap.trim();
  }

  const hasData = score !== null;
  const color = hasData ? divergenceColor(score!) : "var(--muted-foreground)";
  const band = hasData ? (label ?? divergenceBand(score!)) : "Awaiting backend data";

  return (
    <div className="rounded-xl border bg-background/40 backdrop-blur p-4 sm:p-5 relative overflow-hidden flex flex-col gap-3 sm:gap-4 min-h-[200px] sm:min-h-[240px]" style={{ borderColor: `${color}55` }}>
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-xl opacity-70"
        style={{ background: `radial-gradient(280px circle at 50% 0%, ${color}1f, transparent 65%)` }}
      />
      <div className="relative flex items-center justify-between gap-2 flex-wrap">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.22em]" style={{ color }}>
          <AlertTriangle className="w-3 h-3" /> Narrative Divergence
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border" style={{ color, borderColor: `${color}55`, background: `${color}14` }}>
          {band}
        </span>
      </div>

      <div className="relative flex flex-col sm:flex-row items-center gap-3 sm:gap-5 text-center sm:text-left">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0">
          <div
            className="absolute inset-0 rounded-full grid place-items-center"
            style={{ background: hasData ? `conic-gradient(${color} ${(score! ) * 3.6}deg, var(--border) 0deg)` : "var(--border)" }}
          >
            <div className="absolute inset-1.5 rounded-full bg-background grid place-items-center">
              <span className="text-3xl sm:text-4xl font-display font-semibold tabular-nums" style={{ color }}>
                {hasData ? score : "—"}
              </span>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-xl sm:text-2xl font-display font-semibold leading-tight" style={{ color }}>
            {hasData ? (label ?? divergenceBand(score!)) : "No divergence score yet"}
          </div>
          <div className="mt-1 text-[11px] sm:text-[12px] font-mono text-muted-foreground">
            Gap between citizen narrative and official narrative
          </div>
        </div>
      </div>

      <div className="relative mt-auto text-[11px] sm:text-[12px] leading-relaxed text-foreground/85 border-t border-border pt-2">
        {summary
          ? summary
          : hasData
            ? "Summary will appear here when the backend publishes a narrative-divergence note for this topic."
            : "This metric appears as soon as the backend workflow publishes a narrative-divergence score for this topic."}
      </div>
    </div>
  );
}


function LiveAbrahamPanel({
  rootKey = "Arab-Israeli Normalization / Abraham Accords",
  headerLabel = "Abraham Accords",
}: { rootKey?: string; headerLabel?: string } = {}) {
  const { data, isFallback } = useLiveTopicData(rootKey);
  const { insights: curated, qaPairs: curatedQa } = useCuratedTopicData(rootKey);
  const [history, setHistory] = useState<TopicHistoryPoint[]>([]);
  const [showRawQa, setShowRawQa] = useState(false);

  useEffect(() => {
    if (!rootKey) return;
    loadTopicHistory(rootKey, 6).then(setHistory);
  }, [rootKey]);
  if (!data) {
    const loaded = typeof window !== "undefined" && Boolean(window.dashboardData);
    if (loaded) {
      return (
        <section className="glass rounded-2xl p-6 border border-amber-signal/30 bg-amber-signal/[0.04] space-y-2">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.24em] text-amber-signal">
            <AlertTriangle className="w-3.5 h-3.5" /> {headerLabel}
          </div>
          <h3 className="text-lg font-display font-semibold text-foreground/90">
            No data yet for this month
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This topic is queued for analysis. New citizen-sentiment data will
            appear here automatically as soon as the next scheduled run completes.
          </p>
        </section>
      );
    }
    return (
      <section className="glass rounded-2xl p-5 border border-cyan/20 text-sm font-mono text-muted-foreground">
        Loading live analysis…
      </section>
    );
  }
  const os = data.overall_sentiment;
  const score = typeof os === "object" && os ? (os.score ?? 0) : 0;
  const label =
    typeof os === "object" && os ? (os.label ?? "—") : typeof os === "string" ? os : "—";
  const trend = typeof os === "object" && os ? (os.trend ?? "") : "";
  const color = sentimentColor(score);
  const segments = Object.entries(data.segmented_sentiment ?? {});
  const insights = data.key_insights ?? [];
  const sample = data.sample_size ? data.sample_size.toLocaleString() : "—";
  const narrative = data.narrative_summary ?? "";
  const questions = data.question_analysis ?? [];
  const signals = data.signals ?? null;
  const keyStories = data.top_3_key_stories ?? [];

  return (
    <section className="glass rounded-2xl p-4 sm:p-5 space-y-4 sm:space-y-5 border border-cyan/30 relative overflow-hidden">
      {/* Animated OSINT grid backdrop */}
      <div className="absolute inset-0 grid-drift pointer-events-none" />
      {/* Scanning line */}
      <div className="absolute inset-0 scan-line pointer-events-none opacity-30" />

      {/* Header strip */}
      <div className="relative flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
        <div className="inline-flex items-center gap-2 text-[9px] sm:text-[11px] font-mono uppercase tracking-[0.18em] sm:tracking-[0.24em] text-cyan leading-snug">
          <Brain className="w-3.5 h-3.5 shrink-0" />
          <span className="break-words">
            Live Pulse · {headerLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isFallback ? (
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Fallback data</span>
          ) : (
            <ContentSourceBadge source="live" />
          )}
        </div>
      </div>

      {/* Pass 2 curated hero (when available) */}
      {curated && (curated.hero_headline || curated.hero_summary) && (
        <CuratedHeroSection insights={curated} />
      )}

      {/* Small-sample warning — identical generic copy on every topic */}
      <div className="relative rounded-xl border border-amber-signal/30 bg-amber-signal/[0.06] px-4 py-3 text-[12px] font-mono text-foreground/80 leading-relaxed flex gap-2.5 items-start">
        <AlertTriangle className="w-4 h-4 text-amber-signal mt-0.5 shrink-0" />
        <span>
          Based on <span className="text-foreground font-medium tabular-nums">{sample}</span>{" "}
          recent public posts after authenticity &amp; quality filters. Samples can be smaller than
          traditional polls due to regional factors, speech realities, and quality/spam filters.
          All citizen views are paraphrased aggregates — no usernames, direct quotes, or individual
          accounts are stored. Interpret with appropriate caution. See methodology in About.
        </span>
      </div>

      {/* Two equal hero cards — Overall Sentiment + Narrative Divergence */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
        <HeroSentimentCard score={score} label={label} trend={trend} color={color} sample={sample} />
        <HeroDivergenceCard data={data} />
      </div>

      {/* Segmented sentiment */}
      {segments.length > 0 && (
        <div className="relative">
          <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan mb-2 flex items-center gap-2">
            <Users className="w-3 h-3" /> Segmented Sentiment
            <span className="text-muted-foreground normal-case tracking-wider">· public X discourse</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {segments.map(([k, raw]) => {
              const v = segScore(raw);
              const segLbl = segLabel(raw);
              const c = sentimentColor(v);
              const display = prettySegmentName(k);
              return (
                <div
                  key={k}
                  className="rounded-xl border border-border bg-background/40 backdrop-blur p-3 relative overflow-hidden"
                  style={{ borderTop: `2px solid ${c}` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-[10.5px] font-mono uppercase tracking-wider text-muted-foreground">
                      {display}
                    </div>
                    <span
                      className="w-1 h-1 rounded-full pulse-dot"
                      style={{ background: c, boxShadow: `0 0 6px ${c}` }}
                    />
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <div
                      className="text-3xl font-display font-semibold tabular-nums data-pulse"
                      style={{ color: c }}
                    >
                      {v}
                    </div>
                    {segLbl && (
                      <div className="text-[10.5px] font-mono uppercase tracking-wider" style={{ color: c }}>
                        {segLbl}
                      </div>
                    )}
                  </div>
                  {/* mini sparkline — real history when available */}
                  <svg viewBox="0 0 80 24" className="w-full h-6 mt-1">
                    {(() => {
                      const pts = historySparklinePoints(history, k);
                      return pts ? (
                        <polyline
                          points={pts}
                          fill="none"
                          stroke={c}
                          strokeWidth="1.4"
                          strokeLinecap="round"
                        />
                      ) : (
                        <line x1="4" y1="12" x2="76" y2="12" stroke="var(--border)" strokeWidth="1.4" strokeDasharray="4 4" />
                      );
                    })()}
                  </svg>
                  <div className="mt-1 h-1 rounded-full bg-border overflow-hidden relative">
                    <motion.div
                      className="h-full rounded-full bar-sweep relative"
                      initial={{ width: 0 }}
                      animate={{ width: `${v}%` }}
                      transition={{ duration: 1.1, ease: "easeOut" }}
                      style={{ background: c, boxShadow: `0 0 8px ${c}` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pass 2 insight threads, or Pass 1 key insights fallback */}
      {curated?.insight_threads && curated.insight_threads.length > 0 ? (
        <InsightThreadsSection threads={curated.insight_threads} />
      ) : (
        insights.length > 0 && (
          <div className="relative">
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan mb-2">Key Insights</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {insights.map((ins, i) => (
                <div key={i} className="rounded-xl border border-border bg-secondary/30 p-3 flex gap-2 items-start">
                  <Sparkles className="w-3.5 h-3.5 text-cyan mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground/90 leading-relaxed">{ins}</p>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* Key stories (Pass 1 top_3_key_stories) */}
      {keyStories.length > 0 && <KeyStoriesRow stories={keyStories} />}

      {/* Citizen signals (Pass 1 signals block) */}
      {signals && <SignalsStrip signals={signals} />}

      {/* Pass 2 themed Q&A, with collapsible Pass 1 raw grid */}
      {curatedQa.length > 0 ? (
        <div className="relative space-y-4">
          <ThemedQaSection cards={curatedQa} />
          {questions.length > 0 && (
            <div className="border border-border rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowRawQa((v) => !v)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground hover:bg-secondary/30 transition-colors"
              >
                <span>Raw Socratic analysis (Pass 1)</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showRawQa ? "rotate-180" : ""}`} />
              </button>
              {showRawQa && (
                <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                  {questions.map((q, i) => (
                    <QuestionThemeCard key={i} q={q} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        questions.length > 0 && (
          <div className="relative space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> Citizen Sentiment Insights
              <span className="text-muted-foreground normal-case tracking-wider">
                · {questions.length} dimensions
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
              {questions.map((q, i) => (
                <QuestionThemeCard key={i} q={q} />
              ))}
            </div>
          </div>
        )
      )}

      {/* Narrative summary */}
      {narrative && (
        <div className="relative rounded-xl border border-cyan/30 bg-cyan/[0.04] p-4 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.22em] text-cyan">
            <Brain className="w-3 h-3" /> Narrative Summary
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed">{narrative}</p>
        </div>
      )}

      {/* Footer meta */}
      <div className="relative flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border text-[11px] font-mono text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Users className="w-3 h-3 text-cyan" /> Sample size: <span className="text-foreground/90">{sample}</span>
        </span>
        <span>
          Last updated: <span className="text-foreground/90">{data.last_updated ?? "—"}</span>
        </span>
      </div>
    </section>
  );
}


// ────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────

type Tone = "emerald" | "rose" | "amber" | "cyan";

function toneVar(t: Tone): string {
  if (t === "emerald") return "var(--emerald-signal)";
  if (t === "rose") return "var(--rose-signal)";
  if (t === "amber") return "var(--amber-signal)";
  return "var(--cyan)";
}

function OverallSentiment({ score, trend, tone }: { score: number; trend: number; tone: Tone }) {
  const color = toneVar(tone);
  const TrendIcon = trend > 2 ? TrendingUp : trend < -2 ? TrendingDown : Minus;
  return (
    <section className="glass rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-5">
        <div
          className="relative w-24 h-24 rounded-full grid place-items-center"
          style={{
            background: `conic-gradient(${color} ${score * 3.6}deg, var(--border) 0deg)`,
          }}
        >
          <div className="absolute inset-1.5 rounded-full bg-background grid place-items-center">
            <span
              className="text-3xl font-display font-semibold tabular-nums"
              style={{ color, textShadow: `0 0 18px ${color}55` }}
            >
              {score}
            </span>
          </div>
        </div>
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan">Overall Citizen Sentiment</div>
          <div className="text-lg font-display font-semibold mt-1">
            {score >= 60 ? "Net positive" : score >= 40 ? "Mixed signal" : "Net negative"}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Weighted average of stability, economy & social trackers
          </div>
        </div>
      </div>
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border"
        style={{ background: `${color}1f`, color, borderColor: `${color}55` }}
      >
        <TrendIcon className="w-3.5 h-3.5" />
        {trend >= 0 ? `+${trend}` : trend} pts · 12-mo trajectory
      </div>
    </section>
  );
}

function MetricCard({ label, value, tone, hint }: { label: string; value: number; tone: Tone; hint: string }) {
  const color = toneVar(tone);
  return (
    <div className="glass rounded-2xl p-4 space-y-2.5 border-l-4" style={{ borderLeftColor: color }}>
      <div className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="flex items-baseline gap-1">
        <div
          className="text-4xl font-display font-semibold tabular-nums leading-none"
          style={{ color, textShadow: `0 0 14px ${color}66` }}
        >
          {value}
        </div>
        <span className="text-xs text-muted-foreground font-mono">/100</span>
      </div>
      <div className="h-2.5 rounded-full bg-border/60 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${color}aa, ${color})`,
            boxShadow: `0 0 10px ${color}aa`,
          }}
        />
      </div>
      <div className="text-[11px] text-muted-foreground leading-snug">{hint}</div>
    </div>
  );
}

function PathCard({
  kind,
  title,
  pathLabel,
  series,
  example,
  exampleLabel,
}: {
  kind: "positive" | "risk";
  title: string;
  pathLabel: string;
  series: number[];
  example: string;
  exampleLabel?: string;
}) {
  const color = kind === "positive" ? toneVar("emerald") : toneVar("rose");
  const Icon = kind === "positive" ? TrendingUp : TrendingDown;
  const last = series[series.length - 1];
  const first = series[0];
  const delta = last - first;
  const w = 320;
  const h = 80;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const stepX = w / (series.length - 1);
  const points = series
    .map((v, i) => {
      const x = i * stepX;
      const y = h - ((v - min) / Math.max(max - min, 1)) * (h - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="glass rounded-2xl p-5 space-y-3 border-l-2" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className="p-1.5 rounded-md border"
            style={{ background: `${color}22`, borderColor: `${color}55`, color }}
          >
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="font-display font-semibold text-lg" style={{ color }}>
            {title}
          </h3>
        </div>
        <span
          className="text-[11px] font-mono px-2 py-0.5 rounded-full border"
          style={{ background: `${color}1f`, color, borderColor: `${color}55` }}
        >
          {delta >= 0 ? `+${delta}` : delta} pts
        </span>
      </div>
      <div className="text-sm text-foreground/90 font-medium">{pathLabel}</div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[80px]">
        <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" />
      </svg>
      {exampleLabel && (
        <div className="text-[11px] font-mono uppercase tracking-[0.18em]" style={{ color }}>
          {exampleLabel}
        </div>
      )}
      <p className="text-[12px] text-muted-foreground leading-relaxed">{example}</p>
    </div>
  );
}

function SegmentedSentiment({
  overall,
  items,
  methodology,
}: {
  overall: number;
  items: { label: string; score: number; note?: string; highlight?: "high" | "low" }[];
  methodology: string;
}) {
  return (
    <section className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-cyan">
          <Users className="w-3.5 h-3.5" /> Segmented Sentiment
        </div>
        <div className="text-[10.5px] font-mono uppercase tracking-wider text-muted-foreground">
          Overall {overall}/100
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {items.map((seg) => {
          const tone: Tone =
            seg.highlight === "high"
              ? "emerald"
              : seg.highlight === "low"
                ? "rose"
                : seg.score >= 60
                  ? "emerald"
                  : seg.score >= 40
                    ? "amber"
                    : "rose";
          const color = toneVar(tone);
          return (
            <div
              key={seg.label}
              className="rounded-xl border border-border bg-secondary/30 p-3 space-y-1.5"
              style={{ borderTop: `2px solid ${color}` }}
            >
              <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-foreground/80 leading-tight">
                {seg.label.replace(/_/g, " ")}
              </div>
              <div className="flex items-baseline gap-1">
                <div
                  className="text-2xl font-display font-semibold tabular-nums leading-none"
                  style={{ color, textShadow: `0 0 10px ${color}66` }}
                >
                  {seg.score}
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">%</span>
              </div>
              <div className="h-2 rounded-full bg-border/60 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${seg.score}%`,
                    background: `linear-gradient(90deg, ${color}aa, ${color})`,
                    boxShadow: `0 0 6px ${color}88`,
                  }}
                />
              </div>
              {seg.note && <div className="text-[10.5px] text-muted-foreground leading-snug">{seg.note}</div>}
            </div>
          );
        })}
      </div>
      <div className="text-[10.5px] font-mono uppercase tracking-wider text-muted-foreground pt-1 border-t border-border">
        Methodology · {methodology}
      </div>
    </section>
  );
}

function InsightCard({
  tone,
  icon,
  title,
  bullets,
  chips,
}: {
  tone: Tone;
  icon: React.ReactNode;
  title: string;
  bullets?: string[];
  chips?: string[];
}) {
  const color = toneVar(tone);
  return (
    <div className="glass rounded-2xl p-4 space-y-3 border-l-2" style={{ borderLeftColor: color }}>
      <div className="flex items-center gap-2" style={{ color }}>
        <div className="p-1.5 rounded-md border" style={{ background: `${color}1f`, borderColor: `${color}55` }}>
          {icon}
        </div>
        <h3 className="font-display font-semibold text-sm tracking-[0.12em] uppercase">{title}</h3>
      </div>
      {bullets && bullets.length > 0 && (
        <ul className="space-y-1.5">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2 text-sm text-foreground/90 leading-relaxed">
              <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: color }} />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      {chips && chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span
              key={c}
              className="text-[11px] font-mono px-2 py-1 rounded-full border"
              style={{ background: `${color}14`, color, borderColor: `${color}44` }}
            >
              #{c.replace(/\s+/g, "")}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Insight card for question_analysis -------------------------------

function deriveInsightTitle(q: QuestionAnalysis): string {
  const first = (q.key_points ?? [])[0];
  const src = (first && first.trim()) || (q.summary ?? "").trim() || (q.answer ?? "").trim();
  if (!src) return (q.question ?? "").replace(/\?+$/, "").trim();
  // First sentence, strip trailing punctuation, cap length
  const firstSentence = src.split(/(?<=[.!?])\s+/)[0] ?? src;
  const cleaned = firstSentence.replace(/[.!?;:]+$/, "").trim();
  return cleaned.length > 110 ? cleaned.slice(0, 107).trimEnd() + "…" : cleaned;
}

function QuestionThemeCard({ q }: { q: QuestionAnalysis }) {
  const score = Math.max(0, Math.min(100, q.sentiment_score ?? 0));
  const color = sentimentColor(score);
  const summary = q.summary ?? "";
  const points = (q.key_points ?? []).slice(0, 2);
  const title = deriveInsightTitle(q);
  const variations = Array.isArray(q.notable_variations)
    ? q.notable_variations
    : q.notable_variations
      ? [q.notable_variations]
      : [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group relative h-full text-left flex flex-col rounded-2xl bg-background/40 backdrop-blur border border-border/60 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60"
          style={{
            ["--glow" as any]: color,
          }}
        >
          {/* Sentiment-colored glow on hover */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              boxShadow: `0 8px 28px -8px ${color}, 0 0 0 1px color-mix(in oklab, ${color} 45%, transparent) inset`,
            }}
          />

          {/* Progress bar at the very top */}
          <div className="relative h-1 w-full bg-border/50">
            <motion.div
              className="h-full"
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              style={{ background: color, boxShadow: `0 0 8px ${color}` }}
            />
          </div>

          {/* Left accent bar */}
          <div
            className="absolute left-0 top-1 bottom-0 w-[3px]"
            style={{ background: color, opacity: 0.9 }}
          />

          <div className="relative flex-1 flex flex-col gap-3 p-5 pl-6">
            {/* Score + sentiment pill */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-baseline gap-1.5">
                <span
                  className="text-4xl font-display font-semibold tabular-nums leading-none"
                  style={{ color }}
                >
                  {score}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                  / 100
                </span>
              </div>
              {q.sentiment_label && (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-[0.16em] border whitespace-nowrap"
                  style={{
                    background: `color-mix(in oklab, ${color} 14%, transparent)`,
                    color,
                    borderColor: `color-mix(in oklab, ${color} 38%, transparent)`,
                  }}
                >
                  {q.sentiment_label}
                </span>
              )}
            </div>

            {/* Punchy paraphrased insight title */}
            <h4 className="text-[14.5px] font-display font-semibold leading-snug text-foreground/95 line-clamp-3">
              {title}
            </h4>

            {/* 1-line summary teaser */}
            {summary && (
              <p className="text-[12px] text-foreground/65 leading-relaxed line-clamp-1">
                {summary}
              </p>
            )}

            {/* Key-point teaser pills */}
            {points.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {points.map((p, j) => (
                  <span
                    key={j}
                    title={p}
                    className="inline-flex max-w-full items-center text-[10.5px] font-mono px-2 py-0.5 rounded-full bg-cyan/[0.08] border border-cyan/25 text-cyan/90 truncate"
                  >
                    {p.length > 42 ? p.slice(0, 40) + "…" : p}
                  </span>
                ))}
              </div>
            )}

            {/* Footer hint */}
            <div className="mt-auto pt-2 flex justify-end">
              <span className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-cyan/70 group-hover:text-cyan transition-colors">
                Click for full details →
              </span>
            </div>
          </div>
        </button>
      </DialogTrigger>


      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-2xl font-display font-semibold tabular-nums"
              style={{ color }}
            >
              {score}
            </span>
            {q.sentiment_label && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-[0.16em] border"
                style={{
                  background: `color-mix(in oklab, ${color} 14%, transparent)`,
                  color,
                  borderColor: `color-mix(in oklab, ${color} 38%, transparent)`,
                }}
              >
                {q.sentiment_label}
              </span>
            )}
          </div>
          {q.question && (
            <>
              <div className="text-cyan font-mono uppercase tracking-wider text-[10px] mb-1">
                Original question
              </div>
              <DialogTitle className="text-base font-display font-semibold leading-snug text-foreground/95">
                {q.question}
              </DialogTitle>
            </>
          )}
          {!q.question && (
            <DialogTitle className="text-base font-display font-semibold leading-snug text-foreground/95">
              {deriveInsightTitle(q)}
            </DialogTitle>
          )}
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {(q.summary || q.answer) && (
            <div>
              <div className="text-cyan font-mono uppercase tracking-wider text-[10px] mb-1.5">
                {q.summary ? "Summary" : "Insight"}
              </div>
              <p className="text-[13px] text-foreground/85 leading-relaxed">{q.summary ?? q.answer}</p>
            </div>
          )}
          {q.key_points && q.key_points.length > 0 && (
            <div>
              <div className="text-cyan font-mono uppercase tracking-wider text-[10px] mb-1.5">
                Key points
              </div>
              <ul className="space-y-1.5 text-[13px] text-foreground/85 leading-relaxed">
                {q.key_points.map((p, j) => (
                  <li key={j} className="flex gap-2">
                    <span style={{ color }} className="font-mono shrink-0 mt-0.5">
                      •
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {variations.length > 0 && (
            <div>
              <div className="text-cyan font-mono uppercase tracking-wider text-[10px] mb-1.5">
                Notable variations
              </div>
              <ul className="space-y-1.5 text-[13px] text-foreground/85 leading-relaxed">
                {variations.map((p, j) => (
                  <li key={j} className="flex gap-2">
                    <span className="font-mono shrink-0 mt-0.5 text-amber-signal">▸</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


