import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  FlaskConical,
  Library,
  MapPin,
  Trophy,
  Users,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { listResearchBriefs, researchStatusLabel } from "@/lib/research-catalog";

export const Route = createFileRoute("/research/library")({
  head: () => ({
    meta: [
      { title: "Research library · Case studies & crisis briefings · Elenchos" },
      {
        name: "description",
        content:
          "Browse Elenchos deep-dive case studies, real-time crisis briefings (e.g. irregular migration), and indexes. Separate from live Topics analysis.",
      },
      {
        property: "og:title",
        content: "Research library · Case studies & crisis briefings · Elenchos",
      },
      {
        property: "og:description",
        content:
          "One shelf for thesis-style reports, crisis briefings, and leader/peace indexes.",
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

      <main className="max-w-[920px] mx-auto w-full px-3 sm:px-4 md:px-8 py-6 sm:py-8 mobile-safe-bottom md:pb-14 relative flex-1 overflow-x-clip">
        <Link
          to="/research"
          className="rd-btn-ghost inline-flex items-center gap-1.5 text-[12px] text-muted-foreground min-h-[40px] px-2.5 rounded-full border border-transparent touch-manipulation mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Research Desk
        </Link>

        <header className="page-hero-banner mb-6 sm:mb-8 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan/10 via-transparent to-emerald-signal/5 pointer-events-none" />
          <div className="relative p-4 sm:p-5 md:p-6 space-y-2">
            <div className="page-hero-kicker">
              <Library className="w-3.5 h-3.5" aria-hidden />
              Library
            </div>
            <h1 className="page-hero-title text-[1.4rem] sm:text-2xl md:text-[1.85rem]">
              Case studies, crisis briefings &amp; indexes
            </h1>
            <p className="page-hero-sub max-w-xl">
              Everything to read on the desk except live Topics analysis. Hover a card, open what
              you need — no research degree required.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href="#lib-crisis"
                className="rd-btn-ghost inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-full border border-rose-signal/30 text-[11px] font-mono uppercase tracking-[0.12em] text-rose-signal touch-manipulation"
              >
                Crisis
              </a>
              <a
                href="#lib-thesis"
                className="rd-btn-ghost inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-full border border-cyan/30 text-[11px] font-mono uppercase tracking-[0.12em] text-cyan touch-manipulation"
              >
                Case studies
              </a>
              <a
                href="#lib-idx"
                className="rd-btn-ghost inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-full border border-amber-signal/30 text-[11px] font-mono uppercase tracking-[0.12em] text-amber-signal touch-manipulation"
              >
                Indexes
              </a>
            </div>
          </div>
        </header>

        {/* Crisis briefings */}
        <section className="mb-9 space-y-3" aria-labelledby="lib-crisis">
          <SectionHead
            id="lib-crisis"
            tone="rose"
            title="Crisis briefings"
            sub="Public briefings on unfolding crises — e.g. irregular migration. Not legal advice."
          />
          <LibCard
            to="/research-migration"
            kicker="Crisis briefing · EU + UK Channel"
            title="Irregular migration — public briefing"
            body="Scale since 2011, interactive corridors, open vs resist, discourse, returns honesty. Under 10 minutes."
            accent="rose"
            delay={0}
            icon={<MapPin className="w-4 h-4" />}
          />
        </section>

        {/* Thesis case studies */}
        <section className="mb-9 space-y-3" aria-labelledby="lib-thesis">
          <SectionHead
            id="lib-thesis"
            tone="cyan"
            title="Deep-dive case studies"
            sub="Thesis-like multi-source reports for serious reading."
          />
          <div className="space-y-2.5">
            {briefs.map((b, i) => (
              <LibCard
                key={b.slug}
                to="/research/preview/$slug"
                params={{ slug: b.slug }}
                kicker={`${b.region} · ${researchStatusLabel(b.status)}`}
                title={b.title}
                body={b.subtitle}
                accent="cyan"
                pdf={!!b.pdfUrl}
                delay={0.04 + i * 0.04}
                icon={<FileText className="w-4 h-4" />}
              />
            ))}
          </div>
        </section>

        {/* Indexes */}
        <section className="mb-9 space-y-3" aria-labelledby="lib-idx">
          <SectionHead
            id="lib-idx"
            tone="amber"
            title="Indexes & leaderboards"
            sub="Citizen-scored trackers linked from the desk."
            icon={<Trophy className="w-3.5 h-3.5" />}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <IndexCard
              href="/trackers/leaders"
              title="Leaders trust index"
              body="Citizen-scored leader rankings from public discourse."
              icon={<Users className="w-4 h-4" />}
              delay={0.08}
            />
            <IndexCard
              href="/trackers/peace"
              title="Peace & normalisation"
              body="Country-level peace-health and momentum signals."
              icon={<Trophy className="w-4 h-4" />}
              delay={0.12}
            />
          </div>
        </section>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rd-cta-panel rounded-2xl border border-cyan/35 bg-gradient-to-br from-cyan/12 via-card/50 to-transparent px-4 py-4 sm:px-5 sm:py-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between"
        >
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="rd-icon-lift w-9 h-9 rounded-lg border border-cyan/35 bg-cyan/10 text-cyan grid place-items-center shrink-0">
              <FlaskConical className="w-4 h-4" />
            </span>
            <div>
              <p className="text-[13px] sm:text-[14px] font-display font-semibold text-foreground leading-snug">
                Want the same method on your topic?
              </p>
              <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">
                Fixed-price on-demand report — unique private link + PDF.
              </p>
            </div>
          </div>
          <Link
            to="/research/commission"
            className="rd-btn-primary inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full bg-cyan text-background text-[12px] font-semibold touch-manipulation shrink-0"
          >
            On-demand report <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </main>

      <SiteFooter />
    </div>
  );
}

function SectionHead({
  id,
  tone,
  title,
  sub,
  icon,
}: {
  id: string;
  tone: "rose" | "cyan" | "amber";
  title: string;
  sub: string;
  icon?: React.ReactNode;
}) {
  const color =
    tone === "rose"
      ? "text-rose-signal"
      : tone === "amber"
        ? "text-amber-signal"
        : "text-cyan";
  return (
    <div className="px-0.5 space-y-1">
      <h2
        id={id}
        className={`text-[11px] font-mono uppercase tracking-[0.16em] ${color} flex items-center gap-2 scroll-mt-24`}
      >
        {icon}
        {title}
      </h2>
      <p className="text-[12.5px] text-muted-foreground leading-snug max-w-xl">{sub}</p>
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
  delay = 0,
  icon,
}: {
  to: string;
  params?: { slug: string };
  kicker: string;
  title: string;
  body: string;
  accent: "rose" | "cyan";
  pdf?: boolean;
  delay?: number;
  icon?: React.ReactNode;
}) {
  const accentClass = accent === "rose" ? "rd-card-rose" : "rd-card-cyan";
  const accentColor = accent === "rose" ? "var(--rose-signal)" : "var(--cyan)";
  const iconBorder =
    accent === "rose"
      ? "border-rose-signal/35 bg-rose-signal/10 text-rose-signal"
      : "border-cyan/35 bg-cyan/10 text-cyan";

  const inner = (
    <div className="flex items-start gap-3 sm:gap-3.5">
      <span
        className={`rd-icon-lift shrink-0 w-10 h-10 rounded-xl border grid place-items-center ${iconBorder}`}
      >
        {icon ?? <FileText className="w-4 h-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="text-[10px] font-mono uppercase tracking-[0.12em]"
          style={{ color: accentColor }}
        >
          {kicker}
        </p>
        <p className="text-[14px] sm:text-[15px] font-display font-semibold text-foreground mt-1 leading-snug group-hover:text-cyan transition-colors">
          {title}
        </p>
        <p className="text-[12.5px] text-muted-foreground mt-1 leading-snug line-clamp-2">{body}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5">
          {pdf && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
              <FileText className="w-3 h-3" style={{ color: accentColor }} /> PDF available
            </span>
          )}
          <span className="rd-lib-arrow inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground">
            Open <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );

  const className = `rd-card rd-lib-row ${accentClass} group block rounded-2xl border border-border/90 bg-card/50 backdrop-blur-sm px-3.5 py-3.5 sm:px-4 sm:py-4 touch-manipulation min-h-[44px]`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      {params ? (
        <Link to={to} params={params} className={className}>
          {inner}
        </Link>
      ) : (
        <Link to={to} className={className}>
          {inner}
        </Link>
      )}
    </motion.div>
  );
}

function IndexCard({
  href,
  title,
  body,
  icon,
  delay = 0,
}: {
  href: string;
  title: string;
  body: string;
  icon: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="h-full"
    >
      <a
        href={href}
        className="rd-card rd-card-amber rd-lib-row group flex flex-col h-full rounded-2xl border border-border/90 bg-card/50 backdrop-blur-sm px-3.5 py-3.5 sm:px-4 sm:py-4 touch-manipulation min-h-[44px]"
      >
        <div className="flex items-start gap-3">
          <span className="rd-icon-lift shrink-0 w-10 h-10 rounded-xl border border-amber-signal/35 bg-amber-signal/10 text-amber-signal grid place-items-center">
            {icon}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-display font-semibold text-foreground group-hover:text-amber-signal transition-colors leading-snug">
              {title}
            </p>
            <p className="text-[12px] text-muted-foreground mt-1 leading-snug">{body}</p>
            <span className="rd-lib-arrow inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground mt-2.5">
              Open tracker <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </a>
    </motion.div>
  );
}
