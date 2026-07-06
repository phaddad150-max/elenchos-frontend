// Simulation engine — citizen-pulse data.
// Designed so the dashboard works offline; swap these
// generators for live fetchers when wiring real data.


export type Sentiment = "supportive" | "critical" | "neutral" | "outraged" | "hopeful";
export type Intensity = "low" | "medium" | "high" | "critical";

export type Subregion =
  | "Levant Core"
  | "GCC States"
  | "Persian Gulf"
  | "Eastern Mediterranean";

export const SUBREGIONS: Subregion[] = [
  "Levant Core",
  "GCC States",
  "Persian Gulf",
  "Eastern Mediterranean",
];

export interface Signal {
  id: string;
  topic: string;
  region: string;
  subregion: Subregion;
  lat: number;
  lng: number;
  sentiment: Sentiment;
  intensity: Intensity;
  intensityScore: number; // 0..1
  engagement: number;
  posts: number;
  divergence: number; // 0..1 — citizen vs official+media
  velocity: number; // % change last 60min
  headline: string;
  excerpt: string;
  source: string;
  timestamp: number;
}

export interface CitizenVoice {
  id: string;
  handle: string;
  text: string;
  sentiment: Sentiment;
  engagement: number;
  region: string;
}

export interface NarrativeFlip {
  topic: string;
  from: Sentiment;
  to: Sentiment;
  delta: number;
  window: string;
}

export const TOPICS = [
  "Abraham Accords Expansion",
  "Lebanon-Israel Direct Talks",
  "Arab States Path to Peace with Israel",
  "Iran Regime Collapse Watch",
  "Strait of Hormuz Security",
  "India–UAE–Saudi–Israel–Greece Trade Corridor",
  "Eastern Mediterranean Bloc: Israel-Greece-Cyprus",
  "Turkey's Regional Influence",
  "Gaza Reconstruction & Governance",
  "Hezbollah Disarmament Pressure",
  "Houthi Red Sea Threat",
  "Syria Post-Assad Realignment",
  "Kurdish Autonomy Debate",
  "GCC Economic Diversification",
] as const;

interface RegionDef {
  name: string;
  subregion: Subregion;
  lat: number;
  lng: number;
}

const REGIONS: RegionDef[] = [
  // Levant Core
  { name: "Beirut", subregion: "Levant Core", lat: 33.89, lng: 35.5 },
  { name: "Damascus", subregion: "Levant Core", lat: 33.51, lng: 36.29 },
  { name: "Amman", subregion: "Levant Core", lat: 31.95, lng: 35.93 },
  { name: "Ramallah", subregion: "Levant Core", lat: 31.9, lng: 35.2 },
  { name: "Gaza", subregion: "Levant Core", lat: 31.5, lng: 34.47 },
  // GCC
  { name: "Riyadh", subregion: "GCC States", lat: 24.71, lng: 46.68 },
  { name: "Doha", subregion: "GCC States", lat: 25.28, lng: 51.52 },
  { name: "Abu Dhabi", subregion: "GCC States", lat: 24.45, lng: 54.38 },
  { name: "Manama", subregion: "GCC States", lat: 26.23, lng: 50.59 },
  { name: "Kuwait City", subregion: "GCC States", lat: 29.38, lng: 47.99 },
  { name: "Muscat", subregion: "GCC States", lat: 23.59, lng: 58.41 },
  // Persian Gulf
  { name: "Tehran", subregion: "Persian Gulf", lat: 35.69, lng: 51.39 },
  { name: "Basra", subregion: "Persian Gulf", lat: 30.51, lng: 47.78 },
  { name: "Dubai", subregion: "Persian Gulf", lat: 25.2, lng: 55.27 },
  // Eastern Mediterranean
  { name: "Istanbul", subregion: "Eastern Mediterranean", lat: 41.01, lng: 28.98 },
  { name: "Nicosia", subregion: "Eastern Mediterranean", lat: 35.18, lng: 33.38 },
  { name: "Tel Aviv", subregion: "Eastern Mediterranean", lat: 32.08, lng: 34.78 },
  { name: "Alexandria", subregion: "Eastern Mediterranean", lat: 31.2, lng: 29.92 },
];

const SENTIMENTS: Sentiment[] = ["supportive", "critical", "neutral", "outraged", "hopeful"];

const HEADLINES = [
  "Diaspora threads contradict official communique",
  "Citizens demand transparency on bilateral terms",
  "Local unions warn ministry on rollout pace",
  "Viral Arabic-language thread exposes framing gap",
  "Independent reporters publish leaked annex",
  "Sentiment flips after late-night clarification",
  "Counter-narrative gains traction in dialect clusters",
  "Cross-border solidarity post outpaces state account",
];

