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
// Live product surfaces further filter via isLiveOutputTopic (topic-catalog).
// Maritime AI Greece and FIFA remain matchable for history/archive only — not live UI.
export const CANONICAL_TOPICS = [
  "Arab-Israeli Normalization / Abraham Accords",
  "Iranian Voices vs Regime",
  "Greece Economic Recovery: Resilience, Security & Digital Transformation",
  "Eastern Mediterranean Alliance (Israel-Greece-Cyprus)",
  "Trump Administration Actions & US Politics",
  "Crypto Regulation & Financial Markets Volatility",
  "Migration, Green Policies & Internal EU Divisions",
  "Government Performance, Corruption & Scandals",
  "Crime, Safety & Lawlessness",
  "Political Polarization & Populism Rise",
  "Global AI Race",
  "Cuba Sanctions & the Domino Effect",
  "US-Iran Confrontation: Sanctions, Networks & Regime Pressure",
  "Public Voices on Elon Musk: Trust, Media Frames & Power",
  "US AI Economy Boom & American Technological Renaissance",
  "Save Europe Act: Citizens, Media & EU Bureaucracy",
  "Commercial Space Race: SpaceX, Rivals & Public Trust",
  "AI Productivity & GDP Growth: Investment Boom vs Lived Gains, Energy Constraints & Narrative Gaps",
  "India's Economic Growth Narrative: Headline GDP, Employment Quality, AI/IT Disruption & Citizen vs Official Frames",
  "Cyprus, Palestine & Selective Outrage: Attention Asymmetries in European Public Discourse",
  // History / archive keys (not live output — kept for normalize/legacy only)
  "Maritime AI Industry & Greece's Global Role",
  "fifa-world-cup-2026",
] as const;

const CANONICAL_TOPIC_SET = new Set<string>(CANONICAL_TOPICS);

/** Backend topic strings excluded from all live product surfaces (history may remain in DB). */
export const LIVE_OUTPUT_EXCLUSIONS = new Set<string>([
  "Maritime AI Industry & Greece's Global Role",
  "fifa-world-cup-2026",
  "FIFA World Cup 2026",
  // 2026-08-29 — political overlap archived for live mix (G7 hide, not delete)
  "Cuba Sanctions & the Domino Effect",
  "Eastern Mediterranean Alliance (Israel-Greece-Cyprus)",
  "US-Iran Confrontation: Sanctions, Networks & Regime Pressure",
  "Cyprus, Palestine & Selective Outrage: Attention Asymmetries in European Public Discourse",
]);

/**
 * True when a topic may appear in dashboard KPIs, signals, narratives, insights.
 * Archived / cold / retired topics return false (data kept append-only in Supabase).
 * GOLDEN G7: archived topics never feed live sample totals or citizen signal rows.
 */
export function isLiveOutputTopic(raw: string | null | undefined): boolean {
  if (!raw?.trim()) return false;
  const trimmed = raw.trim();
  // Hard archive patterns (slug, title, messy overview JSON variants)
  if (/\bfifa\b/i.test(trimmed)) return false;
  if (/world\s*cup\s*2026/i.test(trimmed)) return false;
  if (/maritime\s*ai/i.test(trimmed)) return false;
  if (/cuba\s+sanctions/i.test(trimmed)) return false;
  if (/eastern\s+mediterranean\s+alliance/i.test(trimmed)) return false;
  if (/us[-–—\s]*iran\s+confrontation/i.test(trimmed)) return false;
  if (/cyprus.+palestine|selective\s+outrage/i.test(trimmed)) return false;
  if (LIVE_OUTPUT_EXCLUSIONS.has(trimmed)) return false;

  const key = normalizeTopicKey(trimmed) ?? trimmed;
  if (LIVE_OUTPUT_EXCLUSIONS.has(key)) return false;
  if (key === "fifa-world-cup-2026") return false;
  if (/\bfifa\b/i.test(key) || /maritime\s*ai/i.test(key)) return false;

  // Live product set only (CANONICAL minus exclusions)
  if (!CANONICAL_TOPIC_SET.has(key) && !CANONICAL_TOPIC_SET.has(trimmed)) {
    if (!normalizeTopicKey(trimmed)) return false;
  }
  const resolved = normalizeTopicKey(trimmed);
  if (!resolved) return false;
  if (LIVE_OUTPUT_EXCLUSIONS.has(resolved)) return false;
  if (resolved === "fifa-world-cup-2026") return false;
  if (/\bfifa\b/i.test(resolved) || /maritime\s*ai/i.test(resolved)) return false;
  return true;
}

