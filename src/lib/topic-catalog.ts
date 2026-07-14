// Editorial metadata + live Supabase topic mapping (no simulated scores).
import { normalizeTopicKey } from "@/lib/dashboard-data";

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
  "maritime-ai-greece-global-role": {
    rootKey: "Maritime AI Industry & Greece's Global Role",
    headerLabel: "Maritime AI Industry & Greece's Global Role",
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
  "us-ai-economy-boom": {
    rootKey: "US AI Economy Boom & American Technological Renaissance",
    headerLabel: "US AI Economy Boom",
  },
};

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