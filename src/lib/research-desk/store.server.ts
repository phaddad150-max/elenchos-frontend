/**
 * Append-only Research Desk store.
 * GOLDEN RULE: never UPDATE/DELETE/UPSERT intelligence or commission rows.
 * Every state change inserts a NEW row; readers take the latest by token + created_at.
 * No personal identity fields (no email, name, PAN).
 */
import {
  buildDeskReport,
  type DeskReport,
  type DeskReportStatus,
} from "./build-report";
import type { DeskPackageId } from "./packages";

export type SharedReportListItem = {
  token: string;
  title: string;
  topic: string;
  packageId: string;
  createdAt: string;
  sharedAt: string | null;
  /** Optional scores for Topics archive card face (same layout as live cards) */
  sentimentScore?: number | null;
  divergenceScore?: number | null;
};

export type CommissionRow = {
  id?: string;
  token: string;
  stripe_session_id: string | null;
  package_id: DeskPackageId;
  topic: string;
  questions: string;
  report: DeskReport | null;
  created_at: string;
  shared_public: boolean;
  shared_at: string | null;
  status: DeskReportStatus;
  error_message: string | null;
  /** Null = guest commission. Set for Pro/token private runs. */
  user_id?: string | null;
  visibility?: "token_link" | "private_account";
  tokens_charged?: number | null;
  payment_source?: "stripe_checkout" | "token_balance" | "pro_grant" | null;
};

/** In-memory append log (dev / missing service role). Latest per token is last write. */
const memLog: CommissionRow[] = [];
const bySession = new Map<string, string>();

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

function withShareFlag(report: DeskReport, shared: boolean, sharedAt: string | null): DeskReport {
  return {
    ...report,
    sharedPublic: shared,
    sharedAt: sharedAt ?? undefined,
  };
}

function newId(): string {
  return crypto.randomUUID();
}

/** INSERT-only. Never merge, never patch. */
async function appendRow(row: CommissionRow): Promise<boolean> {
  memLog.push(row);
  if (row.stripe_session_id) {
    bySession.set(row.stripe_session_id, row.token);
  }

  const { url, key } = supabaseConfig();
  if (!key) {
    console.warn("[research-desk] No SUPABASE_SERVICE_ROLE_KEY — append in memory only");
    return true;
  }

  try {
    const res = await fetch(`${url}/rest/v1/research_desk_reports`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        // NEVER Prefer: resolution=merge-duplicates — that overwrites
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        id: row.id ?? newId(),
        token: row.token,
        stripe_session_id: row.stripe_session_id,
        package_id: row.package_id,
        topic: row.topic.slice(0, 8000),
        questions: row.questions.slice(0, 16000),
        report: row.report,
        created_at: row.created_at,
        shared_public: row.shared_public,
        shared_at: row.shared_at,
        status: row.status,
        error_message: row.error_message,
        // Pro / token fields (null for guest commissions)
        user_id: row.user_id ?? null,
        visibility: row.visibility ?? "token_link",
        tokens_charged: row.tokens_charged ?? null,
        payment_source: row.payment_source ?? null,
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.error("[research-desk] append insert failed", res.status, t.slice(0, 300));
      return false;
    }
    console.info("[research-desk] append ok", {
      token: row.token.slice(0, 8),
      status: row.status,
      topicLen: row.topic.length,
      questionsLen: row.questions.length,
      shared: row.shared_public,
    });
    return true;
  } catch (e) {
    console.error("[research-desk] append error", e);
    return false;
  }
}

function latestFromMem(token: string): CommissionRow | null {
  for (let i = memLog.length - 1; i >= 0; i--) {
    if (memLog[i]!.token === token) return memLog[i]!;
  }
  return null;
}

/** Create pending commission BEFORE Stripe — full topic + questions. INSERT only. */
export async function createPendingCommission(input: {
  token: string;
  packageId: DeskPackageId;
  topic: string;
  questions: string;
}): Promise<void> {
  const created_at = new Date().toISOString();
  const placeholder = buildDeskReport({
    token: input.token,
    packageId: input.packageId,
    topic: input.topic,
    questionsRaw: input.questions,
    generationStatus: "pending_payment",
  });
  await appendRow({
    id: newId(),
    token: input.token,
    stripe_session_id: null,
    package_id: input.packageId,
    topic: input.topic,
    questions: input.questions,
    report: placeholder,
    created_at,
    shared_public: false,
    shared_at: null,
    status: "pending_payment",
    error_message: null,
    user_id: null,
    visibility: "token_link",
    tokens_charged: null,
    payment_source: "stripe_checkout",
  });
}

/**
 * Pro / token private run — INSERT only into research_desk_reports.
 * Never writes topic_snapshots / curated_* / dashboard_* / public KPIs.
 */
