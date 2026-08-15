import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Building2,
  Check,
  ExternalLink,
  FileText,
  FlaskConical,
  Library,
  Lock,
  Zap,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ContactEmailMe } from "@/components/ContactEmailMe";
import { ResearchDeskNav } from "@/components/research/ResearchDeskNav";
import { ELENCHOS_TAGLINE } from "@/lib/brand";
import {
  DESK_PACKAGES,
  LANDING_TIER_IDS,
  type DeskPackageId,
} from "@/lib/research-desk/packages";

const ENTERPRISE_DEFAULT_MESSAGE =
  "Hi — I'm interested in Enterprise for Elenchos: personalized dashboards, custom topics, and team research. Here's what I need:\n\n";

const SAMPLE_DEEP = DESK_PACKAGES["deep-no-x"];
const SAMPLE_TOPIC = DESK_PACKAGES["topic-analysis"];

export const Route = createFileRoute("/research/")({
  head: () => ({
    meta: [
      {
        title: "Research Desk · Free briefs or commission depth · Elenchos",
      },
      {
        name: "description",
        content:
          "Elenchos Research Desk: free case studies and citizen trackers, or commission a multi-source report for $10 / $20. Privacy-first Stripe checkout. Run by an independent researcher in the EU.",
      },
      {
        property: "og:title",
        content: "Research Desk · Read free or commission depth · Elenchos",
      },
      {
        property: "og:description",
        content:
          "Browse free Library and Intelligence tools, or commission a multi-source report. No account. Card data stays with Stripe.",
      },
      { property: "og:url", content: "https://elenchos.live/research" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/research" }],
  }),
  component: ResearchDeskLanding,
});

function ResearchDeskLanding() {
  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[960px] mx-auto w-full px-3 sm:px-4 md:px-8 py-5 sm:py-7 md:py-9 mobile-safe-bottom md:pb-16 relative flex-1 overflow-x-clip min-w-0">
        <ResearchDeskNav />

        {/* 1 · HERO — two actions only */}
        <header className="page-hero-banner mb-6 sm:mb-8 overflow-hidden relative min-w-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan/12 via-transparent to-rose-signal/6 pointer-events-none" />
          <div className="relative p-4 sm:p-5 md:p-7 min-w-0 space-y-3">
            <div className="page-hero-kicker">
              <FlaskConical className="w-3.5 h-3.5" aria-hidden />
              Research Desk
            </div>
            <h1 className="page-hero-title text-[1.45rem] sm:text-2xl md:text-[2rem] break-words hyphens-auto">
              Read free briefs or commission depth
            </h1>
            <p className="text-[13px] sm:text-[14px] text-muted-foreground leading-relaxed max-w-2xl break-words">
              Multi-source case studies and citizen trackers free. Fixed-price deep dives when you
              need more. {ELENCHOS_TAGLINE}
            </p>
            <p className="text-[12px] text-muted-foreground/90 leading-snug max-w-xl break-words">
              Elenchos is run by an independent researcher (EU). No team facade — education, open
              research, and tools you can use privately.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <a
                href="#free-resources"
                className="rd-btn-ghost inline-flex items-center gap-2 min-h-[48px] px-4 py-2.5 rounded-full border border-cyan/40 bg-cyan/10 text-cyan text-[13px] font-medium touch-manipulation"
              >
                <Library className="w-4 h-4" />
                Browse free Library &amp; Intelligence
              </a>
              <a
                href="#commission"
                className="rd-btn-primary inline-flex items-center gap-2 min-h-[48px] px-5 py-2.5 rounded-full bg-cyan text-background font-display font-semibold text-[13px] shadow-[0_0_32px_-8px_var(--color-cyan-glow)] touch-manipulation"
              >
                <Zap className="w-4 h-4" />
                Commission a report ($10 / $20)
              </a>
            </div>
          </div>
        </header>

        {/* 2 · ON-DEMAND — primary focus */}
        <section
          id="commission"
          className="scroll-mt-28 mb-8 sm:mb-10 space-y-4"
          aria-labelledby="commission-heading"
        >
          <div className="px-0.5 min-w-0 space-y-1">
            <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-cyan">
              On-demand · fixed price
            </p>
            <h2
              id="commission-heading"
              className="text-[1.2rem] sm:text-xl font-display font-semibold text-foreground break-words"
            >
              Commission a multi-source report
            </h2>
            <p className="text-[13px] text-muted-foreground leading-relaxed max-w-2xl break-words">
              Write your question in plain language. Pay once via Stripe. Get a unique private link
              + PDF — typically{" "}
              <strong className="text-foreground/90 font-medium">seconds to a few minutes</strong>{" "}
              after payment (automated; no manual admin queue). Commissioned reports never overwrite
              live Topics history.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {LANDING_TIER_IDS.map((id, i) => (
              <TierCard key={id} packageId={id} featured={id === "deep-with-x"} delay={i * 0.05} />
            ))}
          </div>

          <div className="rounded-2xl border border-border/90 bg-card/40 p-4 sm:p-5 space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                {
                  n: "1",
                  t: "Choose package & question",
                  d: "Standard multi-source ($10) or deeper + X discourse ($20). Plain language is enough.",
                },
                {
                  n: "2",
                  t: "Pay once on Stripe",
                  d: "Card data stays with Stripe. Elenchos does not store your payment details or build a user profile.",
                },
                {
                  n: "3",
                  t: "Open your private link + PDF",
                  d: "Automated delivery in minutes. Optional one-time email for the link only — not a mailing list.",
                },
              ].map((s) => (
                <div key={s.n} className="flex gap-2.5 min-w-0">
                  <span className="shrink-0 w-7 h-7 rounded-full border border-cyan/40 bg-cyan/10 text-cyan text-[12px] font-mono grid place-items-center">
                    {s.n}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-display font-semibold">{s.t}</p>
                    <p className="text-[12px] text-muted-foreground leading-snug mt-0.5 break-words">
                      {s.d}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <ul className="grid sm:grid-cols-2 gap-1.5 text-[12.5px] text-foreground/90">
              {[
                "Unique private report URL + PDF download",
                "Method, sources, limits, confidence where claims exist",
                "No account required · experimental research, not legal advice",
                "Commissioned analysis stored separately from live Topics tables",
              ].map((line) => (
                <li key={line} className="flex gap-2 items-start min-w-0">
                  <Check className="w-3.5 h-3.5 text-emerald-signal shrink-0 mt-0.5" />
                  <span className="break-words">{line}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between border-t border-border/70 pt-3">
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12px]">
                <a
                  href={SAMPLE_DEEP.sampleHref}
                  className="inline-flex items-center gap-1 text-cyan hover:underline min-h-[36px]"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {SAMPLE_DEEP.sampleLabel}
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
                <Link
                  to="/research/report/$token"
                  params={{ token: "uae-fintech-dominance-mena-2026" }}
                  className="inline-flex items-center gap-1 text-cyan hover:underline min-h-[36px]"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {SAMPLE_TOPIC.sampleLabel}
                </Link>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug max-w-sm">
                Samples are published illustrations — not guaranteed templates for paid runs.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href="/research/commission?pkg=deep-no-x"
                className="inline-flex items-center gap-2 min-h-[48px] px-5 rounded-full bg-cyan text-background font-semibold text-[13px] touch-manipulation"
              >
                Start commission <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/research/commission?pkg=topic-analysis"
                className="inline-flex items-center gap-2 min-h-[48px] px-4 rounded-full border border-border text-[12.5px] text-muted-foreground hover:text-cyan touch-manipulation"
              >
                Topic analysis (X discourse) · $10
              </a>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Lawful public-interest research only. Requests that violate X terms or community rules,
              or that seek illegal ends, are refused. Prefer public sources; no private-data
              scraping.
            </p>
          </div>
        </section>

        {/* 3 · FREE RESOURCES — secondary */}
        <section
          id="free-resources"
          className="scroll-mt-28 mb-8 space-y-3"
          aria-labelledby="free-heading"
        >
          <div className="px-0.5">
            <h2
              id="free-heading"
              className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground"
            >
              Free resources
            </h2>
            <p className="text-[13px] text-muted-foreground mt-1 leading-snug max-w-xl">
              No payment. No account. Browse published work and citizen trackers.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <FreeCard
              to="/research/library"
              icon={<BookOpen className="w-5 h-5" />}
              title="Library"
              body="All published multi-source case studies on one shelf (including the irregular migration briefing)."
            />
            <FreeCard
              to="/research/networks-ledger"
              icon={<Brain className="w-5 h-5" />}
              title="Intelligence"
              body="Designations Ledger, Fraud Ledger shell, leadership board, peace index, media & football trackers."
            />
          </div>
        </section>

        {/* 4 · ENTERPRISE — small secondary */}
        <section className="mb-6 rounded-xl border border-amber-signal/30 bg-amber-signal/[0.06] px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between min-w-0">
          <div className="flex items-start gap-2.5 min-w-0">
            <Building2 className="w-4 h-4 text-amber-signal shrink-0 mt-0.5" />
            <p className="text-[13px] text-foreground/90 leading-snug break-words">
              Need ongoing or custom dashboards?{" "}
              <span className="text-muted-foreground">
                Scoped by email — not self-serve checkout.
              </span>
            </p>
          </div>
          <ContactEmailMe
            source="research-enterprise"
            variant="button"
            defaultMessage={ENTERPRISE_DEFAULT_MESSAGE}
            dialogTitle="Enterprise inquiry"
            dialogDescription="Describe dashboards, topics, or ongoing research. Reply by email — no card checkout."
            className="shrink-0 border-amber-signal/40 bg-amber-signal/10 text-amber-signal hover:bg-amber-signal/20 text-[12.5px] font-semibold"
          >
            Email me
          </ContactEmailMe>
        </section>

        {/* 5 · Privacy & limits — compact, solo voice, GDPR */}
        <details className="group rounded-xl border border-border/80 bg-card/30 px-4 py-3 mb-4">
          <summary className="cursor-pointer list-none flex items-center gap-2 text-[13px] font-display font-semibold text-foreground min-h-[40px] touch-manipulation">
            <Lock className="w-3.5 h-3.5 text-cyan" />
            Privacy, GDPR &amp; limits
            <span className="ml-auto text-[11px] font-mono text-muted-foreground group-open:hidden">
              expand
            </span>
          </summary>
          <div className="pt-2 pb-1 text-[12.5px] text-muted-foreground leading-relaxed space-y-2 border-t border-border/60 mt-2">
            <p>
              Elenchos.live is operated by an independent researcher based in the EU. The aim is to
              educate, share research, and let others run their own questions with full privacy —
              without building a dossier on visitors.
            </p>
            <p>
              <strong className="text-foreground/85">Payments:</strong> card data is processed by
              Stripe only. Elenchos does not store card numbers. Optional email is for one-time
              delivery of your report link, not marketing.
            </p>
            <p>
              <strong className="text-foreground/85">Data separation:</strong> commissioned reports
              go to a dedicated store (
              <code className="text-[11px] text-cyan/90">research_desk_reports</code>
              ). Live Topics admin history is append-only and never overwritten or deleted for
              editorial convenience.
            </p>
            <p>
              <strong className="text-foreground/85">Acceptable use:</strong> lawful public-interest
              research only. No illegal activity, no private-data scraping, no use that violates X
              Terms of Service or community rules. Requests that clearly seek harm or crime are
              refused.
            </p>
            <p>
              Research is experimental and provided as-is — not legal, medical, or investment
              advice. See{" "}
              <Link to="/privacy" className="text-cyan hover:underline">
                Privacy
              </Link>{" "}
              and{" "}
              <Link to="/about" className="text-cyan hover:underline">
                About
              </Link>
              .
            </p>
          </div>
        </details>
      </main>

      <SiteFooter />
    </div>
  );
}

function TierCard({
  packageId,
  featured,
  delay,
}: {
  packageId: DeskPackageId;
  featured?: boolean;
  delay: number;
}) {
  const p = DESK_PACKAGES[packageId];
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={`relative flex flex-col h-full rounded-2xl border p-4 sm:p-5 min-w-0 overflow-hidden ${
        featured
          ? "border-cyan/55 bg-gradient-to-b from-cyan/15 to-card/80 ring-1 ring-cyan/25"
          : "border-border/90 bg-card/50"
      }`}
    >
      {featured && (
        <span className="absolute top-3 right-3 text-[9px] font-mono uppercase tracking-[0.12em] text-cyan bg-cyan/15 border border-cyan/40 rounded-full px-2 py-0.5">
          Most complete
        </span>
      )}
      <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
        {p.tierLabel}
      </p>
      <div className="flex items-baseline justify-between gap-2 mt-1">
        <h3 className="text-[16px] font-display font-semibold text-foreground break-words pr-2">
          {p.title.replace(/ · .*$/, "")}
        </h3>
        <span className="text-cyan font-mono text-[22px] font-semibold shrink-0">${p.priceUsd}</span>
      </div>
      <p className="text-[12.5px] text-muted-foreground leading-snug mt-2 break-words">{p.blurb}</p>
      <p className="text-[12.5px] text-foreground/90 leading-snug mt-2 break-words">
        <strong className="font-medium">You get:</strong> {p.delivers}
      </p>
      <p className="text-[11.5px] text-cyan/90 font-mono mt-2 leading-snug">{p.deliveryNote}</p>
      <a
        href={`/research/commission?pkg=${packageId}`}
        className={`mt-4 inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-full text-[13px] font-semibold touch-manipulation ${
          featured
            ? "bg-cyan text-background"
            : "border border-cyan/40 bg-cyan/10 text-cyan"
        }`}
      >
        Choose ${p.priceUsd} <ArrowRight className="w-3.5 h-3.5" />
      </a>
    </motion.article>
  );
}

function FreeCard({
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
      className="group flex gap-3 rounded-2xl border border-border/80 bg-card/40 hover:border-cyan/40 p-3.5 sm:p-4 transition-colors touch-manipulation min-w-0"
    >
      <span className="shrink-0 w-10 h-10 rounded-xl border border-cyan/30 bg-cyan/10 text-cyan grid place-items-center">
        {icon}
      </span>
      <div className="min-w-0">
        <h3 className="text-[14px] font-display font-semibold group-hover:text-cyan transition-colors">
          {title}
        </h3>
        <p className="text-[12px] text-muted-foreground leading-snug mt-0.5 break-words">{body}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-cyan shrink-0 mt-1" />
    </Link>
  );
}
