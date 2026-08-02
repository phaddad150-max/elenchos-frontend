import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  FlaskConical,
  Home,
  Lock,
  ShieldAlert,
  Trophy,
  Users,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import {
  listResearchBriefs,
  RESEARCH_NORTH_STAR,
  researchStatusLabel,
} from "@/lib/research-catalog";

export const Route = createFileRoute("/research/")({
  head: () => ({
    meta: [
      { title: "Research Desk · Elenchos" },
      {
        name: "description",
        content:
          "Open research desk: national security briefs, thesis-style case studies, and indexes. Not live Topics scores. We do not collect personal identity for browsing.",
      },
      { property: "og:title", content: "Research Desk · Elenchos" },
      {
        property: "og:description",
        content:
          "Free-form multi-source research for citizens and serious readers. Privacy-first. Separate from live topic scores.",
      },
      { property: "og:url", content: "https://elenchos.live/research" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/research" }],
  }),
  component: ResearchDeskPage,
});

function ResearchDeskPage() {
  const briefs = listResearchBriefs();

  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1100px] mx-auto w-full px-3 sm:px-4 md:px-8 py-6 sm:py-8 md:py-10 mobile-safe-bottom md:pb-16 relative flex-1 overflow-x-clip">
        <header className="page-hero-banner mb-6 sm:mb-8">
          <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(200px,34%)] items-stretch min-h-0">
            <div className="relative z-[2] flex flex-col justify-center gap-2 p-4 sm:p-5 md:p-6 min-w-0">
              <div className="page-hero-kicker">
                <FlaskConical className="w-3.5 h-3.5" aria-hidden />
                Research desk
              </div>
              <h1 className="page-hero-title text-[1.45rem] sm:text-2xl md:text-[1.9rem] lg:text-[2.15rem] break-words">
                Research desk — not live topic scores
              </h1>
              <p className="page-hero-sub max-w-xl">{RESEARCH_NORTH_STAR}</p>
              <p className="text-[12px] sm:text-[13px] text-muted-foreground leading-relaxed max-w-xl border border-border/80 rounded-lg bg-card/40 px-3 py-2">
                <Lock className="w-3.5 h-3.5 text-cyan inline mr-1.5 align-[-2px]" aria-hidden />
                <strong className="text-foreground/90">Privacy:</strong> browsing the desk does not
                require an account. We do not collect or store personal identity for reading public
                research. Paid commissions (coming) use one-time checkout — we never store card or
                crypto wallet secrets.
              </p>
              <Link
                to="/"
                className="mt-1 inline-flex items-center gap-1.5 self-start rounded-full border border-cyan/40 bg-cyan/10 hover:bg-cyan/18 text-cyan px-3.5 py-2 text-[12px] font-medium transition-colors min-h-[40px] touch-manipulation"
              >
                <Home className="w-3.5 h-3.5" />
                Back to homepage
              </Link>
            </div>

            <div
              className="page-hero-art hidden lg:block min-h-[140px] relative"
              aria-hidden
            >
              <img
                src="/brand/research-side-banner.png"
                alt=""
                className="absolute inset-0 object-cover object-center"
                loading="eager"
                decoding="async"
              />
              <div className="page-hero-blend" />
            </div>
          </div>
        </header>

        {/* Section: National security */}
        <section className="mb-7 sm:mb-9 space-y-3" aria-labelledby="desk-ns">
          <div className="flex items-center gap-2 px-0.5">
            <ShieldAlert className="w-4 h-4 text-rose-signal" aria-hidden />
            <h2
              id="desk-ns"
              className="text-[11px] font-mono uppercase tracking-[0.18em] text-rose-signal"
            >
              National security &amp; risk briefs
            </h2>
          </div>
          <Link
            to="/research-migration"
            className="group block rounded-2xl border border-rose-signal/40 bg-rose-signal/[0.06] hover:border-rose-signal/55 hover:bg-rose-signal/[0.1] transition-all px-3.5 sm:px-5 py-4 touch-manipulation min-h-[44px]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-rose-signal">
                  EU + UK Channel · since 2011
                </p>
                <h3 className="text-[15px] sm:text-[16px] font-display font-semibold text-foreground group-hover:text-rose-signal transition-colors">
                  Irregular migration intelligence
                </h3>
                <p className="text-[12.5px] text-muted-foreground leading-relaxed">
                  10-second thesis · full picture under 10 minutes. Frontline states, open vs
                  resist, discourse labels, reverse options. Free open data first.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-rose-signal shrink-0 mt-1 opacity-80 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </section>

        {/* Section: Thesis-style case studies */}
        <section className="mb-7 sm:mb-9 space-y-3" aria-labelledby="desk-thesis">
          <div className="flex items-center justify-between gap-2 px-0.5">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan" aria-hidden />
              <h2
                id="desk-thesis"
                className="text-[11px] font-mono uppercase tracking-[0.18em] text-cyan"
              >
                Thesis-style case studies
              </h2>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground tabular-nums">
              {briefs.length} on desk
            </span>
          </div>

          {briefs.map((b, i) => (
            <motion.div
              key={b.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
            >
              <Link
                to="/research/preview/$slug"
                params={{ slug: b.slug }}
                className="group block rounded-2xl border border-border/90 bg-card/50 hover:border-cyan/45 hover:bg-cyan/[0.06] active:bg-cyan/10 transition-all px-3.5 sm:px-5 py-4 text-left touch-manipulation min-w-0 shadow-[0_1px_0_color-mix(in_oklab,var(--foreground)_5%,transparent)] hover:shadow-[0_0_24px_-12px_var(--color-cyan-glow)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-cyan">
                        Case study · {b.region}
                      </p>
                      <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground border border-border/80 rounded-full px-2 py-0.5">
                        {researchStatusLabel(b.status)}
                      </span>
                    </div>
                    <h3 className="text-[15px] sm:text-[16px] font-display font-semibold text-foreground leading-snug group-hover:text-cyan transition-colors">
                      {b.title}
                    </h3>
                    <p className="text-[12.5px] sm:text-[13px] text-muted-foreground leading-relaxed">
                      {b.subtitle}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {b.themes.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-mono text-muted-foreground/90 border border-border/70 rounded-md px-1.5 py-0.5"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-cyan shrink-0 mt-1 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                {b.pdfUrl ? (
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
                    <FileText className="w-3 h-3 text-cyan" />
                    Short PDF available
                  </span>
                ) : null}
              </Link>
            </motion.div>
          ))}
        </section>

        {/* Section: Indexes */}
        <section className="mb-7 sm:mb-9 space-y-3" aria-labelledby="desk-idx">
          <div className="flex items-center gap-2 px-0.5">
            <Trophy className="w-4 h-4 text-amber-signal" aria-hidden />
            <h2
              id="desk-idx"
              className="text-[11px] font-mono uppercase tracking-[0.18em] text-amber-signal"
            >
              Indexes &amp; leaderboards
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
            <IndexCard
              title="Leaders trust index"
              note="Citizen-scored leader rankings from public discourse. Tracker hub temporarily redirected — surface returns as desk grows."
              href="/trackers/leaders"
            />
            <IndexCard
              title="Peace & normalisation"
              note="Country peace-health and momentum signals. Same tracker family as leaders."
              href="/trackers/peace"
            />
          </div>
        </section>

        {/* Section: Commission research */}
        <section
          className="rounded-2xl border border-cyan/35 bg-cyan/[0.06] px-3.5 sm:px-5 py-4 sm:py-5 space-y-3"
          aria-labelledby="desk-open"
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan" aria-hidden />
            <h2
              id="desk-open"
              className="text-[11px] font-mono uppercase tracking-[0.18em] text-cyan"
            >
              Open desk · commission a brief
            </h2>
          </div>
          <p className="text-[13px] sm:text-[14px] text-foreground/90 leading-relaxed max-w-2xl">
            Same structured format as public desk work: method, multi-source evidence, claims with
            confidence and falsifiers, explicit limits. Choose any topic — personal, professional,
            or academic. Built as a <strong>safe place for critical questions</strong>.
          </p>
          <ul className="text-[12.5px] text-muted-foreground space-y-1 max-w-2xl">
            <li className="flex gap-2">
              <span className="text-cyan shrink-0">›</span>
              One-time fee (card via Stripe Checkout; crypto option planned) — no subscription
            </li>
            <li className="flex gap-2">
              <span className="text-cyan shrink-0">›</span>
              We do not store card numbers or wallet secrets (processor handles payment)
            </li>
            <li className="flex gap-2">
              <span className="text-cyan shrink-0">›</span>
              No research dossier sold on the researcher — the product is the report, not you
            </li>
            <li className="flex gap-2">
              <span className="text-cyan shrink-0">›</span>
              Human review gate on claims before “published” delivery (recommended)
            </li>
          </ul>
          <p className="text-[12px] font-mono text-muted-foreground border border-border/80 rounded-lg bg-card/50 px-3 py-2.5 max-w-xl">
            Checkout UI · coming next. Pricing sketch: lite structured brief ~€49–99 · full
            thesis-style pack ~€149–299. Reply if you want different tiers before we wire Stripe.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function IndexCard({
  title,
  note,
  href,
}: {
  title: string;
  note: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="block rounded-xl border border-border/90 bg-card/40 hover:border-amber-signal/45 px-3.5 py-3.5 transition-colors touch-manipulation min-h-[44px]"
    >
      <p className="text-[14px] font-display font-semibold text-foreground mb-1">{title}</p>
      <p className="text-[12px] text-muted-foreground leading-snug">{note}</p>
    </a>
  );
}
