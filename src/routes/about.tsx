import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Eye,
  FlaskConical,
  Layers,
  LineChart,
  MessageSquareQuote,
  Radio,
  Scale,
  Shield,
  Sparkles,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ContactEmailMe } from "@/components/ContactEmailMe";
import { ELENCHOS_TAGLINE } from "@/lib/brand";
import { ABOUT_SOCIAL, socialMetaTags } from "@/lib/social-meta";

/** @deprecated import from `@/lib/brand` */
export { ELENCHOS_TAGLINE };

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: socialMetaTags(ABOUT_SOCIAL),
    links: [{ rel: "canonical", href: ABOUT_SOCIAL.url }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1400px] mx-auto w-full px-2.5 sm:px-4 md:px-6 py-5 sm:py-8 mobile-safe-bottom md:pb-12 space-y-7 md:space-y-9 relative flex-1 overflow-x-clip min-w-0">
        {/* 1 · Hero — ἔλεγχος */}
        <header className="page-hero-banner overflow-hidden min-w-0 relative rounded-2xl border border-cyan/25">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_12%_0%,color-mix(in_oklab,var(--cyan)_20%,transparent),transparent_55%),radial-gradient(ellipse_at_88%_40%,color-mix(in_oklab,var(--cyan)_10%,transparent),transparent_50%)]" />
          <div className="relative p-4 sm:p-5 md:p-7 space-y-3.5 min-w-0 w-full">
            <div className="page-hero-kicker">
              <Radio className="w-3.5 h-3.5" aria-hidden />
              About
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start w-full min-w-0">
              <div className="lg:col-span-7 min-w-0 space-y-3">
                <h1 className="page-hero-title text-[1.55rem] sm:text-3xl md:text-[2.15rem] break-words">
                  Elenchos <span className="text-cyan">ἔλεγχος</span>
                </h1>
                <p className="text-[15px] sm:text-base font-display font-medium text-cyan/95 leading-snug">
                  {ELENCHOS_TAGLINE}
                </p>
                <p className="text-[14px] sm:text-[14.5px] text-foreground/90 leading-relaxed">
                  In ancient Greek, <em className="text-cyan not-italic font-medium">elenchos</em>{" "}
                  (ἔλεγχος) means{" "}
                  <strong className="text-foreground font-semibold">cross-examination</strong> and{" "}
                  <strong className="text-foreground font-semibold">refutation</strong> — the
                  disciplined testing of claims under questioning. That is the spirit of this desk:
                  we examine the gap between{" "}
                  <strong className="text-foreground font-semibold">
                    what ordinary people say in public
                  </strong>{" "}
                  and{" "}
                  <strong className="text-foreground font-semibold">
                    what official or media frames assert
                  </strong>
                  , so citizens can weigh evidence instead of slogans.
                </p>
              </div>
              <div className="lg:col-span-5 min-w-0 space-y-3 lg:pt-1">
                <p className="text-[13px] sm:text-[13.5px] text-muted-foreground leading-relaxed">
                  EU based · human-managed. AI powered analysis; it does not invent voices.
                </p>
                <p className="text-[10.5px] sm:text-[11px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                  Citizen voices vs official narratives · Data, not dogma · Human-managed
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Link
                    to="/research/library"
                    className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full bg-cyan text-background text-[13px] font-semibold touch-manipulation"
                  >
                    Open Research <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <ContactEmailMe
                    source="about-hero"
                    variant="button"
                    className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full border border-cyan/40 bg-cyan/10 text-cyan text-[13px] font-medium touch-manipulation"
                  >
                    Contact me
                  </ContactEmailMe>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 2 · Freemium */}
        <section aria-labelledby="about-freemium">
          <h2
            id="about-freemium"
            className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-3"
          >
            Free work &amp; custom research
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-emerald-signal/35 bg-card/50 p-4 sm:p-5 space-y-2.5 flex flex-col min-h-[160px] transition-colors hover:border-emerald-signal/55 hover:bg-card/70">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-lg border border-emerald-signal/35 bg-emerald-signal/10 text-emerald-signal grid place-items-center">
                  <Eye className="w-4 h-4" aria-hidden />
                </span>
                <p className="font-display font-semibold text-[15px]">Free</p>
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed flex-1">
                <strong className="text-foreground/90 font-medium">Dashboard + Research Library</strong>{" "}
                — all published work: topic analyses, case studies, trackers, and ledgers. No account
                required.
              </p>
              <Link
                to="/research/library"
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-cyan self-start min-h-[36px]"
              >
                Browse free work <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="rounded-2xl border border-cyan/40 bg-card/50 p-4 sm:p-5 space-y-2.5 flex flex-col min-h-[160px] transition-colors hover:border-cyan/60 hover:bg-card/70">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-lg border border-cyan/35 bg-cyan/10 text-cyan grid place-items-center">
                  <Sparkles className="w-4 h-4" aria-hidden />
                </span>
                <p className="font-display font-semibold text-[15px]">Custom research</p>
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed flex-1">
                <strong className="text-foreground/90 font-medium">Contact only</strong> —
                private briefs, custom topics, or team dashboards. No public self-serve checkout
                while Pro is in operator testing.
              </p>
              <ContactEmailMe
                source="about-custom"
                variant="link"
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-cyan self-start min-h-[36px]"
              >
                Contact me <ArrowRight className="w-3.5 h-3.5" />
              </ContactEmailMe>
            </div>
          </div>
        </section>

        {/* 3 · Why X */}
        <section aria-labelledby="about-why-x" className="space-y-3">
          <h2
            id="about-why-x"
            className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground"
          >
            Why X
          </h2>
          <div className="rounded-2xl border border-amber-signal/30 bg-card/50 p-4 sm:p-5 flex gap-3 sm:gap-4 transition-colors hover:border-amber-signal/45 hover:bg-card/70">
            <span className="shrink-0 w-10 h-10 rounded-xl border border-amber-signal/35 bg-amber-signal/10 text-amber-signal grid place-items-center">
              <MessageSquareQuote className="w-5 h-5" aria-hidden />
            </span>
            <div className="min-w-0 space-y-2">
              <p className="font-display font-semibold text-[15px]">
                Free speech makes citizen voices audible enough to examine
              </p>
              <p className="text-[13.5px] text-muted-foreground leading-relaxed">
                X is where public speech still moves fast and often stays visible. We sample{" "}
                <strong className="text-foreground/85 font-medium">public</strong> posts to hear
                citizen language that press cycles and closed platforms can bury. In restricted
                environments, whole conversations disappear from feeds or never appear — studying
                open discourse is one way to surface what official frames leave out. Free speech is
                not a slogan here; it is the condition that makes ordinary voices audible enough to
                examine.
              </p>
            </div>
          </div>
        </section>

        {/* 4 · Method */}
        <section aria-labelledby="about-method" className="space-y-3">
          <h2
            id="about-method"
            className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground"
          >
            How the method works
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {[
              {
                t: "Sample",
                d: "Purposive public sample on one topic — a digital focus group, not a national poll.",
                icon: Layers,
              },
              {
                t: "Structure",
                d: "Socratic questions, sentiment, and narrative-gap framing.",
                icon: FlaskConical,
              },
              {
                t: "Human gate",
                d: "Human-managed research. AI drafts and scores; empty stays empty — we do not invent voices.",
                icon: Shield,
              },
              {
                t: "Show limits",
                d: "Sample size, confidence, and honesty notes stay visible so you can weigh the evidence.",
                icon: Scale,
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.t}
                  className="rounded-xl border border-border bg-card/50 p-3.5 space-y-2 transition-all hover:border-cyan/40 hover:bg-card/80 hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-cyan shrink-0" aria-hidden />
                    <p className="text-[13px] font-display font-semibold text-cyan">{s.t}</p>
                  </div>
                  <p className="text-[12.5px] text-muted-foreground leading-snug">{s.d}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5 · What you can do */}
        <section aria-labelledby="about-surfaces">
          <h2
            id="about-surfaces"
            className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-3"
          >
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
              to="/research/library"
              icon={<Layers className="w-4 h-4" />}
              title="Research"
              body="Free published Library — topics, case studies, trackers, and ledgers."
            />
            <div className="rounded-2xl border border-border/90 bg-card/50 p-4 min-h-[44px] space-y-2">
              <div className="w-9 h-9 rounded-lg border border-cyan/35 bg-cyan/10 grid place-items-center text-cyan">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="font-display font-semibold text-[15px]">Custom research</p>
              <p className="text-[12.5px] text-muted-foreground mt-1 leading-snug">
                Private briefs and team work — contact only. Public Library stays free.
              </p>
              <ContactEmailMe
                source="about-surfaces"
                variant="link"
                className="inline-flex items-center gap-1 text-[12px] text-cyan mt-3 font-medium"
              >
                Contact me <ArrowRight className="w-3.5 h-3.5" />
              </ContactEmailMe>
            </div>
          </div>
        </section>

        {/* 6 · Honest limits */}
        <section className="rounded-xl border border-border bg-card/40 p-4 sm:p-5 space-y-2">
          <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground flex items-center gap-2">
            <Scale className="w-3.5 h-3.5 text-cyan" /> Honest limits
          </p>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            Elenchos is experimental research infrastructure. Insights are{" "}
            <strong className="text-foreground/85 font-medium">directional</strong>, not verdicts.
            Not legal, medical, or investment advice. Not affiliated with governments or platforms we
            analyse. Corrections:{" "}
            <ContactEmailMe source="about" variant="inline" className="text-cyan text-[13px]" />.
          </p>
        </section>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/research/library"
            className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full border border-cyan/40 bg-cyan/12 text-cyan text-[13px] font-medium touch-manipulation"
          >
            Open Research
          </Link>
          <ContactEmailMe
            source="about-footer"
            variant="button"
            className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full border border-border text-[13px] text-muted-foreground hover:text-cyan hover:border-cyan/40 touch-manipulation"
          >
            Contact me
          </ContactEmailMe>
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
      className="group block rounded-2xl border border-border/90 bg-card/50 hover:border-cyan/50 hover:bg-card/80 hover:-translate-y-0.5 p-4 min-h-[44px] touch-manipulation transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40"
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
