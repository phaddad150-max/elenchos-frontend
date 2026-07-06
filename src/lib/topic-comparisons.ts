// Client-side reader for the `topic_comparisons` Supabase table.
// Uses the public anon key — read-only access.

const SUPABASE_URL = "https://jacbalsongvqvaqlfsbx.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphY2JhbHNvbmd2cXZhcWxmc2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NDg1MjgsImV4cCI6MjA5NTEyNDUyOH0.NZI55Xy8KpqQHdPfQohojnnc-GDef0L8dKQ2oOYI1EU";

export type CitizenNarrative = {
  summary?: string;
  key_themes?: string[];
};

export type OfficialNarrative = {
  summary?: string;
  key_claims?: string[];
};

export type KeyConflict = {
  issue?: string;
  citizen_view?: string;
  official_view?: string;
  gap?: string;
};

export type TopicComparison = {
  topic: string;
  divergence_score?: number;
  narrative_gap_overview?: string;
  citizen_narrative?: CitizenNarrative;
  official_mainstream_narrative?: OfficialNarrative;
  key_conflicts?: KeyConflict[];
  sample_size?: { citizen?: number; official?: number };
  bias_notes?: string;
  generated_at?: string;
  expires_at?: string;
};

export async function fetchTopicComparison(
  topic: string,
): Promise<TopicComparison | null> {
  try {
    const encoded = encodeURIComponent(`ilike.%${topic}%`);
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/topic_comparisons?topic=${encoded}&order=generated_at.desc&limit=1`,
      {
        headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as TopicComparison[];
    return rows?.[0] ?? null;
  } catch (e) {
    console.error("topic_comparisons fetch failed", e);
    return null;
  }
}

export function isExpired(c: TopicComparison): boolean {
  if (!c.expires_at) return false;
  return new Date(c.expires_at).getTime() < Date.now();
}
