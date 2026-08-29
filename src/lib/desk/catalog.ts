/** One public SKU: the dashboard, licensed. Scoring code stays locked. */

export const DESK_CURRENCY = "eur" as const;
export const DESK_SETUP_EUR = 490;
export const DESK_LICENSE_EUR = 199;
export const DESK_INTERVAL = "month" as const;
export const DESK_RUN_EUR = 1.5;
export const DESK_MAX_TOPICS = 15;

/** @deprecated use DESK_LICENSE_EUR — kept so older imports still typecheck during edit */
export const DESK_PRICE_USD = DESK_LICENSE_EUR;

export const DESK_PRODUCT_NAME = "Elenchos Desk";
export const DESK_PRODUCT_BLURB =
  "Your public-discourse dashboard — the same design as elenchos.live. Setup, monthly license, then each sample run bills your card. Scoring stays on Elenchos.";

export const DESK_INCLUDED = [
  "Full dashboard clone (overview + Research tab) on your live URL",
  "Setup fee covers design, tables, and white-label chrome",
  "Monthly license hosts your desk; scoring / Pass-1 stays locked",
  "Up to 15 topics (catalog and/or your own names)",
  `Each sample run is €${DESK_RUN_EUR.toFixed(2)} per topic, charged to your card — not absorbed by Elenchos`,
  "Connect your own domain (CNAME)",
] as const;

export function deskRunCostEur(topicCount: number): number {
  const n = Math.max(0, Math.min(DESK_MAX_TOPICS, Math.floor(topicCount)));
  return Math.round(n * DESK_RUN_EUR * 100) / 100;
}

export function deskRunCents(topicCount: number): number {
  return Math.round(deskRunCostEur(topicCount) * 100);
}

/** Owner walkthrough — not a paid tenant. Token is 16+ chars for studio API. */
export const DESK_DEMO_TOKEN = "desk-demo-walkthrough";
export const DESK_DEMO_SLUG = "acme-research";
export const DESK_DEMO_ORG = "Acme Research";

export const UAE_DEMO_TOKEN = "uae-demo-walkthrough";
export const UAE_DEMO_SLUG = "uae-prototype";
export const UAE_DEMO_ORG = "Gulf Desk";

export type DeskDemoSeed = {
  id: string;
  token: string;
  slug: string;
  org: string;
  email: string;
  topic_ids: string[];
  custom_topics: string[];
  primary_color: string;
  accent_color: string;
};

export const DESK_DEMO_SEEDS: DeskDemoSeed[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    token: DESK_DEMO_TOKEN,
    slug: DESK_DEMO_SLUG,
    org: DESK_DEMO_ORG,
    email: "demo@elenchos.live",
    topic_ids: [
      "greece-economic-recovery",
      "levant-realignment",
      "global-ai-race",
      "crime-safety-lawlessness",
    ],
    custom_topics: [],
    primary_color: "#22d3ee",
    accent_color: "#f59e0b",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    token: UAE_DEMO_TOKEN,
    slug: UAE_DEMO_SLUG,
    org: UAE_DEMO_ORG,
    email: "uae-demo@elenchos.live",
    topic_ids: [
      "arab-israeli-normalization",
      "levant-realignment",
      "global-ai-race",
      "crypto-regulation-financial-markets",
      "us-ai-economy-boom",
    ],
    custom_topics: ["UAE campaign authenticity", "Dubai brand on X"],
    primary_color: "#0d9488",
    accent_color: "#c9a227",
  },
];

export function demoSeedByToken(token: string): DeskDemoSeed | undefined {
  const t = token.trim();
  return DESK_DEMO_SEEDS.find((d) => d.token === t);
}

export function demoSeedBySlug(slug: string): DeskDemoSeed | undefined {
  return DESK_DEMO_SEEDS.find((d) => d.slug === slug);
}

export function isDeskDemoToken(token: string): boolean {
  return Boolean(demoSeedByToken(token));
}

export function isUaeDemoToken(token: string): boolean {
  return token.trim() === UAE_DEMO_TOKEN;
}
