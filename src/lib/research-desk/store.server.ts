/**
 * Report store — NO personal data (no email, no name, no payment PAN).
 * Primary: Supabase service role table research_desk_reports
 * Fallback: process memory (single-instance / dev only)
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
};

export type CommissionRow = {
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
};

const mem = new Map<string, CommissionRow>();
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

/** Create pending commission BEFORE Stripe — full topic + questions preserved. */
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
  const row: CommissionRow = {
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
  };
  mem.set(input.token, row);

  const { url, key } = supabaseConfig();
  if (!key) {
    console.warn("[research-desk] No SUPABASE_SERVICE_ROLE_KEY — pending commission in memory only");
    return;
  }
  try {
    const res = await fetch(`${url}/rest/v1/research_desk_reports`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        token: input.token,
        stripe_session_id: null,
        package_id: input.packageId,
        topic: input.topic.slice(0, 8000),
        questions: input.questions.slice(0, 16000),
        report: placeholder,
        created_at,
        shared_public: false,
        shared_at: null,
        status: "pending_payment",
        error_message: null,
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.error("[research-desk] pending save failed", res.status, t.slice(0, 300));
    }
  } catch (e) {
    console.error("[research-desk] pending save error", e);
  }
}

export async function getCommission(token: string): Promise<CommissionRow | null> {
  const local = mem.get(token);
  if (local) return local;

  const { url, key } = supabaseConfig();
  if (!key) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/research_desk_reports?token=eq.${encodeURIComponent(token)}&select=*&limit=1`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as CommissionRow[];
    const row = rows?.[0];
    if (!row) return null;
    // normalize
    const normalized: CommissionRow = {
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
    };
    mem.set(token, normalized);
    if (normalized.stripe_session_id) {
      bySession.set(normalized.stripe_session_id, token);
    }
    return normalized;
  } catch {
    return null;
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
      `${url}/rest/v1/research_desk_reports?stripe_session_id=eq.${encodeURIComponent(sessionId)}&select=token&limit=1`,
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

export async function updateCommission(
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

  if (patch.stripeSessionId !== undefined) {
    existing.stripe_session_id = patch.stripeSessionId;
    if (patch.stripeSessionId) bySession.set(patch.stripeSessionId, token);
  }
  if (patch.status !== undefined) existing.status = patch.status;
  if (patch.errorMessage !== undefined) existing.error_message = patch.errorMessage;
  if (patch.report !== undefined) {
    existing.report = withShareFlag(
      patch.report,
      existing.shared_public,
      existing.shared_at,
    );
  }
  if (patch.sharedPublic !== undefined) {
    existing.shared_public = patch.sharedPublic;
    if (existing.report) {
      existing.report = withShareFlag(
        existing.report,
        patch.sharedPublic,
        patch.sharedAt ?? existing.shared_at,
      );
    }
  }
  if (patch.sharedAt !== undefined) existing.shared_at = patch.sharedAt;

  mem.set(token, existing);

  const { url, key } = supabaseConfig();
  if (!key) return true;

  const body: Record<string, unknown> = {};
  if (patch.stripeSessionId !== undefined) body.stripe_session_id = patch.stripeSessionId;
  if (patch.status !== undefined) body.status = patch.status;
  if (patch.errorMessage !== undefined) body.error_message = patch.errorMessage;
  if (patch.report !== undefined) body.report = existing.report;
  if (patch.sharedPublic !== undefined) body.shared_public = patch.sharedPublic;
  if (patch.sharedAt !== undefined) body.shared_at = patch.sharedAt;

  try {
    const res = await fetch(
      `${url}/rest/v1/research_desk_reports?token=eq.${encodeURIComponent(token)}`,
      {
        method: "PATCH",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(body),
      },
    );
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.error("[research-desk] update failed", res.status, t.slice(0, 200));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[research-desk] update error", e);
    return false;
  }
}

/** @deprecated use updateCommission after createPendingCommission */
export async function saveReport(row: {
  token: string;
  stripeSessionId: string;
  packageId: string;
  topic: string;
  questions: string;
  report: DeskReport;
}): Promise<void> {
  const existing = await getCommission(row.token);
  if (existing) {
    await updateCommission(row.token, {
      stripeSessionId: row.stripeSessionId,
      status: "ready",
      report: row.report,
      errorMessage: null,
    });
    return;
  }
  await createPendingCommission({
    token: row.token,
    packageId: row.packageId as DeskPackageId,
    topic: row.topic,
    questions: row.questions,
  });
  await updateCommission(row.token, {
    stripeSessionId: row.stripeSessionId,
    status: "ready",
    report: row.report,
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
  const ok = await updateCommission(token, {
    sharedPublic: share,
    sharedAt,
    report: next,
  });
  if (!ok) return { ok: false, error: "Could not update share setting" };
  return { ok: true, report: next };
}

export async function listSharedReports(limit = 40): Promise<SharedReportListItem[]> {
  const out: SharedReportListItem[] = [];
  const seen = new Set<string>();

  for (const row of mem.values()) {
    if (!row.shared_public || !row.report) continue;
    seen.add(row.token);
    out.push({
      token: row.token,
      title: row.report.title,
      topic: row.topic,
      packageId: row.package_id,
      createdAt: row.created_at,
      sharedAt: row.shared_at,
    });
  }

  const { url, key } = supabaseConfig();
  if (key) {
    try {
      const res = await fetch(
        `${url}/rest/v1/research_desk_reports?shared_public=eq.true&select=token,topic,package_id,report,created_at,shared_at&order=shared_at.desc.nullslast&limit=${Math.min(limit, 100)}`,
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
        }[];
        for (const r of rows) {
          if (seen.has(r.token)) continue;
          out.push({
            token: r.token,
            title: r.report?.title ?? `Report · ${r.topic.slice(0, 60)}`,
            topic: r.topic,
            packageId: r.package_id,
            createdAt: r.created_at,
            sharedAt: r.shared_at ?? null,
          });
        }
      }
    } catch (e) {
      console.error("[research-desk] list shared failed", e);
    }
  }

  out.sort((a, b) => {
    const ta = a.sharedAt || a.createdAt;
    const tb = b.sharedAt || b.createdAt;
    return tb.localeCompare(ta);
  });
  return out.slice(0, limit);
}
