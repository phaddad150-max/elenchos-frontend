import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  getWowTrendForTopic,
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

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
  FileDown,
} from "lucide-react";

import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { DataFreshnessBar } from "@/components/DataFreshnessBar";

import { FEATURE_TOPICS, getTopic, type FeatureTopic } from "@/lib/feature-topics";
import {
  LIVE_TOPIC_KEYS,
  isLiveTopicId,
  liveTopicConfig,
  isArchivedTopicId,
  isNewTopicBadge,
} from "@/lib/topic-catalog";
import { STATIC_TOPIC_COMMISSIONED_ARCHIVE } from "@/lib/research-desk/seeds/catalog";
import { TopicAnalysisPage } from "@/components/topic-analysis/TopicAnalysisPage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  sentimentColorCoarse,
  divergenceColor as scoreColorsDivergence,
  sentimentNetLabel,
  sentimentColor as scoreColorsSentiment,
} from "@/lib/score-colors";

/** Primary near-real-time monitor (replaces FIFA after tournament close). */
const NEAR_REALTIME_TOPIC_ID = "us-iran-confrontation";

const TOPIC_UPDATE_CADENCE: Record<string, "realtime" | "weekly" | "monthly" | "archived"> = {
  "us-iran-confrontation": "realtime",
  "fifa-world-cup-2026": "archived",
  "maritime-ai-greece": "archived",
  "arab-israeli-normalization": "weekly",
  "iranian-voices-vs-regime": "weekly",
  "elon-musk-public-voices": "weekly",
  "commercial-space-race": "weekly",
  "save-europe-act": "weekly",
  "greece-economic-recovery": "weekly",
  "us-ai-economy-boom": "weekly",
  "ai-productivity-gdp-growth": "weekly",
  "india-economic-growth-narrative": "weekly",
  "cyprus-palestine-attention-asymmetry": "weekly",
  "new-us-foreign-policy": "weekly",
  "crypto-regulation-financial-markets": "weekly",
  "eu-migration-green-divisions": "weekly",
  "government-performance-corruption": "weekly",
  "crime-safety-lawlessness": "weekly",
  "political-polarization-populism": "weekly",
  "levant-realignment": "monthly",
  "global-ai-race": "monthly",
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
  // 61–70 leaning positive → light green; 71+ full green; divergence inverted.
  if (kind === "sentiment") return sentimentColorCoarse(score);
  return scoreColorsDivergence(score);
}

function cadenceLabel(
  cadence: "realtime" | "weekly" | "monthly" | "archived",
  short = false,
): string {
  // Manual pipeline samples — not continuous live streams.
  if (short) {
    if (cadence === "realtime") return "Active";
    if (cadence === "weekly") return "Weekly";
    if (cadence === "archived") return "Archived";
    return "Monthly";
  }
  if (cadence === "realtime") return "Active sample";
  if (cadence === "weekly") return "Weekly sample";
  if (cadence === "archived") return "Archived";
  return "Monthly sample";
}

function avgDivergence(t: FeatureTopic) {
  if (!t.compare.length) return 0;
  return Math.round(t.compare.reduce((s, r) => s + r.divergence, 0) / t.compare.length);
}

/** Shared shell: nav, sample timestamp, footer. */
function TopicsShell({ children }: { children: ReactNode }) {
  const [, setTick] = useState(0);
  const [sourceUpdatedAt, setSourceUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData().then(() => setTick((n) => n + 1));
    loadDashboardOverview().then((o) =>
      setSourceUpdatedAt(o?.generated_at ?? o?.last_updated ?? null),
    );
    loadWowSentimentTrends().then(() => setTick((n) => n + 1));
  }, []);

  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1400px] mx-auto w-full px-2.5 sm:px-4 md:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6 relative flex-1 mobile-safe-bottom overflow-x-clip">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-end gap-3">
          <DataFreshnessBar sourceUpdatedAt={sourceUpdatedAt} />
        </div>
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}

/** Shared / archived commissioned topic-analysis cards (from Research Desk). */
type CommissionedArchiveCard = {
  token: string;
  title: string;
  topic: string;
  packageId: string;
  sharedAt: string | null;
  sentimentScore?: number | null;
  divergenceScore?: number | null;
};

