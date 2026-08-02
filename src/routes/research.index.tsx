import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  FlaskConical,
  Home,
  Library,
  Lock,
  Radio,
  Sparkles,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { RESEARCH_NORTH_STAR } from "@/lib/research-catalog";

export const Route = createFileRoute("/research/")({
  head: () => ({
    meta: [
      { title: "Research Desk · Elenchos" },
      {
        name: "description",
        content:
          "Research Desk: public discourse analysis, deep-dive case studies, or commission your own report. Privacy-first. Not the same as live Topics scores alone.",
      },
      { property: "og:title", content: "Research Desk · Elenchos" },
      { property: "og:url", content: "https://elenchos.live/research" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/research" }],
  }),
  component: ResearchDeskLanding,
});

function ResearchDeskLanding() {
  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1100px] mx-auto w-full px-3 sm:px-4 md:px-8 py-6 sm:py-8 md:py-10 mobile-safe-bottom md:pb-16 relative flex-1 overflow-x-clip">
        {/* Same page-hero chrome as Topics/About — no side art */}
        <header className="page-hero-banner mb-6 sm:mb-8">
          <div className="relative p-4 sm:p-5 md:p-6 min-w-0">
            <div className="page-hero-kicker">
              <FlaskConical className="w-3.5 h-3.5" aria-hidden />
              Research Desk
            </div>
            <h1 className="page-hero-title text-[1.45rem] sm:text-2xl md:text-[1.9rem] lg:text-[2.15rem] break-words mt-2">
              Plan, read, or commission research
            </h1>
            <p className="page-hero-sub max-w-2xl mt-2">{RESEARCH_NORTH_STAR}</p>
            <p className="mt-3 inline-flex items-start gap-2 text-[12px] text-muted-foreground max-w-2xl">
              <Lock className="w-3.5 h-3.5 text-cyan shrink-0 mt-0.5" aria-hidden />
              <span>
                No account to browse. We do not collect personal identity for reading. Paid orders
                use one-time checkout — card/crypto details stay with the payment processor.
              </span>
            </p>
            <Link
              to="/"
              className="mt-3 inline-flex items-center gap-1.5 self-start rounded-full border border-cyan/40 bg-cyan/10 hover:bg-cyan/18 text-cyan px-3.5 py-2 text-[12px] font-medium transition-colors min-h-[40px] touch-manipulation"
            >
              <Home className="w-3.5 h-3.5" />
              Homepage
            </Link>
          </div>
        </header>

        <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground mb-3 px-0.5">
          Choose how you want to work
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5 mb-8">
          <PathCard
            icon={<Radio className="w-5 h-5 text-cyan" />}
            step="01"
            title="Investigative intelligence"
            subtitle="Public discourse analysis"
            body="Live-style topic analysis: what citizens say on X, contrasted with official and media frames. Socratic questions, sentiment, divergence."
            cta="Open Topics"
            to="/topics"
          />
          <PathCard
            icon={<BookOpen className="w-5 h-5 text-cyan" />}
            step="02"
            title="Deep-dive case studies"
            subtitle="Thesis-like reports & library"
            body="Multi-source briefs and crisis packages for serious reading — not a live pulse. Includes indexes and published case studies."
            cta="Browse library"
            to="/research/library"
          />
          <PathCard
            icon={<Sparkles className="w-5 h-5 text-cyan" />}
            step="03"
            title="On-demand report"
            subtitle="Your topic · fixed low price"
            body="Run our method on a topic you choose. Topic-analysis style ($10) or multi-source deep dive ($10 without X · $20 with X). Unique link + PDF."
            cta="Commission a report"
            to="/research/commission"
          />
        </div>

        <div className="rounded-xl border border-border/80 bg-card/40 px-3.5 sm:px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <div className="flex items-start gap-2.5 min-w-0">
            <Library className="w-4 h-4 text-cyan shrink-0 mt-0.5" aria-hidden />
            <div>
              <p className="text-[13px] font-display font-semibold text-foreground">
                Everything to read (except live Topics)
              </p>
              <p className="text-[12px] text-muted-foreground leading-snug">
                Crisis packages, thesis case studies, and indexes in one simple shelf.
              </p>
            </div>
          </div>
          <Link
            to="/research/library"
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full border border-cyan/40 bg-cyan/10 text-cyan text-[12px] font-medium touch-manipulation shrink-0"
          >
            Open library <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function PathCard({
  icon,
  step,
  title,
  subtitle,
  body,
  cta,
  to,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  subtitle: string;
  body: string;
  cta: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-2xl border border-border/90 bg-card/50 hover:border-cyan/45 hover:bg-cyan/[0.05] p-4 sm:p-5 min-h-[44px] touch-manipulation transition-colors h-full"
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        {icon}
        <span className="text-[10px] font-mono text-muted-foreground tabular-nums">{step}</span>
      </div>
      <h2 className="text-[15px] sm:text-[16px] font-display font-semibold text-foreground group-hover:text-cyan leading-snug">
        {title}
      </h2>
      <p className="text-[12px] text-cyan/90 mt-0.5">{subtitle}</p>
      <p className="text-[12.5px] text-muted-foreground leading-relaxed mt-2 flex-1">{body}</p>
      <span className="inline-flex items-center gap-1 text-[12px] text-cyan font-medium mt-4">
        {cta} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </span>
    </Link>
  );
}
