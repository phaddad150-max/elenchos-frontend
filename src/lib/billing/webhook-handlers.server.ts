/**
 * Stripe event handlers for monthly plans (Starter / Plus / Mega).
 * DATA PROTECTION: only billing tables (subscriptions / token_*). No intelligence writes.
 */
import {
  MONTHLY_PLANS,
  isMonthlyPlanId,
  planTokensGranted,
} from "./catalog";
import {
  creditTokens,
  findUserIdByStripeCustomer,
  upsertSubscription,
} from "./tokens.server";

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function resolveGrant(meta: Record<string, string>): {
  planId: string;
  tokens: number;
} {
  const planId =
    asString(meta.planId) ||
    asString(meta.packId) ||
    "pack_starter";
  const fromMeta =
    Number(meta.tokensGranted) ||
    Number(meta.tokens) ||
    0;
  const tokens =
    fromMeta > 0 ? fromMeta : planTokensGranted(planId) || 0;
  return { planId, tokens };
}

export async function handleBillingCheckoutCompleted(session: {
  id?: string;
  mode?: string;
  metadata?: Record<string, string>;
  customer?: string | { id?: string } | null;
  subscription?: string | { id?: string } | null;
  payment_status?: string;
}): Promise<{ handled: boolean; detail?: string }> {
  const meta = session.metadata || {};
  const kind = asString(meta.kind);
  // Accept monthly_plan + legacy aliases from earlier drafts
  if (
    kind !== "monthly_plan" &&
    kind !== "token_pack" &&
    kind !== "pro_subscription"
  ) {
    return { handled: false };
  }
  if (session.payment_status === "unpaid") {
    return { handled: true, detail: "unpaid" };
  }

  const userId = asString(meta.userId);
  if (!userId) return { handled: true, detail: "missing userId" };

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id || null;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id || null;

  const { planId, tokens } = resolveGrant(meta);
  if (tokens <= 0) return { handled: true, detail: "bad plan tokens" };

  await upsertSubscription({
    userId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    status: "active",
    planId: isMonthlyPlanId(planId) ? planId : planId,
  });

  const credited = await creditTokens({
    userId,
    delta: tokens,
    reason: "sub_grant",
    refType: "stripe_session",
    refId: session.id || null,
    metadata: { kind, planId },
  });

  return {
    handled: true,
    detail: credited.ok
      ? `plan=${planId}+${tokens} balance=${credited.balance}`
      : `plan-fail:${credited.error}`,
  };
}

export async function handleInvoicePaid(invoice: {
  id?: string;
  billing_reason?: string;
  customer?: string | null;
  subscription?: string | null;
  lines?: { data?: Array<{ period?: { end?: number } }> };
  subscription_details?: { metadata?: Record<string, string> };
  parent?: {
    subscription_details?: { metadata?: Record<string, string> };
  };
}): Promise<{ handled: boolean; detail?: string }> {
  // First invoice already granted on checkout.session.completed
  if (invoice.billing_reason === "subscription_create") {
    return { handled: true, detail: "skip-first-invoice" };
  }

  const customerId = asString(invoice.customer);
  const subscriptionId = asString(invoice.subscription);
  if (!customerId && !subscriptionId) {
    return { handled: false };
  }

  const userId = customerId
    ? await findUserIdByStripeCustomer(customerId)
    : null;
  if (!userId) {
    return { handled: true, detail: "no-user-for-customer" };
  }

  // Prefer subscription metadata; fall back to our subscriptions.plan_id via upsert path
  const subMeta =
    invoice.subscription_details?.metadata ||
    invoice.parent?.subscription_details?.metadata ||
    {};
  let planId = asString(subMeta.planId) || asString(subMeta.packId);
  let tokens =
    Number(subMeta.tokensGranted) ||
    Number(subMeta.tokens) ||
    0;

  if (!planId || tokens <= 0) {
    // Look up plan from our mirror table
    const { getSubscription } = await import("./tokens.server");
    const sub = await getSubscription(userId);
    planId = planId || sub?.plan_id || "pack_starter";
    tokens = tokens > 0 ? tokens : planTokensGranted(planId);
  }

  if (tokens <= 0 && isMonthlyPlanId(planId)) {
    tokens = MONTHLY_PLANS[planId].tokensGranted;
  }
  if (tokens <= 0) {
    return { handled: true, detail: "no-token-grant" };
  }

  const periodEndUnix = invoice.lines?.data?.[0]?.period?.end;
  const periodEnd = periodEndUnix
    ? new Date(periodEndUnix * 1000).toISOString()
    : null;

  await upsertSubscription({
    userId,
    stripeCustomerId: customerId || null,
    stripeSubscriptionId: subscriptionId || null,
    status: "active",
    planId,
    currentPeriodEnd: periodEnd,
  });

  const credited = await creditTokens({
    userId,
    delta: tokens,
    reason: "sub_grant",
    refType: "stripe_invoice",
    refId: invoice.id || null,
    metadata: {
      billing_reason: invoice.billing_reason || null,
      planId,
    },
  });

  return {
    handled: true,
    detail: credited.ok
      ? `renew+${tokens} plan=${planId}`
      : `renew-fail:${credited.error}`,
  };
}

export async function handleSubscriptionUpdated(sub: {
  id?: string;
  customer?: string | null;
  status?: string;
  metadata?: Record<string, string>;
  current_period_end?: number;
}): Promise<{ handled: boolean; detail?: string }> {
  const meta = sub.metadata || {};
  let userId = asString(meta.userId);
  const customerId = asString(sub.customer);
  if (!userId && customerId) {
    userId = (await findUserIdByStripeCustomer(customerId)) || "";
  }
  if (!userId) return { handled: true, detail: "no-user" };

  const statusMap: Record<string, string> = {
    active: "active",
    trialing: "trialing",
    past_due: "past_due",
    canceled: "canceled",
    unpaid: "unpaid",
    incomplete: "inactive",
    incomplete_expired: "canceled",
    paused: "inactive",
  };
  const status = statusMap[asString(sub.status)] || "inactive";
  const periodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000).toISOString()
    : null;
  const planId =
    asString(meta.planId) || asString(meta.packId) || "pack_starter";

  await upsertSubscription({
    userId,
    stripeCustomerId: customerId || null,
    stripeSubscriptionId: sub.id || null,
    status,
    planId,
    currentPeriodEnd: periodEnd,
  });

  return { handled: true, detail: `sub=${status} plan=${planId}` };
}
