/**
 * Deterministic simulated sample for the Solvo Creations UAE desk.
 * Labeled testing data — not live X. Same score bands as the public desk.
 */
import type { Signal, Sentiment, Intensity, Subregion } from "@/lib/sim-data";
import type { RankedLeader } from "@/lib/trackers-data";
import type { DeskCard, DeskPicks } from "./types";
import { SOLVO_TOPICS } from "./solvo-topics";

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return Math.abs(h);
}

export function simulateDeskCards(_picks?: DeskPicks): DeskCard[] {
  const now = new Date().toISOString();
  return SOLVO_TOPICS.map((t) => ({
    topic_id: t.id,
    topic_name: t.name,
    headline: t.headline,
    overall_sentiment: { score: t.score, label: t.label },
    divergence_score: t.divergence,
    sample_size: t.sample,
    last_updated: now,
  }));
}

const CITIES: { name: string; subregion: Subregion; lat: number; lng: number }[] = [
  { name: "Dubai", subregion: "Persian Gulf", lat: 25.2, lng: 55.27 },
  { name: "Abu Dhabi", subregion: "GCC States", lat: 24.45, lng: 54.38 },
  { name: "Sharjah", subregion: "GCC States", lat: 25.35, lng: 55.39 },
  { name: "Riyadh", subregion: "GCC States", lat: 24.71, lng: 46.68 },
  { name: "Doha", subregion: "GCC States", lat: 25.28, lng: 51.52 },
  { name: "Kuwait City", subregion: "GCC States", lat: 29.38, lng: 47.99 },
  { name: "Manama", subregion: "GCC States", lat: 26.23, lng: 50.59 },
  { name: "Muscat", subregion: "GCC States", lat: 23.59, lng: 58.41 },
  { name: "Amman", subregion: "Levant Core", lat: 31.95, lng: 35.93 },
  { name: "Cairo", subregion: "Eastern Mediterranean", lat: 30.04, lng: 31.24 },
];

function intensityFromScore(n: number): { intensity: Intensity; intensityScore: number } {
  if (n > 82) return { intensity: "critical", intensityScore: 0.9 };
  if (n > 68) return { intensity: "high", intensityScore: 0.72 };
  if (n > 50) return { intensity: "medium", intensityScore: 0.48 };
  return { intensity: "low", intensityScore: 0.28 };
}

function sentimentFromScore(score: number): Sentiment {
  if (score >= 70) return "hopeful";
  if (score >= 60) return "supportive";
  if (score >= 50) return "neutral";
  if (score >= 42) return "critical";
  return "outraged";
}

export function simulateSolvoSignals(): Signal[] {
  const now = Date.now();
  const out: Signal[] = [];
  SOLVO_TOPICS.forEach((t, ti) => {
    const city = CITIES[ti % CITIES.length]!;
    const n = hash(t.id);
    const { intensity, intensityScore } = intensityFromScore(t.divergence);
    out.push({
      id: `solvo_${t.id}`,
      topic: t.name,
      region: city.name,
      subregion: city.subregion,
      lat: city.lat + ((n % 17) - 8) * 0.04,
      lng: city.lng + ((n % 13) - 6) * 0.04,
      sentiment: sentimentFromScore(t.score),
      intensity,
      intensityScore,
      engagement: 800 + (n % 12000),
      posts: t.sample,
      divergence: t.divergence / 100,
      divergenceKnown: true,
      velocity: t.delta,
      headline: t.headline,
      excerpt: t.blurb,
      source: "simulated · Solvo prototype",
      timestamp: now - (ti + 1) * 36e5,
    });
  });
  return out;
}

/** Regional Arab leaders — simulated ranking for the Solvo landing only. Not a public Elenchos index. */
export const SOLVO_BUSINESS_LEADERS: RankedLeader[] = [
  {
    rank: 1,
    name: "Mohamed Alabbar",
    flag: "🇦🇪",
    country: "UAE",
    region: "GCC",
    role: "Emaar",
    overall_score: 76,
    divergence: 26,
    summary:
      "Simulated: development and consumer-brand talk versus official mega-project volume. Preview ranking — not a live public index.",
    posts_analyzed: 310,
    status: "active",
  },
  {
    rank: 2,
    name: "Fadi Ghandour",
    flag: "🇯🇴",
    country: "Jordan / UAE",
    region: "MENA",
    role: "Aramex · Wamda",
    overall_score: 73,
    divergence: 21,
    summary:
      "Simulated: logistics and founder-operator talk versus packaged entrepreneurship media. Preview ranking — not live X.",
    posts_analyzed: 240,
    status: "active",
  },
  {
    rank: 3,
    name: "Badr Jafar",
    flag: "🇦🇪",
    country: "UAE",
    region: "GCC",
    role: "Crescent Enterprises",
    overall_score: 71,
    divergence: 19,
    summary:
      "Simulated: family-enterprise and regional-investment discourse versus brochure growth talk. Preview ranking — not a live index.",
    posts_analyzed: 210,
    status: "active",
  },
  {
    rank: 4,
    name: "Hussain Sajwani",
    flag: "🇦🇪",
    country: "UAE",
    region: "GCC",
    role: "DAMAC",
    overall_score: 64,
    divergence: 32,
    summary:
      "Simulated: real-estate brand talk versus housing-cost earned speech. Preview ranking — not live X.",
    posts_analyzed: 265,
    status: "active",
  },
  {
    rank: 5,
    name: "Khaldoon Al Mubarak",
    flag: "🇦🇪",
    country: "UAE",
    region: "GCC",
    role: "Mubadala",
    overall_score: 78,
    divergence: 17,
    summary:
      "Simulated: sovereign-investment and AI/industrial strategy talk versus official communications. Preview ranking — not a live public index.",
    posts_analyzed: 290,
    status: "active",
  },
];

