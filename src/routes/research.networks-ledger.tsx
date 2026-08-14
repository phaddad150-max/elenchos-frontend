import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ExternalLink,
  Filter,
  FlaskConical,
  MapPin,
  Scale,
  Search,
  Shield,
  Zap,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import {
  ACTION_TYPE_LABELS,
  ALL_ENTRIES,
  NETWORKS_LEDGER_DATA,
  NETWORKS_LEDGER_DISCLAIMER,
  NETWORK_OPTIONS,
  computeMetrics,
  filterEntries,
  flagshipEntries,
  formatDate,
  formatUsd,
  type ActionType,
  type LedgerEntry,
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
        title: "Networks Ledger · Official designations & enforcement · Elenchos",
      },
      {
        name: "description",
        content:
          "Phase 1 tracker of public official designations, arrests, and asset freezes involving IRGC, Hezbollah, Muslim Brotherhood, and Hamas-linked financing — US and US-allied Gulf sources only.",
      },
      {
        property: "og:title",
        content: "Networks Ledger · Elenchos Research Desk",
      },
      {
        property: "og:description",
        content:
          "Independent aggregation of OFAC, DOJ, State, UAE Cabinet, and TFTC public announcements. Allegations until adjudicated.",
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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const metrics = useMemo(() => computeMetrics(ALL_ENTRIES), []);
  const flagships = useMemo(() => flagshipEntries(ALL_ENTRIES).slice(0, 8), []);
  const filtered = useMemo(
    () => filterEntries(ALL_ENTRIES, { q, network, type, country }),
    [q, network, type, country],
  );

  const countries = useMemo(() => {
    const set = new Set(ALL_ENTRIES.map((e) => e.location.country));
    return [...set].sort();
  }, []);

  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1180px] mx-auto w-full min-w-0 px-3 sm:px-4 md:px-8 py-5 sm:py-7 mobile-safe-bottom md:pb-14 relative flex-1 overflow-x-clip">
        {/* Breadcrumb */}
        <nav
          aria-label="Research location"
          className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground mb-3"
        >
          <Link to="/" className="hover:text-cyan touch-manipulation min-h-[36px] inline-flex items-center">
            Home
          </Link>
          <span aria-hidden>/</span>
          <Link
            to="/research"
            className="hover:text-cyan touch-manipulation min-h-[36px] inline-flex items-center"
          >
            Research Desk
          </Link>
          <span aria-hidden>/</span>
          <span className="text-foreground/90 font-medium">Networks Ledger</span>
        </nav>

        <div className="flex flex-wrap gap-2 mb-4">
          <Link
            to="/research"
            className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground min-h-[40px] px-2.5 rounded-full border border-border/70 touch-manipulation"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Desk
          </Link>
          <Link
            to="/research/library"
            className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground min-h-[40px] px-2.5 rounded-full border border-border/70 touch-manipulation"
          >
            Library
          </Link>
        </div>

        {/* Hero */}
        <header className="page-hero-banner mb-5 sm:mb-6 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan/10 via-transparent to-rose-signal/8 pointer-events-none" />
          <div className="relative p-4 sm:p-5 md:p-6 space-y-2.5">
            <div className="page-hero-kicker">
              <Scale className="w-3.5 h-3.5" aria-hidden />
              Research Desk · Phase 1
            </div>
            <h1 className="page-hero-title text-[1.4rem] sm:text-2xl md:text-[1.85rem] break-words">
              Networks Ledger
            </h1>
            <p className="text-[13px] sm:text-[14px] text-muted-foreground max-w-3xl leading-relaxed">
              High-confidence public actions only: official designations, arrests/charges, and
              quantified freezes involving{" "}
              <span className="text-foreground/90">IRGC</span>,{" "}
              <span className="text-foreground/90">Hezbollah</span>,{" "}
              <span className="text-foreground/90">Muslim Brotherhood</span>,{" "}
              <span className="text-foreground/90">Hamas-linked financing</span>, and clear{" "}
              <span className="text-foreground/90">Mixed / Axis</span> overlaps — focused on the{" "}
              <span className="text-foreground/90">United States</span> and{" "}
              <span className="text-foreground/90">US-allied Gulf</span> (UAE, TFTC partners).
            </p>
            <p className="text-[11px] font-mono text-cyan/90">
              {NETWORKS_LEDGER_DATA.meta.version} · {ALL_ENTRIES.length} starter entries ·{" "}
              {NETWORKS_LEDGER_DATA.meta.lastReviewed}
            </p>
          </div>
        </header>

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
          <div className="flex items-center gap-2 mb-2.5">
            <MapPin className="w-4 h-4 text-cyan" aria-hidden />
            <h2 id="map-heading" className="text-[13px] font-display font-semibold">
              Interactive map
            </h2>
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              Click a pin for summary + primary source
            </span>
          </div>
          <Suspense
            fallback={
              <div className="h-[280px] sm:h-[340px] rounded-xl border border-border/80 bg-secondary/30 animate-pulse grid place-items-center text-[12px] text-muted-foreground">
                Loading map…
              </div>
            }
          >
            <NetworksMap
              entries={ALL_ENTRIES}
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

        {/* Flagship */}
        <section className="mb-7 sm:mb-8" aria-labelledby="flagship-heading">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-cyan" aria-hidden />
            <h2 id="flagship-heading" className="text-[13px] font-display font-semibold">
              Flagship actions
            </h2>
            <span className="text-[11px] text-muted-foreground">
              Highest-impact packages
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
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
                placeholder="Search entities, networks, summary…"
                className="w-full min-h-[44px] pl-10 pr-3 rounded-lg border border-border/80 bg-background/80 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-cyan/50"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                      <td className="px-3 py-2.5 max-w-[240px] text-muted-foreground leading-snug">
                        <span className="text-foreground/90 font-medium block mb-0.5">
                          {e.title}
                        </span>
                        {e.summary.length > 140
                          ? `${e.summary.slice(0, 140)}…`
                          : e.summary}
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
              <strong className="text-foreground/90 font-medium">Phase 1 scope:</strong>{" "}
              {NETWORKS_LEDGER_DATA.meta.scope}
            </span>
          </p>
          <p className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
            <span>
              Not included yet (Phase 2+): detailed European trials, African operations, general
              Lebanese post-2019 capital-flight / elite real-estate cases.
            </span>
          </p>
        </section>

        <DisclaimerBanner />
      </main>

      <SiteFooter />
    </div>
  );
}

