import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  ChevronDown,
  FlaskConical,
  Home,
  MapPin,
  MessageSquareWarning,
  ShieldAlert,
  Timer,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import {
  ACTORS,
  CHAPTERS,
  CORRIDORS,
  EU_IBC_SERIES,
  HOOK_HEADLINE,
  HOOK_KPIS,
  HOOK_SUB,
  MIGRATION_SOURCES,
  ORIGINS_NOTE,
  REMEDIES,
  SCENARIOS,
  TIMELINE,
} from "@/lib/migration/data";

export const Route = createFileRoute("/research-migration")({
  head: () => ({
    meta: [
      {
        title: "Irregular Migration Intelligence · EU & UK Channel · Elenchos",
      },
      {
        name: "description",
        content:
          "Scale since 2011, corridors, elite failure, free-speech double standards, and reverse options. Free open data first. For ordinary people — under 10 minutes.",
      },
      {
        property: "og:title",
        content: "Irregular Migration Intelligence · Elenchos",
      },
      {
        property: "og:description",
        content:
          "Illegal entry at scale, institutional failure, and what happens if hard reverse never comes. EU + UK Channel.",
      },
      { property: "og:url", content: "https://elenchos.live/research-migration" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/research-migration" }],
  }),
  component: MigrationIntelligencePage,
});

const toneColor: Record<string, string> = {
  rose: "var(--rose-signal)",
  amber: "var(--amber-signal)",
  cyan: "var(--cyan)",
  emerald: "var(--emerald-signal)",
};

function MigrationIntelligencePage() {
  const [active, setActive] = useState(CHAPTERS[0]!.id);

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
        {/* ═══════════════ 10-SECOND HOOK ═══════════════ */}
        <section
          aria-label="10-second overview"
          className="border-b border-rose-signal/30 bg-gradient-to-b from-rose-signal/10 via-background/80 to-background"
        >
          <div className="max-w-[1100px] mx-auto px-3 sm:px-4 md:px-8 pt-5 sm:pt-8 pb-6 sm:pb-8 space-y-4 sm:space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 text-rose-signal">
                <ShieldAlert className="w-3.5 h-3.5" aria-hidden />
                Research · national security brief
              </span>
              <span className="text-border">·</span>
              <span>EU + UK Channel</span>
              <span className="text-border">·</span>
              <span>Since 2011</span>
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

            <div className="rounded-xl border border-amber-signal/40 bg-amber-signal/10 px-3 py-2.5 sm:px-4 sm:py-3 flex gap-2.5 items-start">
              <AlertTriangle
                className="w-4 h-4 text-amber-signal shrink-0 mt-0.5"
                aria-hidden
              />
              <p className="text-[12.5px] sm:text-[13.5px] text-foreground/95 leading-snug font-medium">
                Illegal entry was treated as manageable politics. Dissent was often treated as the
                problem. That inversion is the legitimacy crisis — not a single chart.
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
              <p className="text-[11px] font-mono text-muted-foreground">
                Designed so the first screen is the thesis. Scroll only if you want proof.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px]">
              <Link
                to="/research"
                className="inline-flex items-center gap-1 text-cyan hover:underline min-h-[36px]"
              >
                <FlaskConical className="w-3.5 h-3.5" /> Research
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-cyan min-h-[36px]"
              >
                <Home className="w-3.5 h-3.5" /> Home
              </Link>
              <Link
                to="/topics/$topicId"
                params={{ topicId: "eu-migration-green-divisions" }}
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
              NGOs) · <strong className="text-foreground/90">C · Citizens</strong> (X pulse —
              linked topic; full sample phase next). Detections are{" "}
              <em>events</em>, not unique people. Not a US border product.
            </p>
          </div>

          {/* CH 01 Scale */}
          <Chapter id="scale" meta={CHAPTERS[0]!}>
            <p className="text-[14px] sm:text-[15px] text-foreground/90 leading-relaxed mb-4">
              From the Syrian war era (2011+) Europe faced multi-year irregular pressure that
              peaked in <strong className="text-rose-signal">2015 (~1.8M detections)</strong>,
              fell, then re-accelerated into the 2020s.{" "}
              <strong className="text-cyan">2024–2025 drops prove policy and enforcement
              matter</strong> — they do not erase years of elite failure or citizen distrust.
            </p>
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
            <p className="mt-3 text-[11px] font-mono text-muted-foreground leading-relaxed">
              Sources: Frontex public releases (2023–2025 figures) and historical public series.
              See footnotes. Always re-check the latest FRAN/JORA file.
            </p>
          </Chapter>

          {/* CH 02 Corridors */}
          <Chapter id="corridors" meta={CHAPTERS[1]!}>
            <p className="text-[14px] sm:text-[15px] text-foreground/90 leading-relaxed mb-4">
              Pressure is not abstract — it hits <strong>specific entry systems</strong>.
              Smugglers re-route when one door closes. Secondary movement inside Schengen is part
              of the same system.
            </p>
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
          </Chapter>

          {/* CH 03 Damage */}
          <Chapter id="damage" meta={CHAPTERS[2]!}>
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
            </ul>
          </Chapter>

          {/* CH 04 Elites */}
          <Chapter id="elites" meta={CHAPTERS[3]!}>
            <p className="text-[14px] sm:text-[15px] text-foreground/90 leading-relaxed mb-4">
              Damage is not only “migrants.” It is <strong>incentives of people with power</strong>{" "}
              who treated enforcement as optional and dissent as the scandal.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                {
                  t: "Politicians",
                  d: "Campaign on control; deliver process. Non-removal becomes permanent residency by default.",
                },
                {
                  t: "Media",
                  d: "Language softens illegal entry; hardens labels on critics. Scale of crime and cost often buried.",
                },
                {
                  t: "NGOs",
                  d: "Rescue and legal aid can be legitimate — and can also entrench route incentives. Funding trails matter.",
                },
                {
                  t: "Lawyers & courts",
                  d: "Rights doctrines that block removals at scale without replacement capacity = open invitation.",
                },
              ].map((x) => (
                <div
                  key={x.t}
                  className="rounded-xl border border-border bg-secondary/20 px-3 py-2.5"
                >
                  <p className="text-[12px] font-mono uppercase tracking-[0.12em] text-cyan mb-1">
                    {x.t}
                  </p>
                  <p className="text-[13px] text-foreground/90 leading-snug">{x.d}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[12px] text-muted-foreground">
              Ideological capture (far-left open-border doctrine; Islamist political influence)
              belongs in evidence-gated sub-panels — not slogans. Thin evidence → say so.
            </p>
          </Chapter>

          {/* CH 05 Speech */}
          <Chapter id="speech" meta={CHAPTERS[4]!}>
            <div className="rounded-xl border border-rose-signal/35 bg-rose-signal/10 p-3 sm:p-4 mb-4">
              <p className="text-[14px] sm:text-[15px] font-display font-semibold text-foreground leading-snug">
                Illegal crossing was de-moralised. Peaceful speech against the policy was often
                re-moralised as “hate.” That is reverse civilisation.
              </p>
            </div>
            <p className="text-[13px] sm:text-[14px] text-foreground/90 leading-relaxed mb-3">
              Across EU states, unauthorised entry is a criminal or administrative offence by
              statute — yet political practice frequently treats it as a paperwork issue. At the
              same time, speech laws and institutional pressure chill debate on crime, culture, and
              borders. Document cases by jurisdiction (next data pass); the pattern is already
              visible to citizens.
            </p>
            <div className="flex gap-2 items-start rounded-lg border border-border bg-card/40 px-3 py-2.5">
              <MessageSquareWarning className="w-4 h-4 text-cyan shrink-0 mt-0.5" aria-hidden />
              <p className="text-[12.5px] text-muted-foreground leading-snug">
                <strong className="text-foreground/90">Platform free speech (short):</strong> X
                after ownership change reopened room for enforcement and crime video that legacy
                channels often buried. Receipts module expands in the next pass — thesis here is
                structural, not personality cult.
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
              (authorised) · optional full free-speech/platform receipts module. Human-reviewed
              claim list expands without inventing numbers.
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