/** Topics index: /topics */
export function TopicsListPage({ onOpen }: { onOpen: (id: string) => void }) {
  const [simMode] = useSimMode();

  return (
    <TopicsShell>
      <motion.section
        key="grid"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5 sm:space-y-6"
      >
        <header className="page-hero-banner overflow-hidden min-w-0">
          <div className="relative flex flex-col justify-center gap-1.5 sm:gap-2 p-3.5 sm:p-4 md:p-5 min-w-0 max-w-full">
            <div className="page-hero-kicker">
              <span className="w-1 h-3.5 bg-cyan rounded-sm" />
              Topics
            </div>
            <h1 className="page-hero-title text-[1.25rem] sm:text-2xl md:text-[1.85rem] lg:text-[2.15rem] break-words hyphens-auto">
              What citizens say vs{" "}
              <span className="text-cyan">official narratives</span>
            </h1>
            <p className="page-hero-sub w-full max-w-2xl whitespace-normal">
              Directional samples of public discourse on X — not national polls. Open a topic for
              scores, gaps, and insights.
            </p>
            <div className="flex flex-wrap gap-2 mt-1 min-w-0">
              <Link
                to="/research"
                className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-full border border-cyan/40 bg-cyan/10 text-cyan text-[12px] font-medium touch-manipulation"
              >
                Research Desk
              </Link>
              <Link
                to="/pro"
                className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-full border border-border text-[12px] text-muted-foreground hover:text-cyan touch-manipulation"
              >
                Private analysis on Pro
              </Link>
            </div>
          </div>
        </header>

        <h2 className="sr-only">All topics</h2>
        <TopicsFilterableGrid simMode={simMode} onOpen={onOpen} />
      </motion.section>
    </TopicsShell>
  );
}

/** Topic detail — rendered from Library (?section=topics&topic=id). */
export function TopicDetailPage({
  topicId,
  onBack,
}: {
  topicId: string;
  onBack: () => void;
}) {
  const [simMode] = useSimMode();
  const topic = getTopic(topicId);

  if (!topic) {
    return (
      <TopicsShell>
        <div className="rounded-xl border border-border bg-secondary/20 p-8 text-center space-y-4">
          <p className="text-sm font-mono text-muted-foreground">
            Topic not found: <span className="text-foreground">{topicId}</span>
          </p>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-display font-semibold border border-cyan/45 bg-cyan/10 text-cyan hover:bg-cyan/15"
          >
            <ArrowLeft className="w-4 h-4" /> Back to topics
          </button>
        </div>
      </TopicsShell>
    );
  }

  return (
    <TopicsShell>
      <TopicDetail key={topic.id} topic={topic} simMode={simMode} onBack={onBack} />
    </TopicsShell>
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
    id === "us-ai-economy-boom" ||
    id === "maritime-ai-greece"
  )
    return "Economic";
  if (id === "crime-safety-lawlessness" || id === "political-polarization-populism") return "Social";
  if (id === "fifa-world-cup-2026") return "Social";
  if (id === "elon-musk-public-voices") return "Political";
  return "Political";
}


function readWowTrend(rootKey: string): WowTrend | null {
  return getWowTrendForTopic(rootKey);
}

