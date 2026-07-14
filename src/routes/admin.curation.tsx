import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { supabaseExternal } from "@/integrations/supabase/external-client";
import type { CuratedTopicInsights } from "@/lib/dashboard-data";
import { assertAppendOnlyFetch } from "@/lib/supabase-append-only";
import { Loader2, Save, ArrowLeft } from "lucide-react";

const SUPABASE_URL = "https://jacbalsongvqvaqlfsbx.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphY2JhbHNvbmd2cXZhcWxmc2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NDg1MjgsImV4cCI6MjA5NTEyNDUyOH0.NZI55Xy8KpqQHdPfQohojnnc-GDef0L8dKQ2oOYI1EU";

function adminEmails(): string[] {
  const raw = import.meta.env.VITE_ADMIN_EMAILS as string | undefined;
  if (!raw) return [];
  return raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
}

function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const allowed = adminEmails();
  if (!allowed.length) return false;
  return allowed.includes(email.toLowerCase());
}

export const Route = createFileRoute("/admin/curation")({
  component: AdminCurationPage,
});

function AdminCurationPage() {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<CuratedTopicInsights[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabaseExternal.auth.getSession().then(({ data }) => {
      setSessionEmail(data.session?.user?.email ?? null);
      setLoading(false);
    });
  }, []);

  const isAdmin = isAdminEmail(sessionEmail);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const { data: session } = await supabaseExternal.auth.getSession();
      const token = session.session?.access_token;
      if (!token) return;
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/curated_topic_insights?select=*&order=generated_at.desc&limit=80`,
        {
          headers: {
            apikey: ANON_KEY,
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (res.ok) {
        setRows((await res.json()) as CuratedTopicInsights[]);
      }
    })();
  }, [isAdmin]);

  /** Append-only: insert a new revision row — never PATCH/UPDATE existing rows. */
  const insertRevision = async (
    row: CuratedTopicInsights,
    patch: Partial<CuratedTopicInsights & { status?: string }>,
  ) => {
    if (!row.topic) return;
    setSavingId(row.id ?? -1);
    setError(null);
    try {
      const { data: session } = await supabaseExternal.auth.getSession();
      const token = session.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const now = new Date().toISOString();
      const newRow = {
        topic: row.topic,
        snapshot_month: row.snapshot_month ?? now.slice(0, 7),
        comparison_window: row.comparison_window ?? "wow",
        hero_headline: patch.hero_headline ?? row.hero_headline ?? "",
        hero_summary: patch.hero_summary ?? row.hero_summary ?? "",
        hero_confidence: row.hero_confidence,
        insight_threads: row.insight_threads ?? [],
        sentiment_delta: row.sentiment_delta,
        divergence_delta: row.divergence_delta,
        evolution_note: row.evolution_note,
        status: patch.status ?? (row as { status?: string }).status ?? "published",
        generated_at: now,
      };

      const url = `${SUPABASE_URL}/rest/v1/curated_topic_insights`;
      const init = {
        method: "POST" as const,
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(newRow),
      };
      assertAppendOnlyFetch(url, init);
      const res = await fetch(url, init);
      if (!res.ok) throw new Error(`Insert failed (${res.status})`);
      const inserted = (await res.json()) as CuratedTopicInsights[];
      const saved = inserted[0];
      if (saved) {
        setRows((prev) => [saved, ...prev]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground font-mono text-sm">
        <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteNav />
        <main className="flex-1 max-w-lg mx-auto px-6 py-16 text-center space-y-4">
          <h1 className="text-xl font-display font-semibold">Admin access required</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with an authorized account to manage curated insights.
            {sessionEmail && (
              <span className="block mt-2 font-mono text-xs">Signed in as {sessionEmail}</span>
            )}
          </p>
          <Link to="/" className="text-cyan text-sm font-mono hover:underline">
            Back to dashboard
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const latestByTopic = new Map<string, CuratedTopicInsights>();
  for (const r of rows) {
    if (r.topic && !latestByTopic.has(r.topic)) latestByTopic.set(r.topic, r);
  }
  const items = [...latestByTopic.values()];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="max-w-4xl mx-auto w-full px-4 py-8 space-y-6 flex-1">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-cyan hover:text-cyan/80">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-display font-semibold">Curation Admin</h1>
        </div>
        <p className="text-sm text-muted-foreground font-mono">
          Save inserts a new Pass 2 revision (append-only). Published rows surface on topic pages and dashboard highlights.
        </p>
        {error && (
          <p className="text-sm text-rose-signal font-mono border border-rose-signal/40 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <div className="space-y-4">
          {items.map((row) => (
            <AdminCurationCard
              key={row.id}
              row={row}
              saving={savingId === row.id}
              onSave={(patch) => insertRevision(row, patch)}
            />
          ))}
          {!items.length && (
            <p className="text-sm text-muted-foreground font-mono">No curated rows found.</p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function AdminCurationCard({
  row,
  saving,
  onSave,
}: {
  row: CuratedTopicInsights;
  saving: boolean;
  onSave: (patch: Partial<CuratedTopicInsights & { status?: string }>) => void;
}) {
  const [headline, setHeadline] = useState(row.hero_headline ?? "");
  const [summary, setSummary] = useState(row.hero_summary ?? "");
  const [status, setStatus] = useState((row as { status?: string }).status ?? "published");

  return (
    <div className="glass rounded-xl p-4 space-y-3 border border-border">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[11px] font-mono uppercase tracking-wider text-cyan">{row.topic}</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="text-xs font-mono bg-background border border-border rounded px-2 py-1"
        >
          <option value="published">published</option>
          <option value="draft">draft</option>
          <option value="archived">archived</option>
        </select>
      </div>
      <input
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-display"
        placeholder="Hero headline"
      />
      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        rows={3}
        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm resize-y"
        placeholder="Hero summary"
      />
      <button
        type="button"
        disabled={saving}
        onClick={() =>
          onSave({
            hero_headline: headline,
            hero_summary: summary,
            status,
          } as Partial<CuratedTopicInsights & { status?: string }>)
        }
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border border-cyan/40 text-cyan hover:bg-cyan/10 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
        Save new revision
      </button>
    </div>
  );
}