/**
 * Pick the freshest overview for the UI.
 * - Prefer latest row for signals / heatmap / timestamps.
 * - If latest lacks grok_ai_summary, graft summary from a recent row (append-only).
 * - Lifetime posts KPI = peak across recent rows so summary fallback never
 *   oscillates the face value (was 2455 ↔ 11587 when older rows were chosen whole).
 */
export function pickLiveDashboardOverview(
  rows: DashboardOverview[] | null | undefined,
): DashboardOverview | null {
  if (!rows?.length) return null;
  const latest = rows[0]!;

  let peakPosts = 0;
  for (const r of rows) {
    const n =
      (typeof r.kpis?.total_posts_analyzed === "number"
        ? r.kpis.total_posts_analyzed
        : undefined) ??
      (typeof r.total_posts_analyzed === "number" ? r.total_posts_analyzed : 0);
    if (typeof n === "number" && n > peakPosts) peakPosts = n;
  }

  const summaryDonor =
    latest.grok_ai_summary?.trim()
      ? latest
      : rows.find((r) => !!r.grok_ai_summary?.trim()) ?? latest;

  // Always base on latest so we do not re-surface stale KPI windows
  const merged: DashboardOverview = {
    ...latest,
    grok_ai_summary: latest.grok_ai_summary?.trim()
      ? latest.grok_ai_summary
      : summaryDonor.grok_ai_summary,
    kpis: { ...(latest.kpis ?? {}) },
  };

  const current =
    typeof merged.kpis?.total_posts_analyzed === "number"
      ? merged.kpis.total_posts_analyzed
      : typeof merged.total_posts_analyzed === "number"
        ? merged.total_posts_analyzed
        : 0;

  if (peakPosts > 0 && peakPosts > (current || 0)) {
    merged.kpis = {
      ...merged.kpis,
      total_posts_analyzed: peakPosts,
    };
  }

  return merged;
}

