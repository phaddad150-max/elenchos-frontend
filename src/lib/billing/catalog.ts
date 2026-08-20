/**
 * Stripe catalog — monthly plans only (v1).
 * Guest Research Desk USD packages stay in research-desk/packages.ts.
 *
 * Live Stripe prices (set in Vercel):
 *   STRIPE_PRICE_PACK_STARTER  → $10/mo · 10 tokens/period
 *   STRIPE_PRICE_PACK_PLUS     → $40/mo · 50 tokens/period
 *   STRIPE_PRICE_PACK_MEGA     → $90/mo · 120 tokens/period
 *
 * Pro $29 one-tier + one-time packs: deferred until those Prices exist.
 * Token unit ≈ $1 USD retail face value.
 */

export type MonthlyPlanId = "pack_starter" | "pack_plus" | "pack_mega";

/** @deprecated alias — same as MonthlyPlanId (env keys kept for Stripe). */
export type TokenPackId = MonthlyPlanId;

export type PrivateRunKind = "topic-analysis" | "deep-no-x" | "deep-with-x";

/** Provisional token debits — match guest desk retail ($10 / $10 / $20). */
export const TOKEN_COSTS: Record<PrivateRunKind, number> = {
  "topic-analysis": 10, // T1 — capped X + Grok; est. COGS ~$1–3
  "deep-no-x": 10, // T2 — Grok multi-source; est. COGS ~$0.5–2
  "deep-with-x": 20, // T3 — deep + X; est. COGS ~$1–4
};

export type MonthlyPlanMeta = {
  id: MonthlyPlanId;
  title: string;
  priceUsd: number;
  /** Tokens credited each billing period */
  tokensGranted: number;
  interval: "month";
  blurb: string;
  envPriceKey:
    | "STRIPE_PRICE_PACK_STARTER"
    | "STRIPE_PRICE_PACK_PLUS"
    | "STRIPE_PRICE_PACK_MEGA";
};

/** Three paid options live on Stripe today — all monthly. */
export const MONTHLY_PLANS: Record<MonthlyPlanId, MonthlyPlanMeta> = {
  pack_starter: {
    id: "pack_starter",
    title: "Starter",
    priceUsd: 10,
    tokensGranted: 10,
    interval: "month",
    blurb: "10 tokens each month — one topic analysis or deep dive (no X).",
    envPriceKey: "STRIPE_PRICE_PACK_STARTER",
  },
  pack_plus: {
    id: "pack_plus",
    title: "Plus",
    priceUsd: 40,
    tokensGranted: 50,
    interval: "month",
    blurb: "50 tokens each month (~20% better than $1/token).",
    envPriceKey: "STRIPE_PRICE_PACK_PLUS",
  },
  pack_mega: {
    id: "pack_mega",
    title: "Mega",
    priceUsd: 90,
    tokensGranted: 120,
    interval: "month",
    blurb: "120 tokens each month — best for regular private research.",
    envPriceKey: "STRIPE_PRICE_PACK_MEGA",
  },
};

export const MONTHLY_PLAN_ORDER: MonthlyPlanId[] = [
  "pack_starter",
  "pack_plus",
  "pack_mega",
];

/** Back-compat aliases used by older checkout code. */
export const TOKEN_PACKS = MONTHLY_PLANS;
export const TOKEN_PACK_ORDER = MONTHLY_PLAN_ORDER;

export function isMonthlyPlanId(v: string): v is MonthlyPlanId {
  return v === "pack_starter" || v === "pack_plus" || v === "pack_mega";
}

export const isTokenPackId = isMonthlyPlanId;

/** Deferred — not on Stripe yet. Kept for future enablement. */
export const PRO_PLAN_ENABLED = false;

export const PRO_PLAN = {
  id: "pro_monthly" as const,
  title: "Elenchos Pro",
  priceUsd: 29,
  tokensGranted: 40,
  interval: "month" as const,
  blurb: "Deferred — use Starter / Plus / Mega monthly plans for now.",
  envPriceKey: "STRIPE_PRICE_PRO_MONTHLY" as const,
};

export const STRIPE_SETUP_CHECKLIST = [
  "Monthly Starter $10 → STRIPE_PRICE_PACK_STARTER (metadata tokens=10, plan_id=pack_starter)",
  "Monthly Plus $40 → STRIPE_PRICE_PACK_PLUS (metadata tokens=50, plan_id=pack_plus)",
  "Monthly Mega $90 → STRIPE_PRICE_PACK_MEGA (metadata tokens=120, plan_id=pack_mega)",
  "Webhook: https://elenchos.live/api/research/webhook",
  "Events: checkout.session.completed, invoice.paid, customer.subscription.updated, customer.subscription.deleted",
] as const;

/**
 * Stripe Test-mode Price IDs (Dashboard → Test mode → Products).
 * Used only when the active secret is sk_test_… (never with sk_live_).
 */
