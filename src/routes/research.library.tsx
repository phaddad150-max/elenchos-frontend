import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  FlaskConical,
  Library,
  MapPin,
  Scale,
  Share2,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { listResearchBriefs, researchStatusLabel } from "@/lib/research-catalog";

type SharedItem = {
  token: string;
  title: string;
  topic: string;
  packageId: string;
  createdAt: string;
  sharedAt: string | null;
};

export const Route = createFileRoute("/research/library")({
  head: () => ({
    meta: [
      { title: "Research library · Case studies & crisis briefings · Elenchos" },
      {
        name: "description",
        content:
          "Browse Elenchos deep-dive case studies, real-time crisis briefings, community shared reports, and indexes. Separate from live Topics analysis.",
      },
      {
        property: "og:title",
        content: "Research library · Case studies & crisis briefings · Elenchos",
      },
      {
        property: "og:description",
        content:
          "One shelf for thesis-style reports, crisis briefings, community reports, and leader/peace indexes.",
      },
      { property: "og:url", content: "https://elenchos.live/research/library" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/research/library" }],
  }),
  component: ResearchLibraryPage,
});

function ResearchLibraryPage() {
  const briefs = listResearchBriefs();
  const [shared, setShared] = useState<SharedItem[]>([]);
  const [sharedReady, setSharedReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Deep-dive packages only — topic-analysis shares live under Topics → Topics commissioned
    fetch("/api/research/shared?kind=deep")
      .then((r) => r.json())
      .then((data: { items?: SharedItem[] }) => {
        if (!cancelled) setShared(Array.isArray(data.items) ? data.items : []);
      })
      .catch(() => {
        if (!cancelled) setShared([]);
      })
      .finally(() => {
        if (!cancelled) setSharedReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[920px] mx-auto w-full min-w-0 px-3 sm:px-4 md:px-8 py-6 sm:py-8 mobile-safe-bottom md:pb-14 relative flex-1 overflow-x-clip">
        {/* Breadcrumb + desk nav */}
        <nav
          aria-label="Research location"
          className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground mb-3 min-w-0"
        >
          <Link to="/" className="hover:text-cyan touch-manipulation min-h-[36px] inline-flex items-center">
            Home
          </Link>
          <span aria-hidden>/</span>
          <Link
            to="/research"
            className="hover:text-cyan touch-manipulation min-h-[36px] inline-flex items-center"
          >
            Research Desk
          </Link>
          <span aria-hidden>/</span>
          <span className="text-foreground/90 font-medium">Library</span>
        </nav>

        <div className="flex flex-wrap gap-2 mb-4">
          <Link
            to="/research"
            className="rd-btn-ghost inline-flex items-center gap-1.5 text-[12px] text-muted-foreground min-h-[40px] px-2.5 rounded-full border border-border/70 touch-manipulation"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Desk
          </Link>
          <Link
            to="/research/commission"
            className="rd-btn-ghost inline-flex items-center gap-1.5 text-[12px] text-cyan min-h-[40px] px-2.5 rounded-full border border-cyan/35 bg-cyan/8 touch-manipulation"
          >
            <Zap className="w-3.5 h-3.5" /> On-demand · $10
          </Link>
          <Link
            to="/research/networks-ledger"
            className="rd-btn-ghost inline-flex items-center gap-1.5 text-[12px] text-cyan min-h-[40px] px-2.5 rounded-full border border-cyan/35 bg-cyan/8 touch-manipulation"
          >
            <Scale className="w-3.5 h-3.5" /> Networks Ledger
          </Link>
          <Link
            to="/topics"
            className="rd-btn-ghost inline-flex items-center gap-1.5 text-[12px] text-muted-foreground min-h-[40px] px-2.5 rounded-full border border-border/70 touch-manipulation"
          >
            Live Topics
          </Link>
        </div>

        <header className="page-hero-banner mb-5 sm:mb-6 overflow-hidden relative min-w-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan/10 via-transparent to-emerald-signal/5 pointer-events-none" />
          <div className="relative p-4 sm:p-5 md:p-6 space-y-2 min-w-0">
            <div className="page-hero-kicker">
              <Library className="w-3.5 h-3.5" aria-hidden />
              Library
            </div>
            <h1 className="page-hero-title text-[1.35rem] sm:text-2xl md:text-[1.85rem] break-words">
              Case studies, crisis briefings &amp; indexes
            </h1>
            <p className="page-hero-sub max-w-xl break-words">
              Everything to read on the desk except live Topics analysis. Jump with the bar below.
            </p>
          </div>
        </header>

        {/* Sticky in-page nav */}
        <nav
          aria-label="Library sections"
          className="sticky top-[3.6rem] z-20 mb-6 -mx-1 px-1 py-2 bg-background/90 backdrop-blur-md border-b border-border/70"
        >
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 custom-scroll overscroll-x-contain">
            <JumpChip href="#lib-crisis" label="Crisis" tone="rose" />
            <JumpChip href="#lib-thesis" label="Case studies" tone="cyan" />
            <JumpChip href="#lib-commissioned" label="Commissioned" tone="cyan" />
            <JumpChip href="#lib-idx" label="Indexes" tone="amber" />
            <JumpChip href="#lib-commission" label="Commission" tone="cyan" />
          </div>
        </nav>

        {/* Crisis briefings */}
        <section className="mb-9 space-y-3 scroll-mt-28" aria-labelledby="lib-crisis">
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
        <section className="mb-9 space-y-3 scroll-mt-28" aria-labelledby="lib-thesis">
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

        {/* Independently commissioned deep-dive reports (opt-in share) */}
        <section className="mb-9 space-y-3 scroll-mt-28" aria-labelledby="lib-commissioned">
          <SectionHead
            id="lib-commissioned"
            tone="cyan"
            title="Independently commissioned"
            sub="Deep-dive reports commissioned by users and shared by them — not Elenchos editorial case studies. Topic-analysis shares appear under Topics → Topics commissioned."
            icon={<Share2 className="w-3.5 h-3.5" />}
          />
          {!sharedReady && (
            <p className="text-[12px] font-mono text-muted-foreground px-0.5">
              Loading commissioned reports…
            </p>
          )}
          {sharedReady && shared.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card/30 px-4 py-4 text-[13px] text-muted-foreground leading-relaxed">
              No independently commissioned deep-dive reports shared yet. After you commission a
              multi-source report, open your unique link and choose{" "}
              <strong className="text-foreground/85">Share on Elenchos</strong>.
            </div>
          )}
          <div className="space-y-2.5">
            {shared.map((s, i) => (
              <LibCard
                key={s.token}
                to="/research/report/$token"
                params={{ token: s.token }}
                kicker={`Independently commissioned · ${s.packageId}`}
                title={s.title}
                body={s.topic}
                accent="cyan"
                delay={0.06 + i * 0.03}
                icon={<Share2 className="w-4 h-4" />}
              />
            ))}
          </div>
        </section>

        {/* Indexes & trackers — only surfaced here (not on Research landing) */}
        <section className="mb-9 space-y-3 scroll-mt-28" aria-labelledby="lib-idx">
          <SectionHead
            id="lib-idx"
            tone="amber"
            title="Indexes & trackers"
            sub="Citizen-scored leadership board and peace index from public discourse."
            icon={<Trophy className="w-3.5 h-3.5" />}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <IndexCard
              href="/trackers/leaders"
              title="Leadership board"
              body="Global leader trust rankings — trust, leadership, economy, free speech, and more."
              icon={<Users className="w-4 h-4" />}
              delay={0.08}
            />
            <IndexCard
              href="/trackers/peace"
              title="Peace index"
              body="Peace & normalisation diagnostics — citizen support, momentum, government vs public gap."
              icon={<Trophy className="w-4 h-4" />}
              delay={0.12}
            />
          </div>
          <Link
            to="/trackers"
            className="inline-flex items-center gap-1.5 text-[12px] font-mono text-cyan hover:underline min-h-[40px] touch-manipulation px-0.5"
          >
            Open full trackers hub <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </section>

        <motion.div
          id="lib-commission"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rd-cta-panel scroll-mt-28 rounded-2xl border border-cyan/35 bg-gradient-to-br from-cyan/12 via-card/50 to-transparent px-4 py-4 sm:px-5 sm:py-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between"
        >
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="rd-icon-lift w-9 h-9 rounded-lg border border-cyan/35 bg-cyan/10 text-cyan grid place-items-center shrink-0">
              <FlaskConical className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] sm:text-[14px] font-display font-semibold text-foreground leading-snug break-words">
                Want the same method on your topic?
              </p>
              <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug break-words">
                Fixed-price on-demand report — unique private link + PDF. Optional public share later.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link
              to="/research/commission"
              className="rd-btn-primary inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full bg-cyan text-background text-[12px] font-semibold touch-manipulation"
            >
              On-demand report <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/research"
              className="rd-btn-ghost inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full border border-border text-[12px] text-muted-foreground touch-manipulation"
            >
              Back to desk
            </Link>
          </div>
        </motion.div>
      </main>

      <SiteFooter />
    </div>
  );
}

function JumpChip({
  href,
  label,
  tone,
}: {
  href: string;
  label: string;
  tone: "rose" | "cyan" | "amber";
}) {
  const cls =
    tone === "rose"
      ? "border-rose-signal/35 text-rose-signal"
      : tone === "amber"
        ? "border-amber-signal/35 text-amber-signal"
        : "border-cyan/35 text-cyan";
  return (
    <a
      href={href}
      className={`rd-btn-ghost shrink-0 inline-flex items-center min-h-[40px] px-3 rounded-full border text-[11px] font-mono uppercase tracking-[0.12em] touch-manipulation ${cls}`}
    >
      {label}
    </a>
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
    <div className="px-0.5 space-y-1 min-w-0">
      <h2
        id={id}
        className={`text-[11px] font-mono uppercase tracking-[0.16em] ${color} flex items-center gap-2 scroll-mt-28`}
      >
        {icon}
        {title}
      </h2>
      <p className="text-[12.5px] text-muted-foreground leading-snug max-w-xl break-words">{sub}</p>
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
  params?: { slug: string } | { token: string };
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
    <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
      <span
        className={`rd-icon-lift shrink-0 w-10 h-10 rounded-xl border grid place-items-center ${iconBorder}`}
      >
        {icon ?? <FileText className="w-4 h-4" />}
      </span>
      <div className="min-w-0 flex-1 overflow-hidden">
        <p
          className="text-[10px] font-mono uppercase tracking-[0.12em] truncate"
          style={{ color: accentColor }}
        >
          {kicker}
        </p>
        <p className="text-[14px] sm:text-[15px] font-display font-semibold text-foreground mt-1 leading-snug group-hover:text-cyan transition-colors break-words [overflow-wrap:anywhere]">
          {title}
        </p>
        <p className="text-[12.5px] text-muted-foreground mt-1 leading-snug line-clamp-2 break-words">
          {body}
        </p>
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

  const className = `rd-card rd-lib-row ${accentClass} group block rounded-2xl border border-border/90 bg-card/50 backdrop-blur-sm px-3.5 py-3.5 sm:px-4 sm:py-4 touch-manipulation min-h-[44px] min-w-0 overflow-hidden`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="min-w-0"
    >
      {params ? (
        <Link to={to} params={params as never} className={className}>
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
      className="h-full min-w-0"
    >
      <a
        href={href}
        className="rd-card rd-card-amber rd-lib-row group flex flex-col h-full rounded-2xl border border-border/90 bg-card/50 backdrop-blur-sm px-3.5 py-3.5 sm:px-4 sm:py-4 touch-manipulation min-h-[44px] min-w-0 overflow-hidden"
      >
        <div className="flex items-start gap-3 min-w-0">
          <span className="rd-icon-lift shrink-0 w-10 h-10 rounded-xl border border-amber-signal/35 bg-amber-signal/10 text-amber-signal grid place-items-center">
            {icon}
          </span>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="text-[14px] font-display font-semibold text-foreground group-hover:text-amber-signal transition-colors leading-snug break-words">
              {title}
            </p>
            <p className="text-[12px] text-muted-foreground mt-1 leading-snug break-words">{body}</p>
            <span className="rd-lib-arrow inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground mt-2.5">
              Open tracker <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </a>
    </motion.div>
  );
}
