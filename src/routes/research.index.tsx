import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  FlaskConical,
  Home,
  Library,
  Lock,
  Radio,
  Sparkles,
  Zap,
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
          "Research Desk: public discourse analysis, deep-dive library, or on-demand report from $10. Privacy-first. Unique link + PDF.",
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
        <header className="page-hero-banner mb-6 sm:mb-8 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan/10 via-transparent to-rose-signal/5 pointer-events-none" />
          <div className="relative p-4 sm:p-5 md:p-7 min-w-0">
            <div className="page-hero-kicker">
              <FlaskConical className="w-3.5 h-3.5" aria-hidden />
              Research Desk
            </div>
            <h1 className="page-hero-title text-[1.5rem] sm:text-2xl md:text-[2rem] lg:text-[2.2rem] break-words mt-2">
              Plan, read, or commission research
            </h1>
            <p className="page-hero-sub max-w-2xl mt-2">{RESEARCH_NORTH_STAR}</p>
            <p className="mt-3 inline-flex items-start gap-2 text-[12px] text-muted-foreground max-w-2xl rounded-lg border border-cyan/25 bg-cyan/5 px-3 py-2">
              <Lock className="w-3.5 h-3.5 text-cyan shrink-0 mt-0.5" aria-hidden />
              <span>
                <strong className="text-foreground/90">Privacy-first:</strong> no account to browse.
                We never store personal identity or payment card data. Optional email is used once
                for delivery, then not kept.
              </span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to="/research/commission"
                className="inline-flex items-center gap-2 min-h-[48px] px-5 py-2.5 rounded-full bg-cyan text-background font-display font-semibold text-[13px] shadow-[0_0_32px_-8px_var(--color-cyan-glow)] hover:bg-cyan/90 touch-manipulation"
              >
                <Zap className="w-4 h-4" />
                On-demand from $10
              </Link>
              <Link
                to="/research/library"
                className="inline-flex items-center gap-2 min-h-[48px] px-4 py-2.5 rounded-full border border-cyan/40 bg-cyan/10 text-cyan text-[13px] font-medium touch-manipulation"
              >
                <Library className="w-4 h-4" />
                Browse library
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 min-h-[48px] px-3 text-[12px] text-muted-foreground hover:text-cyan touch-manipulation"
              >
                <Home className="w-3.5 h-3.5" /> Home
              </Link>
            </div>
          </div>
        </header>

        <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-3 px-0.5">
          Three ways to use the desk
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
          <PathCard
            delay={0}
            icon={<Radio className="w-6 h-6 text-cyan" />}
            step="01"
            title="Investigative intelligence"
            subtitle="Public discourse analysis"
            body="Live Topics method: what people say on X vs official and media frames. Socratic questions, sentiment, divergence."
            cta="Open Topics"
            to="/topics"
            glow="cyan"
          />
          <PathCard
            delay={0.06}
            icon={<BookOpen className="w-6 h-6 text-cyan" />}
            step="02"
            title="Deep-dive case studies"
            subtitle="Library of reports & indexes"
            body="Thesis-like multi-source packages and crisis analysis — for reading, not a live pulse."
            cta="Open library"
            to="/research/library"
            glow="emerald"
          />
          <PathCard
            delay={0.12}
            icon={<Sparkles className="w-6 h-6 text-cyan" />}
            step="03"
            title="On-demand report"
            subtitle="Your topic · $10 / $20"
            body="Topic analysis $10 · deep multi-source $10 (no X) or $20 (with X). Unique private link + PDF after Stripe payment."
            cta="Start commission"
            to="/research/commission"
            glow="rose"
            featured
          />
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
  delay,
  featured,
  glow,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  subtitle: string;
  body: string;
  cta: string;
  to: string;
  delay: number;
  featured?: boolean;
  glow: "cyan" | "emerald" | "rose";
}) {
  const ring =
    glow === "rose"
      ? "hover:border-rose-signal/50 hover:shadow-[0_0_40px_-12px_var(--rose-signal)]"
      : glow === "emerald"
        ? "hover:border-emerald-signal/45 hover:shadow-[0_0_36px_-12px_var(--emerald-signal)]"
        : "hover:border-cyan/50 hover:shadow-[0_0_40px_-12px_var(--color-cyan-glow)]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="h-full"
    >
      <Link
        to={to}
        className={`group relative flex flex-col h-full rounded-2xl border bg-card/60 backdrop-blur-sm p-4 sm:p-5 min-h-[200px] sm:min-h-[220px] touch-manipulation transition-all ${ring} ${
          featured
            ? "border-cyan/55 bg-gradient-to-b from-cyan/15 to-card/80 ring-1 ring-cyan/30"
            : "border-border/90"
        }`}
      >
        {featured && (
          <span className="absolute top-3 right-3 text-[9px] font-mono uppercase tracking-[0.14em] text-cyan bg-cyan/15 border border-cyan/40 rounded-full px-2 py-0.5">
            Tool
          </span>
        )}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="w-11 h-11 rounded-xl border border-cyan/35 bg-cyan/10 grid place-items-center">
            {icon}
          </div>
          <span className="text-[11px] font-mono text-muted-foreground tabular-nums">{step}</span>
        </div>
        <h2 className="text-[16px] sm:text-[17px] font-display font-semibold text-foreground group-hover:text-cyan leading-snug">
          {title}
        </h2>
        <p className="text-[12px] text-cyan mt-0.5 font-medium">{subtitle}</p>
        <p className="text-[13px] text-muted-foreground leading-relaxed mt-2.5 flex-1">{body}</p>
        <span className="inline-flex items-center gap-1.5 text-[13px] text-cyan font-semibold mt-4">
          {cta}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </Link>
    </motion.div>
  );
}
