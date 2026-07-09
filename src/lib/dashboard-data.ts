// Loads latest snapshots from external Supabase (`topic_snapshots` table) and
// the latest aggregated row from `dashboard_overviews`. Exposes both on the
// window for any component to read. Per-topic snapshots are keyed by the
// exact topic name string used by the backend.

import { useEffect, useState } from "react";

const SUPABASE_URL = "https://jacbalsongvqvaqlfsbx.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphY2JhbHNvbmd2cXZhcWxmc2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NDg1MjgsImV4cCI6MjA5NTEyNDUyOH0.NZI55Xy8KpqQHdPfQohojnnc-GDef0L8dKQ2oOYI1EU";

// Canonical topic names from the backend (exact match required for .eq filters).
export const CANONICAL_TOPICS = [
  "Arab-Israeli Normalization / Abraham Accords",
  "Iranian Voices vs Regime",
  "Maritime AI Industry & Greece's Global Role",
  "Eastern Mediterranean Alliance (Israel-Greece-Cyprus)",
  "Trump Administration Actions & US Politics",
  "Crypto Regulation & Financial Markets Volatility",
  "Migration, Green Policies & Internal EU Divisions",
  "Government Performance, Corruption & Scandals",
  "Crime, Safety & Lawlessness",
  "Political Polarization & Populism Rise",
  "Global AI Race",
  "Cuba Sanctions & the Domino Effect",
  "fifa-world-cup-2026",
  "US AI Economy Boom & American Technological Renaissance",
] as const;

// Static UI-only placeholders. NEVER queried against Supabase. NEVER bound
// to topic_snapshots. Surfaced only as "Coming soon" cards / sponsor options.
export const COMING_SOON_TOPICS = [
  "Rise of EU right-wing/populist parties challenging establishments",
  "Illegal immigration & national security",
] as const;


export type SegmentValue = { score: number; label?: string };

export type QuestionAnalysis = {
  question: string;
  sentiment_score?: number;
  sentiment_label?: string;
  summary?: string;
  key_points?: string[];
};

export type TopicSignals = {
  total_signals?: number;
  positive_signals?: number;
  negative_signals?: number;
  neutral_signals?: number;
  key_signals?: string[];
};

export type TopicSnapshot = {
  topic: string;
  month?: string;
  overall_sentiment?: { score?: number; label?: string; trend?: string } | string;
  segmented_sentiment?: Record<string, SegmentValue | number>;
  narrative_summary?: string;
  key_insights?: string[];
  question_analysis?: QuestionAnalysis[];
  sample_size?: number;
  last_updated?: string;
  raw_analysis?: Record<string, unknown>;
  // Backend-published divergence score (0–100) from latest_topic_snapshots.
  divergence_score?: number | null;
  // Grok narrative-gap prose from analyze_divergence() (Pass 1).
  divergence_gap?: string | null;
  // Backend-published signals block from latest_topic_snapshots.
  signals?: TopicSignals | null;
  // Top headlines derived from key_insights (Pass 1).
  top_3_key_stories?: string[] | null;
  analysis_version?: string;
  is_live?: boolean;
  // Narrative-divergence block, when published by the backend.
  narrative_divergence?:
    | { score?: number; label?: string; summary?: string }
    | number
    | null;
};

/** Content layer precedence: Live (Pass 1) > Curated (Pass 2) > Static (illustrative). */
export type ContentSource = "live" | "curated" | "static" | "loading";

export type InsightThread = {
  theme?: string;
  headline?: string;
  summary?: string;
  confidence?: string;
  divergence_note?: string;
  rank?: number;
};

export type CuratedTopicInsights = {
  id?: number;
  topic?: string;
  snapshot_month?: string;
  generated_at?: string;
  comparison_window?: string;
  hero_headline?: string;
  hero_summary?: string;
  hero_confidence?: string;
  insight_threads?: InsightThread[];
  sentiment_delta?: number | null;
  divergence_delta?: number | null;
  evolution_note?: string | null;
  lens_scores?: Partial<Record<
    "geopolitical" | "economic" | "social" | "governance" | "security",
    number
  >>;
  status?: "draft" | "published" | "archived";
  audience_lenses?: {
    journalist?: { summary?: string; insights?: string[] };
    researcher?: { summary?: string; insights?: string[] };
    policymaker?: { summary?: string; insights?: string[] };
  };
};

export type CuratedQaEvidence = { point?: string; confidence?: string };

