import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  ExternalLink,
  Eye,
  FlaskConical,
  GitBranch,
  Info,
  MessageSquareShare,
  Radio,
  Scale,
  Shield,
} from "lucide-react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  Cell,
} from "recharts";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import {
  ResearchBreadcrumb,
  ResearchDeskNav,
} from "@/components/research/ResearchDeskNav";
import { LedgerBranchNav } from "@/components/networks-ledger/LedgerBranchNav";
import {
  SPEECH_REACH_META,
  STATUS_LABELS,
  formatDateLabel,
  formatPct,
  primaryEntry,
  type SpeechReachEntry,
} from "@/lib/speech-reach";

export const Route = createFileRoute("/research/speech-reach")({
  head: () => ({
    meta: [
      {
        title: "Speech Reach · Networks Ledger · Library · Elenchos",
      },
      {
        name: "description",
        content:
          "Speech Reach tracks code-visible legal and platform rules that limit algorithmic distribution of already-public speech on X’s For You feed. Brazil 2026 Election Recommendation Filter — privacy-safe, system-level metrics only.",
      },
      {
        property: "og:title",
        content: "Speech Reach · Networks Ledger · Elenchos",
      },
      {
        property: "og:description",
        content:
          "How already-public speech travels — or is limited — in X’s For You feed. Brazil 2026 filter. No individual accounts or posts published here.",
      },
      {
        property: "og:url",
        content: "https://elenchos.live/research/speech-reach",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://elenchos.live/research/speech-reach",
      },
    ],
  }),
  component: SpeechReachPage,
});

const SPECTRUM_COLORS = [
  "var(--cyan)",
  "var(--emerald-signal)",
  "var(--amber-signal)",
  "var(--magenta)",
];

