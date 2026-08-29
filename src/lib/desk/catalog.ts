/** One public SKU: the dashboard, licensed. Scoring code stays locked. */

export const DESK_PRICE_USD = 49;
export const DESK_INTERVAL = "month" as const;

export const DESK_PRODUCT_NAME = "Elenchos Desk";
export const DESK_PRODUCT_BLURB =
  "Your public-discourse dashboard. Pay, brand it, pick topics, generate a live URL. Truth-scoring stays on Elenchos.";

export const DESK_INCLUDED = [
  "Branded or unbranded dashboard (this live site is the template)",
  "Your own data tables created at payment",
  "Topic picker + Generate → free live link on elenchos.live",
  "Connect your own domain (CNAME)",
  "Scoring / Pass-1 logic is not exported — you buy the surface, not the method",
] as const;

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
