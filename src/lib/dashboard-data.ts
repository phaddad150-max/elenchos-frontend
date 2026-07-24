// Loads snapshots from Supabase (`latest_topic_snapshots` + `topic_snapshots` history) and
// the latest aggregated row from `dashboard_overviews`. Exposes both on the
// window for any component to read. Per-topic snapshots are keyed by the
// exact topic name string used by the backend.
//
// GOLDEN RULE: READ-ONLY toward intelligence tables — never DELETE, UPDATE, or UPSERT.
// New data is appended by backend pipelines only (.insert()). UI reads via fetch/select.

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
  "US-Iran Confrontation: Sanctions, Networks & Regime Pressure",
  "Public Voices on Elon Musk: Trust, Media Frames & Power",
  "US AI Economy Boom & American Technological Renaissance",
] as const;

const CANONICAL_TOPIC_SET = new Set<string>(CANONICAL_TOPICS);

/** Legacy / truncated DB topic strings → canonical TOPIC_CONFIG keys (keep in sync with backend). */
export const TOPIC_ALIASES: Record<string, string> = {
  "fifa world cup 2026": "fifa-world-cup-2026",
  "fifa world cup 2026 & global fan reactions": "fifa-world-cup-2026",
  "us ai economy boom & american technologies": "US AI Economy Boom & American Technological Renaissance",
  "crime & safety": "Crime, Safety & Lawlessness",
  "crime and safety": "Crime, Safety & Lawlessness",
  "crime-safety-lawlessness": "Crime, Safety & Lawlessness",
  "crime, safety & lawlessness": "Crime, Safety & Lawlessness",
  "us-iran confrontation": "US-Iran Confrontation: Sanctions, Networks & Regime Pressure",
  "us iran confrontation": "US-Iran Confrontation: Sanctions, Networks & Regime Pressure",
  "us-iran-confrontation": "US-Iran Confrontation: Sanctions, Networks & Regime Pressure",
  "us-iran confrontation: sanctions, networks & regime pressure":
    "US-Iran Confrontation: Sanctions, Networks & Regime Pressure",
  "elon musk": "Public Voices on Elon Musk: Trust, Media Frames & Power",
  "musk": "Public Voices on Elon Musk: Trust, Media Frames & Power",
  "public voices on elon musk": "Public Voices on Elon Musk: Trust, Media Frames & Power",
  "public voices on elon musk: trust, media frames & power":
    "Public Voices on Elon Musk: Trust, Media Frames & Power",
  "elon-musk-public-voices": "Public Voices on Elon Musk: Trust, Media Frames & Power",
};

/** Map any Supabase topic string to the canonical backend key, or null if unknown. */
export function normalizeTopicKey(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (CANONICAL_TOPIC_SET.has(trimmed)) return trimmed;
  const aliased = TOPIC_ALIASES[trimmed.toLowerCase()];
  if (aliased && CANONICAL_TOPIC_SET.has(aliased)) return aliased;
  return null;
}

function snapshotQuality(row: TopicSnapshot): number {
  const sample = typeof row.sample_size === "number" ? row.sample_size : 0;
  const fetched =
    typeof row.fetched_post_count === "number" ? row.fetched_post_count : sample;
  if (sample <= 0 && fetched <= 0) return -1;
  return sample > 0 ? sample : fetched;
}

function isSubstantiveSnapshot(row: TopicSnapshot | null | undefined): boolean {
  return snapshotQuality(row as TopicSnapshot) >= 0;
}

function snapshotRecencyMs(row: TopicSnapshot): number {
  return Date.parse(row.last_updated ?? "") || 0;
}

/**
 * Live display rank: skip empty rows, then prefer freshest last_updated.
 * Sample size is only a tiebreaker — never hide a newer FIFA/manual run
 * behind an older larger sample.
 */
export function compareSnapshotsForLive(a: TopicSnapshot, b: TopicSnapshot): number {
  const aSub = isSubstantiveSnapshot(a) ? 1 : 0;
  const bSub = isSubstantiveSnapshot(b) ? 1 : 0;
  if (aSub !== bSub) return bSub - aSub;
  const ta = snapshotRecencyMs(a);
  const tb = snapshotRecencyMs(b);
  if (ta !== tb) return tb - ta;
  return snapshotQuality(b) - snapshotQuality(a);
}