function SpeechReachPage() {
  const entry = primaryEntry();
  const m = entry.metrics;

  const chartData = m.series.map((p) => ({
    ...p,
    label: formatDateLabel(p.date).replace(/,?\s*2026/, ""),
  }));

  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1400px] mx-auto w-full min-w-0 px-2.5 sm:px-4 md:px-6 py-5 sm:py-8 mobile-safe-bottom md:pb-14 relative flex-1 overflow-x-clip">
        <ResearchBreadcrumb current="Library · Speech Reach" />
        <ResearchDeskNav />
        <LedgerBranchNav />

        {/* Hero */}
        <header className="page-hero-banner mb-5 sm:mb-6 overflow-hidden relative min-w-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/12 via-transparent to-cyan/10 pointer-events-none" />
          <div className="relative p-4 sm:p-5 md:p-6 space-y-2.5 min-w-0">
            <div className="page-hero-kicker">
              <MessageSquareShare className="w-3.5 h-3.5" aria-hidden />
              Networks Ledger · Speech Reach
            </div>
            <h1 className="page-hero-title text-[1.4rem] sm:text-2xl md:text-[1.85rem] break-words">
              Speech Reach
            </h1>
            <p className="text-[13px] sm:text-[14px] font-medium text-foreground/90 max-w-3xl leading-snug">
              Tracking how already-public speech is distributed — or limited — in X’s For You feed
            </p>
            <p className="text-[13px] sm:text-[14px] text-muted-foreground max-w-3xl leading-relaxed">
              {SPEECH_REACH_META.framing}
            </p>
            <p className="text-[11px] font-mono text-cyan/90">
              {SPEECH_REACH_META.version} · last reviewed {SPEECH_REACH_META.lastReviewed} ·{" "}
              {SPEECH_REACH_META.title}
            </p>
          </div>
        </header>

        {/* Privacy strip — always visible early */}
        <aside
          role="note"
          className="mb-5 rounded-xl border border-cyan/30 bg-cyan/[0.06] px-3.5 py-3 text-[12px] sm:text-[12.5px] leading-relaxed text-foreground/90"
        >
          <p className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-cyan shrink-0 mt-0.5" aria-hidden />
            <span>
              <strong className="font-semibold text-foreground">Privacy — </strong>
              {SPEECH_REACH_META.privacyCore}
            </span>
          </p>
        </aside>

        {/* Brazil status block */}
        <BrazilStatusBlock entry={entry} />

        {/* Metrics */}
        <section className="mb-7 sm:mb-8" aria-labelledby="sr-metrics">
          <div className="flex flex-wrap items-center gap-2 mb-3 px-0.5">
            <Activity className="w-4 h-4 text-cyan" aria-hidden />
            <h2 id="sr-metrics" className="text-[13px] font-display font-semibold">
              System metrics
            </h2>
            <span className="text-[10px] font-mono uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full border border-amber-signal/40 text-amber-signal bg-amber-signal/10">
              Directional · approximate
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
            <MetricCard
              label="Organic volume (constrained set)"
              value={formatPct(m.volumeChangePct, true)}
              hint={m.volumeChangeNote}
              delay={0}
            />
            <MetricCard
              label="Non-listed voice share"
              value={formatPct(m.nonListedSharePct)}
              hint={m.nonListedShareNote}
              delay={0.04}
            />
            <MetricCard
              label="Non-follower engagement"
              value={formatPct(m.nonFollowerEngagementPct)}
              hint={m.nonFollowerNote}
              delay={0.08}
            />
            <MetricCard
              label="Code-visible list scale"
              value={`~${entry.approximateScale}`}
              hint={entry.scaleLabel}
              delay={0.12}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-3.5">
            {/* Time series */}
            <div className="lg:col-span-3 rounded-xl border border-border/90 bg-card/50 p-3.5 sm:p-4 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h3 className="text-[12.5px] font-display font-semibold text-foreground">
                  Volume & conversation composition
                </h3>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Index 100 = baseline · activation ≈ Aug 2026
                </span>
              </div>
              <div className="h-[240px] sm:h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="srVolFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      stroke="var(--border)"
                      strokeDasharray="3 3"
                      opacity={0.6}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                      axisLine={{ stroke: "var(--border)" }}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="vol"
                      domain={[40, 120]}
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                      width={32}
                    />
                    <YAxis
                      yAxisId="share"
                      orientation="right"
                      domain={[30, 80]}
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                      width={32}
                      unit="%"
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        fontSize: 12,
                      }}
                      labelStyle={{ color: "var(--foreground)" }}
                    />
                    <ReferenceLine
                      yAxisId="vol"
                      x="Aug 10"
                      stroke="var(--amber-signal)"
                      strokeDasharray="4 4"
                      label={{
                        value: "Activation ≈",
                        position: "insideTopLeft",
                        fill: "var(--amber-signal)",
                        fontSize: 10,
                      }}
                    />
                    <Area
                      yAxisId="vol"
                      type="monotone"
                      dataKey="volumeIndex"
                      name="Volume index"
                      stroke="var(--cyan)"
                      strokeWidth={2.2}
                      fill="url(#srVolFill)"
                      dot={{ r: 3, fill: "var(--cyan)" }}
                    />
                    <Line
                      yAxisId="share"
                      type="monotone"
                      dataKey="nonListedSharePct"
                      name="Non-listed share %"
                      stroke="var(--violet-300, #a78bfa)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 leading-snug">
                Cyan: indexed organic volume from the constrained set. Violet: share of candidacy
                discussion carried by non-listed / secondary voices. {m.sampleWindow}.
              </p>
            </div>

            {/* Spectrum */}
            <div className="lg:col-span-2 rounded-xl border border-border/90 bg-card/50 p-3.5 sm:p-4 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <Scale className="w-3.5 h-3.5 text-cyan" aria-hidden />
                <h3 className="text-[12.5px] font-display font-semibold">
                  Spectrum balance
                </h3>
              </div>
              <p className="text-[11px] text-muted-foreground mb-3 leading-snug">
                Aggregate share of sampled discussion about major candidacies — coarse buckets
                only. Not an official party ranking.
              </p>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={m.spectrum}
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
                      domain={[0, 40]}
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                      unit="%"
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={108}
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [`${v}%`, "Share"]}
                    />
                    <Bar dataKey="sharePct" radius={[0, 6, 6, 0]} barSize={18}>
                      {m.spectrum.map((_, i) => (
                        <Cell
                          key={m.spectrum[i]!.id}
                          fill={SPECTRUM_COLORS[i % SPECTRUM_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <ul className="mt-3 flex flex-wrap gap-2 px-0.5">
            {m.caveats.map((c) => (
              <li
                key={c}
                className="text-[10.5px] text-muted-foreground border border-border/70 rounded-full px-2.5 py-1 bg-secondary/20"
              >
                {c}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] font-mono text-muted-foreground px-0.5">
            Confidence: {m.confidence} · last sampled {m.lastSampled} · refresh {m.refreshCadence}
          </p>
        </section>

        {/* Observations */}
        <section className="mb-7 sm:mb-8" aria-labelledby="sr-obs">
          <div className="flex items-center gap-2 mb-3 px-0.5">
            <Radio className="w-4 h-4 text-cyan" aria-hidden />
            <h2 id="sr-obs" className="text-[13px] font-display font-semibold">
              Observations
            </h2>
            <span className="text-[11px] text-muted-foreground">
              Short · factual · updatable
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
            {entry.observations.map((o, i) => (
              <motion.article
                key={o.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="rounded-xl border border-border/90 bg-card/50 p-3.5 sm:p-4"
              >
                <p className="text-[13px] text-foreground/90 leading-relaxed">{o.text}</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-2.5">
                  Updated {formatDateLabel(o.updatedAt)}
                </p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* What it does not do */}
        <section className="mb-7 sm:mb-8 rounded-xl border border-border/80 bg-secondary/20 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-cyan" aria-hidden />
            <h2 className="text-[13px] font-display font-semibold">What this filter does not do</h2>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {entry.doesNot.map((d) => (
              <li
                key={d}
                className="flex items-start gap-2 text-[12.5px] text-muted-foreground leading-snug"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-signal shrink-0 mt-0.5" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Methodology & privacy */}
        <section
          className="mb-7 sm:mb-8 rounded-xl border border-border/90 bg-card/40 p-4 sm:p-5 space-y-4"
          aria-labelledby="sr-method"
        >
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-cyan" aria-hidden />
            <h2 id="sr-method" className="text-[13px] font-display font-semibold">
              Methodology & privacy
            </h2>
          </div>
          <p className="text-[12.5px] text-foreground/90 leading-relaxed border-l-2 border-cyan/40 pl-3">
            {SPEECH_REACH_META.privacyCore}
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h3 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-2">
                How we measure
              </h3>
              <ul className="space-y-2">
                {SPEECH_REACH_META.methodology.map((line) => (
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
                {SPEECH_REACH_META.limitations.map((line) => (
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
        </section>

        {/* Future expansion */}
        <section className="mb-6 rounded-xl border border-violet-400/25 bg-violet-500/[0.06] p-4 sm:p-5">
          <div className="flex items-start gap-2.5">
            <GitBranch className="w-4 h-4 text-violet-300 shrink-0 mt-0.5" aria-hidden />
            <div>
              <h2 className="text-[13px] font-display font-semibold text-foreground mb-1.5">
                Future entries
              </h2>
              <p className="text-[12.5px] text-muted-foreground leading-relaxed">
                {SPEECH_REACH_META.futureNote}
              </p>
            </div>
          </div>
        </section>

        {/* Cross-links */}
        <div className="flex flex-wrap gap-3 text-[12.5px]">
          <Link
            to="/research/networks-ledger"
            className="inline-flex items-center gap-1.5 text-cyan hover:underline min-h-[40px]"
          >
            <Shield className="w-3.5 h-3.5" />
            Terror & Finance Networks
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

function BrazilStatusBlock({ entry }: { entry: SpeechReachEntry }) {
  return (
    <section
      className="mb-7 sm:mb-8 rounded-2xl border border-cyan/30 bg-gradient-to-br from-card/80 via-card/50 to-cyan/[0.04] overflow-hidden"
      aria-labelledby="brazil-status"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 border-b border-border/70 bg-secondary/30">
        <div className="flex items-center gap-2 min-w-0">
          <Brain className="w-4 h-4 text-cyan shrink-0" aria-hidden />
          <h2
            id="brazil-status"
            className="text-[14px] sm:text-[15px] font-display font-semibold truncate"
          >
            {entry.title}
          </h2>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.14em] px-2 py-1 rounded-full border border-emerald-signal/45 text-emerald-signal bg-emerald-signal/10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-signal animate-pulse" />
          {STATUS_LABELS[entry.status]}
        </span>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="md:col-span-2 space-y-3">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1">
                What it does
              </p>
              <p className="text-[13px] sm:text-[14px] text-foreground/90 leading-relaxed">
                {entry.whatItDoes}
              </p>
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              {entry.activationNote}
            </p>
          </div>
          <div className="rounded-xl border border-border/80 bg-background/40 p-3.5 space-y-2.5">
            <StatRow label="Jurisdiction" value={entry.jurisdiction} />
            <StatRow label="Approx. scale" value={entry.scaleLabel} />
            <StatRow label="Activation" value={formatDateLabel(entry.activationDate)} />
            <StatRow label="Status" value={STATUS_LABELS[entry.status]} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:items-center pt-1">
          <a
            href={entry.verifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl border border-cyan/45 bg-cyan/10 text-cyan text-[13px] font-medium hover:bg-cyan/15 transition-colors"
          >
            <GitBranch className="w-4 h-4" />
            {entry.verifyLabel}
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
          <span className="text-[11px] text-muted-foreground sm:ml-1">
            Exact list lives only in the public source — never mirrored here.
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {entry.sources.map((s) => (
            <a
              key={s.url + s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg border border-border/80 text-muted-foreground hover:text-cyan hover:border-cyan/35 transition-colors min-h-[36px]"
            >
              <span className="font-mono uppercase text-[9px] tracking-wider text-cyan/80">
                {s.kind}
              </span>
              <span className="max-w-[220px] truncate">{s.label}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2 text-[12px]">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-foreground/90 text-right font-medium leading-snug">{value}</span>
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
      className="rounded-xl border border-cyan/25 bg-gradient-to-br from-secondary/40 via-card/30 to-violet-500/[0.05] p-3 sm:p-3.5 min-w-0"
      title={hint}
    >
      <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1 leading-tight">
        {label}
      </p>
      <p className="text-xl sm:text-2xl font-display font-semibold text-cyan tabular-nums">
        {value}
      </p>
      <p className="text-[10.5px] text-muted-foreground mt-1.5 leading-snug line-clamp-3">
        {hint}
      </p>
    </motion.div>
  );
}
