import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Building2,
  FlaskConical,
  Library,
  Lock,
  Brain,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ContactEmailMe } from "@/components/ContactEmailMe";
import { ResearchDeskNav } from "@/components/research/ResearchDeskNav";
import { RESEARCH_NORTH_STAR } from "@/lib/research-catalog";
import { ELENCHOS_TAGLINE } from "@/lib/brand";

const ENTERPRISE_DEFAULT_MESSAGE =
  "Hi — I'm interested in Enterprise for Elenchos: personalized dashboards, custom topics, and team research. Here's what we need:\n\n";

export const Route = createFileRoute("/research/")({
  head: () => ({
    meta: [
      { title: "Research Desk · Case studies, networks & on-demand reports · Elenchos" },
      {
        name: "description",
        content:
          "Elenchos Research Desk: library case studies, Networks Ledger, multi-source on-demand reports from $10, or Enterprise dashboards via contact.",
      },
      {
        property: "og:title",
        content: "Research Desk · Depth beyond the live pulse · Elenchos",
      },
      {
        property: "og:description",
        content:
          "Library, official networks tracker, and privacy-first multi-source reports. Live Topics stay on the Topics page.",
      },
      { property: "og:url", content: "https://elenchos.live/research" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/research" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Research Desk · Elenchos",
          description:
            "Case studies, networks ledger, and privacy-first on-demand research reports.",
          url: "https://elenchos.live/research",
          isPartOf: { "@type": "WebSite", name: "Elenchos", url: "https://elenchos.live" },
        }),
      },
    ],
  }),
  component: ResearchDeskLanding,
});

