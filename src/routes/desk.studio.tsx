import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { isDeskDemoToken, isUaeDemoToken } from "@/lib/desk/catalog";

type CatalogItem = { id: string; label: string };

export const Route = createFileRoute("/desk/studio")({
  validateSearch: (s: Record<string, unknown>) => ({
    token: typeof s.token === "string" ? s.token : "",
  }),
  component: DeskStudioPage,
});

function DeskStudioPage() {
  const { token } = Route.useSearch();
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [orgName, setOrgName] = useState("");
  const [unbranded, setUnbranded] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [primary, setPrimary] = useState("#22d3ee");
  const [accent, setAccent] = useState("#f59e0b");
  const [topicIds, setTopicIds] = useState<string[]>([]);
  const [customText, setCustomText] = useState("");
  const [domain, setDomain] = useState("");
  const [busy, setBusy] = useState(false);
  const [livePath, setLivePath] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setErr("Missing studio token.");
      return;
    }
    void fetch(`/api/desk/studio?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const data = (await r.json()) as {
          error?: string;
          tenant?: { org_name?: string; slug?: string | null; custom_domain?: string | null };
          branding?: {
            org_name?: string;
            unbranded?: boolean;
            logo_url?: string | null;
            primary_color?: string;
            accent_color?: string;
          };
          picks?: { topic_ids?: string[]; custom_topics?: string[] };
          catalog?: CatalogItem[];
        };
        if (!r.ok) {
          setErr(data.error || "Could not open studio.");
          return;
        }
        setOrgName(data.branding?.org_name || data.tenant?.org_name || "");
        setUnbranded(Boolean(data.branding?.unbranded));
        setLogoUrl(data.branding?.logo_url || "");
        if (data.branding?.primary_color) setPrimary(data.branding.primary_color);
        if (data.branding?.accent_color) setAccent(data.branding.accent_color);
        setTopicIds(data.picks?.topic_ids || []);
        setCustomText((data.picks?.custom_topics || []).join("\n"));
        setDomain(data.tenant?.custom_domain || "");
        setCatalog(data.catalog || []);
        if (data.tenant?.slug) setLivePath(`/d/${data.tenant.slug}`);
        setReady(true);
      })
      .catch(() => setErr("Could not open studio."));
  }, [token]);

  const toggleTopic = (id: string) => {
    setTopicIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const save = async () => {
    const custom_topics = customText
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
    const res = await fetch("/api/desk/studio", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        token,
        org_name: orgName,
        unbranded,
        logo_url: logoUrl,
        primary_color: primary,
        accent_color: accent,
        topic_ids: topicIds,
        custom_topics,
        custom_domain: domain,
      }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(data.error || "Save failed");
  };

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await save();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const onGenerate = async () => {
    setBusy(true);
    setErr(null);
    try {
      await save();
      const res = await fetch("/api/desk/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json()) as { path?: string; error?: string };
      if (!res.ok || !data.path) throw new Error(data.error || "Generate failed");
      setLivePath(data.path);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Generate failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-shell dash-landing">
      <SiteNav />
      <main className="max-w-[860px] mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-5 mobile-safe-bottom">
        <header className="space-y-1">
          <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-cyan">Desk studio</p>
          {isDeskDemoToken(token) ? (
            <p className="text-[12px] font-mono uppercase tracking-[0.14em] text-amber-signal">
              {isUaeDemoToken(token)
                ? "UAE walkthrough · no card charged"
                : "Walkthrough · no card charged"}
            </p>
          ) : null}
          <h1 className="page-hero-title text-2xl">Brand it. Pick topics. Generate.</h1>
          <p className="text-[13.5px] text-muted-foreground max-w-xl">
            Scoring stays locked on Elenchos. Generate publishes a live URL. Catalog topics reuse
            existing public samples; custom names start at 0 · awaiting data.
          </p>
        </header>
        {err ? <p className="text-[13px] text-rose-signal">{err}</p> : null}
        {!ready && !err ? (
          <p className="inline-flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading studio…
          </p>
        ) : null}
        {ready ? (
          <form onSubmit={onSave} className="space-y-5">
            <section className="dash-panel p-4 space-y-3">
              <h2 className="font-display font-semibold">Branding</h2>
              <label className="flex items-center gap-2 text-[13px]">
                <input type="checkbox" checked={unbranded} onChange={(e) => setUnbranded(e.target.checked)} />
                Unbranded (no Elenchos mark on the public face)
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] font-mono uppercase text-muted-foreground">Display name</span>
                <input
                  className="w-full min-h-[44px] rounded-xl border border-border bg-background px-3"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] font-mono uppercase text-muted-foreground">Logo URL (optional)</span>
                <input
                  className="w-full min-h-[44px] rounded-xl border border-border bg-background px-3"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://…"
                />
              </label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-[13px]">
                  Primary
                  <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} />
                </label>
                <label className="flex items-center gap-2 text-[13px]">
                  Accent
                  <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
                </label>
              </div>
              <div
                className="rounded-xl border px-3 py-2.5 flex items-center gap-3"
                style={{ borderColor: primary, background: `${primary}14` }}
              >
                <span className="w-8 h-8 rounded-full" style={{ background: primary }} />
                <span className="w-8 h-8 rounded-full" style={{ background: accent }} />
                <p className="text-[13px] font-display font-semibold truncate" style={{ color: primary }}>
                  {orgName || "Your desk"}
                </p>
              </div>
            </section>

            <section className="dash-panel p-4 space-y-3">
              <h2 className="font-display font-semibold">Topics</h2>
              <ul className="grid sm:grid-cols-2 gap-1.5 max-h-[280px] overflow-y-auto">
                {catalog.map((t) => (
                  <li key={t.id}>
                    <label className="flex items-center gap-2 text-[13px] min-h-[36px]">
                      <input
                        type="checkbox"
                        checked={topicIds.includes(t.id)}
                        onChange={() => toggleTopic(t.id)}
                      />
                      {t.label}
                    </label>
                  </li>
                ))}
              </ul>
              <label className="block space-y-1">
                <span className="text-[11px] font-mono uppercase text-muted-foreground">
                  Custom topics (one per line) — await a funded sample
                </span>
                <textarea
                  className="w-full min-h-[88px] rounded-xl border border-border bg-background px-3 py-2 text-[13px]"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                />
              </label>
            </section>

            <section className="dash-panel p-4 space-y-2">
              <h2 className="font-display font-semibold">Your domain</h2>
              <input
                className="w-full min-h-[44px] rounded-xl border border-border bg-background px-3"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="desk.yourorg.com"
              />
              <p className="text-[12px] text-muted-foreground">
                Point a CNAME to <span className="font-mono text-foreground">cname.vercel-dns.com</span>{" "}
                then tell us. Until then use the elenchos.live link from Generate.
              </p>
            </section>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={busy}
                className="min-h-[44px] px-4 rounded-full border border-border text-[13px] font-medium"
              >
                Save
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void onGenerate()}
                className="min-h-[44px] px-5 rounded-full border border-cyan/50 bg-cyan/15 text-cyan font-display font-semibold"
              >
                {busy ? "Working…" : "Generate live URL"}
              </button>
            </div>
            {livePath ? (
              <p className="text-[14px]">
                Live:{" "}
                <a href={livePath} className="text-cyan hover:underline">
                  {typeof window !== "undefined" ? `${window.location.origin}${livePath}` : livePath}
                </a>
              </p>
            ) : null}
          </form>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