export async function createPrivateTokenRun(input: {
  token: string;
  userId: string;
  packageId: DeskPackageId;
  topic: string;
  questions: string;
  tokensCharged: number;
}): Promise<void> {
  const created_at = new Date().toISOString();
  const placeholder = buildDeskReport({
    token: input.token,
    packageId: input.packageId,
    topic: input.topic,
    questionsRaw: input.questions,
    generationStatus: "generating",
  });
  await appendRow({
    id: newId(),
    token: input.token,
    stripe_session_id: null,
    package_id: input.packageId,
    topic: input.topic,
    questions: input.questions,
    report: placeholder,
    created_at,
    shared_public: false,
    shared_at: null,
    status: "generating",
    error_message: null,
    user_id: input.userId,
    visibility: "private_account",
    tokens_charged: input.tokensCharged,
    payment_source: "token_balance",
  });
}

export async function getCommission(token: string): Promise<CommissionRow | null> {
  const local = latestFromMem(token);

  const { url, key } = supabaseConfig();
  if (!key) return local;

  try {
    const res = await fetch(
      `${url}/rest/v1/research_desk_reports?token=eq.${encodeURIComponent(token)}&select=*&order=created_at.desc&limit=1`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      },
    );
    if (!res.ok) return local;
    const rows = (await res.json()) as CommissionRow[];
    const row = rows?.[0];
    if (!row) return local;

    const normalized: CommissionRow = {
      id: row.id,
      token: row.token,
      stripe_session_id: row.stripe_session_id ?? null,
      package_id: row.package_id as DeskPackageId,
      topic: row.topic,
      questions: row.questions ?? "",
      report: row.report ?? null,
      created_at: row.created_at,
      shared_public: Boolean(row.shared_public),
      shared_at: row.shared_at ?? null,
      status: (row.status as DeskReportStatus) || "ready",
      error_message: row.error_message ?? null,
      user_id: row.user_id ?? null,
      visibility: row.visibility ?? "token_link",
      tokens_charged: row.tokens_charged ?? null,
      payment_source: row.payment_source ?? null,
    };
    // Keep mem aligned for same-process reads (does not overwrite DB)
    if (!local || local.created_at < normalized.created_at) {
      memLog.push(normalized);
    }
    if (normalized.stripe_session_id) {
      bySession.set(normalized.stripe_session_id, token);
    }
    return normalized;
  } catch {
    return local;
  }
}

export async function getReportByToken(token: string): Promise<DeskReport | null> {
  const row = await getCommission(token);
  if (!row?.report) return null;
  return withShareFlag(row.report, row.shared_public, row.shared_at);
}

