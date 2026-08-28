import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Megaphone } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import {
  JOURNALIST_DIMENSIONS,
  TRACKER_CATALOG,
  fetchLatestTrackers,
  type TrackerRow,
} from "@/lib/trackers-data";
import { SimulatedDataBadge } from "@/components/SimulatedDataBadge";
import { ContactEmailMe } from "@/components/ContactEmailMe";
import { LeaderboardDetail, formatDate } from "./trackers.index";

export const Route = createFileRoute("/trackers/citizen-discourse")({
  head: () => ({
    meta: [
      { title: "Citizen Discourse & Awareness — Elenchos" },
      {
        name: "description",
        content:
          "Individual citizen journalists ranked on trust, authenticity, reporting rigor, and independence — NGOs excluded. Not an endorsement.",
      },
      { property: "og:title", content: "Citizen Discourse & Awareness — Elenchos" },
      {
        property: "og:url",
        content: "https://elenchos.live/trackers/citizen-discourse",
      },
    ],
    links: [
      { rel: "canonical", href: "https://elenchos.live/trackers/citizen-discourse" },
    ],
  }),
  component: CitizenDiscoursePage,
});

function CitizenDiscoursePage() {
  const [rows, setRows] = useState<TrackerRow[]>([]);
  useEffect(() => {
    fetchLatestTrackers().then(setRows);
  }, []);
  const row = useMemo(
    () => rows.find((r) => r.tracker_type === "citizen_discourse_index"),
    [rows],
  );
  const def = TRACKER_CATALOG.find((t) => t.tracker_type === "citizen_discourse_index");
  const snapshotDate = row ? formatDate(row.created_at) : null;

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
            Library
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
          <span className="text-foreground/80">Citizen discourse</span>
        </div>
        <header className="mb-8 space-y-3 max-w-4xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.28em] text-[color:var(--magenta)]">
            <Megaphone className="w-3.5 h-3.5" />
            Social board
          </div>
          <h1 className="text-[1.6rem] sm:text-3xl md:text-[2.4rem] lg:text-[2.75rem] font-display font-semibold tracking-tight leading-[1.08] break-words">
            {def?.title ?? "Citizen Discourse"}{" "}
            <span className="text-cyan">by citizens</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
            {def?.tagline}
          </p>
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="px-2 py-0.5 rounded-full border border-[color:var(--magenta)]/35 bg-[color:var(--magenta)]/10 text-[color:var(--magenta)] text-[10px] font-mono uppercase tracking-[0.18em] inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--magenta)] animate-pulse" /> Live
            </span>
            {snapshotDate && (
              <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                {snapshotDate}
              </span>
            )}
            {typeof row?.item_count === "number" && (
              <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                {row.item_count} entries
              </span>
            )}
            <SimulatedDataBadge />
          </div>
        </header>
        <LeaderboardDetail row={row} dimensions={JOURNALIST_DIMENSIONS} />
        <section className="mt-10 rounded-2xl border border-cyan/30 bg-cyan/[0.06] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <p className="text-[13px] text-foreground/90">
            Need a custom brief on migration, fraud, or peace discourse?
          </p>
          <ContactEmailMe
            source="trackers-citizen"
            variant="button"
            className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-full text-[13px] font-semibold border border-cyan/40 bg-cyan/12 text-cyan"
          >
            Custom research · contact
          </ContactEmailMe>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
