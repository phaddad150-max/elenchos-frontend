import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  CreditCard,
  FilePenLine,
  FileText,
  FlaskConical,
  Link2,
  Sparkles,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ContactEmailMe } from "@/components/ContactEmailMe";
import { CommissionBriefForm } from "@/components/research/CommissionBriefForm";
import {
  ResearchBreadcrumb,
  ResearchDeskNav,
} from "@/components/research/ResearchDeskNav";

const ENTERPRISE_DEFAULT_MESSAGE =
  "Hi — I'm interested in Enterprise for Elenchos: personalized dashboards, custom topics, and team research. Here's what I need:\n\n";

export const Route = createFileRoute("/research/commission")({
  head: () => ({
    meta: [
      { title: "Commission report · $10 / $20 · Research Desk · Elenchos" },
      {
        name: "description",
        content:
          "Commission a multi-source Elenchos report for $10 or $20. Automated delivery in minutes. Privacy-first Stripe. Unique private link + PDF.",
      },
      {
        property: "og:title",
        content: "Commission a report · $10 / $20 · Elenchos",
      },
      {
        property: "og:description",
        content:
          "Fixed-price multi-source deep dives. Card data with Stripe only. EU independent researcher.",
      },
      { property: "og:url", content: "https://elenchos.live/research/commission" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/research/commission" }],
  }),
  component: CommissionPage,
});

const HOW_STEPS = [
  {
    n: "01",
    title: "Pick a package",
    body: "Topic analysis on X ($10), multi-source deep dive ($10), or deep dive + X ($20).",
    icon: FileText,
  },
  {
    n: "02",
    title: "Brief your topic",
    body: "Answer the fields for that package so the report stays focused and evidence-ready.",
    icon: FilePenLine,
  },
  {
    n: "03",
    title: "Pay once",
    body: "Stripe Checkout — card or crypto when available. No Elenchos account required.",
    icon: CreditCard,
  },
  {
    n: "04",
    title: "Get link + PDF",
    body: "Unique private report URL and PDF — typically minutes after payment.",
    icon: Link2,
  },
] as const;

/**
 * Commission surface — same page width as Desk / Library.
 * Packages + Stripe path stay in CommissionBriefForm / packages.ts.
 */
function CommissionPage() {
  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1400px] mx-auto w-full px-2.5 sm:px-4 md:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8 relative flex-1 mobile-safe-bottom overflow-x-clip min-w-0">
        <ResearchBreadcrumb trail={[{ label: "Commission" }]} />
        <ResearchDeskNav />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
            Progress: 1 pick package → 2 brief → 3 pay → 4 get link
          </p>
          <Link
            to="/research/library"
            className="text-[12.5px] font-medium text-cyan hover:underline min-h-[40px] inline-flex items-center touch-manipulation"
          >
            Exit to Library
          </Link>
        </div>

        <header className="page-hero-banner overflow-hidden min-w-0">
          <div className="relative p-4 sm:p-5 md:p-7 min-w-0 space-y-3">
            <div className="page-hero-kicker">
              <FlaskConical className="w-3.5 h-3.5" aria-hidden />
              Commission report
            </div>
            <h1 className="page-hero-title text-[1.45rem] sm:text-2xl md:text-[2rem] break-words">
              Commission a private report
            </h1>
            <p className="page-hero-sub max-w-2xl break-words">
              Fixed price · unique private link + PDF · typically minutes after pay. Independent
              researcher · EU · privacy-first.
            </p>
          </div>
        </header>

        {/* How it works — visual first */}
        <section aria-labelledby="how-commission-works" className="min-w-0">
          <h2
            id="how-commission-works"
            className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-3 px-0.5"
          >
            How it works
          </h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3">
            {HOW_STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <li
                  key={s.n}
                  className="relative rounded-2xl border border-border/80 bg-card/55 p-4 min-w-0 overflow-hidden"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/50 to-transparent opacity-80" />
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="w-10 h-10 rounded-xl border border-cyan/35 bg-cyan/10 text-cyan grid place-items-center">
                      <Icon className="w-5 h-5" aria-hidden />
                    </span>
                    <span className="text-[11px] font-mono tabular-nums text-cyan/80">{s.n}</span>
                  </div>
                  <p className="text-[14px] font-display font-semibold text-foreground">{s.title}</p>
                  <p className="text-[12.5px] text-muted-foreground leading-relaxed mt-1.5 break-words">
                    {s.body}
                  </p>
                  {i < HOW_STEPS.length - 1 && (
                    <span
                      className="hidden xl:block absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-cyan/40"
                      aria-hidden
                    >
                      →
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        {/* Packages + package-specific brief form */}
        <section aria-label="Choose package and brief" className="min-w-0">
          <CommissionBriefForm />
        </section>

        <p className="text-[11.5px] text-muted-foreground leading-snug max-w-2xl break-words">
          Stripe holds card data. Optional email is one-time delivery only. Experimental research
          tool — not legal, medical, or investment advice. Lawful public research only.
        </p>

        {/* Enterprise — same structure as Desk */}
        <section
          aria-labelledby="enterprise-heading"
          className="rounded-2xl border border-amber-signal/30 bg-gradient-to-b from-amber-signal/[0.08] to-transparent p-4 sm:p-5 md:p-6 min-w-0 max-w-4xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:justify-between">
            <div className="min-w-0 flex gap-3">
              <span className="w-12 h-12 shrink-0 rounded-2xl border border-amber-signal/40 bg-amber-signal/10 text-amber-signal grid place-items-center">
                <Building2 className="w-6 h-6" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-signal mb-1">
                  Enterprise
                </p>
                <h2
                  id="enterprise-heading"
                  className="text-[1.1rem] sm:text-lg font-display font-semibold text-foreground"
                >
                  Custom dashboards &amp; ongoing research
                </h2>
                <p className="text-[13px] text-muted-foreground leading-relaxed mt-1.5 max-w-xl break-words">
                  Personalized topics, team access, and continuous monitoring — not self-serve
                  checkout. Email with what you need; no card form on this path.
                </p>
                <ul className="mt-3 space-y-1 text-[12.5px] text-muted-foreground">
                  <li className="flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-signal shrink-0 mt-0.5" />
                    Custom live dashboards and topic sets
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-signal shrink-0 mt-0.5" />
                    Ongoing research retainers and team delivery
                  </li>
                </ul>
              </div>
            </div>
            <ContactEmailMe
              source="research-enterprise"
              variant="button"
              defaultMessage={ENTERPRISE_DEFAULT_MESSAGE}
              dialogTitle="Enterprise inquiry"
              dialogDescription="Describe dashboards, topics, or ongoing research."
              className="shrink-0 border-amber-signal/40 bg-amber-signal/10 text-amber-signal text-[13px] font-semibold min-h-[44px] px-4"
            >
              Email me
            </ContactEmailMe>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