export async function getTokenBySession(sessionId: string): Promise<string | null> {
  if (bySession.has(sessionId)) return bySession.get(sessionId)!;
  const { url, key } = supabaseConfig();
  if (!key) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/research_desk_reports?stripe_session_id=eq.${encodeURIComponent(sessionId)}&select=token&order=created_at.desc&limit=1`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as { token?: string }[];
    const token = rows?.[0]?.token ?? null;
    if (token) bySession.set(sessionId, token);
    return token;
  } catch {
    return null;
  }
}

/**
 * Append a new version of the commission (status / report / share).
 * NEVER patches existing rows.
 */
export async function appendCommissionEvent(
  token: string,
  patch: Partial<{
    stripeSessionId: string | null;
    status: DeskReportStatus;
    errorMessage: string | null;
    report: DeskReport;
    sharedPublic: boolean;
    sharedAt: string | null;
  }>,
): Promise<boolean> {
  const existing = await getCommission(token);
  if (!existing) return false;

  const created_at = new Date().toISOString();
  const sharedPublic =
    patch.sharedPublic !== undefined ? patch.sharedPublic : existing.shared_public;
  const sharedAt =
    patch.sharedAt !== undefined ? patch.sharedAt : existing.shared_at;
  let report = patch.report !== undefined ? patch.report : existing.report;
  if (report) {
    report = withShareFlag(report, sharedPublic, sharedAt);
  }

  return appendRow({
    id: newId(),
    token: existing.token,
    stripe_session_id:
      patch.stripeSessionId !== undefined
        ? patch.stripeSessionId
        : existing.stripe_session_id,
    package_id: existing.package_id,
    topic: existing.topic,
    questions: existing.questions,
    report,
    created_at,
    shared_public: sharedPublic,
    shared_at: sharedAt,
    status: patch.status !== undefined ? patch.status : existing.status,
    error_message:
      patch.errorMessage !== undefined ? patch.errorMessage : existing.error_message,
    // Preserve Pro fields across append-only status events
    user_id: existing.user_id ?? null,
    visibility: existing.visibility ?? "token_link",
    tokens_charged: existing.tokens_charged ?? null,
    payment_source: existing.payment_source ?? null,
  });
}

/** @deprecated name — append-only alias */
export async function updateCommission(
  token: string,
  patch: Parameters<typeof appendCommissionEvent>[1],
): Promise<boolean> {
  return appendCommissionEvent(token, patch);
}

/** @deprecated prefer createPending + appendCommissionEvent */
export async function saveReport(row: {
  token: string;
  stripeSessionId: string;
  packageId: string;
  topic: string;
  questions: string;
  report: DeskReport;
}): Promise<void> {
  const existing = await getCommission(row.token);
  if (!existing) {
    await createPendingCommission({
      token: row.token,
      packageId: row.packageId as DeskPackageId,
      topic: row.topic,
      questions: row.questions,
    });
  }
  await appendCommissionEvent(row.token, {
    stripeSessionId: row.stripeSessionId,
    status: "ready",
    report: row.report,
    errorMessage: null,
  });
}

export async function setReportShared(
  token: string,
  share: boolean,
): Promise<{ ok: boolean; report?: DeskReport; error?: string }> {
  const existing = await getReportByToken(token);
  if (!existing) return { ok: false, error: "Report not found" };
  const sharedAt = share ? new Date().toISOString() : null;
  const next = withShareFlag(existing, share, sharedAt);
  // Append new row — never overwrite prior share state history
  const ok = await appendCommissionEvent(token, {
    sharedPublic: share,
    sharedAt,
    report: next,
    status: "ready",
  });
  if (!ok) return { ok: false, error: "Could not append share event" };
  return { ok: true, report: next };
}

export type SharedKind = "topic" | "deep" | "all";

function packageMatchesKind(packageId: string, kind: SharedKind): boolean {
  if (kind === "all") return true;
  if (kind === "topic") return packageId === "topic-analysis";
  return packageId === "deep-no-x" || packageId === "deep-with-x";
}

/**
 * Latest shared version per token (append-only history).
 * kind=topic → topic-analysis only
 * kind=deep → deep-no-x | deep-with-x
 */
export async function listSharedReports(
  limit = 40,
  kind: SharedKind = "all",
): Promise<SharedReportListItem[]> {
  const byToken = new Map<string, SharedReportListItem>();

  // Memory: scan newest first
  for (let i = memLog.length - 1; i >= 0; i--) {
    const row = memLog[i]!;
    if (!row.shared_public || !row.report) continue;
    if (!packageMatchesKind(row.package_id, kind)) continue;
    if (byToken.has(row.token)) continue;
    byToken.set(row.token, {
      token: row.token,
      title: row.report.title,
      topic: row.topic,
      packageId: row.package_id,
      createdAt: row.created_at,
      sharedAt: row.shared_at,
      sentimentScore: row.report.overallSentiment?.score ?? null,
      divergenceScore: row.report.divergenceScore ?? null,
    });
  }

  const { url, key } = supabaseConfig();
  if (key) {
    try {
      let filter = "shared_public=eq.true";
      if (kind === "topic") {
        filter += "&package_id=eq.topic-analysis";
      } else if (kind === "deep") {
        filter += "&package_id=in.(deep-no-x,deep-with-x)";
      }
      const res = await fetch(
        `${url}/rest/v1/research_desk_reports?${filter}&select=token,topic,package_id,report,created_at,shared_at,shared_public&order=created_at.desc&limit=${Math.min(limit * 5, 200)}`,
        {
          headers: { apikey: key, Authorization: `Bearer ${key}` },
        },
      );
      if (res.ok) {
        const rows = (await res.json()) as {
          token: string;
          topic: string;
          package_id: string;
          report?: DeskReport;
          created_at: string;
          shared_at?: string | null;
          shared_public?: boolean;
        }[];
        for (const r of rows) {
          if (!r.shared_public) continue;
          if (!packageMatchesKind(r.package_id, kind)) continue;
          if (byToken.has(r.token)) continue;
          byToken.set(r.token, {
            token: r.token,
            title: r.report?.title ?? `Report · ${r.topic.slice(0, 60)}`,
            topic: r.topic,
            packageId: r.package_id,
            createdAt: r.created_at,
            sharedAt: r.shared_at ?? null,
            sentimentScore: r.report?.overallSentiment?.score ?? null,
            divergenceScore: r.report?.divergenceScore ?? null,
          });
        }
      }
    } catch (e) {
      console.error("[research-desk] list shared failed", e);
    }
  }

  const out = Array.from(byToken.values());
  out.sort((a, b) => {
    const ta = a.sharedAt || a.createdAt;
    const tb = b.sharedAt || b.createdAt;
    return tb.localeCompare(ta);
  });
  return out.slice(0, limit);
}
