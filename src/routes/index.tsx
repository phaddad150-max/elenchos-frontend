import { createFileRoute } from "@tanstack/react-router";
import { cleanHeadline } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Brain,
  ChevronDown,
  FileStack,
  Globe2,
  Layers,
  MapPin,
  MapPinned,
  Radio,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Flame,
  ShieldAlert,
  ShieldCheck,
  LineChart,
  Users,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { CitizenSignalModal } from "@/components/CitizenSignalModal";

import {
  seedSignals,
  generateSignal,
  generateFlips,
  SUBREGIONS,
  type Signal,
  type Sentiment,
  type Intensity,
  type Subregion,
} from "@/lib/sim-data";

import { Globe3D } from "@/components/Globe3D";
import { SignalModal } from "@/components/SignalModal";
import { TopicRequestModal } from "@/components/TopicRequestModal";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { TeaserLock } from "@/components/TeaserLock";
import { DataFreshnessBar } from "@/components/DataFreshnessBar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { sentimentTone as sharedSentimentTone } from "@/lib/score-colors";
import { LIVE_TOPIC_KEYS, activeLiveTopicCount, isArchivedTopicId } from "@/lib/topic-catalog";
import { listResearchBriefs } from "@/lib/research-catalog";
import {
  accumulateTotalSampleAnalyzed,
  appendKpiHistory,
  peekTotalSampleAnalyzed,
  readKpiHistory,
} from "@/lib/kpi-history";
import { useCountUp } from "@/hooks/use-count-up";

import {
  loadCuratedHighlights,
  loadDashboardData,
  loadDashboardOverview,
  loadCitizenSignals,
  useSimMode,
  CANONICAL_TOPICS,
  normalizeTopicKey,
  isLiveOutputTopic,
  type CuratedTopicInsights,
  type DashboardOverview,
  type IntelFeedItem,
  type TopicSnapshot,
  type CitizenSignal,
  type FeedCitizenSignal,
} from "@/lib/dashboard-data";
import { Compass } from "lucide-react";
import {
  extractPeaceCountries,
  extractRankedLeaders,
  fetchLatestTrackers,
} from "@/lib/trackers-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Elenchos · Real Citizen Voices vs Official Narratives" },
      {
        name: "description",
        content:
          "Citizen sentiment analysis and narrative gaps, powered by AI. Compare public opinion on X against official statements across global topics, leader trust rankings and the Middle East peace tracker.",
      },
      { property: "og:title", content: "Real Citizen Voices vs Official Narratives · Elenchos" },
      {
        property: "og:description",
        content:
          "Public discourse samples on X: citizen sentiment, narrative gaps, and trackers for ordinary citizens.",
      },
      { property: "og:url", content: "https://elenchos.live/" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/" }],
  }),

  // Dashboard overview is the default landing page for elenchos.live
  component: Dashboard,
});

const SECTORS = ["GOV", "DIP", "SEC", "ECO", "HEA", "MED"] as const;
function sectorFor(topic: string) {
  let h = 0;
  for (let i = 0; i < topic.length; i++) h = (h * 31 + topic.charCodeAt(i)) | 0;
  return SECTORS[Math.abs(h) % SECTORS.length];
}

const SENTIMENT_MAP: Record<string, Sentiment> = {
  supportive: "supportive",
  positive: "supportive",
  hopeful: "hopeful",
  neutral: "neutral",
  mixed: "neutral",
  critical: "critical",
  negative: "critical",
  outraged: "outraged",
};
const INTENSITY_MAP: Record<string, Intensity> = {
  low: "low",
  medium: "medium",
  high: "high",
  critical: "critical",
};

function inferSubregion(region: string): Subregion {
  const r = region.toLowerCase();
  if (/gcc|riyadh|doha|abu dhabi|manama|kuwait|muscat|saudi/.test(r)) return "GCC States";
  if (/iran|tehran|gulf|basra|hormuz/.test(r)) return "Persian Gulf";
  if (/israel|tel aviv|cyprus|greece|nicosia|istanbul|alexandria|mediterranean/.test(r))
    return "Eastern Mediterranean";
  return "Levant Core";
}

function intelToSignal(item: IntelFeedItem, i: number): Signal {
  const sentiment = SENTIMENT_MAP[(item.sentiment ?? "neutral").toLowerCase()] ?? "neutral";
  const intensity = INTENSITY_MAP[(item.intensity ?? "medium").toLowerCase()] ?? "medium";
  const intensityScore =
    typeof item.intensityScore === "number"
      ? item.intensityScore
      : intensity === "critical" ? 0.92 : intensity === "high" ? 0.72 : intensity === "medium" ? 0.5 : 0.25;
  return {
    id: item.id ?? `live-${i}`,
    topic: item.topic ?? "Unknown topic",
    region: item.region ?? "—",
    subregion: inferSubregion(item.region ?? ""),
    lat: item.lat ?? 30,
    lng: item.lng ?? 40,
    sentiment,
    intensity,
    intensityScore,
    engagement: item.engagement ?? 0,
    posts: item.posts ?? 0,
    divergence: typeof item.divergence === "number" ? (item.divergence > 1 ? item.divergence / 100 : item.divergence) : 0.5,
    velocity: item.velocity ?? 0,
    headline: item.headline ?? item.topic ?? "Live signal",
    excerpt: item.excerpt ?? "",
    source: item.source ?? "Live citizen signal",
    timestamp: item.timestamp ?? Date.now(),
  };
}

// Deterministic geographic anchor for a canonical topic, so the globe
// can plot real citizen_signals rows even when the backend hasn't
// published an intel_feed. Anchors are visualization only — every score,
// sample size and headline still comes verbatim from Supabase.
const TOPIC_ANCHORS: Record<string, { region: string; subregion: Subregion; lat: number; lng: number }> = {
  "Arab-Israeli Normalization / Abraham Accords": { region: "Riyadh", subregion: "GCC States", lat: 24.71, lng: 46.68 },
  "Iranian Voices vs Regime": { region: "Tehran", subregion: "Persian Gulf", lat: 35.69, lng: 51.39 },
  "Greece Economic Recovery: Resilience, Security & Digital Transformation": { region: "Athens", subregion: "Eastern Mediterranean", lat: 37.98, lng: 23.72 },
  "Eastern Mediterranean Alliance (Israel-Greece-Cyprus)": { region: "Nicosia", subregion: "Eastern Mediterranean", lat: 35.17, lng: 33.36 },
  "Trump Administration Actions & US Politics": { region: "Washington", subregion: "Eastern Mediterranean", lat: 38.9, lng: -77.03 },
  "Crypto Regulation & Financial Markets Volatility": { region: "New York", subregion: "Eastern Mediterranean", lat: 40.71, lng: -74.0 },
  "Migration, Green Policies & Internal EU Divisions": { region: "Brussels", subregion: "Eastern Mediterranean", lat: 50.85, lng: 4.35 },
  "Government Performance, Corruption & Scandals": { region: "Rome", subregion: "Eastern Mediterranean", lat: 41.9, lng: 12.5 },
  "Crime, Safety & Lawlessness": { region: "London", subregion: "Eastern Mediterranean", lat: 51.51, lng: -0.13 },
  "Political Polarization & Populism Rise": { region: "Paris", subregion: "Eastern Mediterranean", lat: 48.86, lng: 2.35 },
  "Global AI Race": { region: "San Francisco", subregion: "Eastern Mediterranean", lat: 37.77, lng: -122.42 },
  "Cuba Sanctions & the Domino Effect": { region: "Havana", subregion: "Eastern Mediterranean", lat: 23.13, lng: -82.38 },
  "US-Iran Confrontation: Sanctions, Networks & Regime Pressure": {
    region: "Washington DC",
    subregion: "Eastern Mediterranean",
    lat: 38.91,
    lng: -77.04,
  },
  "Public Voices on Elon Musk: Trust, Media Frames & Power": {
    region: "Austin",
    subregion: "Eastern Mediterranean",
    lat: 30.27,
    lng: -97.74,
  },
  "US AI Economy Boom & American Technological Renaissance": { region: "Austin", subregion: "Eastern Mediterranean", lat: 30.27, lng: -97.74 },
};

function topicGeo(topic: string) {
  const anchor = TOPIC_ANCHORS[topic];
  if (anchor) return anchor;
  // Deterministic fallback for unknown topics.
  let h = 0;
  for (let i = 0; i < topic.length; i++) h = (h * 31 + topic.charCodeAt(i)) | 0;
  const lat = ((Math.abs(h) % 120) - 60) * 0.85;
  const lng = (((Math.abs(h >> 8) % 340) - 170));
  return { region: "Global", subregion: "Eastern Mediterranean" as Subregion, lat, lng };
}