function TopicsFilterableGrid({
  simMode,
  onOpen,
}: {
  simMode: boolean;
  onOpen: (id: string) => void;
}) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [wowTick, setWowTick] = useState(0);
  const [dataReady, setDataReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.dashboardData),
  );
  const [commissioned, setCommissioned] = useState<CommissionedArchiveCard[]>(() =>
    STATIC_TOPIC_COMMISSIONED_ARCHIVE.map((s) => ({
      token: s.token,
      title: s.title,
      topic: s.topic,
      packageId: s.packageId,
      sharedAt: s.sharedAt,
      sentimentScore: s.sentimentScore,
      divergenceScore: s.divergenceScore,
    })),
  );

  useEffect(() => {
    let cancelled = false;
    loadDashboardData()
      .then(() => {
        if (!cancelled) setDataReady(true);
      })
      .catch(() => {
        if (!cancelled) setDataReady(true);
      });
    loadWowSentimentTrends().then(() => {
      if (!cancelled) setWowTick((n) => n + 1);
    });
    fetch("/api/research/shared?kind=topic")
      .then((r) => r.json())
      .then((data: { items?: CommissionedArchiveCard[] }) => {
        if (cancelled) return;
        const fromApi = Array.isArray(data.items) ? data.items : [];
        const byToken = new Map<string, CommissionedArchiveCard>();
        for (const s of STATIC_TOPIC_COMMISSIONED_ARCHIVE) {
          byToken.set(s.token, {
            token: s.token,
            title: s.title,
            topic: s.topic,
            packageId: s.packageId,
            sharedAt: s.sharedAt,
            sentimentScore: s.sentimentScore,
            divergenceScore: s.divergenceScore,
          });
        }
        for (const c of fromApi) {
          byToken.set(c.token, c);
        }
        setCommissioned(Array.from(byToken.values()));
      })
      .catch(() => {
        /* keep static catalog */
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
    unavailable: 3,
  };

  const { activeTopics, archivedTopics } = useMemo(() => {
    const PRIORITY = [
      NEAR_REALTIME_TOPIC_ID,
      "elon-musk-public-voices",
      "commercial-space-race",
      "greece-economic-recovery",
      "save-europe-act",
      "iranian-voices-vs-regime",
      "arab-israeli-normalization",
      "new-us-foreign-policy",
      "us-ai-economy-boom",
    ];
    const NEW_TOPIC_CARD_HEAD = [
      "cyprus-palestine-attention-asymmetry",
      "ai-productivity-gdp-growth",
      "india-economic-growth-narrative",
    ] as const;
    const prio = (id: string) => {
      const i = PRIORITY.indexOf(id);
      return i === -1 ? 99 : i;
    };
    const newRank = (id: string) => {
      const i = (NEW_TOPIC_CARD_HEAD as readonly string[]).indexOf(id);
      return i;
    };
    const cadenceRank = (id: string) => {
      const c = topicCadence(id);
      if (c === "realtime") return 0;
      if (c === "weekly") return 1;
      if (c === "monthly") return 2;
      return 3;
    };
    const available = FEATURE_TOPICS.filter((t) => bucketOf(t) !== "unavailable");
    const archived = available
      .filter((t) => isArchivedTopicId(t.id))
      .sort((a, b) => prio(a.id) - prio(b.id));
    const active = available
      .filter((t) => !isArchivedTopicId(t.id))
      .sort((a, b) => {
        const na = newRank(a.id);
        const nb = newRank(b.id);
        const aNew = na >= 0;
        const bNew = nb >= 0;
        if (aNew !== bNew) return aNew ? -1 : 1;
        if (aNew && bNew) return na - nb;
        const ca = cadenceRank(a.id);
        const cb = cadenceRank(b.id);
        if (ca !== cb) return ca - cb;
        const pa = prio(a.id);
        const pb = prio(b.id);
        if (pa !== pb) return pa - pb;
        const ba = bucketRank[bucketOf(a)];
        const bb = bucketRank[bucketOf(b)];
        if (ba !== bb) return ba - bb;
        return a.title.localeCompare(b.title);
      });
    return { activeTopics: active, archivedTopics: archived };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simMode, wowTick]);

  const topicGridClass =
    "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 auto-rows-fr items-stretch";
  const showSkeleton =
    !simMode && !dataReady && typeof window !== "undefined" && !window.dashboardData;

  const scrollCarousel = (dir: -1 | 1) => {
    const el = carouselRef.current;
    if (!el) return;
    const step = Math.min(el.clientWidth * 0.85, 320);
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const renderTopicCard = (t: FeatureTopic, i: number, archived = false, carousel = false) => {
    const liveKey = LIVE_TOPIC_KEYS[t.id]?.rootKey;
    const snap = liveKey && !simMode ? readSnapshot(liveKey) : null;
    const wow = liveKey && !simMode ? readWowTrend(liveKey) : null;
    return (
      <div
        key={t.id}
        className={
          carousel
            ? "snap-start shrink-0 w-[min(78vw,15.5rem)] sm:w-[16.25rem] md:w-[17rem] h-full"
            : "h-full min-w-0"
        }
      >
        <TopicCard
          topic={t}
          delay={Math.min(i * 0.025, 0.25)}
          cadence={archived ? "archived" : topicCadence(t.id)}
          snapshot={snap}
          wowTrend={wow}
          isNew={!archived && isNewTopicBadge(t.id)}
          archived={archived}
          onOpen={() => onOpen(t.id)}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {showSkeleton && (
        <div
          className="rounded-xl border border-cyan/25 bg-cyan/[0.04] px-3.5 py-3 text-[12px] font-mono text-muted-foreground flex items-center gap-2"
          role="status"
          aria-live="polite"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan pulse-dot shrink-0" aria-hidden />
          Loading topic samples…
        </div>
      )}

      {/* 1 · Active — carousel */}
      <section className="space-y-3" aria-labelledby="topics-active-heading">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan pulse-dot shrink-0" aria-hidden />
          <h2
            id="topics-active-heading"
            className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan"
          >
            Active topics
          </h2>
          <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
            {activeTopics.length}
          </span>
          <span className="hidden sm:inline text-[10px] font-mono text-muted-foreground">
            · Live monitors · swipe or use arrows
          </span>
          {activeTopics.length > 1 && (
            <div className="flex items-center gap-1 sm:ml-auto">
              <button
                type="button"
                onClick={() => scrollCarousel(-1)}
                className="w-9 h-9 rounded-full border border-cyan/35 bg-cyan/10 text-cyan hover:bg-cyan/20 grid place-items-center touch-manipulation"
                aria-label="Previous active topics"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel(1)}
                className="w-9 h-9 rounded-full border border-cyan/35 bg-cyan/10 text-cyan hover:bg-cyan/20 grid place-items-center touch-manipulation"
                aria-label="Next active topics"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {activeTopics.length === 0 && !showSkeleton ? (
          <div className="text-center text-xs font-mono text-muted-foreground py-10 border border-dashed border-border rounded-lg">
            No active topics yet.
          </div>
        ) : (
          <div className="relative">
            <div
              ref={carouselRef}
              className="topics-active-carousel flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 snap-x snap-mandatory custom-scroll overscroll-x-contain"
              style={{ scrollbarWidth: "thin" }}
            >
              {activeTopics.map((t, i) => renderTopicCard(t, i, false, true))}
            </div>
          </div>
        )}
      </section>

      {/* 2 · Commissioned */}
      <section className="space-y-3 pt-1" aria-labelledby="topics-commissioned-heading">
        <div className="flex items-center gap-2 flex-wrap border-t border-amber-signal/25 pt-5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-signal shrink-0" aria-hidden />
          <h2
            id="topics-commissioned-heading"
            className="text-[11px] font-mono uppercase tracking-[0.22em] text-amber-signal"
          >
            Commissioned topics
          </h2>
          <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
            {commissioned.length}
          </span>
          <span className="hidden sm:inline text-[10px] font-mono text-muted-foreground">
            · Independent reports · not live monitors
          </span>
        </div>

        {commissioned.length === 0 ? (
          <div className="rounded-xl border border-dashed border-amber-signal/25 px-4 py-8 text-center">
            <p className="text-[13px] text-muted-foreground mb-3">
              No commissioned topic reports yet.
            </p>
            <Link
              to="/pro"
              className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-full border border-amber-signal/40 bg-amber-signal/10 text-amber-signal text-[12px] font-semibold touch-manipulation"
            >
              Start on Pro
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className={topicGridClass}>
            {commissioned.map((c) => (
              <CommissionedTopicCard key={c.token} item={c} />
            ))}
          </div>
        )}
      </section>

      {/* 3 · Archived */}
      <section className="space-y-3 pt-1" aria-labelledby="topics-archived-heading">
        <div className="flex items-center gap-2 flex-wrap border-t border-border/80 pt-5">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 shrink-0" aria-hidden />
          <h2
            id="topics-archived-heading"
            className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground"
          >
            Archived topics
          </h2>
          <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
            {archivedTopics.length}
          </span>
          <span className="hidden sm:inline text-[10px] font-mono text-muted-foreground">
            · Historical · not live monitors
          </span>
        </div>

        {archivedTopics.length === 0 ? (
          <div className="text-center text-xs font-mono text-muted-foreground py-8 border border-dashed border-border rounded-lg">
            No archived topics.
          </div>
        ) : (
          <div className={`${topicGridClass} opacity-90`}>
            {archivedTopics.map((t, i) => renderTopicCard(t, i, true, false))}
          </div>
        )}
      </section>
    </div>
  );
}

function resolveTopicScores(
  snapshot: TopicSnapshot | null | undefined,
  wowTrend: WowTrend | null | undefined,
  topic: FeatureTopic,
) {
  const os = snapshot?.overall_sentiment;
  const sentiment =
    typeof os === "object" && os && typeof os.score === "number" ? Math.round(os.score) : undefined;
  const divergence = readDivergenceScore(snapshot);
  const sentimentTone =
    typeof sentiment === "number" ? scoreTone(sentiment, "sentiment") : "var(--muted-foreground)";
  const divergenceTone =
    typeof divergence === "number"
      ? scoreTone(divergence, "divergence")
      : "var(--muted-foreground)";
  let resolvedWow: WowTrend | null = wowTrend ?? null;
  if (!resolvedWow) {
    const liveRoot = LIVE_TOPIC_KEYS[topic.id]?.rootKey;
    resolvedWow = getWowTrendForTopic(liveRoot) ?? getWowTrendForTopic(topic.title);
  }
  if (!resolvedWow) {
    const label =
      typeof os === "object" && os && typeof os.trend === "string" ? os.trend : null;
    if (label) {
      if (/increas|improv|up|ris|gain/i.test(label))
        resolvedWow = { delta: null, direction: "up" };
      else if (/decreas|declin|down|fall|wors/i.test(label))
        resolvedWow = { delta: null, direction: "down" };
      else if (/stable|flat|steady|unchang/i.test(label))
        resolvedWow = { delta: null, direction: "flat" };
    }
  }
  return { sentiment, divergence, sentimentTone, divergenceTone, resolvedWow };
}

function shortTitle(t: string): string {
  const map: Record<string, string> = {
    "Arab–Israeli Normalization": "Arab–Israeli Normalization",
    "Iranian Voices vs Islamic Regime": "Iranian Voices",
    "Iranian Voices vs Regime": "Iranian Voices",
    "Greece Economic Recovery: Resilience, Security & Digital Transformation": "Greece Economic Recovery",
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
    "Maritime AI Industry & Greece's Global Role": "Maritime AI · Greece",
    "US-Iran Confrontation: Sanctions, Networks & Regime Pressure": "US–Iran Confrontation",
    "Public Voices on Elon Musk: Trust, Media Frames & Power": "Elon Musk · Public Voices",
    "Save Europe Act: Citizens, Media & EU Bureaucracy": "Save Europe Act",
    "Commercial Space Race: SpaceX, Rivals & Public Trust": "Commercial Space Race",
    "AI Productivity & GDP Growth: Investment Boom vs Lived Gains, Energy Constraints & Narrative Gaps":
      "AI Productivity & GDP Growth",
    "India's Economic Growth Narrative: Headline GDP, Employment Quality, AI/IT Disruption & Citizen vs Official Frames":
      "India Economic Growth Narrative",
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

/** Equal-height cards: fixed min-height + flex so every card in a row matches. */
const TOPIC_CARD_SHELL =
  "topic-card-shell group relative overflow-hidden rounded-xl md:rounded-2xl border border-cyan/35 p-2.5 sm:p-3 flex flex-col h-full min-h-[268px] sm:min-h-[280px] min-w-0 hover:border-cyan/65 md:hover:shadow-[0_0_32px_-10px_var(--cyan-glow)] transition-all touch-manipulation";

function TopicCardCadence({
  cadence,
}: {
  cadence: "realtime" | "weekly" | "monthly" | "archived" | "commissioned";
}) {
  return (
    <span
      className={`inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full ${CARD_LABEL} ${
        cadence === "realtime"
          ? "text-cyan bg-cyan/10 border border-cyan/30"
          : cadence === "commissioned"
            ? "text-amber-signal bg-amber-signal/10 border border-amber-signal/35"
            : cadence === "archived"
              ? "text-muted-foreground bg-secondary/50 border border-border/70"
              : "text-muted-foreground bg-background/50 border border-border/50"
      }`}
    >
      {cadence === "realtime" && (
        <span className="w-1.5 h-1.5 rounded-full bg-cyan pulse-dot shrink-0" />
      )}
      <span>
        {cadence === "commissioned" ? "Commissioned" : cadenceLabel(cadence, true)}
      </span>
    </span>
  );
}

/** Commissioned report card — amber chrome (distinct from active cyan). */
function CommissionedTopicCard({
  item,
}: {
  item: CommissionedArchiveCard;
  delay?: number;
}) {
  const sent =
    typeof item.sentimentScore === "number" ? Math.round(item.sentimentScore) : undefined;
  const div =
    typeof item.divergenceScore === "number" ? Math.round(item.divergenceScore) : undefined;
  const sentColor =
    typeof sent === "number"
      ? scoreColorsSentiment(sent)
      : "var(--muted-foreground)";
  const divColor =
    typeof div === "number" ? scoreColorsDivergence(div) : "var(--muted-foreground)";

  return (
    <div className="h-full min-w-0">
      <Link
        to="/research/report/$token"
        params={{ token: item.token }}
        className={`${TOPIC_CARD_SHELL} topic-card-commissioned no-underline text-inherit opacity-100 w-full`}
        style={{ opacity: 1 }}
      >
        <div className="flex flex-col items-center gap-1.5 shrink-0 w-full">
          <TopicCardCadence cadence="commissioned" />
          <h3 className={`${CARD_TITLE} line-clamp-2 px-0.5`}>{item.topic || item.title}</h3>
        </div>
        <div className="h-8 w-full shrink-0 flex items-center justify-center" aria-hidden>
          <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-amber-signal/80">
            Independent report
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1 flex-1 min-h-0 content-center">
          <TopicCardScore label="Sentiment" shortLabel="Sent." value={sent} color={sentColor} />
          <TopicCardScore label="Divergence" shortLabel="Div." value={div} color={divColor} />
        </div>
        <div className="mt-auto pt-2 shrink-0 w-full relative z-10">
          <span
            className={`${CARD_CTA} border border-amber-signal/40 bg-amber-signal/10 text-amber-signal group-hover:bg-amber-signal group-hover:text-background`}
          >
            Open report →
          </span>
        </div>
      </Link>
    </div>
  );
}

function TopicCardScore({
  label,
  shortLabel,
  value,
  color,
  hint,
}: {
  label: string;
  shortLabel: string;
  value: number | undefined;
  color: string;
  hint?: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center px-0.5 min-w-0 h-full gap-1.5"
      title={hint}
    >
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
  isNew = false,
  archived = false,
}: {
  topic: FeatureTopic;
  delay: number;
  onOpen: () => void;
  snapshot?: TopicSnapshot | null;
  wowTrend?: WowTrend | null;
  cadence?: "realtime" | "weekly" | "monthly" | "archived";
  isNew?: boolean;
  archived?: boolean;
}) {
  const { sentiment, divergence, sentimentTone, divergenceTone, resolvedWow } =
    resolveTopicScores(snapshot, wowTrend, topic);
  const category = topicCategory(topic.id);

  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ delay }}
      onClick={onOpen}
      className={`${TOPIC_CARD_SHELL} w-full min-w-0 ${archived ? "topic-card-archived" : ""}`}
    >
      {/* Slot 1 — meta (fixed height, centered) */}
      <div className="h-9 shrink-0 flex flex-col items-center justify-center gap-1">
        <span className={`${CARD_LABEL} text-cyan truncate max-w-full`}>{category}</span>
        <div className="flex items-center justify-center gap-1 min-h-[1.25rem]">
          <TopicCardCadence cadence={cadence} />
          {isNew && (
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-[0.14em] leading-none text-background bg-cyan border border-cyan/50 shrink-0"
              aria-label="New topic"
            >
              New
            </span>
          )}
        </div>
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
      <div className="h-[4.5rem] shrink-0 w-full">
        <div className="grid grid-cols-2 h-full w-full divide-x divide-border/60 items-center justify-items-center">
          <TopicCardScore
            label="Sentiment"
            shortLabel="Sent."
            value={sentiment}
            color={sentimentTone}
            hint="Citizen lean in the sample (0–100). Higher = more positive public tone."
          />
          <TopicCardScore
            label="Divergence"
            shortLabel="Div."
            value={divergence}
            color={divergenceTone}
            hint="Gap vs official/media frames (0–100). Higher = bigger citizen–official split."
          />
        </div>
      </div>

      {/* Slot 4 — CTA always visible (not clipped by fixed card height) */}
      <div className="mt-auto pt-2 shrink-0 w-full">
        <span
          className={`${CARD_CTA} bg-cyan/15 text-cyan border border-cyan/40 group-hover:bg-cyan group-hover:text-primary-foreground active:bg-cyan active:text-primary-foreground transition-all`}
        >
          <span className="md:hidden">Open report →</span>
          <span className="hidden md:inline">Open report →</span>
        </span>
      </div>
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
  const color = scoreColorsSentiment(score);

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
  const shareUrl = `https://elenchos.live/research/topic/${encodeURIComponent(topic.id)}`;
  const liveSampleOk =
    useLive &&
    Boolean(liveData) &&
    ((typeof liveData?.sample_size === "number" && liveData.sample_size > 0) ||
      (typeof liveData?.fetched_post_count === "number" && liveData.fetched_post_count > 0));
  const liveDiv =
    liveSampleOk && liveData && typeof liveData.divergence_score === "number" && Number.isFinite(liveData.divergence_score)
      ? Math.round(liveData.divergence_score)
      : null;
  const liveGap =
    liveSampleOk && liveData && typeof liveData.divergence_gap === "string"
      ? liveData.divergence_gap.trim()
      : "";
  const liveNd =
    liveSampleOk && liveData && liveData.narrative_divergence && typeof liveData.narrative_divergence === "object"
      ? liveData.narrative_divergence
      : null;
  const shareText = (() => {
    const title = shortTitle(topic.title);
    if (liveSampleOk && typeof liveScore === "number" && Number.isFinite(liveScore)) {
      const bits = [
        `${title} · Sentiment ${Math.round(liveScore)}/100${liveLabel ? ` (${liveLabel})` : ""}`,
      ];
      if (liveDiv != null) bits[0] += ` · Gap ${liveDiv}`;
      const citizen = liveNd?.citizen_frame?.trim();
      const official = liveNd?.official_media_frame?.trim();
      if (citizen && official) {
        bits.push(`Citizens: ${citizen.slice(0, 90)}`);
        bits.push(`Official/media: ${official.slice(0, 90)}`);
      } else if (liveGap) {
        bits.push(liveGap.split(/(?<=[.!?])\s+/)[0]?.slice(0, 120) ?? liveGap.slice(0, 120));
      }
      bits.push("via @ElenchosPulse");
      return bits.join("\n");
    }
    return `${title} · Elenchos Research Library. via @ElenchosPulse`;
  })();
  const shareHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  const sentimentTone =
    overallSentiment >= 71 ? "emerald" : overallSentiment >= 61 ? "emerald" : overallSentiment >= 41 ? "amber" : "rose";

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
              Editorial preview sample — not a live public discourse run
            </span>
          )}
          {isArchivedTopicId(topic.id) && (
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] px-2 py-0.5 rounded-full border border-border text-muted-foreground">
              Archived
            </span>
          )}
        </div>
      </header>

      {/* Archived FIFA: full archive PDF only */}
      {topic.id === "fifa-world-cup-2026" && (
        <div className="rounded-xl border border-cyan/30 bg-cyan/[0.06] px-4 py-3.5 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="p-2 rounded-lg border border-cyan/35 bg-background/60 shrink-0">
              <FileDown className="w-4 h-4 text-cyan" />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-cyan">
                Archive report
              </div>
              <p className="text-sm text-foreground/90 leading-snug">
                Full fan-discourse retrospective: sentiment trajectory, narrative gaps, and curated synthesis from X.
              </p>
              <p className="text-[11px] font-mono text-muted-foreground">
                PDF · paraphrased aggregates only · not affiliated with FIFA · elenchos.live
              </p>
            </div>
          </div>
          <a
            href="/reports/fifa-world-cup-2026-archive.pdf"
            download="Elenchos_FIFA_World_Cup_2026_Archive_Report.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 shrink-0 px-4 py-2.5 rounded-full text-[12px] font-mono font-semibold border border-cyan/45 bg-cyan/15 text-cyan hover:bg-cyan/20 active:bg-cyan/25 transition-colors min-h-[44px] sm:min-h-0 touch-manipulation"
          >
            <FileDown className="w-3.5 h-3.5" />
            Download full report
          </a>
        </div>
      )}

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
                <Sparkles className="w-3 h-3" /> Key signals
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
            <span className="text-amber-signal font-medium">Bottom line:</span> {topic.takeaway}
          </p>
          <div className="text-[10.5px] font-mono uppercase tracking-wider text-muted-foreground pt-1 border-t border-border">
            Sample: {topic.sampleSize} · Confidence: {topic.confidence ?? (gap > 25 ? "High" : "Moderate")}
          </div>
        </section>
      )}

      {/* Feedback */}
      <section className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 rounded-2xl border border-border bg-secondary/30">
        <span className="text-sm text-muted-foreground">Was this briefing useful?</span>
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

      <section className="rounded-xl border border-cyan/30 bg-cyan/[0.05] px-4 py-4 space-y-2">
        <p className="text-[12px] sm:text-[13px] text-foreground/90 leading-relaxed">
          Run this analysis style on a topic you choose, or return to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          <Link
            to="/pro"
            className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-full border border-cyan/40 bg-cyan/12 text-cyan text-[12px] font-medium touch-manipulation"
          >
            Private analysis on Pro
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-full border border-border text-muted-foreground text-[12px] touch-manipulation"
          >
            Homepage
          </Link>
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
  | "fetched_post_count"
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
  return scoreColorsSentiment(score);
}

