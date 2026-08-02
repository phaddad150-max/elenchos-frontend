import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  FileText,
  FlaskConical,
  Home,
  Lock,
  Radio,
  ShieldAlert,
  Sparkles,
  Trophy,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { CommissionBriefForm } from "@/components/research/CommissionBriefForm";
import {
  listResearchBriefs,
  RESEARCH_NORTH_STAR,
  RESEARCH_STYLES,
  researchStatusLabel,
} from "@/lib/research-catalog";

export const Route = createFileRoute("/research/")({
  head: () => ({
    meta: [
      { title: "Research Desk · Elenchos" },
      {
        name: "description",
        content:
          "Research Desk: investigative intelligence (Topics), thesis-style case studies, free-style on-demand briefs. Privacy-first. Not live topic scores alone.",
      },
      { property: "og:title", content: "Research Desk · Elenchos" },
      {
        property: "og:description",
        content:
          "Choose your analysis style. Read briefs. Commission structured research. We do not store card data or require an account to browse.",
      },
      { property: "og:url", content: "https://elenchos.live/research" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/research" }],
  }),
  component: ResearchDeskPage,
});

function ResearchDeskPage() {
  const briefs = listResearchBriefs();

  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[960px] mx-auto w-full px-3 sm:px-4 md:px-6 py-5 sm:py-8 mobile-safe-bottom md:pb-14 relative flex-1 overflow-x-clip">
        {/* Compact hero */}
        <header className="mb-6 sm:mb-8 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
            <FlaskConical className="w-3.5 h-3.5 text-cyan" aria-hidden />
            Research desk
            <span className="text-border">·</span>
            Not live Topics scores alone
          </div>
          <h1 className="font-display font-semibold text-[1.5rem] sm:text-2xl md:text-[1.85rem] leading-tight text-foreground max-w-2xl">
            One desk. Three ways to use Elenchos research.
          </h1>
          <p className="text-[13px] sm:text-[14px] text-muted-foreground max-w-xl leading-relaxed">
            {RESEARCH_NORTH_STAR}
          </p>
          <p className="inline-flex items-start gap-2 text-[12px] text-muted-foreground border border-border rounded-lg bg-card/50 px-3 py-2 max-w-xl">
            <Lock className="w-3.5 h-3.5 text-cyan shrink-0 mt-0.5" aria-hidden />
            <span>
              <strong className="text-foreground/90">Privacy:</strong> no account to read. We do not
              collect personal identity for browsing. Paid commissions use one-time processor
              checkout — we never store card or wallet secrets.
            </span>
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[12px] text-cyan hover:underline min-h-[40px] touch-manipulation"
          >
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
        </header>

        {/* Style chooser — first screen clarity */}
        <section className="mb-8 sm:mb-10" aria-labelledby="styles-h">
          <h2 id="styles-h" className="sr-only">
            Research styles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {RESEARCH_STYLES.map((s, i) => {
              const Icon = s.id === "intel" ? Radio : s.id === "thesis" ? BookOpen : Sparkles;
              const accent =
                s.id === "intel" ? "cyan" : s.id === "thesis" ? "emerald-signal" : "amber-signal";
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {s.href ? (
                    <Link
                      to={s.href}
                      className={`group flex flex-col h-full rounded-2xl border border-border/90 bg-card/50 hover:border-${accent}/45 p-3.5 sm:p-4 min-h-[44px] touch-manipulation transition-colors`}
                      style={{
                        borderColor:
                          s.id === "intel"
                            ? "color-mix(in oklab, var(--cyan) 35%, var(--border))"
                            : undefined,
                      }}
                    >
                      <StyleCardBody s={s} Icon={Icon} />
                    </Link>
                  ) : (
                    <a
                      href={`#${s.hash}`}
                      className="group flex flex-col h-full rounded-2xl border border-border/90 bg-card/50 hover:border-cyan/40 p-3.5 sm:p-4 min-h-[44px] touch-manipulation transition-colors"
                    >
                      <StyleCardBody s={s} Icon={Icon} />
                    </a>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Read: national security */}
        <section className="mb-8 space-y-2.5" aria-labelledby="desk-ns">
          <SectionHead
            id="desk-ns"
            icon={<ShieldAlert className="w-4 h-4 text-rose-signal" />}
            title="Read · national security briefs"
            color="text-rose-signal"
          />
          <Link
            to="/research-migration"
            className="group block rounded-2xl border border-rose-signal/40 bg-rose-signal/[0.06] hover:bg-rose-signal/[0.1] px-3.5 sm:px-4 py-3.5 touch-manipulation min-h-[44px]"
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-rose-signal">
              Since 2011 · EU + UK Channel
            </p>
            <p className="text-[15px] font-display font-semibold text-foreground group-hover:text-rose-signal">
              Irregular migration intelligence
            </p>
            <p className="text-[12.5px] text-muted-foreground mt-1 leading-snug">
              Interactive corridors · crossings vs returns honesty · discourse · reverse options.
              Under 10 minutes.
            </p>
            <span className="inline-flex items-center gap-1 text-[12px] text-rose-signal mt-2">
              Open brief <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </section>

        {/* Read: thesis case studies */}
        <section id="desk-thesis" className="mb-8 space-y-2.5 scroll-mt-24" aria-labelledby="desk-thesis-h">
          <SectionHead
            id="desk-thesis-h"
            icon={<FileText className="w-4 h-4 text-cyan" />}
            title="Read · thesis-style case studies"
            color="text-cyan"
          />
          <div className="space-y-2">
            {briefs.map((b) => (
              <Link
                key={b.slug}
                to="/research/preview/$slug"
                params={{ slug: b.slug }}
                className="group block rounded-xl border border-border/90 bg-card/40 hover:border-cyan/40 px-3.5 py-3 touch-manipulation min-h-[44px]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      <span className="text-[10px] font-mono text-cyan uppercase tracking-wider">
                        {b.region}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground border border-border rounded-full px-1.5">
                        {researchStatusLabel(b.status)}
                      </span>
                    </div>
                    <p className="text-[14px] font-display font-semibold text-foreground group-hover:text-cyan leading-snug">
                      {b.title}
                    </p>
                    <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-2">{b.subtitle}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-cyan shrink-0 opacity-70" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Plan: indexes */}
        <section className="mb-8 space-y-2.5" aria-labelledby="desk-idx">
          <SectionHead
            id="desk-idx"
            icon={<Trophy className="w-4 h-4 text-amber-signal" />}
            title="Indexes & leaderboards"
            color="text-amber-signal"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a
              href="/trackers/leaders"
              className="rounded-xl border border-border bg-card/40 px-3.5 py-3 hover:border-amber-signal/40 touch-manipulation min-h-[44px]"
            >
              <p className="text-[13px] font-display font-semibold">Leaders trust index</p>
              <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-snug">
                Citizen-scored rankings (tracker surface).
              </p>
            </a>
            <a
              href="/trackers/peace"
              className="rounded-xl border border-border bg-card/40 px-3.5 py-3 hover:border-amber-signal/40 touch-manipulation min-h-[44px]"
            >
              <p className="text-[13px] font-display font-semibold">Peace & normalisation</p>
              <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-snug">
                Country peace-health signals.
              </p>
            </a>
          </div>
        </section>

        {/* Free-style commission */}
        <section
          id="desk-commission"
          className="scroll-mt-24 rounded-2xl border border-cyan/40 bg-cyan/[0.06] p-3.5 sm:p-5 space-y-4"
          aria-labelledby="desk-commission-h"
        >
          <SectionHead
            id="desk-commission-h"
            icon={<Sparkles className="w-4 h-4 text-cyan" />}
            title="Free-style · commission a brief"
            color="text-cyan"
          />
          <p className="text-[13px] text-foreground/90 leading-relaxed max-w-2xl">
            Use the same desk method on <strong>your</strong> topic. Choose Topics-analysis style
            (discourse vs official/media) or thesis-like depth. One-time fee. Safe for critical
            questions — the product is the report, not a dossier on you.
          </p>
          <CommissionBriefForm />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function SectionHead({
  id,
  icon,
  title,
  color,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 px-0.5">
      {icon}
      <h2 id={id} className={`text-[11px] font-mono uppercase tracking-[0.16em] ${color}`}>
        {title}
      </h2>
    </div>
  );
}

function StyleCardBody({
  s,
  Icon,
}: {
  s: (typeof RESEARCH_STYLES)[number];
  Icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-cyan shrink-0" aria-hidden />
        <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
          {s.id === "intel" ? "01" : s.id === "thesis" ? "02" : "03"}
        </p>
      </div>
      <p className="text-[14px] sm:text-[15px] font-display font-semibold text-foreground leading-snug group-hover:text-cyan">
        {s.title}
      </p>
      <p className="text-[12px] text-cyan/90 mt-0.5">{s.short}</p>
      <p className="text-[11.5px] text-muted-foreground mt-2 leading-snug flex-1">{s.method}</p>
      <p className="text-[11px] text-muted-foreground/90 mt-2 font-mono">{s.forWhom}</p>
      <span className="inline-flex items-center gap-1 text-[12px] text-cyan mt-3 font-medium">
        {s.cta} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </span>
    </>
  );
}
