import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FlaskConical, ArrowRight, FileText, Home } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { listResearchBriefs, RESEARCH_NORTH_STAR, researchStatusLabel } from "@/lib/research-catalog";

export const Route = createFileRoute("/research/")({
  head: () => ({
    meta: [
      { title: "Research · Elenchos" },
      {
        name: "description",
        content:
          "Multi-source research briefs: scholarly, official, and media evidence. Human-reviewed before publish. Separate from Topics scores.",
      },
      { property: "og:title", content: "Research · Elenchos" },
      {
        property: "og:description",
        content:
          "Structured research briefs for citizens and serious readers: claims with confidence and falsifiers, not live topic scores.",
      },
      { property: "og:url", content: "https://elenchos.live/research" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/research" }],
  }),
  component: ResearchIndexPage,
});

function ResearchIndexPage() {
  const briefs = listResearchBriefs();

  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1100px] mx-auto w-full px-3 sm:px-4 md:px-8 py-6 sm:py-8 md:py-10 mobile-safe-bottom md:pb-16 relative flex-1 overflow-x-clip">
        {/* Shared page hero — same type/chrome as Topics / About */}
        <header className="page-hero-banner mb-6 sm:mb-8">
          <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(200px,34%)] items-stretch min-h-0">
            <div className="relative z-[2] flex flex-col justify-center gap-2 p-4 sm:p-5 md:p-6 min-w-0">
              <div className="page-hero-kicker">
                <FlaskConical className="w-3.5 h-3.5" aria-hidden />
                Research
              </div>
              <h1 className="page-hero-title text-[1.45rem] sm:text-2xl md:text-[1.9rem] lg:text-[2.15rem] break-words">
                Research briefs, not live topic scores
              </h1>
              <p className="page-hero-sub max-w-xl">{RESEARCH_NORTH_STAR}</p>
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

        {/* Flagship free-data hub */}
        <Link
          to="/research-migration"
          className="group block rounded-2xl border border-rose-signal/40 bg-rose-signal/[0.06] hover:border-rose-signal/55 hover:bg-rose-signal/[0.1] transition-all px-3.5 sm:px-5 py-4 touch-manipulation min-h-[44px] mb-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-rose-signal">
                National security brief · EU + UK Channel
              </p>
              <h2 className="text-[15px] sm:text-[16px] font-display font-semibold text-foreground group-hover:text-rose-signal transition-colors">
                Irregular migration intelligence
              </h2>
              <p className="text-[12.5px] text-muted-foreground leading-relaxed">
                10-second thesis · full picture under 10 minutes. Scale since 2011, corridors,
                elite failure, speech double standard, reverse options. Free open data first.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-rose-signal shrink-0 mt-1 opacity-80 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Dynamic brief grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 px-0.5">
            <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-cyan">
              Case studies &amp; briefs
            </p>
            <span className="text-[11px] font-mono text-muted-foreground tabular-nums">
              {briefs.length} published
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
                        Pilot · {b.region}
                      </p>
                      <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground border border-border/80 rounded-full px-2 py-0.5">
                        {researchStatusLabel(b.status)}
                      </span>
                    </div>
                    <h2 className="text-[15px] sm:text-[16px] font-display font-semibold text-foreground leading-snug group-hover:text-cyan transition-colors">
                      {b.title}
                    </h2>
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
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
