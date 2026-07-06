// Master feature flag — when false, all Sponsor UI surfaces (nav CTA, modal,
// /sponsor routes, "Sponsor me" topic cards, locked-topic gating) are hidden.
// Backend data (topic_sponsorships rows, Stripe secrets, edge function) is
// intentionally left intact so the experience can be redesigned later.
export const SPONSOR_ENABLED = true;

// Exact backend topic name strings — used for Supabase .eq("topic", ...) filters
// and for Stripe metadata.topic on sponsor checkout.
export const SPONSOR_TOPICS = [
  "Arab-Israeli Normalization / Abraham Accords",
  "Iranian Voices vs Regime",
  "Eastern Mediterranean Alliance (Israel-Greece-Cyprus)",
  "Trump Administration Actions & US Politics",
  "Crypto Regulation & Financial Markets Volatility",
  "Migration, Green Policies & Internal EU Divisions",
  "Government Performance, Corruption & Scandals",
  "Crime, Safety & Lawlessness",
  "Cuba Sanctions & the Domino Effect",
] as const;

// UI-only placeholders — sponsoring these signals interest; no live analysis yet.
export const SPONSOR_COMING_SOON_TOPICS = [
  "Rise of EU right-wing/populist parties challenging establishments",
  "Illegal immigration & national security",
] as const;

export type SponsorTopic = (typeof SPONSOR_TOPICS)[number];

export const SPONSOR_TIERS = [20, 40, 60, 80, 100] as const;
export const SPONSOR_MIN_EUR = 20;
export const SPONSOR_MAX_EUR = 100;

// The 9 fixed Socratic-style prompts collected for "Suggest your own" topics.
// They are concatenated into the existing `reason` field on the Stripe metadata
// so the backend (create_stripe_checkout.py) signature stays unchanged.
export const SPONSOR_CUSTOM_QUESTIONS: { id: string; label: string; placeholder: string }[] = [
  { id: "q1", label: "1 · What is the topic?", placeholder: "e.g. EU energy security & citizen unrest" },
  { id: "q2", label: "2 · Why does it matter now?", placeholder: "Current relevance and stakes" },
  { id: "q3", label: "3 · Who are the key actors / stakeholders?", placeholder: "Governments, parties, leaders, movements…" },
  { id: "q4", label: "4 · What are the dominant public narratives?", placeholder: "Mainstream framing on social media / press" },
  { id: "q5", label: "5 · What are the counter-narratives?", placeholder: "Dissent, suppressed voices, minority views" },
  { id: "q6", label: "6 · Which regions / languages should be monitored?", placeholder: "e.g. Germany + France, EN/DE/FR" },
  { id: "q7", label: "7 · What outcomes are you hoping to surface?", placeholder: "Divergence, manipulation, real citizen sentiment…" },
  { id: "q8", label: "8 · Known biases or hashtags / accounts to track?", placeholder: "Optional handles, hashtags, keywords" },
  { id: "q9", label: "9 · How would you use this analysis?", placeholder: "Journalism, research, policy, civic awareness…" },
];

// Topics that are gated behind a sponsor unlock on the Topics page.
// Keys are FEATURE_TOPICS ids; values are the matching backend topic name
// strings (same value as LIVE_TOPIC_KEYS[id].rootKey).
export const SPONSOR_LOCKED_TOPIC_IDS: Record<string, string> = {
  "maritime-ai-greece-global-role": "Maritime AI Industry & Greece's Global Role",
  "global-ai-race": "Global AI Race",
  "new-us-foreign-policy": "Trump Administration Actions & US Politics",
  "crypto-regulation-financial-markets": "Crypto Regulation & Financial Markets Volatility",
  "levant-realignment": "Eastern Mediterranean Alliance (Israel-Greece-Cyprus)",
  "eu-migration-green-divisions": "Migration, Green Policies & Internal EU Divisions",
  "government-performance-corruption": "Government Performance, Corruption & Scandals",
  "political-polarization-populism": "Political Polarization & Populism Rise",
  "cuba-sanctions-domino": "Cuba Sanctions & the Domino Effect",
};

// Stores the topic the user is currently checking out so we can refresh the
// unlocked state when Stripe redirects back with `?success=true`. The unlock
// truth lives server-side in the `topic_sponsorships` table — see
// `getUnlockedSponsorTopics` in `src/lib/sponsor-unlocks.functions.ts`.
export const SPONSOR_PENDING_STORAGE_KEY = "elenchos:pending-sponsor-topic";

export function isTopicSponsorLocked(topicId: string): boolean {
  return Object.prototype.hasOwnProperty.call(SPONSOR_LOCKED_TOPIC_IDS, topicId);
}

// Map a backend topic name (as stored in `topic_sponsorships.topic`) to the
// frontend FEATURE_TOPICS id used to gate the UI.
export function topicIdForBackendName(backendName: string): string | null {
  const entry = Object.entries(SPONSOR_LOCKED_TOPIC_IDS).find(
    ([, name]) => name === backendName,
  );
  return entry ? entry[0] : null;
}
