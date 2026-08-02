/**
 * Report store — NO personal data (no email, no name, no payment PAN).
 * Primary: Supabase service role table research_desk_reports
 * Fallback: process memory (single-instance / dev only)
 */
import type { DeskReport } from "./build-report";

type Row = {
  token: string;
  stripe_session_id: string;
  package_id: string;
  topic: string;
  questions: string;
  report: DeskReport;
  created_at: string;
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
    report: row.report,
    created_at,
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
        report: row.report,
        created_at,
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
  if (local) return local.report;

  const { url, key } = supabaseConfig();
  if (!key) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/research_desk_reports?token=eq.${encodeURIComponent(token)}&select=report&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as { report?: DeskReport }[];
    const report = rows?.[0]?.report;
    if (report) {
      mem.set(token, {
        token,
        stripe_session_id: "",
        package_id: report.packageId,
        topic: report.topic,
        questions: report.questions.join("\n"),
        report,
        created_at: report.createdAt,
      });
    }
    return report ?? null;
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
