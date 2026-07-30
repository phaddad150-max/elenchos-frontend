import { createFileRoute, Link } from "@tanstack/react-router";
import { FlaskConical, ArrowRight, FileText } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { listResearchBriefs, RESEARCH_NORTH_STAR } from "@/lib/research-catalog";
import { ContactEmailMe } from "@/components/ContactEmailMe";

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
    <div className="min-h-screen relative flex flex-col">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1100px] mx-auto w-full px-4 md:px-8 py-10 md:py-14 mobile-safe-bottom md:pb-20 relative flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(220px,34%)] gap-8 lg:gap-10 items-start">
          {/* Left: research content */}
          <div className="min-w-0">
            <div className="text-center lg:text-left mb-10">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-4">
                <FlaskConical className="w-3.5 h-3.5 text-cyan" aria-hidden />
                Research
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-glow-cyan mb-3">
                Research briefs, not live topic scores
              </h1>
              <p className="text-[15px] text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                {RESEARCH_NORTH_STAR}
              </p>
            </div>

            <div className="space-y-3 mb-10">
              {briefs.map((b) => (
                <Link
                  key={b.slug}
                  to="/research/preview/$slug"
                  params={{ slug: b.slug }}
                  className="block rounded-2xl border border-border bg-card/40 hover:border-cyan/40 hover:bg-cyan/5 transition-colors px-4 py-4 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-cyan">
                        Pilot · {b.region}
                      </p>
                      <h2 className="text-[15px] font-display font-semibold text-foreground leading-snug">
                        {b.title}
                      </h2>
                      <p className="text-[12.5px] text-muted-foreground leading-relaxed">
                        {b.subtitle}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-cyan shrink-0 mt-1" />
                  </div>
                  {b.pdfUrl ? (
                    <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
                      <FileText className="w-3 h-3" />
                      Short PDF available
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 text-center lg:text-left">
              <Link
                to="/topics"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 hover:bg-secondary/70 text-foreground px-4 py-2 text-[13px] font-medium transition-colors"
              >
                Browse Topics
              </Link>
              <ContactEmailMe
                source="research"
                variant="inline"
                className="text-[12px] font-mono"
              />
            </div>
          </div>

          {/* Right: brand side banner (lg+) */}
          <aside
            className="hidden lg:block sticky top-24 self-start select-none pointer-events-none"
            aria-hidden
          >
            <div className="relative overflow-hidden rounded-2xl border border-cyan/25 bg-[color-mix(in_oklab,var(--card)_88%,var(--cyan)_4%)] shadow-[0_12px_36px_-18px_oklch(0_0_0/0.45)]">
              <img
                src="/brand/research-side-banner.png"
                alt=""
                className="w-full h-auto object-cover object-center max-h-[min(72vh,560px)]"
                loading="eager"
                decoding="async"
              />
              <div
                className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[color-mix(in_oklab,var(--background)_35%,transparent)] to-transparent"
                aria-hidden
              />
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
