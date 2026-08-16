import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Brain,
  ExternalLink,
  FlaskConical,
  Info,
  Link2,
  MessageSquareShare,
  Radio,
  Shield,
  Trophy,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import {
  ResearchBreadcrumb,
  ResearchDeskNav,
} from "@/components/research/ResearchDeskNav";
import { LedgerBranchNav } from "@/components/networks-ledger/LedgerBranchNav";
import {
  TERROR_FINANCE_DATA,
  TERROR_FINANCE_META,
  TERROR_FINANCE_METRICS,
  TERROR_FINANCE_OBSERVATIONS,
  TERROR_FINANCE_SOURCES,
  formatMonthLabel,
  formatUsdApprox,
  sortedSlices,
  type OfficialSource,
} from "@/lib/networks-ledger";

export const Route = createFileRoute("/research/networks-ledger")({
  head: () => ({
    meta: [
      {
        title: "Terror & Finance Networks · Networks Ledger · Elenchos",
      },
      {
        name: "description",
        content:
          "Terror & Finance Networks: aggregate patterns in official designations, freezes, arrests and charges. No individual or organisational names — verify on official public lists.",
      },
      {
        property: "og:title",
        content: "Terror & Finance Networks · Networks Ledger · Elenchos",
      },
      {
        property: "og:description",
        content:
          "Privacy-first tracker of official terror-finance actions. Aggregates only; names live on official source lists.",
      },
      {
        property: "og:url",
        content: "https://elenchos.live/research/networks-ledger",
      },
    ],
    links: [
      { rel: "canonical", href: "https://elenchos.live/research/networks-ledger" },
    ],
  }),
  component: TerrorFinancePage,
});

const CHART_COLORS = [
  "var(--cyan)",
  "var(--amber-signal)",
  "var(--emerald-signal)",
  "var(--magenta)",
  "var(--rose-signal)",
  "#94a3b8",
];