export const SOLVO_ARAB_LEADERS: RankedLeader[] = [
  {
    rank: 1,
    name: "Mohammed bin Zayed Al Nahyan",
    flag: "🇦🇪",
    country: "UAE",
    region: "GCC",
    role: "President",
    overall_score: 81,
    divergence: 18,
    summary:
      "Simulated: earned talk on stability and economic direction versus official state volume. Preview ranking — not a live public index.",
    posts_analyzed: 420,
    status: "active",
  },
  {
    rank: 2,
    name: "Mohammed bin Rashid Al Maktoum",
    flag: "🇦🇪",
    country: "UAE",
    region: "GCC",
    role: "Vice President · Ruler of Dubai",
    overall_score: 78,
    divergence: 22,
    summary:
      "Simulated: Dubai execution and livability discourse versus lifestyle/media volume. Preview ranking — not live X.",
    posts_analyzed: 390,
    status: "active",
  },
  {
    rank: 3,
    name: "Mohammed bin Salman",
    flag: "🇸🇦",
    country: "Saudi Arabia",
    region: "GCC",
    role: "Crown Prince",
    overall_score: 74,
    divergence: 29,
    summary:
      "Simulated: Vision-scale economic talk versus regional media frames. Preview ranking — not a live public index.",
    posts_analyzed: 455,
    status: "active",
  },
  {
    rank: 4,
    name: "Tamim bin Hamad Al Thani",
    flag: "🇶🇦",
    country: "Qatar",
    region: "GCC",
    role: "Amir",
    overall_score: 71,
    divergence: 24,
    summary:
      "Simulated: mediation and energy-state discourse versus official communications. Preview ranking — not live X.",
    posts_analyzed: 280,
    status: "active",
  },
  {
    rank: 5,
    name: "Abdullah II",
    flag: "🇯🇴",
    country: "Jordan",
    region: "Levant",
    role: "King",
    overall_score: 67,
    divergence: 21,
    summary:
      "Simulated: stability and regional-balance talk versus official statements. Preview ranking — not a live public index.",
    posts_analyzed: 240,
    status: "active",
  },
];

export const SOLVO_SIM_PAID = { volume: 1240, earned: 3860, integrity: 71, gap: 34 };

export const SOLVO_KPI = {
  topics: SOLVO_TOPICS.length,
  regions: CITIES.length,
  leaders: SOLVO_ARAB_LEADERS.length,
  intelligence: SOLVO_TOPICS.length * 9,
  sample: SOLVO_TOPICS.reduce((n, t) => n + t.sample, 0),
  trackers: 2,
};

export function solvoGaps(): { topic: string; score: number; sample: number }[] {
  return [...SOLVO_TOPICS]
    .sort((a, b) => b.divergence - a.divergence)
    .slice(0, 4)
    .map((t) => ({ topic: t.name, score: t.divergence, sample: t.sample }));
}

export type SimCity = {
  id: string;
  score: number;
  sample: number;
  label: string;
};

/** Kept for GulfMap — unused on the Solvo landing after the globe restore. */
export function simulateGulfCities(): SimCity[] {
  return [
    { id: "dubai", score: 62, sample: 104, label: "Mixed" },
    { id: "abu-dhabi", score: 68, sample: 96, label: "Leaning Positive" },
  ];
}

export function solvoMovers(): {
  rising: { topic: string; delta: number }[];
  falling: { topic: string; delta: number }[];
} {
  const rising = SOLVO_TOPICS.filter((t) => t.delta > 0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 2)
    .map((t) => ({ topic: t.name, delta: t.delta }));
  const falling = SOLVO_TOPICS.filter((t) => t.delta < 0)
    .sort((a, b) => a.delta - b.delta)
    .slice(0, 2)
    .map((t) => ({ topic: t.name, delta: t.delta }));
  return { rising, falling };
}
