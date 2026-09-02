/**
 * Desk tenants — app/billing state.
 * Isolated from public intelligence tables. Scoring pipelines never write here.
 */
import { LIVE_TOPIC_KEYS, isArchivedTopicId } from "@/lib/topic-catalog";
import {
  DESK_DEMO_SEEDS,
  DESK_MAX_TOPICS,
  SOLVO_PUBLIC_BASE,
  UAE_DEMO_SLUG,
  demoSeedBySlug,
  demoSeedByToken,
  PUBLICEYE_PUBLIC_BASE,
  isPubliceyeDemoSlug,
  isPubliceyeDeskEmail,
  isUaeDemoSlug,
  isUaeWalkthroughSlug,
  solvoPlan,
  type DeskDemoSeed,
  type SolvoPlanId,
} from "./catalog";
import type { DeskBranding, DeskCard, DeskPicks, DeskTenant } from "./types";
import { simulateDeskCards } from "./solvo-sim";

export type { DeskBranding, DeskCard, DeskPicks, DeskStatus, DeskTenant, LiveDesk } from "./types";

const memTenants: DeskTenant[] = [];
const memBrand = new Map<string, DeskBranding>();
const memPicks = new Map<string, DeskPicks>();
const memCards = new Map<string, DeskCard[]>();

function tenantFromSeed(seed: DeskDemoSeed): DeskTenant {
  return {
    id: seed.id,
    manage_token: seed.token,
    slug: seed.slug,
    email: seed.email,
    org_name: memBrand.get(seed.id)?.org_name || seed.org,
    stripe_session_id: `cs_demo_${seed.slug}`,
    stripe_customer_id: null,
    status: "live",
    custom_domain: null,
    created_at: "2026-08-29T00:00:00.000Z",
    paid_at: "2026-08-29T00:00:00.000Z",
  };
}

function seedDemoMem(): void {
  for (const seed of DESK_DEMO_SEEDS) {
    if (!memTenants.some((t) => t.id === seed.id)) memTenants.push(tenantFromSeed(seed));
    memBrand.set(seed.id, {
      tenant_id: seed.id,
      org_name: seed.org,
      unbranded: false,
      logo_url: seed.logo_url ?? null,
      primary_color: seed.primary_color,
      accent_color: seed.accent_color,
    });
    if (!memPicks.has(seed.id)) {
      memPicks.set(seed.id, {
        tenant_id: seed.id,
        topic_ids: seed.topic_ids,
        custom_topics: seed.custom_topics,
      });
    }
  }
}

seedDemoMem();

type TableSet = {
  tenants: string;
  branding: string;
  picks: string;
  snapshots: string;
  runs: string;
};

const DESK_TABLES: TableSet = {
  tenants: "desk_tenants",
  branding: "desk_branding",
  picks: "desk_picks",
  snapshots: "desk_topic_snapshots",
  runs: "desk_runs",
};

const SOLVO_TABLES: TableSet = {
  tenants: "solvo_tenants",
  branding: "solvo_branding",
  picks: "solvo_picks",
  snapshots: "solvo_topic_snapshots",
  runs: "solvo_runs",
};

const solvoIdSet = new Set<string>(
  DESK_DEMO_SEEDS.filter((d) => d.slug === UAE_DEMO_SLUG).map((d) => d.id),
);

function rememberSolvo(id: string) {
  solvoIdSet.add(id);
}

export function isSolvoTenantId(id: string): boolean {
  return solvoIdSet.has(id);
}

async function tablesForTenantId(id: string): Promise<TableSet> {
  if (solvoIdSet.has(id)) return SOLVO_TABLES;
  const solvo = await restGet<DeskTenant>(`solvo_tenants?id=eq.${encodeURIComponent(id)}&limit=1`);
  if (solvo[0]) {
    rememberSolvo(id);
    return SOLVO_TABLES;
  }
  return DESK_TABLES;
}

async function restGetTenant(query: string): Promise<DeskTenant | null> {
  const solvo = await restGet<DeskTenant>(`solvo_tenants?${query}`);
  if (solvo[0]) {
    rememberSolvo(solvo[0].id);
    return solvo[0];
  }
  const desk = await restGet<DeskTenant>(`desk_tenants?${query}`);
  return desk[0] ?? null;
}

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

function restHeaders(key: string, extra?: Record<string, string>) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