export type CuratedQaPair = {
  id?: number;
  topic?: string;
  question_slug?: string;
  snapshot_month?: string;
  generated_at?: string;
  comparison_window?: string;
  card_title?: string;
  card_summary?: string;
  key_evidence?: CuratedQaEvidence[];
  sentiment_score?: number;
  sentiment_label?: string;
  divergence_note?: string;
  theme?: string;
  confidence?: string;
  rank?: number;
  wow_delta?: number | null;
  mom_delta?: number | null;
  source_question?: string;
};

export type TopicHistoryPoint = {
  month?: string;
  last_updated?: string;
  overall_sentiment?: { score?: number; label?: string };
  divergence_score?: number | null;
  segmented_sentiment?: Record<string, SegmentValue | number>;
};

export type IntelFeedItem = {
  id?: string;
  topic?: string;
  region?: string;
  lat?: number;
  lng?: number;
  sentiment?: string;
  intensity?: string;
  intensityScore?: number;
  posts?: number;
  engagement?: number;
  divergence?: number;
  velocity?: number;
  headline?: string;
  excerpt?: string;
  source?: string;
  timestamp?: number;
};

export type DashboardKpis = {
  total_topics_monitored?: number;
  total_posts_analyzed?: number;
  signals_generated?: number;
  regions_monitored?: number;
  active_topics?: number;
  // New (optional) fields surfaced as hero KPIs when present on backend rows.
  average_narrative_divergence?: number;
  core_topics_refreshed?: number;
  leaders_ranked?: number;
  peace_health_index?: number;
};

export type HeatmapPoint = {
  topic?: string;
  country?: string;
  country_code?: string;
  sentiment_score?: number;
};

export type DashboardOverview = {
  id?: number;
  generated_at?: string;
  last_updated?: string;
  // Legacy fields (older rows)
  total_posts_analyzed?: number;
  active_topics?: number;
  high_alert_topics?: number;
  trend_velocity?: number;
  intel_feed?: IntelFeedItem[];
  // New canonical backend shape
  kpis?: DashboardKpis;
  citizen_signals?: Array<{
    topic?: string;
    trend?: string;
    excerpt?: string;
    headline?: string;
    summary?: string;
    sample_size?: number;
    last_updated?: string;
    sentiment_label?: string;
    sentiment_score?: number;
    // Divergence metrics — surfaced when backend supplies them.
    divergence_score?: number;
    divergence_label?: string;
    narrative_divergence?: number;
  }>;
  global_heatmap?: HeatmapPoint[];
  grok_ai_summary?: string;
  top_3_key_stories?: unknown[];
};

export type CitizenSignal = {
  id: number;
  topic: string;
  signal_type: string;
  sentiment_score?: number | null;
  sentiment_label?: string | null;
  trend?: string | null;
  headline?: string | null;
  summary?: string | null;
  excerpt?: string | null;
  source?: string | null;
  sample_size?: number | null;
  last_updated?: string | null;
  created_at?: string | null;
};

/** Dashboard feed row — citizen signal and/or curated highlight metadata. */
export type FeedCitizenSignal = CitizenSignal & {
  divergence_score?: number;
  narrative_divergence?: number;
  divergence_label?: string;
  sentiment_delta?: number | null;
  divergence_delta?: number | null;
  comparison_window?: string;
  curated_insight?: CuratedTopicInsights;
};

declare global {
  interface Window {
    dashboardData?: Record<string, TopicSnapshot> | null;
    dashboardOverview?: DashboardOverview | null;
    dashboardMeta?: { empty?: boolean; fallback?: boolean } | null;
    citizenSignals?: CitizenSignal[] | null;
    curatedInsights?: Record<string, CuratedTopicInsights | null> | null;
    curatedQaPairs?: Record<string, CuratedQaPair[]> | null;
    topicHistory?: Record<string, TopicHistoryPoint[]> | null;
    __dashboardDataPromise?: Promise<Record<string, TopicSnapshot> | null>;
    __dashboardOverviewPromise?: Promise<DashboardOverview | null>;
    __citizenSignalsPromise?: Promise<CitizenSignal[] | null>;
    __curatedInsightsPromises?: Record<string, Promise<CuratedTopicInsights | null>>;
    __curatedQaPromises?: Record<string, Promise<CuratedQaPair[]>>;
    __topicHistoryPromises?: Record<string, Promise<TopicHistoryPoint[]>>;
  }
}

export function invalidateDashboardCache(): void {
  if (typeof window === "undefined") return;
  window.dashboardData = undefined;
  window.__dashboardDataPromise = undefined;
  window.dashboardMeta = undefined;
}

