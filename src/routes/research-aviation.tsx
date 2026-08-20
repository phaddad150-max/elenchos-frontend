import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  ChevronDown,
  Copy,
  FlaskConical,
  Home,
  Plane,
  Share2,
  Sparkles,
  Timer,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import {
  AVIATION_SOURCES,
  CHAPTERS,
  CLAIMS,
  HOOK_HEADLINE,
  HOOK_KPIS,
  HOOK_SUB,
  INNOVATION_LANES,
  METHOD_RAILS,
  NETWORK_CARDS,
  OEM_COMPARE,
  READINESS_ROWS,
  SCENARIOS,
  TIMELINE,
  TRAFFIC_RECOVERY,
  X_THREAD_DRAFT,
} from "@/lib/aviation/data";

export const Route = createFileRoute("/research-aviation")({
  head: () => ({
    meta: [
      {
        title:
          "Aviation after disruption · OEM · satcom · AI readiness · Elenchos Research",
      },
      {
        name: "description",
        content:
          "Interactive deep dive: commercial aviation after COVID — OEM race, networks, Starlink-class satcom, payments, AI ops readiness. Free open sources. Not investment advice.",
      },
      {
        property: "og:title",
        content: "Aviation after disruption · Elenchos Research",
      },
      {
        property: "og:description",
        content:
          "Delivery trust, cabin bandwidth, AI ops KPIs — interactive readiness index. Under 10 minutes.",
      },
      { property: "og:url", content: "https://elenchos.live/research-aviation" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/research-aviation" }],
  }),
  component: AviationIntelligencePage,
});

const toneColor: Record<string, string> = {
  rose: "var(--rose-signal)",
  amber: "var(--amber-signal)",
  cyan: "var(--cyan)",
  emerald: "var(--emerald-signal)",
};

function AviationIntelligencePage() {
  const [active, setActive] = useState(CHAPTERS[0]!.id);
  const [copied, setCopied] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(READINESS_ROWS[2]!.id);

  useEffect(() => {
    const nodes = CHAPTERS.map((c) => document.getElementById(`ch-${c.id}`)).filter(
      Boolean,
    ) as HTMLElement[];
    if (!nodes.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) {
          setActive(visible.target.id.replace(/^ch-/, ""));
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.15, 0.35, 0.55] },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  const player = useMemo(
    () => READINESS_ROWS.find((r) => r.id === selectedPlayer) ?? READINESS_ROWS[0]!,
    [selectedPlayer],
  );
  const playerAvg = Math.round(
    (player.safety + player.balance + player.connectivity + player.digital + player.aiOps) / 5,
  );

  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="relative flex-1 mobile-safe-bottom overflow-x-clip">
        {/* ═══════════════ HOOK ═══════════════ */}
        <section
          aria-label="10-second overview"
          className="border-b border-cyan/30 bg-gradient-to-b from-cyan/10 via-background/80 to-background"
        >
          <div className="max-w-[1100px] mx-auto px-3 sm:px-4 md:px-8 pt-5 sm:pt-8 pb-6 sm:pb-8 space-y-4 sm:space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 text-cyan">
                <Plane className="w-3.5 h-3.5" aria-hidden />
                Research · deep dive
              </span>
              <span className="text-border">·</span>
              <span>Global commercial</span>
              <span className="text-border">·</span>
              <span>COVID → now</span>
              <span className="text-border">·</span>
              <span className="inline-flex items-center gap-1 text-cyan">
                <Timer className="w-3 h-3" aria-hidden />
                10 sec → full under 10 min
              </span>
            </div>

            <h1 className="font-display font-semibold text-[1.45rem] sm:text-2xl md:text-[2rem] lg:text-[2.25rem] leading-[1.15] text-foreground max-w-4xl">
              {HOOK_HEADLINE}
            </h1>
            <p className="text-[13px] sm:text-[14px] text-muted-foreground max-w-2xl leading-relaxed">
              {HOOK_SUB}
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
              {HOOK_KPIS.map((k) => (
                <div
                  key={k.label}
                  className="rounded-xl border border-border/90 bg-card/70 px-2.5 py-2.5 sm:px-3 sm:py-3 min-h-[88px] flex flex-col justify-between"
                  style={{ borderTopColor: toneColor[k.tone], borderTopWidth: 2 }}
                >
                  <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground leading-tight">
                    {k.label}
                  </span>
                  <span
                    className="text-[1.35rem] sm:text-[1.55rem] font-display font-semibold tabular-nums leading-none"
                    style={{ color: toneColor[k.tone] }}
                  >
                    {k.value}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-muted-foreground leading-snug">
                    {k.sub}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="rounded-xl border border-amber-signal/40 bg-amber-signal/10 px-3 py-2.5">
                <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-amber-signal mb-1">
                  Delivery trust
                </p>
                <p className="text-[12.5px] text-foreground/95 leading-snug font-medium">
                  Aircraft on the ramp beat order-book theatre. OEM credibility is strategy.
                </p>
              </div>
              <div className="rounded-xl border border-cyan/40 bg-cyan/10 px-3 py-2.5">
                <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-cyan mb-1">
                  Bandwidth war
                </p>
                <p className="text-[12.5px] text-foreground/95 leading-snug font-medium">
                  Starlink-class satcom is a product race — announcement ≠ install base.
                </p>
              </div>
              <div className="rounded-xl border border-emerald-signal/40 bg-emerald-signal/10 px-3 py-2.5">
                <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-emerald-signal mb-1">
                  AI without KPIs
                </p>
                <p className="text-[12.5px] text-foreground/95 leading-snug font-medium">
                  Score AOG hours and rostering stability — not “AI airline” press releases.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-amber-signal/40 bg-amber-signal/10 px-3 py-2.5 sm:px-4 sm:py-3 flex gap-2.5 items-start">
              <AlertTriangle
                className="w-4 h-4 text-amber-signal shrink-0 mt-0.5"
                aria-hidden
              />
              <p className="text-[12.5px] sm:text-[13.5px] text-foreground/95 leading-snug font-medium">
                Not investment advice. Multi-criteria readiness is a research frame — not a stock
                tip. Safety public ratings carry method bias; always state limits.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <a
                href="#chapters"
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-full bg-cyan/15 border border-cyan/45 text-cyan text-[13px] font-display font-semibold hover:bg-cyan/25 touch-manipulation"
              >
                Start 7 chapters
                <ChevronDown className="w-4 h-4" aria-hidden />
              </a>
              <a
                href="/reports/aviation-race-digital-ai-thesis-brief.pdf"
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-full border border-border text-[13px] text-muted-foreground hover:text-cyan touch-manipulation"
              >
                Short PDF brief
              </a>
              <p className="text-[11px] font-mono text-muted-foreground">
                First screen is the thesis. Scroll for proof and the interactive index.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px]">
              <Link
                to="/research/library"
                className="inline-flex items-center gap-1 text-cyan hover:underline min-h-[36px]"
              >
                <FlaskConical className="w-3.5 h-3.5" /> Library
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-cyan min-h-[36px]"
              >
                <Home className="w-3.5 h-3.5" /> Home
              </Link>
              <Link
                to="/research-migration"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-cyan min-h-[36px]"
              >
                Irregular migration brief (scale vs X) <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </section>

        {/* Sticky chapter rail */}
        <div
          id="chapters"
          className="sticky top-[52px] z-20 border-b border-border/80 bg-background/95 backdrop-blur-md"
        >
          <div className="max-w-[1100px] mx-auto px-2 sm:px-4 overflow-x-auto custom-scroll">
            <nav aria-label="Chapters under 10 minutes" className="flex gap-1 py-2 min-w-max">
              {CHAPTERS.map((c) => {
                const on = active === c.id;
                return (
                  <a
                    key={c.id}
                    href={`#ch-${c.id}`}
                    className={`chip-touch inline-flex items-center gap-1.5 px-2.5 py-2 rounded-full text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.1em] border touch-manipulation min-h-[40px] sm:min-h-[36px] transition-colors ${
                      on
                        ? "bg-cyan/15 text-cyan border-cyan/45"
                        : "border-border text-muted-foreground hover:border-cyan/30"
                    }`}
                  >
                    <span className="tabular-nums opacity-70">{c.n}</span>
                    <span className="normal-case tracking-normal font-display font-semibold text-[12px]">
                      {c.title}
                    </span>
                  </a>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="max-w-[1100px] mx-auto px-3 sm:px-4 md:px-8 py-6 sm:py-8 space-y-8 sm:space-y-10 pb-16">
          <div className="rounded-xl border border-border bg-card/40 px-3 py-3 sm:px-4 text-[12px] text-muted-foreground leading-relaxed space-y-1.5">
            <p className="font-mono uppercase tracking-[0.14em] text-[10px] text-cyan">
              How to read this · three rails
            </p>
            <p>{METHOD_RAILS}</p>
          </div>

          {/* CH 01 Shock */}
          <Chapter id="shock" meta={CHAPTERS[0]!}>
            <p className="text-[14px] sm:text-[15px] text-foreground/90 leading-relaxed mb-4">
              COVID was a demand shock that rewrote who had cash, aircraft, and labor. Traffic
              came back unevenly — <strong className="text-cyan">recovery ≠ resilience</strong>.
              Winners kept capacity discipline; losers confused RPK bounce with a permanent moat.
            </p>
            <div className="space-y-1.5">
              {TRAFFIC_RECOVERY.map((row) => (
                <div key={row.year} className="flex items-center gap-2 sm:gap-3 min-h-[36px]">
                  <span className="w-14 text-[11px] font-mono tabular-nums text-muted-foreground shrink-0">
                    {row.year}
                  </span>
                  <div className="flex-1 h-2.5 rounded-full bg-border/70 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-signal/80 via-amber-signal to-cyan"
                      style={{ width: `${row.score}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-[11px] font-mono tabular-nums text-foreground/90 shrink-0">
                    {row.score}
                  </span>
                </div>
              ))}
            </div>
            <ul className="mt-3 space-y-1.5 text-[12.5px] text-muted-foreground">
              {TRAFFIC_RECOVERY.map((row) => (
                <li key={`n-${row.year}`} className="flex gap-2">
                  <span className="text-cyan font-mono tabular-nums shrink-0 w-14">{row.year}</span>
                  <span>
                    <span className="text-foreground/90 font-medium">{row.label}</span> — {row.note}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] font-mono text-muted-foreground leading-relaxed">
              Directional recovery index (research frame), not a single IATA table. Always re-check
              latest industry series.
            </p>
          </Chapter>

          {/* CH 02 OEM */}
          <Chapter id="oem" meta={CHAPTERS[1]!}>
            <p className="text-[14px] sm:text-[15px] text-foreground/90 leading-relaxed mb-4">
              Western commercial fleets still run on a{" "}
              <strong className="text-amber-signal">dual oligopoly</strong>. Delivery credibility
              and certification politics are strategy — not PR. COMAC is a horizon wildcard, not a
              5-year Western fleet swap.
            </p>
            <div className="space-y-2.5">
              {OEM_COMPARE.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setSelectedPlayer(o.id === "comac" ? "airbus" : o.id)}
                  className="w-full text-left rounded-xl border border-border/90 bg-card/50 p-3 sm:p-3.5 space-y-2 touch-manipulation hover:border-cyan/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[14px] font-display font-semibold text-foreground">
                      {o.name}
                    </span>
                    <span
                      className="text-[1.25rem] font-display font-semibold tabular-nums"
                      style={{ color: toneColor[o.tone] }}
                    >
                      {o.score}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-border/70 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${o.score}%`,
                        background: toneColor[o.tone],
                        boxShadow: `0 0 12px ${toneColor[o.tone]}55`,
                      }}
                    />
                  </div>
                  <p className="text-[12.5px] text-foreground/90 leading-snug">
                    <span className="text-muted-foreground font-mono text-[10px] uppercase">
                      Edge ·{" "}
                    </span>
                    {o.edge}
                  </p>
                  <p className="text-[12px] text-muted-foreground leading-snug">
                    <span className="font-mono text-[10px] uppercase">Risk · </span>
                    {o.risk}
                  </p>
                </button>
              ))}
            </div>
            <p className="mt-3 text-[11px] font-mono text-muted-foreground">
              Scores are multi-criteria research frames for comparison UI — not credit ratings or
              target prices.
            </p>
          </Chapter>

          {/* CH 03 Networks */}
          <Chapter id="networks" meta={CHAPTERS[2]!}>
            <p className="text-[14px] sm:text-[15px] text-foreground/90 leading-relaxed mb-4">
              Networks decide who captures long-haul transfer value and who fights for short-haul
              yield. Tap pressure signals — not vibes.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
              {NETWORK_CARDS.map((n) => (
                <article
                  key={n.id}
                  className="rounded-xl border border-border/90 bg-card/50 p-3 sm:p-3.5 space-y-1.5 min-h-[120px]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[13px] font-display font-semibold text-foreground">
                      {n.name}
                    </h3>
                    <PressurePill pressure={n.pressure} />
                  </div>
                  <p className="text-[11px] font-mono text-cyan/90">{n.short}</p>
                  <p className="text-[12.5px] text-muted-foreground leading-snug">{n.body}</p>
                </article>
              ))}
            </div>
          </Chapter>

          {/* CH 04 Innovation */}
          <Chapter id="innovation" meta={CHAPTERS[3]!}>
            <p className="text-[14px] sm:text-[15px] text-foreground/90 leading-relaxed mb-4">
              The post-COVID product race is four lanes. Treat vendor and carrier pages as{" "}
              <strong className="text-cyan">announcements</strong> until install base and passenger
              yield show up.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
              {INNOVATION_LANES.map((lane) => (
                <div
                  key={lane.id}
                  className="rounded-xl border border-border/90 bg-card/50 p-3 sm:p-3.5 space-y-2"
                  style={{ borderTopColor: toneColor[lane.tone], borderTopWidth: 2 }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[14px] font-display font-semibold text-foreground">
                      {lane.title}
                    </h3>
                    <span
                      className="text-[10px] font-mono uppercase tracking-[0.12em] px-2 py-0.5 rounded-full border"
                      style={{
                        color: toneColor[lane.tone],
                        borderColor: `${toneColor[lane.tone]}55`,
                        background: `color-mix(in oklab, ${toneColor[lane.tone]} 12%, transparent)`,
                      }}
                    >
                      {lane.status}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-foreground/90 leading-snug">{lane.body}</p>
                  <p className="text-[11px] font-mono text-muted-foreground leading-snug">
                    Watch · {lane.watch}
                  </p>
                </div>
              ))}
            </div>
          </Chapter>

          {/* CH 05 Interactive readiness index */}
          <Chapter id="index" meta={CHAPTERS[4]!}>
            <p className="text-[14px] sm:text-[15px] text-foreground/90 leading-relaxed mb-3">
              Multi-criteria readiness — <strong>not</strong> a stock rating. Select a player to
              inspect dimension bars. Illustrative profiles for UI comparison.
            </p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {READINESS_ROWS.map((r) => {
                const on = selectedPlayer === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedPlayer(r.id)}
                    className={`chip-touch inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[12px] font-display font-semibold border touch-manipulation min-h-[40px] sm:min-h-[36px] ${
                      on
                        ? "bg-cyan/15 text-cyan border-cyan/45"
                        : "border-border text-muted-foreground hover:border-cyan/30"
                    }`}
                  >
                    {r.name}
                    <span className="text-[10px] font-mono opacity-70">{r.type}</span>
                  </button>
                );
              })}
            </div>
            <div className="rounded-2xl border border-cyan/30 bg-card/60 p-3 sm:p-4 space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-cyan">
                    Selected profile
                  </p>
                  <h3 className="text-[1.15rem] font-display font-semibold text-foreground">
                    {player.name}
                  </h3>
                  <p className="text-[12px] text-muted-foreground mt-0.5 max-w-xl">{player.note}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">Composite</p>
                  <p className="text-[2rem] font-display font-semibold text-cyan tabular-nums leading-none">
                    {playerAvg}
                  </p>
                </div>
              </div>
              {(
                [
                  ["Safety", player.safety, "var(--emerald-signal)"],
                  ["Balance sheet / capacity", player.balance, "var(--cyan)"],
                  ["Connectivity", player.connectivity, "var(--cyan)"],
                  ["Digital product", player.digital, "var(--amber-signal)"],
                  ["AI ops", player.aiOps, "var(--rose-signal)"],
                ] as const
              ).map(([label, val, color]) => (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between gap-2 text-[11px] font-mono">
                    <span className="text-muted-foreground uppercase tracking-[0.1em]">{label}</span>
                    <span className="tabular-nums text-foreground/90">{val}</span>
                  </div>
                  <div className="h-2 rounded-full bg-border/70 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${val}%`,
                        background: color,
                        boxShadow: `0 0 10px ${color}55`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Chapter>

          {/* CH 06 Claims */}
          <Chapter id="claims" meta={CHAPTERS[5]!}>
            <p className="text-[14px] sm:text-[15px] text-foreground/90 leading-relaxed mb-4">
              Claims carry confidence and falsifiers — same discipline as other Elenchos research.
              Empty when thin; no invented fleet shares.
            </p>
            <div className="space-y-2.5">
              {CLAIMS.map((c) => (
                <article
                  key={c.id}
                  className="rounded-xl border border-border/90 bg-card/50 p-3 sm:p-3.5 space-y-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-cyan">
                      {c.domain}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-[0.1em] rounded-full border border-border px-2 py-0.5 text-muted-foreground">
                      {c.confidence}
                    </span>
                  </div>
                  <p className="text-[13px] sm:text-[14px] text-foreground/95 leading-snug">
                    {c.statement}
                  </p>
                  <p className="text-[12px] text-muted-foreground leading-snug">
                    <span className="text-amber-signal font-mono text-[10px] uppercase tracking-wider">
                      Falsifier ·{" "}
                    </span>
                    {c.falsifier}
                  </p>
                </article>
              ))}
            </div>
          </Chapter>

          {/* CH 07 Scenarios */}
          <Chapter id="scenarios" meta={CHAPTERS[6]!}>
            <p className="text-[14px] sm:text-[15px] text-foreground/90 leading-relaxed mb-4">
              None is destiny. Use scenarios to stress-test OEM continuity, cabin bandwidth, and AI
              ops labor politics.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
              {SCENARIOS.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl border border-border bg-secondary/25 p-3 space-y-1.5"
                >
                  <p className="text-[12px] font-mono uppercase tracking-[0.12em] text-cyan">
                    {s.name}
                  </p>
                  <p className="text-[12px] text-foreground/90 leading-snug">
                    <strong>Politics:</strong> {s.politics}
                  </p>
                  <p className="text-[12px] text-foreground/90 leading-snug">
                    <strong>Tech may accelerate:</strong> {s.tech}
                  </p>
                  <p className="text-[12px] text-muted-foreground leading-snug">
                    <strong>Unlikely fast:</strong> {s.unlikely}
                  </p>
                </div>
              ))}
            </div>
          </Chapter>

          {/* Share pack */}
          <section
            className="rounded-xl border border-cyan/40 bg-cyan/[0.07] p-3 sm:p-4 space-y-3"
            aria-labelledby="share-h"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2
                id="share-h"
                className="text-[11px] font-mono uppercase tracking-[0.18em] text-cyan inline-flex items-center gap-2"
              >
                <Share2 className="w-3.5 h-3.5" aria-hidden />
                Share pack · @elenchospulse
              </h2>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-[36px] px-3 py-2 rounded-full border border-cyan/45 bg-cyan/15 text-cyan text-[12px] font-mono touch-manipulation hover:bg-cyan/25"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(X_THREAD_DRAFT.join("\n\n"));
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 2000);
                  } catch {
                    setCopied(false);
                  }
                }}
              >
                <Copy className="w-3.5 h-3.5" aria-hidden />
                {copied ? "Copied" : "Copy 3-post thread"}
              </button>
            </div>
            <ol className="space-y-2">
              {X_THREAD_DRAFT.map((line, i) => (
                <li
                  key={i}
                  className="text-[12.5px] sm:text-[13px] text-foreground/90 leading-relaxed border border-border/70 rounded-lg bg-card/40 px-3 py-2"
                >
                  {line}
                </li>
              ))}
            </ol>
            <p className="text-[11px] text-muted-foreground">
              Pin:{" "}
              <a
                href="https://elenchos.live/research-aviation"
                className="text-cyan hover:underline break-all"
              >
                https://elenchos.live/research-aviation
              </a>
            </p>
          </section>

          {/* Timeline */}
          <section className="space-y-3" aria-labelledby="timeline-h">
            <h2
              id="timeline-h"
              className="text-[11px] font-mono uppercase tracking-[0.2em] text-cyan flex items-center gap-2"
            >
              <BookOpen className="w-3.5 h-3.5" aria-hidden />
              Timeline · 2019 → now
            </h2>
            <ol className="space-y-2 border-l border-cyan/30 pl-3 sm:pl-4">
              {TIMELINE.map((t) => (
                <li key={t.year} className="relative">
                  <span className="absolute -left-[1.05rem] sm:-left-[1.3rem] top-1.5 w-2 h-2 rounded-full bg-cyan" />
                  <p className="text-[11px] font-mono text-cyan tabular-nums">{t.year}</p>
                  <p className="text-[13px] font-display font-semibold text-foreground">{t.title}</p>
                  <p className="text-[12.5px] text-muted-foreground leading-snug">{t.body}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Sources */}
          <section className="rounded-xl border border-border bg-card/30 p-3 sm:p-4 space-y-2">
            <h2 className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              Primary sources (free)
            </h2>
            <ul className="space-y-1.5">
              {AVIATION_SOURCES.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12.5px] text-cyan hover:underline break-words"
                  >
                    {s.label}
                  </a>
                  {s.note && (
                    <span className="block text-[11px] text-muted-foreground">{s.note}</span>
                  )}
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-muted-foreground leading-relaxed pt-1 flex gap-1.5 items-start">
              <Sparkles className="w-3.5 h-3.5 text-cyan shrink-0 mt-0.5" aria-hidden />
              Pack slug for Research Collect:{" "}
              <code className="text-foreground/90">aviation-race-digital-ai</code>. Optional denser
              GDELT (M) and thin X (D) remain owner-gated.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function Chapter({
  id,
  meta,
  children,
}: {
  id: string;
  meta: (typeof CHAPTERS)[number];
  children: ReactNode;
}) {
  return (
    <section
      id={`ch-${id}`}
      className="scroll-mt-28 sm:scroll-mt-32 space-y-3"
      aria-labelledby={`h-${id}`}
    >
      <header className="flex flex-wrap items-end justify-between gap-2 border-b border-border/80 pb-2">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan">
            Chapter {meta.n} · {meta.seconds}
          </p>
          <h2 id={`h-${id}`} className="text-[1.2rem] sm:text-[1.35rem] font-display font-semibold">
            {meta.title}
          </h2>
        </div>
      </header>
      {children}
    </section>
  );
}

function PressurePill({
  pressure,
}: {
  pressure: "critical" | "high" | "elevated" | "stable";
}) {
  const map = {
    critical: "text-rose-signal border-rose-signal/40 bg-rose-signal/10",
    high: "text-amber-signal border-amber-signal/40 bg-amber-signal/10",
    elevated: "text-cyan border-cyan/40 bg-cyan/10",
    stable: "text-emerald-signal border-emerald-signal/40 bg-emerald-signal/10",
  } as const;
  return (
    <span
      className={`text-[9px] font-mono uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full border ${map[pressure]}`}
    >
      {pressure}
    </span>
  );
}
