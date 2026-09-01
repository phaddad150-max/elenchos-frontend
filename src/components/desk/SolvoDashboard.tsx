import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Brain,
  FileStack,
  FlaskConical,
  Globe2,
  Layers,
  MapPin,
  MapPinned,
  Radar,
  Radio,
  Trophy,
  Users,
} from "lucide-react";
import { Globe3D } from "@/components/Globe3D";
import { KpiCard } from "@/components/KpiCard";
import { SignalModal } from "@/components/SignalModal";
import type { Signal } from "@/lib/sim-data";
import {
  SOLVO_ARAB_LEADERS,
  SOLVO_KPI,
  simulateSolvoSignals,
  solvoGaps,
  solvoMovers,
} from "@/lib/desk/solvo-sim";
import { SOLVO_TOPICS } from "@/lib/desk/solvo-topics";

function leaderScoreHex(s?: number | null): string {
  if (s == null || Number.isNaN(s)) return "#6B7280";
  if (s >= 80) return "#00C853";
  if (s >= 65) return "#64DD17";
  if (s >= 50) return "#FFAB00";
  if (s >= 35) return "#FF5722";
  return "#FF1744";
}

export function SolvoDashboard() {
  const signals = useMemo(() => simulateSolvoSignals(), []);
  const gaps = useMemo(() => solvoGaps(), []);
  const movers = useMemo(() => solvoMovers(), []);
  const [picked, setPicked] = useState<Signal | null>(null);
  const [groupFilter, setGroupFilter] = useState<"Political" | "Economic" | "Social" | null>(null);
  const [regionFilter, setRegionFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return signals.filter((s) => {
      if (groupFilter) {
        const topic = SOLVO_TOPICS.find((t) => t.name === s.topic);
        if (!topic || topic.group !== groupFilter) return false;
      }
      if (regionFilter && s.region !== regionFilter) return false;
      return true;
    });
  }, [signals, groupFilter, regionFilter]);

  const groups = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => b.intensityScore - a.intensityScore);
    return {
      critical: sorted.filter((s) => s.intensity === "critical"),
      elevated: sorted.filter((s) => s.intensity === "high"),
      monitor: sorted.filter((s) => s.intensity !== "critical" && s.intensity !== "high"),
    };
  }, [filtered]);

  return (
    <main className="max-w-[1600px] mx-auto w-full px-3 sm:px-4 md:px-6 py-3 sm:py-6 md:py-7 space-y-3 sm:space-y-5 md:space-y-6 relative flex-1 mobile-safe-bottom overflow-x-clip min-w-0">
      <aside
        role="status"
        className="rounded-2xl border border-amber-signal/45 bg-amber-signal/[0.12] px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2"
      >
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-amber-signal shrink-0">
          <FlaskConical className="w-3.5 h-3.5" />
          Simulated sample
        </span>
        <p className="text-[13px] text-foreground/90 leading-snug">
          Testing data for the Solvo Creations UAE prototype — not live X. Scores use the same locked
          bands as elenchos.live. Empty would stay 0 · awaiting data.
        </p>
      </aside>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-1.5 sm:gap-2.5 items-start min-w-0"
      >
        <KpiCard
          label="Active Topics"
          value={SOLVO_KPI.topics}
          format="number"
          icon={Layers}
          description="Ten monitors for this desk."
          detail="Tech, SMB, freelance, fintech/crypto, and Emirati lived topics."
        />
        <KpiCard
          label="Countries / Regions"
          value={SOLVO_KPI.regions}
          format="number"
          icon={MapPinned}
          description="GCC and regional cities in this sample."
          detail="Simulated pins on the heatmap globe."
        />
        <KpiCard
          label="Leaders Ranked"
          value={SOLVO_KPI.leaders}
          format="number"
          icon={Users}
          description="Regional Arab leaders on this page."
          detail="Top 5 preview — no standalone tracker."
        />
        <KpiCard
          label="Published Intelligence"
          value={SOLVO_KPI.intelligence}
          format="number"
          icon={FileStack}
          description="Nine questions × ten topics."
          detail="Open Research for the full Socratic set."
        />
        <KpiCard
          label="Data Points Analyzed"
          value={SOLVO_KPI.sample}
          format="compact"
          icon={Activity}
          description="Simulated posts in this sample."
          detail="Labeled testing data — not a live pipeline total."
        />
        <KpiCard
          label="Trackers Active"
          value={SOLVO_KPI.trackers}
          format="number"
          icon={Radar}
          description="Arab leaders board on this landing."
          detail="No separate tracker route on this prototype."
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 xl:grid-cols-12 gap-2.5 sm:gap-4 md:gap-5 xl:items-start min-w-0"
      >
        <section className="dash-panel p-2.5 sm:p-4 md:p-5 xl:col-span-8 overflow-hidden min-w-0 flex flex-col max-w-full self-start">
          <div className="flex flex-col gap-1.5 sm:gap-2.5 mb-2 sm:mb-2.5 pb-2 sm:pb-2.5 border-b border-border/80 shrink-0">
            <div className="intel-header">
              <div className="intel-header-row">
                <div className="intel-header-icon">
                  <Radio className="w-4 h-4" />
                </div>
                <h2 className="font-display font-semibold text-[0.98rem] sm:text-[1.15rem] leading-snug">
                  {picked
                    ? `Public Discourse Around ${picked.topic}`
                    : "Public Discourse Around topic of selection"}
                </h2>
              </div>
              <p className="intel-header-sub">Tap a row for the full briefing.</p>
            </div>
            <div className="overflow-x-auto -mx-1 px-1 pb-0.5 custom-scroll">
              <div className="flex gap-1.5 min-w-max">
                {(["All", "Political", "Economic", "Social"] as const).map((g) => {
                  const active = (g === "All" && !groupFilter) || groupFilter === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGroupFilter(g === "All" ? null : g)}
                      className={`min-h-[36px] px-3 rounded-full text-[12px] font-medium border ${
                        active
                          ? "border-cyan/50 bg-cyan/15 text-cyan"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <FeedBlock
              label="Critical"
              color="var(--rose-signal)"
              pill="CRIT"
              items={groups.critical}
              onPick={setPicked}
            />
            <FeedBlock
              label="Elevated"
              color="var(--amber-signal)"
              pill="ELEV"
              items={groups.elevated}
              onPick={setPicked}
              start={groups.critical.length}
            />
            <FeedBlock
              label="Monitor"
              color="var(--cyan)"
              pill="MON"
              items={groups.monitor}
              onPick={setPicked}
              start={groups.critical.length + groups.elevated.length}
            />
          </div>
        </section>

        <section className="dash-panel p-2.5 sm:p-4 md:p-5 xl:col-span-4 relative overflow-hidden min-w-0 flex flex-col self-start w-full">
          <div className="mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-border/80 shrink-0">
            <div className="intel-header">
              <div className="intel-header-row">
                <div className="intel-header-icon">
                  <Globe2 className="w-4 h-4" />
                </div>
                <h2 className="intel-header-title">Global Sentiment Heatmap</h2>
              </div>
              <p className="intel-header-sub">
                Tap a point · {SOLVO_KPI.regions} regions · {SOLVO_KPI.sample.toLocaleString()} data
                points
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="relative h-[min(52vw,280px)] sm:h-[400px] xl:h-[450px] w-full rounded-xl border border-cyan/30 overflow-hidden globe-stage shadow-[inset_0_0_48px_-14px_var(--cyan-glow)] ring-1 ring-cyan/10">
              <Globe3D
                forceLight
                signals={signals}
                onPick={(s) => {
                  setRegionFilter(s.region);
                  setPicked(s);
                }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-mono">
              <LegendDot color="var(--rose-signal)" label="Critical" />
              <LegendDot color="var(--amber-signal)" label="High" />
              <LegendDot color="var(--cyan)" label="Monitor" />
            </div>
          </div>
          {regionFilter ? (
            <button
              type="button"
              onClick={() => setRegionFilter(null)}
              className="absolute top-3 right-3 text-[11px] font-mono px-2.5 py-2 rounded-full bg-card/95 border border-cyan/45 text-cyan min-h-[36px]"
            >
              <MapPin className="w-3 h-3 inline mr-1" />
              {regionFilter} · clear
            </button>
          ) : null}
        </section>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 xl:grid-cols-12 gap-2.5 sm:gap-4 md:gap-5 xl:items-stretch min-w-0"
      >
        <div className="min-w-0 xl:col-span-8 h-full flex">
          <ArabLeadersBoard />
        </div>
        <div className="min-w-0 xl:col-span-4 h-full flex">
          <aside className="dash-panel p-2.5 sm:p-3.5 min-w-0 w-full h-full flex flex-col">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/70">
              <span className="w-8 h-8 rounded-lg grid place-items-center border border-cyan/35 bg-cyan/10 text-cyan">
                <Brain className="w-3.5 h-3.5" />
              </span>
              <div>
                <p className="text-[14px] font-display font-semibold leading-tight">
                  Live signal gaps &amp; movers
                </p>
                <p className="text-[10px] font-mono text-muted-foreground">
                  Strongest gaps · rising &amp; falling · simulated
                </p>
              </div>
            </div>
            <p className="text-[9px] font-mono uppercase tracking-[0.14em] text-cyan mb-2">
              Strongest gaps
            </p>
            <div className="space-y-2 flex-1">
              {gaps.map((g, i) => (
                <div key={g.topic} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[12px] truncate">{g.topic}</span>
                    <span className="text-[13px] font-display font-semibold tabular-nums text-cyan">
                      {g.score}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, #FFAB00, #FF5722, #FF1744)" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, g.score)}%` }}
                      transition={{ duration: 0.65, delay: i * 0.05 }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-2 mt-3">
              <div className="rounded-lg border border-[#00C853]/30 bg-[#00C853]/[0.06] px-2.5 py-2">
                <p className="text-[9px] font-mono uppercase text-[#00C853] flex items-center gap-0.5 mb-1">
                  <ArrowUpRight className="w-3 h-3" /> Rising
                </p>
                {movers.rising.map((r) => (
                  <p key={r.topic} className="text-[11.5px] truncate">
                    <span className="font-mono text-[#00C853]">+{r.delta}</span> {r.topic}
                  </p>
                ))}
              </div>
              <div className="rounded-lg border border-[#FF1744]/30 bg-[#FF1744]/[0.06] px-2.5 py-2">
                <p className="text-[9px] font-mono uppercase text-[#FF1744] flex items-center gap-0.5 mb-1">
                  <ArrowDownRight className="w-3 h-3" /> Falling
                </p>
                {movers.falling.map((r) => (
                  <p key={r.topic} className="text-[11.5px] truncate">
                    <span className="font-mono text-[#FF1744]">{r.delta}</span> {r.topic}
                  </p>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </motion.div>

      <section className="rounded-xl border border-border/80 bg-card/30 px-2.5 py-2 sm:px-3 sm:py-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
            Go deeper
          </span>
          <Link
            to="/solvocreations-uae/research"
            className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 rounded-lg border border-border/90 bg-background/60 hover:border-cyan/50 text-[12.5px] font-medium"
          >
            <Layers className="w-3.5 h-3.5 text-cyan" />
            Topic analysis · 9 questions each
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      <SignalModal signal={picked} onClose={() => setPicked(null)} />
    </main>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function FeedBlock({
  label,
  color,
  pill,
  items,
  onPick,
  start = 0,
}: {
  label: string;
  color: string;
  pill: string;
  items: Signal[];
  onPick: (s: Signal) => void;
  start?: number;
}) {
  if (!items.length) return null;
  return (
    <div>
      <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] mb-1.5">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
        <span style={{ color }}>{label}</span>
        <span className="text-muted-foreground">({items.length})</span>
      </div>
      <div className="space-y-1.5">
        {items.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onPick(s)}
            className="w-full text-start rounded-xl border border-border/70 bg-background/50 hover:border-cyan/40 px-3 py-2.5 min-h-[52px] flex items-start gap-2"
          >
            <span className="text-[10px] font-mono text-muted-foreground w-5 shrink-0 pt-0.5">
              {String(start + i + 1).padStart(2, "0")}
            </span>
            <span
              className="text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0 mt-0.5"
              style={{ background: `${color}22`, color }}
            >
              {pill}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-medium leading-snug">{s.headline}</span>
              <span className="block text-[11px] text-muted-foreground truncate">
                {s.topic} · {s.region} · n={s.posts}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ArabLeadersBoard() {
  const top = SOLVO_ARAB_LEADERS;
  const [focus, setFocus] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (top.length < 2 || paused) return;
    const id = window.setInterval(() => setFocus((i) => (i + 1) % top.length), 2800);
    return () => window.clearInterval(id);
  }, [top.length, paused]);
  const focused = top[focus];
  const maxScore = Math.max(...top.map((l) => l.overall_score ?? 0), 1);

  return (
    <section
      className="tracker-card relative rounded-2xl border border-border/60 overflow-hidden min-w-0 w-full h-full flex flex-col"
      style={{
        background:
          "linear-gradient(165deg, color-mix(in oklab, var(--card) 92%, #FFAB00 8%) 0%, var(--card) 45%, color-mix(in oklab, var(--card) 94%, var(--cyan) 4%) 100%)",
        boxShadow:
          "0 20px 48px -28px rgba(255, 171, 0, 0.28), 0 0 0 1px color-mix(in oklab, #FFAB00 12%, transparent)",
      }}
    >
      <div className="relative p-3 sm:p-4 md:p-5 space-y-3 flex flex-col flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.22em] text-cyan mb-1">
              <Trophy className="w-3.5 h-3.5" />
              Regional board
            </div>
            <h2 className="text-[1.05rem] sm:text-xl font-display font-semibold leading-tight">
              Arab leaders <span className="text-cyan">by public talk</span>
            </h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Top {top.length} · simulated trust scores · not a live index
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-full border border-amber-signal/40 bg-amber-signal/10 text-amber-signal text-[10px] font-mono uppercase">
            Simulated
          </span>
        </div>
        <ul
          className="space-y-1.5"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {top.map((l, i) => {
            const score = l.overall_score ?? 0;
            const hex = leaderScoreHex(score);
            const isFocus = i === focus;
            return (
              <li key={l.name}>
                <button
                  type="button"
                  onClick={() => {
                    setFocus(i);
                    setPaused(true);
                  }}
                  className={`w-full text-left rounded-xl border px-3 py-2.5 flex items-center gap-2.5 min-h-[52px] ${
                    isFocus
                      ? "border-[#FFAB00]/55 bg-[#FFAB00]/[0.08]"
                      : "border-border/50 bg-background/45"
                  }`}
                >
                  <span className="text-xl shrink-0">{l.flag}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13.5px] font-medium truncate">{l.name}</span>
                    <span className="block text-[10px] font-mono text-muted-foreground truncate">
                      {[l.role, l.country].filter(Boolean).join(" · ")}
                    </span>
                    <span className="mt-1 block h-2 rounded-full bg-secondary overflow-hidden">
                      <motion.span
                        className="block h-full rounded-full"
                        style={{ background: hex }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(score / maxScore) * 100}%` }}
                        transition={{ duration: 0.7, delay: i * 0.06 }}
                      />
                    </span>
                  </span>
                  <span
                    className="font-display font-bold tabular-nums px-2 py-1 rounded-lg shrink-0"
                    style={{ color: hex, background: `${hex}1A` }}
                  >
                    {Math.round(score)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {focused ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={focused.name}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-[#FFAB00]/30 bg-background/50 px-3 py-2.5"
            >
              <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#FFAB00] mb-1">
                Focus · {focused.name}
              </p>
              <p className="text-[13px] leading-snug text-foreground/90">{focused.summary}</p>
            </motion.div>
          </AnimatePresence>
        ) : null}
      </div>
    </section>
  );
}
