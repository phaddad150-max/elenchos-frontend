import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useCallback, useState } from "react";
import {
  Building2,
  Check,
  ExternalLink,
  FileText,
  FlaskConical,
  Shield,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ContactEmailMe } from "@/components/ContactEmailMe";
import { CommissionBriefForm } from "@/components/research/CommissionBriefForm";
import {
  ResearchBreadcrumb,
  ResearchDeskNav,
} from "@/components/research/ResearchDeskNav";
import {
  COMMISSION_PACKAGE_IDS,
  DESK_PACKAGES,
  HOW_IT_WORKS_STEPS,
  type DeskPackageId,
} from "@/lib/research-desk/packages";

const ENTERPRISE_DEFAULT_MESSAGE =
  "Hi — I'm interested in Enterprise for Elenchos: personalized dashboards, custom topics, and team research. Here's what I need:\n\n";

export const Route = createFileRoute("/research/commission")({
  head: () => ({
    meta: [
      { title: "On-demand report · $10 / $20 · Research Desk · Elenchos" },
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

function CommissionPage() {
  const [selectedPkg, setSelectedPkg] = useState<DeskPackageId>("deep-no-x");
  const onPackageChange = useCallback((id: DeskPackageId) => setSelectedPkg(id), []);

  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1400px] mx-auto w-full px-2.5 sm:px-4 md:px-6 py-5 sm:py-8 relative flex-1 mobile-safe-bottom overflow-x-clip min-w-0">
        <ResearchBreadcrumb current="On-demand" />
        <ResearchDeskNav />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-6 lg:gap-8 items-start">
          {/* Left: pricing story + how it works */}
          <div className="space-y-5 min-w-0">
            <header className="page-hero-banner overflow-hidden min-w-0">
              <div className="p-4 sm:p-5 min-w-0 space-y-2">
                <div className="page-hero-kicker">
                  <FlaskConical className="w-3.5 h-3.5" aria-hidden />
                  On-demand
                </div>
                <h1 className="page-hero-title text-[1.35rem] sm:text-2xl break-words">
                  Commission a report
                </h1>
                <p className="page-hero-sub break-words">
                  Fixed price. Automated after pay — typically minutes. Unique private link + PDF.
                </p>
              </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {COMMISSION_PACKAGE_IDS.map((id, i) => {
                const p = DESK_PACKAGES[id];
                const isSelected = selectedPkg === id;
                const isFeatured = id === "deep-with-x";
                return (
                  <motion.div
                    key={id}
                    id={`pkg-${id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`rounded-2xl border p-4 min-w-0 transition-shadow ${
                      isSelected
                        ? "border-cyan/70 bg-cyan/10 ring-1 ring-cyan/40 shadow-[0_0_24px_-12px_var(--color-cyan-glow)]"
                        : isFeatured
                          ? "border-cyan/50 bg-cyan/10"
                          : "border-border/80 bg-card/50"
                    }`}
                  >
                    <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                      {p.tierLabel}
                    </p>
                    <p className="text-[22px] font-mono font-semibold text-cyan mt-1">
                      ${p.priceUsd}
                    </p>
                    <p className="text-[12.5px] text-muted-foreground mt-1.5 leading-snug break-words">
                      {p.blurb}
                    </p>
                    <p className="text-[11px] text-foreground/85 mt-2 leading-snug break-words">
                      {p.delivers}
                    </p>
                    <p className="text-[10.5px] font-mono text-cyan/90 mt-2">{p.deliveryNote}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-border/80 bg-card/40 p-4 space-y-3">
              <h2 className="text-[12px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
                How it works
              </h2>
              <ol className="space-y-3">
                {HOW_IT_WORKS_STEPS.map((step, i) => (
                  <li key={step.title} className="flex gap-2.5 min-w-0">
                    <span className="shrink-0 w-6 h-6 rounded-full border border-cyan/40 bg-cyan/10 text-cyan text-[11px] font-mono grid place-items-center">
                      {i + 1}
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-[13px] font-medium text-foreground leading-snug">
                        {step.title}
                        {step.formLabel ? (
                          <span className="text-muted-foreground font-normal">
                            {" "}
                            · {step.formLabel}
                          </span>
                        ) : null}
                      </p>
                      <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug break-words">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              <ul className="grid sm:grid-cols-2 gap-1.5 pt-1">
                {[
                  "Unique private URL + PDF",
                  "Sources & limits shown",
                  "Separate from live Topics tables",
                  "No account required",
                ].map((x) => (
                  <li key={x} className="flex gap-1.5 text-[12px] text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-emerald-signal shrink-0 mt-0.5" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[12px]">
              <a
                href="/research-migration"
                className="inline-flex items-center gap-1 text-cyan hover:underline min-h-[36px]"
              >
                <FileText className="w-3.5 h-3.5" /> Sample deep dive (migration)
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
              <Link
                to="/research/report/$token"
                params={{ token: "uae-fintech-dominance-mena-2026" }}
                className="inline-flex items-center gap-1 text-cyan hover:underline min-h-[36px]"
              >
                <FileText className="w-3.5 h-3.5" /> Sample topic report (UAE fintech)
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="rounded-xl border border-emerald-signal/30 bg-emerald-signal/5 px-3 py-3">
                <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-emerald-signal mb-1.5">
                  You get
                </p>
                <ul className="text-[12px] text-foreground/90 space-y-1 leading-snug">
                  <li>· Structured report for the package you chose</li>
                  <li>· Unique private link + PDF</li>
                  <li>· Method, sources, confidence where claims exist</li>
                </ul>
              </div>
              <div className="rounded-xl border border-border bg-card/40 px-3 py-3">
                <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
                  You do not get
                </p>
                <ul className="text-[12px] text-muted-foreground space-y-1 leading-snug">
                  <li>· Legal, medical, or investment advice</li>
                  <li>· Guaranteed conclusions or court “proof”</li>
                  <li>· Private data scraping or illegal research</li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-secondary/20 px-3 py-2.5 flex gap-2 text-[11.5px] text-muted-foreground leading-snug">
              <Shield className="w-3.5 h-3.5 text-cyan shrink-0 mt-0.5" aria-hidden />
              <p>
                Independent EU researcher. Stripe holds cards. Optional email = one-time delivery
                only. Lawful public research only; X terms apply. Commissioned reports never
                overwrite live Topics history.
              </p>
            </div>
          </div>

          {/* Right: form */}
          <div className="rounded-2xl border border-cyan/30 bg-card/50 p-4 sm:p-5 lg:sticky lg:top-24 min-w-0">
            <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-cyan mb-3">
              Start checkout
            </p>
            <CommissionBriefForm onPackageChange={onPackageChange} />
          </div>
        </div>

        <section className="mt-8 rounded-xl border border-amber-signal/30 bg-amber-signal/[0.05] px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between min-w-0">
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
