/**
 * Billing token helpers (service role).
 * DATA PROTECTION: only touches subscriptions / token_balances / token_ledger.
 * Never writes intelligence tables or mutates historical research_desk_reports rows.
 */
import { MONTHLY_PLANS, isMonthlyPlanId, type MonthlyPlanId } from "./catalog";

function supabaseConfig() {
  const url =
    process.env.SUPABASE_URL?.trim() ||
    process.env.VITE_SUPABASE_URL?.trim() ||
    "https://jacbalsongvqvaqlfsbx.supabase.co";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_KEY?.trim() ||
    "";
  return { url, key };
}

async function rest<T>(
  path: string,
  init: RequestInit & { prefer?: string } = {},
): Promise<{ ok: boolean; status: number; data: T | null; text: string }> {
  const { url, key } = supabaseConfig();
  if (!key) {
    return { ok: false, status: 503, data: null, text: "missing service role" };
  }
  const headers: Record<string, string> = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    ...(init.prefer ? { Prefer: init.prefer } : {}),
  };
  const res = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers as Record<string, string> | undefined) },
  });
  const text = await res.text().catch(() => "");
  let data: T | null = null;
  if (text) {
    try {
      data = JSON.parse(text) as T;
    } catch {
      data = null;
    }
  }
  return { ok: res.ok, status: res.status, data, text };
}

async function rpc<T>(
  fn: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; data: T | null; text: string }> {
  const { url, key } = supabaseConfig();
  if (!key) {
    return { ok: false, data: null, text: "missing service role" };
  }
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text().catch(() => "");
  let data: T | null = null;
  if (text) {
    try {
      data = JSON.parse(text) as T;
    } catch {
      data = null;
    }
  }
  return { ok: res.ok, data, text };
}

/** Idempotency: true if this Stripe ref was already ledgered. */
export async function ledgerHasRef(
  userId: string,
  refType: string,
  refId: string,
): Promise<boolean> {
  const q = new URLSearchParams({
    select: "id",
    user_id: `eq.${userId}`,
    ref_type: `eq.${refType}`,
    ref_id: `eq.${refId}`,
    limit: "1",
  });
  const { ok, data } = await rest<unknown[]>(`token_ledger?${q}`);
  return ok && Array.isArray(data) && data.length > 0;
}

export async function debitTokens(opts: {
  userId: string;
  amount: number;
  reason?: "private_run";
  refType?: string | null;
  refId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<{ ok: boolean; balance: number | null; error?: string }> {
  const { ok, data, text } = await rpc<number>("debit_tokens", {
    p_user_id: opts.userId,
    p_amount: opts.amount,
    p_reason: opts.reason ?? "private_run",
    p_ref_type: opts.refType ?? null,
    p_ref_id: opts.refId ?? null,
    p_metadata: opts.metadata ?? {},
  });
  if (!ok) {
    const insufficient = /insufficient/i.test(text);
    console.error("[billing] debit_tokens failed", text.slice(0, 300));
    return {
      ok: false,
      balance: null,
      error: insufficient ? "insufficient_balance" : text.slice(0, 200),
    };
  }
  return { ok: true, balance: typeof data === "number" ? data : null };
}

export async function creditTokens(opts: {
  userId: string;
  delta: number;
  reason: "pack_purchase" | "sub_grant" | "refund" | "adjust";
  refType?: string | null;
  refId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<{ ok: boolean; balance: number | null; error?: string }> {
  if (opts.refType && opts.refId) {
    const dup = await ledgerHasRef(opts.userId, opts.refType, opts.refId);
    if (dup) {
      const bal = await getTokenBalance(opts.userId);
      return { ok: true, balance: bal, error: "already-credited" };
    }
  }
  const { ok, data, text } = await rpc<number>("credit_tokens", {
    p_user_id: opts.userId,
    p_delta: opts.delta,
    p_reason: opts.reason,
    p_ref_type: opts.refType ?? null,
    p_ref_id: opts.refId ?? null,
    p_metadata: opts.metadata ?? {},
  });
  if (!ok) {
    console.error("[billing] credit_tokens failed", text.slice(0, 300));
    return { ok: false, balance: null, error: text.slice(0, 200) };
  }
  return { ok: true, balance: typeof data === "number" ? data : null };
}

export async function getTokenBalance(userId: string): Promise<number> {
  const q = new URLSearchParams({
    select: "balance",
    user_id: `eq.${userId}`,
    limit: "1",
  });
  const { ok, data } = await rest<{ balance: number }[]>(`token_balances?${q}`);
  if (!ok || !Array.isArray(data) || !data[0]) return 0;
  return Number(data[0].balance) || 0;
}

export type SubscriptionRow = {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  plan_id: string;
  current_period_end: string | null;
};

export async function getSubscription(userId: string): Promise<SubscriptionRow | null> {
  const q = new URLSearchParams({
    select: "*",
    user_id: `eq.${userId}`,
    order: "updated_at.desc",
    limit: "1",
  });
  const { ok, data } = await rest<SubscriptionRow[]>(`subscriptions?${q}`);
  if (!ok || !Array.isArray(data) || !data[0]) return null;
  return data[0];
}

export async function upsertSubscription(opts: {
  userId: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  status: string;
  planId?: string;
  currentPeriodEnd?: string | null;
}): Promise<boolean> {
  const existing = await getSubscription(opts.userId);
  const now = new Date().toISOString();
  const row = {
    user_id: opts.userId,
    stripe_customer_id: opts.stripeCustomerId ?? existing?.stripe_customer_id ?? null,
    stripe_subscription_id:
      opts.stripeSubscriptionId ?? existing?.stripe_subscription_id ?? null,
    status: opts.status,
    plan_id: opts.planId ?? "pack_starter",
    current_period_end: opts.currentPeriodEnd ?? existing?.current_period_end ?? null,
    updated_at: now,
  };

  if (existing?.id) {
    const { ok, text } = await rest(`subscriptions?id=eq.${existing.id}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: JSON.stringify(row),
    });
    if (!ok) console.error("[billing] subscription patch failed", text.slice(0, 300));
    return ok;
  }

  const { ok, text } = await rest("subscriptions", {
    method: "POST",
    prefer: "return=minimal",
    body: JSON.stringify({ ...row, created_at: now }),
  });
  if (!ok) console.error("[billing] subscription insert failed", text.slice(0, 300));
  return ok;
}

export async function findUserIdByStripeCustomer(
  customerId: string,
): Promise<string | null> {
  const q = new URLSearchParams({
    select: "user_id",
    stripe_customer_id: `eq.${customerId}`,
    limit: "1",
  });
  const { ok, data } = await rest<{ user_id: string }[]>(`subscriptions?${q}`);
  if (!ok || !Array.isArray(data) || !data[0]) return null;
  return data[0].user_id;
}

export function packTokens(planId: string): number | null {
  if (!isMonthlyPlanId(planId)) return null;
  return MONTHLY_PLANS[planId as MonthlyPlanId].tokensGranted;
}