export function newManageToken(): string {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

export function slugify(raw: string): string {
  const s = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return s || "desk";
}

export async function createPendingTenant(input: {
  orgName: string;
  email: string;
  market: "uae" | "publiceye";
  plan: SolvoPlanId;
}): Promise<DeskTenant> {
  const now = new Date().toISOString();
  const plan = solvoPlan(input.plan);
  if (input.market === "uae") {
    throw new Error("Solvo desk checkout is closed on this prototype.");
  }
  if (input.market === "publiceye" && !isPubliceyeDeskEmail(input.email)) {
    throw new Error("BrandEye desk checkout is invitation-only.");
  }
  const row: DeskTenant = {
    id: crypto.randomUUID(),
    manage_token: newManageToken(),
    slug: null,
    email: input.email.trim().toLowerCase(),
    org_name: input.orgName.trim().slice(0, 80),
    stripe_session_id: null,
    stripe_customer_id: null,
    status: "pending",
    custom_domain: null,
    created_at: now,
    paid_at: null,
    market: input.market,
    plan: plan.id,
    sample_size: plan.sampleSize,
  };
  memTenants.push(row);
  rememberSolvo(row.id);
  const { url, key } = supabaseConfig();
  if (!key) {
    throw new Error(
      "Solvo storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY and run RUN_ME_solvo_tenants.sql.",
    );
  }
  {
    const res = await fetch(`${url}/rest/v1/solvo_tenants`, {
      method: "POST",
      headers: restHeaders(key, { Prefer: "return=minimal" }),
      body: JSON.stringify({
        ...row,
        currency: "aed",
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.error("[solvo] create pending failed", res.status, t.slice(0, 400));
      throw new Error("Could not create Solvo tables. Run RUN_ME_solvo_tenants.sql in Supabase.");
    }
    await fetch(`${url}/rest/v1/solvo_branding`, {
      method: "POST",
      headers: restHeaders(key, { Prefer: "return=minimal" }),
      body: JSON.stringify({
        tenant_id: row.id,
        org_name: row.org_name,
        unbranded: false,
        primary_color: "#1E4ED8",
        accent_color: "#E8B923",
      }),
    });
    await fetch(`${url}/rest/v1/solvo_picks`, {
      method: "POST",
      headers: restHeaders(key, { Prefer: "return=minimal" }),
      body: JSON.stringify({
        tenant_id: row.id,
        topic_ids: [],
        custom_topics: [],
      }),
    });
  }
  memBrand.set(row.id, {
    tenant_id: row.id,
    org_name: row.org_name,
    unbranded: false,
    logo_url: null,
    primary_color: "#1E4ED8",
    accent_color: "#E8B923",
  });
  memPicks.set(row.id, { tenant_id: row.id, topic_ids: [], custom_topics: [] });
  return row;
}

export async function attachStripeSession(
  id: string,
  sessionId: string,
  customerId?: string | null,
): Promise<void> {
  const t = memTenants.find((x) => x.id === id);
  if (t) {
    t.stripe_session_id = sessionId;
    if (customerId) t.stripe_customer_id = customerId;
  }
  const { url, key } = supabaseConfig();
  if (!key) return;
  const tables = await tablesForTenantId(id);
  const patch: Record<string, string> = { stripe_session_id: sessionId };
  if (customerId) patch.stripe_customer_id = customerId;
  await fetch(`${url}/rest/v1/${tables.tenants}?id=eq.${id}`, {
    method: "PATCH",
    headers: restHeaders(key, { Prefer: "return=minimal" }),
    body: JSON.stringify(patch),
  });
}

export async function markDeskPaid(opts: {
  tenantId?: string;
  sessionId?: string;
  customerId?: string;
}): Promise<DeskTenant | null> {
  const { url, key } = supabaseConfig();
  let tenant: DeskTenant | null = null;
  if (opts.tenantId) tenant = await getTenantById(opts.tenantId);
  if (!tenant && opts.sessionId) tenant = await getTenantBySession(opts.sessionId);
  if (!tenant) return null;
  const paid_at = new Date().toISOString();
  tenant.status = "paid";
  tenant.paid_at = paid_at;
  if (opts.sessionId) tenant.stripe_session_id = opts.sessionId;
  if (opts.customerId) tenant.stripe_customer_id = opts.customerId;
  if (key) {
    const tables = await tablesForTenantId(tenant.id);
    await fetch(`${url}/rest/v1/${tables.tenants}?id=eq.${tenant.id}`, {
      method: "PATCH",
      headers: restHeaders(key, { Prefer: "return=minimal" }),
      body: JSON.stringify({
        status: "paid",
        paid_at,
        stripe_session_id: tenant.stripe_session_id,
        stripe_customer_id: tenant.stripe_customer_id,
      }),
    });
  }
  return tenant;
}

async function restGet<T>(path: string): Promise<T[]> {
  const { url, key } = supabaseConfig();
  if (!key) return [];
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: restHeaders(key),
  });
  if (!res.ok) return [];
  const rows = (await res.json()) as T[];
  return Array.isArray(rows) ? rows : [];
}

async function buildCardsForPicks(picks: DeskPicks | undefined): Promise<DeskCard[]> {
  const cards: DeskCard[] = [];
  const { url, key } = supabaseConfig();
  const readKey =
    key ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.VITE_SUPABASE_ANON_KEY?.trim() ||
    "";
  for (const id of picks?.topic_ids ?? []) {
    const cfg = LIVE_TOPIC_KEYS[id];
    if (!cfg || isArchivedTopicId(id)) continue;
    let card: DeskCard = {
      topic_id: id,
      topic_name: cfg.headerLabel,
      headline: null,
      overall_sentiment: null,
      divergence_score: null,
      sample_size: 0,
      last_updated: null,
    };
    if (readKey) {
      const q = new URLSearchParams({
        select: "topic,last_updated,overall_sentiment,divergence_score,sample_size,narrative_summary",
        topic: `eq.${cfg.rootKey}`,
        order: "last_updated.desc",
        limit: "1",
      });
      const res = await fetch(`${url}/rest/v1/topic_snapshots?${q}`, {
        headers: restHeaders(readKey),
      });
      if (res.ok) {
        const rows = (await res.json()) as Array<{
          topic?: string;
          last_updated?: string;
          overall_sentiment?: { score?: number; label?: string };
          divergence_score?: number;
          sample_size?: number;
          narrative_summary?: string;
        }>;
        const r = rows[0];
        if (r) {
          card = {
            topic_id: id,
            topic_name: cfg.headerLabel,
            headline: r.narrative_summary?.slice(0, 180) ?? null,
            overall_sentiment: r.overall_sentiment ?? null,
            divergence_score: typeof r.divergence_score === "number" ? r.divergence_score : null,
            sample_size: typeof r.sample_size === "number" ? r.sample_size : 0,
            last_updated: r.last_updated ?? null,
          };
        }
      }
    }
    cards.push(card);
  }
  for (const custom of picks?.custom_topics ?? []) {
    cards.push({
      topic_id: `custom:${custom.slice(0, 40)}`,
      topic_name: custom.slice(0, 80),
      headline: null,
      overall_sentiment: null,
      divergence_score: null,
      sample_size: 0,
      last_updated: null,
    });
  }
  return cards;
}

export async function getTenantById(id: string): Promise<DeskTenant | null> {
  const mem = memTenants.find((t) => t.id === id);
  const row = await restGetTenant(`id=eq.${id}&limit=1`);
  return row ?? mem ?? null;
}

export async function getTenantByToken(token: string): Promise<DeskTenant | null> {
  const seed = demoSeedByToken(token);
  if (seed) {
    seedDemoMem();
    return memTenants.find((t) => t.id === seed.id) ?? tenantFromSeed(seed);
  }
  const mem = memTenants.find((t) => t.manage_token === token);
  const row = await restGetTenant(`manage_token=eq.${encodeURIComponent(token)}&limit=1`);
  return row ?? mem ?? null;
}

export async function getTenantBySession(sessionId: string): Promise<DeskTenant | null> {
  const mem = memTenants.find((t) => t.stripe_session_id === sessionId);
  const row = await restGetTenant(
    `stripe_session_id=eq.${encodeURIComponent(sessionId)}&limit=1`,
  );
  return row ?? mem ?? null;
}

export async function getLiveDesk(slug: string): Promise<{
  tenant: DeskTenant;
  branding: DeskBranding;
  picks: DeskPicks;
  cards: DeskCard[];
} | null> {
  const seed = demoSeedBySlug(slug);
  if (seed) {
    seedDemoMem();
    const tenant = memTenants.find((t) => t.id === seed.id) ?? tenantFromSeed(seed);
    tenant.status = "live";
    tenant.slug = seed.slug;
    const branding = memBrand.get(seed.id)!;
    const picks = memPicks.get(seed.id)!;
    let cards =
      isUaeWalkthroughSlug(seed.slug)
        ? simulateDeskCards(picks)
        : (memCards.get(seed.id) ?? []);
    if (!cards.length) {
      cards = await buildCardsForPicks(picks);
      memCards.set(seed.id, cards);
    }
    return { tenant, branding, picks, cards };
  }
  const tenant =
    (await restGetTenant(`slug=eq.${encodeURIComponent(slug)}&status=eq.live&limit=1`)) ??
    memTenants.find((t) => t.slug === slug && t.status === "live") ??
    null;
  if (!tenant) return null;
  const tables = await tablesForTenantId(tenant.id);
  const branding =
    (await restGet<DeskBranding>(`${tables.branding}?tenant_id=eq.${tenant.id}&limit=1`))[0] ??
    memBrand.get(tenant.id) ?? {
      tenant_id: tenant.id,
      org_name: tenant.org_name,
      unbranded: false,
      logo_url: null,
      primary_color: tables === SOLVO_TABLES ? "#1E4ED8" : "#22d3ee",
      accent_color: tables === SOLVO_TABLES ? "#E8B923" : "#f59e0b",
    };
  const picks =
    (await restGet<DeskPicks>(`${tables.picks}?tenant_id=eq.${tenant.id}&limit=1`))[0] ??
    memPicks.get(tenant.id) ?? {
      tenant_id: tenant.id,
      topic_ids: [],
      custom_topics: [],
    };
  const cards = await restGet<DeskCard>(
    `${tables.snapshots}?tenant_id=eq.${tenant.id}&order=created_at.desc&limit=40`,
  );
  const seen = new Set<string>();
  const latest: DeskCard[] = [];
  for (const c of cards.length ? cards : memCards.get(tenant.id) ?? []) {
    if (seen.has(c.topic_id)) continue;
    seen.add(c.topic_id);
    latest.push(c);
  }
  return { tenant, branding, picks, cards: latest };
}

export async function getStudioBundle(token: string): Promise<{
  tenant: DeskTenant;
  branding: DeskBranding;
  picks: DeskPicks;
} | null> {
  const tenant = await getTenantByToken(token);
  if (!tenant) return null;
  const tables = await tablesForTenantId(tenant.id);
  const branding =
    (await restGet<DeskBranding>(`${tables.branding}?tenant_id=eq.${tenant.id}&limit=1`))[0] ??
    memBrand.get(tenant.id) ?? {
      tenant_id: tenant.id,
      org_name: tenant.org_name,
      unbranded: false,
      logo_url: null,
      primary_color: tables === SOLVO_TABLES ? "#1E4ED8" : "#22d3ee",
      accent_color: tables === SOLVO_TABLES ? "#E8B923" : "#f59e0b",
    };
  const picks =
    (await restGet<DeskPicks>(`${tables.picks}?tenant_id=eq.${tenant.id}&limit=1`))[0] ??
    memPicks.get(tenant.id) ?? {
      tenant_id: tenant.id,
      topic_ids: [],
      custom_topics: [],
    };
  return { tenant, branding, picks };
}

export async function saveStudio(
  tenant: DeskTenant,
  input: {
    org_name?: string;
    unbranded?: boolean;
    logo_url?: string | null;
    primary_color?: string;
    accent_color?: string;
    topic_ids?: string[];
    custom_topics?: string[];
    custom_domain?: string | null;
  },
): Promise<void> {
  const { url, key } = supabaseConfig();
  const branding: DeskBranding = {
    tenant_id: tenant.id,
    org_name: (input.org_name ?? tenant.org_name).slice(0, 80),
    unbranded: Boolean(input.unbranded),
    logo_url: input.logo_url?.trim() || null,
    primary_color: input.primary_color || "#22d3ee",
    accent_color: input.accent_color || "#f59e0b",
  };
  const topic_ids = (input.topic_ids ?? []).filter((id) => !isArchivedTopicId(id) && LIVE_TOPIC_KEYS[id]);
  const custom_topics = (input.custom_topics ?? [])
    .map((t) => t.trim())
    .filter(Boolean);
  const room = Math.max(0, DESK_MAX_TOPICS - topic_ids.length);
  const picks: DeskPicks = {
    tenant_id: tenant.id,
    topic_ids: topic_ids.slice(0, DESK_MAX_TOPICS),
    custom_topics: custom_topics.slice(0, room),
  };
  memBrand.set(tenant.id, branding);
  memPicks.set(tenant.id, picks);
  if (input.custom_domain !== undefined) {
    tenant.custom_domain = input.custom_domain?.trim() || null;
  }
  if (!key || DESK_DEMO_SEEDS.some((d) => d.id === tenant.id)) return;
  const tables = await tablesForTenantId(tenant.id);
  await fetch(`${url}/rest/v1/${tables.branding}?tenant_id=eq.${tenant.id}`, {
    method: "PATCH",
    headers: restHeaders(key, { Prefer: "return=minimal" }),
    body: JSON.stringify({ ...branding, updated_at: new Date().toISOString() }),
  });
  await fetch(`${url}/rest/v1/${tables.picks}?tenant_id=eq.${tenant.id}`, {
    method: "PATCH",
    headers: restHeaders(key, { Prefer: "return=minimal" }),
    body: JSON.stringify({ ...picks, updated_at: new Date().toISOString() }),
  });
  if (input.custom_domain !== undefined) {
    await fetch(`${url}/rest/v1/${tables.tenants}?id=eq.${tenant.id}`, {
      method: "PATCH",
      headers: restHeaders(key, { Prefer: "return=minimal" }),
      body: JSON.stringify({ custom_domain: tenant.custom_domain }),
    });
  }
}

export async function generateLiveUrl(tenant: DeskTenant): Promise<string> {
  const demoSeed = DESK_DEMO_SEEDS.find((d) => d.id === tenant.id);
  const tables = await tablesForTenantId(tenant.id);
  const picks =
    memPicks.get(tenant.id) ??
    (await restGet<DeskPicks>(`${tables.picks}?tenant_id=eq.${tenant.id}&limit=1`))[0];
  const branding =
    memBrand.get(tenant.id) ??
    (await restGet<DeskBranding>(`${tables.branding}?tenant_id=eq.${tenant.id}&limit=1`))[0];
  const base = slugify(branding?.org_name || tenant.org_name || "desk");
  let slug = demoSeed ? demoSeed.slug : tenant.slug || base;
  if (!demoSeed && !tenant.slug) {
    const clash = await restGetTenant(`slug=eq.${slug}&limit=1`);
    if (clash && clash.id !== tenant.id) slug = `${base}-${tenant.id.slice(0, 6)}`;
  }

  const cards = await buildCardsForPicks(picks);
  memCards.set(tenant.id, cards);
  tenant.slug = slug;
  tenant.status = "live";
  tenant.org_name = branding?.org_name || tenant.org_name;

  const { url, key } = supabaseConfig();
  if (key && !demoSeed) {
    await fetch(`${url}/rest/v1/${tables.tenants}?id=eq.${tenant.id}`, {
      method: "PATCH",
      headers: restHeaders(key, { Prefer: "return=minimal" }),
      body: JSON.stringify({ slug, status: "live", org_name: tenant.org_name }),
    });
    for (const c of cards) {
      await fetch(`${url}/rest/v1/${tables.snapshots}`, {
        method: "POST",
        headers: restHeaders(key, { Prefer: "return=minimal" }),
        body: JSON.stringify({
          tenant_id: tenant.id,
          ...c,
          created_at: new Date().toISOString(),
        }),
      });
    }
  }
  return slug;
}

export function publicDeskPath(slug: string): string {
  if (isPubliceyeDemoSlug(slug)) return PUBLICEYE_PUBLIC_BASE;
  if (isUaeDemoSlug(slug)) return SOLVO_PUBLIC_BASE;
  return `/d/${slug}`;
}

export function countDeskTopics(picks: DeskPicks | undefined): number {
  return (picks?.topic_ids?.length ?? 0) + (picks?.custom_topics?.length ?? 0);
}

export async function recordDeskRun(input: {
  tenantId: string;
  topicCount: number;
  amountCents: number;
  invoiceId: string | null;
}): Promise<void> {
  const { url, key } = supabaseConfig();
  if (!key || DESK_DEMO_SEEDS.some((d) => d.id === input.tenantId)) return;
  const tables = await tablesForTenantId(input.tenantId);
  await fetch(`${url}/rest/v1/${tables.runs}`, {
    method: "POST",
    headers: restHeaders(key, { Prefer: "return=minimal" }),
    body: JSON.stringify({
      tenant_id: input.tenantId,
      topic_count: input.topicCount,
      amount_cents: input.amountCents,
      currency: tables === SOLVO_TABLES ? "aed" : "eur",
      stripe_invoice_id: input.invoiceId,
      created_at: new Date().toISOString(),
    }),
  });
}