export async function loadDashboardData(force = false): Promise<Record<string, TopicSnapshot> | null> {
  if (typeof window === "undefined") return null;
  const hadFailedFetch = window.dashboardMeta?.fallback === true;
  if (force || hadFailedFetch) {
    invalidateDashboardCache();
  } else if (window.dashboardData) {
    return window.dashboardData;
  }
  if (window.__dashboardDataPromise && !force && !hadFailedFetch) {
    return window.__dashboardDataPromise;
  }

  window.__dashboardDataPromise = (async () => {
    try {
      // Single source of truth: latest_topic_snapshots view (one row per
      // topic, latest by last_updated). Includes divergence_score + signals.
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/latest_topic_snapshots?select=*&limit=400`,
        { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } },
      );
      if (!res.ok) throw new Error("HTTP " + res.status);
      const rows = (await res.json()) as TopicSnapshot[];

      const canonical = new Set<string>(CANONICAL_TOPICS);
      const byTopic: Record<string, TopicSnapshot> = {};
      for (const row of rows) {
        if (!row?.topic) continue;
        if (!canonical.has(row.topic)) continue;
        // Latest-per-topic is already guaranteed by the view; first wins.
        if (byTopic[row.topic]) continue;
        byTopic[row.topic] = row;
      }

      window.dashboardData = byTopic;
      window.dashboardMeta = {};
      console.log("✅ Loaded latest_topic_snapshots", Object.keys(byTopic));
      return byTopic;
    } catch (e) {
      console.error("Supabase latest_topic_snapshots fetch failed", e);
      window.dashboardData = {};
      window.dashboardMeta = { fallback: true };
      return {};
    }
  })();

  return window.__dashboardDataPromise;
}

export async function loadDashboardOverview(): Promise<DashboardOverview | null> {
  if (typeof window === "undefined") return null;
  if (window.dashboardOverview) return window.dashboardOverview;
  if (window.__dashboardOverviewPromise) return window.__dashboardOverviewPromise;

  window.__dashboardOverviewPromise = (async () => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/dashboard_overviews?select=*&order=generated_at.desc&limit=1`,
        { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } },
      );
      if (!res.ok) throw new Error("HTTP " + res.status);
      const rows = (await res.json()) as DashboardOverview[];
      const row = rows?.[0] ?? null;
      window.dashboardOverview = row;
      console.log("✅ Loaded dashboard_overviews", row?.id);
      return row;
    } catch (e) {
      console.error("Supabase dashboard_overviews fetch failed", e);
      window.dashboardOverview = null;
      return null;
    }
  })();

  return window.__dashboardOverviewPromise;
}

const supabaseHeaders = { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` };

export async function loadCuratedTopicInsights(
  topic: string,
  window: string = "wow",
): Promise<CuratedTopicInsights | null> {
  if (typeof window === "undefined" || !topic) return null;
  const cacheKey = `${topic}::${window}`;
  window.curatedInsights ??= {};
  if (window.curatedInsights[cacheKey] !== undefined) {
    return window.curatedInsights[cacheKey];
  }
  window.__curatedInsightsPromises ??= {};
  if (!window.__curatedInsightsPromises[cacheKey]) {
    window.__curatedInsightsPromises[cacheKey] = (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/latest_curated_topic_insights?topic=eq.${encodeURIComponent(topic)}&comparison_window=eq.${encodeURIComponent(window)}&select=*&limit=1`,
          { headers: supabaseHeaders },
        );
        if (!res.ok) {
          // View may not exist until migration is applied
          if (res.status === 404 || res.status === 400) return null;
          throw new Error("HTTP " + res.status);
        }
        const rows = (await res.json()) as CuratedTopicInsights[];
        const row = rows?.[0] ?? null;
        window.curatedInsights![cacheKey] = row;
        return row;
      } catch (e) {
        console.warn("curated_topic_insights fetch failed (table may not exist yet)", e);
        window.curatedInsights![cacheKey] = null;
        return null;
      }
    })();
  }
  return window.__curatedInsightsPromises[cacheKey];
}

