// Editorial metadata + live Supabase topic mapping (no simulated scores).
import { normalizeTopicKey, isLiveOutputTopic as isLiveOutputTopicFromData } from "@/lib/dashboard-data";

export type TopicCategory = "Political" | "Economic" | "Social";

export type LiveTopicConfig = {
  rootKey: string;
  headerLabel: string;
};

/** Canonical mapping: frontend topic id → Supabase topic_snapshots.topic */
export const LIVE_TOPIC_KEYS: Record<string, LiveTopicConfig> = {
  "arab-israeli-normalization": {
    rootKey: "Arab-Israeli Normalization / Abraham Accords",
    headerLabel: "Abraham Accords",
  },
  "iranian-voices-vs-regime": {
    rootKey: "Iranian Voices vs Regime",
    headerLabel: "Iranian Voices",
  },
  "greece-economic-recovery": {
    rootKey: "Greece Economic Recovery: Resilience, Security & Digital Transformation",
    headerLabel: "Greece Economic Recovery",
  },
  "levant-realignment": {
    rootKey: "Eastern Mediterranean Alliance (Israel-Greece-Cyprus)",
    headerLabel: "Eastern Mediterranean Alliance",
  },
  "new-us-foreign-policy": {
    rootKey: "Trump Administration Actions & US Politics",
    headerLabel: "Trump Administration Actions & US Politics",
  },
  "crypto-regulation-financial-markets": {
    rootKey: "Crypto Regulation & Financial Markets Volatility",
    headerLabel: "Crypto Regulation & Financial Markets",
  },
  "eu-migration-green-divisions": {
    rootKey: "Migration, Green Policies & Internal EU Divisions",
    headerLabel: "Migration, Green Policies & EU Divisions",
  },
  "government-performance-corruption": {
    rootKey: "Government Performance, Corruption & Scandals",
    headerLabel: "Government Performance & Corruption",
  },
  "crime-safety-lawlessness": {
    rootKey: "Crime, Safety & Lawlessness",
    headerLabel: "Crime, Safety & Lawlessness",
  },
  "political-polarization-populism": {
    rootKey: "Political Polarization & Populism Rise",
    headerLabel: "Political Polarization & Populism",
  },
  "global-ai-race": {
    rootKey: "Global AI Race",
    headerLabel: "The Global AI Race",
  },
  "cuba-sanctions-domino": {
    rootKey: "Cuba Sanctions & the Domino Effect",
    headerLabel: "Cuba Sanctions & the Domino Effect",
  },
  "fifa-world-cup-2026": {
    rootKey: "fifa-world-cup-2026",
    headerLabel: "FIFA World Cup 2026",
  },
  "us-iran-confrontation": {
    rootKey: "US-Iran Confrontation: Sanctions, Networks & Regime Pressure",
    headerLabel: "US–Iran Confrontation",
  },
  "elon-musk-public-voices": {
    rootKey: "Public Voices on Elon Musk: Trust, Media Frames & Power",
    headerLabel: "Elon Musk · Public Voices",
  },
  "us-ai-economy-boom": {
    rootKey: "US AI Economy Boom & American Technological Renaissance",
    headerLabel: "US AI Economy Boom",
  },
  "save-europe-act": {
    rootKey: "Save Europe Act: Citizens, Media & EU Bureaucracy",
    headerLabel: "Save Europe Act",
  },
  "commercial-space-race": {
    rootKey: "Commercial Space Race: SpaceX, Rivals & Public Trust",
    headerLabel: "Commercial Space Race",
  },
  "ai-productivity-gdp-growth": {
    rootKey:
      "AI Productivity & GDP Growth: Investment Boom vs Lived Gains, Energy Constraints & Narrative Gaps",
    headerLabel: "AI Productivity & GDP Growth",
  },
  "india-economic-growth-narrative": {
    rootKey:
      "India's Economic Growth Narrative: Headline GDP, Employment Quality, AI/IT Disruption & Citizen vs Official Frames",
    headerLabel: "India Economic Growth Narrative",
  },
  "cyprus-palestine-attention-asymmetry": {
    rootKey:
      "Cyprus vs Palestine: The Attention Asymmetry in European (and Greek) Public Discourse",
    headerLabel: "Cyprus vs Palestine · Attention",
  },
  /** Archived — history only; still mapped for Topics archive section + snapshot reads */
  "maritime-ai-greece": {
    rootKey: "Maritime AI Industry & Greece's Global Role",
    headerLabel: "Maritime AI · Greece",
  },
};

/** Topics kept for history / read-only archive (not primary live monitors). */
export const ARCHIVED_TOPIC_IDS = ["fifa-world-cup-2026", "maritime-ai-greece"] as const;

/** Active (non-archived) live monitors — product surface count. */
export function activeLiveTopicCount(): number {
  return Object.keys(LIVE_TOPIC_KEYS).filter((id) => !isArchivedTopicId(id)).length;
}

/** Archived catalog topics that still appear under Topics → Archived. */
export function archivedLiveTopicCount(): number {
  return Object.keys(LIVE_TOPIC_KEYS).filter((id) => isArchivedTopicId(id)).length;
}

/**
 * When a topic first ships on the product (UTC calendar date YYYY-MM-DD).
 * Cards show a NEW badge for {@link NEW_TOPIC_BADGE_DAYS} days from this date (inclusive of day 0).
 * Add every newly launched topic here — not only the latest — so all new cards get the icon.
 */
export const TOPIC_ADDED_AT: Record<string, string> = {
  "us-iran-confrontation": "2026-07-15",
  "elon-musk-public-voices": "2026-07-20",
  "us-ai-economy-boom": "2026-07-10",
  "save-europe-act": "2026-07-24",
  "commercial-space-race": "2026-07-25",
  "greece-economic-recovery": "2026-07-25",
  "ai-productivity-gdp-growth": "2026-08-12",
  "india-economic-growth-narrative": "2026-08-12",
  "cyprus-palestine-attention-asymmetry": "2026-08-18",
};

/** How long the NEW pill stays on topic cards after TOPIC_ADDED_AT. */
export const NEW_TOPIC_BADGE_DAYS = 7;

/**
 * True while `now` is within NEW_TOPIC_BADGE_DAYS of the topic's ship date.
 * All topics in TOPIC_ADDED_AT can show NEW at once if each is still in its window.
 */
export function isNewTopicBadge(id: string, now: Date = new Date()): boolean {
  const raw = TOPIC_ADDED_AT[id];
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return false;
  const startMs = Date.parse(`${raw}T00:00:00.000Z`);
  if (Number.isNaN(startMs)) return false;
  const endMs = startMs + NEW_TOPIC_BADGE_DAYS * 24 * 60 * 60 * 1000;
  const t = now.getTime();
  return t >= startMs && t < endMs;
}

export function isArchivedTopicId(id: string): boolean {
  return (ARCHIVED_TOPIC_IDS as readonly string[]).includes(id);
}

export function isLiveTopicId(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(LIVE_TOPIC_KEYS, id);
}

export function liveTopicConfig(id: string): LiveTopicConfig | undefined {
  return LIVE_TOPIC_KEYS[id];
}

export function topicIdForBackendName(backendName: string): string | null {
  const canonical = normalizeTopicKey(backendName) ?? backendName;
  const entry = Object.entries(LIVE_TOPIC_KEYS).find(([, cfg]) => cfg.rootKey === canonical);
  return entry ? entry[0] : null;
}

/** Re-export live-output filter (implementation in dashboard-data). */
export const isLiveOutputTopic = isLiveOutputTopicFromData;