function TerrorFinancePage() {
  const m = TERROR_FINANCE_METRICS;
  const period = TERROR_FINANCE_DATA.period;
  const byType = sortedSlices(TERROR_FINANCE_DATA.byActionType);
  const byCategory = sortedSlices(TERROR_FINANCE_DATA.byNetworkCategory);
  const byRegion = sortedSlices(TERROR_FINANCE_DATA.byRegion);
  const series = TERROR_FINANCE_DATA.series.map((p) => ({
    ...p,
    label: formatMonthLabel(p.date),
  }));

  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1400px] mx-auto w-full min-w-0 px-2.5 sm:px-4 md:px-6 py-5 sm:py-8 mobile-safe-bottom md:pb-14 relative flex-1 overflow-x-clip">
        <ResearchBreadcrumb current="Library · Terror & Finance" />
        <ResearchDeskNav />
        <LedgerBranchNav />

        {/* Hero */}
        <header className="page-hero-banner mb-5 sm:mb-6 overflow-hidden relative min-w-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan/10 via-transparent to-amber-signal/8 pointer-events-none" />
          <div className="relative p-4 sm:p-5 md:p-6 space-y-2.5 min-w-0">
            <div className="page-hero-kicker">
              <Shield className="w-3.5 h-3.5" aria-hidden />
              Networks Ledger · Terror & Finance
            </div>
            <h1 className="page-hero-title text-[1.4rem] sm:text-2xl md:text-[1.85rem] break-words">
              Terror & Finance Networks
            </h1>
            <p className="text-[13px] sm:text-[14px] font-medium text-foreground/90 max-w-3xl leading-snug">
              Tracking official designations, freezes, arrests and charges related to terror-finance
              activity
            </p>
            <p className="text-[13px] sm:text-[14px] text-muted-foreground max-w-3xl leading-relaxed">
              {TERROR_FINANCE_META.framing}
            </p>
            <p className="text-[11px] font-mono text-cyan/90">
              {TERROR_FINANCE_META.version} · last reviewed {TERROR_FINANCE_META.lastReviewed}
            </p>
          </div>
        </header>

        {/* Privacy strip */}
        <aside
          role="note"
          className="mb-5 rounded-xl border border-cyan/30 bg-cyan/[0.06] px-3.5 py-3 text-[12px] sm:text-[12.5px] leading-relaxed text-foreground/90"
        >
          <p className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-cyan shrink-0 mt-0.5" aria-hidden />
            <span>
              <strong className="font-semibold text-foreground">Privacy — </strong>
              {TERROR_FINANCE_META.privacyCore}
            </span>
          </p>
        </aside>

        {/* Status / overview */}
        <section
          className="mb-7 sm:mb-8 rounded-2xl border border-cyan/30 bg-gradient-to-br from-card/80 via-card/50 to-cyan/[0.04] overflow-hidden"
          aria-labelledby="tf-overview"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 border-b border-border/70 bg-secondary/30">
            <div className="flex items-center gap-2 min-w-0">
              <Brain className="w-4 h-4 text-cyan shrink-0" aria-hidden />
              <h2
                id="tf-overview"
                className="text-[14px] sm:text-[15px] font-display font-semibold"
              >
                Overview · {period.label}
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.14em] px-2 py-1 rounded-full border border-emerald-signal/45 text-emerald-signal bg-emerald-signal/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-signal animate-pulse" />
              Aggregates only
            </span>
          </div>
          <div className="p-4 sm:p-5 space-y-4">
            <p className="text-[13px] text-foreground/90 leading-relaxed max-w-3xl">
              High-level summary of official activity in the curated corpus.{" "}
              <strong className="font-semibold text-foreground">
                Names of individuals and organisations are not published on this site.
              </strong>{" "}
              Use the official public lists below to look up exact identifiers.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <OverviewStat
                label="Actions (latest window)"
                value={String(m.actionsLatestPeriod)}
              />
              <OverviewStat
                label="Designations + joint"
                value={String(m.designationsAndJoint)}
              />
              <OverviewStat label="Arrests / charges" value={String(m.arrestsCharges)} />
              <OverviewStat label="Corpus total" value={String(m.totalActions)} />
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:items-center pt-1">
              <a
                href="#official-sources"
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl border border-cyan/45 bg-cyan/10 text-cyan text-[13px] font-medium hover:bg-cyan/15 transition-colors"
              >
                <Link2 className="w-4 h-4" />
                Official public lists
              </a>
              <span className="text-[11px] text-muted-foreground sm:ml-1">
                Names live only on those sources — not here.
              </span>
            </div>
          </div>
        </section>

        {/* Related tools */}
        <section className="mb-7 sm:mb-8" aria-labelledby="intel-tools">
          <h2
            id="intel-tools"
            className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground mb-3 px-0.5"
          >
            Related tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            <ToolCard
              href="/research/networks-ledger/speech-reach"
              title="Speech Reach"
              body="How already-public speech is distributed — or limited — in X’s For You feed."
              icon={<MessageSquareShare className="w-5 h-5" />}
              badge="Sibling"
              tone="violet"
            />
            <ToolCard
              href="/trackers/leaders"
              title="Leadership board"
              body="Citizen trust rankings for world leaders vs official narratives."
              icon={<Users className="w-5 h-5" />}
              badge="Live"
              tone="amber"
            />
            <ToolCard
              href="/trackers/peace"
              title="Peace index"
              body="Normalization & peace diagnostics — support, momentum, official gap."
              icon={<Trophy className="w-5 h-5" />}
              badge="Live"
              tone="cyan"
            />
          </div>
        </section>

        {/* Metrics */}
        <section className="mb-7 sm:mb-8" aria-labelledby="tf-metrics">
          <div className="flex flex-wrap items-center gap-2 mb-3 px-0.5">
            <Activity className="w-4 h-4 text-cyan" aria-hidden />
            <h2 id="tf-metrics" className="text-[13px] font-display font-semibold">
              Aggregate metrics
            </h2>
            <span className="text-[10px] font-mono uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full border border-amber-signal/40 text-amber-signal bg-amber-signal/10">
              No party names
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
            <MetricCard
              label="New designations (corpus)"
              value={String(m.designations)}
              hint="Official designation actions in the curated set"
              delay={0}
            />
            <MetricCard
              label="Freezes / asset actions"
              value={String(m.assetFreezes)}
              hint="Asset freeze or blocking instruments counted"
              delay={0.04}
            />
            <MetricCard
              label="Arrests / charges"
              value={String(m.arrestsCharges)}
              hint="Official arrest or charge reports — allegations until adjudicated"
              delay={0.08}
            />
            <MetricCard
              label="Stated $ (directional)"
              value={formatUsdApprox(m.quantifiedFundsUsdApprox)}
              hint={m.quantifiedFundsNote}
              delay={0.12}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-3.5">
            <div className="lg:col-span-3 rounded-xl border border-border/90 bg-card/50 p-3.5 sm:p-4 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h3 className="text-[12.5px] font-display font-semibold">
                  Official actions over time
                </h3>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Count of curated actions by month
                </span>
              </div>
              <div className="h-[240px] sm:h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tfActFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" opacity={0.6} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                      axisLine={{ stroke: "var(--border)" }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                      width={28}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="actions"
                      name="Actions"
                      stroke="var(--cyan)"
                      strokeWidth={2.2}
                      fill="url(#tfActFill)"
                      dot={{ r: 3, fill: "var(--cyan)" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-xl border border-border/90 bg-card/50 p-3.5 sm:p-4 min-w-0">
              <h3 className="text-[12.5px] font-display font-semibold mb-1">By action type</h3>
              <p className="text-[11px] text-muted-foreground mb-3 leading-snug">
                System-level classification — not a party list.
              </p>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={byType}
                    layout="vertical"
                    margin={{ top: 0, right: 12, left: 4, bottom: 0 }}
                  >
                    <CartesianGrid
                      stroke="var(--border)"
                      strokeDasharray="3 3"
                      horizontal={false}
                      opacity={0.5}
                    />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={120}
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16}>
                      {byType.map((_, i) => (
                        <Cell key={byType[i]!.id} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5 mt-3.5">
            <CategoryPanel
              title="Financing-network categories"
              subtitle="High-level tags only — never a list of designated parties"
              slices={byCategory}
            />
            <CategoryPanel
              title="Geographic focus"
              subtitle="Where official instruments in this corpus were issued or focused"
              slices={byRegion}
            />
          </div>

          <p className="mt-3 text-[11px] text-muted-foreground px-0.5 leading-snug">
            Since Jan 2025: <span className="text-cyan font-mono">{m.actionsSince2025}</span> curated
            actions · {period.corpusLabel} · joint packages counted separately from pure
            designations where applicable.
          </p>
        </section>

        {/* Observations */}
        <section className="mb-7 sm:mb-8" aria-labelledby="tf-obs">
          <div className="flex items-center gap-2 mb-3 px-0.5">
            <Radio className="w-4 h-4 text-cyan" aria-hidden />
            <h2 id="tf-obs" className="text-[13px] font-display font-semibold">
              Observations
            </h2>
            <span className="text-[11px] text-muted-foreground">Trends without naming parties</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
            {TERROR_FINANCE_OBSERVATIONS.map((o, i) => (
              <motion.article
                key={o.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="rounded-xl border border-border/90 bg-card/50 p-3.5 sm:p-4"
              >
                <p className="text-[13px] text-foreground/90 leading-relaxed">{o.text}</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-2.5">
                  Updated {o.updatedAt}
                </p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Official sources — permanent */}
        <section
          id="official-sources"
          className="mb-7 sm:mb-8 scroll-mt-28"
          aria-labelledby="tf-sources"
        >
          <div className="flex items-center gap-2 mb-3 px-0.5">
            <Link2 className="w-4 h-4 text-cyan" aria-hidden />
            <h2 id="tf-sources" className="text-[13px] font-display font-semibold">
              Official public source lists
            </h2>
          </div>
          <p className="text-[12.5px] text-muted-foreground mb-3 px-0.5 max-w-3xl leading-relaxed">
            Exact names of designated, frozen, arrested, or charged parties appear only on these
            authoritative public sources. elenchos.live is not the original publisher of those
            identifiers.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {TERROR_FINANCE_SOURCES.map((s) => (
              <SourceCard key={s.id} source={s} />
            ))}
          </div>
        </section>

        {/* Methodology */}
        <section
          className="mb-7 sm:mb-8 rounded-xl border border-border/90 bg-card/40 p-4 sm:p-5 space-y-4"
          aria-labelledby="tf-method"
        >
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-cyan" aria-hidden />
            <h2 id="tf-method" className="text-[13px] font-display font-semibold">
              Methodology & privacy
            </h2>
          </div>
          <p className="text-[12.5px] text-foreground/90 leading-relaxed border-l-2 border-cyan/40 pl-3">
            {TERROR_FINANCE_META.privacyCore}
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h3 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-2">
                How we measure
              </h3>
              <ul className="space-y-2">
                {TERROR_FINANCE_META.methodology.map((line) => (
                  <li
                    key={line}
                    className="text-[12.5px] text-muted-foreground leading-relaxed flex gap-2"
                  >
                    <Info className="w-3.5 h-3.5 text-cyan/80 shrink-0 mt-0.5" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-2">
                Limitations
              </h3>
              <ul className="space-y-2">
                {TERROR_FINANCE_META.limitations.map((line) => (
                  <li
                    key={line}
                    className="text-[12.5px] text-muted-foreground leading-relaxed flex gap-2"
                  >
                    <span className="text-amber-signal/90 shrink-0">·</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            {TERROR_FINANCE_META.scope}
          </p>
        </section>

        <div className="flex flex-wrap gap-3 text-[12.5px]">
          <Link
            to="/research/networks-ledger/speech-reach"
            className="inline-flex items-center gap-1.5 text-cyan hover:underline min-h-[40px]"
          >
            <MessageSquareShare className="w-3.5 h-3.5" />
            Speech Reach
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/research/library"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-cyan min-h-[40px]"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Full library
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function OverviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/80 bg-background/40 p-3">
      <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1">
        {label}
      </p>
      <p className="text-xl font-display font-semibold text-cyan tabular-nums">{value}</p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  delay,
}: {
  label: string;
  value: string;
  hint: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="rounded-xl border border-cyan/25 bg-gradient-to-br from-secondary/40 via-card/30 to-cyan/[0.04] p-3 sm:p-3.5 min-w-0"
      title={hint}
    >
      <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1 leading-tight">
        {label}
      </p>
      <p className="text-xl sm:text-2xl font-display font-semibold text-cyan tabular-nums">
        {value}
      </p>
      <p className="text-[10.5px] text-muted-foreground mt-1.5 leading-snug line-clamp-3">{hint}</p>
    </motion.div>
  );
}

function CategoryPanel({
  title,
  subtitle,
  slices,
}: {
  title: string;
  subtitle: string;
  slices: { id: string; label: string; count: number }[];
}) {
  const max = Math.max(1, ...slices.map((s) => s.count));
  return (
    <div className="rounded-xl border border-border/90 bg-card/50 p-3.5 sm:p-4">
      <h3 className="text-[12.5px] font-display font-semibold mb-0.5">{title}</h3>
      <p className="text-[11px] text-muted-foreground mb-3 leading-snug">{subtitle}</p>
      <ul className="space-y-2.5">
        {slices.map((s, i) => (
          <li key={s.id}>
            <div className="flex items-center justify-between gap-2 text-[12px] mb-1">
              <span className="text-foreground/90 leading-snug">{s.label}</span>
              <span className="font-mono text-cyan tabular-nums shrink-0">{s.count}</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary/80 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(s.count / max) * 100}%`,
                  background: CHART_COLORS[i % CHART_COLORS.length],
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SourceCard({ source }: { source: OfficialSource }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-xl border border-border/90 bg-card/50 p-3.5 sm:p-4 hover:border-cyan/45 transition-colors min-h-[88px]"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-cyan/90">
          {source.kind === "official_list" ? "Official list" : "Official hub"}
        </span>
        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-cyan shrink-0" />
      </div>
      <span className="text-[13.5px] font-display font-semibold text-foreground group-hover:text-cyan leading-snug">
        {source.label}
      </span>
      <span className="text-[11.5px] text-muted-foreground mt-1">{source.agency}</span>
    </a>
  );
}

function ToolCard({
  href,
  title,
  body,
  icon,
  badge,
  tone,
}: {
  href: string;
  title: string;
  body: string;
  icon: React.ReactNode;
  badge: string;
  tone: "cyan" | "amber" | "violet" | "emerald";
}) {
  const toneCls =
    tone === "amber"
      ? "border-amber-signal/35 hover:border-amber-signal/55"
      : tone === "violet"
        ? "border-violet-400/35 hover:border-violet-400/55"
        : tone === "emerald"
          ? "border-emerald-signal/35 hover:border-emerald-signal/55"
          : "border-cyan/35 hover:border-cyan/55";
  const badgeCls =
    tone === "amber"
      ? "text-amber-signal bg-amber-signal/10 border-amber-signal/35"
      : tone === "violet"
        ? "text-violet-300 bg-violet-500/10 border-violet-400/35"
        : tone === "emerald"
          ? "text-emerald-signal bg-emerald-signal/10 border-emerald-signal/35"
          : "text-cyan bg-cyan/10 border-cyan/35";

  return (
    <Link
      to={href}
      className={`group flex flex-col h-full min-h-[132px] rounded-2xl border bg-card/50 p-3.5 sm:p-4 transition-colors touch-manipulation min-w-0 overflow-hidden ${toneCls}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="w-10 h-10 rounded-xl border border-border/80 bg-secondary/40 text-cyan grid place-items-center shrink-0">
          {icon}
        </span>
        <span
          className={`text-[9px] font-mono uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full border ${badgeCls}`}
        >
          {badge}
        </span>
      </div>
      <h3 className="text-[14px] font-display font-semibold text-foreground group-hover:text-cyan transition-colors">
        {title}
      </h3>
      <p className="text-[12px] text-muted-foreground leading-snug mt-1 flex-1">{body}</p>
      <span className="mt-2.5 inline-flex items-center gap-1 text-[11.5px] font-medium text-cyan">
        Open <ArrowRight className="w-3.5 h-3.5" />
      </span>
    </Link>
  );
}
