import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, FileText, FlaskConical, Library, Trophy } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { listResearchBriefs, researchStatusLabel } from "@/lib/research-catalog";

export const Route = createFileRoute("/research/library")({
  head: () => ({
    meta: [
      { title: "Research library · Case studies & crisis packages · Elenchos" },
      {
        name: "description",
        content:
          "Browse Elenchos deep-dive case studies, real-time crisis packages (e.g. irregular migration), and indexes. Separate from live Topics analysis.",
      },
      {
        property: "og:title",
        content: "Research library · Case studies & crisis packages · Elenchos",
      },
      {
        property: "og:description",
        content:
          "One shelf for thesis-style reports, crisis analysis packages, and leader/peace indexes.",
      },
      { property: "og:url", content: "https://elenchos.live/research/library" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/research/library" }],
  }),
  component: ResearchLibraryPage,
});

function ResearchLibraryPage() {
  const briefs = listResearchBriefs();

  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[900px] mx-auto w-full px-3 sm:px-4 md:px-8 py-6 sm:py-8 mobile-safe-bottom md:pb-14 relative flex-1 overflow-x-clip">
        <Link
          to="/research"
          className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-cyan min-h-[40px] touch-manipulation mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Research Desk
        </Link>

        <header className="page-hero-banner mb-6 sm:mb-8">
          <div className="p-4 sm:p-5 md:p-6">
            <div className="page-hero-kicker">
              <Library className="w-3.5 h-3.5" aria-hidden />
              Library
            </div>
            <h1 className="page-hero-title text-[1.4rem] sm:text-2xl md:text-[1.85rem] mt-2">
              Case studies, crisis packages &amp; indexes
            </h1>
            <p className="page-hero-sub max-w-xl mt-2">
              Everything to read on the desk except live Topics analysis. Pick a card — no research
              degree required.
            </p>
          </div>
        </header>

        {/* Crisis packages */}
        <section className="mb-8 space-y-2.5" aria-labelledby="lib-crisis">
          <h2
            id="lib-crisis"
            className="text-[11px] font-mono uppercase tracking-[0.16em] text-rose-signal px-0.5"
          >
            Real-time analysis on crisis
          </h2>
          <p className="text-[12.5px] text-muted-foreground px-0.5 leading-snug mb-2">
            Public packages on unfolding crises — e.g. irregular migration pressure on Spain and
            spillover debate across the EU. Not legal advice.
          </p>
          <LibCard
            to="/research-migration"
            kicker="Real-time analysis on crisis · EU + UK Channel"
            title="Irregular migration — public package"
            body="Scale since 2011, interactive corridors, open vs resist, discourse, returns honesty. Under 10 minutes."
            accent="rose"
          />
        </section>

        {/* Thesis case studies */}
        <section className="mb-8 space-y-2.5" aria-labelledby="lib-thesis">
          <h2
            id="lib-thesis"
            className="text-[11px] font-mono uppercase tracking-[0.16em] text-cyan px-0.5"
          >
            Deep-dive case studies
          </h2>
          <p className="text-[12.5px] text-muted-foreground px-0.5 leading-snug mb-2">
            Thesis-like multi-source reports for serious reading.
          </p>
          <div className="space-y-2">
            {briefs.map((b) => (
              <LibCard
                key={b.slug}
                to="/research/preview/$slug"
                params={{ slug: b.slug }}
                kicker={`${b.region} · ${researchStatusLabel(b.status)}`}
                title={b.title}
                body={b.subtitle}
                accent="cyan"
                pdf={!!b.pdfUrl}
              />
            ))}
          </div>
        </section>

        {/* Indexes */}
        <section className="mb-8 space-y-2.5" aria-labelledby="lib-idx">
          <h2
            id="lib-idx"
            className="text-[11px] font-mono uppercase tracking-[0.16em] text-amber-signal px-0.5 flex items-center gap-2"
          >
            <Trophy className="w-3.5 h-3.5" />
            Indexes &amp; leaderboards
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a
              href="/trackers/leaders"
              className="rounded-xl border border-border bg-card/40 px-3.5 py-3.5 hover:border-amber-signal/40 touch-manipulation min-h-[44px]"
            >
              <p className="text-[14px] font-display font-semibold">Leaders trust index</p>
              <p className="text-[12px] text-muted-foreground mt-1 leading-snug">
                Citizen-scored leader rankings from public discourse.
              </p>
            </a>
            <a
              href="/trackers/peace"
              className="rounded-xl border border-border bg-card/40 px-3.5 py-3.5 hover:border-amber-signal/40 touch-manipulation min-h-[44px]"
            >
              <p className="text-[14px] font-display font-semibold">Peace &amp; normalisation</p>
              <p className="text-[12px] text-muted-foreground mt-1 leading-snug">
                Country-level peace-health and momentum signals.
              </p>
            </a>
          </div>
        </section>

        <div className="rounded-xl border border-cyan/30 bg-cyan/[0.06] px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <div className="flex items-start gap-2">
            <FlaskConical className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
            <p className="text-[13px] text-foreground/90 leading-snug">
              Want the same method on <strong>your</strong> topic?
            </p>
          </div>
          <Link
            to="/research/commission"
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full border border-cyan/45 bg-cyan/15 text-cyan text-[12px] font-medium touch-manipulation"
          >
            On-demand report <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function LibCard({
  to,
  params,
  kicker,
  title,
  body,
  accent,
  pdf,
}: {
  to: string;
  params?: { slug: string };
  kicker: string;
  title: string;
  body: string;
  accent: "rose" | "cyan";
  pdf?: boolean;
}) {
  const color = accent === "rose" ? "var(--rose-signal)" : "var(--cyan)";
  const inner = (
    <>
      <p className="text-[10px] font-mono uppercase tracking-[0.12em]" style={{ color }}>
        {kicker}
      </p>
      <p className="text-[14px] sm:text-[15px] font-display font-semibold text-foreground mt-1 leading-snug group-hover:opacity-90">
        {title}
      </p>
      <p className="text-[12.5px] text-muted-foreground mt-1 leading-snug line-clamp-2">{body}</p>
      {pdf && (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground mt-2">
          <FileText className="w-3 h-3" style={{ color }} /> PDF available
        </span>
      )}
    </>
  );

  if (params) {
    return (
      <Link
        to={to}
        params={params}
        className="group block rounded-xl border border-border/90 bg-card/40 hover:border-cyan/40 px-3.5 py-3.5 touch-manipulation min-h-[44px]"
      >
        {inner}
      </Link>
    );
  }
  return (
    <Link
      to={to}
      className="group block rounded-xl border border-border/90 bg-card/40 hover:border-rose-signal/40 px-3.5 py-3.5 touch-manipulation min-h-[44px]"
    >
      {inner}
    </Link>
  );
}
