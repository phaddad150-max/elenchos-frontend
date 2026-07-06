import { createServerFn } from "@tanstack/react-start";

// Server-verified list of backend topic names that have an actual paid
// sponsorship row in the external Supabase `topic_sponsorships` table.
// The Stripe webhook (running with the service role) is the sole writer of
// that table, so the presence of a row is proof of payment.
//
// This replaces the previous localStorage-based unlock check, which could be
// forged by any visitor by writing to localStorage or visiting
// `?success=true` with a crafted pending key.
export const getUnlockedSponsorTopics = createServerFn({ method: "GET" }).handler(
  async () => {
    const url = "https://jacbalsongvqvaqlfsbx.supabase.co";
    const key = process.env.EXTERNAL_SUPABASE_SERVICE_ROLE_KEY;
    if (!key) return { topics: [] as string[] };

    try {
      const res = await fetch(
        `${url}/rest/v1/topic_sponsorships?select=topic&topic_status=eq.live`,
        {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
          },
        },
      );
      if (!res.ok) return { topics: [] as string[] };
      const rows = (await res.json()) as Array<{ topic?: string | null }>;
      const set = new Set<string>();
      for (const r of rows) {
        if (r?.topic && typeof r.topic === "string") set.add(r.topic);
      }
      return { topics: Array.from(set) };
    } catch {
      return { topics: [] as string[] };
    }
  },
);
