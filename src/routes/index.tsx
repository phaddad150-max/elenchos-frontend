import { createFileRoute } from "@tanstack/react-router";
import { cleanHeadline } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Brain,
  BookOpen,
  ChevronDown,
  FileStack,
  Globe2,
  Layers,
  MapPin,
  MapPinned,
  Radio,
  Radar,
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
  FilePenLine,
  Trophy,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { sentimentTone as sharedSentimentTone } from "@/lib/score-colors";
import { LIVE_TOPIC_KEYS, activeLiveTopicCount, isArchivedTopicId } from "@/lib/topic-catalog";
import { listResearchBriefs } from "@/lib/research-catalog";
import { appendKpiHistory, readKpiHistory, saneKpiDelta } from "@/lib/kpi-history";
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
  type RankedLeader,
} from "@/lib/trackers-data";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Elenchos · Public Discourse Lens x Research Desk",
      },
      {
        name: "description",
        content:
          "Elenchos: Public Discourse Lens x Research Desk. Live Topics on X vs official frames, Dashboard signals, free Library, and Pro private runs. Privacy-first.",
      },
      {
        property: "og:title",
        content: "Public Discourse Lens x Research Desk · Elenchos",
      },
      {
        property: "og:description",
        content:
          "Citizen voices vs official narratives. Topics analysis, crisis briefings, thesis-style case studies, and Pro monthly plans.",
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
    divergence:
      typeof item.divergence === "number"
        ? item.divergence > 1
          ? item.divergence / 100
          : item.divergence
        : 0,
    divergenceKnown: typeof item.divergence === "number",
    velocity: typeof item.velocity === "number" ? item.velocity : 0,
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
  "AI Productivity & GDP Growth: Investment Boom vs Lived Gains, Energy Constraints & Narrative Gaps": {
    region: "Global",
    subregion: "Eastern Mediterranean",
    lat: 37.77,
    lng: -122.42,
  },
  "India's Economic Growth Narrative: Headline GDP, Employment Quality, AI/IT Disruption & Citizen vs Official Frames": {
    region: "New Delhi",
    subregion: "Eastern Mediterranean",
    lat: 28.61,
    lng: 77.21,
  },
  "Cyprus, Palestine & Selective Outrage: Attention Asymmetries in European Public Discourse": {
    region: "Nicosia",
    subregion: "Eastern Mediterranean",
    lat: 35.17,
    lng: 33.36,
  },
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
  /** Top leaders for the focused Leadership board preview. */
  const [topLeaders, setTopLeaders] = useState<RankedLeader[]>([]);
  const [curatedHighlights, setCuratedHighlights] = useState<CuratedTopicInsights[]>([]);
  const [dashReady, setDashReady] = useState(false);
  const [simMode] = useSimMode();

  const [, setTickKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [snapRes, ovRes, citRes, curRes, trackRes] = await Promise.allSettled([
        loadDashboardData(),
        loadDashboardOverview(),
        loadCitizenSignals(),
        loadCuratedHighlights(40),
        fetchLatestTrackers(),
      ]);
      if (cancelled) return;
      if (snapRes.status === "fulfilled") setSnapshots(snapRes.value ?? null);
      if (ovRes.status === "fulfilled") setOverview(ovRes.value);
      if (citRes.status === "fulfilled") setCitizenSignals(citRes.value ?? []);
      if (curRes.status === "fulfilled") setCuratedHighlights(curRes.value);
      if (trackRes.status === "fulfilled") {
        const rows = trackRes.value;
        const byType = new Map(rows.map((r) => [r.tracker_type, r]));
        const leaderRow = byType.get("global_leader_trust");
        const peaceRow = byType.get("peace_normalization");
        const leaders = leaderRow ? extractRankedLeaders(leaderRow) : [];
        const peaceCountries = peaceRow ? extractPeaceCountries(peaceRow) : [];
        setTrackerKpis({
          leadersRanked: leaders.length || undefined,
          countriesMonitored: peaceCountries.length || undefined,
        });
        setTopLeaders(leaders.slice(0, 5));
      }
      setDashReady(true);
    })();
    return () => {
      cancelled = true;
    };
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
        engagement: 0,
        posts: typeof it.sample_size === "number" && it.sample_size > 0 ? it.sample_size : 0,
        divergence: 0,
        divergenceKnown: false,
        velocity: 0,
        headline: (it.headline ?? it.summary ?? it.topic ?? "Citizen signal").slice(0, 140),
        excerpt: it.excerpt ?? it.summary ?? "",
        source: "Citizen signal",
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

  // Single product surface: topics count matches Topics page (activeLiveTopicCount).
  const topicsCount = activeLiveTopicCount();

  const kpis = useMemo(() => {
    // Live topics only (archived excluded from sample counts).
    const liveCitizens = citizenSignals.filter((s) => isLiveOutputTopic(s.topic));

    // Same posts-analyzed number as KPI hero (mobile + desktop).
    const postsAnalyzed =
      resolvePostsAnalyzed({
        overview,
        snapshots,
        citizenSignals,
      }) ?? 0;

    // Regions = distinct region labels on the same signal set that feeds the globe.
    const regions = new Set(
      effectiveSignals.map((s) => s.region).filter((r) => r && r !== "Global"),
    ).size;

    if (isLive && overview) {
      return {
        postsAnalyzed,
        topics: topicsCount,
        regions,
        highAlert: overview.high_alert_topics ?? 0,
        avgVelocity: overview.trend_velocity ?? 0,
        precision: 94.2,
      };
    }
    const highAlert = effectiveSignals.filter(
      (s) => s.intensity === "high" || s.intensity === "critical"
    ).length || liveCitizens.filter((s) => (s.sentiment_score ?? 100) < 50).length;
    const avgVelocity =
      effectiveSignals.reduce((s, x) => s + x.velocity, 0) / Math.max(effectiveSignals.length, 1);
    return { postsAnalyzed, topics: topicsCount, regions, highAlert, avgVelocity, precision: 94.2 };
  }, [effectiveSignals, isLive, overview, citizenSignals, snapshots, topicsCount]);

  // Citizen signals: prefer the inline `citizen_signals` array on the
  // freshest dashboard_overviews row. Fall back to the citizen_signals
  // table when the overview row doesn't include it (older rows).
  // G7: always drop archived topics (FIFA, Maritime AI, …) even if overview JSON still has them.
  const feedSignals = useMemo<FeedCitizenSignal[]>(() => {
    const inline = overview?.citizen_signals;
    if (Array.isArray(inline) && inline.length > 0) {
      return inline
        .filter((s) => isLiveOutputTopic(s.topic))
        .map((s, i) => {
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
          return {
            ...base,
            ...(typeof s.divergence_score === "number" ? { divergence_score: s.divergence_score } : {}),
            ...(typeof s.narrative_divergence === "number" ? { narrative_divergence: s.narrative_divergence } : {}),
            ...(s.divergence_label ? { divergence_label: s.divergence_label } : {}),
          } as FeedCitizenSignal;
        });
    }
    return (citizenSignals as FeedCitizenSignal[]).filter((s) => isLiveOutputTopic(s.topic));
  }, [overview, citizenSignals]);

  const mergedFeedSignals = useMemo<FeedCitizenSignal[]>(() => {
    const curatedTopics = new Set(
      curatedHighlights
        .map((h) => h.topic)
        .filter((t): t is string => !!t && isLiveOutputTopic(t)),
    );
    const fromCurated = curatedHighlights
      .filter((h) => isLiveOutputTopic(h.topic))
      .map((h, i) =>
        curatedHighlightToFeedSignal(h, h.topic ? snapshots?.[h.topic] ?? null : null, i),
      );
    const fromCitizen = feedSignals.filter(
      (s) => isLiveOutputTopic(s.topic) && !curatedTopics.has(s.topic),
    );
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
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      <SiteNav />
      <main className="max-w-[1600px] mx-auto w-full px-3 sm:px-4 md:px-6 py-3 sm:py-6 md:py-7 space-y-3 sm:space-y-5 md:space-y-6 relative flex-1 mobile-safe-bottom overflow-x-clip min-w-0">
        {/* KPI hero — one grid for all viewports; same data mobile + desktop */}
        <DashboardKpiGrid
          overview={overview}
          snapshots={snapshots}
          citizenSignals={citizenSignals}
          trackerKpis={trackerKpis}
          curatedCount={curatedHighlights.length}
          postsAnalyzed={kpis.postsAnalyzed}
          ready={dashReady}
        />

        {/* Signals + heatmap — side by side, independent heights (signal flips must not move globe) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 xl:grid-cols-12 gap-2.5 sm:gap-4 md:gap-5 xl:items-start min-w-0"
        >
          <section className="dash-panel p-2.5 sm:p-4 md:p-5 xl:col-span-8 overflow-hidden min-w-0 flex flex-col max-w-full self-start h-auto">
            <div className="flex flex-col gap-1.5 sm:gap-2.5 mb-2 sm:mb-2.5 pb-2 sm:pb-2.5 border-b border-border/80 shrink-0">
              <Header
                icon={<Radio className="w-4 h-4" />}
                title="Live Citizen Signals"
                subtitle="Tap a row for the full briefing."
              />
              <div className="overflow-x-auto -mx-1 px-1 pb-0.5 custom-scroll overscroll-x-contain">
                <CitizenGroupFilter value={topicFilter} onChange={setTopicFilter} />
              </div>
            </div>

            <div className="flex flex-col min-w-0 flex-1">
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
                  <p className="mt-3 text-[13px] text-muted-foreground leading-relaxed">
                    No citizen signal rows in this sample yet. Open{" "}
                    <Link
                      to="/research/library"
                      search={{ section: "topics" }}
                      className="text-cyan hover:underline"
                    >
                      Library topics
                    </Link>{" "}
                    for full briefings, or check back after the next sample.
                  </p>
                )}
            </div>
          </section>

          <section className="dash-panel p-2.5 sm:p-4 md:p-5 xl:col-span-4 relative overflow-hidden min-w-0 flex flex-col self-start w-full">
            <div className="mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-border/80 shrink-0">
              <Header
                icon={<Globe2 className="w-4 h-4" />}
                title="Global Sentiment Heatmap"
                subtitle={`Tap a point · ${kpis.regions} region${kpis.regions === 1 ? "" : "s"} · ${fmtNum(kpis.postsAnalyzed)} data points`}
              />
            </div>

            {/* Stable globe stage height — not tied to signals panel reflow */}
            <div className="flex flex-col gap-2">
              <div className="relative h-[min(52vw,280px)] sm:h-[400px] xl:h-[450px] w-full rounded-xl border border-cyan/30 overflow-hidden globe-stage shadow-[inset_0_0_48px_-14px_var(--cyan-glow)] ring-1 ring-cyan/10">
                {dashReady && effectiveSignals.length === 0 ? (
                  <div className="absolute inset-0 grid place-items-center bg-background/40 px-4 text-center">
                    <p className="text-[13px] text-muted-foreground leading-relaxed max-w-xs">
                      No region markers in this sample yet. Signals may still load — try again after
                      the next pipeline run.
                    </p>
                  </div>
                ) : (
                  <Globe3D
                    signals={effectiveSignals}
                    onPick={(s) => {
                      setRegionFilter(s.region);
                      setPicked(s);
                    }}
                  />
                )}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background/50 to-transparent sm:h-12"
                  aria-hidden
                />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-mono shrink-0">
                <LegendDot color="var(--rose-signal)" label="Critical" />
                <LegendDot color="var(--amber-signal)" label="High" />
                <LegendDot color="var(--cyan)" label="Monitor" />
              </div>
            </div>

            {regionFilter && (
              <button
                type="button"
                onClick={() => setRegionFilter(null)}
                className="absolute top-3 right-3 text-[11px] font-mono px-2.5 py-2 sm:py-1 rounded-full bg-card/95 backdrop-blur-sm border border-cyan/45 text-cyan hover:bg-cyan/10 min-h-[44px] sm:min-h-[36px] touch-manipulation shadow-sm"
              >
                <MapPin className="w-3 h-3 inline mr-1" />
                {regionFilter} · clear
              </button>
            )}
          </section>
        </motion.div>

        {/* Sample structure sits under Live Citizen Signals (not under Library/trackers) */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <SampleStructureModules
            snapshots={snapshots}
            signals={mergedFeedSignals}
            overview={overview}
          />
        </motion.div>

        {/* Focused live tracker preview — Leadership board only (Library published panel removed) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-w-0 md:max-w-xl xl:max-w-2xl md:mx-auto w-full"
        >
          <LeadershipBoardPreview leaders={topLeaders} rankedTotal={trackerKpis.leadersRanked} />
        </motion.div>

        {/* Contextual actions — end of page only, not mid-page marketing banners */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <DashboardActionRow />
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
    <div className="intel-header">
      <div className="intel-header-row">
        <div className="intel-header-icon">{icon}</div>
        <h2 className="intel-header-title">{title}</h2>
      </div>
      {subtitle && <p className="intel-header-sub">{subtitle}</p>}
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

// Rephrase raw signal blurb into a full scannable line that fits the row.
// Never invents meaning; strips lead-ins; first sentence; word-cap; **no "..."**.
function shortenSignal(text: string): string {
  if (!text) return "";
  let t = text.trim();
  // Strip trailing ellipsis / mid-cut artifacts from older backend rows
  t = t.replace(/\s*\.{2,}\s*$/g, "").replace(/\s*…\s*$/g, "").trim();
  // Strip repetitive lead-ins so signals don't all start with the same words.
  t = t.replace(/^\s*based on\s+\d+\s+posts?\.?\s*(analysis\s+limited\.?)?\s*/i, "").trim();
  t = t.replace(
    /^(posts?\s+(reveal|reveals|highlight|highlights|show|shows|indicate|indicates|suggest|suggests|expose|exposes|underscore|underscores|note|notes)|citizens?\s+(voice|voices|express|expresses|share|shares|report|reports)|analysis\s+(shows?|reveals?|indicates?)|users?\s+(are|report|discuss|say|voice)|discussions?\s+(reveal|show|highlight)|sentiment\s+(is|shows?)|the\s+data\s+(shows?|reveals?)|our\s+analysis\s+(shows?|reveals?))[:,\s]+/i,
    "",
  ).trim();
  // Cut at first sentence boundary to keep only the lead sentence.
  const firstStop = t.search(/[.!?](\s|$)/);
  if (firstStop > 20) t = t.slice(0, firstStop).trim();
  // Cap at 15 words — clean cut at word boundary, never append "..."
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length > 15) t = words.slice(0, 15).join(" ").replace(/[,;:\-–—]+$/, "").trim();
  t = t.replace(/\s*\.{2,}\s*$/g, "").replace(/\s*…\s*$/g, "").trim();
  if (t) t = t.charAt(0).toUpperCase() + t.slice(1);
  return t;
}

/**
 * Row mood pill — driven only by live sentiment score/label via canonical
 * score-colors bands (not Critical/High/Monitor intensity hacks).
 * Compact label for the scan row; no numeric score shown here.
 */
function signalMoodPill(
  score: number | null,
  label?: string | null,
): { label: string; color: string; tint: string; band: string } {
  const tone = sentimentTone(score, label);
  const band = String(tone.band);
  // Compact display labels — same grading, shorter for the row
  const short: Record<string, string> = {
    "Strongly Positive": "Strong +",
    Positive: "Positive",
    "Leaning Positive": "Lean +",
    Mixed: "Mixed",
    "Slightly Negative": "Slight −",
    Negative: "Negative",
    "Strongly Negative": "Strong −",
  };
  return {
    label: short[band] ?? band,
    color: tone.color,
    tint: tone.tint,
    band,
  };
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
    // Do not mirror evolution_note into excerpt — modal shows evolution once.
    excerpt: null,
    source: "Curated insight",
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
        className={`chip-touch px-3 py-2 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider border transition-colors min-h-[44px] sm:min-h-0 touch-manipulation ${
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
            className="chip-touch px-3 py-2 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider border transition-colors min-h-[44px] sm:min-h-0 touch-manipulation"
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

  /** Collapsed window: 6 rows. Fixed height so flips never push panels below. */
  const COLLAPSED = 6;

  // Live rotation — advance by one row every 8s so the full pool cycles through.
  // All live signals participate; only the visible window is capped at COLLAPSED.
  const [rotation, setRotation] = useState(0);
  useEffect(() => {
    if (expanded) return;
    if (items.length <= COLLAPSED) return;
    const id = setInterval(() => setRotation((r) => r + 1), 8000);
    return () => clearInterval(id);
  }, [expanded, items.length]);

  const windowRows = useMemo(() => {
    if (items.length <= COLLAPSED) return items;
    const offset = rotation % items.length;
    const out: typeof items = [];
    for (let i = 0; i < COLLAPSED; i++) {
      out.push(items[(offset + i) % items.length]!);
    }
    return out;
  }, [items, rotation]);

  if (useFallback || items.length === 0) {
    return (
      <div className="max-h-[min(24rem,48vh)] overflow-y-auto custom-scroll pr-1 space-y-3">
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

  const visible = expanded ? items : windowRows;
  const moreCount = Math.max(0, items.length - COLLAPSED);

  return (
    <div className="flex flex-col min-w-0 gap-1">
      {/*
        Collapsed: height = content of 6 rows only (no dead air under last row).
        mode=wait + uniform row min-height keeps flips from shoving panels below.
        Expanded: scroll inside a cap; button stays flush under the viewport.
      */}
      <div
        className={
          expanded
            ? "max-h-[min(24rem,48vh)] overflow-y-auto custom-scroll pr-0.5"
            : "overflow-hidden"
        }
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={expanded ? "expanded" : `rot-${rotation}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="flex flex-col gap-1.5"
          >
            {visible.map((s, i) => (
              <CitizenSignalRow key={s.id} signal={s} index={i + 1} onPick={onPick} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      {(moreCount > 0 || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full shrink-0 inline-flex items-center justify-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.18em] py-2 sm:py-1.5 rounded-lg border border-border/90 bg-card/40 hover:border-cyan/45 hover:text-cyan hover:bg-cyan/5 transition-colors text-muted-foreground min-h-[44px] sm:min-h-[36px] touch-manipulation"
        >
          {expanded ? (
            <>
              Show less
              <ChevronDown className="w-3.5 h-3.5 rotate-180" aria-hidden />
            </>
          ) : (
            <>
              More signals
              <ChevronDown className="w-3.5 h-3.5" aria-hidden />
            </>
          )}
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
  const rawHeadline = cleanHeadline((signal.headline ?? signal.summary ?? signal.topic ?? "").trim());
  const headline = shortenSignal(rawHeadline) || signal.topic || "Citizen signal";
  const score = typeof signal.sentiment_score === "number" ? Math.round(signal.sentiment_score) : null;
  // Mood from pipeline sentiment only — same bands as rest of product (score-colors).
  const mood = signalMoodPill(score, signal.sentiment_label);
  const trend = (signal.trend ?? "").toLowerCase();
  const delta = signal.sentiment_delta;
  const trendUp =
    typeof delta === "number" ? delta > 0 : /(rising|improving|up|positive|progress)/.test(trend);
  const trendDown =
    typeof delta === "number" ? delta < 0 : /(declining|falling|down|negative|worsening|regress)/.test(trend);
  const hasWindow = typeof delta === "number" || !!signal.comparison_window;
  const windowLabel = (signal.comparison_window ?? "").toLowerCase() === "mom" ? "MoM" : "WoW";
  const trendTitle =
    typeof delta === "number"
      ? `${delta > 0 ? "Progressing" : delta < 0 ? "Regressing" : "Stable"} · ${windowLabel} ${delta > 0 ? "+" : ""}${delta}`
      : signal.trend ?? "Stable";
  const tooltipDetail = [
    mood.band,
    signal.sample_size != null ? `Sample: ${signal.sample_size.toLocaleString()} posts` : null,
    signal.last_updated ? `Updated ${timeAgo(signal.last_updated)}` : null,
    signal.summary?.trim() || signal.excerpt?.trim() || null,
  ]
    .filter(Boolean)
    .join(" · ");
  // Mini trend bars from existing score + delta only (no invented series).
  const sparkBars = useMemo(() => {
    const base = score != null ? Math.max(8, Math.min(100, score)) : 50;
    const d = typeof delta === "number" ? Math.max(-18, Math.min(18, delta)) : 0;
    const steps = [base - d * 1.2, base - d * 0.5, base, base + d * 0.35, base + d * 0.7];
    return steps.map((v) => Math.max(12, Math.min(100, v)));
  }, [score, delta]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
    <motion.button
      type="button"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      whileTap={{ scale: 0.995 }}
      onClick={() => onPick(signal)}
      className="signal-row group w-full max-w-full text-left px-2 sm:px-2.5 py-2 sm:py-2 rounded-xl active:bg-secondary/50 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2.5 cursor-pointer touch-manipulation min-w-0 overflow-hidden min-h-[48px] sm:min-h-[3.5rem]"
    >
      <div className="flex items-center gap-2.5 sm:gap-3 w-full min-w-0">
      <span className="text-[11px] font-mono text-muted-foreground tabular-nums w-5 text-right shrink-0">
        {String(index).padStart(2, "0")}
      </span>
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-1.5 mb-0.5 min-w-0">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0 ring-2 ring-offset-1 ring-offset-transparent"
            style={{ background: mood.color, boxShadow: `0 0 0 1px ${mood.color}44` }}
          />
          <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-cyan/85 truncate min-w-0">
            {signal.topic}
          </span>
          {signal.sample_size != null && signal.sample_size > 0 && (
            <span className="hidden md:inline-flex shrink-0 text-[9px] font-mono tabular-nums text-muted-foreground/90 px-1.5 py-0.5 rounded border border-border/70 bg-card/50">
              n={signal.sample_size.toLocaleString()}
            </span>
          )}
        </span>
        {/* Full fitted line — no line-clamp ellipsis ("...") */}
        <span className="block text-[13px] sm:text-[13.5px] font-medium leading-snug text-foreground/95 group-hover:text-foreground break-words line-clamp-2 sm:line-clamp-1">
          {headline || signal.topic}
        </span>
      </span>
      </div>
      {/* Mood + mini trend + open cue */}
      <span className="flex items-center justify-between sm:justify-end gap-2 sm:gap-2.5 pl-7 sm:pl-0 w-full sm:w-auto shrink-0">
        <span
          title={mood.band}
          className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.12em] font-semibold px-2 py-1 rounded-md border whitespace-nowrap shadow-sm"
          style={{
            color: mood.color,
            borderColor: `${mood.color}55`,
            background: mood.tint,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: mood.color }} />
          {mood.label}
        </span>
        {(hasWindow || score != null) && (
          <span
            title={trendTitle}
            className={`hidden sm:inline-flex items-end gap-0.5 h-5 px-1 ${
              trendUp ? "text-emerald-signal" : trendDown ? "text-rose-signal" : "text-muted-foreground"
            }`}
            aria-hidden
          >
            {sparkBars.map((h, i) => (
              <span
                key={i}
                className="w-[3px] rounded-full bg-current opacity-70"
                style={{ height: `${Math.round(h * 0.18)}px` }}
              />
            ))}
          </span>
        )}
        <span
          title={trendTitle}
          className={`inline-flex flex-col items-center justify-center min-w-[2rem] leading-none gap-0.5 ${
            trendUp ? "text-emerald-signal" : trendDown ? "text-rose-signal" : "text-muted-foreground"
          }`}
        >
          {trendUp ? <ArrowUpRight className="w-4 h-4" /> : trendDown ? <ArrowDownRight className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          {hasWindow && (
            <span className="text-[8px] font-mono uppercase tracking-wider opacity-90">{windowLabel}</span>
          )}
        </span>
        <span className="sm:hidden text-[10px] font-mono text-cyan/90 inline-flex items-center gap-0.5">
          Brief
          <ChevronRight className="w-3 h-3" aria-hidden />
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

/** Compact always-open sample structure — visual gaps + movers, no essay wall. */
function SampleStructureModules({
  overview,
  snapshots,
  signals,
}: {
  snapshots?: Record<string, TopicSnapshot> | null;
  signals?: FeedCitizenSignal[];
  overview: DashboardOverview | null;
}) {
  const lastUpdated = overview?.generated_at ?? overview?.last_updated ?? null;
  const avgDiv =
    typeof overview?.kpis?.average_narrative_divergence === "number"
      ? Math.round(overview.kpis.average_narrative_divergence)
      : null;

  const gaps = useMemo(() => {
    type Gap = { topic: string; score: number; sample: number | null };
    const fromSignals: Gap[] = [];
    for (const s of signals ?? []) {
      const score =
        typeof s.divergence_score === "number"
          ? s.divergence_score
          : typeof s.narrative_divergence === "number"
            ? s.narrative_divergence
            : null;
      if (score == null || score <= 0) continue;
      fromSignals.push({
        topic: s.topic,
        score: Math.round(score),
        sample: typeof s.sample_size === "number" ? s.sample_size : null,
      });
    }
    if (fromSignals.length > 0) {
      const byTopic = new Map<string, Gap>();
      for (const g of fromSignals) {
        const prev = byTopic.get(g.topic);
        if (!prev || g.score > prev.score) byTopic.set(g.topic, g);
      }
      return Array.from(byTopic.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);
    }
    if (!snapshots) return [] as Gap[];
    return Object.values(snapshots)
      .filter((s) => isLiveOutputTopic(s.topic) && typeof s.divergence_score === "number")
      .map((s): Gap => ({
        topic: s.topic,
        score: Math.round(s.divergence_score as number),
        sample:
          typeof s.sample_size === "number"
            ? s.sample_size
            : typeof s.fetched_post_count === "number"
              ? s.fetched_post_count
              : null,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [signals, snapshots]);

  const movers = useMemo(() => {
    const rising: { topic: string; delta: number }[] = [];
    const falling: { topic: string; delta: number }[] = [];
    const seenR = new Set<string>();
    const seenF = new Set<string>();
    for (const s of signals ?? []) {
      if (typeof s.sentiment_delta !== "number" || s.sentiment_delta === 0) continue;
      if (s.sentiment_delta > 0 && !seenR.has(s.topic) && rising.length < 2) {
        seenR.add(s.topic);
        rising.push({ topic: s.topic, delta: s.sentiment_delta });
      } else if (s.sentiment_delta < 0 && !seenF.has(s.topic) && falling.length < 2) {
        seenF.add(s.topic);
        falling.push({ topic: s.topic, delta: s.sentiment_delta });
      }
    }
    rising.sort((a, b) => b.delta - a.delta);
    falling.sort((a, b) => a.delta - b.delta);
    return { rising, falling };
  }, [signals]);

  return (
    <section className="dash-panel p-2.5 sm:p-3.5 min-w-0">
      <div className="flex items-center justify-between gap-2 mb-2.5 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg grid place-items-center border border-cyan/35 bg-cyan/10 text-cyan shrink-0">
            <Brain className="w-3.5 h-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] sm:text-[14px] font-display font-semibold text-foreground/95 leading-tight">
              Live signal gaps &amp; movers
            </p>
            <p className="text-[10px] font-mono text-muted-foreground truncate">
              Strongest gaps · rising &amp; falling
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {avgDiv != null && (
            <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded border border-cyan/30 text-cyan bg-cyan/10">
              avg {avgDiv}
            </span>
          )}
          {lastUpdated && (
            <span className="hidden xs:inline sm:inline text-[10px] font-mono text-muted-foreground" suppressHydrationWarning>
              {timeAgo(lastUpdated)}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3 min-w-0">
        <div className="sm:col-span-7 min-w-0 space-y-1">
          <p className="text-[9px] font-mono uppercase tracking-[0.14em] text-cyan">Strongest gaps</p>
          {gaps.length === 0 ? (
            <p className="text-[11.5px] text-muted-foreground py-1">No divergence scores yet.</p>
          ) : (
            gaps.map((g, i) => (
              <div key={g.topic} className="flex items-center gap-2 min-w-0 py-0.5">
                <span className="text-[12px] sm:text-[13px] font-display font-semibold tabular-nums text-cyan w-7 shrink-0">
                  {g.score}
                </span>
                <span className="text-[11px] sm:text-[12px] truncate text-foreground/90 flex-1 min-w-0">
                  {g.topic}
                </span>
                <div className="w-14 sm:w-20 shrink-0 h-1.5 sm:h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #FFAB00, #FF5722, #FF1744)",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, g.score)}%` }}
                    transition={{ duration: 0.65, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
        <div className="sm:col-span-5 min-w-0 grid grid-cols-2 gap-1.5 sm:gap-2">
          <div className="rounded-lg border border-[#00C853]/30 bg-[#00C853]/[0.06] p-2 min-w-0">
            <p className="text-[9px] font-mono uppercase tracking-[0.12em] text-[#00C853] flex items-center gap-0.5 mb-1">
              <ArrowUpRight className="w-3 h-3" /> Rising
            </p>
            {movers.rising.length === 0 ? (
              <p className="text-[10.5px] text-muted-foreground">—</p>
            ) : (
              movers.rising.map((r) => (
                <p key={r.topic} className="text-[11px] leading-snug line-clamp-2 mb-0.5">
                  <span className="font-mono text-[#00C853] tabular-nums">+{r.delta}</span>{" "}
                  <span className="text-foreground/85">{r.topic.split(/[:/]/)[0]}</span>
                </p>
              ))
            )}
          </div>
          <div className="rounded-lg border border-[#FF1744]/30 bg-[#FF1744]/[0.06] p-2 min-w-0">
            <p className="text-[9px] font-mono uppercase tracking-[0.12em] text-[#FF1744] flex items-center gap-0.5 mb-1">
              <ArrowDownRight className="w-3 h-3" /> Falling
            </p>
            {movers.falling.length === 0 ? (
              <p className="text-[10.5px] text-muted-foreground">—</p>
            ) : (
              movers.falling.map((r) => (
                <p key={r.topic} className="text-[11px] leading-snug line-clamp-2 mb-0.5">
                  <span className="font-mono text-[#FF1744] tabular-nums">{r.delta}</span>{" "}
                  <span className="text-foreground/85">{r.topic.split(/[:/]/)[0]}</span>
                </p>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Score colors aligned with Leadership board / trackers.index */
function leaderScoreHex(s?: number | null): string {
  if (s == null || Number.isNaN(s)) return "#6B7280";
  if (s >= 80) return "#00C853";
  if (s >= 65) return "#64DD17";
  if (s >= 50) return "#FFAB00";
  if (s >= 35) return "#FF5722";
  return "#FF1744";
}

/**
 * Leadership board preview — top 5, tracker-theme gold ranks + score bars, interactive.
 */
function LeadershipBoardPreview({
  leaders,
  rankedTotal,
}: {
  leaders: RankedLeader[];
  rankedTotal?: number;
}) {
  const top = leaders.slice(0, 5);
  const [focus, setFocus] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (top.length < 2 || paused) return;
    const id = window.setInterval(() => {
      setFocus((i) => (i + 1) % top.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [top.length, paused]);

  const focused = top[focus];
  const maxScore = Math.max(
    ...top.map((l) => (typeof l.overall_score === "number" ? l.overall_score : 0)),
    1,
  );

  return (
    <section
      className="tracker-card relative rounded-2xl border border-border/60 overflow-hidden min-w-0"
      style={{
        background:
          "linear-gradient(165deg, color-mix(in oklab, var(--card) 92%, #FFAB00 8%) 0%, var(--card) 45%, color-mix(in oklab, var(--card) 94%, var(--cyan) 4%) 100%)",
        boxShadow: "0 20px 48px -28px rgba(255, 171, 0, 0.28), 0 0 0 1px color-mix(in oklab, #FFAB00 12%, transparent)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_10%_0%,rgba(255,213,79,0.14),transparent_50%),radial-gradient(ellipse_at_90%_20%,color-mix(in_oklab,var(--cyan)_10%,transparent),transparent_45%)]" />

      <div className="relative p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-3.5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.22em] text-cyan mb-1">
              <Trophy className="w-3.5 h-3.5" />
              Live leaderboard
            </div>
            <h2 className="text-[1.05rem] sm:text-xl font-display font-semibold leading-tight">
              Leadership board{" "}
              <span className="text-cyan">by citizens</span>
            </h2>
            <p className="text-[11.5px] sm:text-[12px] text-muted-foreground mt-0.5">
              Top {top.length || 5}
              {typeof rankedTotal === "number" ? ` of ${rankedTotal}` : ""} · trust scores
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-full border border-cyan/30 bg-cyan/10 text-cyan text-[10px] font-mono uppercase tracking-[0.16em] inline-flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" /> Live
          </span>
        </div>

        {top.length === 0 ? (
          <p className="text-[12px] text-muted-foreground py-6 text-center">Loading leaders…</p>
        ) : (
          <ul
            className="space-y-1.5 sm:space-y-2"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
          >
            {top.map((l, i) => {
              const rank = l.rank ?? i + 1;
              const score = typeof l.overall_score === "number" ? l.overall_score : null;
              const hex = leaderScoreHex(score);
              const isFocus = i === focus;
              const barPct = score != null ? Math.min(100, (score / maxScore) * 100) : 0;
              return (
                <motion.li key={l.name + rank}>
                  <button
                    type="button"
                    onClick={() => {
                      setFocus(i);
                      setPaused(true);
                    }}
                    className={`w-full text-left rounded-xl border px-2.5 py-2 md:px-2.5 md:py-2 sm:px-3 sm:py-2.5 flex items-center gap-2 sm:gap-2.5 min-h-[52px] md:min-h-[48px] sm:min-h-[56px] touch-manipulation transition-all ${
                      isFocus
                        ? "border-[#FFAB00]/55 bg-[#FFAB00]/[0.08] shadow-[0_0_20px_-8px_#FFAB0088]"
                        : "border-border/50 bg-background/45 hover:border-[#FFAB00]/35 hover:bg-background/70"
                    }`}
                  >
                    <span
                      className={
                        rank <= 3
                          ? "inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 md:w-7 md:h-7 rounded-lg font-display font-bold text-[11px] sm:text-[12px] tabular-nums shrink-0"
                          : "inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 md:w-7 md:h-7 rounded-lg bg-secondary/70 border border-border/60 font-mono font-semibold text-[11px] text-muted-foreground tabular-nums shrink-0"
                      }
                      style={
                        rank <= 3
                          ? {
                              background: "linear-gradient(135deg, #FFD54F, #FFAB00)",
                              color: "#1a1100",
                              boxShadow: "0 0 12px #FFAB0080, inset 0 0 0 1px #FFE082",
                            }
                          : undefined
                      }
                    >
                      {rank}
                    </span>
                    <span className="text-lg sm:text-xl leading-none shrink-0" aria-hidden>
                      {l.flag ?? "🏳️"}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[12.5px] sm:text-[13.5px] font-medium truncate text-foreground/95">
                        {l.name}
                      </span>
                      <span className="block text-[10px] font-mono text-muted-foreground truncate">
                        {[l.country, l.region].filter(Boolean).join(" · ") || "—"}
                      </span>
                      <span className="mt-1 block h-1.5 sm:h-2 rounded-full bg-secondary overflow-hidden">
                        <motion.span
                          className="block h-full rounded-full"
                          style={{ background: hex, boxShadow: `0 0 8px ${hex}66` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${barPct}%` }}
                          transition={{ duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </span>
                    </span>
                    <span
                      className="inline-flex items-center rounded-lg font-display font-bold tabular-nums text-sm sm:text-base px-2 py-1 shrink-0"
                      style={{
                        color: hex,
                        background: `${hex}1A`,
                        boxShadow: `inset 0 0 0 1px ${hex}55`,
                      }}
                    >
                      {score == null ? "—" : Math.round(score)}
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        )}

        {focused && (
          <AnimatePresence mode="wait">
            <motion.div
              key={focused.name}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22 }}
              className="rounded-xl border border-[#FFAB00]/30 bg-background/50 px-3 py-2.5 min-w-0"
            >
              <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#FFAB00] mb-1">
                Focus · #{focused.rank ?? focus + 1}
              </p>
              <p className="text-[12.5px] sm:text-[13px] leading-snug text-foreground/90 line-clamp-2 sm:line-clamp-3">
                {focused.summary?.trim() ||
                  `${focused.name} — citizen trust score ${
                    typeof focused.overall_score === "number"
                      ? Math.round(focused.overall_score)
                      : "—"
                  }${typeof focused.divergence === "number" ? ` · official gap ${Math.round(focused.divergence)}` : ""}.`}
              </p>
            </motion.div>
          </AnimatePresence>
        )}

        <Link
          to="/trackers/leaders"
          className="group flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[42px] rounded-full border border-cyan/40 bg-cyan/10 hover:bg-cyan/18 text-cyan text-[12.5px] font-semibold touch-manipulation transition-colors w-full sm:w-auto sm:self-end sm:px-5"
        >
          Open full leaderboard
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  );
}

/** Compact end-of-page actions — no mid-page marketing banners. */
function DashboardActionRow() {
  const actions = [
    {
      id: "library-topics",
      href: "/research/library" as const,
      search: { section: "topics" as const },
      label: "Open Library topics",
      icon: Layers,
    },
    {
      id: "library",
      href: "/research/library" as const,
      search: undefined,
      label: "Browse free Library",
      icon: BookOpen,
    },
    {
      id: "pro",
      href: "/pro" as const,
      search: undefined,
      label: "Pro Research Desk",
      icon: FilePenLine,
    },
  ];

  return (
    <section
      aria-label="Next steps"
      className="rounded-xl border border-border/80 bg-card/30 px-2.5 py-2 sm:px-3 sm:py-2.5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
        <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground shrink-0 px-0.5">
          Go deeper
        </span>
        <div className="flex flex-col sm:flex-row flex-1 gap-1.5 sm:gap-2 min-w-0">
          {actions.map((a) => (
            <Link
              key={a.id}
              to={a.href}
              search={a.search}
              className="group flex-1 inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[40px] px-3 rounded-lg border border-border/90 bg-background/60 hover:border-cyan/50 hover:bg-cyan/5 text-[12.5px] font-medium text-foreground/90 hover:text-cyan transition-colors touch-manipulation"
            >
              <a.icon className="w-3.5 h-3.5 text-cyan shrink-0" aria-hidden />
              <span className="truncate">{a.label}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </div>
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
          subtitle="Plain-language read of the latest cross-topic sample"
        />
        <span className="px-2 py-1 rounded bg-cyan/15 text-cyan border border-cyan/40 text-[11px] font-mono inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan pulse-dot" />
          {items.length} observations
        </span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Loading the latest cross-topic observations…
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
  | "/research/library"
  | "/research/commission"
  | "/research/networks-ledger"
  | "/pro"
  | "/trackers"
  | "/trackers/leaders"
  | "/trackers/peace";

/** Existing product surfaces only — count for Trackers Active KPI (no new pipeline). */
const DASHBOARD_TRACKERS = [
  {
    id: "leaders",
    title: "Leadership board",
    href: "/trackers/leaders" as const,
    blurb: "Citizen trust rankings vs official frames.",
    badge: "Index",
  },
  {
    id: "peace",
    title: "Peace index",
    href: "/trackers/peace" as const,
    blurb: "Normalization & peace diagnostics by country.",
    badge: "Index",
  },
  {
    id: "networks",
    title: "Networks Ledger",
    href: "/research/networks-ledger" as const,
    blurb: "Terror & Finance + Speech Reach branches.",
    badge: "Ledger",
  },
] as const;

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

/**
 * Canonical "posts / sample analyzed" for dashboard + KPI hero.
 * Same function everywhere so mobile and desktop never diverge.
 *
 * Prefer server lifetime total (kpis.total_posts_analyzed) which is
 * append-only / non-decreasing across pipeline runs. Window sample sum
 * is a floor only — never used to drop below the published lifetime total.
 */
function resolvePostsAnalyzed(args: {
  overview: DashboardOverview | null;
  snapshots: Record<string, TopicSnapshot> | null;
  citizenSignals?: CitizenSignal[] | FeedCitizenSignal[] | null;
}): number | undefined {
  const { overview, snapshots, citizenSignals } = args;
  const k = overview?.kpis as
    | (DashboardOverview["kpis"] & {
        window_posts_analyzed?: number;
        total_posts_analyzed?: number;
      })
    | undefined;

  const fromLifetime =
    typeof k?.total_posts_analyzed === "number" && k.total_posts_analyzed > 0
      ? Math.round(k.total_posts_analyzed)
      : typeof overview?.total_posts_analyzed === "number" && overview.total_posts_analyzed > 0
        ? Math.round(overview.total_posts_analyzed)
        : 0;

  let fromSnaps = 0;
  if (snapshots) {
    for (const [key, s] of Object.entries(snapshots)) {
      if (!isLiveOutputTopic(key) && !isLiveOutputTopic(s.topic)) continue;
      const n =
        typeof s.fetched_post_count === "number" && s.fetched_post_count > 0
          ? s.fetched_post_count
          : typeof s.sample_size === "number"
            ? s.sample_size
            : 0;
      fromSnaps += n;
    }
  }
  fromSnaps = Math.round(fromSnaps);

  let fromCitizens = 0;
  if (citizenSignals?.length) {
    for (const s of citizenSignals) {
      if (!isLiveOutputTopic(s.topic)) continue;
      const n =
        typeof (s as CitizenSignal).sample_size === "number"
          ? (s as CitizenSignal).sample_size!
          : 0;
      fromCitizens += n;
    }
  }
  fromCitizens = Math.round(fromCitizens);

  const windowOnly =
    typeof k?.window_posts_analyzed === "number" && k.window_posts_analyzed > 0
      ? Math.round(k.window_posts_analyzed)
      : fromSnaps > 0
        ? fromSnaps
        : fromCitizens > 0
          ? fromCitizens
          : 0;

  // Prefer published lifetime; only fall back to window if overview has no lifetime yet
  const n = fromLifetime > 0 ? Math.max(fromLifetime, windowOnly) : windowOnly;
  return n > 0 ? n : undefined;
}

/** Breakdown for KPI expand panel only (not alternate face values). */
function postsAnalyzedBreakdown(args: {
  overview: DashboardOverview | null;
  snapshots: Record<string, TopicSnapshot> | null;
  citizenSignals?: CitizenSignal[] | FeedCitizenSignal[] | null;
}): string[] {
  const { overview, snapshots, citizenSignals } = args;
  const k = overview?.kpis as
    | (DashboardOverview["kpis"] & {
        window_posts_analyzed?: number;
        total_posts_analyzed?: number;
      })
    | undefined;
  const fromOverview =
    typeof k?.total_posts_analyzed === "number"
      ? k.total_posts_analyzed
      : typeof overview?.total_posts_analyzed === "number"
        ? overview.total_posts_analyzed
        : null;
  const windowFromKpi =
    typeof k?.window_posts_analyzed === "number" ? k.window_posts_analyzed : null;
  let fromSnaps = 0;
  if (snapshots) {
    for (const [key, s] of Object.entries(snapshots)) {
      if (!isLiveOutputTopic(key) && !isLiveOutputTopic(s.topic)) continue;
      const n =
        typeof s.fetched_post_count === "number" && s.fetched_post_count > 0
          ? s.fetched_post_count
          : typeof s.sample_size === "number"
            ? s.sample_size
            : 0;
      fromSnaps += n;
    }
  }
  let fromCitizens = 0;
  if (citizenSignals?.length) {
    for (const s of citizenSignals) {
      if (!isLiveOutputTopic(s.topic)) continue;
      fromCitizens +=
        typeof (s as CitizenSignal).sample_size === "number"
          ? (s as CitizenSignal).sample_size!
          : 0;
    }
  }
  return [
    fromOverview != null
      ? `Lifetime total (X + multi-source history): ${Math.round(fromOverview).toLocaleString()}`
      : "Lifetime total: not in this sample yet.",
    windowFromKpi != null
      ? `Current window (latest per topic): ${Math.round(windowFromKpi).toLocaleString()}`
      : `Current window (topic snapshots sum): ${Math.round(fromSnaps).toLocaleString()}`,
    `Live citizen-signal samples: ${Math.round(fromCitizens).toLocaleString()}`,
    "Face value uses the same lifetime total as before — grows with every pipeline insert; same on mobile and desktop.",
  ];
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
  const delta = saneKpiDelta(numericValue, prevHist);

  const barPct =
    has && tile.format === "percent" ? Math.min(100, Math.max(0, Math.round(numericValue))) : null;

  const detailPanel = (
    <div className="dash-kpi-popover-panel rounded-xl border border-border/80 bg-background/95 p-3 sm:p-3 space-y-2 min-w-0">
      <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-cyan break-words">
        {tile.label}
      </p>
      {has && (
        <p className="text-[1.35rem] sm:text-[16px] font-display font-semibold tabular-nums text-cyan leading-none">
          {tile.format === "percent"
            ? `${Math.round(numericValue!)}%`
            : Math.round(numericValue!).toLocaleString()}
          {tile.unit && tile.format !== "percent" ? (
            <span className="text-[11px] font-mono text-muted-foreground ml-1">
              {tile.unit}
            </span>
          ) : null}
        </p>
      )}
      <p className="text-[12px] sm:text-[11px] text-foreground/90 leading-snug break-words">
        {tile.liveNote?.trim() ||
          (has
            ? `Current value: ${typeof tile.value === "number" ? tile.value.toLocaleString() : tile.value}${tile.format === "percent" ? "%" : tile.unit ? ` ${tile.unit}` : ""}.`
            : "No value for this metric in the current sample yet.")}
      </p>
      {tile.liveFacts && tile.liveFacts.length > 0 && (
        <ul className="space-y-1">
          {tile.liveFacts.slice(0, 4).map((line, i) => (
            <li
              key={i}
              className="text-[11px] sm:text-[10.5px] font-mono text-muted-foreground leading-snug flex gap-1.5 min-w-0"
            >
              <span className="text-cyan shrink-0">›</span>
              <span className="break-words min-w-0">{line}</span>
            </li>
          ))}
        </ul>
      )}
      {history.length > 1 && (
        <p className="text-[10px] font-mono text-muted-foreground/90 break-all">
          Recent: {history.slice(-5).join(" → ")}
        </p>
      )}
      {(tile.links?.length || tile.cta) && (
        <div className="pt-1.5 border-t border-border/70 flex flex-col gap-1.5">
          {tile.links?.map((lnk) => (
            <Link
              key={lnk.href + lnk.label}
              to={lnk.href}
              className="inline-flex items-center gap-1 text-[12px] sm:text-[11px] font-mono text-cyan hover:text-cyan/80 transition-colors min-h-[40px] sm:min-h-0"
              onClick={(e) => e.stopPropagation()}
            >
              {lnk.label}
              <ArrowRight className="w-3 h-3 shrink-0" />
            </Link>
          ))}
          {tile.cta && (
            <div onClick={(e) => e.stopPropagation()}>
              {tile.cta.note && (
                <p className="text-[10px] font-mono text-muted-foreground leading-snug mb-1 break-words">
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
                      ? "inline-flex items-center gap-1.5 rounded-full border border-cyan/45 bg-cyan/12 hover:bg-cyan/20 text-cyan px-2.5 py-1.5 text-[11px] font-medium transition-colors min-h-[40px]"
                      : "inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-cyan transition-colors min-h-[40px]"
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
  );

  return (
    <div
      className={`dash-kpi dash-kpi-hero relative min-w-0 w-full ${
        expanded ? "dash-kpi-hero-open z-20" : "z-0"
      } ${flash ? "dash-kpi-flash" : ""}`}
    >
      {/* Compact face: value-first, no empty chrome on mobile */}
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        whileTap={{ scale: 0.98 }}
        onClick={onToggle}
        aria-expanded={expanded}
        className="relative z-[1] w-full text-left cursor-pointer flex flex-col items-stretch justify-center gap-1 px-2 py-2 sm:px-2.5 sm:py-2.5 min-h-0 touch-manipulation overflow-hidden rounded-[inherit]"
      >
        <span className="dash-kpi-glow" aria-hidden />
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-md grid place-items-center border border-cyan/35 bg-cyan/10"
            aria-hidden
          >
            <tile.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan" strokeWidth={2.2} />
          </span>
          <span className="dash-kpi-label text-[9px] sm:text-[9.5px] font-mono uppercase tracking-[0.1em] text-muted-foreground leading-tight line-clamp-2 min-w-0 flex-1">
            {tile.label}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 shrink-0 text-muted-foreground/70 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            aria-hidden
          />
        </div>
        {has ? (
          <div
            className={`dash-kpi-value text-[1.35rem] sm:text-[1.42rem] font-display font-semibold tabular-nums leading-none tracking-tight text-cyan px-0.5 ${
              flash ? "ticker-flash" : ""
            }`}
            style={{ textShadow: "0 0 14px var(--color-cyan-glow)" }}
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
          <div className="text-[12px] font-mono text-muted-foreground px-0.5">—</div>
        )}
        {/* Subtle delta + mini history spark — denser on mobile */}
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-center justify-between gap-1 min-w-0">
            <span
              className={`text-[8px] sm:text-[9px] font-mono tabular-nums leading-none ${
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
                : `${delta > 0 ? "+" : ""}${Math.round(delta)}${tile.format === "percent" ? " pts" : ""}`}
            </span>
            {history.length >= 3 && (
              <span className="inline-flex items-end gap-px h-3.5 opacity-70" aria-hidden>
                {history.slice(-5).map((v, i, arr) => {
                  const max = Math.max(...arr, 1);
                  const h = Math.max(2, Math.round((v / max) * 12));
                  return (
                    <span
                      key={i}
                      className="w-[2.5px] rounded-full bg-cyan/80"
                      style={{ height: `${h}px` }}
                    />
                  );
                })}
              </span>
            )}
          </div>
          {barPct != null && (
            <div className="w-full h-1 rounded-full bg-border/70 overflow-hidden shrink-0 hidden sm:block">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan/70 to-cyan"
                initial={{ width: 0 }}
                animate={{ width: `${barPct}%` }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: delay * 0.4 }}
              />
            </div>
          )}
        </div>
      </motion.button>

      {/* Mobile: bottom sheet (does not stretch grid). Desktop: popover under card. */}
      <AnimatePresence initial={false}>
        {expanded && (
          <>
            {/* Mobile sheet backdrop */}
            <motion.button
              type="button"
              aria-label="Close details"
              className="md:hidden fixed inset-0 z-[60] bg-background/70 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
            />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
              className="dash-kpi-popover md:absolute md:left-0 md:right-0 md:top-[calc(100%-2px)] md:z-30 fixed inset-x-0 bottom-0 z-[70] md:bottom-auto p-3 md:p-0 md:px-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pb-0 max-h-[70dvh] md:max-h-none overflow-y-auto md:overflow-visible"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="md:hidden flex justify-center pb-2">
                <span className="w-10 h-1 rounded-full bg-border" aria-hidden />
              </div>
              {detailPanel}
              <button
                type="button"
                onClick={onToggle}
                className="md:hidden mt-2 w-full min-h-[44px] rounded-full border border-border text-[12px] font-mono text-muted-foreground"
              >
                Close
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function DashboardKpiGrid({
  overview,
  snapshots,
  citizenSignals,
  trackerKpis,
  curatedCount = 0,
  postsAnalyzed: postsAnalyzedProp,
  ready = true,
}: {
  overview: DashboardOverview | null;
  snapshots: Record<string, TopicSnapshot> | null;
  citizenSignals?: CitizenSignal[] | FeedCitizenSignal[] | null;
  trackerKpis?: { leadersRanked?: number; countriesMonitored?: number };
  curatedCount?: number;
  /** Pass parent-resolved value so face KPI always matches globe/header posts count. */
  postsAnalyzed?: number;
  /** False until first dashboard fetch settles — avoid painting zeros as real KPIs. */
  ready?: boolean;
}) {
  const k = overview?.kpis ?? {};
  // Product surface: active monitors only (exclude archived). Matches Topics page active count.
  // Do not trust overview.kpis.total_topics_monitored alone — backend can include retired/history keys (was 21 vs 18).
  const activeTopicCount = activeLiveTopicCount();
  const liveTopicCount = activeTopicCount;
  const researchBriefs = listResearchBriefs();
  const researchCount = researchBriefs.length;

  // Until ready, leave values undefined so cards show "—" not fake zeros.
  const topicsMonitored =
    ready && activeTopicCount > 0 ? activeTopicCount : ready ? activeTopicCount || undefined : undefined;

  const leadersRanked = !ready
    ? undefined
    : typeof k.leaders_ranked === "number" && k.leaders_ranked > 0
      ? k.leaders_ranked
      : trackerKpis?.leadersRanked;

  const countriesMonitored = !ready
    ? undefined
    : typeof trackerKpis?.countriesMonitored === "number" && trackerKpis.countriesMonitored > 0
      ? trackerKpis.countriesMonitored
      : typeof k.regions_monitored === "number" && k.regions_monitored > 0
        ? k.regions_monitored
        : undefined;

  // Topic intelligence reports + research case studies + curated/new highlights (existing counts only)
  const topicReports = typeof topicsMonitored === "number" ? topicsMonitored : liveTopicCount;
  const caseStudiesTotal = topicReports + researchCount + (curatedCount > 0 ? curatedCount : 0);
  const trackersActive = DASHBOARD_TRACKERS.length;

  /** Primary CTA → free Library (existing route). */
  const reportsCta: KpiHeroCta = {
    label: "Browse free Library",
    href: "/research/library",
    emphasis: "primary",
    note: "Case studies, topic reports, and active trackers — free to browse.",
  };

  // Single sample total — same on mobile and desktop (no per-device localStorage).
  // Face value unchanged: lifetime posts / multi-source sample total from existing resolvers.
  const sampleAnalyzed = useMemo(() => {
    if (!ready) return undefined;
    if (typeof postsAnalyzedProp === "number" && postsAnalyzedProp > 0) {
      return Math.round(postsAnalyzedProp);
    }
    return resolvePostsAnalyzed({ overview, snapshots, citizenSignals });
  }, [ready, postsAnalyzedProp, overview, snapshots, citizenSignals]);

  const sampleFacts = useMemo(
    () =>
      postsAnalyzedBreakdown({
        overview,
        snapshots,
        citizenSignals,
      }),
    [overview, snapshots, citizenSignals],
  );

  const runId = overview?.generated_at ?? overview?.last_updated ?? null;

  const tiles: KpiHeroTileModel[] = [
    {
      id: "topics",
      label: "Active Topics",
      value: topicsMonitored,
      icon: Layers,
      format: "number",
      liveNote: "Active topics on the desk (archived topics excluded).",
      liveFacts: [
        `Active topics: ${activeTopicCount}`,
        `Archived (history only): ${Object.keys(LIVE_TOPIC_KEYS).filter((id) => isArchivedTopicId(id)).length}`,
        typeof k.core_topics_refreshed === "number"
          ? `Core topics refreshed in latest sample: ${k.core_topics_refreshed}`
          : "Core refresh count not in this sample yet.",
      ],
      links: [
        { label: "Open topics", href: "/research/library" },
        { label: "Method & limits", href: "/about" },
      ],
    },
    {
      id: "countries",
      label: "Countries / Regions",
      value: countriesMonitored,
      icon: MapPinned,
      format: "number",
      liveNote: "Countries in peace and region trackers.",
      liveFacts: [
        trackerKpis?.countriesMonitored
          ? `Peace tracker countries: ${trackerKpis.countriesMonitored}`
          : "Peace country count not loaded yet.",
        typeof k.regions_monitored === "number"
          ? `Regions in latest sample: ${k.regions_monitored}`
          : "Region count not in this sample yet.",
      ],
      links: [
        { label: "Open peace tracker", href: "/trackers/peace" },
        { label: "About Elenchos", href: "/about" },
      ],
    },
    {
      id: "leaders",
      label: "Leaders Ranked",
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
      id: "reports",
      label: "Published Intelligence",
      value: ready ? caseStudiesTotal : undefined,
      icon: FileStack,
      format: "number",
      liveNote: "Topic reports + research case studies + curated highlights. Trackers listed separately.",
      liveFacts: [
        `Topic reports: ${topicReports}`,
        `Research case studies: ${researchCount}`,
        curatedCount > 0 ? `Curated highlights: ${curatedCount}` : "No curated highlights this load.",
        `Active trackers: ${trackersActive} (Leadership, Peace, Networks Ledger)`,
      ],
      links: [
        { label: "Browse free Library", href: "/research/library" },
        { label: "Method & limits", href: "/about" },
      ],
      cta: reportsCta,
    },
    {
      id: "sample",
      label: "Data Points Analyzed",
      value: sampleAnalyzed,
      icon: Activity,
      format: sampleAnalyzed != null && sampleAnalyzed >= 1000 ? "compact" : "number",
      liveNote:
        "All data points analyzed for live topics (X posts + multi-source material in the same lifetime total). Grows with every pipeline run; never drops.",
      liveFacts: [
        ...sampleFacts,
        typeof k.signals_generated === "number"
          ? `Signals in latest sample: ${k.signals_generated}`
          : "Signal count not in this sample yet.",
        runId
          ? `Sample stamped: ${new Date(runId).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}`
          : "No sample timestamp yet.",
      ],
      links: [
        { label: "Sampling method", href: "/about" },
        { label: "Browse topics", href: "/research/library" },
      ],
    },
    {
      id: "trackers",
      label: "Trackers Active",
      value: ready ? trackersActive : undefined,
      icon: Radar,
      format: "number",
      liveNote: "Live product trackers and indexes on the desk.",
      liveFacts: DASHBOARD_TRACKERS.map((t) => `${t.title} · ${t.badge}`),
      links: [
        { label: "Leadership board", href: "/trackers/leaders" },
        { label: "Peace index", href: "/trackers/peace" },
        { label: "Networks Ledger", href: "/research/networks-ledger" },
      ],
    },
  ];

  const [historyStore, setHistoryStore] = useState<Record<string, number[]>>({});
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    const payload: Record<string, number | undefined> = {};
    for (const t of tiles) payload[t.id] = t.value;
    setHistoryStore(appendKpiHistory(payload));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- track when numeric values change
  }, [
    ready,
    topicsMonitored,
    leadersRanked,
    countriesMonitored,
    caseStudiesTotal,
    sampleAnalyzed,
    trackersActive,
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
      className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-1.5 sm:gap-2.5 items-start min-w-0 max-sm:gap-1.5 overflow-x-clip"
      data-kpi-source="shared-desktop-mobile"
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


