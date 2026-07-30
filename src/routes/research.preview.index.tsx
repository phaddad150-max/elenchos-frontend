import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ArrowRight, MapPin, FlaskConical } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ResearchModeBanner } from "@/components/research/ResearchModeBanner";
import {
  listResearchBriefs,
  researchStatusLabel,
  RESEARCH_NORTH_STAR,
  type ResearchStatus,
} from "@/lib/research-catalog";

export const Route = createFileRoute("/research/preview/")({
  head: () => ({
    meta: [
      { title: "Research preview · Elenchos" },
      {
        name: "description",
        content: "Internal preview of the Research workbench (not public launch).",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Research preview · Elenchos" },
      { property: "og:url", content: "https://elenchos.live/research/preview" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/research" }],
  }),
  component: ResearchPreviewLibraryPage,
});

function statusTone(status: ResearchStatus): string {
  switch (status) {
    case "method":
      return "bg-cyan/15 text-cyan border-cyan/30";
    case "collecting":
      return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    case "draft":
      return "bg-violet-500/15 text-violet-300 border-violet-500/30";
    case "published":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  }
}

function ResearchPreviewLibraryPage() {
  const briefs = listResearchBriefs();

  return (
    <div className="min-h-screen relative flex flex-col">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1100px] mx-auto w-full px-4 md:px-8 py-6 md:py-10 mobile-safe-bottom md:pb-12 space-y-6 md:space-y-8 relative flex-1">
        <header className="space-y-3">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
            <FlaskConical className="w-3.5 h-3.5 text-cyan" aria-hidden />
            Research library
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-glow-cyan">
            Research briefs
          </h1>
          <p className="text-sm md:text-[15px] text-muted-foreground max-w-2xl leading-relaxed">
            {RESEARCH_NORTH_STAR} Separate from Topics scores.
          </p>
        </header>

        <ResearchModeBanner message="Research is multi-source and human-reviewed before publish, not a live Topics pulse." />

        <section aria-label="Research briefs" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              Library · {briefs.length} brief{briefs.length === 1 ? "" : "s"}
            </h2>
          </div>

          <ul className="grid gap-3">
            {briefs.map((b) => (
              <li key={b.slug}>
                <Link
                  to="/research/preview/$slug"
                  params={{ slug: b.slug }}
                  className="group block rounded-2xl border border-border bg-card/50 hover:border-cyan/40 hover:bg-card/80 transition-colors p-4 md:p-5"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2.5">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.12em] ${statusTone(b.status)}`}
                    >
                      {researchStatusLabel(b.status)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-mono text-muted-foreground">
                      <MapPin className="w-3 h-3" aria-hidden />
                      {b.region}
                    </span>
                    <span className="text-[10.5px] font-mono text-muted-foreground">
                      Updated {b.updatedAt}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground/80 border border-border/80 rounded-full px-2 py-0.5">
                      <BookOpen className="w-3 h-3" aria-hidden />
                      Research · not a Topic
                    </span>
                  </div>

                  <h3 className="text-base md:text-lg font-display font-semibold text-foreground group-hover:text-cyan transition-colors leading-snug">
                    {b.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">
                    {b.subtitle}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {b.themes.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono uppercase tracking-[0.1em] text-muted-foreground bg-secondary/50 border border-border/60 rounded-md px-1.5 py-0.5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-1.5 text-[12px] font-medium text-cyan">
                    Open workbench
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <aside className="rounded-xl border border-border/70 bg-secondary/20 px-4 py-3 text-[12.5px] text-muted-foreground leading-relaxed space-y-2">
          <p>
            <strong className="text-foreground/90 font-medium">How this works: </strong>
            Multi-source research (scholarly, surveys, open web, official, media frames,
            discourse), then synthesis, then human-reviewed claims with falsifiers. External
            sources are the baseline. Class R (Elenchos product) is over-and-above only.
          </p>
          <p>
            <strong className="text-foreground/90 font-medium">Under noise: </strong>
            Briefs treat multi-decade regional propaganda and state/movement media as a
            field to scrutinize (not one channel), so recoverable truth can surface for
            researchers and citizens.
          </p>
        </aside>
      </main>

      <SiteFooter />
    </div>
  );
}
