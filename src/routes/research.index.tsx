import { createFileRoute, Link } from "@tanstack/react-router";
import { FlaskConical, ArrowRight, FileText } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { listResearchBriefs, RESEARCH_NORTH_STAR } from "@/lib/research-catalog";
import { ContactEmailMe } from "@/components/ContactEmailMe";

export const Route = createFileRoute("/research/")({
  head: () => ({
    meta: [
      { title: "Research — Elenchos" },
      {
        name: "description",
        content:
          "Human-gated multi-source thesis briefs — scholarly, official, and media evidence. Separate from Topics scores.",
      },
      { property: "og:title", content: "Research — Elenchos" },
      {
        property: "og:description",
        content:
          "Thesis-style research for citizens and serious readers — claims with falsifiers, not live topic scores.",
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

      <main className="max-w-[720px] mx-auto w-full px-4 md:px-8 py-12 md:py-16 mobile-safe-bottom md:pb-20 relative flex-1">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-4">
            <FlaskConical className="w-3.5 h-3.5 text-cyan" aria-hidden />
            Research
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-glow-cyan mb-3">
            Thesis briefs, not live scores
          </h1>
          <p className="text-[15px] text-muted-foreground leading-relaxed max-w-xl mx-auto">
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

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
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
      </main>

      <SiteFooter />
    </div>
  );
}
