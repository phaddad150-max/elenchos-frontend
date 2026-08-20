/**
 * Case-study deep-dive snapshots — Supabase `case_study_snapshots`
 * (separate from topic_snapshots + trackers). Append-only INSERT forever.
 *
 * Read model: `latest_case_study_snapshots` view.
 * Writes: backend only via append_only_insert("case_study_snapshots", …).
 */

export type CaseStudySubheadline = {
  id: string;
  title: string;
  blurb: string;
};

export type CaseStudySnapshotRow = {
  id?: number;
  created_at?: string;
  last_updated?: string;
  case_slug: string;
  snapshot_label?: string | null;
  headline?: string | null;
  summary?: string | null;
  subheadlines?: CaseStudySubheadline[];
  data?: Record<string, unknown>;
  source_mix?: string[];
  deep_dive_summary?: string | null;
  key_insights?: string[] | null;
  item_count?: number | null;
  research_desk_token?: string | null;
};

const SUPABASE_URL = "https://jacbalsongvqvaqlfsbx.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphY2JhbHNvbmd2cXZhcWxmc2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NDg1MjgsImV4cCI6MjA5NTEyNDUyOH0.NZI55Xy8KpqQHdPfQohojnnc-GDef0L8dKQ2oOYI1EU";

/** Fetch newest published snapshot for a case slug (null if table empty / not migrated). */
export async function fetchLatestCaseStudySnapshot(
  caseSlug: string,
): Promise<CaseStudySnapshotRow | null> {
  try {
    const q = new URLSearchParams({
      select: "*",
      case_slug: `eq.${caseSlug}`,
      order: "created_at.desc",
      limit: "1",
    });
    const res = await fetch(`${SUPABASE_URL}/rest/v1/latest_case_study_snapshots?${q}`, {
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as CaseStudySnapshotRow[];
    return Array.isArray(rows) && rows[0] ? rows[0] : null;
  } catch {
    return null;
  }
}
