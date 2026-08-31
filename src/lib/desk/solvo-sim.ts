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
    "Simulated: SMB operators on AI tools vs paid ‘transformation’ claims — public discourse gap Solvo’s Human+AI pitch sits in.",
  "global-ai-race":
    "Simulated: earned talk on AI search/GEO vs boosted thought-leadership threads.",
  "crypto-regulation-financial-markets":
    "Simulated: Dubai B2B/fintech founders’ replies vs paid launch campaigns.",
  "elon-musk-public-voices":
    "Simulated: founder personal-brand talk vs celebrity-tech media frames in the GCC.",
  "B2B visibility vs paid takeovers":
    "Simulated: unprompted partner mentions vs boosted B2B visibility campaigns.",
  "Founder personal branding on X":
    "Simulated: executives’ earned replies vs packaged personal-brand media.",
  "AI search & GEO reputation":
    "Simulated: how decision-makers talk about being found on AI search vs SEO-agency ads.",
  "SMB trust and partnerships":
    "Simulated: trust/partnership earned speech from SMBs vs official/media volume.",
  "Decision-maker discovery":
    "Simulated: who actually gets discovered by buyers on X — organic vs paid outreach.",
  "Agency vs in-house growth talk":
    "Simulated: builders debating agency vs in-house — earned, not brochure copy.",
  "Podcast & PR authority vs earned replies":
    "Simulated: PR/podcast placements vs whether ordinary accounts repeat the frame.",
  "Expansion into UAE / GCC markets":
    "Simulated: expansion-brand discourse from operators entering the UAE, not tourism media.",
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
