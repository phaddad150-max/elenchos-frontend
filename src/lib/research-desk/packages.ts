export type DeskPackageId = "topic-analysis" | "deep-no-x" | "deep-with-x";

export type DeskPackageMeta = {
  id: DeskPackageId;
  title: string;
  /** Short tier label for landing dual-card UI */
  tierLabel: string;
  priceUsd: number;
  blurb: string;
  delivers: string;
  includesX: boolean;
  /** Honest automated delivery window */
  deliveryNote: string;
  /** Sample URL for this package type */
  sampleHref: string;
  sampleLabel: string;
};

/**
 * On-demand packages (Stripe).
 * Commissioned runs write only to research_desk_reports (never topic_snapshots).
 * X packages use automated pipeline after pay — minutes, not manual admin runs.
 */
export const DESK_PACKAGES: Record<DeskPackageId, DeskPackageMeta> = {
  "topic-analysis": {
    id: "topic-analysis",
    tierLabel: "Topic analysis",
    title: "Topic analysis (public discourse)",
    priceUsd: 10,
    blurb:
      "Socratic-style questions + public discourse analysis (same method as live Topics).",
    delivers:
      "Structured public-discourse themes, frames vs official/media, sample honesty and limits.",
    includesX: true,
    deliveryNote:
      "Automated after payment — typically seconds to a few minutes (X sample when credits allow).",
    sampleHref: "/research/report/uae-fintech-dominance-mena-2026",
    sampleLabel: "Sample topic report (UAE fintech)",
  },
  "deep-no-x": {
    id: "deep-no-x",
    tierLabel: "Standard multi-source",
    title: "Deep dive · multi-source (no X)",
    priceUsd: 10,
    blurb: "Thesis-style multi-source structure without an X sample.",
    delivers:
      "Chapters, evidence map, claims with confidence and falsifiers where evidence holds. Unique private link + PDF.",
    includesX: false,
    deliveryNote: "Automated after payment — typically seconds to a few minutes.",
    sampleHref: "/research-migration",
    sampleLabel: "Sample deep dive (irregular migration briefing)",
  },
  "deep-with-x": {
    id: "deep-with-x",
    tierLabel: "Deeper + discourse",
    title: "Deep dive · multi-source + X",
    priceUsd: 20,
    blurb: "Deep dive plus a capped public-discourse sample on X.",
    delivers:
      "Everything in Standard, plus a discourse section with sample limits. Unique private link + PDF.",
    includesX: true,
    deliveryNote:
      "Automated after payment — typically a few minutes (X fetch + analysis when API credits allow).",
    sampleHref: "/research-migration",
    sampleLabel: "Sample deep dive (irregular migration briefing)",
  },
};

/** Landing page dual-tier order (primary paid path). */
export const LANDING_TIER_IDS: DeskPackageId[] = ["deep-no-x", "deep-with-x"];

/** All packages shown on the commission page (left column + checkout). */
export const COMMISSION_PACKAGE_IDS: DeskPackageId[] = [
  "deep-no-x",
  "deep-with-x",
  "topic-analysis",
];

/** Checkout form package order. */
export const CHECKOUT_PACKAGE_ORDER: DeskPackageId[] = COMMISSION_PACKAGE_IDS;

export type HowItWorksStep = {
  title: string;
  body: string;
  formLabel?: string;
};

/** Commission page guide — maps to checkout steps on the right. */
export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    title: "Choose your research type",
    body:
      "Standard ($10) — multi-source deep dive, no X. Deeper + discourse ($20) — same plus capped X sample. Topic analysis ($10) — public discourse themes (live Topics method).",
    formLabel: "1 · Package",
  },
  {
    title: "Write your question",
    body:
      "One clear topic in plain language. For Topic analysis, you can add up to 9 optional questions after the topic.",
    formLabel: "2 · Topic",
  },
  {
    title: "Pay once on Stripe",
    body:
      "Card data stays with Stripe — never stored by Elenchos. Optional email is for one-time link delivery only.",
    formLabel: "3 · Email (optional)",
  },
  {
    title: "Open your private link + PDF",
    body: "Automated delivery — typically seconds to a few minutes after payment.",
  },
];

export function isDeskPackageId(v: string): v is DeskPackageId {
  return v === "topic-analysis" || v === "deep-no-x" || v === "deep-with-x";
}

/** Light refusal of clearly illegal commission intents (not a full legal filter). */
const BLOCKED_TOPIC_PATTERNS: RegExp[] = [
  /\b(how\s+to\s+)?(hack|ddos|ransomware|child\s*porn|csam|traffic\s+humans?|hire\s+a?\s*hitman|assassinate)\b/i,
  /\b(build|make|buy)\s+(a\s+)?(bomb|explosive|bioweapon)\b/i,
  /\bscrape\s+(private|login|password|credential)/i,
  /\bdoxx?(ing)?\b.*\b(address|ssn|bank\s*account)\b/i,
];

export function topicViolatesSafetyPolicy(topic: string): string | null {
  const t = topic.trim();
  if (!t) return null;
  for (const re of BLOCKED_TOPIC_PATTERNS) {
    if (re.test(t)) {
      return "This request cannot be processed. Elenchos only supports lawful public-interest research and must not be used for illegal or criminal purposes, or to violate X’s terms and community rules.";
    }
  }
  return null;
}
