import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  FlaskConical,
  Layers,
  LineChart,
  Lock,
  Radio,
  Scale,
  Sparkles,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ContactEmailMe } from "@/components/ContactEmailMe";
import { ELENCHOS_TAGLINE } from "@/lib/brand";

/** @deprecated import from `@/lib/brand` */
export { ELENCHOS_TAGLINE };

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Elenchos · Public discourse & Research Desk" },
      {
        name: "description",
        content:
          "Elenchos (ἔλεγχος) applies the Socratic method to public discourse on X and offers a privacy-first Research Desk for case studies and on-demand reports. Safe place to check and generate research.",
      },
      { property: "og:title", content: "About Elenchos · Public discourse & Research Desk" },
      {
        property: "og:description",
        content:
          "Citizen voices vs official frames. Topics analysis on X. Research Desk for deep dives and on-demand reports. Privacy-first.",
      },
      { property: "og:url", content: "https://elenchos.live/about" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[900px] mx-auto w-full px-4 md:px-6 py-6 md:py-10 mobile-safe-bottom md:pb-12 space-y-10 md:space-y-14 relative flex-1 overflow-x-clip">
        <header className="page-hero-banner">
          <div className="p-4 sm:p-5 md:p-6 space-y-3">
            <div className="page-hero-kicker">
              <Radio className="w-3.5 h-3.5" aria-hidden />
              About
            </div>
            <h1 className="page-hero-title text-[1.5rem] sm:text-3xl md:text-[2.1rem]">
              Elenchos <span className="text-cyan">ἔλεγχος</span>
            </h1>
            <p className="text-[15px] sm:text-base font-display font-medium text-cyan/95 leading-snug max-w-xl">
              {ELENCHOS_TAGLINE}
            </p>
            <p className="page-hero-sub max-w-2xl text-[14px] leading-relaxed">
              Ancient Greek for cross-examination. We help ordinary people see the gap between
              public conversation and official or media frames — and run deeper research when a
              topic needs more than a pulse.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                to="/topics"
                className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full bg-cyan text-background text-[13px] font-semibold touch-manipulation"
              >
                Explore Topics <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/research"
                className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full border border-cyan/40 bg-cyan/10 text-cyan text-[13px] font-medium touch-manipulation"
              >
                Research Desk
              </Link>
            </div>
          </div>
        </header>

        {/* Safe environment */}
        <section className="rounded-2xl border border-cyan/35 bg-cyan/[0.07] p-4 sm:p-5 space-y-2">
          <p className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-cyan">
            <Lock className="w-3.5 h-3.5" /> A safe place to check and generate research
          </p>
          <ul className="text-[13.5px] text-foreground/90 space-y-1.5 leading-relaxed">
            <li>· Browse the site without an account.</li>
            <li>· We do not sell personal dossiers or store card numbers.</li>
            <li>· On-demand reports use a unique private link + optional one-time email delivery.</li>
            <li>· Methods and sample sizes are shown so you can weigh the evidence.</li>
          </ul>
        </section>

        {/* Three products */}
        <section>
          <h2 className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-3">
            What you can do here
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <ProductCard
              to="/"
              icon={<LineChart className="w-4 h-4" />}
              title="Dashboard"
              body="Live citizen signals, globe, and cross-topic read for active topics."
            />
            <ProductCard
              to="/topics"
              icon={<Layers className="w-4 h-4" />}
              title="Topics"
              body="Per-topic public discourse analysis: Socratic questions, sentiment, narrative gap."
            />
            <ProductCard
              to="/research"
              icon={<FlaskConical className="w-4 h-4" />}
              title="Research Desk"
              body="Deep-dive case studies, crisis packages, and on-demand reports from $10."
            />
          </div>
        </section>

        {/* Method short */}
        <section className="space-y-3">
          <h2 className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            How Topics analysis works
          </h2>
          <div className="grid sm:grid-cols-3 gap-2.5">
            {[
              {
                t: "Sample",
                d: "A purposive public sample of posts on one topic — a digital focus group, not a national poll.",
              },
              {
                t: "Structure",
                d: "Socratic questions, sentiment, and narrative-gap framing under human management.",
              },
              {
                t: "Show limits",
                d: "Sample size and confidence stay visible. Empty stays empty — we do not invent voices.",
              },
            ].map((s) => (
              <div
                key={s.t}
                className="rounded-xl border border-border bg-card/50 p-3.5"
              >
                <p className="text-[13px] font-display font-semibold text-cyan">{s.t}</p>
                <p className="text-[12.5px] text-muted-foreground mt-1 leading-snug">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card/40 p-4 space-y-2">
          <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground flex items-center gap-2">
            <Scale className="w-3.5 h-3.5 text-cyan" /> Honest limits
          </p>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            Elenchos is experimental research infrastructure. Insights are directional. Not legal,
            medical, or investment advice. Not affiliated with governments or platforms we analyze.
            Corrections:{" "}
            <ContactEmailMe source="about" variant="inline" className="text-cyan text-[13px]" />.
          </p>
        </section>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/research/commission"
            className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full border border-cyan/40 bg-cyan/12 text-cyan text-[13px] font-medium touch-manipulation"
          >
            <Sparkles className="w-3.5 h-3.5" /> Commission a report
          </Link>
          <Link
            to="/privacy"
            className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full border border-border text-[13px] text-muted-foreground touch-manipulation"
          >
            Privacy notice
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function ProductCard({
  to,
  icon,
  title,
  body,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      className="group block rounded-2xl border border-border/90 bg-card/50 hover:border-cyan/45 p-4 min-h-[44px] touch-manipulation transition-colors"
    >
      <div className="w-9 h-9 rounded-lg border border-cyan/35 bg-cyan/10 grid place-items-center text-cyan mb-2.5">
        {icon}
      </div>
      <p className="font-display font-semibold text-[15px] group-hover:text-cyan">{title}</p>
      <p className="text-[12.5px] text-muted-foreground mt-1 leading-snug">{body}</p>
      <span className="inline-flex items-center gap-1 text-[12px] text-cyan mt-3 font-medium">
        Open <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </span>
    </Link>
  );
}
