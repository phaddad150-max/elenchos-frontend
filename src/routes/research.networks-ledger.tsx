import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, lazy, Suspense, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  ExternalLink,
  Filter,
  FlaskConical,
  MapPin,
  MessageSquareShare,
  Search,
  Shield,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import {
  ResearchBreadcrumb,
  ResearchDeskNav,
} from "@/components/research/ResearchDeskNav";
import { LedgerBranchNav } from "@/components/networks-ledger/LedgerBranchNav";
import {
  ACTION_TYPE_LABELS,
  ALL_ENTRIES,
  LINKED_KIND_LABELS,
  NETWORKS_LEDGER_DATA,
  NETWORKS_LEDGER_DISCLAIMER,
  NETWORK_MARKER_COLORS,
  NETWORK_OPTIONS,
  REGION_OPTIONS,
  computeMetrics,
  filterEntries,
  flagshipEntries,
  formatDate,
  formatUsd,
  linkedActorsOf,
  type ActionType,
  type LedgerEntry,
  type LinkedActor,
} from "@/lib/networks-ledger";

const NetworksMap = lazy(() =>
  import("@/components/networks-ledger/NetworksMap").then((m) => ({
    default: m.NetworksMap,
  })),
);

export const Route = createFileRoute("/research/networks-ledger")({
  head: () => ({
    meta: [
      {
        title: "Networks Ledger · Terror & Finance · Library · Elenchos",
      },
      {
        name: "description",
        content:
          "Elenchos Networks Ledger: Terror & Finance Networks (official designations, freezes, arrests, charges) and Speech Reach (algorithmic distribution of already-public speech on X).",
      },
      {
        property: "og:title",
        content: "Networks Ledger · Elenchos Research Desk",
      },
      {
        property: "og:description",
        content:
          "Two branches: Terror & Finance Networks · Speech Reach. Primary sources and privacy-safe metrics.",
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
  component: NetworksLedgerPage,
});

function NetworksLedgerPage() {
  const [q, setQ] = useState("");
  const [network, setNetwork] = useState("all");
  const [type, setType] = useState("all");
  const [country, setCountry] = useState("all");
  const [region, setRegion] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const metrics = useMemo(() => computeMetrics(ALL_ENTRIES), []);
  const flagships = useMemo(() => flagshipEntries(ALL_ENTRIES).slice(0, 12), []);
  const filtered = useMemo(
    () => filterEntries(ALL_ENTRIES, { q, network, type, country, region }),
    [q, network, type, country, region],
  );

  const countries = useMemo(() => {
    const set = new Set(ALL_ENTRIES.map((e) => e.location.country));
    return [...set].sort();
  }, []);

  // Deep-link #designations-ledger from hub cards (legacy #fraud-ledger aliases here)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const h = window.location.hash;
    if (h === "#designations-ledger" || h === "#fraud-ledger" || h === "#ledger") {
      document
        .getElementById("designations-ledger")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1400px] mx-auto w-full min-w-0 px-2.5 sm:px-4 md:px-6 py-5 sm:py-8 mobile-safe-bottom md:pb-14 relative flex-1 overflow-x-clip">
        <ResearchBreadcrumb current="Library · Trackers" />
        <ResearchDeskNav />

        {/* Hero */}
        <header className="page-hero-banner mb-5 sm:mb-6 overflow-hidden relative min-w-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan/10 via-transparent to-violet-500/8 pointer-events-none" />
          <div className="relative p-4 sm:p-5 md:p-6 space-y-2.5 min-w-0">
            <div className="page-hero-kicker">
              <Brain className="w-3.5 h-3.5" aria-hidden />
              Library · Networks Ledger
            </div>
            <h1 className="page-hero-title text-[1.4rem] sm:text-2xl md:text-[1.85rem] break-words">
              Networks Ledger
            </h1>
            <p className="text-[12px] font-mono text-cyan/90 tracking-wide">
              Terror & Finance · Speech Reach
            </p>
            <p className="text-[13px] sm:text-[14px] text-muted-foreground max-w-3xl leading-relaxed break-words">
              Two public ledgers under one roof: official terror-finance enforcement actions, and
              code-visible rules that limit how already-public speech travels in X’s algorithmic
              feed.{" "}
              <Link to="/research/library" className="text-cyan hover:underline">
                Back to full library
              </Link>
              .
            </p>
          </div>
        </header>

        <LedgerBranchNav />

        {/* Tool hub */}
        <section className="mb-7 sm:mb-8" aria-labelledby="intel-tools">
          <h2
            id="intel-tools"
            className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground mb-3 px-0.5"
          >
            Related tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            <ToolCard
              href="#designations-ledger"
              title="Terror & Finance"
              body="Map + ledger of official designations, freezes, arrests, and charges — primary government sources only."
              icon={<Shield className="w-5 h-5" />}
              badge="On this page"
              tone="cyan"
            />
            <ToolCard
              href="/research/networks-ledger/speech-reach"
              title="Speech Reach"
              body="How already-public speech is distributed — or limited — in X’s For You feed. Brazil 2026 filter first."
              icon={<MessageSquareShare className="w-5 h-5" />}
              badge="New"
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
          <Link
            to="/trackers"
            className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-mono text-cyan hover:underline min-h-[40px] px-0.5"
          >
            Open full trackers hub <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </section>

        {/* Terror & Finance branch content */}
        <div id="designations-ledger" className="scroll-mt-28 space-y-5 sm:space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-2 px-0.5">
            <div className="min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-cyan/90 mb-1">
                Branch · Terror & Finance Networks
              </p>
              <h2 className="text-[15px] sm:text-[16px] font-display font-semibold text-foreground">
                Official actions on terror-finance networks
              </h2>
              <p className="text-[12.5px] text-muted-foreground mt-0.5 max-w-2xl leading-snug">
                Designations, freezes, arrests, and charges from OFAC, DOJ, State, UAE/TFTC, and
                EU/member-state primary acts. Allegations until adjudicated. Linked organizations,
                countries, institutions, and NGOs appear only when named in the primary source —
                not collective guilt.
              </p>
              <p className="text-[11px] font-mono text-cyan/90 mt-1">
                {NETWORKS_LEDGER_DATA.meta.version} · {ALL_ENTRIES.length} entries ·{" "}
                {NETWORKS_LEDGER_DATA.meta.lastReviewed}
              </p>
            </div>
          </div>

        <DisclaimerBanner />

        {/* Metrics */}
        <section
          aria-label="Top metrics"
          className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-6"
        >
          <MetricCard
            label="Total designations"
            value={String(metrics.totalDesignations)}
            hint="Incl. joint TFTC packages"
            delay={0}
          />
          <MetricCard
            label="Arrests / charges"
            value={String(metrics.totalArrestsCharges)}
            hint="Allegations until adjudicated"
            delay={0.04}
          />
          <MetricCard
            label="Quantified funds"
            value={formatUsd(metrics.quantifiedFundsUsd)}
            hint="Where officials published $ figures"
            delay={0.08}
          />
          <MetricCard
            label="Since Jan 2025"
            value={String(metrics.actionsSince2025)}
            hint={`Of ${metrics.totalEntries} ledger rows`}
            delay={0.12}
          />
        </section>

        {/* Map */}
        <section className="mb-7 sm:mb-8" aria-labelledby="map-heading">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <MapPin className="w-4 h-4 text-cyan" aria-hidden />
            <h2 id="map-heading" className="text-[13px] font-display font-semibold">
              Action map
            </h2>
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              Color = network · badge = stacked actions · click for full summary + source
            </span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 mb-2.5 px-0.5">
            {NETWORK_OPTIONS.map((n) => (
              <span
                key={n}
                className="inline-flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-foreground/25 shadow-[0_0_8px_currentColor]"
                  style={{ background: NETWORK_MARKER_COLORS[n], color: NETWORK_MARKER_COLORS[n] }}
                  aria-hidden
                />
                {n}
              </span>
            ))}
          </div>
          <Suspense
            fallback={
              <div className="h-[320px] sm:h-[400px] md:h-[460px] rounded-xl border border-border/80 bg-secondary/30 animate-pulse grid place-items-center text-[12px] text-muted-foreground">
                Loading map…
              </div>
            }
          >
            <NetworksMap
              entries={filtered.length ? filtered : ALL_ENTRIES}
              onSelect={(e) => setSelectedId(e.id)}
            />
          </Suspense>
          {selectedId && (
            <SelectedPinDetail
              entry={ALL_ENTRIES.find((e) => e.id === selectedId) ?? null}
              onClose={() => setSelectedId(null)}
            />
          )}
        </section>

        {/* Major packages */}
        <section className="mb-7 sm:mb-8" aria-labelledby="flagship-heading">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-cyan" aria-hidden />
            <h2 id="flagship-heading" className="text-[13px] font-display font-semibold">
              Major packages
            </h2>
            <span className="text-[11px] text-muted-foreground">
              Highest-impact official actions · full description + linked actors
            </span>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5 sm:gap-4">
            {flagships.map((e, i) => (
              <FlagshipCard key={e.id} entry={e} delay={i * 0.03} />
            ))}
          </div>
        </section>

        {/* Ledger table */}
        <section className="mb-8" aria-labelledby="ledger-heading">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-cyan" aria-hidden />
            <h2 id="ledger-heading" className="text-[13px] font-display font-semibold">
              Chronological ledger
            </h2>
            <span className="text-[11px] font-mono text-muted-foreground">
              {filtered.length} shown
            </span>
          </div>

          <div className="rounded-xl border border-border/90 bg-card/40 p-3 sm:p-4 mb-3 space-y-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="search"
                value={q}
                onChange={(ev) => setQ(ev.target.value)}
                placeholder="Search entities, networks, linked orgs, summary…"
                className="w-full min-h-[44px] pl-10 pr-3 rounded-lg border border-border/80 bg-background/80 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-cyan/50"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <SelectFilter
                label="Network"
                value={network}
                onChange={setNetwork}
                options={[
                  { value: "all", label: "All networks" },
                  ...NETWORK_OPTIONS.map((n) => ({ value: n, label: n })),
                ]}
              />
              <SelectFilter
                label="Type"
                value={type}
                onChange={setType}
                options={[
                  { value: "all", label: "All types" },
                  ...(
                    Object.entries(ACTION_TYPE_LABELS) as [ActionType, string][]
                  ).map(([value, label]) => ({ value, label })),
                ]}
              />
              <SelectFilter
                label="Region"
                value={region}
                onChange={setRegion}
                options={REGION_OPTIONS.map((r) => ({
                  value: r.value,
                  label: r.label,
                }))}
              />
              <SelectFilter
                label="Country"
                value={country}
                onChange={setCountry}
                options={[
                  { value: "all", label: "All countries" },
                  ...countries.map((c) => ({ value: c, label: c })),
                ]}
              />
            </div>
          </div>

          <div className="rounded-xl border border-border/90 overflow-hidden bg-card/30">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-[12px]">
                <thead className="bg-secondary/50 border-b border-border/80">
                  <tr className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                    <th className="px-3 py-2.5 font-medium">Date</th>
                    <th className="px-3 py-2.5 font-medium">Type</th>
                    <th className="px-3 py-2.5 font-medium">Network</th>
                    <th className="px-3 py-2.5 font-medium">Entities</th>
                    <th className="px-3 py-2.5 font-medium">Location</th>
                    <th className="px-3 py-2.5 font-medium">Amount</th>
                    <th className="px-3 py-2.5 font-medium">Summary</th>
                    <th className="px-3 py-2.5 font-medium">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => (
                    <tr
                      key={e.id}
                      className="border-b border-border/50 hover:bg-cyan/[0.04] align-top"
                    >
                      <td className="px-3 py-2.5 whitespace-nowrap font-mono text-[11px] text-cyan/90">
                        {formatDate(e.date)}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <TypePill type={e.type} />
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1 max-w-[140px]">
                          {e.networks.map((n) => (
                            <span
                              key={n}
                              className="text-[10px] px-1.5 py-0.5 rounded border border-border/80 text-muted-foreground"
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 max-w-[160px] text-foreground/90">
                        {e.entities.slice(0, 3).join("; ")}
                        {e.entities.length > 3 ? ` +${e.entities.length - 3}` : ""}
                      </td>
                      <td className="px-3 py-2.5 max-w-[120px] text-muted-foreground">
                        {e.location.label}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap font-mono text-[11px]">
                        {formatUsd(e.amountUsd)}
                      </td>
                      <td className="px-3 py-2.5 max-w-[280px] text-muted-foreground leading-snug">
                        <span className="text-foreground/90 font-medium block mb-0.5">
                          {e.title}
                        </span>
                        <span className="block whitespace-pre-wrap">{e.summary}</span>
                        {linkedActorsOf(e).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {linkedActorsOf(e)
                              .slice(0, 4)
                              .map((a) => (
                                <LinkedChip key={`${e.id}-${a.name}`} actor={a} compact />
                              ))}
                            {linkedActorsOf(e).length > 4 && (
                              <span className="text-[10px] text-muted-foreground">
                                +{linkedActorsOf(e).length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <a
                          href={e.source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-cyan hover:underline min-h-[36px]"
                        >
                          {e.source.agency}
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-10 text-center text-muted-foreground"
                      >
                        No rows match these filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Scope / phase note */}
        <section className="rounded-xl border border-border/80 bg-secondary/20 p-4 sm:p-5 mb-6 text-[12.5px] text-muted-foreground leading-relaxed space-y-2">
          <p className="flex items-start gap-2">
            <FlaskConical className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
            <span>
              <strong className="text-foreground/90 font-medium">
                {NETWORKS_LEDGER_DATA.meta.phase}:
              </strong>{" "}
              {NETWORKS_LEDGER_DATA.meta.scope}
            </span>
          </p>
          <p className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
            <span>
              Still out of scope: journalism-only capital-flight narratives without an official
              designation/freeze/charge; speculative NGO guilt-by-association; invented dollar
              amounts.
            </span>
          </p>
        </section>

        <DisclaimerBanner />
        </div>
      </main>

      <SiteFooter />
    </div>
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

  const inner = (
    <>
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
      <h3 className="text-[14px] font-display font-semibold text-foreground group-hover:text-cyan transition-colors break-words">
        {title}
      </h3>
      <p className="text-[12px] text-muted-foreground leading-snug mt-1 break-words flex-1">{body}</p>
      <span className="mt-2.5 inline-flex items-center gap-1 text-[11.5px] font-medium text-cyan">
        Open <ArrowRight className="w-3.5 h-3.5" />
      </span>
    </>
  );

  const className = `group flex flex-col h-full min-h-[148px] rounded-2xl border bg-card/50 p-3.5 sm:p-4 transition-colors touch-manipulation min-w-0 overflow-hidden ${toneCls}`;

  if (href.startsWith("#")) {
    return (
      <a href={href} className={className}>
        {inner}
      </a>
    );
  }
  return (
    <Link to={href} className={className}>
      {inner}
    </Link>
  );
}

function DisclaimerBanner() {
  return (
    <aside
      role="note"
      className="mb-5 rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2.5 text-[11.5px] sm:text-[12px] leading-snug text-foreground/85"
    >
      <strong className="font-semibold text-foreground">Disclaimer — </strong>
      {NETWORKS_LEDGER_DISCLAIMER}
    </aside>
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
      className="rounded-xl border border-cyan/25 bg-gradient-to-br from-secondary/40 via-card/30 to-cyan/[0.04] p-3 sm:p-3.5"
    >
      <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1">
        {label}
      </p>
      <p className="text-xl sm:text-2xl font-display font-semibold text-cyan tabular-nums">
        {value}
      </p>
      <p className="text-[10.5px] text-muted-foreground mt-1 leading-snug">{hint}</p>
    </motion.div>
  );
}

function FlagshipCard({ entry, delay }: { entry: LedgerEntry; delay: number }) {
  const linked = linkedActorsOf(entry);
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="rounded-xl border border-border/90 bg-card/50 p-4 sm:p-5 flex flex-col h-full hover:border-cyan/45 transition-colors min-w-0"
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[10px] font-mono text-cyan/90">{formatDate(entry.date)}</span>
        <TypePill type={entry.type} />
      </div>
      <h3 className="text-[14px] sm:text-[15px] font-display font-semibold leading-snug text-foreground mb-2.5">
        {entry.title}
      </h3>
      <p className="text-[13px] text-muted-foreground leading-relaxed flex-1 mb-3.5">
        {entry.summary}
      </p>
      <div className="flex flex-wrap gap-1 mb-2.5">
        {entry.networks.map((n) => (
          <span
            key={n}
            className="text-[9.5px] px-1.5 py-0.5 rounded-full border border-cyan/25 text-cyan/90"
          >
            {n}
          </span>
        ))}
        {entry.regionFocus.map((r) => (
          <span
            key={r}
            className="text-[9.5px] px-1.5 py-0.5 rounded-full border border-border/70 text-muted-foreground"
          >
            {r}
          </span>
        ))}
      </div>
      {linked.length > 0 && (
        <div className="mb-3 space-y-1.5">
          <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
            Linked actors (named in primary source)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {linked.map((a) => (
              <LinkedChip key={`${entry.id}-${a.kind}-${a.name}`} actor={a} />
            ))}
          </div>
        </div>
      )}
      {entry.amountUsd != null && (
        <p className="text-[11px] font-mono text-emerald-400/90 mb-2">
          {formatUsd(entry.amountUsd)}
          {entry.amountNote ? (
            <span className="block text-[10px] text-muted-foreground font-sans mt-0.5 normal-case tracking-normal">
              {entry.amountNote}
            </span>
          ) : null}
        </p>
      )}
      <a
        href={entry.source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-[12px] text-cyan font-medium hover:underline min-h-[36px] mt-auto"
      >
        {entry.source.label}
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </motion.article>
  );
}

const KIND_ABBR: Record<LinkedActor["kind"], string> = {
  organization: "org",
  country: "country",
  institution: "inst",
  ngo: "ngo",
  person: "person",
  company: "co",
};

function LinkedChip({ actor, compact }: { actor: LinkedActor; compact?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-border/80 bg-background/50 text-foreground/85 ${
        compact ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5"
      }`}
      title={`${LINKED_KIND_LABELS[actor.kind]} · ${actor.role} · ${actor.relation}${
        actor.direct ? "" : " (explicit source link)"
      }`}
    >
      <span className="text-muted-foreground font-mono uppercase tracking-wider text-[8px]">
        {KIND_ABBR[actor.kind]}
      </span>
      {actor.name}
      {!compact && !actor.direct && (
        <span className="text-muted-foreground/80 text-[8px]">indirect</span>
      )}
    </span>
  );
}

function TypePill({ type }: { type: ActionType }) {
  return (
    <span className="inline-flex text-[10px] px-1.5 py-0.5 rounded bg-secondary/80 border border-border/70 text-foreground/80 whitespace-nowrap">
      {ACTION_TYPE_LABELS[type]}
    </span>
  );
}

function SelectFilter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full min-h-[42px] rounded-lg border border-border/80 bg-background/80 px-2.5 text-[12.5px] text-foreground focus:outline-none focus:ring-1 focus:ring-cyan/50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SelectedPinDetail({
  entry,
  onClose,
}: {
  entry: LedgerEntry | null;
  onClose: () => void;
}) {
  if (!entry) return null;
  const linked = linkedActorsOf(entry);
  return (
    <div className="mt-2.5 rounded-xl border border-cyan/35 bg-card/70 p-3 sm:p-4">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-cyan">
          Selected pin · {formatDate(entry.date)}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="text-[11px] text-muted-foreground hover:text-foreground min-h-[32px] px-2"
        >
          Close
        </button>
      </div>
      <h3 className="text-[14px] font-display font-semibold mb-1">{entry.title}</h3>
      <p className="text-[12.5px] text-muted-foreground leading-relaxed mb-2 whitespace-pre-wrap">
        {entry.summary}
      </p>
      {linked.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {linked.map((a) => (
            <LinkedChip key={`${entry.id}-sel-${a.name}`} actor={a} />
          ))}
        </div>
      )}
      <a
        href={entry.source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-[12.5px] text-cyan font-medium hover:underline"
      >
        Primary source — {entry.source.agency}
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}