/** Merge latest view + history: always surface the newest substantive Pass 1 row. */
export function mergeTopicSnapshots(
  historical?: TopicSnapshot | null,
  latest?: TopicSnapshot | null,
): TopicSnapshot | null {
  if (!historical && !latest) return null;
  if (!historical) return latest!;
  if (!latest) return historical;

  const hQ = snapshotQuality(historical);
  const lQ = snapshotQuality(latest);

  // Newest substantive wins for all narrative/content fields.
  let content: TopicSnapshot;
  if (lQ >= 0 && hQ >= 0) {
    content = compareSnapshotsForLive(latest, historical) <= 0 ? latest : historical;
  } else if (lQ >= 0) {
    content = latest;
  } else if (hQ >= 0) {
    content = historical;
  } else {
    content = compareSnapshotsForLive(latest, historical) <= 0 ? latest : historical;
  }

  const other = content === latest ? historical : latest;

  return {
    ...content,
    topic: content.topic,
    // Prefer fields from the displayed content; fill gaps from the other row.
    divergence_score: content.divergence_score ?? other.divergence_score,
    signals: content.signals ?? other.signals,
    top_3_key_stories: content.top_3_key_stories ?? other.top_3_key_stories,
    divergence_gap: content.divergence_gap ?? other.divergence_gap,
    narrative_divergence: (() => {
      const c = content.narrative_divergence;
      const o = other.narrative_divergence;
      if (c && typeof c === "object") return c;
      if (o && typeof o === "object") return o;
      return content.narrative_divergence ?? other.narrative_divergence;
    })(),
    last_updated: content.last_updated ?? other.last_updated,
    pipeline_last_updated:
      snapshotRecencyMs(latest) >= snapshotRecencyMs(historical)
        ? latest.last_updated ?? historical.last_updated
        : historical.last_updated ?? latest.last_updated,
    key_insights: content.key_insights ?? other.key_insights,
    question_analysis: content.question_analysis ?? other.question_analysis,
    narrative_summary: content.narrative_summary ?? other.narrative_summary,
    overall_sentiment: content.overall_sentiment ?? other.overall_sentiment,
    segmented_sentiment: content.segmented_sentiment ?? other.segmented_sentiment,
    // Honest sample for the displayed run (do not inflate with older max).
    sample_size: content.sample_size ?? other.sample_size,
    fetched_post_count: content.fetched_post_count ?? other.fetched_post_count,
    month: content.month ?? other.month,
    analysis_version: content.analysis_version ?? other.analysis_version,
    is_live: content.is_live ?? other.is_live,
    raw_analysis: content.raw_analysis ?? other.raw_analysis,
  };
}

/** Prefer newest substantive row per topic (empty inserts never win). */
export function pickBestSnapshots(rows: TopicSnapshot[]): Record<string, TopicSnapshot> {
  const buckets: Record<string, TopicSnapshot[]> = {};
  for (const row of rows) {
    const canonical = normalizeTopicKey(row?.topic);
    if (!canonical) continue;
    (buckets[canonical] ??= []).push({ ...row, topic: canonical });
  }
  const byTopic: Record<string, TopicSnapshot> = {};
  for (const [key, group] of Object.entries(buckets)) {
    group.sort(compareSnapshotsForLive);
    byTopic[key] = group[0]!;
  }
  return byTopic;
}

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
  fetched_post_count?: number;
  /** Most recent pipeline run timestamp (may be an empty fallback row). */
  pipeline_last_updated?: string;
  // Narrative-divergence block, when published by the backend.
  narrative_divergence?:
    | {
        score?: number;
        label?: string;
        summary?: string;
        /** Short citizen claim for dual-panel UI (≤160 chars). */
        citizen_frame?: string;
        /** Short official/media claim for dual-panel UI. */
        official_media_frame?: string;
        /** One-line clash headline. */
        gap_headline?: string;
      }
    | number
    | null;
};