const VOICES = [
  "We weren't consulted — the clause on movement was buried.",
  "Finally something concrete on reconstruction. Cautiously watching.",
  "The official figure on returns doesn't match what we see on the ground.",
  "Clinics in our district remain understaffed despite the announcement.",
  "Cross-checked three Arabic sources — the framing is selective.",
  "Hope is fragile here. Today felt like progress, tomorrow we'll see.",
];

const rand = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const r = (min: number, max: number) => Math.random() * (max - min) + min;

function intensityFromScore(s: number): Intensity {
  if (s > 0.85) return "critical";
  if (s > 0.65) return "high";
  if (s > 0.35) return "medium";
  return "low";
}

export function generateSignal(seed?: number, topicOverride?: string): Signal {
  const region = rand(REGIONS);
  const topic = topicOverride ?? rand(TOPICS);
  const sentiment = rand(SENTIMENTS);
  const engagement = Math.floor(r(120, 48000));
  const posts = Math.floor(r(40, 12000));
  const engPerPost = engagement / Math.max(posts, 1);
  const baseIntensity = Math.min(1, r(0.2, 0.7) + engPerPost / 30);
  const intensityScore = Math.min(1, baseIntensity);
  return {
    id: `sig_${Date.now()}_${Math.floor(Math.random() * 9999)}_${seed ?? 0}`,
    topic,
    region: region.name,
    subregion: region.subregion,
    lat: region.lat + r(-0.6, 0.6),
    lng: region.lng + r(-0.6, 0.6),
    sentiment,
    intensity: intensityFromScore(intensityScore),
    intensityScore,
    engagement,
    posts,
    divergence: Math.min(1, r(0.1, 0.95)),
    velocity: r(-45, 220),
    headline: rand(HEADLINES),
    excerpt:
      "Filtered stream + AI synthesis: citizen posts diverge sharply from official ministry framing; engagement-per-post unusually high in low-volume cluster.",
    source: rand(["Filtered stream", "Diaspora cluster", "Local press", "Activist net"]),
    timestamp: Date.now() - Math.floor(r(0, 3600_000)),
  };
}

export function seedSignals(n = 24): Signal[] {
  return Array.from({ length: n }, (_, i) => generateSignal(i)).sort(
    (a, b) => b.timestamp - a.timestamp
  );
}

export function generateVoice(): CitizenVoice {
  return {
    id: `voice_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
    handle: `@${rand(["leila_", "kareem.", "yasmin_", "omar.", "fatima_", "tariq.", "noura_"])}${Math.floor(r(100, 9999))}`,
    text: rand(VOICES),
    sentiment: rand(SENTIMENTS),
    engagement: Math.floor(r(80, 12000)),
    region: rand(REGIONS).name,
  };
}

export function generateFlips(n = 4): NarrativeFlip[] {
  return Array.from({ length: n }, () => {
    const from = rand(SENTIMENTS);
    let to = rand(SENTIMENTS);
    while (to === from) to = rand(SENTIMENTS);
    return {
      topic: rand(TOPICS),
      from,
      to,
      delta: Math.floor(r(15, 78)),
      window: rand(["last 30m", "last 1h", "last 3h", "last 6h"]),
    };
  });
}

// === Scoring helpers (exposed so UI can show formulas) ===

/** |Citizen − (Official + Media)/2| in [0,1]. */
export function narrativeDivergence(
  citizen: number,
  official: number,
  media: number
): number {
  return Math.min(1, Math.abs(citizen - (official + media) / 2));
}

/** Sliding 60-min % change. */
export function velocity(prev: number, curr: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return ((curr - prev) / prev) * 100;
}

export const SENTIMENT_COLOR: Record<Sentiment, string> = {
  supportive: "oklch(0.78 0.17 160)",
  critical: "oklch(0.82 0.17 75)",
  neutral: "oklch(0.68 0.02 250)",
  outraged: "oklch(0.68 0.24 20)",
  hopeful: "oklch(0.82 0.16 200)",
};

export const INTENSITY_COLOR: Record<Intensity, string> = {
  low: "oklch(0.68 0.02 250)",
  medium: "oklch(0.82 0.16 200)",
  high: "oklch(0.82 0.17 75)",
  critical: "oklch(0.68 0.24 20)",
};

export const INTENSITY_GLOBE_COLOR: Record<Intensity, string> = {
  low: "#8b94a7",
  medium: "#00d5ff",
  high: "#ffcc4d",
  critical: "#ff4d5e",
};