function ResearchDeskLanding() {
  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1100px] mx-auto w-full px-3 sm:px-4 md:px-8 py-5 sm:py-7 md:py-9 mobile-safe-bottom md:pb-16 relative flex-1 overflow-x-clip min-w-0">
        <ResearchDeskNav />

        <header className="page-hero-banner mb-5 sm:mb-7 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan/12 via-transparent to-rose-signal/6 pointer-events-none" />
          <div className="relative p-4 sm:p-5 md:p-7 min-w-0 space-y-3">
            <div className="page-hero-kicker">
              <FlaskConical className="w-3.5 h-3.5" aria-hidden />
              Research Desk
            </div>
            <h1 className="page-hero-title text-[1.4rem] sm:text-2xl md:text-[2rem] lg:text-[2.15rem] break-words hyphens-auto">
              Read briefs, track networks, or commission depth
            </h1>
            <p className="text-[13px] sm:text-[14px] font-display font-medium text-cyan/95 leading-snug max-w-xl break-words">
              {ELENCHOS_TAGLINE}
            </p>
            <p className="page-hero-sub max-w-2xl break-words">{RESEARCH_NORTH_STAR}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <Link
                to="/research/library"
                className="rd-btn-primary inline-flex items-center gap-2 min-h-[48px] px-5 py-2.5 rounded-full bg-cyan text-background font-display font-semibold text-[13px] shadow-[0_0_32px_-8px_var(--color-cyan-glow)] touch-manipulation"
              >
                <Library className="w-4 h-4" />
                Browse library
              </Link>
              <Link
                to="/research/networks-ledger"
                className="rd-btn-ghost inline-flex items-center gap-2 min-h-[48px] px-4 py-2.5 rounded-full border border-cyan/40 bg-cyan/10 text-cyan text-[13px] font-medium touch-manipulation"
              >
                <Brain className="w-4 h-4" />
                Intelligence
              </Link>
              <Link
                to="/research/commission"
                className="rd-btn-ghost inline-flex items-center gap-2 min-h-[48px] px-4 py-2.5 rounded-full border border-border text-[12px] text-muted-foreground hover:text-cyan touch-manipulation"
              >
                <Zap className="w-4 h-4" />
                On-demand from $10
              </Link>
            </div>
          </div>
        </header>

        <section
          aria-label="Why this desk is safe"
          className="mb-6 sm:mb-7 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3"
        >
          <TrustChip
            icon={<Lock className="w-3.5 h-3.5" />}
            title="Browse free"
            body="No account required for library, Networks Ledger, or public briefings."
            delay={0}
          />
          <TrustChip
            icon={<Shield className="w-3.5 h-3.5" />}
            title="Privacy-first pay"
            body="Card data stays with Stripe. Optional email is for one-time delivery only."
            delay={0.05}
          />
          <TrustChip
            icon={<Brain className="w-3.5 h-3.5" />}
            title="Limits shown"
            body="Sample sizes, sources, and confidence stay visible. Empty stays empty."
            delay={0.1}
          />
        </section>

        <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-3 px-0.5">
          Choose a path
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <PathCard
            delay={0}
            icon={<BookOpen className="w-6 h-6 text-cyan" />}
            step="01"
            title="Library"
            subtitle="Published case studies"
            body="All Elenchos multi-source case studies on one shelf — including public crisis briefings."
            cta="Open library"
            to="/research/library"
            glow="emerald"
          />
          <PathCard
            delay={0.05}
            icon={<Brain className="w-6 h-6 text-cyan" />}
            step="02"
            title="Intelligence"
            subtitle="Ledgers & citizen trackers"
            body="Designations ledger, fraud ledger shell, leadership board, peace index, and more."
            cta="Open intelligence"
            to="/research/networks-ledger"
            glow="cyan"
          />
          <PathCard
            delay={0.1}
            icon={<Sparkles className="w-6 h-6 text-cyan" />}
            step="03"
            title="On-demand report"
            subtitle="Your question · $10 / $20"
            body="Multi-source deep dive from $10. Unique private link + PDF. Topic X-analysis commissions stay under Topics."
            cta="Start commission"
            to="/research/commission"
            glow="rose"
            featured
          />
          <EnterprisePathCard delay={0.15} />
        </div>

        <section className="rounded-2xl border border-border/90 bg-card/40 p-4 sm:p-5 mb-8">
          <h2 className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-3">
            How an on-demand report works
          </h2>
          <ol className="grid sm:grid-cols-3 gap-2.5 sm:gap-3">
            {[
              {
                n: "1",
                t: "Choose package",
                d: "Pick multi-source depth. Write your research question in plain language.",
              },
              {
                n: "2",
                t: "Pay securely",
                d: "Stripe Checkout handles payment. Elenchos never sees or stores your card number.",
              },
              {
                n: "3",
                t: "Get private link",
                d: "Open your unique report URL and PDF. Optional one-time email delivery — not kept as a list.",
              },
            ].map((s) => (
              <li
                key={s.n}
                className="rd-step flex gap-3 min-h-[44px] rounded-xl border border-transparent px-2.5 py-2.5"
              >
                <span className="shrink-0 w-7 h-7 rounded-full border border-cyan/40 bg-cyan/10 text-cyan text-[12px] font-mono grid place-items-center">
                  {s.n}
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-display font-semibold text-foreground">{s.t}</p>
                  <p className="text-[12.5px] text-muted-foreground leading-snug mt-0.5 break-words">
                    {s.d}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="rd-cta-panel rounded-2xl border border-cyan/35 bg-gradient-to-br from-cyan/12 via-card/50 to-transparent p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between min-w-0">
          <div className="space-y-1.5 min-w-0">
            <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-cyan">
              Ready when you are
            </p>
            <p className="text-[15px] sm:text-base font-display font-semibold leading-snug break-words">
              Open the library, explore Intelligence tools, or commission a deeper brief.
            </p>
            <p className="text-[12.5px] text-muted-foreground leading-snug max-w-lg break-words">
              Same evidence discipline as the rest of Elenchos. Experimental research, not legal or
              investment advice.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link
              to="/research/commission"
              className="rd-btn-primary inline-flex items-center gap-2 min-h-[48px] px-5 py-2.5 rounded-full bg-cyan text-background font-semibold text-[13px] touch-manipulation"
            >
              Commission report <ArrowRight className="w-4 h-4" />
            </Link>
            <ContactEmailMe
              source="research-enterprise"
              variant="button"
              defaultMessage={ENTERPRISE_DEFAULT_MESSAGE}
              dialogTitle="Enterprise inquiry"
              dialogDescription="Tell us about personalized dashboards, custom topics, team access, or ongoing research. No self-serve checkout — we reply by email."
              className="rd-btn-ghost border-amber-signal/40 bg-amber-signal/10 text-amber-signal hover:bg-amber-signal/20"
            >
              <Building2 className="w-3.5 h-3.5" aria-hidden />
              Enterprise · contact
            </ContactEmailMe>
            <Link
              to="/about"
              className="rd-btn-ghost inline-flex items-center gap-1.5 min-h-[48px] px-4 py-2.5 rounded-full border border-border text-[13px] text-muted-foreground touch-manipulation"
            >
              About &amp; method
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function EnterprisePathCard({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="h-full min-w-0"
    >
      <div className="rd-card rd-card-amber group relative flex flex-col h-full rounded-2xl border border-amber-signal/40 bg-gradient-to-b from-amber-signal/10 to-card/80 p-4 sm:p-5 min-h-[200px] sm:min-h-[220px] min-w-0 overflow-hidden">
        <span className="absolute top-3 right-3 z-[1] text-[9px] font-mono uppercase tracking-[0.14em] text-amber-signal bg-amber-signal/15 border border-amber-signal/40 rounded-full px-2 py-0.5">
          Contact
        </span>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="rd-icon-lift w-11 h-11 rounded-xl border border-amber-signal/40 bg-amber-signal/10 grid place-items-center text-amber-signal">
            <Building2 className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-mono text-muted-foreground tabular-nums">04</span>
        </div>
        <h2 className="text-[16px] sm:text-[17px] font-display font-semibold text-foreground leading-snug group-hover:text-amber-signal transition-colors break-words">
          Enterprise
        </h2>
        <p className="text-[12px] text-amber-signal mt-0.5 font-medium">
          Personalized dashboards &amp; more
        </p>
        <p className="text-[13px] text-muted-foreground leading-relaxed mt-2.5 flex-1 break-words">
          Custom topics, branded or private dashboards, team workflows, and deeper ongoing research.
          Not self-serve checkout — we scope it with you.
        </p>
        <ContactEmailMe
          source="research-enterprise"
          variant="button"
          defaultMessage={ENTERPRISE_DEFAULT_MESSAGE}
          dialogTitle="Enterprise inquiry"
          dialogDescription="Describe your org, desired dashboards or topics, and timeline. No payment here — we reply and quote if it is a fit."
          className="mt-4 w-full justify-center border-amber-signal/45 bg-amber-signal/15 text-amber-signal hover:bg-amber-signal/25 font-semibold text-[13px]"
        >
          Email me about Enterprise
          <ArrowRight className="w-4 h-4" />
        </ContactEmailMe>
      </div>
    </motion.div>
  );
}

function TrustChip({
  icon,
  title,
  body,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="flex gap-2.5 rounded-xl border border-border/80 bg-card/40 px-3 py-2.5 min-w-0"
    >
      <span className="shrink-0 mt-0.5 text-cyan">{icon}</span>
      <div className="min-w-0">
        <p className="text-[12.5px] font-display font-semibold text-foreground">{title}</p>
        <p className="text-[11.5px] text-muted-foreground leading-snug mt-0.5 break-words">{body}</p>
      </div>
    </motion.div>
  );
}

function PathCard({
  icon,
  step,
  title,
  subtitle,
  body,
  cta,
  to,
  delay,
  featured,
  glow,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  subtitle: string;
  body: string;
  cta: string;
  to: string;
  delay: number;
  featured?: boolean;
  glow: "cyan" | "emerald" | "rose";
}) {
  const glowClass =
    glow === "rose" ? "rd-card-rose" : glow === "emerald" ? "rd-card-emerald" : "rd-card-cyan";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="h-full min-w-0"
    >
      <Link
        to={to}
        className={`rd-card ${glowClass} group relative flex flex-col h-full rounded-2xl border bg-card/60 backdrop-blur-sm p-4 sm:p-5 min-h-[200px] sm:min-h-[220px] touch-manipulation min-w-0 overflow-hidden ${
          featured
            ? "border-cyan/55 bg-gradient-to-b from-cyan/15 to-card/80 ring-1 ring-cyan/30"
            : "border-border/90"
        }`}
      >
        {featured && (
          <span className="absolute top-3 right-3 z-[1] text-[9px] font-mono uppercase tracking-[0.14em] text-cyan bg-cyan/15 border border-cyan/40 rounded-full px-2 py-0.5">
            Paid tool
          </span>
        )}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="rd-icon-lift w-11 h-11 rounded-xl border border-cyan/35 bg-cyan/10 grid place-items-center">
            {icon}
          </div>
          <span className="text-[11px] font-mono text-muted-foreground tabular-nums">{step}</span>
        </div>
        <h2 className="text-[16px] sm:text-[17px] font-display font-semibold text-foreground leading-snug group-hover:text-cyan transition-colors break-words">
          {title}
        </h2>
        <p className="text-[12px] text-cyan mt-0.5 font-medium break-words">{subtitle}</p>
        <p className="text-[13px] text-muted-foreground leading-relaxed mt-2.5 flex-1 break-words">
          {body}
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-cyan">
          {cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </Link>
    </motion.div>
  );
}
