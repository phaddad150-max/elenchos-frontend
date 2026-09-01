import { createFileRoute, Link, getRouteApi } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { SolvoPlans } from "@/components/desk/SolvoPlans";
import { SOLVO_INSIGHT_AED, SOLVO_PULSE_AED, SOLVO_SETUP_AED, formatAed } from "@/lib/desk/catalog";

const parentRoute = getRouteApi("/solvocreations-uae");

export const Route = createFileRoute("/solvocreations-uae/desk")({
  validateSearch: (s: Record<string, unknown>): { cancelled?: "1" } =>
    s.cancelled === "1" || s.cancelled === true ? { cancelled: "1" } : {},
  component: SolvoDeskPlansPage,
});

function SolvoDeskPlansPage() {
  const { desk } = parentRoute.useLoaderData();
  const search = Route.useSearch();
  if (!desk) return null;
  return (
    <main className="max-w-[720px] mx-auto w-full px-3 sm:px-4 md:px-6 py-6 sm:py-10 space-y-8 mobile-safe-bottom">
      <header className="space-y-3 text-center">
        <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-cyan">Solvo Creations · UAE</p>
        <h1 className="page-hero-title text-[1.6rem] sm:text-[2rem] leading-tight">
          This dashboard. Your brand. Live in a week.
        </h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-xl mx-auto">
          You just walked Home and Research Desk. Setup puts that layout on your URL. A monthly plan
          keeps the weekly sample running.
        </p>
      </header>

      <section className="grid sm:grid-cols-2 gap-3">
        <div className="dash-panel p-4 space-y-2">
          <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">You just saw</p>
          <ul className="text-[13.5px] text-foreground/90 space-y-1.5">
            <li>Dashboard — discourse, globe, leaders</li>
            <li>Research Desk — topics, aviation, trackers</li>
            <li>Nine-question briefings with scores</li>
          </ul>
          <Link to="/solvocreations-uae" className="inline-flex items-center gap-1 text-[12px] text-cyan">
            Back to dashboard <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="dash-panel p-4 space-y-2">
          <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">You get</p>
          <ul className="text-[13.5px] text-foreground/90 space-y-1.5">
            {[
              "Same layout, Solvo Creations brand",
              "15 topics, weekly public-X sample",
              "Scoring stays locked — we run the method",
            ].map((line) => (
              <li key={line} className="flex gap-2 items-start">
                <Check className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ol className="grid sm:grid-cols-3 gap-3">
        {[
          { n: "1", t: "Setup once", d: `${formatAed(SOLVO_SETUP_AED)} — brand, URL, 15 topics.` },
          {
            n: "2",
            t: "Pick a plan",
            d: `Pulse ${formatAed(SOLVO_PULSE_AED)}/mo (n=120) or Insight ${formatAed(SOLVO_INSIGHT_AED)}/mo (n=1000 + 1 hr/week).`,
          },
          { n: "3", t: "Go live", d: "Weekly refresh included. No per-topic run fee." },
        ].map((s) => (
          <li key={s.n} className="dash-panel p-4 space-y-1.5">
            <p className="text-[11px] font-mono text-cyan">{s.n}</p>
            <p className="font-display font-semibold">{s.t}</p>
            <p className="text-[13px] text-muted-foreground leading-relaxed">{s.d}</p>
          </li>
        ))}
      </ol>

      {search.cancelled ? (
        <p className="text-[13px] text-amber-signal text-center">Checkout cancelled. Pick a plan below.</p>
      ) : null}

      <SolvoPlans />
    </main>
  );
}