function Dashboard() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [flips, setFlips] = useState<ReturnType<typeof generateFlips>>([]);
  const [picked, setPicked] = useState<Signal | null>(null);
  const [pickedCitizen, setPickedCitizen] = useState<FeedCitizenSignal | null>(null);
  const [topicOpen, setTopicOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | Sentiment>("all");
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const [search] = useState("");
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [snapshots, setSnapshots] = useState<Record<string, TopicSnapshot> | null>(null);
  const [citizenSignals, setCitizenSignals] = useState<CitizenSignal[]>([]);
  const [trackerKpis, setTrackerKpis] = useState<{
    leadersRanked?: number;
    countriesMonitored?: number;
  }>({});
  const [curatedHighlights, setCuratedHighlights] = useState<CuratedTopicInsights[]>([]);
  const [simMode] = useSimMode();

  const [, setTickKey] = useState(0);

  useEffect(() => {
    loadDashboardData().then((d) => {
      setSnapshots(d ?? null);
    });
    loadDashboardOverview().then((o) => setOverview(o));
    loadCitizenSignals().then((s) => setCitizenSignals(s ?? []));
    loadCuratedHighlights(6).then(setCuratedHighlights);
    fetchLatestTrackers().then((rows) => {
      const byType = new Map(rows.map((r) => [r.tracker_type, r]));
      const leaderRow = byType.get("global_leader_trust");
      const peaceRow = byType.get("peace_normalization");
      const leaders = leaderRow ? extractRankedLeaders(leaderRow) : [];
      const peaceCountries = peaceRow ? extractPeaceCountries(peaceRow) : [];
      setTrackerKpis({
        leadersRanked: leaders.length || undefined,
        countriesMonitored: peaceCountries.length || undefined,
      });
    });
  }, []);

  // Simulated signal stream — only used when simMode is explicitly on.
  // Live data comes from Supabase (dashboard_overviews, topic_snapshots, citizen_signals).
  useEffect(() => {
    if (!simMode) return;
    setSignals(seedSignals(28));
    setFlips(generateFlips(4));
    const t = setInterval(() => {
      setSignals((prev) => [generateSignal(), ...prev].slice(0, 60));
      setTickKey((k) => k + 1);
      if (Math.random() > 0.8) setFlips(generateFlips(4));
    }, 6000);
    return () => clearInterval(t);
  }, [simMode]);

  // Live signals — derive from Supabase.
  // Preferred source: overview.intel_feed (legacy). Fallback: build from the
  // real citizen_signals rows (topic + sentiment_score + sample_size from
  // Supabase), placed geographically via topic→anchor mapping.
  const liveSignals = useMemo<Signal[]>(() => {
    if (simMode) return [];
    const seen = new Set<string>();
    const out: Signal[] = [];

    if (overview?.intel_feed?.length) {
      overview.intel_feed.forEach((it, i) => {
        if (!it?.topic || !isLiveOutputTopic(it.topic)) return;
        const sig = intelToSignal(it, i);
        if (seen.has(sig.id)) return;
        seen.add(sig.id);
        out.push(sig);
      });
      if (out.length) return out;
    }

    // Fallback path — build signals from citizen_signals (real data).
    const inline = overview?.citizen_signals ?? [];
    const source: Array<{
      topic?: string;
      sentiment_score?: number | null;
      sample_size?: number | null;
      headline?: string | null;
      summary?: string | null;
      excerpt?: string | null;
      last_updated?: string | null;
    }> = inline.length
      ? inline
      : citizenSignals.map((s) => ({
          topic: s.topic,
          sentiment_score: s.sentiment_score,
          sample_size: s.sample_size,
          headline: s.headline,
          summary: s.summary,
          excerpt: s.excerpt,
          last_updated: s.last_updated,
        }));

    source.forEach((it, i) => {
      if (!it?.topic || !isLiveOutputTopic(it.topic)) return;
      if (seen.has(it.topic)) return;
      seen.add(it.topic);
      const geo = topicGeo(it.topic);
      const score = typeof it.sentiment_score === "number" ? it.sentiment_score : 50;
      const sentiment: Sentiment =
        score >= 61 ? "supportive" : score >= 41 ? "neutral" : score >= 21 ? "critical" : "outraged";
      const intensityScore = Math.min(1, Math.abs(score - 50) / 50 + 0.35);
      const intensity: Intensity =
        intensityScore >= 0.85 ? "critical" : intensityScore >= 0.65 ? "high" : intensityScore >= 0.4 ? "medium" : "low";
      out.push({
        id: `cs-${i}-${it.topic}`,
        topic: it.topic,
        region: geo.region,
        subregion: geo.subregion,
        lat: geo.lat,
        lng: geo.lng,
        sentiment,
        intensity,
        intensityScore,
        engagement: it.sample_size ?? 0,
        posts: it.sample_size ?? 0,
        divergence: 0.5,
        velocity: 0,
        headline: (it.headline ?? it.summary ?? it.topic ?? "Citizen signal").slice(0, 140),
        excerpt: it.excerpt ?? it.summary ?? "",
        source: "Citizen signal · Supabase",
        timestamp: it.last_updated ? new Date(it.last_updated).getTime() : Date.now(),
      });
    });
    return out;
  }, [overview, simMode, citizenSignals]);

  const effectiveSignals = liveSignals.length ? liveSignals : signals;
  const isLive = !simMode && liveSignals.length > 0;

  const filtered = useMemo(() => {
    return effectiveSignals.filter((s) => {
      if (filter !== "all" && s.sentiment !== filter) return false;
      if (regionFilter && s.region !== regionFilter && s.subregion !== regionFilter) return false;
      if (topicFilter && s.topic !== topicFilter) return false;
      if (search && !`${s.topic} ${s.region} ${s.headline}`.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [effectiveSignals, filter, regionFilter, topicFilter, search]);

  const kpis = useMemo(() => {
    const coreTopics = CANONICAL_TOPICS.length;
    // Topics with at least one citizen signal — real "active" count.
    const activeTopicSet = new Set<string>();
    citizenSignals.forEach((s) => s.topic && activeTopicSet.add(s.topic));
    const activeTopics = activeTopicSet.size || coreTopics;

    // Posts: prefer overview, fall back to sum of citizen_signals.sample_size.
    const citizenPosts = citizenSignals.reduce((sum, s) => sum + (s.sample_size ?? 0), 0);
    const postsAnalyzed = overview?.total_posts_analyzed ?? citizenPosts;

    if (isLive && overview) {
      const regions = new Set(effectiveSignals.map((s) => s.region)).size || activeTopics;
      return {
        postsAnalyzed,
        topics: activeTopics,
        regions,
        highAlert: overview.high_alert_topics ?? 0,
        avgVelocity: overview.trend_velocity ?? 0,
        precision: 94.2,
      };
    }
    const regions = new Set(effectiveSignals.map((s) => s.region)).size || activeTopics;
    const highAlert = effectiveSignals.filter(
      (s) => s.intensity === "high" || s.intensity === "critical"
    ).length || citizenSignals.filter((s) => (s.sentiment_score ?? 100) < 50).length;
    const avgVelocity =
      effectiveSignals.reduce((s, x) => s + x.velocity, 0) / Math.max(effectiveSignals.length, 1);
    return { postsAnalyzed, topics: activeTopics, regions, highAlert, avgVelocity, precision: 94.2 };
  }, [effectiveSignals, isLive, overview, citizenSignals]);

  // Citizen signals: prefer the inline `citizen_signals` array on the
  // freshest dashboard_overviews row. Fall back to the citizen_signals
  // table when the overview row doesn't include it (older rows).
  const feedSignals = useMemo<FeedCitizenSignal[]>(() => {
    const inline = overview?.citizen_signals;
    if (Array.isArray(inline) && inline.length > 0) {
      return inline.map((s, i) => {
        const base: CitizenSignal = {
          id: i + 1,
          topic: s.topic ?? "Unknown topic",
          signal_type: "overall",
          sentiment_score: s.sentiment_score ?? null,
          sentiment_label: s.sentiment_label ?? null,
          trend: s.trend ?? null,
          headline: s.headline ?? null,
          summary: s.summary ?? s.excerpt ?? null,
          excerpt: s.excerpt ?? null,
          source: null,
          sample_size: s.sample_size ?? null,
          last_updated: s.last_updated ?? null,
          created_at: s.last_updated ?? null,
        };
        // Pass divergence through (kept off the typed shape but consumed
        // by the feed for sorting and the side column).
        return {
          ...base,
          ...(typeof s.divergence_score === "number" ? { divergence_score: s.divergence_score } : {}),
          ...(typeof s.narrative_divergence === "number" ? { narrative_divergence: s.narrative_divergence } : {}),
          ...(s.divergence_label ? { divergence_label: s.divergence_label } : {}),
        } as FeedCitizenSignal;
      });
    }
    return citizenSignals as FeedCitizenSignal[];
  }, [overview, citizenSignals]);

  const mergedFeedSignals = useMemo<FeedCitizenSignal[]>(() => {
    const curatedTopics = new Set(
      curatedHighlights.map((h) => h.topic).filter((t): t is string => !!t),
    );
    const fromCurated = curatedHighlights.map((h, i) =>
      curatedHighlightToFeedSignal(h, h.topic ? snapshots?.[h.topic] ?? null : null, i),
    );
    const fromCitizen = feedSignals.filter((s) => !curatedTopics.has(s.topic));
    return [...fromCurated, ...fromCitizen];
  }, [curatedHighlights, feedSignals, snapshots]);

  // Region tiles: derived strictly from dashboard_overviews.global_heatmap
  // when present. Aggregates per country: signal count + avg sentiment.
  const regionTiles = useMemo(() => {
    const heatmap = overview?.global_heatmap;
    if (Array.isArray(heatmap) && heatmap.length > 0) {
      const map = new Map<string, { name: string; posts: number; velocity: number; n: number; sum: number }>();
      heatmap.forEach((h) => {
        const name = h.country ?? "Unknown";
        if (!name || name.toLowerCase() === "global") return;
        const r = map.get(name) ?? { name, posts: 0, velocity: 0, n: 0, sum: 0 };
        r.posts += 1;
        r.n += 1;
        r.sum += typeof h.sentiment_score === "number" ? h.sentiment_score : 50;
        map.set(name, r);
      });
      return Array.from(map.values())
        .map((r) => ({ name: r.name, posts: r.posts, velocity: r.sum / Math.max(r.n, 1) - 50 }))
        .sort((a, b) => b.posts - a.posts)
        .slice(0, 8);
    }
    const map = new Map<string, { name: string; posts: number; velocity: number; n: number }>();
    effectiveSignals.forEach((s) => {
      const r = map.get(s.region) ?? { name: s.region, posts: 0, velocity: 0, n: 0 };
      r.posts += s.posts;
      r.velocity += s.velocity;
      r.n += 1;
      map.set(s.region, r);
    });
    return Array.from(map.values())
      .map((r) => ({ name: r.name, posts: r.posts, velocity: r.velocity / Math.max(r.n, 1) }))
      .sort((a, b) => b.posts - a.posts)
      .slice(0, 6);
  }, [overview, effectiveSignals]);

  const intelGroups = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => b.intensityScore - a.intensityScore);
    const critical = sorted.filter((s) => s.intensity === "critical").slice(0, 7);
    const elevated = sorted.filter((s) => s.intensity === "high").slice(0, 7);
    const monitor = sorted.filter((s) => s.intensity !== "critical" && s.intensity !== "high").slice(0, 10);
    const shown = critical.length + elevated.length + monitor.length;
    return {
      critical,
      elevated,
      monitor,
      hidden: Math.max(0, sorted.length - shown),
    };
  }, [filtered]);

  return (
    <div className="min-h-screen relative flex flex-col dash-landing">
      <div className="absolute inset-0 grid-bg opacity-12 pointer-events-none" />

      <SiteNav />
      <main className="max-w-[1600px] mx-auto w-full px-3 sm:px-4 md:px-6 py-5 sm:py-7 space-y-5 sm:space-y-6 relative flex-1 mobile-safe-bottom overflow-x-clip">
        <section className="fade-up dash-panel px-3.5 py-3 sm:px-5 sm:py-3.5">
          {/* Compact header: use full width, no empty right void */}
          <div className="flex flex-col gap-2 sm:gap-2.5 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/8 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-cyan">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-40" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan" />
                </span>
                Free public research desk
              </div>
              <DataFreshnessBar
                sourceUpdatedAt={overview?.generated_at ?? overview?.last_updated}
              />
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-2.5 lg:gap-6 min-w-0">
              <div className="min-w-0 flex-1">
                <h1 className="text-[1.35rem] sm:text-2xl md:text-[1.85rem] lg:text-[2.1rem] font-display font-semibold tracking-tight leading-[1.15] break-words">
                  Real Citizen Voices vs{" "}
                  <span className="text-cyan">Official Narratives</span>
                </h1>
                {/* Full panel width — prefer a single line on wide screens */}
                <p className="mt-1.5 text-[12.5px] sm:text-[13px] md:text-sm text-muted-foreground leading-snug w-full max-w-none lg:whitespace-nowrap lg:overflow-hidden lg:text-ellipsis">
                  Research-grade citizen intelligence — premium desk quality, free for ordinary people · structured X samples · clear limits · human-reviewed claims · directional, not a national poll.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0 lg:pb-0.5">
                <Link
                  to="/topics"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-cyan/45 bg-cyan/10 hover:bg-cyan/20 text-cyan px-3.5 py-2 text-[12px] font-medium transition-colors min-h-[40px] sm:min-h-[36px] touch-manipulation"
                >
                  Browse topics
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/research"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card hover:bg-secondary/80 text-foreground px-3.5 py-2 text-[12px] font-medium transition-colors min-h-[40px] sm:min-h-[36px] touch-manipulation"
                >
                  Research briefs
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-[12px] text-muted-foreground hover:text-foreground hover:border-cyan/40 transition-colors min-h-[40px] sm:min-h-[36px] touch-manipulation"
                >
                  Method &amp; limits
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* KPI hero — 6 equal tracking cards */}
        <DashboardKpiGrid
          overview={overview}
          snapshots={snapshots}
          trackerKpis={trackerKpis}
          curatedCount={curatedHighlights.length}
        />

        {/* Signals + heatmap (original two-column placement) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 xl:grid-cols-12 gap-3 sm:gap-4 md:gap-5"
        >
          <section className="dash-panel p-3 sm:p-4 md:p-5 xl:col-span-8 overflow-hidden min-w-0">
            <div className="flex flex-col gap-2.5 sm:gap-3 mb-3 pb-3 border-b border-border/80">
              <Header
                icon={<Radio className="w-4 h-4" />}
                title="Citizen signals"
                subtitle="From the latest sample. Tap any row for the full briefing."
              />
              <div className="overflow-x-auto -mx-1 px-1 pb-0.5 custom-scroll overscroll-x-contain">
                <CitizenGroupFilter value={topicFilter} onChange={setTopicFilter} />
              </div>
            </div>

            <TooltipProvider delayDuration={200}>
              <CitizenSignalsFeed
                onPick={setPickedCitizen}
                signals={mergedFeedSignals}
                groupFilter={topicFilter}
                fallback={
                  <div className="space-y-1.5">
                    <FeedGroup label="Critical" color="var(--rose-signal)" items={intelGroups.critical} pill="CRIT" onPick={setPicked} />
                    <FeedGroup label="Elevated" color="var(--amber-signal)" items={intelGroups.elevated} pill="ELEV" onPick={setPicked} startIndex={intelGroups.critical.length} />
                    <FeedGroup label="Monitor" color="var(--cyan)" items={intelGroups.monitor} pill="MON" onPick={setPicked} startIndex={intelGroups.critical.length + intelGroups.elevated.length} />
                  </div>
                }
                useFallback={
                  mergedFeedSignals.length === 0 &&
                  intelGroups.critical.length + intelGroups.elevated.length + intelGroups.monitor.length > 0
                }
              />
            </TooltipProvider>

            {mergedFeedSignals.length === 0 &&
              intelGroups.critical.length + intelGroups.elevated.length + intelGroups.monitor.length === 0 &&
              !simMode && (
                <p className="mt-4 text-[13px] text-muted-foreground leading-relaxed">
                  No citizen signal rows in this sample yet. Open{" "}
                  <Link to="/topics" className="text-cyan hover:underline">
                    Topics
                  </Link>{" "}
                  for full briefings, or check back after the next workflow run.
                </p>
              )}
          </section>

          <div className="xl:col-span-4 space-y-3 sm:space-y-4 min-w-0">
            <section className="dash-panel p-3 sm:p-4 relative overflow-hidden min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-border/80">
                <div className="min-w-0">
                  <div className="text-sm font-display font-semibold">Global Sentiment Heatmap</div>
                  <div className="text-[10px] sm:text-[11px] font-mono text-muted-foreground mt-0.5">
                    <span className="sm:hidden">Tap a point · {regionTiles.length} regions</span>
                    <span className="hidden sm:inline">
                      Hover a point for topic + score · {regionTiles.length} regions ·{" "}
                      {fmtNum(kpis.postsAnalyzed)} posts
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-[200px] sm:h-[280px] md:h-[300px] xl:h-[268px] rounded-xl border border-border/70 overflow-hidden globe-stage">
                <Globe3D
                  signals={effectiveSignals}
                  onPick={(s) => {
                    setRegionFilter(s.region);
                    setPicked(s);
                  }}
                />
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-[11px] font-mono">
                <LegendDot color="var(--rose-signal)" label="Critical" />
                <LegendDot color="var(--amber-signal)" label="High" />
                <LegendDot color="var(--cyan)" label="Monitor" />
              </div>
              {regionFilter && (
                <button
                  type="button"
                  onClick={() => setRegionFilter(null)}
                  className="absolute top-3 right-3 text-[11px] font-mono px-2 py-1 rounded-full bg-card border border-cyan/45 text-cyan hover:bg-cyan/10 min-h-[36px]"
                >
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {regionFilter} · clear
                </button>
              )}
            </section>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <AiAnalysisSummary
            snapshots={snapshots}
            signals={mergedFeedSignals}
            highlights={curatedHighlights}
            overview={overview}
          />
        </motion.div>

      </main>

      <SiteFooter />

      <SignalModal signal={picked} onClose={() => setPicked(null)} />
      <CitizenSignalModal
        signal={pickedCitizen}
        snapshot={
          pickedCitizen && snapshots
            ? resolveSnapshotForTopic(snapshots, pickedCitizen.topic)
            : null
        }
        onClose={() => setPickedCitizen(null)}
      />
      <TopicRequestModal open={topicOpen} onClose={() => setTopicOpen(false)} />
    </div>
  );
}

/** Match feed topic name to topic_snapshots keys (append-only history; read-only). */
function resolveSnapshotForTopic(
  snapshots: Record<string, TopicSnapshot>,
  topic: string,
): TopicSnapshot | null {
  if (snapshots[topic]) return snapshots[topic]!;
  const canonical = normalizeTopicKey(topic);
  if (canonical && snapshots[canonical]) return snapshots[canonical]!;
  for (const [k, v] of Object.entries(LIVE_TOPIC_KEYS)) {
    if (v.rootKey === topic || v.rootKey === canonical || v.headerLabel === topic) {
      if (snapshots[v.rootKey]) return snapshots[v.rootKey]!;
      void k;
    }
  }
  const lower = topic.toLowerCase();
  for (const [k, v] of Object.entries(snapshots)) {
    if (k.toLowerCase() === lower) return v;
  }
  return null;
}

// === Subcomponents ===


function Header({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-cyan">
        <div className="p-1.5 rounded-md bg-cyan/15 border border-cyan/30">{icon}</div>
        <h2 className="font-display font-semibold tracking-tight text-sm uppercase tracking-[0.18em]">
          {title}
        </h2>
      </div>
      {subtitle && <p className="text-[11px] font-mono text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

// Canonical bands: 61–70 Leaning Positive = light green (#86efac).
function sentimentTone(score?: number | null, label?: string | null): { color: string; tint: string; band: string } {
  return sharedSentimentTone(score, label);
}

function timeAgo(iso?: string | null): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  const diff = Math.max(0, Date.now() - t);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

// Trim a raw signal blurb into a single scannable line, without altering
// meaning — strip repetitive lead-ins ("Posts reveal", "Posts highlight",
// "Based on N posts…"), cut at the first sentence boundary, then hard-cap
// length. Never invents copy; only shortens what Supabase returns.
function shortenSignal(text: string): string {
  if (!text) return "";
  let t = text.trim();
  // Strip repetitive lead-ins so signals don't all start with the same words.
  t = t.replace(/^\s*based on\s+\d+\s+posts?\.?\s*(analysis\s+limited\.?)?\s*/i, "").trim();
  t = t.replace(
    /^(posts?\s+(reveal|reveals|highlight|highlights|show|shows|indicate|indicates|suggest|suggests|expose|exposes|underscore|underscores|note|notes)|citizens?\s+(voice|voices|express|expresses|share|shares|report|reports)|analysis\s+(shows?|reveals?|indicates?)|users?\s+(are|report|discuss|say|voice)|discussions?\s+(reveal|show|highlight)|sentiment\s+(is|shows?)|the\s+data\s+(shows?|reveals?)|our\s+analysis\s+(shows?|reveals?))[:,\s]+/i,
    "",
  ).trim();
  // Cut at first sentence boundary to keep only the lead sentence.
  const firstStop = t.search(/[.!?](\s|$)/);
  if (firstStop > 20) t = t.slice(0, firstStop).trim();
  // Cap at 13 words — no ellipsis, clean cut.
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length > 13) t = words.slice(0, 13).join(" ").replace(/[,;:\-–—]+$/, "").trim();
  if (t) t = t.charAt(0).toUpperCase() + t.slice(1);
  return t;
}

function sentimentScoreFromSnapshot(snapshot?: TopicSnapshot | null): number | null {
  const os = snapshot?.overall_sentiment;
  if (typeof os === "object" && os && typeof os.score === "number") return os.score;
  if (typeof os === "number") return os;
  return null;
}

function curatedHighlightToFeedSignal(
  h: CuratedTopicInsights,
  snapshot: TopicSnapshot | null,
  index: number,
): FeedCitizenSignal {
  const score = sentimentScoreFromSnapshot(snapshot);
  const divergence =
    typeof snapshot?.divergence_score === "number"
      ? snapshot.divergence_score
      : typeof h.divergence_delta === "number"
        ? Math.max(0, Math.min(100, 50 + h.divergence_delta))
        : undefined;
  const delta = h.sentiment_delta;
  const trend =
    typeof delta === "number"
      ? delta > 0
        ? "Improving"
        : delta < 0
          ? "Declining"
          : "Stable"
      : "Stable";
  const shortLine =
    shortenSignal(h.hero_headline ?? h.hero_summary ?? h.topic ?? "") ||
    h.topic ||
    "Curated signal";

  return {
    id: -(h.id ?? index + 1),
    topic: h.topic ?? "Unknown topic",
    signal_type: "curated",
    sentiment_score: score,
    sentiment_label: snapshot?.overall_sentiment && typeof snapshot.overall_sentiment === "object"
      ? snapshot.overall_sentiment.label ?? null
      : null,
    trend,
    headline: shortLine,
    summary: h.hero_summary ?? h.hero_headline ?? null,
    excerpt: h.evolution_note ?? null,
    source: "Curated · Pass 2",
    sample_size: snapshot?.sample_size ?? null,
    last_updated: h.generated_at ?? snapshot?.last_updated ?? null,
    created_at: h.generated_at ?? null,
    divergence_score: divergence,
    sentiment_delta: h.sentiment_delta,
    divergence_delta: h.divergence_delta,
    comparison_window: h.comparison_window ?? "wow",
    curated_insight: h,
  };
}

function buildCrossTopicFallback(
  overview: DashboardOverview | null,
  snapshots: Record<string, TopicSnapshot> | null,
  highlights: CuratedTopicInsights[],
  signals: FeedCitizenSignal[],
): { summary: string; findings: string[] } {
  const findings: string[] = [];

  for (const h of highlights.slice(0, 5)) {
    if (h.hero_headline) {
      findings.push(h.hero_headline);
    } else if (h.hero_summary) {
      const first = h.hero_summary.split(/(?<=[.!?])\s+/)[0]?.trim();
      if (first) findings.push(first);
    }
  }

  if (!findings.length && snapshots) {
    const snaps = Object.values(snapshots).sort(
      (a, b) => (b.divergence_score ?? 0) - (a.divergence_score ?? 0),
    );
    for (const s of snaps.slice(0, 5)) {
      const ki = s.key_insights?.find((x) => x?.trim());
      if (ki) findings.push(ki.trim());
      else if (s.narrative_summary) {
        const first = s.narrative_summary.split(/(?<=[.!?])\s+/)[0]?.trim();
        if (first) findings.push(first);
      }
    }
  }

  if (!findings.length) {
    for (const s of signals.slice(0, 5)) {
      const line = shortenSignal(s.headline ?? s.summary ?? "");
      if (line) findings.push(line);
    }
  }

  const evolutionBits = highlights
    .map((h) => h.evolution_note?.trim())
    .filter((x): x is string => !!x)
    .slice(0, 2);

  const summaryParts = evolutionBits.length
    ? evolutionBits
    : highlights
        .map((h) => h.hero_summary?.split(/(?<=[.!?])\s+/)[0]?.trim())
        .filter((x): x is string => !!x)
        .slice(0, 3);

  if (!summaryParts.length && snapshots) {
    const top = Object.values(snapshots)
      .sort((a, b) => (b.divergence_score ?? 0) - (a.divergence_score ?? 0))
      .slice(0, 2)
      .map((s) => s.narrative_summary?.split(/(?<=[.!?])\s+/)[0]?.trim())
      .filter((x): x is string => !!x);
    summaryParts.push(...top);
  }

  const k = overview?.kpis;
  const avgDiv =
    typeof k?.average_narrative_divergence === "number"
      ? Math.round(k.average_narrative_divergence)
      : null;
  const lead =
    summaryParts.length > 0
      ? summaryParts.join("\n\n")
      : avgDiv !== null
        ? `Cross-topic monitoring shows an average narrative divergence of ${avgDiv}.\n\nCitizen voices diverge from official narratives across multiple live topics.`
        : "";

  return { summary: lead, findings: findings.slice(0, 5) };
}

type TopicGroup = "Political" | "Economic" | "Social";

const TOPIC_GROUP_MAP: Record<string, TopicGroup> = {
  "Arab-Israeli Normalization / Abraham Accords": "Political",
  "Iranian Voices vs Regime": "Political",
  "Eastern Mediterranean Alliance (Israel-Greece-Cyprus)": "Political",
  "Trump Administration Actions & US Politics": "Political",
  "Crypto Regulation & Financial Markets Volatility": "Economic",
  "Migration, Green Policies & Internal EU Divisions": "Social",
  "Government Performance, Corruption & Scandals": "Political",
  "Crime, Safety & Lawlessness": "Social",
  "Political Polarization & Populism Rise": "Social",
  "Global AI Race": "Economic",
  "Cuba Sanctions & the Domino Effect": "Political",
  "US-Iran Confrontation: Sanctions, Networks & Regime Pressure": "Political",
  "Public Voices on Elon Musk: Trust, Media Frames & Power": "Political",
  "fifa-world-cup-2026": "Social",
};

function topicGroup(topic?: string | null): TopicGroup {
  if (!topic) return "Political";
  if (TOPIC_GROUP_MAP[topic]) return TOPIC_GROUP_MAP[topic];
  const t = topic.toLowerCase();
  if (/(crypto|market|economic|ai race|finance|sanction|trade|tariff)/.test(t)) return "Economic";
  if (/(crime|migration|polariz|social|safety|populism)/.test(t)) return "Social";
  return "Political";
}

function CitizenGroupFilter({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (t: string | null) => void;
}) {
  const groups: { key: TopicGroup; color: string }[] = [
    { key: "Political", color: "var(--cyan)" },
    { key: "Economic", color: "var(--amber-signal)" },
    { key: "Social", color: "var(--magenta)" },
  ];
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-mono flex-nowrap min-w-max">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`px-3 py-2 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider border transition-colors min-h-[40px] sm:min-h-0 touch-manipulation ${
          value === null
            ? "bg-cyan text-primary-foreground border-cyan"
            : "bg-transparent border-border hover:border-cyan/40 text-muted-foreground hover:text-foreground"
        }`}
      >
        All
      </button>
      {groups.map((g) => {
        const active = value === g.key;
        return (
          <button
            type="button"
            key={g.key}
            onClick={() => onChange(active ? null : g.key)}
            className="px-3 py-2 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider border transition-colors min-h-[40px] sm:min-h-0 touch-manipulation"
            style={
              active
                ? { background: g.color, color: "var(--background)", borderColor: g.color }
                : { borderColor: "var(--border)", color: "var(--muted-foreground)" }
            }
          >
            {g.key}
          </button>
        );
      })}
    </div>
  );
}


function CitizenSignalsFeed({
  signals,
  groupFilter,
  fallback,
  useFallback,
  onPick,
}: {
  signals: FeedCitizenSignal[];
  groupFilter: string | null;
  fallback: React.ReactNode;
  useFallback: boolean;
  onPick: (s: FeedCitizenSignal) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  // Dedupe to ONE signal per topic. Prefer signal_type="overall"; otherwise
  // pick the newest row. Then filter by group (Political/Economic/Social).
  const items = useMemo(() => {
    const byTopic = new Map<string, FeedCitizenSignal>();
    const filtered = signals.filter(
      (s) => !groupFilter || topicGroup(s.topic) === groupFilter,
    );
    for (const s of filtered) {
      if (!s.topic) continue;
      const existing = byTopic.get(s.topic);
      if (!existing) {
        byTopic.set(s.topic, s);
        continue;
      }
      const rank = (row: FeedCitizenSignal) =>
        row.signal_type === "curated" ? 2 : row.signal_type === "overall" ? 1 : 0;
      const existingRank = rank(existing);
      const candidateRank = rank(s);
      if (candidateRank > existingRank) {
        byTopic.set(s.topic, s);
        continue;
      }
      if (candidateRank === existingRank) {
        const ta = new Date(existing.last_updated ?? existing.created_at ?? 0).getTime();
        const tb = new Date(s.last_updated ?? s.created_at ?? 0).getTime();
        if (tb > ta) byTopic.set(s.topic, s);
      }
    }
    const out = Array.from(byTopic.values());
    // Prioritize topics with the highest divergence score (when present);
    // otherwise fall back to the freshest signals.
    const divOf = (s: FeedCitizenSignal) => {
      if (typeof s.divergence_score === "number") return s.divergence_score;
      if (typeof s.narrative_divergence === "number") return s.narrative_divergence;
      return -1;
    };
    out.sort((a, b) => {
      const da = divOf(a);
      const db = divOf(b);
      if (da !== db) return db - da;
      const ta = new Date(a.last_updated ?? a.created_at ?? 0).getTime();
      const tb = new Date(b.last_updated ?? b.created_at ?? 0).getTime();
      return tb - ta;
    });
    return out;
  }, [signals, groupFilter]);

  /** Collapsed: 4 rows so the panel height tracks the right-side heatmap. */
  const COLLAPSED = 4;

  // Live rotation — every 7s shift the queue so the panel feels alive.
  // We only rotate WITHIN the current items array; no data is invented.
  const [rotation, setRotation] = useState(0);
  useEffect(() => {
    if (expanded) return;
    const id = setInterval(() => setRotation((r) => r + 1), 7000);
    return () => clearInterval(id);
  }, [expanded, items.length]);

  const rotated = useMemo(() => {
    if (items.length <= COLLAPSED) return items;
    const offset = rotation % items.length;
    return [...items.slice(offset), ...items.slice(0, offset)];
  }, [items, rotation]);

  if (useFallback || items.length === 0) {
    return (
      <div className="max-h-[320px] overflow-y-auto custom-scroll pr-1 space-y-3">
        {useFallback ? (
          fallback
        ) : signals.length === 0 ? (
          <div className="text-center text-xs font-mono text-muted-foreground py-10 border border-dashed border-border rounded-lg">
            Loading real citizen signals from X…
          </div>
        ) : (
          <div className="text-center text-xs font-mono text-muted-foreground py-10 border border-dashed border-border rounded-lg">
            No signals for this topic yet.
          </div>
        )}
      </div>
    );
  }

  const visible = expanded ? items : rotated.slice(0, COLLAPSED);
  const hidden = Math.max(0, items.length - COLLAPSED);


  return (
    <div className="space-y-1.5">
      <motion.div layout className="space-y-1.5">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((s, i) => (
            <CitizenSignalRow key={s.id} signal={s} index={i + 1} onPick={onPick} />
          ))}
        </AnimatePresence>
      </motion.div>
      {(hidden > 0 || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full mt-1.5 text-[11px] font-mono uppercase tracking-[0.18em] py-2 rounded-lg border border-border hover:border-cyan/40 hover:text-cyan transition-colors text-muted-foreground min-h-[40px] touch-manipulation"
        >
          {expanded ? "Show less" : `Show ${hidden} more topic${hidden === 1 ? "" : "s"}`}
        </button>
      )}
    </div>
  );
}



function CitizenSignalRow({
  signal,
  index,
  onPick,
}: {
  signal: FeedCitizenSignal;
  index: number;
  onPick: (s: FeedCitizenSignal) => void;
}) {
  const tone = sentimentTone(signal.sentiment_score, signal.sentiment_label);
  const divergence =
    typeof signal.divergence_score === "number"
      ? signal.divergence_score
      : typeof signal.narrative_divergence === "number"
        ? signal.narrative_divergence
        : null;
  const divColor =
    divergence === null
      ? "var(--muted-foreground)"
      : divergence >= 60
        ? "var(--rose-signal)"
        : divergence >= 35
          ? "var(--amber-signal)"
          : "var(--emerald-signal)";
  const rawHeadline = cleanHeadline((signal.headline ?? signal.summary ?? signal.topic ?? "").trim());
  const headline = shortenSignal(rawHeadline) || signal.topic || "Citizen signal";
  const score = typeof signal.sentiment_score === "number" ? Math.round(signal.sentiment_score) : null;
  const barPct = score !== null ? Math.max(4, Math.min(100, score)) : 50;
  const trend = (signal.trend ?? "").toLowerCase();
  const delta = signal.sentiment_delta;
  const isCurated = signal.signal_type === "curated";
  const trendUp =
    typeof delta === "number" ? delta > 0 : /(rising|improving|up|positive|progress)/.test(trend);
  const trendDown =
    typeof delta === "number" ? delta < 0 : /(declining|falling|down|negative|worsening|regress)/.test(trend);
  const hasWindow = isCurated || typeof delta === "number" || !!signal.comparison_window;
  const windowLabel = (signal.comparison_window ?? "").toLowerCase() === "mom" ? "MoM" : "WoW";
  const trendTitle =
    typeof delta === "number"
      ? `${delta > 0 ? "Progressing" : delta < 0 ? "Regressing" : "Stable"} · ${windowLabel} ${delta > 0 ? "+" : ""}${delta}`
      : signal.trend ?? "Stable";
  const tooltipDetail = [
    signal.sample_size != null ? `Sample: ${signal.sample_size.toLocaleString()} posts` : null,
    signal.last_updated ? `Updated ${timeAgo(signal.last_updated)}` : null,
    divergence !== null ? `Narrative divergence: ${Math.round(divergence)}` : null,
    signal.summary?.trim() || signal.excerpt?.trim() || null,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <Tooltip>
      <TooltipTrigger asChild>
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: -3 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 3 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ x: 2, scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      onClick={() => onPick(signal)}
      className="group w-full text-left px-3 py-2.5 rounded-xl bg-card/60 border border-border/90 hover:border-cyan/45 hover:bg-card active:bg-secondary/50 transition-colors flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 cursor-pointer touch-manipulation"
    >
      <div className="flex items-center gap-3 w-full min-w-0">
      <span className="text-[11px] font-mono text-muted-foreground tabular-nums w-5 text-right shrink-0">
        {String(index).padStart(2, "0")}
      </span>
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-1.5 mb-0.5">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: tone.color }}
          />
          <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-cyan/80 truncate">
            {signal.topic}
            {isCurated && (
              <span className="ml-1.5 text-[9px] text-muted-foreground normal-case tracking-normal">
                · curated
              </span>
            )}
          </span>
        </span>
        <span className="block text-[13px] sm:text-[13.5px] font-medium leading-snug text-foreground/95 group-hover:text-foreground line-clamp-2 sm:line-clamp-1">
          {headline || signal.topic}
        </span>
      </span>
      <span
        className="sm:hidden text-[11px] font-mono tabular-nums px-2 py-1 rounded shrink-0 font-semibold"
        style={{ background: tone.tint, color: tone.color }}
      >
        {score ?? "—"}
      </span>
      </div>
      {/* Mobile metrics row */}
      <div className="md:hidden flex items-center gap-2 pl-8 w-full">
        <span className="relative flex-1 h-1.5 rounded-full bg-border overflow-hidden">
          <span className="block h-full rounded-full" style={{ width: `${barPct}%`, background: tone.color }} />
        </span>
        {divergence !== null && (
          <span
            className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded border shrink-0"
            style={{ color: divColor, borderColor: `${divColor}55`, background: `${divColor}14` }}
          >
            Δ{divergence !== null ? Math.round(divergence) : "—"}
          </span>
        )}
        <span className={`shrink-0 ${trendUp ? "text-emerald-signal" : trendDown ? "text-rose-signal" : "text-muted-foreground"}`}>
          {trendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : trendDown ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
        </span>
      </div>
      {/* Desktop sentiment bar + score + divergence + trend */}
      <span className="hidden md:flex items-center gap-2 w-[280px] shrink-0">
        <span className="relative flex-1 h-2 rounded-full bg-border overflow-hidden">
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: `${barPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="block h-full rounded-full"
            style={{ background: tone.color, boxShadow: `0 0 10px ${tone.color}99` }}
          />
          <span
            aria-hidden
            className="shimmer pointer-events-none absolute inset-0 opacity-50 group-hover:opacity-90 transition-opacity"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${tone.color}66 50%, transparent 100%)`,
              mixBlendMode: "screen",
            }}
          />
        </span>

        {score !== null && (
          <span className="text-[12px] font-mono tabular-nums w-7 text-right font-semibold" style={{ color: tone.color }}>
            {score}
          </span>
        )}
        <span
          title={divergence !== null ? `Narrative divergence: ${Math.round(divergence)}` : "Narrative divergence unavailable"}
          className="inline-flex flex-col items-end leading-tight tabular-nums px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold border"
          style={{ color: divColor, borderColor: `${divColor}55`, background: `${divColor}14` }}
        >
          <span className="text-[8.5px] uppercase tracking-wider opacity-80">Δ</span>
          <span className="text-[11px]">{divergence !== null ? Math.round(divergence) : "—"}</span>
        </span>
        <span
          title={trendTitle}
          className={`inline-flex flex-col items-center justify-center min-w-[2.25rem] leading-none gap-0.5 ${
            trendUp ? "text-emerald-signal" : trendDown ? "text-rose-signal" : "text-muted-foreground"
          }`}
        >
          {trendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : trendDown ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          {hasWindow && (
            <span className="text-[8px] font-mono uppercase tracking-wider opacity-90">{windowLabel}</span>
          )}
        </span>
      </span>
    </motion.button>
      </TooltipTrigger>
      {tooltipDetail && (
        <TooltipContent side="top" className="max-w-xs bg-background border border-cyan/30 text-foreground text-[11px] leading-relaxed">
          {tooltipDetail}
        </TooltipContent>
      )}
    </Tooltip>
  );
}

function RotatingRegionTiles({
  tiles,
  regionFilter,
  setRegionFilter,
}: {
  tiles: { name: string; posts: number; velocity: number }[];
  regionFilter: string | null;
  setRegionFilter: (r: string | null) => void;
}) {
  if (tiles.length === 0) return null;
  const visible = tiles.slice(0, 6);
  const totalPosts = visible.reduce((s, r) => s + r.posts, 0);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
          Regions in focus
        </div>
        <span className="text-[10px] font-mono text-muted-foreground inline-flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-cyan pulse-dot" />
          {visible.length} active · {fmtNum(totalPosts)} posts
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 auto-rows-fr">
        {visible.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            className="h-full"
          >
            <RegionTile
              name={r.name}
              posts={r.posts}
              velocity={r.velocity}
              onClick={() => setRegionFilter(r.name === regionFilter ? null : r.name)}
              active={regionFilter === r.name}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}


/**
 * Split dense AI cross-analysis into breathing-space blocks (one analytical point per block).
 * Prefer existing blank lines / bullets; otherwise one sentence per paragraph.
 */
function splitSummaryIntoPoints(text: string): string[] {
  const raw = text.replace(/\r\n/g, "\n").trim();
  if (!raw) return [];

  if (/\n\s*\n/.test(raw)) {
    return raw
      .split(/\n\s*\n+/)
      .map((b) => b.replace(/\s*\n\s*/g, " ").trim())
      .filter(Boolean);
  }

  // Numbered or bulleted points
  if (/(?:^|\n)\s*(?:\d+[.)]\s+|[-•*]\s+)/.test(raw)) {
    return raw
      .split(/(?:^|\n)\s*(?=\d+[.)]\s+|[-•*]\s+)/)
      .map((b) => b.replace(/\s*\n\s*/g, " ").replace(/^\d+[.)]\s*/, "").replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean);
  }

  // Single dense paragraph → one block per sentence for eye relief
  const sentences = raw.match(/[^.!?]+(?:[.!?]+(?:\s|$)|$)/g) ?? [raw];
  return sentences.map((s) => s.trim()).filter((s) => s.length > 0);
}

function findingTone(i: number): { bar: string; chip: string; soft: string } {
  const tones = [
    { bar: "from-cyan/80 to-cyan", chip: "border-cyan/40 bg-cyan/12 text-cyan", soft: "rgba(34,211,238,0.12)" },
    { bar: "from-amber-signal/80 to-amber-signal", chip: "border-amber-signal/40 bg-amber-signal/12 text-amber-signal", soft: "rgba(245,158,11,0.12)" },
    { bar: "from-emerald-signal/80 to-emerald-signal", chip: "border-emerald-signal/40 bg-emerald-signal/12 text-emerald-signal", soft: "rgba(16,185,129,0.12)" },
    { bar: "from-magenta/80 to-magenta", chip: "border-magenta/40 bg-magenta/12 text-magenta", soft: "rgba(217,70,239,0.12)" },
    { bar: "from-cyan/60 to-emerald-signal/70", chip: "border-cyan/35 bg-cyan/10 text-cyan", soft: "rgba(34,211,238,0.10)" },
  ];
  return tones[i % tones.length];
}

/** All key findings as a clear card grid (no duplicate featured stage). */
function KeyFindingsInteractive({ findings }: { findings: string[] }) {
  const [active, setActive] = useState<number | null>(0);

  if (!findings.length) return null;

  return (
    <div className="mt-5 sm:mt-6 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan">
          Key findings
        </div>
        <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
          {findings.length} insights
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {findings.map((f, i) => {
          const t = findingTone(i);
          const on = active === i;
          return (
            <motion.button
              key={i}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setActive((cur) => (cur === i ? null : i))}
              aria-pressed={on}
              className={`text-left rounded-xl border p-3.5 sm:p-4 min-h-[6.5rem] flex flex-col gap-2.5 transition-colors touch-manipulation ${
                on
                  ? "border-cyan/50 bg-cyan/10 shadow-[0_0_20px_-10px_var(--color-cyan-glow)]"
                  : "border-border/80 bg-card/40 hover:border-cyan/35 hover:bg-card/70"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[10px] font-mono uppercase tracking-[0.14em] px-1.5 py-0.5 rounded border ${
                    on ? t.chip : "border-border text-muted-foreground"
                  }`}
                >
                  Finding {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${on ? "bg-cyan pulse-dot" : "bg-border"}`}
                  aria-hidden
                />
              </div>
              <p className="text-[13px] sm:text-[13.5px] leading-relaxed text-foreground/90">
                {f}
              </p>
              <div className="mt-auto h-0.5 rounded-full bg-border/60 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${t.bar}`}
                  initial={false}
                  animate={{ width: on ? "100%" : "40%" }}
                  transition={{ duration: 0.35 }}
                />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function AiAnalysisSummary({
  overview,
  snapshots,
  signals,
  highlights,
}: {
  snapshots?: Record<string, TopicSnapshot> | null;
  signals?: FeedCitizenSignal[];
  highlights?: CuratedTopicInsights[];
  overview: DashboardOverview | null;
}) {
  const fallback = useMemo(
    () =>
      buildCrossTopicFallback(
        overview,
        snapshots ?? null,
        highlights ?? [],
        signals ?? [],
      ),
    [overview, snapshots, highlights, signals],
  );
  const summary = overview?.grok_ai_summary?.trim() || fallback.summary || null;
  const summaryPoints = useMemo(
    () => (summary ? splitSummaryIntoPoints(summary) : []),
    [summary],
  );
  const findings = fallback.findings;
  const lastUpdated = overview?.generated_at ?? overview?.last_updated ?? null;
  const k = overview?.kpis;
  return (
    <section className="dash-panel p-3.5 sm:p-5 border-l-[3px] border-l-cyan">
      <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-border/80 flex-wrap">
        <Header
          icon={<Brain className="w-4 h-4" />}
          title="AI cross-topic analysis"
          subtitle="Built from the same sample as the signals above"
        />
        <div className="flex items-center gap-2 flex-wrap">
          {lastUpdated && (
            <span className="px-2 py-1 rounded-md bg-card border border-border text-muted-foreground text-[11px] font-mono">
              Sample{" "}
              <span className="text-foreground/90" suppressHydrationWarning>
                {timeAgo(lastUpdated)}
              </span>
            </span>
          )}
        </div>
      </div>

      {summaryPoints.length > 0 ? (
        <div className="space-y-4 sm:space-y-5">
          {summaryPoints.map((point, i) => (
            <p
              key={i}
              className="text-[14px] sm:text-[15px] leading-relaxed text-foreground/90"
            >
              {point}
            </p>
          ))}
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-muted-foreground">
          No cross-topic summary in this sample yet. Topic pages still carry full briefings when data
          exists.
        </p>
      )}

      {findings.length > 0 && <KeyFindingsInteractive findings={findings} />}

      {k && (
        <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] font-mono text-muted-foreground">
          {typeof k.total_topics_monitored === "number" && (
            <span>
              Topics monitored:{" "}
              <span className="text-foreground/90 tabular-nums">{k.total_topics_monitored}</span>
            </span>
          )}
          {typeof k.regions_monitored === "number" && (
            <span>
              Regions: <span className="text-foreground/90 tabular-nums">{k.regions_monitored}</span>
            </span>
          )}
          {typeof k.total_posts_analyzed === "number" && (
            <span>
              Posts analyzed:{" "}
              <span className="text-foreground/90 tabular-nums">
                {k.total_posts_analyzed.toLocaleString()}
              </span>
            </span>
          )}
          {typeof k.signals_generated === "number" && (
            <span>
              Signals: <span className="text-foreground/90 tabular-nums">{k.signals_generated}</span>
            </span>
          )}
        </div>
      )}
    </section>
  );
}




function Pill({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      className="px-1.5 py-0.5 rounded text-[11px] uppercase tracking-wider font-mono"
      style={{ background: `${color}22`, color }}
    >
      {children}
    </span>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: color }} />
      {label}
    </span>
  );
}

function FeedGroup({
  label,
  color,
  items,
  pill,
  onPick,
  startIndex = 0,
}: {
  label: string;
  color: string;
  items: Signal[];
  pill: string;
  onPick: (s: Signal) => void;
  startIndex?: number;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] mb-1.5">
        <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: color }} />
        <span style={{ color }}>{label}</span>
        <span className="text-muted-foreground">({items.length})</span>
      </div>
      <div className="space-y-1.5">
        {items.map((s, i) => (
          <IntelRow
            key={s.id}
            signal={s}
            index={startIndex + i + 1}
            pill={pill}
            pillColor={color}
            onClick={() => onPick(s)}
          />
        ))}
      </div>
    </div>
  );
}

