/**
 * Charge sample runs to the tenant's saved card.
 * Elenchos does not absorb X/sample cost.
 */
import { DESK_CURRENCY, DESK_DEMO_SEEDS, deskRunCents } from "./catalog";
import { recordDeskRun, type DeskTenant } from "./store.server";

function stripeSecret(): string {
  return process.env.STRIPE_SECRET_KEY?.trim() || "";
}

async function stripePost<T>(path: string, params: URLSearchParams): Promise<T> {
  const secret = stripeSecret();
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  const data = (await res.json()) as T & { error?: { message?: string } };
  if (!res.ok) {
    throw new Error(data.error?.message || `Stripe ${path} failed`);
  }
  return data;
}

export async function chargeDeskRun(opts: {
  tenant: DeskTenant;
  topicCount: number;
}): Promise<{ charged: boolean; amountCents: number; invoiceId: string | null; demo: boolean }> {
  const amountCents = deskRunCents(opts.topicCount);
  const demo = DESK_DEMO_SEEDS.some((d) => d.id === opts.tenant.id);
  if (demo || amountCents <= 0) {
    await recordDeskRun({
      tenantId: opts.tenant.id,
      topicCount: opts.topicCount,
      amountCents: 0,
      invoiceId: null,
    });
    return { charged: false, amountCents: 0, invoiceId: null, demo: true };
  }
  const customer = opts.tenant.stripe_customer_id;
  if (!customer) {
    throw new Error("No card on file. Complete checkout first so runs bill your card.");
  }
  if (!stripeSecret()) {
    throw new Error("Stripe is not configured.");
  }

  const item = new URLSearchParams();
  item.set("customer", customer);
  item.set("amount", String(amountCents));
  item.set("currency", DESK_CURRENCY);
  item.set(
    "description",
    `Desk sample run · ${opts.topicCount} topic${opts.topicCount === 1 ? "" : "s"}`,
  );
  await stripePost("invoiceitems", item);

  const inv = new URLSearchParams();
  inv.set("customer", customer);
  inv.set("auto_advance", "true");
  inv.set("collection_method", "charge_automatically");
  inv.set("metadata[kind]", "desk_run");
  inv.set("metadata[tenantId]", opts.tenant.id);
  const invoice = await stripePost<{ id?: string }>("invoices", inv);
  if (invoice.id) {
    await stripePost(`invoices/${invoice.id}/pay`, new URLSearchParams());
  }

  await recordDeskRun({
    tenantId: opts.tenant.id,
    topicCount: opts.topicCount,
    amountCents,
    invoiceId: invoice.id ?? null,
  });

  return { charged: true, amountCents, invoiceId: invoice.id ?? null, demo: false };
}
