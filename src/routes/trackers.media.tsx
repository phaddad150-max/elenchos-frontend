import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Newspaper } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { fetchLatestTrackers, TRACKER_CATALOG, type TrackerRow } from "@/lib/trackers-data";
import { SimulatedDataBadge } from "@/components/SimulatedDataBadge";
import { MediaTrustDetail, formatDate } from "./trackers.index";

export const Route = createFileRoute("/trackers/media")({
  head: () => ({
    meta: [
      { title: "Media Trust Index — Elenchos" },
      {
        name: "description",
        content:
          "Citizen trust in the world's news outlets — with English vs. local-language discrepancy scoring.",
      },
      { property: "og:title", content: "Media Trust Index — Elenchos" },
      { property: "og:url", content: "https://elenchos.live/trackers/media" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/trackers/media" }],
  }),
  component: MediaPage,
});

function MediaPage() {
  const [rows, setRows] = useState<TrackerRow[]>([]);
  useEffect(() => {
    fetchLatestTrackers().then(setRows);
  }, []);
  const row = useMemo(() => rows.find((r) => r.tracker_type === "media_trust"), [rows]);
  const def = TRACKER_CATALOG.find((t) => t.tracker_type === "media_trust");
  const snapshotDate = row ? formatDate(row.created_at) : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteNav />
      <main className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14 flex-1">
        <div className="mb-6 flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
          <Link
            to="/trackers"
            className="hover:text-violet-400 transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to trackers
          </Link>
        </div>
        <header className="mb-8 space-y-3 max-w-4xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.28em] text-violet-400">
            <Newspaper className="w-3.5 h-3.5" />
            Media Trust Index
          </div>
          <h1 className="text-[1.6rem] sm:text-3xl md:text-[2.4rem] lg:text-[2.75rem] font-display font-semibold tracking-tight leading-[1.08] break-words">
            {def?.title ?? "Media Trust"}{" "}
            <span className="text-violet-400">Index</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
            {def?.tagline}
          </p>
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="px-2 py-0.5 rounded-full border border-violet-400/30 bg-violet-400/10 text-violet-400 text-[10px] font-mono uppercase tracking-[0.18em] inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" /> Live
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
        <MediaTrustDetail row={row} />
      </main>
      <SiteFooter />
    </div>
  );
}
