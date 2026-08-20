/**
 * Stripe Checkout helpers — monthly plans (Starter / Plus / Mega).
 * Guest Research Desk checkout stays in /api/research/checkout (unchanged).
 *
 * Test vs Live: Pro packs today use Test Price IDs. Prefer STRIPE_SECRET_KEY_TEST
 * (sk_test_…) when set alongside a live STRIPE_SECRET_KEY.
 */
import {
  MONTHLY_PLANS,
  getStripePriceId,
  isKnownTestPriceId,
  resolveStripeSecret,
  type MonthlyPlanId,
} from "./catalog";

export function siteOrigin(request: Request): string {
  const env = process.env.SITE_URL?.trim() || process.env.VITE_SITE_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  if (host) return `${proto}://${host}`;
  return "https://elenchos.live";
}

export function stripeSecret(): string | null {
  return resolveStripeSecret().secret;
}

async function createSession(
  params: URLSearchParams,
  secret: string,
): Promise<{ ok: true; id: string; url: string } | { ok: false; message: string }> {
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  const data = (await res.json()) as {
    id?: string;
    url?: string;
    error?: { message?: string };
  };
  if (!res.ok || !data.url || !data.id) {
    return { ok: false, message: data.error?.message || "Checkout failed" };
  }
  return { ok: true, id: data.id, url: data.url };
}

/** Subscribe to Starter / Plus / Mega (monthly recurring). */
export async function createMonthlyPlanCheckout(opts: {
  request: Request;
  userId: string;
  email: string | null;
  planId: MonthlyPlanId;
  customerId?: string | null;
}): Promise<{ ok: true; url: string; sessionId: string } | { ok: false; message: string }> {
  const plan = MONTHLY_PLANS[opts.planId];
  const resolved = resolveStripeSecret();
  if (!resolved.secret) {
    return {
      ok: false,
      message:
        "Stripe is not configured. Set STRIPE_SECRET_KEY_TEST=sk_test_… (preferred) or STRIPE_SECRET_KEY on Vercel, then Redeploy.",
    };
  }

  // Always resolve a pack price (env or built-in Test IDs). Never return "Missing PRICE"
  // for Starter/Plus/Mega — those IDs are known. Live/test mismatch is checked next.
  const priceId = getStripePriceId(plan.envPriceKey, { allowTestFallback: true });
  if (!priceId) {
    return {
      ok: false,
      message: `Missing ${plan.envPriceKey} — set the Stripe Price id in Vercel env.`,
    };
  }

  if (resolved.mode === "live" && isKnownTestPriceId(priceId)) {
    return {
      ok: false,
      message:
        "Stripe mode mismatch: Production is using sk_live_ (from STRIPE_SECRET_KEY) but pack prices are Test. Fastest fix: in Vercel → Environment Variables → edit STRIPE_SECRET_KEY → paste your sk_test_… secret → Production checked → Save → Redeploy. (STRIPE_SECRET_KEY_TEST is optional if STRIPE_SECRET_KEY itself is sk_test_.)",
    };
  }

  const origin = siteOrigin(opts.request);
  const params = new URLSearchParams();
  params.set("mode", "subscription");
  params.set(
    "success_url",
    `${origin}/pro?billing=success&kind=plan&plan=${opts.planId}`,
  );
  params.set("cancel_url", `${origin}/pro?billing=cancelled`);
  params.set("client_reference_id", opts.userId);
  params.set("metadata[kind]", "monthly_plan");
  params.set("metadata[userId]", opts.userId);
  params.set("metadata[planId]", opts.planId);
  params.set("metadata[tokensGranted]", String(plan.tokensGranted));
  // legacy aliases so older webhook branches still work
  params.set("metadata[packId]", opts.planId);
  params.set("metadata[tokens]", String(plan.tokensGranted));
  params.set("subscription_data[metadata][userId]", opts.userId);
  params.set("subscription_data[metadata][planId]", opts.planId);
  params.set(
    "subscription_data[metadata][tokensGranted]",
    String(plan.tokensGranted),
  );
  params.set("line_items[0][price]", priceId);
  params.set("line_items[0][quantity]", "1");
  params.set("payment_method_types[0]", "card");
  params.set("allow_promotion_codes", "true");
  if (opts.customerId) {
    params.set("customer", opts.customerId);
  } else if (opts.email) {
    params.set("customer_email", opts.email);
  }

  const session = await createSession(params, resolved.secret);
  if (!session.ok) {
    // Soften Stripe's raw mode-mismatch into an actionable message
    if (/test mode|live mode/i.test(session.message)) {
      return {
        ok: false,
        message:
          "Stripe mode mismatch (live key + test prices). Add STRIPE_SECRET_KEY_TEST with your sk_test_… key in Vercel Production env, Redeploy, then retry.",
      };
    }
    return session;
  }
  return { ok: true, url: session.url, sessionId: session.id };
}