/** Parse structured narrative-gap frames from a snapshot (legacy-safe). */
export function getNarrativeGapFrames(snapshot?: TopicSnapshot | null): {
  score: number | null;
  citizenFrame: string;
  officialMediaFrame: string;
  gapHeadline: string;
  fullOverview: string;
} {
  if (!snapshot) {
    return { score: null, citizenFrame: "", officialMediaFrame: "", gapHeadline: "", fullOverview: "" };
  }
  let score: number | null =
    typeof snapshot.divergence_score === "number" ? Math.round(snapshot.divergence_score) : null;
  let citizenFrame = "";
  let officialMediaFrame = "";
  let gapHeadline = "";
  let fullOverview = (snapshot.divergence_gap ?? "").trim();

  const applyFrameObj = (raw: {
    score?: number;
    label?: string;
    summary?: string;
    citizen_frame?: string;
    official_media_frame?: string;
    gap_headline?: string;
  }) => {
    if (score === null && typeof raw.score === "number") score = Math.round(raw.score);
    if (typeof raw.citizen_frame === "string" && raw.citizen_frame.trim())
      citizenFrame = raw.citizen_frame.trim();
    if (typeof raw.official_media_frame === "string" && raw.official_media_frame.trim())
      officialMediaFrame = raw.official_media_frame.trim();
    if (typeof raw.gap_headline === "string" && raw.gap_headline.trim())
      gapHeadline = raw.gap_headline.trim();
    else if (!gapHeadline && typeof raw.label === "string" && raw.label.trim())
      gapHeadline = raw.label.trim();
    if (!fullOverview && typeof raw.summary === "string") fullOverview = raw.summary.trim();
  };

  const nd = snapshot.narrative_divergence;
  if (nd && typeof nd === "object") {
    applyFrameObj(nd);
  } else if (score === null && typeof nd === "number") {
    score = Math.round(nd);
  }

  // Fallback: frames stored under raw_analysis when column missing
  const rawA = snapshot.raw_analysis;
  if (rawA && typeof rawA === "object") {
    const frames = (rawA as { divergence_frames?: Record<string, unknown> }).divergence_frames;
    if (frames && typeof frames === "object") {
      applyFrameObj(frames as {
        score?: number;
        label?: string;
        summary?: string;
        citizen_frame?: string;
        official_media_frame?: string;
        gap_headline?: string;
      });
    }
  }

  return { score, citizenFrame, officialMediaFrame, gapHeadline, fullOverview };
}

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
  sample_size?: number;
  fetched_post_count?: number;
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
    topicSnapshots?: Record<string, TopicSnapshot | null> | null;
    __dashboardDataPromise?: Promise<Record<string, TopicSnapshot> | null>;
    __dashboardOverviewPromise?: Promise<DashboardOverview | null>;
    __citizenSignalsPromise?: Promise<CitizenSignal[] | null>;
    __curatedInsightsPromises?: Record<string, Promise<CuratedTopicInsights | null>>;
    __curatedQaPromises?: Record<string, Promise<CuratedQaPair[]>>;
    __topicHistoryPromises?: Record<string, Promise<TopicHistoryPoint[]>>;
    __topicSnapshotPromises?: Record<string, Promise<TopicSnapshot | null>>;
  }
}

export function invalidateDashboardCache(): void {
  if (typeof window === "undefined") return;
  window.dashboardData = undefined;
  window.__dashboardDataPromise = undefined;
  window.dashboardMeta = undefined;
}