function IntelRow({
  signal,
  index,
  pill,
  pillColor,
  onClick,
}: {
  signal: Signal;
  index: number;
  pill: string;
  pillColor: string;
  onClick: () => void;
}) {
  const sector = sectorFor(signal.topic);
  const positive = signal.velocity > 0;
  const intensityPct = Math.round(signal.intensityScore * 100);
  const divergencePct = Math.round(signal.divergence * 100);
  // Traffic-light bar — green/amber/red on intensity score.
  const barColor =
    signal.intensityScore > 0.85
      ? "var(--rose-signal)"
      : signal.intensityScore > 0.6
        ? "var(--amber-signal)"
        : "var(--emerald-signal)";
  const tooltipDetail = [
    signal.headline || signal.excerpt,
    `${fmtNum(signal.posts)} posts · ${signal.region}`,
    `Intensity ${intensityPct} · Divergence ${divergencePct}%`,
    signal.sentiment ? `Sentiment: ${signal.sentiment}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <Tooltip>
      <TooltipTrigger asChild>
    <motion.button
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
      className="w-full text-left px-3 py-2.5 rounded-lg bg-secondary/30 border border-border hover:border-cyan/40 hover:bg-secondary/60 transition-colors flex items-center gap-3"
    >
      <span className="text-[11px] font-mono text-muted-foreground tabular-nums w-5 text-right">
        {String(index).padStart(2, "0")}
      </span>
      <span
        className="px-1.5 py-0.5 rounded text-[10.5px] font-mono uppercase tracking-wider"
        style={{ background: `${pillColor}22`, color: pillColor }}
      >
        {pill}
      </span>
      <span className="px-1.5 py-0.5 rounded text-[10.5px] font-mono uppercase tracking-wider bg-secondary border border-border text-muted-foreground">
        {sector}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium truncate">{signal.topic}</span>
        <span className="block text-[11px] font-mono text-muted-foreground">
          {fmtNum(signal.posts)} posts · {signal.region}
        </span>
      </span>
      {/* Intensity bar (traffic-light) with numeric label */}
      <span className="hidden md:flex items-center gap-1.5 w-28">
        <span className="flex-1 h-2 rounded-full bg-border overflow-hidden">
          <span
            className="block h-full rounded-full"
            style={{
              width: `${intensityPct}%`,
              background: barColor,
              boxShadow: `0 0 8px ${barColor}88`,
            }}
          />
        </span>
        <span
          className="text-[11px] font-mono tabular-nums w-7 text-right"
          style={{ color: barColor }}
        >
          {intensityPct}
        </span>
      </span>
      {/* Velocity column — clearly labeled */}
      <span className="hidden sm:flex flex-col items-end w-14 leading-tight">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          Velocity
        </span>
        <span
          className={`text-xs font-mono tabular-nums inline-flex items-center gap-0.5 ${
            positive ? "text-emerald-signal" : "text-rose-signal"
          }`}
        >
          {positive ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          {positive ? "+" : ""}
          {Math.round(signal.velocity)}%
        </span>
      </span>
      {/* Divergence column — clearly labeled */}
      <span className="hidden sm:flex flex-col items-end w-14 leading-tight">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          Divergence
        </span>
        <span className="text-xs font-mono tabular-nums text-cyan">
          {divergencePct}%
        </span>
      </span>
    </motion.button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-sm bg-background border border-cyan/30 text-foreground text-[11px] leading-relaxed">
        {tooltipDetail}
      </TooltipContent>
    </Tooltip>
  );
}


function RegionTile({
  name,
  posts,
  velocity,
  onClick,
  active,
}: {
  name: string;
  posts: number;
  velocity: number;
  onClick: () => void;
  active: boolean;
}) {
  const positive = velocity >= 0;
  return (
    <button
      onClick={onClick}
      className={`h-full w-full min-h-[108px] p-2.5 rounded-xl border bg-secondary/30 text-left flex flex-col transition-colors ${
        active
          ? "border-cyan bg-cyan/10"
          : "border-border hover:border-cyan/40 hover:bg-secondary/60"
      }`}
    >
      <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground truncate">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan pulse-dot" />
        {name}
      </div>
      <div className="text-base font-display font-semibold tabular-nums mt-0.5">
        {fmtNum(posts)}
      </div>
      <div className="text-[10.5px] font-mono text-muted-foreground">posts</div>
      <div
        className={`text-[11px] font-mono inline-flex items-center gap-0.5 mt-0.5 ${
          positive ? "text-emerald-signal" : "text-rose-signal"
        }`}
      >
        {positive ? (
          <ArrowUpRight className="w-2.5 h-2.5" />
        ) : (
          <ArrowDownRight className="w-2.5 h-2.5" />
        )}
        {positive ? "+" : ""}
        {Math.round(velocity)}%
      </div>
    </button>
  );
}

function AiInsights({
  signals,
  flips,
}: {
  signals: Signal[];
  flips: ReturnType<typeof generateFlips>;
}) {
  const top = flips[0];
  const insights = [
    {
      tag: "High Divergence Signal",
      color: "var(--rose-signal)",
      icon: Flame,
      text: `${top?.topic ?? "Houthi Red Sea Threat"} losing official traction`,
    },
    {
      tag: "Elevated Risk Signal",
      color: "var(--amber-signal)",
      icon: ShieldAlert,
      text: "Engagement spiral accelerating in 3 regions",
    },
    {
      tag: "Forward Outlook",
      color: "var(--cyan)",
      icon: LineChart,
      text: "Public trust indicators shifting in next 48 hours",
    },
    {
      tag: "Citizen-Official Gap Detected",
      color: "var(--accent)",
      icon: Sparkles,
      text: `${Math.round((signals.reduce((s, x) => s + x.divergence, 0) / Math.max(signals.length, 1)) * 100)}-pt gap: official vs citizen reality`,
    },
    {
      tag: "Notable Influence",
      color: "var(--magenta)",
      icon: Users,
      text: "Opposition gaining sustained X momentum",
    },
  ];
  return (
    <section className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <Header
          icon={<Brain className="w-4 h-4" />}
          title="Analysis & Insights"
          subtitle="From latest dashboard sample"
        />
        <span className="px-2 py-1 rounded bg-cyan/15 text-cyan border border-cyan/40 text-[11px] font-mono inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan pulse-dot" />
          {insights.length} signals
        </span>
      </div>

      <div className="space-y-2">
        {insights.map((it, i) => {
          const Icon = it.icon;
          return (
            <motion.div
              key={it.tag}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 rounded-xl bg-secondary/40 border border-border hover:border-cyan/30 transition-colors flex items-start gap-3"
            >
              <div
                className="p-1.5 rounded-md border"
                style={{
                  background: `${it.color}18`,
                  borderColor: `${it.color}55`,
                  color: it.color,
                }}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[10.5px] font-mono uppercase tracking-[0.2em]"
                  style={{ color: it.color }}
                >
                  {it.tag}
                </div>
                <div className="text-sm font-medium mt-0.5 leading-snug">{it.text}</div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground mt-1.5" />
            </motion.div>
          );
        })}
      </div>

      <button className="mt-4 w-full text-xs font-mono text-cyan inline-flex items-center justify-center gap-1.5 py-2 rounded-lg border border-cyan/30 hover:bg-cyan/10 transition-colors">
        <Sparkles className="w-3 h-3" /> Full Analysis
      </button>
    </section>
  );
}


function CitizenActionBrief({
  snapshots,
  signals,
}: {
  snapshots: Record<string, TopicSnapshot> | null;
  signals: CitizenSignal[];
}) {
  // Build observations from real backend data only:
  // - narrative_summary + key_insights from the freshest snapshots
  // - key_insight_* citizen signal rows as a secondary source
  const items = useMemo(() => {
    const out: { topic: string; title: string; body: string; color: string }[] = [];
    const palette = [
      "var(--cyan)",
      "var(--emerald-signal)",
      "var(--amber-signal)",
      "var(--rose-signal)",
      "var(--magenta)",
    ];

    const snaps = snapshots ? Object.values(snapshots) : [];
    snaps.sort((a, b) => {
      const ta = new Date(a.last_updated ?? 0).getTime();
      const tb = new Date(b.last_updated ?? 0).getTime();
      return tb - ta;
    });

    for (const s of snaps) {
      const narrative = s.narrative_summary?.trim();
      const ki = (s.key_insights ?? []).filter((x) => x && x.trim());
      if (narrative) {
        out.push({
          topic: s.topic,
          title: ki[0]?.trim() || narrative.split(/(?<=[.!?])\s+/)[0],
          body: narrative,
          color: palette[out.length % palette.length],
        });
      } else if (ki.length) {
        out.push({
          topic: s.topic,
          title: ki[0].trim(),
          body: ki.slice(1, 3).join(" ") || ki[0].trim(),
          color: palette[out.length % palette.length],
        });
      }
      if (out.length >= 5) break;
    }

    if (out.length < 5) {
      signals
        .filter((s) => s.signal_type.startsWith("key_insight") && s.summary)
        .slice(0, 5 - out.length)
        .forEach((s) => {
          const text = (s.summary ?? "").trim();
          if (!text) return;
          out.push({
            topic: s.topic,
            title: s.headline?.trim() || text.split(/(?<=[.!?])\s+/)[0],
            body: text,
            color: palette[out.length % palette.length],
          });
        });
    }

    return out.slice(0, 5);
  }, [snapshots, signals]);

  return (
    <section className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <Header
          icon={<Compass className="w-4 h-4" />}
          title="Key Observations & Implications"
          subtitle="Plain-language read of the freshest backend analysis"
        />
        <span className="px-2 py-1 rounded bg-cyan/15 text-cyan border border-cyan/40 text-[11px] font-mono inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan pulse-dot" />
          {items.length} observations
        </span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Pulling the latest observations from the backend…
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((it, i) => (
            <motion.div
              key={`${it.topic}-${i}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 rounded-xl bg-secondary/40 border border-border hover:border-cyan/30 transition-colors flex items-start gap-3"
            >
              <div
                className="p-1.5 rounded-md border shrink-0"
                style={{
                  background: `${it.color}18`,
                  borderColor: `${it.color}55`,
                  color: it.color,
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[10.5px] font-mono uppercase tracking-[0.2em]"
                  style={{ color: it.color }}
                >
                  {it.topic}
                </div>
                <div className="text-sm font-medium mt-0.5 leading-snug">{it.title}</div>
                {it.body && it.body !== it.title && (
                  <div className="text-[12px] text-muted-foreground mt-1 leading-snug">
                    {it.body}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}



function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toString();
}

function shortTopicLabel(t: string): string {
  if (t.startsWith("Arab-Israeli")) return "Normalization";
  if (t.startsWith("Iranian Voices")) return "Iran";
  if (t.startsWith("Eastern Mediterranean")) return "E. Med Alliance";
  if (t.startsWith("Trump Administration")) return "US Politics";
  if (t.startsWith("Crypto Regulation")) return "Crypto & Markets";
  if (t.startsWith("Migration, Green")) return "EU Migration";
  if (t.startsWith("Government Performance")) return "Gov. Corruption";
  if (t.startsWith("Crime, Safety")) return "Crime & Safety";
  if (t.startsWith("US-Iran Confrontation")) return "US–Iran Confrontation";
  if (t.startsWith("Public Voices on Elon Musk") || t.includes("Elon Musk")) return "Elon Musk";
  if (t.startsWith("Government Performance")) return "Gov & Corruption";
  if (t.startsWith("Political Polarization")) return "Polarization";
  if (t.startsWith("Global AI")) return "Global AI Race";
  if (t.startsWith("Cuba Sanctions")) return "Cuba Sanctions";
  return t;
}


// ── Dashboard KPI hero grid (6 equal tracking cards) ─────────────────────
// Expand shows live numbers only + links (About for method; no About-duplicate prose).

type KpiHeroFormat = "number" | "percent" | "compact";

type KpiHeroHref =
  | "/about"
  | "/research"
  | "/topics"
  | "/trackers"
  | "/trackers/leaders"
  | "/trackers/peace";

/** Optional expand-panel action. Nested Link uses stopPropagation so expand still works. */
type KpiHeroCta = {
  label: string;
  comingSoon?: boolean;
  note?: string;
  href?: KpiHeroHref;
  emphasis?: "primary" | "soft";
};

type KpiHeroLink = { label: string; href: KpiHeroHref };

type KpiHeroTileModel = {
  id: string;
  label: string;
  value: number | undefined;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  format: KpiHeroFormat;
  unit?: string;
  /** One-line live readout only (no methodology — that lives on About). */
  liveNote: string;
  /** Extra live facts (counts, run window) — keep short. */
  liveFacts?: string[];
  links?: KpiHeroLink[];
  cta?: KpiHeroCta;
};

/** Min dedicated research case studies before we hard-push /research from the hero. */
const RESEARCH_LIBRARY_CTA_MIN = 3;

function clampPct(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

/**
 * Honest *estimated* pipeline confidence for SpaceXAI / Grok on this product surface.
 *
 * This is NOT measured model accuracy and MUST NOT read like 95–99% “lab accuracy.”
 * Public discourse sampling (X + multi-source packs) is purposive, incomplete, noisy;
 * LLM reasoning is directional and interpretive; only research claims get human review.
 * Stage scores sit in realistic bands with hard caps so coverage ≠ truth.
 */
function computePipelineConfidence(args: {
  snapshots: Record<string, TopicSnapshot> | null;
  liveTopicCount: number;
  overview: DashboardOverview | null;
  researchCount: number;
}): {
  composite: number | undefined;
  fetching: number;
  cleaning: number;
  reasoning: number;
  reporting: number;
  liveFacts: string[];
} {
  const { snapshots, liveTopicCount, overview, researchCount } = args;
  const snapList = snapshots ? Object.values(snapshots) : [];
  const snapCount = snapList.length;
  const denom = Math.max(liveTopicCount, 1);
  const coverage = snapCount / denom;

  if (snapCount === 0 && !overview) {
    return {
      composite: undefined,
      fetching: 0,
      cleaning: 0,
      reasoning: 0,
      reporting: 0,
      liveFacts: ["No sample loaded yet — confidence undefined, not 100%."],
    };
  }

  let totalSample = 0;
  let thinTopics = 0;
  let reasoned = 0;
  let withDivergence = 0;
  for (const s of snapList) {
    const n =
      typeof s.fetched_post_count === "number" && s.fetched_post_count > 0
        ? s.fetched_post_count
        : typeof s.sample_size === "number"
          ? s.sample_size
          : 0;
    totalSample += n;
    if (n > 0 && n < 25) thinTopics += 1;

    const hasSentiment =
      typeof s.overall_sentiment === "object" &&
      s.overall_sentiment &&
      typeof s.overall_sentiment.score === "number";
    const hasDiv =
      typeof s.divergence_score === "number" ||
      s.narrative_divergence != null ||
      Boolean(s.divergence_gap?.trim?.());
    const hasText =
      Boolean(s.narrative_summary?.trim?.()) ||
      (Array.isArray(s.key_insights) && s.key_insights.length > 0);
    if (hasSentiment || hasDiv || hasText) reasoned += 1;
    if (hasDiv) withDivergence += 1;
  }

  const avgSample = snapCount ? totalSample / snapCount : 0;
  const reasonedShare = snapCount ? reasoned / snapCount : 0;
  const divShare = snapCount ? withDivergence / snapCount : 0;
  const thinShare = snapCount ? thinTopics / snapCount : 0;

  // Fetch — public APIs / purposive packs; rate limits; not a census of X
  // Realistic band ~45–72 even when coverage looks “full”
  let fetching = 48 + coverage * 16 + (avgSample >= 40 ? 5 : avgSample >= 15 ? 2 : 0);
  fetching = clampPct(fetching, 38, 72);

  // Clean / filter — bots, media bleed, language mix, dupes; we do not publish measured F1
  let cleaning = 50 + (avgSample >= 40 ? 6 : avgSample >= 15 ? 3 : 0) - thinShare * 12;
  cleaning = clampPct(cleaning, 36, 66);

  // Reason — SpaceXAI/Grok directional analysis; interpretive, not ground-truth verified
  let reasoning = 46 + reasonedShare * 12 + divShare * 5;
  if (avgSample < 15 && snapCount > 0) reasoning -= 4;
  reasoning = clampPct(reasoning, 38, 68);

  // Report — structured outputs; human review on research raises integrity, still provisional
  let reporting = 48;
  if (overview?.grok_ai_summary?.trim()) reporting += 7;
  if (researchCount > 0) reporting += 6; // human-reviewed research path exists
  if (snapCount > 0) reporting += 4;
  if (coverage >= 0.75) reporting += 3;
  reporting = clampPct(reporting, 40, 72);

  // Composite hard-capped: full topic coverage must never look like 98% “accuracy”
  const composite = clampPct((fetching + cleaning + reasoning + reporting) / 4, 40, 70);

  // Live readout only — full method/limits live on About (no duplicate essays here).
  const liveFacts = [
    `Est. bands — fetch ${fetching}% · clean ${cleaning}% · reason ${reasoning}% · report ${reporting}%`,
    `This page: ${snapCount}/${liveTopicCount} topics with sample rows · ${thinTopics} thin (under 25 posts)`,
    "Hard-capped ≤70%. Not lab accuracy.",
  ];

  return { composite, fetching, cleaning, reasoning, reporting, liveFacts };
}

/** Current-window sample size from snapshots + overview KPI (not cumulative). */
function currentWindowSampleSize(
  snapshots: Record<string, TopicSnapshot> | null,
  overview: DashboardOverview | null,
): number {
  let fromSnaps = 0;
  if (snapshots) {
    for (const s of Object.values(snapshots)) {
      const n =
        typeof s.fetched_post_count === "number" && s.fetched_post_count > 0
          ? s.fetched_post_count
          : typeof s.sample_size === "number"
            ? s.sample_size
            : 0;
      fromSnaps += n;
    }
  }
  const k = overview?.kpis;
  const fromOverview =
    typeof k?.total_posts_analyzed === "number"
      ? k.total_posts_analyzed
      : typeof overview?.total_posts_analyzed === "number"
        ? overview.total_posts_analyzed
        : 0;
  // Prefer the larger signal for “this run” — avoid double-counting same posts
  return Math.max(fromSnaps, fromOverview);
}

function KpiHeroTile({
  tile,
  history,
  delay = 0,
  expanded,
  onToggle,
}: {
  tile: KpiHeroTileModel;
  history: number[];
  delay?: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [flash, setFlash] = useState(false);
  const prevRef = useRef<number | undefined>(undefined);

  const numericValue =
    typeof tile.value === "number" && !Number.isNaN(tile.value) ? tile.value : undefined;
  const has = numericValue !== undefined;
  const target = has ? numericValue : 0;
  const countFormat: "number" | "compact" =
    tile.format === "compact" || (has && tile.format === "number" && numericValue >= 1000)
      ? "compact"
      : "number";
  const counted = useCountUp(target, {
    duration: 1100,
    format: countFormat,
    decimals: 0,
  });

  useEffect(() => {
    if (!has) return;
    if (prevRef.current !== undefined && prevRef.current !== numericValue) {
      setFlash(true);
      const t = window.setTimeout(() => setFlash(false), 900);
      prevRef.current = numericValue;
      return () => window.clearTimeout(t);
    }
    prevRef.current = numericValue;
  }, [has, numericValue]);

  const prevHist = history.length >= 2 ? history[history.length - 2] : undefined;
  const delta =
    has && typeof prevHist === "number" && prevHist !== numericValue
      ? numericValue - prevHist
      : null;

  const barPct =
    has && tile.format === "percent" ? Math.min(100, Math.max(0, Math.round(numericValue))) : null;

  return (
    <div
      className={`dash-kpi dash-kpi-hero relative min-w-0 w-full h-full ${
        expanded ? "dash-kpi-hero-open z-20" : "z-0"
      } ${flash ? "dash-kpi-flash" : ""}`}
    >
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.99 }}
        onClick={onToggle}
        aria-expanded={expanded}
        className="relative z-[1] w-full h-full text-left cursor-pointer flex flex-col items-center justify-between gap-1 px-2.5 py-2.5 sm:px-3 sm:py-3 min-h-[8.75rem]"
      >
        <span className="dash-kpi-glow" aria-hidden />
        <span
          className="shrink-0 w-8 h-8 rounded-lg grid place-items-center border border-cyan/35 bg-cyan/10 shadow-[0_0_16px_-6px_var(--color-cyan-glow)] group-hover:border-cyan/55 transition-colors"
          aria-hidden
        >
          <tile.icon className="w-4 h-4 text-cyan data-pulse" strokeWidth={2.2} />
        </span>
        <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground leading-tight line-clamp-2 min-h-[2rem] w-full flex items-center justify-center text-center px-0.5">
          {tile.label}
        </span>
        {has ? (
          <div
            className={`text-[1.4rem] sm:text-[1.5rem] font-display font-semibold tabular-nums leading-none tracking-tight text-cyan min-h-[1.6rem] flex items-center justify-center ${
              flash ? "ticker-flash" : ""
            }`}
            style={{ textShadow: "0 0 18px color-mix(in oklab, var(--cyan) 45%, transparent)" }}
          >
            {counted}
            {tile.format === "percent" && (
              <span className="text-xs font-mono text-muted-foreground ml-0.5">%</span>
            )}
            {tile.unit && tile.format !== "percent" && (
              <span className="text-[10px] font-mono text-muted-foreground ml-0.5">{tile.unit}</span>
            )}
          </div>
        ) : (
          <div className="text-[11px] font-mono text-muted-foreground min-h-[1.6rem] flex items-center">
            —
          </div>
        )}
        {/* Fixed delta slot so all cards share the same height */}
        <span
          className={`text-[9px] font-mono tabular-nums min-h-[0.95rem] leading-none ${
            delta == null
              ? "text-transparent select-none"
              : delta > 0
                ? "text-emerald-signal"
                : delta < 0
                  ? "text-rose-signal"
                  : "text-muted-foreground"
          }`}
          aria-hidden={delta == null}
        >
          {delta == null
            ? "·"
            : `${delta > 0 ? "+" : ""}${Math.round(delta)}${tile.format === "percent" ? " pts" : ""} vs last`}
        </span>
        <div className="w-full h-1 rounded-full bg-border/70 overflow-hidden shrink-0">
          {barPct != null ? (
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan/70 to-cyan"
              initial={{ width: 0 }}
              animate={{ width: `${barPct}%` }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: delay * 0.4 }}
            />
          ) : (
            <div className="h-full w-0" />
          )}
        </div>
        <span className="inline-flex items-center gap-0.5 text-[9px] font-mono text-muted-foreground/80">
          <ChevronDown
            className={`w-3 h-3 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
          {expanded ? "Less" : "Details"}
        </span>
      </motion.button>

      {/* Popover expand — keeps all face cards equal height */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="dash-kpi-popover absolute left-0 right-0 top-[calc(100%-2px)] z-30 px-2.5 pb-2.5 pt-1.5 sm:px-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-lg border border-cyan/30 bg-[color-mix(in_oklab,var(--card)_96%,var(--cyan)_4%)] p-2.5 space-y-2 shadow-[0_12px_32px_-12px_oklch(0_0_0/0.55)]">
              <p className="text-[11px] text-foreground/85 leading-snug">{tile.liveNote}</p>
              {tile.liveFacts && tile.liveFacts.length > 0 && (
                <ul className="space-y-1">
                  {tile.liveFacts.map((line, i) => (
                    <li
                      key={i}
                      className="text-[10.5px] font-mono text-muted-foreground leading-snug flex gap-1.5"
                    >
                      <span className="text-cyan shrink-0">›</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              )}
              {history.length > 1 && (
                <p className="text-[10px] font-mono text-muted-foreground/90">
                  Tracked: {history.slice(-5).join(" → ")}
                </p>
              )}
              {(tile.links?.length || tile.cta) && (
                <div className="pt-1.5 border-t border-border/70 flex flex-col gap-1.5">
                  {tile.links?.map((lnk) => (
                    <Link
                      key={lnk.href + lnk.label}
                      to={lnk.href}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan hover:text-cyan/80 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {lnk.label}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ))}
                  {tile.cta && (
                    <div onClick={(e) => e.stopPropagation()}>
                      {tile.cta.note && (
                        <p className="text-[10px] font-mono text-muted-foreground leading-snug mb-1">
                          {tile.cta.note}
                        </p>
                      )}
                      {tile.cta.comingSoon || !tile.cta.href ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-card/60 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.1em] text-muted-foreground">
                          <Sparkles className="w-3 h-3 text-cyan/70" strokeWidth={2.2} />
                          {tile.cta.label}
                        </span>
                      ) : (
                        <Link
                          to={tile.cta.href}
                          className={
                            tile.cta.emphasis === "primary"
                              ? "inline-flex items-center gap-1.5 rounded-full border border-cyan/45 bg-cyan/12 hover:bg-cyan/20 text-cyan px-2.5 py-1.5 text-[11px] font-medium transition-colors min-h-[32px]"
                              : "inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-cyan transition-colors"
                          }
                        >
                          {tile.cta.label}
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DashboardKpiGrid({
  overview,
  snapshots,
  trackerKpis,
  curatedCount = 0,
}: {
  overview: DashboardOverview | null;
  snapshots: Record<string, TopicSnapshot> | null;
  trackerKpis?: { leadersRanked?: number; countriesMonitored?: number };
  curatedCount?: number;
}) {
  const k = overview?.kpis ?? {};
  // Product surface: active monitors only (exclude archived). Matches Topics page active count.
  // Do not trust overview.kpis.total_topics_monitored alone — backend can include retired/history keys (was 21 vs 18).
  const activeTopicCount = activeLiveTopicCount();
  const liveTopicCount = activeTopicCount;
  const researchBriefs = listResearchBriefs();
  const researchCount = researchBriefs.length;

  const topicsMonitored = activeTopicCount > 0 ? activeTopicCount : undefined;

  const leadersRanked =
    typeof k.leaders_ranked === "number" ? k.leaders_ranked : trackerKpis?.leadersRanked;

  const countriesMonitored =
    typeof trackerKpis?.countriesMonitored === "number" && trackerKpis.countriesMonitored > 0
      ? trackerKpis.countriesMonitored
      : typeof k.regions_monitored === "number"
        ? k.regions_monitored
        : undefined;

  // Topic intelligence reports + research case studies + curated/new highlights
  const topicReports = typeof topicsMonitored === "number" ? topicsMonitored : liveTopicCount;
  const caseStudiesTotal = topicReports + researchCount + (curatedCount > 0 ? curatedCount : 0);
  const publishedResearch = researchBriefs.filter((b) => b.status === "published").length;
  const libraryReady =
    researchCount >= RESEARCH_LIBRARY_CTA_MIN || publishedResearch >= RESEARCH_LIBRARY_CTA_MIN;

  /**
   * Gated CTA for case studies & reports:
   * - Hard-push /research only when the dedicated library is thick enough.
   * - Until then: soft link to Topics (where reports already exist), with a clear “building” note.
   */
  const reportsCta: KpiHeroCta = libraryReady
    ? {
        label: "Browse case studies & reports",
        href: "/research",
        emphasis: "primary",
        note: `${researchCount} research briefs in the library · open the full desk.`,
      }
    : topicReports > 0
      ? {
          label: "Browse topic reports",
          href: "/topics",
          emphasis: "soft",
          note: `Research library building (${researchCount}/${RESEARCH_LIBRARY_CTA_MIN} case studies). Full “browse library” CTA unlocks at ${RESEARCH_LIBRARY_CTA_MIN}+ dedicated briefs — not pushing a thin shelf yet.`,
        }
      : {
          label: "Case studies coming soon",
          comingSoon: true,
          note: "Dedicated research briefs are in the pipeline. Check back as the library grows.",
        };

  const windowSample = currentWindowSampleSize(snapshots, overview);
  const runId = overview?.generated_at ?? overview?.last_updated ?? null;
  // Cumulative across distinct pipeline runs (client-tracked); grows when a new run lands.
  const [totalSampleAnalyzed, setTotalSampleAnalyzed] = useState<number | undefined>(() => {
    if (windowSample > 0) return windowSample;
    return peekTotalSampleAnalyzed();
  });
  useEffect(() => {
    if (windowSample <= 0 && !runId) {
      const peeked = peekTotalSampleAnalyzed();
      if (typeof peeked === "number") setTotalSampleAnalyzed(peeked);
      return;
    }
    setTotalSampleAnalyzed(accumulateTotalSampleAnalyzed(runId, windowSample));
  }, [runId, windowSample]);

  const accuracy = computePipelineConfidence({
    snapshots,
    liveTopicCount,
    overview,
    researchCount,
  });

  const tiles: KpiHeroTileModel[] = [
    {
      id: "topics",
      label: "Topics monitored",
      value: topicsMonitored,
      icon: Layers,
      format: "number",
      liveNote: "Active topic monitors on this desk (archived excluded).",
      liveFacts: [
        `Active monitors: ${activeTopicCount}`,
        `Archived (history only): ${Object.keys(LIVE_TOPIC_KEYS).filter((id) => isArchivedTopicId(id)).length}`,
        typeof k.core_topics_refreshed === "number"
          ? `Core refreshed this pass: ${k.core_topics_refreshed}`
          : "Core refresh count not in this overview yet.",
      ],
      links: [
        { label: "Open topics", href: "/topics" },
        { label: "Method & limits", href: "/about" },
      ],
    },
    {
      id: "leaders",
      label: "Leaders ranked",
      value: leadersRanked,
      icon: Users,
      format: "number",
      liveNote: "Rows in the global leader trust table.",
      liveFacts:
        typeof leadersRanked === "number"
          ? [`Leaders in current tracker: ${leadersRanked}`]
          : ["Leader table not loaded for this sample."],
      links: [
        { label: "Open leaders tracker", href: "/trackers/leaders" },
        { label: "How scoring works", href: "/about" },
      ],
    },
    {
      id: "countries",
      label: "Countries monitored",
      value: countriesMonitored,
      icon: MapPinned,
      format: "number",
      liveNote: "Countries in peace / region tracker tables.",
      liveFacts: [
        trackerKpis?.countriesMonitored
          ? `Peace tracker countries: ${trackerKpis.countriesMonitored}`
          : "Peace country count not loaded.",
        typeof k.regions_monitored === "number"
          ? `Overview regions: ${k.regions_monitored}`
          : "Region KPI not set on this overview.",
      ],
      links: [
        { label: "Open peace tracker", href: "/trackers/peace" },
        { label: "About Elenchos", href: "/about" },
      ],
    },
    {
      id: "reports",
      label: "Case studies & reports",
      value: caseStudiesTotal,
      icon: FileStack,
      format: "number",
      liveNote: "Topic reports + research case studies + curated highlights.",
      liveFacts: [
        `Topic reports: ${topicReports}`,
        `Research case studies: ${researchCount}`,
        curatedCount > 0 ? `Curated highlights: ${curatedCount}` : "No curated highlights this load.",
      ],
      links: [{ label: "Method & product pillars", href: "/about" }],
      cta: reportsCta,
    },
    {
      id: "sample",
      label: "Total sample analyzed",
      value: totalSampleAnalyzed,
      icon: Activity,
      format:
        totalSampleAnalyzed != null && totalSampleAnalyzed >= 1000 ? "compact" : "number",
      liveNote: "Cumulative sample volume across pipeline runs.",
      liveFacts: [
        `This run window: ${windowSample > 0 ? windowSample.toLocaleString() : "—"}`,
        typeof k.signals_generated === "number"
          ? `Signals (overview): ${k.signals_generated}`
          : "Signals count not on this overview.",
        runId ? `Run: ${runId}` : "No overview run timestamp yet.",
      ],
      links: [
        { label: "Sampling method", href: "/about" },
        { label: "Browse topics", href: "/topics" },
      ],
    },
    {
      id: "accuracy",
      label: "Est. pipeline confidence",
      value: accuracy.composite,
      icon: ShieldCheck,
      format: "percent",
      liveNote: "Live confidence band for this page (not lab accuracy).",
      liveFacts: accuracy.liveFacts,
      links: [
        { label: "How AI is used (xAI / SpaceXAI)", href: "/about" },
        { label: "Limits & samples", href: "/about" },
      ],
    },
  ];

  const [historyStore, setHistoryStore] = useState<Record<string, number[]>>({});
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const payload: Record<string, number | undefined> = {};
    for (const t of tiles) payload[t.id] = t.value;
    setHistoryStore(appendKpiHistory(payload));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- track when numeric values change
  }, [
    topicsMonitored,
    leadersRanked,
    countriesMonitored,
    caseStudiesTotal,
    totalSampleAnalyzed,
    accuracy.composite,
  ]);

  useEffect(() => {
    setHistoryStore(readKpiHistory());
  }, []);

  // Close popover on outside click / Escape
  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-1.5 sm:gap-2.5 items-stretch"
    >
      {tiles.map((t, i) => (
        <KpiHeroTile
          key={t.id}
          tile={t}
          history={historyStore[t.id] ?? []}
          delay={i * 0.04}
          expanded={openId === t.id}
          onToggle={() => setOpenId((cur) => (cur === t.id ? null : t.id))}
        />
      ))}
    </motion.div>
  );
}