export const STRIPE_TEST_PRICE_FALLBACKS: Record<
  | "STRIPE_PRICE_PACK_STARTER"
  | "STRIPE_PRICE_PACK_PLUS"
  | "STRIPE_PRICE_PACK_MEGA",
  string
> = {
  STRIPE_PRICE_PACK_STARTER: "price_1U62rN2EYDynfsPbGBfZED8c",
  STRIPE_PRICE_PACK_PLUS: "price_1U62u62EYDynfsPbCXLtpn39",
  STRIPE_PRICE_PACK_MEGA: "price_1U62vt2EYDynfsPbFsNiomxK",
};

const KNOWN_TEST_PRICE_IDS = new Set(Object.values(STRIPE_TEST_PRICE_FALLBACKS));

/** Dynamic env read — avoids Vite build-time inlining of process.env.FOO → undefined. */
export function readProcessEnv(key: string): string | null {
  try {
    const env =
      (typeof globalThis !== "undefined" &&
        (globalThis as { process?: { env?: NodeJS.ProcessEnv } }).process?.env) ||
      process.env;
    const v = env?.[key];
    if (typeof v !== "string") return null;
    const t = v.trim();
    return t.length > 0 ? t : null;
  } catch {
    return null;
  }
}

/**
 * Prefer dedicated test secret when present (Pro packs are Test prices today).
 * Order: STRIPE_SECRET_KEY_TEST → STRIPE_TEST_SECRET_KEY → STRIPE_SECRET_KEY
 */
export function resolveStripeSecret(): {
  secret: string | null;
  mode: "test" | "live" | "unknown" | "missing";
  source: string | null;
} {
  const candidates: Array<{ key: string; preferTest: boolean }> = [
    { key: "STRIPE_SECRET_KEY_TEST", preferTest: true },
    { key: "STRIPE_TEST_SECRET_KEY", preferTest: true },
    { key: "STRIPE_SECRET_KEY", preferTest: false },
  ];
  for (const c of candidates) {
    const v = readProcessEnv(c.key);
    if (!v) continue;
    if (v.startsWith("sk_test_")) {
      return { secret: v, mode: "test", source: c.key };
    }
    if (v.startsWith("sk_live_")) {
      // Skip non-sk_test values on dedicated test slots.
      if (c.preferTest) continue;
      return { secret: v, mode: "live", source: c.key };
    }
    return { secret: v, mode: "unknown", source: c.key };
  }

  // Last resort: any STRIPE*SECRET* env whose value is sk_test_ (catches naming typos).
  try {
    const env =
      (globalThis as { process?: { env?: NodeJS.ProcessEnv } }).process?.env ||
      process.env;
    for (const [k, raw] of Object.entries(env ?? {})) {
      if (!/stripe/i.test(k) || !/secret/i.test(k)) continue;
      const v = typeof raw === "string" ? raw.trim() : "";
      if (v.startsWith("sk_test_")) {
        return { secret: v, mode: "test", source: k };
      }
    }
  } catch {
    /* ignore */
  }

  return { secret: null, mode: "missing", source: null };
}

export function getStripePriceId(
  envKey: string,
  opts?: { allowTestFallback?: boolean },
): string | null {
  const allowTestFallback = opts?.allowTestFallback !== false;
  const candidates = [envKey, `VITE_${envKey}`, envKey.replace(/^STRIPE_/, "VITE_STRIPE_")];
  for (const key of candidates) {
    const v = readProcessEnv(key);
    if (v) return v;
  }
  if (!allowTestFallback) return null;
  return (
    STRIPE_TEST_PRICE_FALLBACKS[
      envKey as keyof typeof STRIPE_TEST_PRICE_FALLBACKS
    ] ?? null
  );
}

export function isKnownTestPriceId(priceId: string): boolean {
  return KNOWN_TEST_PRICE_IDS.has(priceId);
}

/** Debug helper for checkout errors (booleans / mode only — never echo secrets). */
export function stripeEnvPresence(): Record<string, boolean | string | null> {
  const resolved = resolveStripeSecret();
  return {
    STRIPE_SECRET_KEY: Boolean(readProcessEnv("STRIPE_SECRET_KEY")),
    STRIPE_SECRET_KEY_TEST: Boolean(readProcessEnv("STRIPE_SECRET_KEY_TEST")),
    STRIPE_PRICE_PACK_STARTER: Boolean(readProcessEnv("STRIPE_PRICE_PACK_STARTER")),
    STRIPE_PRICE_PACK_PLUS: Boolean(readProcessEnv("STRIPE_PRICE_PACK_PLUS")),
    STRIPE_PRICE_PACK_MEGA: Boolean(readProcessEnv("STRIPE_PRICE_PACK_MEGA")),
    secret_mode: resolved.mode,
    secret_source: resolved.source,
    using_starter_fallback: !readProcessEnv("STRIPE_PRICE_PACK_STARTER"),
  };
}

export function planTokensGranted(planId: string): number {
  if (isMonthlyPlanId(planId)) return MONTHLY_PLANS[planId].tokensGranted;
  return 0;
}
