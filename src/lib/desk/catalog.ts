/** Solvo Creations / UAE desk SKUs. Public elenchos.live has no price list. */
import { UAE_CITIZEN_CATALOG_IDS, UAE_CITIZEN_CUSTOM_TOPICS } from "./uae";

/** Legacy EUR constants — not sold on elenchos.live. Do not surface in main UI. */
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

/**
 * AED ladder for Solvo Creations (UAE).
 * €1,500 setup × ~4 AED/EUR → AED 6,000 (rounded).
 * €60 Pulse × ~4 AED/EUR → AED 249 (charm).
 * Insight is not 8× Pulse: n=1000 vs 120 would be linear ~AED 2,070 plus a weekly analyst hour
 * (UAE boutique 400–700 AED/hr × 4 = 1,600–2,800). 899 undercuts Meltwater/Brandwatch
 * (~1,800–11,000 AED/mo) and Ipsos/Nielsen retainers (15k–50k+ AED/mo) while staying
 * above a Hootsuite seat. Weekly refresh is included — no per-topic run fee.
 */
export const SOLVO_CURRENCY = "aed" as const;
export const SOLVO_SETUP_AED = 6000;
export const SOLVO_INTERVAL = "month" as const;
export const SOLVO_MAX_TOPICS = 15;
export const SOLVO_PULSE_AED = 249;
export const SOLVO_INSIGHT_AED = 899;
export const SOLVO_PULSE_SAMPLE = 120;
export const SOLVO_INSIGHT_SAMPLE = 1000;

export type SolvoPlanId = "pulse" | "insight";

export type SolvoPlan = {
  id: SolvoPlanId;
  name: string;
  nameAr: string;
  monthlyAed: number;
  sampleSize: number;
  topics: number;
  refresh: string;
  refreshAr: string;
  humanHoursPerWeek: number;
  blurb: string;
  blurbAr: string;
  includes: readonly string[];
  includesAr: readonly string[];
};

export const SOLVO_PLANS: Record<SolvoPlanId, SolvoPlan> = {
  pulse: {
    id: "pulse",
    name: "Pulse",
    nameAr: "نبض",
    monthlyAed: SOLVO_PULSE_AED,
    sampleSize: SOLVO_PULSE_SAMPLE,
    topics: SOLVO_MAX_TOPICS,
    refresh: "Once a week",
    refreshAr: "مرة في الأسبوع",
    humanHoursPerWeek: 0,
    blurb: "Self-serve desk. 15 topics, weekly refresh, n=120. No human support.",
    blurbAr: "مكتب ذاتي. 15 موضوعاً، تحديث أسبوعي، عيّنة 120. بلا دعم بشري.",
    includes: [
      "15 topics (catalog and/or your names)",
      "Weekly public-X sample, n=120 per topic",
      "Overview + Research on your live URL",
      "No analyst hour — dashboard only",
    ],
    includesAr: [
      "15 موضوعاً (من الكتالوج أو بأسمائك)",
      "عيّنة أسبوعية من إكس العام، 120 لكل موضوع",
      "نظرة عامة + بحث على رابطك الحي",
      "بلا ساعة محلل — اللوحة فقط",
    ],
  },
  insight: {
    id: "insight",
    name: "Insight",
    nameAr: "رؤية",
    monthlyAed: SOLVO_INSIGHT_AED,
    sampleSize: SOLVO_INSIGHT_SAMPLE,
    topics: SOLVO_MAX_TOPICS,
    refresh: "Once a week",
    refreshAr: "مرة في الأسبوع",
    humanHoursPerWeek: 1,
    blurb: "Same 15 topics, n=1000, plus 1 hour/week human analyze-and-rework.",
    blurbAr: "نفس الـ 15 موضوعاً، عيّنة 1000، مع ساعة أسبوعياً لتحليل وإعادة صياغة.",
    includes: [
      "Everything in Pulse",
      "Sample n=1000 per topic (vs 120) — not priced at 8×",
      "1 hour / week human support: analyze the week and rework topic framing",
      "Still a fraction of Ipsos/Nielsen or Meltwater retainers",
    ],
    includesAr: [
      "كل ما في نبض",
      "عيّنة 1000 لكل موضوع (بدل 120) — ليست بسعر ×8",
      "ساعة أسبوعياً: تحليل الأسبوع وإعادة صياغة المواضيع",
      "ما زال أقل بكثير من إيبسوس/نيلسن أو ملت ووتر",
    ],
  },
};

export function solvoPlan(id: string | null | undefined): SolvoPlan {
  return id === "insight" ? SOLVO_PLANS.insight : SOLVO_PLANS.pulse;
}

export function formatAed(amount: number): string {
  return `AED ${amount.toLocaleString("en-AE")}`;
}

export function solvoSetupFils(): number {
  return SOLVO_SETUP_AED * 100;
}

export function solvoMonthlyFils(plan: SolvoPlanId): number {
  return SOLVO_PLANS[plan].monthlyAed * 100;
}

/** Owner walkthrough — not a paid tenant. Token is 16+ chars for studio API. */
export const DESK_DEMO_TOKEN = "desk-demo-walkthrough";
export const DESK_DEMO_SLUG = "acme-research";
export const DESK_DEMO_ORG = "Acme Research";

export const UAE_DEMO_TOKEN = "uae-demo-walkthrough";
export const UAE_DEMO_SLUG = "uae-prototype";
export const UAE_DEMO_ORG = "Solvo Creations";

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
  logo_url?: string | null;
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
    topic_ids: [...UAE_CITIZEN_CATALOG_IDS],
    custom_topics: [...UAE_CITIZEN_CUSTOM_TOPICS],
    primary_color: "#1E4ED8",
    accent_color: "#E8B923",
    logo_url: "/brand/solvo-logo.png",
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
