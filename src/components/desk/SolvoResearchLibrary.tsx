import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  FileText,
  FlaskConical,
  Layers,
  Minus,
  Plane,
  Trophy,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { divergenceColor, sentimentColorCoarse, sentimentTone } from "@/lib/score-colors";
import { SOLVO_TOPICS } from "@/lib/desk/solvo-topics";
import { SOLVO_ARAB_LEADERS, SOLVO_BUSINESS_LEADERS } from "@/lib/desk/solvo-sim";
import { protoPath, usePrototypeBase } from "@/lib/desk/prototype-base";
import type { RankedLeader } from "@/lib/trackers-data";

type Section = "topics" | "cases" | "trackers";
type TrackerId = "arab" | "business";

export function SolvoResearchLibrary() {
  const base = usePrototypeBase();
  const [section, setSection] = useState<Section>("topics");
  const [tracker, setTracker] = useState<TrackerId>("arab");
  return (
    <main className="max-w-[1400px] mx-auto w-full min-w-0 px-2.5 sm:px-4 md:px-6 py-5 sm:py-8 mobile-safe-bottom relative flex-1 space-y-5">
      <aside className="rounded-2xl border border-amber-signal/45 bg-amber-signal/[0.12] px-4 py-3 flex items-start gap-2">
        <FlaskConical className="w-4 h-4 text-amber-signal shrink-0 mt-0.5" />
        <p className="text-[13px] text-foreground/90 leading-snug">
          {base === "/publiceye-uae"
            ? "Simulated / estimated sample for BrandEye UAE — not live X. Same Research Library layout as elenchos.live."
            : "Simulated / estimated sample for Solvo Creations UAE — not live X. Same Research Library layout as elenchos.live."}
        </p>
      </aside>
      <header className="page-hero-banner overflow-hidden min-w-0 relative rounded-2xl">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_15%_0%,color-mix(in_oklab,var(--cyan)_22%,transparent),transparent_50%),radial-gradient(ellipse_at_85%_30%,color-mix(in_oklab,var(--amber-signal)_12%,transparent),transparent_45%)]" />
        <div className="relative p-4 sm:p-5 md:p-7 space-y-4">
          <div className="page-hero-kicker">
            <BookOpen className="w-3.5 h-3.5" />
            {base === "/publiceye-uae" ? "Research · BrandEye UAE" : "Research · Solvo Creations UAE"}
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:justify-between">
            <div className="min-w-0 flex-1 space-y-2">
              <h1 className="page-hero-title text-[1.4rem] sm:text-2xl md:text-[2rem]">Research Library</h1>
              <p className="page-hero-sub text-[13px] sm:text-[14.5px]">
                Tap Topics, Cases, or Trackers — then open any card in one click.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full lg:w-auto lg:min-w-[320px]">
              <StatTile value="10" label="Topics" sub="UAE monitors" tone="cyan" active={section === "topics"} onSelect={() => setSection("topics")} />
              <StatTile value="1" label="Cases" sub="aviation" tone="emerald" active={section === "cases"} onSelect={() => setSection("cases")} />
              <StatTile value="2" label="Trackers" sub="indexes" tone="amber" active={section === "trackers"} onSelect={() => setSection("trackers")} />
            </div>
          </div>
        </div>
      </header>
      <div role="tablist" aria-label="Research collections" className="flex flex-wrap items-center gap-1.5 px-0.5">
        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground mr-1">Show</span>
        {(
          [
            { id: "topics" as const, label: "Topics", tone: "cyan" },
            { id: "cases" as const, label: "Case studies", tone: "emerald" },
            { id: "trackers" as const, label: "Trackers", tone: "amber" },
          ] as const
        ).map((t) => {
          const on = section === t.id;
          const activeCls =
            t.tone === "emerald"
              ? "bg-emerald-signal/15 text-emerald-signal border-emerald-signal/45"
              : t.tone === "amber"
                ? "bg-amber-signal/15 text-amber-signal border-amber-signal/45"
                : "bg-cyan/15 text-cyan border-cyan/45";
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setSection(t.id)}
              className={`inline-flex items-center min-h-[40px] px-3 rounded-full text-[12.5px] font-medium border touch-manipulation ${
                on ? activeCls : "border-border/80 text-muted-foreground"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {section === "topics" && (
        <section className="lib-panel lib-panel-cyan rounded-2xl border p-4 sm:p-5 md:p-6 space-y-4">
          <SectionHead
            icon={<Layers className="w-4 h-4" />}
            title="Topic analyses"
            sub="Citizen discourse vs official/media frames. Open any card for the full briefing."
            tone="cyan"
            metric="10 active"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {SOLVO_TOPICS.map((t, i) => (
              <TopicCard key={t.id} topic={t} delay={i * 0.03} />
            ))}
          </div>
        </section>
      )}

      {section === "cases" && (
        <section className="lib-panel lib-panel-emerald rounded-2xl border p-4 sm:p-5 md:p-6 space-y-4">
          <SectionHead
            icon={<FileText className="w-4 h-4" />}
            title="Case studies"
            sub="Regional deep dive — aviation, relevant to Gulf hubs."
            tone="emerald"
            metric="1 listed"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link
              to={protoPath(base, "casestudy/aviation") as never}
              className="lib-case-card group relative flex flex-col h-full min-h-[148px] rounded-2xl border bg-gradient-to-br from-emerald-signal/15 to-transparent border-emerald-signal/30 hover:border-emerald-signal/55 bg-card/80 p-4 overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="shrink-0 w-10 h-10 rounded-xl border border-border/70 bg-background/50 text-cyan grid place-items-center">
                  <Plane className="w-4 h-4" />
                </span>
                <span className="text-[9px] font-mono uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-full border border-border/70 text-muted-foreground">
                  Gulf · estimated
                </span>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground">Published · aviation</p>
              <h3 className="text-[14px] sm:text-[15px] font-display font-semibold group-hover:text-cyan leading-snug mt-0.5">
                Aviation after disruption — OEM race, satcom, AI readiness
              </h3>
              <p className="text-[12.5px] text-muted-foreground leading-snug mt-1.5 line-clamp-2 flex-1">
                After COVID: delivery trust, cabin bandwidth, and who can run AI ops — relevant to UAE/Gulf hubs.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-cyan">
                Open briefing <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </section>
      )}

      {section === "trackers" && (
        <section className="lib-panel lib-panel-amber rounded-2xl border p-4 sm:p-5 md:p-6 space-y-4">
          <SectionHead
            icon={<Trophy className="w-4 h-4" />}
            title="Trackers & indexes"
            sub="Simulated rankings on this page — tap a card, then read the board."
            tone="amber"
            metric="2 surfaces"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TrackerCard
              active={tracker === "arab"}
              title="Arab leadership"
              body="Regional heads of state — simulated citizen trust vs official volume."
              icon={Users}
              metric="Top 5"
              onSelect={() => setTracker("arab")}
            />
            <TrackerCard
              active={tracker === "business"}
              title="Key business leaders"
              body="Operators and capital — Alabbar, Ghandour, Jafar, Sajwani, Al Mubarak."
              icon={Briefcase}
              metric="Top 5"
              onSelect={() => setTracker("business")}
            />
          </div>
          {tracker === "arab" ? (
            <TrackerBoard title="Arab leadership" kicker="Regional board" leaders={SOLVO_ARAB_LEADERS} />
          ) : (
            <TrackerBoard title="Key business leaders" kicker="Operators & capital" leaders={SOLVO_BUSINESS_LEADERS} />
          )}
        </section>
      )}
    </main>
  );
}

function StatTile({
  value,
  label,
  sub,
  tone,
  active,
  onSelect,
}: {
  value: string;
  label: string;
  sub: string;
  tone: "cyan" | "emerald" | "amber";
  active: boolean;
  onSelect: () => void;
}) {
  const toneCls =
    tone === "emerald"
      ? active
        ? "border-emerald-signal/55 text-emerald-signal bg-emerald-signal/10 ring-1 ring-emerald-signal/25"
        : "border-emerald-signal/35 text-emerald-signal"
      : tone === "amber"
        ? active
          ? "border-amber-signal/55 text-amber-signal bg-amber-signal/10 ring-1 ring-amber-signal/25"
          : "border-amber-signal/35 text-amber-signal"
        : active
          ? "border-cyan/55 text-cyan bg-cyan/10 ring-1 ring-cyan/25"
          : "border-cyan/35 text-cyan";
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`rounded-xl border bg-background/50 px-2.5 py-2.5 text-center w-full min-h-[44px] ${toneCls}`}
    >
      <p className="text-xl sm:text-2xl font-display font-semibold tabular-nums leading-none">{value}</p>
      <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mt-1.5">{label}</p>
      <p className="text-[10px] text-muted-foreground/80 mt-0.5">{sub}</p>
    </button>
  );
}

function SectionHead({
  icon,
  title,
  sub,
  tone,
  metric,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  tone: "cyan" | "emerald" | "amber";
  metric: string;
}) {
  const chip =
    tone === "emerald"
      ? "text-emerald-signal border-emerald-signal/35 bg-emerald-signal/10"
      : tone === "amber"
        ? "text-amber-signal border-amber-signal/35 bg-amber-signal/10"
        : "text-cyan border-cyan/35 bg-cyan/10";
  return (
    <div className="flex flex-wrap items-start justify-between gap-2 min-w-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-cyan">{icon}</span>
          <h2 className="text-[15px] sm:text-base font-display font-semibold">{title}</h2>
        </div>
        <p className="text-[12.5px] text-muted-foreground max-w-2xl leading-snug pl-6">{sub}</p>
      </div>
      <span className={`text-[10px] font-mono uppercase tracking-[0.12em] px-2 py-1 rounded-full border ${chip}`}>
        {metric}
      </span>
    </div>
  );
}

function TopicCard({
  topic,
  delay,
}: {
  topic: (typeof SOLVO_TOPICS)[number];
  delay: number;
}) {
  const base = usePrototypeBase();
  const sentColor = sentimentColorCoarse(topic.score);
  const divColor = divergenceColor(topic.divergence);
  const WowIcon = topic.delta > 0 ? TrendingUp : topic.delta < 0 ? TrendingDown : Minus;
  const wowColor =
    topic.delta > 0 ? "var(--emerald-signal)" : topic.delta < 0 ? "var(--rose-signal)" : "var(--muted-foreground)";
  const tone = sentimentTone(topic.score, topic.label);
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.25 }} className="h-full">
      <Link
        to={protoPath(base, `research/${topic.id}`) as never}
        className="group lib-case-card relative flex flex-col h-full min-h-0 rounded-xl border border-cyan/25 bg-card/70 hover:border-cyan/55 p-3 overflow-hidden"
      >
        <div className="flex items-start gap-2 min-w-0">
          <span className="shrink-0 w-8 h-8 rounded-lg border border-cyan/35 bg-cyan/10 text-cyan grid place-items-center">
            <Layers className="w-3.5 h-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1 mb-1">
              <span className="text-[9px] font-mono uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-md border border-border/60 text-muted-foreground">
                {topic.group} · {topic.audience}
              </span>
            </div>
            <h3 className="text-[13px] sm:text-[13.5px] font-display font-semibold leading-snug group-hover:text-cyan">
              {topic.name}
            </h3>
          </div>
        </div>
        <div className="mt-2.5 flex items-end justify-between gap-2 border-t border-border/40 pt-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-center min-w-[2.5rem]">
              <p className="text-[8px] font-mono uppercase tracking-[0.1em] text-muted-foreground">Sent</p>
              <p className="text-[1.05rem] font-display font-semibold tabular-nums leading-none mt-0.5" style={{ color: sentColor }} title={tone.band}>
                {topic.score}
              </p>
            </div>
            <div className="text-center min-w-[2.5rem] border-l border-border/50 pl-3">
              <p className="text-[8px] font-mono uppercase tracking-[0.1em] text-muted-foreground">Div</p>
              <p className="text-[1.05rem] font-display font-semibold tabular-nums leading-none mt-0.5" style={{ color: divColor }}>
                {topic.divergence}
              </p>
            </div>
            <div className="flex items-center gap-1 min-h-[1.1rem]" title="Week-over-week sentiment">
              <WowIcon className="w-3.5 h-3.5 shrink-0" style={{ color: wowColor }} strokeWidth={2.5} />
              {topic.delta !== 0 && (
                <span className="text-[10px] font-mono font-semibold tabular-nums" style={{ color: wowColor }}>
                  {topic.delta > 0 ? "+" : ""}
                  {topic.delta}
                </span>
              )}
            </div>
          </div>
          <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-cyan shrink-0">
            Open
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function TrackerCard({
  active,
  title,
  body,
  icon: Icon,
  metric,
  onSelect,
}: {
  active: boolean;
  title: string;
  body: string;
  icon: React.ComponentType<{ className?: string }>;
  metric: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`lib-tracker-card group relative flex flex-col h-full min-h-[168px] rounded-2xl border bg-card/70 p-4 text-left ${
        active ? "border-amber-signal/55 ring-1 ring-amber-signal/25" : "border-amber-signal/30 hover:border-amber-signal/55"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="w-11 h-11 rounded-xl border grid place-items-center text-amber-signal border-amber-signal/40 bg-amber-signal/10">
          <Icon className="w-5 h-5" />
        </span>
        <span className="text-[9px] font-mono uppercase tracking-[0.12em] text-muted-foreground border border-border/70 rounded-full px-1.5 py-0.5">
          Index
        </span>
      </div>
      <h3 className="text-[14px] font-display font-semibold">{title}</h3>
      <p className="text-[12px] text-muted-foreground leading-snug mt-1 flex-1">{body}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono text-muted-foreground">{metric} · simulated</span>
        <span className="text-[12px] font-semibold text-cyan inline-flex items-center gap-1">
          {active ? "Showing" : "Open"} <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </button>
  );
}

function TrackerBoard({
  title,
  kicker,
  leaders,
}: {
  title: string;
  kicker: string;
  leaders: RankedLeader[];
}) {
  return (
    <div className="rounded-2xl border border-border/70 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-amber-signal" />
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-cyan">{kicker}</p>
          <h3 className="font-display font-semibold">{title}</h3>
        </div>
        <span className="ml-auto text-[10px] font-mono uppercase text-amber-signal">Simulated</span>
      </div>
      <ul className="space-y-1.5">
        {leaders.map((l) => (
          <li
            key={l.name}
            className="rounded-xl border border-border/60 bg-background/50 px-3 py-2.5 flex items-center gap-2.5 min-h-[52px]"
          >
            <span className="text-xl">{l.flag}</span>
            <span className="flex-1 min-w-0">
              <span className="block text-[13.5px] font-medium truncate">{l.name}</span>
              <span className="block text-[10px] font-mono text-muted-foreground truncate">
                {[l.role, l.country].filter(Boolean).join(" · ")}
              </span>
            </span>
            <span className="font-display font-bold tabular-nums text-cyan">{l.overall_score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
