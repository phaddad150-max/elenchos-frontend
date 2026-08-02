/**
 * Report store — NO personal data (no email, no name, no payment PAN).
 * Primary: Supabase service role table research_desk_reports
 * Fallback: process memory (single-instance / dev only)
 */
import type { DeskReport } from "./build-report";

export type SharedReportListItem = {
  token: string;
  title: string;
  topic: string;
  packageId: string;
  createdAt: string;
  sharedAt: string | null;
};

type Row = {
  token: string;
  stripe_session_id: string;
  package_id: string;
  topic: string;
  questions: string;
  report: DeskReport;
  created_at: string;
  shared_public: boolean;
  shared_at: string | null;
};

const mem = new Map<string, Row>();
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

export async function saveReport(row: {
  token: string;
  stripeSessionId: string;
  packageId: string;
  topic: string;
  questions: string;
  report: DeskReport;
}): Promise<void> {
  const created_at = new Date().toISOString();
  const full: Row = {
    token: row.token,
    stripe_session_id: row.stripeSessionId,
    package_id: row.packageId,
    topic: row.topic,
    questions: row.questions,
    report: withShareFlag(row.report, false, null),
    created_at,
    shared_public: false,
    shared_at: null,
  };
  mem.set(row.token, full);
  bySession.set(row.stripeSessionId, row.token);

  const { url, key } = supabaseConfig();
  if (!key) {
    console.warn("[research-desk] No SUPABASE_SERVICE_ROLE_KEY — report kept in process memory only");
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
        token: row.token,
        stripe_session_id: row.stripeSessionId,
        package_id: row.packageId,
        topic: row.topic.slice(0, 2000),
        questions: row.questions.slice(0, 4000),
        report: full.report,
        created_at,
        shared_public: false,
        shared_at: null,
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.error("[research-desk] supabase save failed", res.status, t.slice(0, 200));
    }
  } catch (e) {
    console.error("[research-desk] supabase save error", e);
  }
}

export async function getReportByToken(token: string): Promise<DeskReport | null> {
  const local = mem.get(token);
  if (local) {
    return withShareFlag(local.report, local.shared_public, local.shared_at);
  }

  const { url, key } = supabaseConfig();
  if (!key) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/research_desk_reports?token=eq.${encodeURIComponent(token)}&select=report,shared_public,shared_at,package_id,topic,created_at&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as {
      report?: DeskReport;
      shared_public?: boolean;
      shared_at?: string | null;
      package_id?: string;
      topic?: string;
      created_at?: string;
    }[];
    const row = rows?.[0];
    if (!row?.report) return null;
    const shared = Boolean(row.shared_public);
    const sharedAt = row.shared_at ?? null;
    const report = withShareFlag(row.report, shared, sharedAt);
    mem.set(token, {
      token,
      stripe_session_id: "",
      package_id: row.package_id ?? report.packageId,
      topic: row.topic ?? report.topic,
      questions: report.questions.join("\n"),
      report,
      created_at: row.created_at ?? report.createdAt,
      shared_public: shared,
      shared_at: sharedAt,
    });
    return report;
  } catch {
    return null;
  }
}

export async function getTokenBySession(sessionId: string): Promise<string | null> {
  if (bySession.has(sessionId)) return bySession.get(sessionId)!;
  const { url, key } = supabaseConfig();
  if (!key) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/research_desk_reports?stripe_session_id=eq.${encodeURIComponent(sessionId)}&select=token&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
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

/** Opt-in: owner of secret token can list report in public library. */
export async function setReportShared(
  token: string,
  share: boolean,
): Promise<{ ok: boolean; report?: DeskReport; error?: string }> {
  const existing = await getReportByToken(token);
  if (!existing) return { ok: false, error: "Report not found" };

  const sharedAt = share ? new Date().toISOString() : null;
  const next = withShareFlag(existing, share, sharedAt);

  const local = mem.get(token);
  if (local) {
    local.shared_public = share;
    local.shared_at = sharedAt;
    local.report = next;
    mem.set(token, local);
  } else {
    mem.set(token, {
      token,
      stripe_session_id: "",
      package_id: next.packageId,
      topic: next.topic,
      questions: next.questions.join("\n"),
      report: next,
      created_at: next.createdAt,
      shared_public: share,
      shared_at: sharedAt,
    });
  }

  const { url, key } = supabaseConfig();
  if (key) {
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
          body: JSON.stringify({
            shared_public: share,
            shared_at: sharedAt,
            report: next,
          }),
        },
      );
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        console.error("[research-desk] share update failed", res.status, t.slice(0, 200));
        // Memory still updated — return ok for single-instance; warn if both fail
        if (!local) {
          return { ok: false, error: "Could not update share setting" };
        }
      }
    } catch (e) {
      console.error("[research-desk] share update error", e);
    }
  }

  return { ok: true, report: next };
}

export async function listSharedReports(limit = 40): Promise<SharedReportListItem[]> {
  const out: SharedReportListItem[] = [];
  const seen = new Set<string>();

  for (const row of mem.values()) {
    if (!row.shared_public) continue;
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
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
          },
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
