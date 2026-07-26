import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ArrowRight, MapPin, FlaskConical } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ResearchModeBanner } from "@/components/research/ResearchModeBanner";
import {
  listResearchBriefs,
  researchStatusLabel,
  type ResearchStatus,
} from "@/lib/research-catalog";

export const Route = createFileRoute("/research/")({
  head: () => ({
    meta: [
      { title: "Research — Elenchos" },
      {
        name: "description",
        content:
          "Thesis-style research briefs: method-first workbenches separate from live Topics. Research → evidence → claims.",
      },
      { property: "og:title", content: "Research — Elenchos" },
      {
        property: "og:description",
        content:
          "Long-form research thesis briefs for serious inquiry — not live topic scores.",
      },
      { property: "og:url", content: "https://elenchos.live/research" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/research" }],
  }),
  component: ResearchLibraryPage,
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

function ResearchLibraryPage() {
  const briefs = listResearchBriefs();

  return (
    <div className="min-h-screen relative flex flex-col">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1100px] mx-auto w-full px-4 md:px-8 py-6 md:py-10 mobile-safe-bottom md:pb-12 space-y-6 md:space-y-8 relative flex-1">
        <header className="space-y-3">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
            <FlaskConical className="w-3.5 h-3.5 text-cyan" aria-hidden />
            Research workbench
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-glow-cyan">
            Thesis briefs
          </h1>
          <p className="text-sm md:text-[15px] text-muted-foreground max-w-2xl leading-relaxed">
            Method-first research products. Hold the question, evidence trail, gaps, and
            claims in one place — separate from live Topics analysis.
          </p>
        </header>

        <ResearchModeBanner message="Research is a separate product mode from Topics. No Pass-1 scores, no forced nine-question grid." />

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
                  to="/research/$slug"
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
                      Thesis · not a Topic
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

        <aside className="rounded-xl border border-border/70 bg-secondary/20 px-4 py-3 text-[12.5px] text-muted-foreground leading-relaxed">
          <strong className="text-foreground/90 font-medium">How this works: </strong>
          Research → evidence synthesis → thesis claims with falsifiers. External sources
          are the baseline. Optional Elenchos product references (class R) appear only when
          relevant, for extra transparency — never as the spine of the study.
        </aside>
      </main>

      <SiteFooter />
    </div>
  );
}
