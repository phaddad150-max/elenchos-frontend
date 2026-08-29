import type { CSSProperties } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { getLiveDesk } from "@/lib/desk/store.server";

export const Route = createFileRoute("/d/$slug")({
  loader: async ({ params }) => {
    const desk = await getLiveDesk(params.slug);
    return { desk };
  },
  component: TenantDeskPage,
});

function TenantDeskPage() {
  const { desk } = Route.useLoaderData();
  if (!desk) {
    return (
      <div className="page-shell dash-landing">
        <SiteNav />
        <main className="max-w-[640px] mx-auto px-4 py-16 text-center space-y-2">
          <p className="text-[1.35rem] font-display font-semibold tabular-nums">0</p>
          <p className="text-[13px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
            Awaiting data
          </p>
          <p className="text-[14px] text-muted-foreground">This desk is not live yet.</p>
        </main>
        <SiteFooter />
      </div>
    );
  }
  const { tenant, branding, cards } = desk;
  const title = branding.unbranded ? "Public discourse desk" : branding.org_name || tenant.org_name;
  const primary = branding.primary_color || "#22d3ee";
  const accent = branding.accent_color || "#f59e0b";

  return (
    <div
      className="page-shell dash-landing"
      style={
        {
          ["--cyan" as string]: primary,
          ["--amber-signal" as string]: accent,
        } as CSSProperties
      }
    >
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      {!branding.unbranded ? <SiteNav /> : (
        <header className="sticky top-0 z-30 nav-shell px-4 py-3 flex items-center gap-3">
          {branding.logo_url ? (
            <img src={branding.logo_url} alt="" className="h-8 w-8 rounded-full object-cover" />
          ) : null}
          <span className="font-display font-semibold text-lg">{title}</span>
        </header>
      )}
      <main className="max-w-[1100px] mx-auto px-3 sm:px-4 py-6 space-y-5 mobile-safe-bottom relative">
        {branding.unbranded ? null : (
          <h1 className="page-hero-title text-2xl sm:text-3xl">{title}</h1>
        )}
        <p className="text-[13.5px] text-muted-foreground max-w-2xl">
          Public discourse around selected topics. Empty cards are 0 · awaiting data — never invented.
        </p>
        {cards.length === 0 ? (
          <p className="text-[13px] font-mono text-muted-foreground">0 · awaiting data</p>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cards.map((c) => {
              const score =
                typeof c.overall_sentiment?.score === "number" ? Math.round(c.overall_sentiment.score) : 0;
              const awaiting = !c.sample_size;
              return (
                <li key={c.topic_id} className="dash-panel p-4 space-y-2 min-h-[140px]">
                  <h2 className="font-display font-semibold text-[15px] leading-snug">{c.topic_name}</h2>
                  <p className="text-[1.5rem] font-display font-semibold tabular-nums" style={{ color: primary }}>
                    {score}
                  </p>
                  <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                    {awaiting ? "0 · awaiting data" : `Sample ${c.sample_size}`}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
        {tenant.custom_domain ? (
          <p className="text-[12px] text-muted-foreground font-mono">{tenant.custom_domain}</p>
        ) : null}
      </main>
      {branding.unbranded ? null : <SiteFooter />}
    </div>
  );
}