// Higher divergence == more concern. Color-coded with the same palette
// used across the dashboard: green low, amber medium, red high.
function divergenceColor(score: number): string {
  return scoreColorsDivergence(score);
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
        <span className="inline-flex items-center gap-1 text-muted-foreground">Latest sample</span>
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
  const styles: Record<ContentSource, { label: string; color: string }> = {
    live: {
      label: compact ? "Sample" : "Latest sample",
      color: "var(--emerald-signal)",
    },
    curated: {
      label: compact ? "Curated" : "Human-reviewed synthesis",
      color: "var(--cyan)",
    },
    static: {
      label: compact ? "Preview" : "Illustrative preview",
      color: "var(--amber-signal)",
    },
    loading: {
      label: compact ? "Loading" : "Loading sample",
      color: "var(--muted-foreground)",
    },
  };
  const s = styles[source];
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider"
      style={{ color: s.color }}
    >
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
  const band = hasData ? (label ?? divergenceBand(score!)) : "No score yet";

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
            ? "A short note on this gap will appear when the next analysis sample includes one."
            : "This metric appears when a narrative-divergence score is available for this topic."}
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
            {headerLabel}
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

      <div className="relative rounded-xl border border-border bg-secondary/25 px-4 py-2.5 text-[12px] text-muted-foreground leading-relaxed">
        Based on{" "}
        <span className="text-foreground font-medium tabular-nums">{sample}</span> filtered public
        posts. A focused sample, not a census. Views are paraphrased aggregates.{" "}
        <Link to="/about" className="text-cyan hover:underline">
          How it works
        </Link>
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
            {sentimentNetLabel(score)}
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
                : seg.score >= 61
                  ? "emerald"
                  : seg.score >= 41
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


