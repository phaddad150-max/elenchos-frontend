import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, FlaskConical, Shield } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ContactEmailMe } from "@/components/ContactEmailMe";
import { CommissionBriefForm } from "@/components/research/CommissionBriefForm";

const ENTERPRISE_DEFAULT_MESSAGE =
  "Hi — I'm interested in Enterprise for Elenchos: personalized dashboards, custom topics, and team research. Here's what we need:\n\n";

export const Route = createFileRoute("/research/commission")({
  head: () => ({
    meta: [
      { title: "Commission a report · $10 / $20 · Research Desk · Elenchos" },
      {
        name: "description",
        content:
          "Commission an on-demand Elenchos report from $10, or inquire about Enterprise personalized dashboards via contact (not self-serve checkout). Unique private link + PDF for paid packs.",
      },
      {
        property: "og:title",
        content: "Commission a report · $10 / $20 · Elenchos Research Desk",
      },
      {
        property: "og:description",
        content:
          "Fixed-price on-demand reports via Stripe. Enterprise personalization is contact-only — no checkout.",
      },
      { property: "og:url", content: "https://elenchos.live/research/commission" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/research/commission" }],
  }),
  component: CommissionPage,
});

function CommissionPage() {
  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[640px] mx-auto w-full px-3 sm:px-4 py-6 sm:py-8 mobile-safe-bottom md:pb-14 relative flex-1 overflow-x-clip">
        <Link
          to="/research"
          className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-cyan min-h-[40px] touch-manipulation mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Research Desk
        </Link>

        <header className="page-hero-banner mb-5 sm:mb-6">
          <div className="p-4 sm:p-5">
            <div className="page-hero-kicker">
              <FlaskConical className="w-3.5 h-3.5" aria-hidden />
              On-demand
            </div>
            <h1 className="page-hero-title text-[1.35rem] sm:text-2xl mt-2">
              Commission your report
            </h1>
            <p className="page-hero-sub mt-2">
              Same method we use on the desk. Fixed low price. Unique link + PDF when ready.
            </p>
          </div>
        </header>

        {/* Deliverables / non-deliverables — legal clarity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
          <div className="rounded-xl border border-emerald-signal/30 bg-emerald-signal/5 px-3 py-3">
            <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-emerald-signal mb-1.5">
              You get
            </p>
            <ul className="text-[12px] text-foreground/90 space-y-1 leading-snug">
              <li>· Structured report in the style you chose</li>
              <li>· Unique private link to your report</li>
              <li>· PDF download when delivery is ready</li>
              <li>· Method, sources, limits, confidence where claims exist</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card/40 px-3 py-3">
            <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
              You do not get
            </p>
            <ul className="text-[12px] text-muted-foreground space-y-1 leading-snug">
              <li>· Legal, medical, or investment advice</li>
              <li>· Guaranteed conclusions or “proof for court”</li>
              <li>· Real-time surveillance or private data scraping</li>
              <li>· An account or marketing list signup</li>
            </ul>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-secondary/20 px-3 py-2.5 mb-5 flex gap-2 text-[11.5px] text-muted-foreground leading-snug">
          <Shield className="w-3.5 h-3.5 text-cyan shrink-0 mt-0.5" aria-hidden />
          <p>
            <strong className="text-foreground/85">Safe research space:</strong> we do not sell
            dossiers on researchers. Card data stays with Stripe. Optional email is used once to
            send your unique link, then not kept by Elenchos. Research is experimental and provided
            as-is.
          </p>
        </div>

        <CommissionBriefForm />

        {/* Enterprise — contact only, never Stripe checkout */}
        <section className="mt-8 rounded-2xl border border-amber-signal/35 bg-gradient-to-br from-amber-signal/[0.08] to-card/40 p-4 sm:p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl border border-amber-signal/40 bg-amber-signal/10 grid place-items-center text-amber-signal shrink-0">
              <Building2 className="w-5 h-5" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-amber-signal">
                Enterprise · not checkout
              </p>
              <h2 className="text-[16px] font-display font-semibold leading-snug">
                Personalized dashboards &amp; custom research
              </h2>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Need a private or branded dashboard, custom topic set, team access, or ongoing
                research beyond a single report? Enterprise is scoped by conversation — no
                self-serve payment on this page.
              </p>
              <ul className="text-[12.5px] text-foreground/85 space-y-1 pt-1 leading-snug">
                <li>· Personalized dashboards and monitors</li>
                <li>· Custom topics and briefing cadence</li>
                <li>· Deeper multi-source / multi-region packages</li>
              </ul>
            </div>
          </div>
          <ContactEmailMe
            source="research-enterprise"
            variant="button"
            defaultMessage={ENTERPRISE_DEFAULT_MESSAGE}
            dialogTitle="Enterprise inquiry"
            dialogDescription="Describe dashboards, topics, team size, and timeline. We will reply by email — no card checkout for Enterprise."
            className="w-full sm:w-auto justify-center border-amber-signal/45 bg-amber-signal/15 text-amber-signal hover:bg-amber-signal/25 font-semibold"
          >
            <Building2 className="w-3.5 h-3.5" aria-hidden />
            Email me about Enterprise
          </ContactEmailMe>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
