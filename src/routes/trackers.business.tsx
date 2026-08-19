import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, Briefcase } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { TRACKER_CATALOG } from "@/lib/trackers-data";
import { SimulatedDataBadge } from "@/components/SimulatedDataBadge";
import { seedAiBusinessTrackerRow } from "@/lib/trackers/seeds/ai-business-leaders";
import { LeaderboardDetail, formatDate } from "./trackers.index";

export const Route = createFileRoute("/trackers/business")({
  head: () => ({
    meta: [
      { title: "AI & Business Leaders — Elenchos" },
      {
        name: "description",
        content:
          "Citizen trust rankings for AI and tech economy figures — how the public talks about builders and CEOs, not follower counts.",
      },
      { property: "og:title", content: "AI & Business Leaders — Elenchos" },
      { property: "og:url", content: "https://elenchos.live/trackers/business" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/trackers/business" }],
  }),
  component: BusinessLeadersPage,
});

function BusinessLeadersPage() {
  const row = useMemo(() => seedAiBusinessTrackerRow(), []);
  const def = TRACKER_CATALOG.find((t) => t.tracker_type === "ai_business_leader_trust");
  const snapshotDate = formatDate(row.created_at ?? new Date().toISOString());

  return (
    <div className="min-h-screen relative flex flex-col">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <SiteNav />
      <main className="max-w-[1200px] mx-auto w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-10 lg:py-14 relative flex-1 mobile-safe-bottom overflow-x-clip">
        <div className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
          <Link
            to="/research/library"
            search={{ section: "trackers" }}
            className="hover:text-cyan transition-colors inline-flex items-center gap-1.5 min-h-[36px]"
          >
            <ArrowLeft className="w-3 h-3" />
            Research
          </Link>
          <span aria-hidden className="text-border">
            /
          </span>
          <Link
            to="/trackers"
            className="hover:text-cyan transition-colors min-h-[36px] inline-flex items-center"
          >
            Trackers
          </Link>
          <span aria-hidden className="text-border">
            /
          </span>
          <span className="text-foreground/80">Business</span>
        </div>
        <header className="mb-8 space-y-3 max-w-4xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.28em] text-amber-signal">
            <Briefcase className="w-3.5 h-3.5" />
            Economy board
          </div>
          <h1 className="text-[1.6rem] sm:text-3xl md:text-[2.4rem] lg:text-[2.75rem] font-display font-semibold tracking-tight leading-[1.08] break-words">
            {def?.title ?? "AI & Business Leaders"}{" "}
            <span className="text-cyan">by citizens</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
            {def?.tagline}
          </p>
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="px-2 py-0.5 rounded-full border border-amber-signal/35 bg-amber-signal/10 text-amber-signal text-[10px] font-mono uppercase tracking-[0.18em]">
              Seed preview
            </span>
            {snapshotDate && (
              <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                {snapshotDate}
              </span>
            )}
            <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
              {row.item_count} entries
            </span>
            <SimulatedDataBadge />
          </div>
        </header>
        <LeaderboardDetail row={row} />
        <section className="mt-10 rounded-2xl border border-cyan/30 bg-cyan/[0.06] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <p className="text-[13px] text-foreground/90">
            Need a private brief on an AI company, founder, or market narrative?
          </p>
          <Link
            to="/pro"
            className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-full text-[13px] font-semibold border border-cyan/40 bg-cyan/12 text-cyan"
          >
            Open Pro
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
