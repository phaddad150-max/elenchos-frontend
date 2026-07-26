import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Lock,
  FileText,
  Download,
  HelpCircle,
  ListOrdered,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ResearchModeBanner } from "@/components/research/ResearchModeBanner";
import { ResearchSourceLegend } from "@/components/research/ResearchSourceLegend";
import {
  getResearchBrief,
  researchStatusLabel,
  RESEARCH_HUMAN_FIRST,
  RESEARCH_HUMANITY_FORWARD,
  RESEARCH_SCRUTINY_NOTE,
  type PhaseStatus,
  type ResearchBrief,
} from "@/lib/research-catalog";

export const Route = createFileRoute("/research/preview/$slug")({
  head: ({ params }) => {
    const brief = getResearchBrief(params.slug);
    const title = brief
      ? `${brief.title.slice(0, 60)}${brief.title.length > 60 ? "…" : ""} — Research preview · Elenchos`
      : "Research preview — Elenchos";
    const description =
      brief?.subtitle ??
      "Internal preview of thesis research brief — not public launch.";
    const url = `https://elenchos.live/research/preview/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: "https://elenchos.live/research" }],
    };
  },
  component: ResearchPreviewBriefPage,
});

function phaseIcon(status: PhaseStatus) {
  if (status === "done") return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
  if (status === "active") return <Circle className="w-3.5 h-3.5 text-cyan fill-cyan/30" />;
  if (status === "empty") return <Circle className="w-3.5 h-3.5 text-muted-foreground" />;
  return <Lock className="w-3.5 h-3.5 text-muted-foreground/70" />;
}

function chapterStatusLabel(status: ResearchBrief["chapters"][0]["status"]) {
  switch (status) {
    case "ready":
      return "Ready";
    case "outline":
      return "Outline";
    case "draft":
      return "Draft";
    case "empty":
      return "Awaiting evidence";
  }
}

function ResearchPreviewBriefPage() {
  const { slug } = Route.useParams();
  const brief = getResearchBrief(slug);
  if (!brief) throw notFound();

  const doneChecks = brief.corpusChecks.filter((c) => c.done).length;

  return (
    <div className="min-h-screen relative flex flex-col">
      <div className="absolute inset-0 grid-bg opacity-25 pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1400px] mx-auto w-full px-3 sm:px-4 md:px-6 py-5 md:py-8 mobile-safe-bottom md:pb-12 relative flex-1">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Link
            to="/research/preview"
            className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-cyan transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Preview library
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-amber-400/90 border border-amber-500/30 rounded-full px-2 py-0.5">
            Preview · not public
          </span>
        </div>

        <div className="space-y-4 mb-6">
          <ResearchModeBanner message={brief.notATopicBanner} />

          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full border border-cyan/30 bg-cyan/10 text-cyan px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.12em]">
                {researchStatusLabel(brief.status)}
              </span>
              <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.12em]">
                Human-gated
              </span>
              <span className="inline-flex rounded-full border border-border bg-secondary/40 text-muted-foreground px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.12em]">
                Multi-source
              </span>
              <span className="text-[10.5px] font-mono text-muted-foreground">
                {brief.region} · Updated {brief.updatedAt}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-[1.65rem] font-display font-semibold tracking-tight leading-snug max-w-4xl">
              {brief.title}
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">{brief.subtitle}</p>
          </header>
        </div>

        {/* Sticky question */}
        <section
          id="question"
          className="sticky top-[4.5rem] z-20 mb-6 rounded-xl border border-cyan/25 bg-background/95 backdrop-blur-md px-4 py-3 shadow-lg shadow-black/20"
        >
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-cyan mb-1.5">
            Research question (locked)
          </p>
          <p className="text-[13px] sm:text-[14px] text-foreground/95 leading-relaxed">
            {brief.researchQuestion}
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)_260px] gap-5 lg:gap-6 items-start">
          {/* Spine */}
          <nav
            aria-label="Research spine"
            className="lg:sticky lg:top-[9.5rem] rounded-xl border border-border bg-card/40 p-3.5 space-y-3 order-2 lg:order-1"
          >
            <h2 className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-1.5">
              <ListOrdered className="w-3.5 h-3.5" />
              Spine
            </h2>
            <ol className="space-y-1.5 text-[12px]">
              {[
                { href: "#question", label: "Question" },
                { href: "#method", label: "Method" },
                { href: "#phases", label: "Phases A–E" },
                { href: "#chapters", label: "Chapters" },
                { href: "#claims", label: "Thesis claims" },
                { href: "#scenarios", label: "Scenarios" },
                { href: "#corpus", label: "Corpus checklist" },
                { href: "#sources", label: "Sources" },
                { href: "#open", label: "Open questions" },
                { href: "#pdf", label: "PDF export" },
              ].map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="block rounded-md px-2 py-1.5 text-muted-foreground hover:text-cyan hover:bg-cyan/5 transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Main */}
          <div className="space-y-5 order-1 lg:order-2 min-w-0">
            <section id="method" className="rounded-2xl border border-border bg-card/40 p-4 md:p-5 space-y-3">
              <h2 className="text-sm font-display font-semibold text-foreground">Method</h2>
              <p className="text-[13.5px] text-muted-foreground leading-relaxed">
                {brief.methodSummary}
              </p>
              <ul className="space-y-1.5">
                {brief.approach.map((a) => (
                  <li
                    key={a}
                    className="text-[13px] text-foreground/85 leading-snug flex gap-2"
                  >
                    <span className="text-cyan shrink-0">·</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
              <div className="grid gap-2 sm:grid-cols-2 pt-1">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
                  <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-emerald-300/90 mb-1">
                    Human-first
                  </p>
                  <p className="text-[12px] text-muted-foreground leading-snug">
                    {RESEARCH_HUMAN_FIRST}
                  </p>
                </div>
                <div className="rounded-lg border border-cyan/20 bg-cyan/5 px-3 py-2.5">
                  <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-cyan mb-1">
                    Humanity-forward
                  </p>
                  <p className="text-[12px] text-muted-foreground leading-snug">
                    {RESEARCH_HUMANITY_FORWARD}
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
                <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-amber-400/90 mb-1">
                  Under regional noise
                </p>
                <p className="text-[12px] text-muted-foreground leading-snug">
                  {RESEARCH_SCRUTINY_NOTE}
                </p>
              </div>
            </section>

            <section id="phases" className="rounded-2xl border border-border bg-card/40 p-4 md:p-5 space-y-3">
              <h2 className="text-sm font-display font-semibold">Phases</h2>
              <ul className="space-y-2">
                {brief.phases.map((p) => (
                  <li
                    key={p.id}
                    className="flex gap-3 rounded-lg border border-border/70 bg-background/40 px-3 py-2.5"
                  >
                    <span className="mt-0.5 shrink-0">{phaseIcon(p.status)}</span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] text-cyan">Phase {p.id}</span>
                        <span className="text-[13px] font-medium">{p.label}</span>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                          {p.status}
                        </span>
                      </div>
                      <p className="text-[12px] text-muted-foreground mt-0.5">{p.note}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section id="chapters" className="rounded-2xl border border-border bg-card/40 p-4 md:p-5 space-y-3">
              <h2 className="text-sm font-display font-semibold">Chapters</h2>
              <p className="text-[12px] text-muted-foreground">
                Outline-driven. Empty slots stay empty until evidence exists.
              </p>
              <ol className="space-y-2">
                {brief.chapters.map((ch) => (
                  <li
                    key={ch.id}
                    className="rounded-lg border border-border/70 bg-background/30 px-3 py-2.5"
                  >
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span className="font-mono text-[11px] text-cyan">{ch.number}</span>
                      <span className="text-[13.5px] font-medium">{ch.title}</span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                        {chapterStatusLabel(ch.status)}
                      </span>
                    </div>
                    <p className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed">
                      {ch.summary}
                    </p>
                    {ch.bullets && ch.bullets.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5">
                        {ch.bullets.map((b) => (
                          <li key={b} className="text-[12px] text-foreground/75 pl-3 relative">
                            <span className="absolute left-0 text-cyan/70">·</span>
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            </section>

            <section id="claims" className="rounded-2xl border border-border bg-card/40 p-4 md:p-5 space-y-3">
              <h2 className="text-sm font-display font-semibold">Thesis claims</h2>
              <p className="text-[12px] text-muted-foreground">
                Slots reserved. Claims unlock only after evidence chapters — each needs
                evidence mix, confidence, and a falsifier.
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {brief.claimSlots.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-lg border border-dashed border-border bg-background/20 px-3 py-3 min-h-[88px]"
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
                      <Lock className="w-3 h-3" />
                      {c.id.toUpperCase()} · empty
                    </div>
                    <p className="text-[13px] font-medium text-foreground/80">{c.domain}</p>
                    <p className="text-[11.5px] text-muted-foreground mt-1 italic">
                      Awaiting evidence (Phase D locked)
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section id="scenarios" className="rounded-2xl border border-border bg-card/40 p-4 md:p-5 space-y-3">
              <h2 className="text-sm font-display font-semibold">Conditional scenarios</h2>
              <p className="text-[12px] text-muted-foreground">
                If–then structures for 12 / 36 / 60 months. None is destiny.
              </p>
              <div className="grid gap-2 md:grid-cols-3">
                {brief.scenarios.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-lg border border-border/80 bg-background/30 p-3 space-y-2"
                  >
                    <p className="font-mono text-[11px] text-cyan">
                      {s.id} · {s.name}
                    </p>
                    <p className="text-[12px] text-foreground/85">
                      <span className="text-muted-foreground">Politics: </span>
                      {s.politics}
                    </p>
                    <p className="text-[12px] text-foreground/85">
                      <span className="text-muted-foreground">Tech may accelerate: </span>
                      {s.techMayAccelerate}
                    </p>
                    <p className="text-[12px] text-foreground/85">
                      <span className="text-muted-foreground">Unlikely fast: </span>
                      {s.unlikelyFast}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section id="corpus" className="rounded-2xl border border-border bg-card/40 p-4 md:p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-display font-semibold">Corpus checklist</h2>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {doneChecks}/{brief.corpusChecks.length}
                </span>
              </div>
              <ul className="space-y-1.5">
                {brief.corpusChecks.map((c) => (
                  <li
                    key={c.id}
                    className="flex gap-2.5 items-start rounded-md px-2 py-1.5 border border-transparent hover:border-border/60"
                  >
                    {c.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <p
                        className={`text-[13px] ${c.done ? "text-foreground" : "text-foreground/80"}`}
                      >
                        {c.label}
                      </p>
                      <p className="text-[11.5px] text-muted-foreground">{c.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section id="open" className="rounded-2xl border border-border bg-card/40 p-4 md:p-5 space-y-3">
              <h2 className="text-sm font-display font-semibold flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan" />
                Open questions
              </h2>
              <ul className="space-y-2">
                {brief.openQuestions.map((q) => (
                  <li
                    key={q}
                    className="text-[13px] text-muted-foreground leading-relaxed border-l-2 border-cyan/30 pl-3"
                  >
                    {q}
                  </li>
                ))}
              </ul>
            </section>

            <section id="pdf" className="rounded-2xl border border-border bg-card/40 p-4 md:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div className="flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-cyan mt-0.5 shrink-0" />
                  <div>
                    <h2 className="text-sm font-display font-semibold">PDF thesis brief</h2>
                    <p className="text-[12px] text-muted-foreground mt-0.5">
                      Branded export when draft content is ready (FIFA-report quality bar).
                    </p>
                  </div>
                </div>
                {brief.pdfUrl ? (
                  <a
                    href={brief.pdfUrl}
                    className="inline-flex items-center gap-1.5 rounded-full border border-cyan/40 bg-cyan/10 text-cyan px-3.5 py-2 text-[12px] font-medium hover:bg-cyan/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 text-muted-foreground px-3.5 py-2 text-[12px]">
                    <Lock className="w-3.5 h-3.5" />
                    Not available yet
                  </span>
                )}
              </div>
            </section>
          </div>

          {/* Right tools */}
          <aside className="space-y-4 order-3 lg:sticky lg:top-[9.5rem]">
            <div id="sources">
              <ResearchSourceLegend classes={brief.sourceClasses} />
            </div>

            <div className="rounded-xl border border-border bg-card/40 p-3.5 space-y-2.5">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                Claim discipline
              </h3>
              <p className="text-[12px] text-muted-foreground leading-snug">
                Every published claim needs: statement · source mix (D/O/M/S) · confidence ·
                falsifier. Prefer “evidence suggests” over “will.”
              </p>
            </div>

            {brief.elenchosRefs.length > 0 && (
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3.5 space-y-2.5">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-400/90">
                  Optional Elenchos R
                </h3>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Prior product signals — only if a point is relevant. Over and above full
                  external references. Not primary evidence.
                </p>
                <ul className="space-y-2">
                  {brief.elenchosRefs.map((r) => (
                    <li key={r.label} className="text-[12px]">
                      {r.href ? (
                        <a
                          href={r.href}
                          className="text-amber-300/90 hover:text-amber-200 font-medium"
                        >
                          {r.label}
                        </a>
                      ) : (
                        <span className="text-foreground/85 font-medium">{r.label}</span>
                      )}
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                        {r.note}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-xl border border-border bg-card/40 p-3.5 space-y-1.5">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                Themes
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {brief.themes.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-mono uppercase tracking-[0.08em] text-muted-foreground bg-secondary/50 border border-border/60 rounded-md px-1.5 py-0.5"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