const supabaseHeaders = {
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
  // Intelligence is append-only; always read the newest REST payload.
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

function supabaseFetch(pathAndQuery: string, init?: RequestInit): Promise<Response> {
  // Do NOT append arbitrary query params (e.g. _ts=...). PostgREST treats unknown
  // keys as column filters and returns 400, which blanked the entire dashboard.
  // Browser freshness comes from cache: "no-store" + Cache-Control headers only.
  const url = `${SUPABASE_URL}/rest/v1/${pathAndQuery}`;
  return fetch(url, {
    ...init,
    cache: "no-store",
    headers: { ...supabaseHeaders, ...(init?.headers as Record<string, string> | undefined) },
  });
}

/**
 * Build a PostgREST `in.(...)` value list that survives commas, ampersands, etc.
 * Without double quotes, `in.(Crime, Safety & Lawlessness)` splits on commas and
 * returns zero rows — which blanked Crime and other multi-clause topics.
 */
export function postgrestInList(values: string[]): string {
  return values
    .filter((v) => Boolean(v?.trim()))
    .map((v) => {
      const quoted = `"${String(v).replace(/"/g, '\\"')}"`;
      return encodeURIComponent(quoted);
    })
    .join(",");
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
      const [histRes, latestRes] = await Promise.all([
        supabaseFetch("topic_snapshots?select=*&order=last_updated.desc&limit=500"),
        supabaseFetch("latest_topic_snapshots?select=*"),
      ]);
      if (!histRes.ok) throw new Error("HTTP " + histRes.status);
      const histRows = (await histRes.json()) as TopicSnapshot[];
      const historical = pickBestSnapshots(histRows);

      let latestByTopic: Record<string, TopicSnapshot> = {};
      if (latestRes.ok) {
        const latestRows = (await latestRes.json()) as TopicSnapshot[];
        latestByTopic = pickBestSnapshots(latestRows);
      } else {
        console.warn("latest_topic_snapshots fetch failed", latestRes.status);
      }

      const keys = new Set([...Object.keys(historical), ...Object.keys(latestByTopic)]);
      const byTopic: Record<string, TopicSnapshot> = {};
      for (const key of keys) {
        const merged = mergeTopicSnapshots(historical[key], latestByTopic[key]);
        if (merged) byTopic[key] = merged;
      }

      window.dashboardData = byTopic;
      window.dashboardMeta = {};
      console.log("✅ Loaded topic snapshots (merged latest + history)", Object.keys(byTopic));
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

export async function loadDashboardOverview(force = false): Promise<DashboardOverview | null> {
  if (typeof window === "undefined") return null;
  if (force) {
    window.dashboardOverview = undefined;
    window.__dashboardOverviewPromise = undefined;
  }
  if (window.dashboardOverview) return window.dashboardOverview;
  if (window.__dashboardOverviewPromise) return window.__dashboardOverviewPromise;

  window.__dashboardOverviewPromise = (async () => {
    try {
      const res = await supabaseFetch(
        "dashboard_overviews?select=*&order=generated_at.desc&limit=1",
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

/** Best merged Pass 1 snapshot for one topic (direct fetch — not dependent on global 500-row cache). */
export async function loadTopicSnapshot(
  topic: string,
  force = false,
): Promise<TopicSnapshot | null> {
  if (typeof window === "undefined" || !topic) return null;
  const canonical = normalizeTopicKey(topic) ?? topic;
  window.topicSnapshots ??= {};
  if (force) {
    delete window.topicSnapshots[canonical];
    if (window.__topicSnapshotPromises) {
      delete window.__topicSnapshotPromises[`${canonical}::0`];
      delete window.__topicSnapshotPromises[`${canonical}::1`];
    }
  } else if (window.topicSnapshots[canonical]) {
    return window.topicSnapshots[canonical]!;
  }
  window.__topicSnapshotPromises ??= {};
  const promiseKey = `${canonical}::${force ? "1" : "0"}`;
  if (!force && window.__topicSnapshotPromises[promiseKey]) {
    return window.__topicSnapshotPromises[promiseKey]!;
  }
  window.__topicSnapshotPromises[promiseKey] = (async () => {
    try {
      const names = legacyTopicNames(canonical);
      const inList = postgrestInList(names);
      const [histRes, latestRes] = await Promise.all([
        supabaseFetch(
          `topic_snapshots?topic=in.(${inList})&select=*&order=last_updated.desc&limit=24`,
        ),
        supabaseFetch(
          `latest_topic_snapshots?topic=in.(${inList})&select=*&limit=5`,
        ),
      ]);
      if (!histRes.ok) throw new Error("HTTP " + histRes.status);
      const historical = pickBestSnapshots((await histRes.json()) as TopicSnapshot[]);
      let latestByTopic: Record<string, TopicSnapshot> = {};
      if (latestRes.ok) {
        latestByTopic = pickBestSnapshots((await latestRes.json()) as TopicSnapshot[]);
      }
      const merged = mergeTopicSnapshots(historical[canonical], latestByTopic[canonical]);
      window.topicSnapshots![canonical] = merged;
      if (merged && window.dashboardData) {
        window.dashboardData[canonical] = merged;
      }
      return merged;
    } catch (e) {
      console.warn("loadTopicSnapshot failed", canonical, e);
      window.topicSnapshots![canonical] = null;
      return null;
    }
  })();
  return window.__topicSnapshotPromises[promiseKey]!;
}

/** Empty-run Pass 2 rows (zero posts) must not mask real Pass 1 content. */
export function isEmptyCuratedInsight(row: CuratedTopicInsights | null | undefined): boolean {
  if (!row) return true;
  const text = [row.hero_headline, row.hero_summary, row.evolution_note]
    .filter(Boolean)
    .join(" ");
  if (!text.trim()) return true;
  return /zero posts|data collapse|data void|data shortfall|no fresh signals|collapse to zero|drops to zero|yield no insights|insufficient signals|no usable recent signals/i.test(
    text,
  );
}

export function isEmptyCuratedQa(row: CuratedQaPair): boolean {
  const text = [row.card_title, row.card_summary].filter(Boolean).join(" ");
  return (
    !text.trim() ||
    /limited or unclear data|insufficient clear signals|insufficient signals|public discussion exists but is fragmented/i.test(
      text,
    )
  );
}

export async function loadCuratedTopicInsights(
  topic: string,
  comparisonWindow: string = "wow",
  force = false,
): Promise<CuratedTopicInsights | null> {
  if (typeof globalThis.window === "undefined" || !topic) return null;
  const canonical = normalizeTopicKey(topic) ?? topic;
  const w = globalThis.window;
  const cacheKey = `${canonical}::${comparisonWindow}`;
  w.curatedInsights ??= {};
  w.__curatedInsightsPromises ??= {};
  if (force) {
    delete w.curatedInsights[cacheKey];
    delete w.__curatedInsightsPromises[cacheKey];
  } else if (w.curatedInsights[cacheKey] !== undefined) {
    return w.curatedInsights[cacheKey];
  }
  if (!w.__curatedInsightsPromises[cacheKey]) {
    w.__curatedInsightsPromises[cacheKey] = (async () => {
      try {
        const names = legacyTopicNames(canonical);
        const inList = postgrestInList(names);
        const res = await supabaseFetch(
          `latest_curated_topic_insights?topic=in.(${inList})&comparison_window=eq.${encodeURIComponent(comparisonWindow)}&select=*&order=generated_at.desc&limit=1`,
        );
        if (!res.ok) {
          // View may not exist until migration is applied
          if (res.status === 404 || res.status === 400) return null;
          throw new Error("HTTP " + res.status);
        }
        const rows = (await res.json()) as CuratedTopicInsights[];
        const row = rows?.[0] ?? null;
        // Drop empty-run curation so topic pages fall back to Pass 1.
        const usable = row && !isEmptyCuratedInsight(row) ? row : null;
        w.curatedInsights![cacheKey] = usable;
        return usable;
      } catch (e) {
        console.warn("curated_topic_insights fetch failed (table may not exist yet)", e);
        w.curatedInsights![cacheKey] = null;
        return null;
      }
    })();
  }
  return w.__curatedInsightsPromises[cacheKey];
}

export async function loadCuratedQaPairs(topic: string, force = false): Promise<CuratedQaPair[]> {
  if (typeof window === "undefined" || !topic) return [];
  const canonical = normalizeTopicKey(topic) ?? topic;
  window.curatedQaPairs ??= {};
  window.__curatedQaPromises ??= {};
  if (force) {
    delete window.curatedQaPairs[canonical];
    delete window.__curatedQaPromises[canonical];
  } else if (window.curatedQaPairs[canonical]) {
    return window.curatedQaPairs[canonical]!;
  }
  if (!window.__curatedQaPromises[canonical]) {
    window.__curatedQaPromises[canonical] = (async () => {
      try {
        const names = legacyTopicNames(canonical);
        const inList = postgrestInList(names);
        const res = await supabaseFetch(
          `latest_curated_qa_pairs?topic=in.(${inList})&select=*&order=rank.asc&limit=50`,
        );
        if (!res.ok) {
          if (res.status === 404 || res.status === 400) return [];
          throw new Error("HTTP " + res.status);
        }
        const rows = (await res.json()) as CuratedQaPair[];
        const sorted = [...(rows ?? [])]
          .filter((r) => !isEmptyCuratedQa(r))
          .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
        window.curatedQaPairs![canonical] = sorted;
        return sorted;
      } catch (e) {
        console.warn("curated_qa_pairs fetch failed (table may not exist yet)", e);
        window.curatedQaPairs![canonical] = [];
        return [];
      }
    })();
  }
  return window.__curatedQaPromises[canonical];
}

export async function loadCuratedHighlights(limit = 6): Promise<CuratedTopicInsights[]> {
  if (typeof window === "undefined") return [];
  try {
    const res = await supabaseFetch(
      `latest_curated_topic_insights?comparison_window=eq.wow&select=*&order=generated_at.desc&limit=${limit * 3}`,
    );
    if (!res.ok) return [];
    const rows = (await res.json()) as CuratedTopicInsights[];
    const seen = new Set<string>();
    const out: CuratedTopicInsights[] = [];
    for (const row of rows ?? []) {
      if (!row.topic || seen.has(row.topic)) continue;
      if (isEmptyCuratedInsight(row)) continue;
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

/** Week-over-week sentiment direction for topic cards (up / down / flat). */
export type WowTrend = {
  /** Current − prior overall sentiment (pts). Null when only a label is known. */
  delta: number | null;
  direction: "up" | "down" | "flat";
};

function overallSentimentScore(row: TopicSnapshot | TopicHistoryPoint): number | null {
  const os = row.overall_sentiment;
  if (typeof os === "object" && os && typeof (os as { score?: number }).score === "number") {
    return Number((os as { score: number }).score);
  }
  return null;
}

function directionFromDelta(delta: number, epsilon = 0.5): WowTrend["direction"] {
  if (delta > epsilon) return "up";
  if (delta < -epsilon) return "down";
  return "flat";
}

function directionFromTrendLabel(label?: string | null): WowTrend["direction"] | null {
  if (!label) return null;
  if (/increas|improv|up|ris|gain/i.test(label)) return "up";
  if (/decreas|declin|down|fall|wors/i.test(label)) return "down";
  if (/stable|flat|steady|unchang/i.test(label)) return "flat";
  return null;
}

/**
 * Load WoW sentiment trends for all live topics.
 * Prefer Pass 2 curated `sentiment_delta` (wow window); fall back to comparing
 * the two most recent substantive Pass 1 snapshots per topic.
 */
export async function loadWowSentimentTrends(
  force = false,
): Promise<Record<string, WowTrend>> {
  if (typeof window === "undefined") return {};
  const w = window as Window & {
    wowSentimentTrends?: Record<string, WowTrend>;
    __wowSentimentTrendsPromise?: Promise<Record<string, WowTrend>>;
  };
  if (force) {
    w.wowSentimentTrends = undefined;
    w.__wowSentimentTrendsPromise = undefined;
  } else if (w.wowSentimentTrends) {
    return w.wowSentimentTrends;
  }
  if (!force && w.__wowSentimentTrendsPromise) return w.__wowSentimentTrendsPromise;

  w.__wowSentimentTrendsPromise = (async () => {
    const out: Record<string, WowTrend> = {};
    try {
      // 1) Curated WoW deltas (skip empty-run curation that invents +12 from 0 posts)
      const curatedRes = await supabaseFetch(
        "latest_curated_topic_insights?comparison_window=eq.wow&select=topic,sentiment_delta,hero_headline,hero_summary,evolution_note&order=generated_at.desc&limit=80",
      );
      if (curatedRes.ok) {
        const rows = (await curatedRes.json()) as CuratedTopicInsights[];
        for (const row of rows ?? []) {
          const key = normalizeTopicKey(row.topic);
          if (!key || out[key]) continue;
          if (isEmptyCuratedInsight(row)) continue;
          if (typeof row.sentiment_delta !== "number" || Number.isNaN(row.sentiment_delta)) continue;
          out[key] = {
            delta: Math.round(row.sentiment_delta * 10) / 10,
            direction: directionFromDelta(row.sentiment_delta),
          };
        }
      }

      // 2) Fill gaps from Pass 1 history (two newest substantive snapshots)
      const histRes = await supabaseFetch(
        "topic_snapshots?select=topic,last_updated,overall_sentiment,sample_size,fetched_post_count&order=last_updated.desc&limit=500",
      );
      if (histRes.ok) {
        const histRows = (await histRes.json()) as TopicSnapshot[];
        const byTopic: Record<string, TopicSnapshot[]> = {};
        for (const row of histRows ?? []) {
          const key = normalizeTopicKey(row.topic);
          if (!key) continue;
          if (snapshotQuality(row) < 0) continue;
          (byTopic[key] ??= []).push(row);
        }
        for (const [key, group] of Object.entries(byTopic)) {
          if (out[key]) continue;
          const sorted = [...group].sort(compareSnapshotsForLive);
          const current = sorted[0];
          const prior = sorted[1];
          if (!current || !prior) {
            const label =
              typeof current?.overall_sentiment === "object"
                ? current.overall_sentiment?.trend
                : undefined;
            const dir = directionFromTrendLabel(label);
            if (dir) out[key] = { delta: null, direction: dir };
            continue;
          }
          const curScore = overallSentimentScore(current);
          const priorScore = overallSentimentScore(prior);
          if (curScore == null || priorScore == null) continue;
          const delta = curScore - priorScore;
          out[key] = {
            delta: Math.round(delta * 10) / 10,
            direction: directionFromDelta(delta),
          };
        }
      }
    } catch (e) {
      console.warn("loadWowSentimentTrends failed", e);
    }
    w.wowSentimentTrends = out;
    return out;
  })();

  return w.__wowSentimentTrendsPromise;
}

export function legacyTopicNames(canonical: string): string[] {
  const names = new Set<string>([canonical]);
  for (const [alias, target] of Object.entries(TOPIC_ALIASES)) {
    if (target === canonical) {
      const titleCase = alias.replace(/\b\w/g, (c) => c.toUpperCase());
      names.add(titleCase);
      names.add(alias);
    }
  }
  if (canonical === "fifa-world-cup-2026") names.add("FIFA World Cup 2026");
  if (canonical === "US AI Economy Boom & American Technological Renaissance") {
    names.add("US AI Economy Boom & American Technologies");
  }
  return [...names];
}

export async function loadTopicHistory(
  topic: string,
  limit = 6,
  force = false,
): Promise<TopicHistoryPoint[]> {
  if (typeof window === "undefined" || !topic) return [];
  const canonical = normalizeTopicKey(topic) ?? topic;
  window.topicHistory ??= {};
  window.__topicHistoryPromises ??= {};
  if (force) {
    delete window.topicHistory[canonical];
    delete window.__topicHistoryPromises[canonical];
  } else if (window.topicHistory[canonical]) {
    return window.topicHistory[canonical]!;
  }
  if (!window.__topicHistoryPromises[canonical]) {
    window.__topicHistoryPromises[canonical] = (async () => {
      try {
        const names = legacyTopicNames(canonical);
        const inList = postgrestInList(names);
        const res = await supabaseFetch(
          `topic_snapshots?topic=in.(${inList})&select=month,last_updated,overall_sentiment,divergence_score,segmented_sentiment,sample_size,fetched_post_count&order=last_updated.desc&limit=${Math.max(limit * 3, 18)}`,
        );
        if (!res.ok) throw new Error("HTTP " + res.status);
        const rows = ((await res.json()) as TopicHistoryPoint[]).filter(
          (r) => snapshotQuality(r as TopicSnapshot) >= 0,
        );
        const deduped: TopicHistoryPoint[] = [];
        const seen = new Set<string>();
        for (const row of rows) {
          const key = row.last_updated ?? row.month ?? "";
          if (seen.has(key)) continue;
          seen.add(key);
          deduped.push(row);
          if (deduped.length >= limit) break;
        }
        window.topicHistory![canonical] = deduped;
        return deduped;
      } catch (e) {
        console.warn("topic_snapshots history fetch failed", e);
        window.topicHistory![canonical] = [];
        return [];
      }
    })();
  }
  return window.__topicHistoryPromises[canonical];
}

export async function loadCitizenSignals(force = false): Promise<CitizenSignal[] | null> {
  if (typeof window === "undefined") return null;
  if (force) {
    window.citizenSignals = undefined;
    window.__citizenSignalsPromise = undefined;
  }
  if (window.citizenSignals) return window.citizenSignals;
  if (window.__citizenSignalsPromise) return window.__citizenSignalsPromise;

  window.__citizenSignalsPromise = (async () => {
    try {
      const res = await supabaseFetch(
        "citizen_signals?select=id,topic,signal_type,sentiment_score,sentiment_label,trend,headline,summary,excerpt,source,sample_size,last_updated,created_at&order=last_updated.desc&limit=400",
      );
      if (!res.ok) throw new Error("HTTP " + res.status);
      const rows = (await res.json()) as CitizenSignal[];
      const filtered = rows.filter((r) => normalizeTopicKey(r?.topic) != null);
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