/** Legacy / truncated DB topic strings → canonical TOPIC_CONFIG keys (keep in sync with backend). */
export const TOPIC_ALIASES: Record<string, string> = {
  "fifa world cup 2026": "fifa-world-cup-2026",
  "fifa world cup 2026 & global fan reactions": "fifa-world-cup-2026",
  "us ai economy boom & american technologies": "US AI Economy Boom & American Technological Renaissance",
  "ai productivity gdp growth":
    "AI Productivity & GDP Growth: Investment Boom vs Lived Gains, Energy Constraints & Narrative Gaps",
  "ai productivity & gdp growth":
    "AI Productivity & GDP Growth: Investment Boom vs Lived Gains, Energy Constraints & Narrative Gaps",
  "ai productivity":
    "AI Productivity & GDP Growth: Investment Boom vs Lived Gains, Energy Constraints & Narrative Gaps",
  "india economic growth narrative":
    "India's Economic Growth Narrative: Headline GDP, Employment Quality, AI/IT Disruption & Citizen vs Official Frames",
  "india economic growth":
    "India's Economic Growth Narrative: Headline GDP, Employment Quality, AI/IT Disruption & Citizen vs Official Frames",
  "india gdp growth":
    "India's Economic Growth Narrative: Headline GDP, Employment Quality, AI/IT Disruption & Citizen vs Official Frames",
  "cyprus vs palestine":
    "Cyprus, Palestine & Selective Outrage: Attention Asymmetries in European Public Discourse",
  "cyprus palestine":
    "Cyprus, Palestine & Selective Outrage: Attention Asymmetries in European Public Discourse",
  "cyprus-palestine-attention-asymmetry":
    "Cyprus, Palestine & Selective Outrage: Attention Asymmetries in European Public Discourse",
  "selective solidarity cyprus":
    "Cyprus, Palestine & Selective Outrage: Attention Asymmetries in European Public Discourse",
  "selective outrage cyprus":
    "Cyprus, Palestine & Selective Outrage: Attention Asymmetries in European Public Discourse",
  "cyprus attention asymmetry":
    "Cyprus, Palestine & Selective Outrage: Attention Asymmetries in European Public Discourse",
  "cyprus palestine selective outrage":
    "Cyprus, Palestine & Selective Outrage: Attention Asymmetries in European Public Discourse",
  "cyprus, palestine & selective outrage: attention asymmetries in european public discourse":
    "Cyprus, Palestine & Selective Outrage: Attention Asymmetries in European Public Discourse",
  "cyprus vs palestine: the attention asymmetry in european (and greek) public discourse":
    "Cyprus, Palestine & Selective Outrage: Attention Asymmetries in European Public Discourse",
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
  "save europe act": "Save Europe Act: Citizens, Media & EU Bureaucracy",
  "save-europe-act": "Save Europe Act: Citizens, Media & EU Bureaucracy",
  "save europe": "Save Europe Act: Citizens, Media & EU Bureaucracy",
  "save europe act: citizens, media & eu bureaucracy":
    "Save Europe Act: Citizens, Media & EU Bureaucracy",
  "commercial space race": "Commercial Space Race: SpaceX, Rivals & Public Trust",
  "commercial-space-race": "Commercial Space Race: SpaceX, Rivals & Public Trust",
  "space race": "Commercial Space Race: SpaceX, Rivals & Public Trust",
  "spacex rivals": "Commercial Space Race: SpaceX, Rivals & Public Trust",
  "commercial space race: spacex, rivals & public trust":
    "Commercial Space Race: SpaceX, Rivals & Public Trust",
  "greece economic recovery":
    "Greece Economic Recovery: Resilience, Security & Digital Transformation",
  "greece-economic-recovery":
    "Greece Economic Recovery: Resilience, Security & Digital Transformation",
  "greece recovery":
    "Greece Economic Recovery: Resilience, Security & Digital Transformation",
  "greece economic recovery: resilience, security & digital transformation":
    "Greece Economic Recovery: Resilience, Security & Digital Transformation",
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
// to topic_snapshots. Surfaced only as "Coming soon" cards when not live.
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

/** One identified friction between citizen X discourse and official/media framing. */
export type NarrativeGapPoint = {
  claim_citizen?: string;
  claim_official_media?: string;
  why_it_matters?: string;
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
        /** Citizen claim for dual-panel UI. */
        citizen_frame?: string;
        /** Official + mainstream/local media claim for dual-panel UI. */
        official_media_frame?: string;
        /** One-line clash headline. */
        gap_headline?: string;
        /** Why this divergence_score was assigned. */
        score_rationale?: string;
        /** Concrete paired gaps (citizen claim vs official/media claim). */
        gap_points?: NarrativeGapPoint[];
      }
    | number
    | null;
};

function firstSentence(text: string, max = 160): string {
  const t = text.trim();
  if (!t) return "";
  const m = t.match(/^(.+?[.!?])(?:\s|$)/);
  const s = (m?.[1] ?? t).trim();
  return s.length <= max ? s : s.slice(0, max - 1).trimEnd() + "…";
}

