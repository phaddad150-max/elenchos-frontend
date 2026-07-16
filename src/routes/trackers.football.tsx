import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowDownRight, ArrowUpRight, ArrowRight, Trophy, X } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { SimulatedDataBadge } from "@/components/SimulatedDataBadge";
import {
  extractFootballIndexMeta,
  extractFootballPlayers,
  fetchLatestTrackers,
  TRACKER_CATALOG,
  type FootballPlayerEntry,
  type TrackerRow,
} from "@/lib/trackers-data";
import { formatDate } from "./trackers.index";

export const Route = createFileRoute("/trackers/football")({
  head: () => ({
    meta: [
      { title: "Football Player Fan Index — Elenchos" },
      {
        name: "description",
        content:
          "Gladiator Podium rankings from World Cup fan discourse on X — player sentiment, golden-boot race, and post-match narratives (paraphrased aggregates only).",
      },
      { property: "og:title", content: "Gladiator Podium · Football Player Index" },
      { property: "og:url", content: "https://elenchos.live/trackers/football" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/trackers/football" }],
  }),
  component: FootballPlayersPage,
});

function scoreHex(s?: number | null) {
  if (s == null || Number.isNaN(s)) return "#6B7280";
  if (s >= 65) return "#4ade80";
  if (s >= 45) return "#f59e0b";
  return "#f43f5e";
}

function trendIcon(t?: string) {
  const v = (t ?? "").toLowerCase();
  if (v === "rising") return ArrowUpRight;
  if (v === "falling") return ArrowDownRight;
  return ArrowRight;
}

function FootballPlayersPage() {
  const [rows, setRows] = useState<TrackerRow[]>([]);
  const [picked, setPicked] = useState<FootballPlayerEntry | null>(null);

  useEffect(() => {
    fetchLatestTrackers().then(setRows);
  }, []);

  const row = useMemo(
    () => rows.find((r) => r.tracker_type === "football_player_index"),
    [rows],
  );
  const def = TRACKER_CATALOG.find((t) => t.tracker_type === "football_player_index");
  const players = useMemo(() => extractFootballPlayers(row), [row]);
  const meta = useMemo(() => extractFootballIndexMeta(row), [row]);
  const snapshotDate = row
    ? formatDate(row.last_updated ?? row.created_at)
    : null;

  return (
    <div className="min-h-screen relative flex flex-col">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <SiteNav />
      <main className="max-w-[1200px] mx-auto w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-10 relative flex-1 mobile-safe-bottom overflow-x-clip">
        <Link
          to="/trackers"
          className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground hover:text-cyan mb-6"
        >
          <ArrowLeft className="w-3 h-3" /> Back to trackers
        </Link>

        <header className="mb-8 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.28em] text-emerald-signal">
            <Trophy className="w-3.5 h-3.5" />
            Gladiator Podium
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-semibold tracking-tight leading-tight">
            {def?.title ?? "Football Player Index"}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{def?.tagline}</p>
          <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">
            Paraphrased fan discourse from earned media on X — no usernames or verbatim quotes.
            Rankings include only players whose national teams are still in the tournament.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded-full border border-emerald-signal/40 bg-emerald-signal/10 text-emerald-signal text-[10px] font-mono uppercase">
              Live index
            </span>
            {snapshotDate && (
              <span className="text-[10px] font-mono text-muted-foreground">{snapshotDate}</span>
            )}
            {typeof meta.posts_analyzed === "number" && (
              <span className="text-[10px] font-mono text-muted-foreground">
                {meta.posts_analyzed} posts analyzed
              </span>
            )}
            <SimulatedDataBadge />
          </div>
        </header>

        {meta.golden_boot_race_summary && (
          <div className="mb-6 rounded-xl border border-cyan/30 bg-cyan/[0.05] p-4 sm:p-5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-cyan mb-1">
              Golden boot / top scorer race
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">{meta.golden_boot_race_summary}</p>
          </div>
        )}

        {row?.deep_dive_summary && row.deep_dive_summary !== meta.golden_boot_race_summary && (
          <p className="mb-6 text-sm text-foreground/85 leading-relaxed">{row.deep_dive_summary}</p>
        )}

        {players.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground font-mono">
            Player index populates after the football_player_index tracker workflow runs.
            <br />
            <span className="text-[11px] mt-2 block">python trackers.py --tracker football_player_index</span>
          </div>
        ) : (
          <div className="space-y-2">
            {players.map((p, i) => {
              const Trend = trendIcon(p.trend);
              const color = scoreHex(p.sentiment_score);
              return (
                <motion.button
                  key={`${p.player_name}-${p.rank}`}
                  type="button"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setPicked(p)}
                  className="w-full text-left rounded-xl border border-border bg-background/40 hover:border-cyan/40 p-3 sm:p-4 flex items-center gap-3 sm:gap-4 transition-colors"
                >
                  <span className="text-lg font-display font-semibold tabular-nums text-muted-foreground w-8 text-center">
                    {String(p.rank ?? i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold text-base truncate">{p.player_name}</div>
                    <div className="text-[11px] font-mono text-muted-foreground truncate">
                      {[p.team, p.nationality].filter(Boolean).join(" · ")}
                    </div>
                    <p className="text-[13px] text-foreground/90 mt-1 line-clamp-1">{p.fan_takeaway}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(p.experience_tags ?? []).slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-secondary border border-border"
                        >
                          {tag.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 w-24">
                    <span className="text-xl font-display font-semibold tabular-nums" style={{ color }}>
                      {p.sentiment_score ?? "—"}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      salience {p.mention_salience ?? "—"}
                    </span>
                  </div>
                  <Trend className="w-4 h-4 shrink-0 text-muted-foreground" />
                </motion.button>
              );
            })}
          </div>
        )}

        {(meta.key_insights ?? row?.key_insights ?? []).length > 0 && (
          <div className="mt-8 rounded-xl border border-border p-4 space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-cyan">Cross-player patterns</div>
            <ul className="space-y-1.5">
              {(meta.key_insights ?? row?.key_insights ?? []).map((ins, i) => (
                <li key={i} className="text-sm text-foreground/90 flex gap-2">
                  <span className="text-cyan font-mono">{String(i + 1).padStart(2, "0")}</span>
                  {ins}
                </li>
              ))}
            </ul>
          </div>
        )}

        <a
          href="/topics?topic=fifa-world-cup-2026"
          className="mt-8 inline-flex text-sm font-mono text-cyan hover:underline"
        >
          View full FIFA World Cup 2026 intelligence briefing →
        </a>
      </main>
      <SiteFooter />

      <AnimatePresence>
        {picked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md grid place-items-center p-4"
            onClick={() => setPicked(null)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-2xl max-w-lg w-full p-5 relative"
            >
              <button
                type="button"
                onClick={() => setPicked(null)}
                className="absolute top-3 right-3 p-2 rounded-lg hover:bg-secondary"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="text-[10px] font-mono uppercase text-emerald-signal mb-1">
                #{picked.rank} · Fan discourse
              </div>
              <h2 className="text-2xl font-display font-semibold">{picked.player_name}</h2>
              <p className="text-[11px] font-mono text-muted-foreground mt-1">
                {[picked.team, picked.nationality].filter(Boolean).join(" · ")}
              </p>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <Stat label="Sentiment" value={String(picked.sentiment_score ?? "—")} />
                <Stat label="Salience" value={String(picked.mention_salience ?? "—")} />
                <Stat label="Trend" value={picked.trend ?? "stable"} />
              </div>
              {picked.fan_takeaway && (
                <p className="mt-4 text-sm leading-relaxed">{picked.fan_takeaway}</p>
              )}
              {(picked.evidence ?? []).length > 0 && (
                <ul className="mt-3 space-y-1.5 text-[13px]">
                  {picked.evidence!.map((e, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-cyan font-mono">{String(i + 1).padStart(2, "0")}</span>
                      {e}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-2 text-center">
      <div className="text-[9px] font-mono uppercase text-muted-foreground">{label}</div>
      <div className="text-sm font-display font-semibold tabular-nums">{value}</div>
    </div>
  );
}