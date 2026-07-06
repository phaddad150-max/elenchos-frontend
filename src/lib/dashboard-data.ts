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
  // Backend-published signals block from latest_topic_snapshots.
  signals?: TopicSignals | null;
  // Narrative-divergence block, when published by the backend.
  narrative_divergence?:
    | { score?: number; label?: string; summary?: string }
    | number
    | null;
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

declare global {
  interface Window {
    dashboardData?: Record<string, TopicSnapshot> | null;
    dashboardOverview?: DashboardOverview | null;
    dashboardMeta?: { empty?: boolean; fallback?: boolean } | null;
    citizenSignals?: CitizenSignal[] | null;
    __dashboardDataPromise?: Promise<Record<string, TopicSnapshot> | null>;
    __dashboardOverviewPromise?: Promise<DashboardOverview | null>;
    __citizenSignalsPromise?: Promise<CitizenSignal[] | null>;
  }
}

export async function loadDashboardData(): Promise<Record<string, TopicSnapshot> | null> {
  if (typeof window === "undefined") return null;
  if (window.dashboardData) return window.dashboardData;
  if (window.__dashboardDataPromise) return window.__dashboardDataPromise;

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
