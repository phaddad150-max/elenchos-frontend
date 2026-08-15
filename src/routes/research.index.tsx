import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Building2,
  FilePenLine,
  FlaskConical,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ContactEmailMe } from "@/components/ContactEmailMe";
import { ResearchDeskNav } from "@/components/research/ResearchDeskNav";
import { ELENCHOS_TAGLINE } from "@/lib/brand";

const ENTERPRISE_DEFAULT_MESSAGE =
  "Hi — I'm interested in Enterprise for Elenchos: personalized dashboards, custom topics, and team research. Here's what I need:\n\n";

export const Route = createFileRoute("/research/")({
  head: () => ({
    meta: [
      {
        title: "Research Desk · Library & commission report · Elenchos",
      },
      {
        name: "description",
        content:
          "Elenchos Research Desk: free library of topic analysis, case studies, and trackers — or commission a private multi-source report.",
      },
      { property: "og:title", content: "Research Desk · Elenchos" },
      {
        property: "og:description",
        content:
          "Two clear doors: free Library, or Commission report. Independent EU researcher.",
      },
      { property: "og:url", content: "https://elenchos.live/research" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/research" }],
  }),
  component: ResearchDeskLanding,
});

const PATHS = [
  {
    to: "/research/library",
    title: "Library",
    subtitle: "Free — everything published",
    body: "Public discourse on X, multi-source case studies, leadership boards, peace index, and the Networks Ledger.",
    icon: BookOpen,
    accent: "from-emerald-signal/20 to-transparent border-emerald-signal/35",
    glow: "group-hover:border-emerald-signal/55",
    cta: "Browse free library",
  },
  {
    to: "/research/commission",
    title: "Commission report",
    subtitle: "Private brief · $10 / $20",
    body: "Your question, fixed price, unique link + PDF — typically minutes after pay.",
    icon: FilePenLine,
    accent: "from-cyan/20 to-transparent border-cyan/50",
    glow: "group-hover:border-cyan/70 ring-1 ring-cyan/20",
    cta: "Commission a report",
    featured: true,
  },
] as const;

function ResearchDeskLanding() {
  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1400px] mx-auto w-full px-2.5 sm:px-4 md:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8 relative flex-1 mobile-safe-bottom overflow-x-clip min-w-0">
        <ResearchDeskNav />

        <header className="page-hero-banner overflow-hidden min-w-0">
          <div className="relative p-4 sm:p-5 md:p-7 min-w-0 space-y-3">
            <div className="page-hero-kicker">
              <FlaskConical className="w-3.5 h-3.5" aria-hidden />
              Research Desk
            </div>
            <h1 className="page-hero-title text-[1.45rem] sm:text-2xl md:text-[2rem] break-words">
              Free library — or commission your own report
            </h1>
            <p className="page-hero-sub max-w-2xl break-words">
              Two doors. Browse everything Elenchos publishes for free, or commission a private
              multi-source brief. {ELENCHOS_TAGLINE}
            </p>
            <p className="text-[12px] text-muted-foreground/90 max-w-xl break-words">
              Independent researcher · EU · privacy-first.
            </p>
          </div>
        </header>

        <section
          aria-label="Research Desk paths"
          className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-w-4xl"
        >
          {PATHS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.to}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="min-w-0 h-full"
              >
                <Link
                  to={p.to}
                  className={`rd-path-card rd-card group relative flex flex-col h-full min-h-[220px] sm:min-h-[240px] rounded-2xl border bg-gradient-to-b ${p.accent} bg-card/70 p-4 sm:p-5 overflow-hidden transition-all touch-manipulation ${p.glow} hover:shadow-[0_0_40px_-10px_var(--cyan-glow)]`}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--cyan)_12%,transparent),transparent_70%)]" />
                  <div className="relative flex items-start justify-between gap-2 mb-4">
                    <span className="w-12 h-12 rounded-2xl border border-cyan/30 bg-cyan/10 text-cyan grid place-items-center group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </span>
                    <span className="text-[10px] font-mono tabular-nums text-muted-foreground">
                      0{i + 1}
                    </span>
                  </div>
                  <h2 className="relative text-[1.15rem] sm:text-xl font-display font-semibold text-foreground group-hover:text-cyan transition-colors break-words">
                    {p.title}
                  </h2>
                  <p className="relative text-[12px] text-cyan font-medium mt-0.5 break-words">
                    {p.subtitle}
                  </p>
                  <p className="relative text-[13px] text-muted-foreground leading-relaxed mt-2.5 flex-1 break-words">
                    {p.body}
                  </p>
                  <span className="relative mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-cyan">
                    {p.cta}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </section>

        <section className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between rounded-xl border border-amber-signal/25 bg-amber-signal/[0.05] px-4 py-3 min-w-0 max-w-4xl">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="w-4 h-4 text-amber-signal shrink-0" />
            <p className="text-[12.5px] text-muted-foreground break-words">
              Custom dashboards or ongoing research?{" "}
              <span className="text-foreground/85">Email — not self-serve checkout.</span>
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