export async function loadCuratedQaPairs(topic: string): Promise<CuratedQaPair[]> {
  if (typeof window === "undefined" || !topic) return [];
  window.curatedQaPairs ??= {};
  if (window.curatedQaPairs[topic]) return window.curatedQaPairs[topic]!;
  window.__curatedQaPromises ??= {};
  if (!window.__curatedQaPromises[topic]) {
    window.__curatedQaPromises[topic] = (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/latest_curated_qa_pairs?topic=eq.${encodeURIComponent(topic)}&select=*&order=rank.asc&limit=50`,
          { headers: supabaseHeaders },
        );
        if (!res.ok) {
          if (res.status === 404 || res.status === 400) return [];
          throw new Error("HTTP " + res.status);
        }
        const rows = (await res.json()) as CuratedQaPair[];
        const sorted = [...(rows ?? [])].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
        window.curatedQaPairs![topic] = sorted;
        return sorted;
      } catch (e) {
        console.warn("curated_qa_pairs fetch failed (table may not exist yet)", e);
        window.curatedQaPairs![topic] = [];
        return [];
      }
    })();
  }
  return window.__curatedQaPromises[topic];
}

export async function loadCuratedHighlights(limit = 6): Promise<CuratedTopicInsights[]> {
  if (typeof window === "undefined") return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/latest_curated_topic_insights?comparison_window=eq.wow&select=*&order=generated_at.desc&limit=${limit * 3}`,
      { headers: supabaseHeaders },
    );
    if (!res.ok) return [];
    const rows = (await res.json()) as CuratedTopicInsights[];
    const seen = new Set<string>();
    const out: CuratedTopicInsights[] = [];
    for (const row of rows ?? []) {
      if (!row.topic || seen.has(row.topic)) continue;
      if (!row.hero_headline && !row.hero_summary) continue;
      seen.add(row.topic);
      out.push(row);
      if (out.length >= limit) break;
    }
    return out;
  } catch {
    return [];
  }
}

export async function loadTopicHistory(topic: string, limit = 6): Promise<TopicHistoryPoint[]> {
  if (typeof window === "undefined" || !topic) return [];
  window.topicHistory ??= {};
  if (window.topicHistory[topic]) return window.topicHistory[topic]!;
  window.__topicHistoryPromises ??= {};
  if (!window.__topicHistoryPromises[topic]) {
    window.__topicHistoryPromises[topic] = (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/topic_snapshots?topic=eq.${encodeURIComponent(topic)}&select=month,last_updated,overall_sentiment,divergence_score,segmented_sentiment&order=last_updated.desc&limit=${limit}`,
          { headers: supabaseHeaders },
        );
        if (!res.ok) throw new Error("HTTP " + res.status);
        const rows = (await res.json()) as TopicHistoryPoint[];
        window.topicHistory![topic] = rows ?? [];
        return rows ?? [];
      } catch (e) {
        console.warn("topic_snapshots history fetch failed", e);
        window.topicHistory![topic] = [];
        return [];
      }
    })();
  }
  return window.__topicHistoryPromises[topic];
}

export async function loadCitizenSignals(): Promise<CitizenSignal[] | null> {
  if (typeof window === "undefined") return null;
  if (window.citizenSignals) return window.citizenSignals;
  if (window.__citizenSignalsPromise) return window.__citizenSignalsPromise;

  window.__citizenSignalsPromise = (async () => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/citizen_signals?select=id,topic,signal_type,sentiment_score,sentiment_label,trend,headline,summary,excerpt,source,sample_size,last_updated,created_at&order=last_updated.desc&limit=400`,
        { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } },
      );
      if (!res.ok) throw new Error("HTTP " + res.status);
      const rows = (await res.json()) as CitizenSignal[];
      const canonical = new Set<string>(CANONICAL_TOPICS);
      const filtered = rows.filter((r) => r?.topic && canonical.has(r.topic));
      window.citizenSignals = filtered;
      console.log("✅ Loaded citizen_signals", filtered.length);
      return filtered;
    } catch (e) {
      console.error("Supabase citizen_signals fetch failed", e);
      window.citizenSignals = [];
      return [];
    }
  })();

  return window.__citizenSignalsPromise;
}


// ── simMode (LIVE vs SIM) ────────────────────────────────────────────────
// Default = LIVE. Persisted in localStorage. Components subscribe via hook.

const SIM_KEY = "cp_sim_mode";
const SIM_EVT = "cp:sim-mode-change";

export function getSimMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SIM_KEY) === "1";
  } catch {
    return false;
  }
}

export function setSimMode(v: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SIM_KEY, v ? "1" : "0");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(SIM_EVT));
}

export function useSimMode(): [boolean, (v: boolean) => void] {
  const [sim, setSim] = useState<boolean>(() => getSimMode());
  useEffect(() => {
    const onChange = () => setSim(getSimMode());
    window.addEventListener(SIM_EVT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(SIM_EVT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return [sim, (v: boolean) => setSimMode(v)];
}
