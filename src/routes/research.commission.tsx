import { createFileRoute } from "@tanstack/react-router";
import { Building2, FlaskConical } from "lucide-react";
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

/**
 * Single commission checkout surface. Pricing + form only.
 * Payment packages, Stripe path, and offerings live in CommissionBriefForm / packages.ts — do not fork.
 */
function CommissionPage() {
  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[720px] mx-auto w-full px-3 sm:px-4 md:px-6 py-5 sm:py-8 relative flex-1 mobile-safe-bottom overflow-x-clip min-w-0">
        <ResearchBreadcrumb current="Commission report" />
        <ResearchDeskNav />

        <header className="mb-6 min-w-0 space-y-2">
          <div className="page-hero-kicker">
            <FlaskConical className="w-3.5 h-3.5" aria-hidden />
            Commission report
          </div>
          <h1 className="page-hero-title text-[1.4rem] sm:text-2xl break-words">
            Commission a report
          </h1>
          <p className="text-[13px] sm:text-[14px] text-muted-foreground leading-relaxed max-w-lg break-words">
            Choose a package, describe your topic, pay once. Unique private link + PDF —
            typically minutes after payment.
          </p>
        </header>

        {/* How it works — one compact row */}
        <ol
          className="mb-6 grid grid-cols-3 gap-2"
          aria-label="How commissioning works"
        >
          {[
            { n: "1", t: "Package", d: "Pick $10 or $20" },
            { n: "2", t: "Topic", d: "Your question" },
            { n: "3", t: "Pay", d: "Link + PDF" },
          ].map((s) => (
            <li
              key={s.n}
              className="rounded-xl border border-border/70 bg-card/40 px-2.5 py-2.5 text-center min-w-0"
            >
              <span className="inline-flex w-6 h-6 rounded-full border border-cyan/40 bg-cyan/10 text-cyan text-[11px] font-mono items-center justify-center mb-1">
                {s.n}
              </span>
              <p className="text-[12px] font-display font-semibold text-foreground">{s.t}</p>
              <p className="text-[10.5px] text-muted-foreground leading-snug mt-0.5 break-words">
                {s.d}
              </p>
            </li>
          ))}
        </ol>

        {/* Checkout form — single source of package selection */}
        <section
          aria-label="Checkout"
          className="rounded-2xl border border-cyan/35 bg-card/60 p-4 sm:p-5 shadow-[0_0_48px_-28px_var(--color-cyan-glow)]"
        >
          <CommissionBriefForm />
        </section>

        <p className="mt-4 text-[11.5px] text-muted-foreground leading-snug text-center max-w-md mx-auto break-words">
          Stripe holds card data. Optional email is one-time delivery only. Not legal advice.
          Lawful public research only.
        </p>

        <section className="mt-8 rounded-xl border border-amber-signal/30 bg-amber-signal/[0.05] px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between min-w-0">
          <div className="flex items-start gap-2 min-w-0">
            <Building2 className="w-4 h-4 text-amber-signal shrink-0 mt-0.5" />
            <p className="text-[12.5px] text-muted-foreground break-words">
              Custom dashboards or ongoing research? Email — not self-serve checkout.
            </p>
          </div>
          <ContactEmailMe
            source="research-enterprise"
            variant="button"
            defaultMessage={ENTERPRISE_DEFAULT_MESSAGE}
            dialogTitle="Enterprise inquiry"
            dialogDescription="Describe dashboards, topics, or ongoing research."
            className="shrink-0 border-amber-signal/40 bg-amber-signal/10 text-amber-signal text-[12px] font-semibold"
          >
            Email me
          </ContactEmailMe>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
