import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type CompareRow = {
  dimension: string;
  traditional: string;
  citizen: string;
  divergence: number;
};

export type CompareAnalysis = {
  feasible: boolean;
  feasibilityNote?: string;
  title: string;
  summary: string;
  sampleSize: string;
  overallGap: number;
  officialHeadlines: string[];
  citizenHeadlines: string[];
  compare: CompareRow[];
};

const inputSchema = z.object({
  topic: z.string().min(2).max(200),
});

// Deterministic pseudo-random from a string seed so the same topic gives the
// same simulated analysis across reloads.
function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

const DIMENSIONS = [
  "Framing of urgency",
  "Trust in institutions",
  "Economic impact narrative",
  "Regional security implications",
  "Generational divide",
  "Diaspora vs. domestic voice",
];

const OFFICIAL_TEMPLATES = [
  (t: string) => `Officials describe ${t} as proceeding "in line with strategic timelines."`,
  (t: string) => `Mainstream coverage of ${t} emphasizes stability and managed progress.`,
  (t: string) => `Polls cited by state-aligned outlets show majority support for current ${t} policy.`,
  (t: string) => `Academic panels frame ${t} as a long-horizon structural question.`,
  (t: string) => `Government communiques on ${t} stress continuity with prior commitments.`,
];

const CITIZEN_TEMPLATES = [
  (t: string) => `X conversation on ${t} is dominated by frustration over pace and transparency.`,
  (t: string) => `Engagement-weighted posts call ${t} framing "performative" — Arabic dialect clusters lead.`,
  (t: string) => `Citizens flag a gap between ${t} announcements and lived conditions on the ground.`,
  (t: string) => `Diaspora threads on ${t} reach 3–5x the engagement of official accounts on the same day.`,
  (t: string) => `Counter-narrative on ${t} gains traction faster than ministry replies can respond.`,
];

function synthesize(topic: string): CompareAnalysis {
  const rng = seeded(topic.toLowerCase().trim());
  const overallGap = Math.round(28 + rng() * 55); // 28–83
  const sample = Math.round(8 + rng() * 42) * 1000; // 8k–50k

  const pick = <T,>(arr: T[], n: number): T[] => {
    const copy = [...arr];
    const out: T[] = [];
    for (let i = 0; i < n && copy.length; i++) {
      const idx = Math.floor(rng() * copy.length);
      out.push(copy.splice(idx, 1)[0]);
    }
    return out;
  };

  const dims = pick(DIMENSIONS, 4);
  const compare: CompareRow[] = dims.map((dimension, i) => ({
    dimension,
    traditional: OFFICIAL_TEMPLATES[i % OFFICIAL_TEMPLATES.length](topic),
    citizen: CITIZEN_TEMPLATES[i % CITIZEN_TEMPLATES.length](topic),
    divergence: Math.max(8, Math.min(95, Math.round(overallGap + (rng() - 0.5) * 30))),
  }));

  return {
    feasible: true,
    title: topic,
    summary: `Simulated narrative-gap analysis for "${topic}". Traditional sources lean toward managed-progress framing; citizen voice on X centers on urgency, transparency, and lived impact.`,
    sampleSize: `~${sample.toLocaleString()} X posts analyzed (simulated)`,
    overallGap,
    officialHeadlines: pick(OFFICIAL_TEMPLATES, 4).map((f) => f(topic)),
    citizenHeadlines: pick(CITIZEN_TEMPLATES, 4).map((f) => f(topic)),
    compare,
  };
}

export const analyzeCompare = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<CompareAnalysis> => {
    // Simulated analysis — live backend is offline. Same input
    // produces the same output (seeded), so the UI feels stable.
    await new Promise((r) => setTimeout(r, 600));
    return synthesize(data.topic.trim());
  });
