import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Copy,
  FlaskConical,
  Home,
  MapPin,
  MessageSquareWarning,
  Share2,
  ShieldAlert,
  Timer,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import {
  ResearchBackBar,
  ResearchBreadcrumb,
} from "@/components/research/ResearchDeskNav";
import { ResearchNextSteps } from "@/components/research/ResearchNextSteps";
import { CorridorMap } from "@/components/migration/CorridorMap";
import {
  ACTORS,
  ADVOCACY_FUNDING_LANE,
  CHAPTERS,
  CORRIDORS,
  DISCOURSE_THEMES,
  EU_IBC_SERIES,
  EU_IBC_SERIES_SUM,
  FRONTLINE_STATES,
  HOOK_HEADLINE,
  HOOK_KPIS,
  LABELING_PATTERN,
  MIGRATION_SOURCES,
  ORIGINS_NOTE,
  POLICY_STANCE,
  REMEDIES,
  RETURNS_HONESTY,
  SCALE_DISCREPANCY_RAIL,
  SCENARIOS,
  SUBHEADLINES,
  TIMELINE,
  PUBLISHED_AT,
  UPDATED_AT,
  X_THREAD_DRAFT,
} from "@/lib/migration/data";
import { caseStudyTimestampLine } from "@/lib/case-study-meta";

/** Legacy URL → SEO path */
export const Route = createFileRoute("/research-migration")({
  beforeLoad: () => {
    throw redirect({
      to: "/research/casestudy/$slug",
      params: { slug: "irregular-migration" },
      replace: true,
    });
  },
});

const toneColor: Record<string, string> = {
  rose: "var(--rose-signal)",
  amber: "var(--amber-signal)",
  cyan: "var(--cyan)",
  emerald: "var(--emerald-signal)",
};

