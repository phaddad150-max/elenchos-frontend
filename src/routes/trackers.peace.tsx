import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { fetchLatestTrackers, TRACKER_CATALOG, type TrackerRow } from "@/lib/trackers-data";
import { SimulatedDataBadge } from "@/components/SimulatedDataBadge";
import { PeaceDetail, formatDate } from "./trackers.index";

export const Route = createFileRoute("/trackers/peace")({
  head: () => ({
    meta: [
      { title: "Peace & Normalization Index — Elenchos" },
      {
        name: "description",
        content:
          "Diagnostic peace and normalization index — peace health, momentum, and the gap between governments and their publics, country by country.",
      },
      { property: "og:title", content: "Peace & Normalization Index — Elenchos" },
      { property: "og:url", content: "https://elenchos.live/trackers/peace" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/trackers/peace" }],
  }),
  component: PeacePage,
});

function PeacePage() {
  const [rows, setRows] = useState<TrackerRow[]>([]);
  useEffect(() => {
    fetchLatestTrackers().then(setRows);
  }, []);
  const row = useMemo(
    () => rows.find((r) => r.tracker_type === "peace_normalization"),
    [rows],
  );
  const def = TRACKER_CATALOG.find((t) => t.tracker_type === "peace_normalization");
  const snapshotDate = row ? formatDate(row.created_at) : null;

  return (
    <div className="min-h-screen relative flex flex-col">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <SiteNav />
      <main className="max-w-[1200px] mx-auto w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-10 lg:py-14 relative flex-1 mobile-safe-bottom overflow-x-clip">
        <div className="mb-6 flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
          <Link
            to="/trackers"
            className="hover:text-cyan transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to trackers
          </Link>
        </div>
        <header className="mb-8 space-y-3 max-w-4xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.28em] text-cyan">
            <Sparkles className="w-3.5 h-3.5" />
            Diagnostic Index
          </div>
          <h1 className="text-[1.6rem] sm:text-3xl md:text-[2.4rem] lg:text-[2.75rem] font-display font-semibold tracking-tight leading-[1.08] break-words">
            {def?.title ?? "Peace & Normalization"}{" "}
            <span className="text-cyan">Index</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
            {def?.tagline}
          </p>
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="px-2 py-0.5 rounded-full border border-cyan/30 bg-cyan/10 text-cyan text-[10px] font-mono uppercase tracking-[0.18em] inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" /> Live
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
        <PeaceDetail row={row} />
      </main>
      <SiteFooter />
    </div>
  );
}
