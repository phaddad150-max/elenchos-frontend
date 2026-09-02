import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FlaskConical, Plane } from "lucide-react";
import {
  EXECUTIVE_SUMMARY,
  HOOK_HEADLINE,
  HOOK_KPIS,
  HOOK_SUB,
  SUBHEADLINES,
} from "@/lib/aviation/data";

export const Route = createFileRoute("/publiceye-uae/casestudy/aviation")({
  component: PublicEyeAviationCasePage,
});

function PublicEyeAviationCasePage() {
  return (
    <main className="max-w-[860px] mx-auto w-full px-3 sm:px-4 md:px-6 py-5 sm:py-8 space-y-5 mobile-safe-bottom">
      <Link
        to="/publiceye-uae/research"
        className="inline-flex items-center gap-1.5 text-[13px] text-cyan hover:underline min-h-[36px]"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Research Library
      </Link>
      <aside className="rounded-2xl border border-amber-signal/45 bg-amber-signal/[0.12] px-4 py-3 flex items-start gap-2">
        <FlaskConical className="w-4 h-4 text-amber-signal shrink-0 mt-0.5" />
        <p className="text-[13px] text-foreground/90 leading-snug">
          Estimated regional briefing for the BrandEye prototype — public aviation thesis adapted for
          UAE/Gulf hubs. Not a live X sample.
        </p>
      </aside>
      <header className="space-y-2">
        <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-cyan inline-flex items-center gap-1.5">
          <Plane className="w-3.5 h-3.5" /> Case study · Gulf relevant
        </p>
        <h1 className="page-hero-title text-[1.45rem] sm:text-2xl">{HOOK_HEADLINE}</h1>
        <p className="text-[14px] text-muted-foreground leading-relaxed">{HOOK_SUB}</p>
      </header>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {HOOK_KPIS.map((k) => (
          <div key={k.label} className="dash-panel p-3">
            <p className="text-[10px] font-mono uppercase text-muted-foreground">{k.label}</p>
            <p className="text-[1.05rem] font-display font-semibold tabular-nums text-cyan">{k.value}</p>
            <p className="text-[11px] text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>
      <section className="dash-panel p-4 sm:p-5 space-y-2">
        <h2 className="font-display font-semibold">Why this matters in the UAE</h2>
        <p className="text-[14px] text-muted-foreground leading-relaxed">{EXECUTIVE_SUMMARY}</p>
        <p className="text-[14px] text-muted-foreground leading-relaxed">
          For Gulf hubs, the same three races show up in public talk: aircraft delivery trust, cabin
          connectivity, and whether AI ops is real or a slogan. This case sits on the BrandEye desk as
          a regional deep-dive — estimated, not a live pipeline run.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="font-display font-semibold text-[1.05rem]">Lanes in this brief</h2>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {SUBHEADLINES.map((s) => (
            <article key={s.id} className="rounded-xl border border-border/80 bg-card/50 p-3.5 space-y-1">
              <h3 className="text-[14px] font-display font-semibold">{s.title}</h3>
              <p className="text-[12.5px] text-muted-foreground leading-snug">{s.blurb}</p>
            </article>
          ))}
        </div>
      </section>
      <Link
        to="/publiceye-uae/desk"
        className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-full border border-cyan/45 bg-cyan/15 text-cyan text-[13px] font-medium"
      >
        Get this desk
      </Link>
    </main>
  );
}