function normalizeProse(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Soft word-boundary truncate — keeps multi-sentence claims intact for Read more. */
function softTruncate(text: string, max: number): string {
  const t = text.trim();
  if (!t || t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const sp = cut.lastIndexOf(" ");
  return (sp > max * 0.55 ? cut.slice(0, sp) : cut).trimEnd() + "…";
}

/** Strip meta wrappers so the claim reads as the narrative itself (full text kept). */
export function cleanFrameText(text: string, max = 320): string {
  let t = text.trim();
  if (!t) return "";
  t = t
    .replace(
      /^(?:x\s+posts?\s+show(?:s|ed)?|posts?\s+show(?:s|ed)?|citizens?\s+(?:on\s+x\s+)?(?:say|show|emphasize|argue|claim)|public\s+(?:discourse|voices?)\s+(?:show|emphasize)|the\s+data\s+shows?)\s+/i,
      "",
    )
    .replace(
      /^(?:official\s+(?:and\/or\s+)?(?:media\s+)?(?:narratives?|accounts?|messaging)?\s*(?:typically\s+)?(?:frame|emphasize|stress|claim|portray)?\s*:?\s*)/i,
      "",
    )
    .replace(/^(?:official\/media|mainstream media)\s*:?\s*/i, "")
    .trim();
  if (t && /^[a-z]/.test(t)) t = t.charAt(0).toUpperCase() + t.slice(1);
  // Preserve multi-sentence frames — do not collapse to first sentence only
  return softTruncate(t, max);
}

function normalizeGapPoints(raw: unknown): NarrativeGapPoint[] {
  if (!Array.isArray(raw)) return [];
  const out: NarrativeGapPoint[] = [];
  for (const item of raw.slice(0, 4)) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    const claim_citizen = String(r.claim_citizen ?? r.citizen ?? "").trim();
    const claim_official_media = String(
      r.claim_official_media ?? r.official ?? r.media ?? "",
    ).trim();
    const why_it_matters = String(r.why_it_matters ?? r.why ?? "").trim();
    if (claim_citizen || claim_official_media) {
      out.push({ claim_citizen, claim_official_media, why_it_matters });
    }
  }
  return out;
}

/**
 * Split a legacy long divergence_gap into citizen vs official/media sides
 * when structured frames were not stored yet.
 * Never invent a synthetic "A vs B" headline — that just dumps truncated box text under the score.
 */
export function splitGapOverviewIntoFrames(overview: string): {
  citizenFrame: string;
  officialMediaFrame: string;
  gapHeadline: string;
} {
  const t = overview.trim();
  if (!t) return { citizenFrame: "", officialMediaFrame: "", gapHeadline: "" };

  // Contrast patterns common in Grok gap prose
  const contrast =
    t.match(
      /^(.+?)\s*(?:,?\s*(?:while|whereas|however|but|yet)\s+|,\s*directly contradicting\s+|,\s*clashing with\s+|,\s*in contrast to\s+|versus\s+|vs\.?\s+)(.+)$/is,
    ) ||
    t.match(/^(.+?[.!?])\s+(.+)$/s);

  if (contrast) {
    let a = contrast[1].trim().replace(/^[.,\s]+|[.,\s]+$/g, "");
    let b = contrast[2].trim().replace(/^[.,\s]+|[.,\s]+$/g, "");
    // Orient by keywords: which side is official/media?
    const officialish =
      /official|government|regime|fifa|media|sponsor|authority|state|administration|marketing|messaging|claims?\b/i;
    let citizenFrame = a;
    let officialMediaFrame = b;
    if (officialish.test(a) && !officialish.test(b)) {
      citizenFrame = b;
      officialMediaFrame = a;
    } else if (!officialish.test(b) && /citizen|fan|public|ordinary|street|people/i.test(b)) {
      citizenFrame = b;
      officialMediaFrame = a;
    }
    return {
      citizenFrame: cleanFrameText(citizenFrame, 320),
      officialMediaFrame: cleanFrameText(officialMediaFrame, 320),
      gapHeadline: "",
    };
  }

  // Single blob: use as citizen emphasis only (do not invent official frame)
  return {
    citizenFrame: cleanFrameText(t, 320),
    officialMediaFrame: "",
    gapHeadline: "",
  };
}

/** True if a is essentially the same prose as b (avoid duplicate UI). */
function isSameProse(a: string, b: string): boolean {
  const na = normalizeProse(a);
  const nb = normalizeProse(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  const ta = new Set(na.split(" ").filter((w) => w.length > 3));
  const tb = new Set(nb.split(" ").filter((w) => w.length > 3));
  if (ta.size === 0 || tb.size === 0) return false;
  let hit = 0;
  for (const w of ta) if (tb.has(w)) hit++;
  return hit / Math.min(ta.size, tb.size) > 0.65;
}

/** Headline is just a mash-up of the two frame bodies (e.g. "citizens… vs official…"). */
function isSyntheticVsHeadline(headline: string, citizen: string, official: string): boolean {
  const h = headline.trim();
  if (!h) return false;
  if (!/\bvs\.?\b|versus|against\b/i.test(h)) {
    // Still synthetic if it mostly copies one/both frames
    return isSameProse(h, citizen) || isSameProse(h, official) || isSameProse(h, `${citizen} ${official}`);
  }
  const parts = h.split(/\s+(?:vs\.?|versus|against)\s+/i);
  if (parts.length >= 2) {
    const left = parts[0] ?? "";
    const right = parts.slice(1).join(" ");
    // Truncated frame dumps always share a long prefix with the boxes
    if (citizen && left.length >= 12 && normalizeProse(citizen).includes(normalizeProse(left).slice(0, 24)))
      return true;
    if (official && right.length >= 12 && normalizeProse(official).includes(normalizeProse(right).slice(0, 24)))
      return true;
    if (isSameProse(left, citizen) || isSameProse(right, official)) return true;
  }
  // Overlap with either frame body
  if (isSameProse(h, citizen) || isSameProse(h, official)) return true;
  return false;
}

/**
 * Overview only keeps value if it adds a distinct synthesis beyond the two frames.
 * Most Pass-1 overviews simply restate both boxes — drop those.
 */
function overviewAddsNewContent(overview: string, citizen: string, official: string): boolean {
  const o = overview.trim();
  if (!o) return false;
  if (!citizen && !official) return true;
  if (isSameProse(o, `${citizen} ${official}`) || isSameProse(o, citizen) || isSameProse(o, official))
    return false;

  // Strip sentences that clearly restate a frame; keep leftovers
  const sentences = o.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  const novel = sentences.filter(
    (s) =>
      !isSameProse(s, citizen) &&
      !isSameProse(s, official) &&
      !(citizen && normalizeProse(s).includes(normalizeProse(citizen).slice(0, 36))) &&
      !(official && normalizeProse(s).includes(normalizeProse(official).slice(0, 36))),
  );
  if (novel.length === 0) return false;
  // Require a real extra claim (≥ 40 chars of novel prose)
  return novel.join(" ").length >= 40;
}

/** Parse structured narrative-gap frames from a snapshot (legacy-safe). */
export function getNarrativeGapFrames(snapshot?: TopicSnapshot | null): {
  score: number | null;
  citizenFrame: string;
  officialMediaFrame: string;
  gapHeadline: string;
  fullOverview: string;
  scoreRationale: string;
  gapPoints: NarrativeGapPoint[];
} {
  if (!snapshot) {
    return {
      score: null,
      citizenFrame: "",
      officialMediaFrame: "",
      gapHeadline: "",
      fullOverview: "",
      scoreRationale: "",
      gapPoints: [],
    };
  }
  let score: number | null =
    typeof snapshot.divergence_score === "number" ? Math.round(snapshot.divergence_score) : null;
  let citizenFrame = "";
  let officialMediaFrame = "";
  let gapHeadline = "";
  let fullOverview = (snapshot.divergence_gap ?? "").trim();
  let scoreRationale = "";
  let gapPoints: NarrativeGapPoint[] = [];

  const applyFrameObj = (raw: {
    score?: number;
    label?: string;
    summary?: string;
    citizen_frame?: string;
    official_media_frame?: string;
    gap_headline?: string;
    score_rationale?: string;
    gap_points?: unknown;
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
    if (!scoreRationale && typeof raw.score_rationale === "string" && raw.score_rationale.trim())
      scoreRationale = raw.score_rationale.trim();
    if (!gapPoints.length && raw.gap_points) gapPoints = normalizeGapPoints(raw.gap_points);
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
        score_rationale?: string;
        gap_points?: unknown;
      });
    }
  }

  // Legacy rows: only long divergence_gap — split into target boxes
  if ((!citizenFrame || !officialMediaFrame) && fullOverview) {
    const split = splitGapOverviewIntoFrames(fullOverview);
    if (!citizenFrame && split.citizenFrame) citizenFrame = split.citizenFrame;
    if (!officialMediaFrame && split.officialMediaFrame) officialMediaFrame = split.officialMediaFrame;
  }

  // Citizen narrative fallback: first sentence of Pass 1 narrative_summary
  if (!citizenFrame && typeof snapshot.narrative_summary === "string") {
    const ns = snapshot.narrative_summary.trim();
    if (ns) citizenFrame = firstSentence(ns, 220);
  }

  // Display polish: strip meta wrappers; keep multi-sentence claims for Read more
  if (citizenFrame) citizenFrame = cleanFrameText(citizenFrame, 320);
  if (officialMediaFrame) officialMediaFrame = cleanFrameText(officialMediaFrame, 320);

  // Legacy: if no structured gap_points, build one comparison row from the two frames
  if (!gapPoints.length && citizenFrame && officialMediaFrame) {
    gapPoints = [
      {
        claim_citizen: citizenFrame,
        claim_official_media: officialMediaFrame,
        why_it_matters:
          scoreRationale ||
          gapHeadline ||
          "Primary friction between citizen X discourse and official/media framing on this topic.",
      },
    ];
  }

  // Prefer gap_points synthesis over a vague overview restatement
  if (fullOverview && citizenFrame && officialMediaFrame) {
    if (!overviewAddsNewContent(fullOverview, citizenFrame, officialMediaFrame)) {
      fullOverview = "";
    }
  } else if (fullOverview && citizenFrame && isSameProse(fullOverview, citizenFrame)) {
    fullOverview = "";
  }

  // Kill dump-style headlines under the score ("citizens… vs official…")
  if (
    gapHeadline &&
    (isSyntheticVsHeadline(gapHeadline, citizenFrame, officialMediaFrame) ||
      isSameProse(gapHeadline, citizenFrame) ||
      isSameProse(gapHeadline, officialMediaFrame) ||
      gapHeadline.length > 90)
  ) {
    gapHeadline = "";
  }

  // Fallback score explanation so the number is never silent
  if (!scoreRationale && score !== null) {
    if (score >= 70)
      scoreRationale = "Wide clash: citizen claims and official/media framing strongly contradict.";
    else if (score >= 45)
      scoreRationale = "Moderate clash: partial overlap but clear disagreements on causes or blame.";
    else scoreRationale = "Narrower gap: citizen and official/media frames partially align.";
  }

  return {
    score,
    citizenFrame,
    officialMediaFrame,
    gapHeadline,
    fullOverview,
    scoreRationale,
    gapPoints,
  };
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
  /** Lifetime cumulative posts across all historical live snapshots (never decreases). */
  total_posts_analyzed?: number;
  /** Latest-per-topic window only (may move up/down). */
  window_posts_analyzed?: number;
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

/** List/card payload — excludes raw_analysis + question_analysis (≈70% of row weight). */
const SNAPSHOT_LIST_COLUMNS =
  "topic,last_updated,sample_size,fetched_post_count,overall_sentiment,divergence_score,narrative_summary,key_insights,top_3_key_stories,signals,segmented_sentiment,divergence_gap";
/** History table includes month; latest_topic_snapshots view does not. */
const SNAPSHOT_HIST_COLUMNS = `${SNAPSHOT_LIST_COLUMNS},month`;

const FETCH_TIMEOUT_MS = 22_000;

function supabaseFetch(pathAndQuery: string, init?: RequestInit): Promise<Response> {
  // Do NOT append arbitrary query params (e.g. _ts=...). PostgREST treats unknown
  // keys as column filters and returns 400, which blanked the entire dashboard.
  // Browser freshness comes from cache: "no-store" + Cache-Control headers only.
  const url = `${SUPABASE_URL}/rest/v1/${pathAndQuery}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  const parentSignal = init?.signal;
  if (parentSignal) {
    if (parentSignal.aborted) ctrl.abort();
    else parentSignal.addEventListener("abort", () => ctrl.abort(), { once: true });
  }
  return fetch(url, {
    ...init,
    signal: ctrl.signal,
    cache: "no-store",
    headers: { ...supabaseHeaders, ...(init?.headers as Record<string, string> | undefined) },
  }).finally(() => clearTimeout(timer));
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
      // Lean columns only — full select=* × 500 was ~1.2MB and stalled Topics cards.
      // Detail pages still load full rows via loadTopicSnapshot(select=*).
      const [latestRes, histRes] = await Promise.all([
        supabaseFetch(`latest_topic_snapshots?select=${SNAPSHOT_LIST_COLUMNS}`),
        supabaseFetch(
          `topic_snapshots?select=${SNAPSHOT_HIST_COLUMNS}&order=last_updated.desc&limit=120`,
        ),
      ]);

      let latestByTopic: Record<string, TopicSnapshot> = {};
      if (latestRes.ok) {
        latestByTopic = pickBestSnapshots((await latestRes.json()) as TopicSnapshot[]);
      } else {
        console.warn("latest_topic_snapshots fetch failed", latestRes.status);
      }

      let historical: Record<string, TopicSnapshot> = {};
      if (histRes.ok) {
        historical = pickBestSnapshots((await histRes.json()) as TopicSnapshot[]);
      } else if (!latestRes.ok) {
        throw new Error("HTTP hist " + histRes.status);
      }

      // Prefer latest view when present; fill gaps / merge quality from lean history.
      const keys = new Set([...Object.keys(historical), ...Object.keys(latestByTopic)]);
      const byTopic: Record<string, TopicSnapshot> = {};
      for (const key of keys) {
        if (!isLiveOutputTopic(key)) continue;
        const merged = mergeTopicSnapshots(historical[key], latestByTopic[key]);
        if (merged) byTopic[key] = merged;
      }

      // If latest-only succeeded but hist failed, still ship what we have.
      if (!Object.keys(byTopic).length && Object.keys(latestByTopic).length) {
        for (const [key, row] of Object.entries(latestByTopic)) {
          if (!isLiveOutputTopic(key)) continue;
          byTopic[key] = row;
        }
      }

      window.dashboardData = byTopic;
      window.dashboardMeta = {};
      console.log(
        "✅ Loaded live topic snapshots (lean list)",
        Object.keys(byTopic).length,
        "topics",
      );
      return byTopic;
    } catch (e) {
      console.error("Supabase topic snapshots fetch failed", e);
      // Drop stuck promise so a retry can recover after timeout/network blip.
      window.__dashboardDataPromise = undefined;
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
      // Fetch a short history so a blank zero-cost refresh can fall back to the
      // last overview that still has the AI cross-topic summary (append-only restore).
      const res = await supabaseFetch(
        "dashboard_overviews?select=*&order=generated_at.desc&limit=12",
      );
      if (!res.ok) throw new Error("HTTP " + res.status);
      const rows = (await res.json()) as DashboardOverview[];
      const row = pickLiveDashboardOverview(rows);
      window.dashboardOverview = row;
      console.log(
        "✅ Loaded dashboard_overviews",
        row?.id,
        row?.id !== rows?.[0]?.id ? `(fallback from ${rows?.[0]?.id})` : "",
      );
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
  // Record index is T (not T|undefined) under default TS — use `in` for inflight dedupe.
  if (!force && promiseKey in window.__topicSnapshotPromises) {
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
      if (!isLiveOutputTopic(row.topic)) continue;
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
 * Index a WoW trend under canonical + raw topic strings so card lookups by
 * LIVE_TOPIC_KEYS.rootKey always resolve.
 */
function indexWowTrend(
  out: Record<string, WowTrend>,
  topicRaw: string | null | undefined,
  trend: WowTrend,
  { overwrite = false }: { overwrite?: boolean } = {},
) {
  if (!topicRaw?.trim()) return;
  const raw = topicRaw.trim();
  const key = normalizeTopicKey(raw) ?? raw;
  const targets = new Set<string>([key, raw]);
  for (const t of targets) {
    if (!overwrite && out[t]) continue;
    out[t] = trend;
  }
}

/**
 * Load WoW sentiment trends for all live topics.
 * Prefer Pass 1 history (two newest substantive snapshots) for real deltas when
 * multi-run history exists; use Pass 2 curated sentiment_delta as fill; last
 * resort = Pass 1 overall_sentiment.trend label.
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
  } else if (w.wowSentimentTrends && Object.keys(w.wowSentimentTrends).length > 0) {
    return w.wowSentimentTrends;
  }
  if (!force && w.__wowSentimentTrendsPromise) return w.__wowSentimentTrendsPromise;

  w.__wowSentimentTrendsPromise = (async () => {
    const out: Record<string, WowTrend> = {};
    try {
      // 1) Pass 1 history first — real multi-run deltas when available
      const histRes = await supabaseFetch(
        "topic_snapshots?select=topic,last_updated,overall_sentiment,sample_size,fetched_post_count&order=last_updated.desc&limit=1000",
      );
      if (histRes.ok) {
        const histRows = (await histRes.json()) as TopicSnapshot[];
        const byTopic: Record<string, TopicSnapshot[]> = {};
        for (const row of histRows ?? []) {
          const key = normalizeTopicKey(row.topic) ?? row.topic?.trim();
          if (!key) continue;
          if (snapshotQuality(row) < 0) continue;
          (byTopic[key] ??= []).push(row);
        }
        for (const [key, group] of Object.entries(byTopic)) {
          // Dedupe near-identical timestamps by last_updated+score
          const sorted = [...group].sort(compareSnapshotsForLive);
          const unique: TopicSnapshot[] = [];
          for (const row of sorted) {
            const prev = unique[unique.length - 1];
            if (
              prev &&
              prev.last_updated === row.last_updated &&
              overallSentimentScore(prev) === overallSentimentScore(row)
            ) {
              continue;
            }
            unique.push(row);
          }
          const current = unique[0];
          // Prefer a prior with a different score, else next row
          let prior: TopicSnapshot | undefined;
          if (current) {
            const curScore = overallSentimentScore(current);
            prior = unique.find((r, i) => {
              if (i === 0) return false;
              const s = overallSentimentScore(r);
              return s != null && curScore != null && s !== curScore;
            });
            if (!prior && unique.length > 1) prior = unique[1];
          }
          if (current && prior) {
            const curScore = overallSentimentScore(current);
            const priorScore = overallSentimentScore(prior);
            if (curScore != null && priorScore != null) {
              const delta = curScore - priorScore;
              indexWowTrend(out, key, {
                delta: Math.round(delta * 10) / 10,
                direction: directionFromDelta(delta),
              });
              indexWowTrend(out, current.topic, {
                delta: Math.round(delta * 10) / 10,
                direction: directionFromDelta(delta),
              });
              continue;
            }
          }
          // Single-run fallback: model trend label on latest snapshot
          const label =
            typeof current?.overall_sentiment === "object"
              ? current.overall_sentiment?.trend
              : undefined;
          const dir = directionFromTrendLabel(label);
          if (dir) {
            indexWowTrend(out, key, { delta: null, direction: dir });
            if (current?.topic) indexWowTrend(out, current.topic, { delta: null, direction: dir });
          }
        }
      }

      // 2) Curated WoW deltas fill remaining gaps (skip empty-run noise)
      const curatedRes = await supabaseFetch(
        "latest_curated_topic_insights?comparison_window=eq.wow&select=topic,sentiment_delta,hero_headline,hero_summary,evolution_note&order=generated_at.desc&limit=120",
      );
      if (curatedRes.ok) {
        const rows = (await curatedRes.json()) as CuratedTopicInsights[];
        for (const row of rows ?? []) {
          const key = normalizeTopicKey(row.topic) ?? row.topic?.trim();
          if (!key || out[key]) continue;
          if (isEmptyCuratedInsight(row)) continue;
          if (typeof row.sentiment_delta !== "number" || Number.isNaN(row.sentiment_delta)) continue;
          const trend: WowTrend = {
            delta: Math.round(row.sentiment_delta * 10) / 10,
            direction: directionFromDelta(row.sentiment_delta),
          };
          indexWowTrend(out, key, trend);
          indexWowTrend(out, row.topic, trend);
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

/** Resolve a card trend by rootKey or any known alias of that topic. */
export function getWowTrendForTopic(topicKey: string | null | undefined): WowTrend | null {
  if (typeof window === "undefined" || !topicKey?.trim()) return null;
  const map = (window as Window & { wowSentimentTrends?: Record<string, WowTrend> })
    .wowSentimentTrends;
  if (!map) return null;
  const raw = topicKey.trim();
  if (map[raw]) return map[raw]!;
  const canonical = normalizeTopicKey(raw);
  if (canonical && map[canonical]) return map[canonical]!;
  return null;
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
      const filtered = rows.filter((r) => isLiveOutputTopic(r?.topic));
      window.citizenSignals = filtered;
      console.log("✅ Loaded citizen_signals (live only)", filtered.length);
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
