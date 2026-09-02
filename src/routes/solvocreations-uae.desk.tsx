import { createFileRoute, Link, getRouteApi } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

const parentRoute = getRouteApi("/solvocreations-uae");

export const Route = createFileRoute("/solvocreations-uae/desk")({
  validateSearch: (s: Record<string, unknown>): { cancelled?: "1" } =>
    s.cancelled === "1" || s.cancelled === true ? { cancelled: "1" } : {},
  component: SolvoDeskAboutPage,
});

function SolvoDeskAboutPage() {
  const { desk } = parentRoute.useLoaderData();
  if (!desk) return null;
  return (
    <main className="max-w-[720px] mx-auto w-full px-3 sm:px-4 md:px-6 py-6 sm:py-10 space-y-6 mobile-safe-bottom">
      <header className="space-y-3 text-center">
        <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-cyan">Solvo Creations · UAE</p>
        <h1 className="page-hero-title text-[1.6rem] sm:text-[2rem] leading-tight">
          Prototype walkthrough
        </h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-xl mx-auto">
          This is a simulated public-discourse desk for Solvo Creations. Home and Research Desk are
          the product preview. No plans or checkout on this prototype.
        </p>
      </header>
      <section className="dash-panel p-4 sm:p-5 space-y-2">
        <p className="text-[13.5px] text-foreground/90 leading-relaxed">
          Scoring stays locked on Elenchos. Official and media frames are contrast only. Data on this
          URL is labeled simulated / estimated.
        </p>
        <p className="text-[13.5px] text-muted-foreground leading-relaxed">
          Solvo Creations — Dubai B2B growth partner.{" "}
          <a href="https://www.solvocreations.com/" className="text-cyan hover:underline">
            solvocreations.com
          </a>
        </p>
      </section>
      <Link
        to="/solvocreations-uae"
        className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-full border border-cyan/45 bg-cyan/15 text-cyan text-[13px] font-medium"
      >
        Back to dashboard <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </main>
  );
}
