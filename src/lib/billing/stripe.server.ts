/**
 * Stripe Checkout helpers — monthly plans (Starter / Plus / Mega).
 * Guest Research Desk checkout stays in /api/research/checkout (unchanged).
 */
import {
  MONTHLY_PLANS,
  getStripePriceId,
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
  return process.env.STRIPE_SECRET_KEY?.trim() || null;
}

async function createSession(
  params: URLSearchParams,
): Promise<{ ok: true; id: string; url: string } | { ok: false; message: string }> {
  const secret = stripeSecret();
  if (!secret) return { ok: false, message: "Stripe is not configured" };

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
  const priceId = getStripePriceId(plan.envPriceKey);
  if (!priceId) {
    return {
      ok: false,
      message: `Missing ${plan.envPriceKey} — set the Stripe Price id in Vercel env.`,
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

  const session = await createSession(params);
  if (!session.ok) return session;
  return { ok: true, url: session.url, sessionId: session.id };
}