function DisclaimerBanner() {
  return (
    <aside
      role="note"
      className="mb-5 rounded-lg border border-amber-500/35 bg-amber-500/8 px-3 py-2.5 text-[11.5px] sm:text-[12px] leading-snug text-amber-100/90"
    >
      <strong className="font-semibold text-amber-50">Disclaimer — </strong>
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
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="rounded-xl border border-border/90 bg-card/50 p-3 sm:p-3.5 flex flex-col h-full hover:border-cyan/45 transition-colors"
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[10px] font-mono text-cyan/90">{formatDate(entry.date)}</span>
        <TypePill type={entry.type} />
      </div>
      <h3 className="text-[13px] font-display font-semibold leading-snug text-foreground mb-1.5">
        {entry.title}
      </h3>
      <p className="text-[11.5px] text-muted-foreground leading-snug flex-1 mb-2">
        {entry.summary.length > 160 ? `${entry.summary.slice(0, 160)}…` : entry.summary}
      </p>
      <div className="flex flex-wrap gap-1 mb-2">
        {entry.networks.map((n) => (
          <span
            key={n}
            className="text-[9.5px] px-1.5 py-0.5 rounded-full border border-cyan/25 text-cyan/90"
          >
            {n}
          </span>
        ))}
      </div>
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
        className="inline-flex items-center gap-1 text-[11.5px] text-cyan font-medium hover:underline min-h-[36px]"
      >
        {entry.source.label}
        <ExternalLink className="w-3 h-3" />
      </a>
    </motion.article>
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
      <p className="text-[12.5px] text-muted-foreground leading-relaxed mb-2">{entry.summary}</p>
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
