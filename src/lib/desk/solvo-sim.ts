/**
 * Deterministic simulated sample for the Solvo Creations UAE desk prototype.
 * Same score bands as the public desk. Labeled testing data — not live X.
 */
import { LIVE_TOPIC_KEYS } from "@/lib/topic-catalog";
import type { DeskCard, DeskPicks } from "./types";
import { GULF_PLACES } from "./gulf-places";

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return Math.abs(h);
}

function band(n: number): { score: number; label: string } {
  const score = 48 + (n % 40);
  const label =
    score >= 71 ? "Positive" : score >= 61 ? "Leaning Positive" : score >= 51 ? "Mixed" : "Slightly Negative";
  return { score, label };
}

const HEADLINES: Record<string, string> = {
  "ai-productivity-gdp-growth":
    "Simulated: workforce posts on AI tools vs agency/client claims of ‘transformation’ — public discourse gap.",
  "crypto-regulation-financial-markets":
    "Simulated: Dubai traders’ earned replies diverge from paid fintech launch threads.",
  "crime-safety-lawlessness":
    "Simulated: neighbourhood safety talk vs official/media volume on the same week.",
  "elon-musk-public-voices":
    "Simulated: ordinary accounts vs amplified tech-celebrity frames in GCC threads.",
  "Dubai cost of living & rents":
    "Simulated: rent and school-fee talk from residents, not ministry housing campaigns.",
  "UAE jobs, visas & talent":
    "Simulated: visa/talent earned mentions vs paid recruitment takeovers.",
  "Heat, livability & daily life":
    "Simulated: heat and commute lived posts — communication risk for outdoor brands.",
  "Housing & school fees":
    "Simulated: parent/expat discourse vs property-developer media.",
  "Workforce talk vs paid campaign frames":
    "Simulated: Solvo-relevant B2B visibility: earned partner talk vs boosted campaign noise.",
  "Gig work & startup life in Dubai":
    "Simulated: founder/freelance earned speech on X vs startup-media packages.",
  "Traffic & daily commute":
    "Simulated: commute complaints as early comms-risk signal for mobility brands.",
};

export function simulateDeskCards(picks: DeskPicks): DeskCard[] {
  const now = new Date().toISOString();
  const cards: DeskCard[] = [];
  for (const id of picks.topic_ids) {
    const cfg = LIVE_TOPIC_KEYS[id];
    if (!cfg) continue;
    const { score, label } = band(hash(id));
    cards.push({
      topic_id: id,
      topic_name: cfg.headerLabel,
      headline: HEADLINES[id] ?? `Simulated public-discourse sample for ${cfg.headerLabel}.`,
      overall_sentiment: { score, label },
      divergence_score: 28 + (hash(id + "div") % 40),
      sample_size: 180 + (hash(id + "n") % 820),
      last_updated: now,
    });
  }
  for (const custom of picks.custom_topics) {
    const { score, label } = band(hash(custom));
    cards.push({
      topic_id: `custom:${custom.slice(0, 40)}`,
      topic_name: custom.slice(0, 80),
      headline: HEADLINES[custom] ?? `Simulated public-discourse sample: ${custom}.`,
      overall_sentiment: { score, label },
      divergence_score: 22 + (hash(custom + "div") % 45),
      sample_size: 90 + (hash(custom + "n") % 640),
      last_updated: now,
    });
  }
  return cards;
}

export type SimCity = {
  id: string;
  score: number;
  sample: number;
  label: string;
};

export function simulateGulfCities(): SimCity[] {
  return GULF_PLACES.map((p) => {
    const { score, label } = band(hash(p.id));
    return {
      id: p.id,
      score,
      sample: 40 + (hash(p.id + "n") % 220),
      label,
    };
  });
}

export const SOLVO_SIM_PAID = { volume: 1240, earned: 3860, integrity: 71, gap: 34 };