export function MigrationIntelligencePage() {
  const [active, setActive] = useState(CHAPTERS[0]!.id);
  const [copied, setCopied] = useState(false);

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

  const maxDet = Math.max(...EU_IBC_SERIES.map((r) => r.detections));

  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="relative flex-1 mobile-safe-bottom overflow-x-clip">
        <div className="max-w-[1100px] mx-auto px-3 sm:px-4 md:px-8 pt-4 sm:pt-5">
          <ResearchBreadcrumb
            trail={[
              { label: "Library", to: "/research/library" },
              { label: "Case studies", to: "/research/library" },
              { label: "Illegal migration crisis" },
            ]}
          />
          <ResearchBackBar to="/research/library" label="Back to Library" />
        </div>
        {/* ═══════════════ 10-SECOND HOOK ═══════════════ */}
        <section
          aria-label="10-second overview"
          className="border-b border-rose-signal/30 bg-gradient-to-b from-rose-signal/10 via-background/80 to-background"
        >
          <div className="max-w-[1100px] mx-auto px-3 sm:px-4 md:px-8 pt-3 sm:pt-5 pb-6 sm:pb-8 space-y-4 sm:space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 text-rose-signal">
                <ShieldAlert className="w-3.5 h-3.5" aria-hidden />
                Research · Illegal migration crisis
              </span>
              <span className="text-border">·</span>
              <span>EU + UK Channel</span>
              <span className="text-border">·</span>
              <span className="inline-flex items-center gap-1 text-cyan">
                <Timer className="w-3 h-3" aria-hidden />
                10 sec summary → full under 10 min
              </span>
              <span className="text-border">·</span>
              <time
                dateTime={UPDATED_AT}
                className="normal-case tracking-normal text-muted-foreground/90"
              >
                {caseStudyTimestampLine({
                  publishedAt: PUBLISHED_AT,
                  updatedAt: UPDATED_AT,
                })}
              </time>
            </div>

            <h1 className="font-display font-semibold text-[1.45rem] sm:text-2xl md:text-[2rem] lg:text-[2.25rem] leading-[1.15] text-foreground max-w-4xl">
              {HOOK_HEADLINE}
            </h1>

            {/* Numbers first */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
              {HOOK_KPIS.map((k, i) => (
                <div
                  key={k.label}
                  className={`rounded-xl border border-border/90 bg-card/70 px-2.5 py-2.5 sm:px-3 sm:py-3 min-h-[88px] flex flex-col justify-between ${
                    i === 0 ? "col-span-2 lg:col-span-1 ring-1 ring-emerald-signal/35" : ""
                  }`}
                  style={{ borderTopColor: toneColor[k.tone], borderTopWidth: 2 }}
                >
                  <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground leading-tight">
                    {k.label}
                  </span>
                  <span
                    className="text-[1.45rem] sm:text-[1.65rem] font-display font-semibold tabular-nums leading-none"
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

            {/* Insight boxes — main landing content */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {SUBHEADLINES.map((s) => (
                <a
                  key={s.id}
                  href={`#ch-${s.id === "x-rail" || s.id === "returns" || s.id === "speech" ? (s.id === "x-rail" ? "scale" : s.id === "returns" ? "corridors" : "discourse") : s.id}`}
                  className="rounded-xl border border-border/90 bg-card/60 hover:border-cyan/40 px-3 py-2.5 space-y-1 touch-manipulation transition-colors"
                >
                  <p className="text-[13px] font-display font-semibold text-foreground leading-snug">
                    {s.title}
                  </p>
                  <p className="text-[12px] text-muted-foreground leading-snug">{s.blurb}</p>
                </a>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <a
                href="#chapters"
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-full bg-cyan/15 border border-cyan/45 text-cyan text-[13px] font-display font-semibold hover:bg-cyan/25 touch-manipulation"
              >
                Open deep dive
                <ChevronDown className="w-4 h-4" aria-hidden />
              </a>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px]">
              <Link
                to="/research"
                className="inline-flex items-center gap-1 text-cyan hover:underline min-h-[36px]"
              >
                <FlaskConical className="w-3.5 h-3.5" /> Research Library
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-cyan min-h-[36px]"
              >
                <Home className="w-3.5 h-3.5" /> Home
              </Link>
              <Link
                to="/research/library"
                search={{
                  section: "topics",
                  topic: "eu-migration-green-divisions",
                }}
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-cyan min-h-[36px]"
              >
                Live X topic pulse <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </section>

        {/* Sticky 10-min chapter rail */}
        <div
          id="chapters"
          className="sticky top-[52px] z-20 border-b border-border/80 bg-background/95 backdrop-blur-md"
        >
          <div className="max-w-[1100px] mx-auto px-2 sm:px-4 overflow-x-auto custom-scroll">
            <nav
              aria-label="Chapters under 10 minutes"
              className="flex gap-1 py-2 min-w-max"
            >
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
          {/* Method strip */}
          <div className="rounded-xl border border-border bg-card/40 px-3 py-3 sm:px-4 text-[12px] text-muted-foreground leading-relaxed space-y-1.5">
            <p className="font-mono uppercase tracking-[0.14em] text-[10px] text-cyan">
              How to read this · three rails
            </p>
            <p>
              <strong className="text-foreground/90">A · Stats</strong> (Frontex / national) ·{" "}
              <strong className="text-foreground/90">B · Power</strong> (deals, courts, media,
              NGOs) · <strong className="text-foreground/90">C · Citizens / X</strong> (scale
              slogans vs peak-year charts; linked live topic). Detections are{" "}
              <em>events</em>, not unique people. Peak year ≠ cumulative. Not a US border product.
            </p>
          </div>

          {/* CH 01 Scale */}
          <Chapter id="scale" meta={CHAPTERS[0]!}>
            <p className="text-[14px] sm:text-[15px] text-foreground/90 leading-relaxed mb-4">
              From the Syrian war era (2011+) Europe faced multi-year irregular pressure. The{" "}
              <strong className="text-rose-signal">2015 peak year (~1.8M detections)</strong> is
              a single calendar year of Frontex-linked illegal border-crossing{" "}
              <em>events</em> — not unique people, and not the multi-year total. The incomplete
              yearly series on this page already sums to about{" "}
              <strong className="text-amber-signal">
                {(EU_IBC_SERIES_SUM / 1_000_000).toFixed(1)}M detection events
              </strong>
              . That is why citizen discourse on X often rejects soft “only 1.8–2M” slogans.{" "}
              <strong className="text-cyan">2024–2025 drops prove enforcement matters</strong> —
              they do not erase years of elite failure or distrust.
            </p>

            <div className="rounded-xl border border-cyan/35 bg-cyan/[0.07] p-3 sm:p-4 mb-4 space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-cyan">
                X / citizen scale rail · counters soft slogans
              </p>
              <p className="text-[13px] text-foreground/90 leading-relaxed">
                <strong className="text-foreground">{SCALE_DISCREPANCY_RAIL.title}</strong>
              </p>
              <p className="text-[12.5px] text-muted-foreground leading-relaxed">
                <span className="text-foreground/85 font-medium">Official chart: </span>
                {SCALE_DISCREPANCY_RAIL.officialClaim}
              </p>
              <p className="text-[12.5px] text-muted-foreground leading-relaxed">
                <span className="text-foreground/85 font-medium">Citizen / X frame: </span>
                {SCALE_DISCREPANCY_RAIL.citizenClaim}
              </p>
              <ul className="space-y-1.5 pt-1">
                {SCALE_DISCREPANCY_RAIL.whyBothCanBeTrue.map((line) => (
                  <li
                    key={line}
                    className="text-[12.5px] text-foreground/85 leading-snug flex gap-2"
                  >
                    <span className="text-cyan shrink-0">·</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[12px] text-muted-foreground leading-relaxed pt-1 border-t border-border/50">
                <span className="text-cyan font-medium">When X is selected: </span>
                {SCALE_DISCREPANCY_RAIL.xUse}
              </p>
            </div>

            <div className="space-y-1.5">
              {EU_IBC_SERIES.map((row) => {
                const pct = Math.max(4, Math.round((row.detections / maxDet) * 100));
                return (
                  <div key={row.year} className="flex items-center gap-2 sm:gap-3 min-h-[32px]">
                    <span className="w-10 text-[11px] font-mono tabular-nums text-muted-foreground shrink-0">
                      {row.year}
                    </span>
                    <div className="flex-1 h-2.5 rounded-full bg-border/70 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-signal/80 to-cyan"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-[4.5rem] text-right text-[11px] font-mono tabular-nums text-foreground/90 shrink-0">
                      {(row.detections / 1000).toFixed(0)}k
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] font-mono text-muted-foreground">
              Chart = detections per year. Sum of listed years ≈{" "}
              {(EU_IBC_SERIES_SUM / 1_000_000).toFixed(1)}M events (several years omitted from
              this simplified series).
            </p>
            <p className="mt-3 text-[11px] font-mono text-muted-foreground leading-relaxed">
              Sources: Frontex public releases (2023–2025 figures) and historical public series.
              See footnotes. Always re-check the latest FRAN/JORA file.
            </p>
          </Chapter>

          {/* CH 02 Corridors + frontline states */}
          <Chapter id="corridors" meta={CHAPTERS[1]!}>
            <p className="text-[14px] sm:text-[15px] text-foreground/90 leading-relaxed mb-4">
              Pressure is not abstract — it hits <strong>specific entry systems</strong> and{" "}
              <strong>first-line states</strong>. Smugglers re-route when one door closes.
              Secondary movement inside Schengen is part of the same system.
            </p>
            <h3 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-2">
              Frontline / high-pressure governments
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-4">
              {FRONTLINE_STATES.map((s) => (
                <div
                  key={s.code}
                  className="rounded-lg border border-border/90 bg-card/50 px-2.5 py-2 min-h-[72px]"
                >
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-[13px] font-display font-semibold text-cyan">{s.code}</span>
                    <RiskPill risk={s.pressure} />
                  </div>
                  <p className="text-[11px] font-medium text-foreground/90">{s.name}</p>
                  <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{s.role}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {CORRIDORS.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-border/90 bg-card/50 p-3 sm:p-3.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-display font-semibold text-foreground">
                      <MapPin className="w-3.5 h-3.5 text-cyan shrink-0" aria-hidden />
                      {c.name}
                    </span>
                    <RiskPill risk={c.risk} />
                  </div>
                  <p className="text-[11px] font-mono text-cyan/90">{c.short}</p>
                  <p className="text-[12.5px] text-muted-foreground leading-snug">{c.role}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[12px] text-muted-foreground leading-relaxed">{ORIGINS_NOTE}</p>

            <h3 className="text-[11px] font-mono uppercase tracking-[0.14em] text-cyan mt-5 mb-2">
              Interactive corridors · sea & land → destinations
            </h3>
            <p className="text-[12.5px] text-muted-foreground leading-snug mb-3">
              Tap an entry node used by smuggling networks. Compare entry pressure signals with what
              is publicly known about returns — including the Morocco return slogan gap.
            </p>
            <CorridorMap />

            <div className="mt-4 rounded-xl border border-amber-signal/40 bg-amber-signal/10 p-3 sm:p-3.5 space-y-2">
              <p className="text-[12px] font-mono uppercase tracking-[0.12em] text-amber-signal">
                {RETURNS_HONESTY.title}
              </p>
              <p className="text-[13px] text-foreground/90 leading-snug">{RETURNS_HONESTY.body}</p>
              <p className="text-[12px] text-muted-foreground leading-snug">
                <strong className="text-foreground/90">Demand:</strong> {RETURNS_HONESTY.ask}
              </p>
              <p className="text-[12px] text-muted-foreground leading-snug">
                {RETURNS_HONESTY.moroccoNote}
              </p>
            </div>
          </Chapter>

          {/* CH 03 Open vs resist */}
          <Chapter id="stance" meta={CHAPTERS[2]!}>
            <p className="text-[14px] sm:text-[15px] text-foreground/90 leading-relaxed mb-4">
              Governments did not all do the same thing. Some eras <strong>magnetised</strong>{" "}
              intake; others <strong>pushed back</strong> with fences, external processing, or
              naval rules — and were often hit with moral labels first. This is a policy map, not a
              purity scorecard.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-2.5">
              {POLICY_STANCE.map((col) => (
                <div
                  key={col.stance}
                  className={`rounded-xl border p-3 space-y-2 ${
                    col.stance === "resist"
                      ? "border-emerald-signal/40 bg-emerald-signal/5"
                      : col.stance === "open"
                        ? "border-rose-signal/40 bg-rose-signal/5"
                        : "border-amber-signal/40 bg-amber-signal/5"
                  }`}
                >
                  <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-foreground/90 font-semibold">
                    {col.title}
                  </p>
                  <ul className="space-y-2">
                    {col.examples.map((ex) => (
                      <li key={ex.place} className="text-[12px] leading-snug">
                        <span className="font-medium text-cyan">{ex.place}</span>
                        <span className="text-muted-foreground"> — {ex.note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] font-mono text-muted-foreground">
              Falsifier: if a “resist” government delivered sustained high removals + low
              absconding without rights theater, mark results — not slogans — as success.
            </p>
          </Chapter>

          {/* CH 04 Damage */}
          <Chapter id="damage" meta={CHAPTERS[3]!}>
            <p className="text-[14px] sm:text-[15px] text-foreground/90 leading-relaxed mb-3">
              For ordinary people this is not “diversity charts.” It is whether the state still
              controls the border, removes failed claimants, and protects speech about crime and
              cohesion.
            </p>
            <ul className="space-y-2 text-[13px] sm:text-[14px] text-foreground/90 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-rose-signal shrink-0">›</span>
                <span>
                  <strong>Security:</strong> mass irregular entry raises screening load; terror and
                  serious-crime cases must be court-sourced when named — volume itself is a
                  capacity attack on the system.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-signal shrink-0">›</span>
                <span>
                  <strong>Social gravity:</strong> housing, wages, schools, and trust degrade first
                  where inflows concentrate — citizens reported this for years before elites
                  admitted it.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-cyan shrink-0">›</span>
                <span>
                  <strong>Death risk on routes:</strong> Mediterranean fatalities are real (IOM
                  Missing Migrants) — used by open-border advocates and by enforcement advocates
                  differently; both need the same numbers.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-rose-signal shrink-0">›</span>
                <span>
                  <strong>Elite failure:</strong> politicians campaign control, deliver process;
                  media softens illegal entry; NGOs/litigation can save lives and still shape route
                  incentives; courts block removals without replacement capacity.
                </span>
              </li>
            </ul>
          </Chapter>

          {/* CH 05 Discourse, labels, funding */}
          <Chapter id="discourse" meta={CHAPTERS[4]!}>
            <div className="rounded-xl border border-rose-signal/35 bg-rose-signal/10 p-3 sm:p-4 mb-4">
              <p className="text-[14px] sm:text-[15px] font-display font-semibold text-foreground leading-snug">
                {LABELING_PATTERN.claim}
              </p>
            </div>
            <h3 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-2">
              Public discourse themes (citizen language)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 mb-4">
              {DISCOURSE_THEMES.map((d) => (
                <div
                  key={d.theme}
                  className="rounded-lg border border-border bg-card/40 px-3 py-2"
                >
                  <p className="text-[13px] font-medium text-cyan">{d.theme}</p>
                  <p className="text-[12px] text-muted-foreground leading-snug">{d.note}</p>
                </div>
              ))}
            </div>
            <h3 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-2">
              Label pattern · examples
            </h3>
            <ul className="space-y-1.5 mb-3 text-[13px] text-foreground/90">
              {LABELING_PATTERN.examples.map((ex) => (
                <li key={ex} className="flex gap-2">
                  <span className="text-amber-signal shrink-0">›</span>
                  <span className="leading-snug">{ex}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] font-mono text-muted-foreground mb-4 leading-relaxed">
              Falsifier: {LABELING_PATTERN.falsifier}
            </p>
            <div className="rounded-xl border border-border bg-secondary/20 p-3 sm:p-3.5 space-y-2">
              <p className="text-[12px] font-mono uppercase tracking-[0.12em] text-cyan">
                {ADVOCACY_FUNDING_LANE.title}
              </p>
              <p className="text-[13px] text-foreground/90 leading-snug">{ADVOCACY_FUNDING_LANE.body}</p>
              <ul className="space-y-1">
                {ADVOCACY_FUNDING_LANE.method.map((m) => (
                  <li key={m} className="text-[12px] text-muted-foreground leading-snug flex gap-2">
                    <span className="text-cyan shrink-0">›</span>
                    {m}
                  </li>
                ))}
              </ul>
              <p className="text-[11px] font-mono text-muted-foreground">
                Falsifier: {ADVOCACY_FUNDING_LANE.falsifier}
              </p>
            </div>
            <div className="flex gap-2 items-start rounded-lg border border-border bg-card/40 px-3 py-2.5 mt-3">
              <MessageSquareWarning className="w-4 h-4 text-cyan shrink-0 mt-0.5" aria-hidden />
              <p className="text-[12.5px] text-muted-foreground leading-snug">
                <strong className="text-foreground/90">X / free speech (short):</strong> after
                platform ownership change, enforcement and crime footage that legacy channels often
                buried re-entered mass feeds. Full receipts pass next — structure first, not
                personality cult. Live pulse:{" "}
                <Link
                  to="/research/library"
                  search={{
                    section: "topics",
                    topic: "eu-migration-green-divisions",
                  }}
                  className="text-cyan hover:underline"
                >
                  EU migration topic
                </Link>
                .
              </p>
            </div>
          </Chapter>

          {/* CH 06 Actors */}
          <Chapter id="actors" meta={CHAPTERS[5]!}>
            <p className="text-[14px] sm:text-[15px] text-foreground/90 leading-relaxed mb-4">
              Flows have authors: origin collapse, transit leverage, destination magnets, and
              European legal magnets. Cards are starting briefs — each open question is a research
              task.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
              {ACTORS.map((a) => (
                <article
                  key={a.id}
                  className="rounded-xl border border-border/90 bg-card/45 p-3 space-y-1.5"
                >
                  <h3 className="text-[14px] font-display font-semibold text-cyan">{a.name}</h3>
                  <p className="text-[12.5px] text-foreground/90 leading-snug">
                    <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider">
                      Role ·{" "}
                    </span>
                    {a.role}
                  </p>
                  <p className="text-[12.5px] text-foreground/90 leading-snug">
                    <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider">
                      Incentive ·{" "}
                    </span>
                    {a.incentive}
                  </p>
                  <p className="text-[12px] text-muted-foreground leading-snug">
                    <span className="font-mono text-[10px] uppercase tracking-wider">Open · </span>
                    {a.openQuestion}
                  </p>
                </article>
              ))}
            </div>
          </Chapter>

          {/* CH 07 Reverse */}
          <Chapter id="reverse" meta={CHAPTERS[6]!}>
            <p className="text-[14px] sm:text-[15px] text-foreground/90 leading-relaxed mb-4">
              If hard reverse never comes, expect corridor adaptation, continued trust collapse,
              and more speech policing — not “integration success.” If hard reverse comes, expect
              legal war and diplomatic cost — and a chance to restore the state’s first job.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5">
              {SCENARIOS.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl border border-border bg-secondary/25 p-3 space-y-1.5"
                >
                  <p className="text-[12px] font-mono uppercase tracking-[0.12em] text-cyan">
                    {s.name}
                  </p>
                  <p className="text-[12px] text-foreground/90 leading-snug">
                    <strong>Border:</strong> {s.border}
                  </p>
                  <p className="text-[12px] text-foreground/90 leading-snug">
                    <strong>Security:</strong> {s.security}
                  </p>
                  <p className="text-[12px] text-muted-foreground leading-snug">
                    <strong>Speech:</strong> {s.speech}
                  </p>
                </div>
              ))}
            </div>
            <h3 className="text-[12px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-2">
              What citizens have asked for · feasibility
            </h3>
            <div className="space-y-2">
              {REMEDIES.map((r) => (
                <div
                  key={r.ask}
                  className="rounded-lg border border-border/80 bg-card/40 px-3 py-2.5 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3"
                >
                  <p className="flex-1 text-[13px] text-foreground/95 font-medium leading-snug">
                    {r.ask}
                  </p>
                  <p className="sm:w-40 shrink-0 text-[11px] font-mono text-amber-signal">
                    {r.feasibility}
                  </p>
                  <p className="sm:w-56 shrink-0 text-[11px] text-muted-foreground leading-snug">
                    {r.note}
                  </p>
                </div>
              ))}
            </div>
          </Chapter>

          {/* Share for @elenchospulse */}
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
                href="https://elenchos.live/research-migration"
                className="text-cyan hover:underline break-all"
              >
                https://elenchos.live/research-migration
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
              Timeline · 2011 → now
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
              {MIGRATION_SOURCES.map((s) => (
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
            <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
              Next: jurisdiction speech-case table · deeper origin series · X citizen sample
              (authorized) · optional full free-speech/platform receipts module. Human-reviewed
              claim list expands without inventing numbers.
            </p>
          </section>

          <ResearchNextSteps contextHint="Illegal migration crisis · EU & UK Channel" />
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
  children: React.ReactNode;
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
          <h2
            id={`h-${id}`}
            className="text-[1.15rem] sm:text-[1.35rem] font-display font-semibold text-foreground"
          >
            {meta.title}
          </h2>
          <p className="text-[12px] text-muted-foreground">{meta.blurb}</p>
        </div>
      </header>
      <div>{children}</div>
    </section>
  );
}

function RiskPill({ risk }: { risk: "critical" | "high" | "elevated" }) {
  const color =
    risk === "critical"
      ? "var(--rose-signal)"
      : risk === "high"
        ? "var(--amber-signal)"
        : "var(--cyan)";
  return (
    <span
      className="text-[9px] font-mono uppercase tracking-[0.12em] px-1.5 py-0.5 rounded border shrink-0"
      style={{ color, borderColor: `${color}55`, background: `${color}18` }}
    >
      {risk}
    </span>
  );
}
