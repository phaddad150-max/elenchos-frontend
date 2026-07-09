import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  ChevronDown,
  Lightbulb,
  Lock,
  Radio,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { DataFreshnessBar } from "@/components/DataFreshnessBar";
import { SimulatedDataBadge } from "@/components/SimulatedDataBadge";
import {
  LEADER_DIMENSIONS,
  LEADER_REGION_BUCKETS,
  MEDIA_REGION_BUCKETS,
  PEACE_BUCKETS,
  TRACKER_CATALOG,
  bucketForCountry,
  extractLeadersByRegion,
  extractMediaTrust,
  extractFootballPlayers,
  extractPeaceCountries,
  extractRankedLeaders,
  fetchLatestTrackers,
  momentumColor,
  momentumIcon,
  type LeaderRegionBucketKey,
  type MediaLanguageDiscrepancy,
  type MediaOutlet,
  type MediaRegionKey,
  type MediaTrustData,
  type PeaceCountry,
  type RankedLeader,
  type TrackerDefinition,
  type TrackerRow,
} from "@/lib/trackers-data";
import { ArrowDownRight, Minus, TrendingUp, AlertTriangle, MessageSquareQuote, Quote, Newspaper, Languages } from "lucide-react";



export const Route = createFileRoute("/trackers/")({
  head: () => ({
    meta: [
      { title: "Performance Trackers: Leaders, Peace & Global Issues Ranked by Citizens — Elenchos" },
      {
        name: "description",
        content:
          "Leader trust rankings, Middle East peace tracker and citizen-scored performance indices on crime, immigration and governance — built from real public discourse on X.",
      },
      { property: "og:title", content: "Performance Trackers: Leaders, Peace & Global Issues Ranked by Citizens" },
      {
        property: "og:description",
        content:
          "Citizen sentiment analysis on world leaders and countries. Trust rankings, peace tracker and narrative gaps — refreshed continuously.",
      },
      { property: "og:url", content: "https://elenchos.live/trackers" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/trackers" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Citizen Rankings",
          description:
            "Citizen-scored leaderboards across leaders and countries, refreshed continuously from real public discourse.",
          url: "https://elenchos.live/trackers",
        }),
      },
    ],
  }),

  component: TrackersPage,
});

/* ---------------- Standardized color system ---------------- */
// Sentiment / support score (0-100)
function scoreHex(s?: number | null): string {
  if (s == null || Number.isNaN(s)) return "#6B7280";
  if (s >= 80) return "#00C853";
  if (s >= 65) return "#64DD17";
  if (s >= 50) return "#FFAB00";
  if (s >= 35) return "#FF5722";
  return "#FF1744";
}
function scoreLabel(s?: number | null): string {
  if (s == null) return "—";
  if (s >= 80) return "Strongly Positive";
  if (s >= 65) return "Positive";
  if (s >= 50) return "Mixed";
  if (s >= 35) return "Negative";
  return "Strongly Negative";
}
// See-through-the-show: inverted (low = trusting=good, high=cynical=bad)
function seeThroughHex(s?: number | null): string {
  if (s == null) return "#6B7280";
  if (s <= 30) return "#00C853";
  if (s <= 60) return "#FFAB00";
  return "#FF1744";
}
// Progress text
function progressHex(label?: string | null): string {
  if (!label) return "#6B7280";
  const l = label.toLowerCase();
  if (/(full|strong|signed|active|accord)/.test(l)) return "#00C853";
  if (/(quiet|moderate|talks|partial|exploratory)/.test(l)) return "#FFAB00";
  if (/(no|stall|frozen|hostile|broken)/.test(l)) return "#FF1744";
  return "#FFAB00";
}

function formatDate(iso?: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

/* ---------------- Shared atoms ---------------- */

function ScorePill({ value, size = "md" }: { value?: number | null; size?: "sm" | "md" | "lg" }) {
  const hex = scoreHex(value);
  const sz =
    size === "lg" ? "text-3xl px-3 py-1.5" : size === "sm" ? "text-xs px-2 py-0.5" : "text-base px-2.5 py-1";
  return (
    <span
      className={`inline-flex items-center rounded-lg font-display font-bold tabular-nums ${sz}`}
      style={{
        color: hex,
        background: `${hex}1A`,
        boxShadow: `inset 0 0 0 1px ${hex}55`,
      }}
    >
      {value == null ? "—" : Math.round(value)}
    </span>
  );
}

function RankBadge({ rank, highlight }: { rank: number; highlight?: boolean }) {
  if (highlight) {
    return (
      <span
        className="inline-flex items-center justify-center w-7 h-7 rounded-lg font-display font-bold text-[12px] tabular-nums shrink-0"
        style={{
          background: "linear-gradient(135deg, #FFD54F, #FFAB00)",
          color: "#1a1100",
          boxShadow: "0 0 12px #FFAB0080, inset 0 0 0 1px #FFE082",
        }}
      >
        {rank}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-secondary/70 border border-border/60 font-mono font-semibold text-[11px] text-muted-foreground tabular-nums shrink-0">
      {rank}
    </span>
  );
}

// Convert various flag representations from the backend into a proper emoji flag.
// Accepts: emoji ("🇸🇻"), ISO-2 code ("SV"), or country name ("El Salvador").
const COUNTRY_NAME_TO_ISO2: Record<string, string> = {
  "el salvador": "SV", india: "IN", ukraine: "UA", uae: "AE",
  "united arab emirates": "AE", bahrain: "BH", morocco: "MA", israel: "IL",
  "saudi arabia": "SA", "saudi": "SA", qatar: "QA", egypt: "EG", jordan: "JO",
  lebanon: "LB", iran: "IR", iraq: "IQ", syria: "SY", turkey: "TR", "türkiye": "TR",
  palestine: "PS", yemen: "YE", oman: "OM", kuwait: "KW",
  "united states": "US", usa: "US", "u.s.": "US", "u.s.a.": "US", america: "US",
  canada: "CA", mexico: "MX", brazil: "BR", argentina: "AR", chile: "CL",
  colombia: "CO", venezuela: "VE", peru: "PE", cuba: "CU",
  "united kingdom": "GB", uk: "GB", "great britain": "GB", britain: "GB", england: "GB",
  france: "FR", germany: "DE", italy: "IT", spain: "ES", portugal: "PT",
  netherlands: "NL", belgium: "BE", greece: "GR", poland: "PL", sweden: "SE",
  norway: "NO", denmark: "DK", finland: "FI", ireland: "IE", austria: "AT",
  switzerland: "CH", hungary: "HU", "czech republic": "CZ", czechia: "CZ", romania: "RO",
  china: "CN", japan: "JP", "south korea": "KR", korea: "KR", "north korea": "KP",
  pakistan: "PK", indonesia: "ID", vietnam: "VN", thailand: "TH", philippines: "PH",
  malaysia: "MY", singapore: "SG", taiwan: "TW",
  russia: "RU", ukraine_: "UA", belarus: "BY",
  nigeria: "NG", kenya: "KE", ethiopia: "ET", "south africa": "ZA",
  algeria: "DZ", tunisia: "TN", ghana: "GH", sudan: "SD", uganda: "UG",
  australia: "AU", "new zealand": "NZ",
};

function iso2ToFlagEmoji(code: string): string {
  const cc = code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return "";
  const A = 0x1f1e6;
  return String.fromCodePoint(A + cc.charCodeAt(0) - 65, A + cc.charCodeAt(1) - 65);
}

function resolveFlagEmoji(input?: string, country?: string): { glyph: string; isFlag: boolean } {
  // 1) Already an emoji flag? Detect regional indicator code points.
  if (input && /\uD83C[\uDDE6-\uDDFF]/.test(input)) return { glyph: input, isFlag: true };
  // 2) Two-letter ISO code (e.g. "SV", "ae")
  if (input && /^[A-Za-z]{2}$/.test(input.trim())) {
    const f = iso2ToFlagEmoji(input);
    if (f) return { glyph: f, isFlag: true };
  }
  // 3) Try country name lookup (from explicit `country` field or from `input` itself)
  for (const candidate of [country, input]) {
    if (!candidate) continue;
    const iso = COUNTRY_NAME_TO_ISO2[candidate.toLowerCase().trim()];
    if (iso) {
      const f = iso2ToFlagEmoji(iso);
      if (f) return { glyph: f, isFlag: true };
    }
  }
  // 4) Fallback: show original input (e.g. uppercase code) or neutral flag.
  return { glyph: input?.trim() || "🏳️", isFlag: false };
}

function FlagAvatar({
  flag,
  country,
  size = "md",
}: {
  flag?: string;
  country?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "lg" ? "w-12 h-12" : size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const textSize =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";
  const fallbackSize =
    size === "lg" ? "text-[11px]" : size === "sm" ? "text-[9px]" : "text-[10px]";
  const { glyph, isFlag } = resolveFlagEmoji(flag, country);
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-background/60 border border-border/60 leading-none shrink-0 overflow-hidden ${dim} ${
        isFlag ? textSize : `${fallbackSize} font-mono font-semibold text-muted-foreground tracking-wider`
      }`}
      style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)" }}
      aria-label={country || flag || "flag"}
    >
      {glyph}
    </span>
  );
}


function DimensionBar({ label, value }: { label: string; value?: number }) {
  const v = typeof value === "number" ? Math.max(0, Math.min(100, value)) : 0;
  const hex = scoreHex(value);
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.14em] mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span style={{ color: hex }} className="font-semibold tabular-nums">
          {value == null ? "—" : Math.round(value)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${v}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${hex}, ${hex}CC)`, boxShadow: `0 0 12px ${hex}80` }}
        />
      </div>
    </div>
  );
}

/* ---------------- Overview cards (landing) ---------------- */

const TRACKER_CARD_CYAN = {
  "--card-accent": "var(--color-cyan)",
  "--card-glow": "oklch(0.82 0.16 200 / 0.18)",
} as React.CSSProperties;

const TRACKER_CARD_VIOLET = {
  "--card-accent": "#8B5CF6",
  "--card-glow": "oklch(0.62 0.22 300 / 0.18)",
} as React.CSSProperties;

function LivePulseBadge({ label, accent = "cyan" }: { label: string; accent?: "cyan" | "violet" }) {
  const color = accent === "violet" ? "#8B5CF6" : "var(--color-cyan)";
  return (
    <span
      className="relative inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-[0.18em]"
      style={{
        color,
        background: `${accent === "violet" ? "#8B5CF6" : "var(--color-cyan)"}1A`,
        boxShadow: `inset 0 0 0 1px ${accent === "violet" ? "#8B5CF6" : "var(--color-cyan)"}44`,
      }}
    >
      <motion.span
        animate={{ scale: [1, 1.35, 1], opacity: [1, 0.55, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
      />
      {label}
    </span>
  );
}

function TrackerOverviewRow({
  index,
  score,
  children,
}: {
  index: number;
  score?: number | null;
  children: React.ReactNode;
}) {
  const v = typeof score === "number" ? Math.max(0, Math.min(100, score)) : 0;
  const hex = scoreHex(score);
  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.22 + index * 0.09, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.012 }}
      className="tracker-row flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-background/50 border border-border/40"
    >
      {children}
      {typeof score === "number" && (
        <motion.div
          className="tracker-row-bar"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: v / 100 }}
          transition={{ delay: 0.4 + index * 0.09, duration: 0.65, ease: "easeOut" }}
          style={{
            background: `linear-gradient(90deg, ${hex}66, ${hex})`,
            boxShadow: `0 0 10px ${hex}55`,
          }}
        />
      )}
    </motion.div>
  );
}

function LeaderOverviewCard({
  def,
  row,
  href,
}: {
  def: TrackerDefinition;
  row?: TrackerRow;
  href: string;
}) {
  const leaders = useMemo(() => extractRankedLeaders(row), [row]);
  const top = leaders.filter((l) => l.status !== "waiting" && typeof l.overall_score === "number").slice(0, 3);

  const snapshotDate = formatDate(row?.created_at);

  return (
    <Link
      to="/trackers/leaders"
      style={TRACKER_CARD_CYAN}
      className="tracker-card group text-left w-full rounded-2xl border border-border/60 hover:border-cyan/45 hover:shadow-[0_28px_64px_-28px_rgba(0,200,200,0.45)] overflow-hidden block cursor-pointer"
    >
      <div className="tracker-shimmer absolute top-0 left-0 right-0 h-px opacity-50 pointer-events-none" />
      <div className="relative p-5 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 0.4 }}
            >
              <Trophy className="w-4 h-4 text-cyan" />
            </motion.div>
            <LivePulseBadge label="Live Leaderboard" />
          </div>
          <motion.span
            className="inline-flex"
            initial={{ x: 0, y: 0 }}
            whileHover={{ x: 2, y: -2 }}
          >
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-cyan transition-colors" />
          </motion.span>
        </div>
        <h3 className="text-xl md:text-2xl font-display font-semibold text-foreground leading-tight group-hover:text-cyan/95 transition-colors duration-300">
          {def.title}
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed line-clamp-2">
          Citizens scoring leaders on trust, leadership, corruption, economy, youth appeal and more.
        </p>

        {top.length > 0 ? (
          <div className="mt-5 space-y-2">
            <div className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-2 flex items-center gap-2">
              <Activity className="w-3 h-3 text-cyan/70" />
              Top performers
            </div>
            {top.map((l, i) => (
              <TrackerOverviewRow key={`${l.name}-${l.rank}`} index={i} score={l.overall_score}>
                <div className="flex items-center gap-3 min-w-0">
                  <RankBadge rank={l.rank ?? i + 1} highlight={i === 0} />
                  <FlagAvatar flag={l.flag} country={l.country || l.name} size="sm" />
                  <div className="min-w-0">
                    <div className="text-sm font-display font-semibold text-foreground truncate leading-tight">
                      {l.name}
                    </div>
                    {l.country && (
                      <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground truncate">
                        {l.country}
                      </div>
                    )}
                  </div>
                </div>
                <ScorePill value={l.overall_score} size="sm" />
              </TrackerOverviewRow>
            ))}
          </div>
        ) : (
          <div className="mt-5 px-3 py-3 rounded-lg border border-dashed border-border bg-background/30 text-[12px] font-mono uppercase tracking-[0.16em] text-muted-foreground inline-flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" /> Awaiting backend sync
          </div>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-4">
          <span className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
            {leaders.length > 0 ? `${leaders.length} leaders ranked` : "—"}
            {snapshotDate ? ` · ${snapshotDate}` : ""}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-[0.16em] text-cyan group-hover:gap-2.5 transition-all duration-300">
            Open leaderboard
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function PeaceOverviewCard({
  def,
  row,
  href,
}: {
  def: TrackerDefinition;
  row?: TrackerRow;
  href: string;
}) {
  const countries = useMemo(() => extractPeaceCountries(row), [row]);
  const sorted = useMemo(
    () =>
      [...countries].sort(
        (a, b) => (b.peace_health_score ?? -1) - (a.peace_health_score ?? -1),
      ),
    [countries],
  );
  const top = sorted.slice(0, 3);
  const snapshotDate = formatDate(row?.created_at);
  const avg =
    countries.length > 0
      ? Math.round(
          countries.reduce((s, c) => s + (c.peace_health_score ?? 0), 0) /
            countries.filter((c) => typeof c.peace_health_score === "number").length || 0,
        )
      : undefined;

  return (
    <Link
      to="/trackers/peace"
      style={TRACKER_CARD_CYAN}
      className="tracker-card group text-left w-full rounded-2xl border border-border/60 hover:border-cyan/45 hover:shadow-[0_28px_64px_-28px_rgba(0,200,200,0.45)] overflow-hidden block cursor-pointer"
    >
      <div className="tracker-shimmer absolute top-0 left-0 right-0 h-px opacity-50 pointer-events-none" />
      <div className="relative p-5 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div animate={{ rotate: [0, 12, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
              <Sparkles className="w-4 h-4 text-cyan" />
            </motion.div>
            <LivePulseBadge label="Diagnostic Index" />
          </div>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-cyan transition-colors" />
        </div>
        <h3 className="text-xl md:text-2xl font-display font-semibold text-foreground leading-tight group-hover:text-cyan/95 transition-colors duration-300">
          {def.title}
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed line-clamp-2">
          Peace health, momentum, and the gap between governments and their publics — country by country.
        </p>

        {typeof avg === "number" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="mt-4 inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border border-border/50 bg-background/40"
          >
            <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">Avg health</span>
            <ScorePill value={avg} size="sm" />
          </motion.div>
        )}

        {top.length > 0 ? (
          <div className="mt-5 space-y-2">
            <div className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-2 flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-cyan/70" />
              Healthiest peace climate
            </div>
            {top.map((c, i) => (
              <TrackerOverviewRow key={`${c.name}-${c.rank}`} index={i} score={c.peace_health_score}>
                <div className="flex items-center gap-3 min-w-0">
                  <RankBadge rank={i + 1} highlight={i === 0} />
                  <FlagAvatar flag={c.flag} country={c.name} size="sm" />
                  <span className="text-sm font-display font-semibold text-foreground truncate">
                    {c.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {c.momentum && <MomentumChip momentum={c.momentum} compact />}
                  <ScorePill value={c.peace_health_score} size="sm" />
                </div>
              </TrackerOverviewRow>
            ))}
          </div>
        ) : (
          <div className="mt-5 px-3 py-3 rounded-lg border border-dashed border-border bg-background/30 text-[12px] font-mono uppercase tracking-[0.16em] text-muted-foreground inline-flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" /> Awaiting backend sync
          </div>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-4">
          <span className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
            {countries.length > 0 ? `${countries.length} countries · avg health ${avg ?? "—"}` : "—"}
            {snapshotDate ? ` · ${snapshotDate}` : ""}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-[0.16em] text-cyan group-hover:gap-2.5 transition-all duration-300">
            Open index
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function MomentumChip({ momentum, compact }: { momentum: string; compact?: boolean }) {
  const hex = momentumColor(momentum);
  const ic = momentumIcon(momentum);
  const Icon = ic === "up" ? TrendingUp : ic === "down" ? ArrowDownRight : Minus;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-mono uppercase tracking-[0.14em] ${
        compact ? "px-1.5 py-0.5 text-[9.5px]" : "px-2 py-0.5 text-[10px]"
      }`}
      style={{ color: hex, background: `${hex}1A`, boxShadow: `inset 0 0 0 1px ${hex}55` }}
    >
      <Icon className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
      {compact ? "" : momentum}
    </span>
  );
}

/* Circular gauge (SVG) for peace card headers */
function CircularGauge({
  value,
  label,
  size = 64,
  invert = false,
}: {
  value?: number | null;
  label: string;
  size?: number;
  invert?: boolean;
}) {
  const v = typeof value === "number" ? Math.max(0, Math.min(100, value)) : 0;
  const hex = invert
    ? v >= 60
      ? "#FF1744"
      : v >= 30
        ? "#FFAB00"
        : "#00C853"
    : scoreHex(value);
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const dash = (v / 100) * c;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth={5}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={hex}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - dash }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 6px ${hex}88)` }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center font-display font-bold tabular-nums"
          style={{ color: hex, fontSize: size * 0.28 }}
        >
          {value == null ? "—" : Math.round(value)}
        </div>
      </div>
      <span
        className="text-[9px] font-mono uppercase tracking-[0.14em] text-center leading-tight max-w-[90px]"
        style={{ color: hex }}
      >
        {label}
      </span>
    </div>
  );
}

/* Mini timeline — visualizes a single-score checkpoint on a 0-100 axis */
function MiniTimeline({ score, hex }: { score?: number | null; hex: string }) {
  const v = typeof score === "number" ? Math.max(0, Math.min(100, score)) : 0;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1">
        <span>Frozen</span>
        <span>Warming</span>
        <span>Full peace</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#FF1744] via-[#FFAB00] to-[#00C853] opacity-30"
          style={{ width: "100%" }}
        />
        <motion.div
          initial={{ left: "0%" }}
          animate={{ left: `calc(${v}% - 6px)` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2"
          style={{
            background: hex,
            borderColor: "hsl(var(--background))",
            boxShadow: `0 0 10px ${hex}`,
          }}
        />
      </div>
    </div>
  );
}




function GapBar({ gap }: { gap: number }) {
  // 0 = aligned, 100 = total divergence. Color: low=green, mid=amber, high=red.
  const v = Math.max(0, Math.min(100, gap));
  const hex = v >= 50 ? "#FF1744" : v >= 25 ? "#FFAB00" : "#00C853";
  return (
    <div>
      <div className="flex items-center justify-between text-[10.5px] font-mono uppercase tracking-[0.14em] mb-1">
        <span className="text-muted-foreground inline-flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" style={{ color: hex }} /> Gov vs Public gap
        </span>
        <span style={{ color: hex }} className="font-semibold tabular-nums">
          {Math.round(v)}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${v}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${hex}, ${hex}CC)`,
            boxShadow: `0 0 12px ${hex}80`,
          }}
        />
      </div>
    </div>
  );
}

function ComingSoonOverviewCard({ def, index }: { def: TrackerDefinition; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="tracker-card rounded-2xl border border-border/60 overflow-hidden"
      style={
        {
          "--card-accent": "hsl(var(--muted-foreground))",
          "--card-glow": "oklch(0.5 0 0 / 0.08)",
        } as React.CSSProperties
      }
    >
      <div className="relative p-5 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="px-2 py-0.5 rounded-full border border-border bg-secondary/60 text-muted-foreground text-[10px] font-mono uppercase tracking-[0.18em] inline-flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" /> Coming soon
          </span>
        </div>
        <h3 className="text-lg md:text-xl font-display font-semibold text-foreground/90 leading-tight">
          {def.title}
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{def.tagline}</p>
        <div className="mt-5 h-1.5 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan/40 via-cyan/70 to-cyan/40 tracker-shimmer"
            initial={{ width: "12%" }}
            animate={{ width: ["12%", "28%", "18%", "32%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.article>
  );
}

/* ---------------- Full-screen detail modals ---------------- */

function DetailShell({
  open,
  onClose,
  title,
  subtitle,
  meta,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  meta?: React.ReactNode;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-5xl max-h-[94vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 px-5 sm:px-6 py-4 border-b border-border/60 bg-card/95 backdrop-blur">
              <div className="min-w-0">
                <h2 className="text-lg sm:text-2xl font-display font-semibold text-foreground truncate">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-[12px] sm:text-sm text-muted-foreground mt-0.5 leading-snug">
                    {subtitle}
                  </p>
                )}
                {meta && <div className="mt-1.5">{meta}</div>}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 sm:p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- Leaderboard detail ---------------- */

function LeaderCard({
  leader,
  highlight,
  expanded,
  onToggle,
}: {
  leader: RankedLeader;
  highlight?: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const hex = scoreHex(leader.overall_score);
  return (
    <motion.div
      layout
      className="rounded-2xl border bg-card/40 overflow-hidden transition-colors"
      style={{
        borderColor: highlight ? `${hex}66` : "hsl(var(--border) / 0.6)",
        boxShadow: highlight ? `0 0 30px ${hex}22` : undefined,
      }}
    >
      <button
        onClick={onToggle}
        className="w-full text-left px-4 sm:px-5 py-3.5 flex items-center gap-3 sm:gap-4 hover:bg-card/70 transition-colors"
      >
        <RankBadge rank={leader.rank ?? 0} highlight={highlight} />
        <FlagAvatar flag={leader.flag} country={leader.country || leader.name} size="md" />
        <div className="min-w-0 flex-1">
          <div className="text-sm sm:text-[15px] font-display font-semibold text-foreground truncate leading-tight">
            {leader.name}
          </div>
          <div className="text-[10.5px] font-mono uppercase tracking-[0.14em] text-muted-foreground truncate">
            {[leader.country, leader.region].filter(Boolean).join(" · ") || "—"}
          </div>
        </div>

        {/* Inline mini sparkbars on desktop */}
        <div className="hidden lg:flex items-end gap-[3px] h-7 mr-3">
          {LEADER_DIMENSIONS.map((d) => {
            const v = leader.dimensions?.[d.key];
            const h = typeof v === "number" ? Math.max(4, Math.min(100, v)) : 4;
            return (
              <span
                key={d.key}
                className="w-1.5 rounded-sm"
                style={{
                  height: `${h}%`,
                  background: typeof v === "number" ? scoreHex(v) : "hsl(var(--muted))",
                  opacity: typeof v === "number" ? 1 : 0.35,
                }}
                title={`${d.label}: ${typeof v === "number" ? Math.round(v) : "—"}`}
              />
            );
          })}
        </div>

        <div className="flex flex-col items-end shrink-0">
          <ScorePill value={leader.overall_score} size="md" />
          <span
            className="hidden sm:block mt-1 text-[9.5px] font-mono uppercase tracking-[0.16em]"
            style={{ color: hex }}
          >
            {scoreLabel(leader.overall_score)}
          </span>
        </div>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-1 text-muted-foreground"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-border/50 bg-background/30">
              {leader.summary && (
                <p className="text-[13px] text-foreground/85 leading-relaxed mb-4">
                  {leader.summary}
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3">
                {LEADER_DIMENSIONS.map((d) => (
                  <DimensionBar
                    key={d.key}
                    label={d.label}
                    value={leader.dimensions?.[d.key]}
                  />
                ))}
              </div>
              {typeof leader.posts_analyzed === "number" && (
                <div className="mt-4 text-[10.5px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                  Based on {leader.posts_analyzed.toLocaleString()} posts analyzed
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function WaitingLeaderRow({ leader }: { leader: RankedLeader }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 px-4 sm:px-5 py-3.5 flex items-center gap-3 sm:gap-4">
      <RankBadge rank={leader.rank ?? 0} />
      <FlagAvatar flag={leader.flag} country={leader.country || leader.name} size="md" />
      <div className="min-w-0 flex-1">
        <div className="text-sm sm:text-[15px] font-display font-semibold text-foreground/80 truncate leading-tight">
          {leader.name}
        </div>
        <div className="text-[11px] text-muted-foreground leading-snug truncate">
          {leader.message || "Insufficient data. System is collecting signals."}
        </div>
      </div>
      <span className="shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-border/60 bg-background/40 text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
        <Radio className="w-3 h-3 animate-pulse text-cyan" /> Waiting
      </span>
    </div>
  );
}

function LeaderboardDetail({ row }: { row?: TrackerRow }) {
  const byRegion = useMemo(() => extractLeadersByRegion(row), [row]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [activeRegion, setActiveRegion] = useState<LeaderRegionBucketKey | "all">("all");

  const allLeaders = useMemo(() => {
    const all: (RankedLeader & { _bucket: LeaderRegionBucketKey })[] = [];
    for (const b of LEADER_REGION_BUCKETS) {
      for (const l of byRegion[b.key]) all.push({ ...l, _bucket: b.key });
    }
    return all;
  }, [byRegion]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const allIds = allLeaders
    .filter((l) => l.status !== "waiting")
    .map((l) => `${l._bucket}:${l.name}-${l.rank}`);
  const allExpanded = allIds.length > 0 && allIds.every((id) => expanded.has(id));
  const toggleAll = () => {
    if (allExpanded) setExpanded(new Set());
    else setExpanded(new Set(allIds));
  };

  const populatedSections = LEADER_REGION_BUCKETS.filter((b) => byRegion[b.key].length > 0);
  const visibleSections =
    activeRegion === "all"
      ? populatedSections
      : populatedSections.filter((b) => b.key === activeRegion);


  return (
    <div>
      {row?.deep_dive_summary && (
        <p className="mb-5 text-sm text-foreground/85 leading-relaxed">{row.deep_dive_summary}</p>
      )}

      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div
          role="tablist"
          aria-label="Filter leaderboard by region"
          className="inline-flex items-center gap-1 p-1 rounded-full border border-border/60 bg-background/40 overflow-x-auto max-w-full"
        >
          {(["all", ...LEADER_REGION_BUCKETS.map((b) => b.key)] as const).map((key) => {
            const label =
              key === "all"
                ? "All"
                : LEADER_REGION_BUCKETS.find((b) => b.key === key)?.label ?? key;
            const count =
              key === "all"
                ? allLeaders.length
                : byRegion[key as LeaderRegionBucketKey]?.length ?? 0;
            const disabled = key !== "all" && count === 0;
            const active = activeRegion === key;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={active}
                disabled={disabled}
                onClick={() => setActiveRegion(key as LeaderRegionBucketKey | "all")}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.14em] transition-all ${
                  active
                    ? "bg-cyan text-background shadow-[0_0_16px_rgba(0,200,200,0.35)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                } disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                {label}
                <span
                  className={`ml-1.5 tabular-nums ${active ? "text-background/70" : "text-muted-foreground/70"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <button
          onClick={toggleAll}
          disabled={allIds.length === 0}
          className="px-2.5 py-1 rounded-full text-[10.5px] font-mono uppercase tracking-[0.16em] border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {allExpanded ? "Collapse all" : "Expand all"}
        </button>
      </div>

      {populatedSections.length === 0 ? (
        <div className="px-4 py-6 rounded-xl border border-dashed border-border bg-background/30 text-center">
          <Radio className="w-4 h-4 animate-pulse text-cyan mx-auto mb-2" />
          <p className="text-[12px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
            Awaiting backend sync — no leaders ingested yet.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {visibleSections.map((bucket) => {

            const leaders = byRegion[bucket.key];
            if (leaders.length === 0) return null;
            const activeCount = leaders.filter((l) => l.status !== "waiting").length;
            return (
              <section key={bucket.key}>
                <div className="flex items-baseline justify-between mb-3">
                  <h3 className="text-base sm:text-lg font-display font-semibold text-foreground">
                    {bucket.label}
                  </h3>
                  <span className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                    Top {leaders.length} · {activeCount} active
                  </span>
                </div>
                <div className="space-y-2.5">
                  {leaders.map((l, i) => {
                    const id = `${bucket.key}:${l.name}-${l.rank}`;
                    if (l.status === "waiting") return <WaitingLeaderRow key={id} leader={l} />;
                    return (
                      <LeaderCard
                        key={id}
                        leader={l}
                        highlight={i === 0}
                        expanded={expanded.has(id)}
                        onToggle={() => toggle(id)}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {Array.isArray(row?.key_insights) && row!.key_insights!.length > 0 && (
        <div className="mt-6 rounded-xl border border-border/60 bg-background/40 p-4">
          <div className="flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-2">
            <Lightbulb className="w-3 h-3" /> Key insights
          </div>
          <ul className="space-y-1.5">
            {row!.key_insights!.slice(0, 6).map((s, i) => (
              <li key={i} className="text-[13px] text-foreground/85 leading-relaxed flex gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-cyan shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}



function PeaceCountryCard({
  c,
  expanded,
  onToggle,
}: {
  c: PeaceCountry;
  expanded: boolean;
  onToggle: () => void;
}) {
  const score = c.peace_health_score;
  const hex = scoreHex(score);
  const dims: Array<{ label: string; v?: number }> = [
    { label: "Citizen Normalization Support", v: c.citizen_normalization_support },
    { label: "Rejectionism Level", v: c.rejectionism_level },
    { label: "Government vs Public Gap", v: c.government_vs_public_gap },
    { label: "Pragmatism", v: c.pragmatism_score },
    { label: "Cynicism / Fatigue", v: c.cynicism_fatigue },
    { label: "US Policy Perception", v: c.us_policy_perception },
  ];
  return (
    <motion.div
      layout
      className="rounded-2xl border bg-card/40 overflow-hidden"
      style={{
        borderColor: score != null ? `${hex}55` : "hsl(var(--border) / 0.6)",
        boxShadow: score != null && score >= 65 ? `0 0 24px ${hex}22` : undefined,
      }}
    >
      <button
        onClick={onToggle}
        className="w-full text-left px-4 sm:px-5 py-4 hover:bg-card/70 transition-colors"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <FlagAvatar flag={c.flag} country={c.name} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base sm:text-lg font-display font-semibold text-foreground truncate">
                {c.name}
              </span>
              {c.momentum && <MomentumChip momentum={c.momentum} />}
            </div>
            {c.progress && (
              <div
                className="text-[10px] font-mono uppercase tracking-[0.16em] mt-0.5"
                style={{ color: progressHex(c.progress) }}
              >
                {c.progress}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span
              className="text-3xl sm:text-4xl font-display font-bold tabular-nums leading-none"
              style={{ color: hex, textShadow: `0 0 20px ${hex}66` }}
            >
              {score == null ? "—" : Math.round(score)}
            </span>
            <span
              className="mt-1 text-[9.5px] font-mono uppercase tracking-[0.16em]"
              style={{ color: hex }}
            >
              Peace Health
            </span>
          </div>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-1 text-muted-foreground"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.span>
        </div>

        {/* Gauges: Citizen Support + Gov-vs-Public divergence + mini peace-health timeline */}
        <div className="mt-4 flex items-center gap-4 sm:gap-6 flex-wrap">
          {typeof c.citizen_normalization_support === "number" && (
            <CircularGauge
              value={c.citizen_normalization_support}
              label="Citizen Support"
              size={68}
            />
          )}
          {typeof c.government_vs_public_gap === "number" && (
            <CircularGauge
              value={c.government_vs_public_gap}
              label="Gov ↔ Public Gap"
              size={68}
              invert
            />
          )}
          <div className="flex-1 min-w-[180px]">
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground mb-1.5">
              Peace-health checkpoint
            </div>
            <MiniTimeline score={score} hex={hex} />
          </div>
        </div>

      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-border/50 bg-background/30 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 pt-4">
                {dims
                  .filter((d) => typeof d.v === "number")
                  .map((d) =>
                    d.label === "Government vs Public Gap" ? (
                      <GapBar key={d.label} gap={d.v as number} />
                    ) : (
                      <DimensionBar key={d.label} label={d.label} value={d.v} />
                    ),
                  )}
              </div>

              {c.dominant_narrative && (
                <div className="rounded-xl border border-border/60 bg-background/40 p-3.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                    <Quote className="w-3 h-3" /> Dominant narrative
                  </div>
                  <p className="text-[13px] text-foreground/85 leading-relaxed">
                    {c.dominant_narrative}
                  </p>
                </div>
              )}

              {Array.isArray(c.key_signals) && c.key_signals.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-2 inline-flex items-center gap-1.5">
                    <Activity className="w-3 h-3" /> Key signals
                  </div>
                  <ul className="space-y-1.5">
                    {c.key_signals.map((s, i) => (
                      <li
                        key={i}
                        className="text-[13px] text-foreground/85 leading-relaxed flex gap-2"
                      >
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-cyan shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {c.honest_assessment && (
                <div
                  className="rounded-xl border p-4"
                  style={{ borderColor: "#FF572255", background: "#FF57220D" }}
                >
                  <div
                    className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.18em] mb-2"
                    style={{ color: "#FF5722" }}
                  >
                    <MessageSquareQuote className="w-3 h-3" /> Honest assessment
                  </div>
                  <p className="text-[14px] text-foreground leading-relaxed font-medium">
                    {c.honest_assessment}
                  </p>
                </div>
              )}

              {c.summary && !c.honest_assessment && (
                <p className="text-[13px] text-foreground/80 leading-relaxed">{c.summary}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PeaceDetail({ row }: { row?: TrackerRow }) {
  const countries = useMemo(() => extractPeaceCountries(row), [row]);
  const data = (row?.data ?? {}) as Record<string, unknown>;
  const asArr = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);
  const regional =
    (data.overall_regional_assessment as string) ||
    (data.citizen_perspective as string) ||
    "";
  const insights = asArr(data.key_insights).length
    ? asArr(data.key_insights)
    : asArr(row?.key_insights);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const grouped = useMemo(() => {
    const out: Record<string, PeaceCountry[]> = {};
    for (const b of PEACE_BUCKETS) out[b.key] = [];
    out.other = [];
    for (const c of countries) {
      const k = bucketForCountry(c);
      out[k].push(c);
    }
    // sort within bucket by peace_health_score desc
    for (const k of Object.keys(out)) {
      out[k].sort((a, b) => (b.peace_health_score ?? -1) - (a.peace_health_score ?? -1));
    }
    return out;
  }, [countries]);

  return (
    <div>
      {/* Diagnostic overview */}
      {(regional || insights.length > 0) && (
        <div className="mb-6 rounded-2xl border border-cyan/30 bg-cyan/5 p-4 sm:p-5">
          <div className="flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-[0.2em] text-cyan mb-2">
            <Activity className="w-3 h-3" /> Regional assessment
          </div>
          {regional && (
            <p className="text-sm text-foreground/90 leading-relaxed mb-3">{regional}</p>
          )}
          {insights.length > 0 && (
            <ul className="space-y-1.5">
              {insights.slice(0, 5).map((s, i) => (
                <li
                  key={i}
                  className="text-[13px] text-foreground/85 leading-relaxed flex gap-2"
                >
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-cyan shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {countries.length === 0 ? (
        <div className="px-4 py-6 rounded-xl border border-dashed border-border bg-background/30 text-center">
          <Radio className="w-4 h-4 animate-pulse text-cyan mx-auto mb-2" />
          <p className="text-[12px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
            Awaiting backend sync — no countries ingested yet.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {PEACE_BUCKETS.map((bucket) => {
            const list = grouped[bucket.key];
            if (!list || list.length === 0) return null;
            return (
              <section key={bucket.key}>
                <div className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
                  <div>
                    <h3 className="text-base sm:text-lg font-display font-semibold text-foreground">
                      {bucket.label}
                    </h3>
                    <p className="text-[11.5px] font-mono uppercase tracking-[0.16em] text-muted-foreground mt-0.5">
                      {bucket.blurb}
                    </p>
                  </div>
                  <span className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                    {list.length} {list.length === 1 ? "country" : "countries"}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {list.map((c) => {
                    const id = `${bucket.key}-${c.key || c.name}`;
                    return (
                      <PeaceCountryCard
                        key={id}
                        c={c}
                        expanded={expanded.has(id)}
                        onToggle={() => toggle(id)}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
          {grouped.other && grouped.other.length > 0 && (
            <section>
              <div className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
                <h3 className="text-base sm:text-lg font-display font-semibold text-foreground">
                  Other tracked
                </h3>
                <span className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                  {grouped.other.length} countries
                </span>
              </div>
              <div className="space-y-2.5">
                {grouped.other.map((c) => {
                  const id = `other-${c.key || c.name}`;
                  return (
                    <PeaceCountryCard
                      key={id}
                      c={c}
                      expanded={expanded.has(id)}
                      onToggle={() => toggle(id)}
                    />
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- Media Trust Index ---------------- */

const MEDIA_ACCENT = "#8B5CF6"; // violet

function FootballOverviewCard({
  def,
  row,
}: {
  def: TrackerDefinition;
  row?: TrackerRow;
}) {
  const players = useMemo(() => extractFootballPlayers(row), [row]);
  const top = players.filter((p) => p.status !== "waiting").slice(0, 3);
  const snapshotDate = formatDate(row?.created_at);

  return (
    <Link
      to="/trackers/football"
      className="tracker-card group text-left w-full rounded-2xl border border-border/60 hover:border-emerald-signal/45 hover:shadow-[0_28px_64px_-28px_rgba(16,185,129,0.35)] overflow-hidden block cursor-pointer"
    >
      <div className="tracker-shimmer absolute top-0 left-0 right-0 h-px opacity-50 pointer-events-none" />
      <div className="relative p-5 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-signal" />
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-emerald-signal/40 bg-emerald-signal/10 text-emerald-signal text-[10px] font-mono uppercase tracking-[0.16em]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-signal animate-pulse" />
              Player Index
            </span>
          </div>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-signal transition-colors" />
        </div>
        <h3 className="text-xl md:text-2xl font-display font-semibold leading-tight group-hover:text-emerald-signal/95 transition-colors">
          {def.title}
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed line-clamp-2">{def.tagline}</p>
        {top.length > 0 ? (
          <div className="mt-5 space-y-2">
            <div className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Top fan discourse
            </div>
            {top.map((p, i) => (
              <TrackerOverviewRow key={p.player_name} index={i} score={p.sentiment_score}>
                <div className="flex items-center gap-3 min-w-0">
                  <RankBadge rank={p.rank ?? i + 1} highlight={i === 0} />
                  <div className="min-w-0">
                    <div className="text-sm font-display font-semibold truncate">{p.player_name}</div>
                    <div className="text-[10px] font-mono text-muted-foreground truncate">
                      {p.fan_takeaway ?? p.team ?? ""}
                    </div>
                  </div>
                </div>
              </TrackerOverviewRow>
            ))}
          </div>
        ) : (
          <div className="mt-5 px-3 py-3 rounded-lg border border-dashed border-border text-[12px] font-mono text-muted-foreground">
            Awaiting football_player_index sync
          </div>
        )}
        <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-4 text-[10.5px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
          <span>{snapshotDate ?? "—"}</span>
          <span className="text-emerald-signal group-hover:gap-2 inline-flex items-center gap-1 transition-all">
            Open index <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function MediaTrustOverviewCard({
  def,
  row,
}: {
  def: TrackerDefinition;
  row?: TrackerRow;
}) {
  const media = useMemo(() => extractMediaTrust(row), [row]);
  const overall = media.overall_score;
  

  // Top 3 outlets across all regions by trust_score
  const topOutlets = useMemo(() => {
    const all: MediaOutlet[] = [];
    for (const b of MEDIA_REGION_BUCKETS) {
      const list = media.regions?.[b.key]?.outlets ?? [];
      for (const o of list) all.push({ ...o, region: o.region ?? b.label });
    }
    return all
      .filter((o) => typeof o.trust_score === "number")
      .sort((a, b) => (b.trust_score ?? -1) - (a.trust_score ?? -1))
      .slice(0, 3);
  }, [media]);

  const snapshotDate = formatDate(media.snapshot_date ?? row?.created_at);
  const outletCount = useMemo(() => {
    let n = 0;
    for (const b of MEDIA_REGION_BUCKETS) n += media.regions?.[b.key]?.outlets?.length ?? 0;
    return n;
  }, [media]);

  return (
    <Link
      to="/trackers/media"
      style={TRACKER_CARD_VIOLET}
      className="tracker-card group text-left w-full rounded-2xl border border-border/60 hover:border-violet-500/45 hover:shadow-[0_28px_64px_-28px_rgba(139,92,246,0.42)] overflow-hidden block cursor-pointer"
    >
      <div
        className="tracker-shimmer absolute top-0 left-0 right-0 h-px opacity-50 pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent, ${MEDIA_ACCENT}88, transparent)` }}
      />
      <div className="relative p-5 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4" style={{ color: MEDIA_ACCENT }} />
            <LivePulseBadge label="Media Trust" accent="violet" />
          </div>
          <ArrowUpRight
            className="w-4 h-4 text-muted-foreground group-hover:text-violet-400 transition-colors"
          />
        </div>
        <h3
          className="text-xl md:text-2xl font-display font-semibold text-foreground leading-tight transition-colors duration-300 group-hover:text-violet-300/95"
        >
          {def.title}
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed line-clamp-2">
          Which outlets do citizens actually trust — and which say one thing in English, another
          in their local language?
        </p>

        {typeof overall === "number" ? (
          <div className="mt-5 flex items-center gap-4 sm:gap-5">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            >
              <CircularGauge value={overall} label="Overall Trust" size={80} />
            </motion.div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-2">
                <Newspaper className="w-3 h-3 opacity-60" style={{ color: MEDIA_ACCENT }} />
                Most trusted outlets
              </div>
              {topOutlets.length > 0 ? (
                topOutlets.map((o, i) => (
                  <TrackerOverviewRow key={`${o.name}-${i}`} index={i} score={o.trust_score}>
                    <div className="flex items-center gap-2 min-w-0">
                      <RankBadge rank={i + 1} highlight={i === 0} />
                      <span className="text-[13px] font-display font-semibold text-foreground truncate">
                        {o.name}
                      </span>
                    </div>
                    <ScorePill value={o.trust_score} size="sm" />
                  </TrackerOverviewRow>
                ))
              ) : (
                <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                  Outlet rankings syncing…
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-5 px-3 py-3 rounded-lg border border-dashed border-border bg-background/30 text-[12px] font-mono uppercase tracking-[0.16em] text-muted-foreground inline-flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" /> Awaiting backend sync
          </div>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-4">
          <span className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
            {outletCount > 0 ? `${outletCount} outlets tracked` : "—"}
            {snapshotDate ? ` · ${snapshotDate}` : ""}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-[0.16em] text-violet-400 group-hover:gap-2.5 transition-all duration-300">
            Open index
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function MediaOutletCard({
  outlet,
  rank,
  highlight,
  expanded,
  onToggle,
}: {
  outlet: MediaOutlet;
  rank: number;
  highlight?: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const hex = scoreHex(outlet.trust_score);
  return (
    <motion.div
      layout
      className="rounded-2xl border bg-card/40 overflow-hidden"
      style={{
        borderColor: highlight ? `${hex}66` : "hsl(var(--border) / 0.6)",
        boxShadow: highlight ? `0 0 24px ${hex}22` : undefined,
      }}
    >
      <button
        onClick={onToggle}
        className="w-full text-left px-4 sm:px-5 py-3.5 flex items-center gap-3 sm:gap-4 hover:bg-card/70 transition-colors"
      >
        <RankBadge rank={rank} highlight={highlight} />
        {(outlet.flag || outlet.country) && (
          <FlagAvatar flag={outlet.flag ?? undefined} country={outlet.country ?? undefined} size="sm" />
        )}
        <div className="min-w-0 flex-1">
          <div className="text-sm sm:text-[15px] font-display font-semibold text-foreground truncate leading-tight">
            {outlet.name}
          </div>
          <div className="text-[10.5px] font-mono uppercase tracking-[0.14em] text-muted-foreground truncate">
            {[outlet.country, outlet.language, outlet.bias].filter(Boolean).join(" · ") || "—"}
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <ScorePill value={outlet.trust_score} size="md" />
          <span
            className="hidden sm:block mt-1 text-[9.5px] font-mono uppercase tracking-[0.16em]"
            style={{ color: hex }}
          >
            {scoreLabel(outlet.trust_score)}
          </span>
        </div>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-1 text-muted-foreground"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-5 pt-3 border-t border-border/50 bg-background/30 space-y-3">
              {outlet.summary && (
                <p className="text-[13px] text-foreground/85 leading-relaxed">{outlet.summary}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3">
                {typeof outlet.divergence === "number" && (
                  <GapBar gap={outlet.divergence} />
                )}
                {typeof outlet.official_alignment === "number" && (
                  <DimensionBar label="Official Alignment" value={outlet.official_alignment} />
                )}
              </div>
              {Array.isArray(outlet.key_signals) && outlet.key_signals.length > 0 && (
                <ul className="space-y-1.5">
                  {outlet.key_signals.map((s, i) => (
                    <li key={i} className="text-[13px] text-foreground/85 leading-relaxed flex gap-2">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-violet-400 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              )}
              {typeof outlet.posts_analyzed === "number" && (
                <div className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                  Based on {outlet.posts_analyzed.toLocaleString()} posts analyzed
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LanguageDiscrepancyRow({ d }: { d: MediaLanguageDiscrepancy }) {
  const [open, setOpen] = useState(false);
  const disc = typeof d.discrepancy_score === "number" ? Math.max(0, Math.min(100, d.discrepancy_score)) : null;
  const hex = disc == null ? "#6B7280" : disc >= 50 ? "#FF1744" : disc >= 25 ? "#FFAB00" : "#00C853";
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: disc != null ? `${hex}55` : "hsl(var(--border) / 0.6)" }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-card/60 transition-colors"
      >
        <Languages className="w-4 h-4 shrink-0" style={{ color: hex }} />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-display font-semibold text-foreground truncate">
            {d.outlet}
            {d.local_language && (
              <span className="ml-2 text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
                EN ↔ {d.local_language}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-[10.5px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
            <span>
              EN{" "}
              <span className="tabular-nums" style={{ color: scoreHex(d.english_score) }}>
                {d.english_score == null ? "—" : Math.round(d.english_score)}
              </span>
            </span>
            <span>
              Local{" "}
              <span className="tabular-nums" style={{ color: scoreHex(d.local_score) }}>
                {d.local_score == null ? "—" : Math.round(d.local_score)}
              </span>
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span
            className="text-lg font-display font-bold tabular-nums leading-none"
            style={{ color: hex, textShadow: `0 0 12px ${hex}66` }}
          >
            {disc == null ? "—" : Math.round(disc)}
          </span>
          <span className="mt-0.5 text-[9px] font-mono uppercase tracking-[0.16em]" style={{ color: hex }}>
            Discrepancy
          </span>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-1 text-muted-foreground"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-border/50 bg-background/30 space-y-2">
              {d.note && <p className="text-[13px] text-foreground/85 leading-relaxed">{d.note}</p>}
              {Array.isArray(d.examples) && d.examples.length > 0 && (
                <ul className="space-y-1.5">
                  {d.examples.map((ex, i) => (
                    <li key={i} className="text-[12.5px] text-foreground/80 leading-relaxed flex gap-2">
                      <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: hex }} />
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MediaTrustDetail({ row }: { row?: TrackerRow }) {
  const media = useMemo(() => extractMediaTrust(row), [row]);
  const [activeRegion, setActiveRegion] = useState<MediaRegionKey | "all">("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const populated = MEDIA_REGION_BUCKETS.filter(
    (b) => (media.regions?.[b.key]?.outlets?.length ?? 0) > 0,
  );
  const visible = activeRegion === "all" ? populated : populated.filter((b) => b.key === activeRegion);

  const totalOutlets = useMemo(() => {
    let n = 0;
    for (const b of MEDIA_REGION_BUCKETS) n += media.regions?.[b.key]?.outlets?.length ?? 0;
    return n;
  }, [media]);

  const overall = media.overall_score;
  const posts = media.posts_analyzed;
  const smallSample = typeof posts === "number" && posts > 0 && posts < 200;

  const hasAnyData =
    typeof overall === "number" ||
    totalOutlets > 0 ||
    (media.language_discrepancies?.length ?? 0) > 0 ||
    (media.key_insights?.length ?? 0) > 0 ||
    !!media.citizen_perspective ||
    !!media.honest_assessment;

  if (!hasAnyData) {
    return (
      <div className="px-4 py-8 rounded-xl border border-dashed border-border bg-background/30 text-center">
        <Radio className="w-4 h-4 animate-pulse mx-auto mb-2" style={{ color: MEDIA_ACCENT }} />
        <p className="text-[12px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
          Awaiting backend sync — no media trust snapshot ingested yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header strip: overall gauge + posts + snapshot */}
      <div className="rounded-2xl border border-border/60 bg-card/40 p-5 flex flex-col sm:flex-row items-center gap-5">
        <CircularGauge value={overall} label="Overall Media Trust" size={104} />
        <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
          {media.citizen_perspective && (
            <p className="text-sm text-foreground/90 leading-relaxed">{media.citizen_perspective}</p>
          )}
          <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start text-[10.5px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
            {typeof posts === "number" && <span>{posts.toLocaleString()} posts analyzed</span>}
            {media.snapshot_date && <span>· {formatDate(media.snapshot_date)}</span>}
            {totalOutlets > 0 && <span>· {totalOutlets} outlets</span>}
          </div>
        </div>
      </div>

      {smallSample && (
        <div
          className="rounded-xl border p-3 flex items-center gap-2 text-[12px]"
          style={{ borderColor: "#FFAB0055", background: "#FFAB000D", color: "#FFAB00" }}
        >
          <AlertTriangle className="w-4 h-4" />
          <span className="font-mono uppercase tracking-[0.14em]">
            Small sample ({posts?.toLocaleString()} posts) — treat as directional.
          </span>
        </div>
      )}

      {/* Region tabs */}
      {populated.length > 0 && (
        <div
          role="tablist"
          aria-label="Filter media outlets by region"
          className="inline-flex items-center gap-1 p-1 rounded-full border border-border/60 bg-background/40 overflow-x-auto max-w-full"
        >
          {(["all", ...MEDIA_REGION_BUCKETS.map((b) => b.key)] as const).map((key) => {
            const label =
              key === "all"
                ? "All"
                : MEDIA_REGION_BUCKETS.find((b) => b.key === key)?.label ?? key;
            const count =
              key === "all"
                ? totalOutlets
                : media.regions?.[key as MediaRegionKey]?.outlets?.length ?? 0;
            const active = activeRegion === key;
            const disabled = key !== "all" && count === 0;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={active}
                disabled={disabled}
                onClick={() => setActiveRegion(key as MediaRegionKey | "all")}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.14em] transition-all ${
                  active
                    ? "text-background shadow-[0_0_16px_rgba(139,92,246,0.35)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                } disabled:opacity-30 disabled:cursor-not-allowed`}
                style={active ? { background: MEDIA_ACCENT } : undefined}
              >
                {label}
                <span
                  className={`ml-1.5 tabular-nums ${active ? "text-background/70" : "text-muted-foreground/70"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Regions */}
      {visible.length === 0 ? (
        <div className="px-4 py-6 rounded-xl border border-dashed border-border bg-background/30 text-center">
          <Radio className="w-4 h-4 animate-pulse mx-auto mb-2" style={{ color: MEDIA_ACCENT }} />
          <p className="text-[12px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
            No outlets ingested for this region yet.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {visible.map((bucket) => {
            const region = media.regions?.[bucket.key];
            const outlets = (region?.outlets ?? [])
              .slice()
              .sort((a, b) => (b.trust_score ?? -1) - (a.trust_score ?? -1))
              .slice(0, 5);
            return (
              <section key={bucket.key}>
                <div className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
                  <div>
                    <h3 className="text-base sm:text-lg font-display font-semibold text-foreground">
                      {bucket.label}
                    </h3>
                    {region?.summary && (
                      <p className="text-[12px] text-muted-foreground mt-0.5 max-w-2xl leading-relaxed">
                        {region.summary}
                      </p>
                    )}
                  </div>
                  {typeof region?.average_trust === "number" && (
                    <ScorePill value={region.average_trust} size="sm" />
                  )}
                </div>
                <div className="space-y-2.5">
                  {outlets.map((o, i) => {
                    const id = `${bucket.key}-${o.name}-${i}`;
                    return (
                      <MediaOutletCard
                        key={id}
                        outlet={o}
                        rank={i + 1}
                        highlight={i === 0}
                        expanded={expanded.has(id)}
                        onToggle={() => toggle(id)}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Language discrepancies */}
      {Array.isArray(media.language_discrepancies) && media.language_discrepancies.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Languages className="w-4 h-4" style={{ color: MEDIA_ACCENT }} />
            <h3 className="text-base sm:text-lg font-display font-semibold text-foreground">
              Language Discrepancies
            </h3>
            <span className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
              English vs. local-language framing
            </span>
          </div>
          <div className="space-y-2.5">
            {media.language_discrepancies.map((d, i) => (
              <LanguageDiscrepancyRow key={`${d.outlet}-${i}`} d={d} />
            ))}
          </div>
        </section>
      )}

      {/* Key insights */}
      {Array.isArray(media.key_insights) && media.key_insights.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-background/40 p-4">
          <div className="flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-2">
            <Lightbulb className="w-3 h-3" /> Key insights
          </div>
          <div className="flex flex-wrap gap-2">
            {media.key_insights.map((s, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-full text-[12px] leading-snug"
                style={{
                  background: `${MEDIA_ACCENT}14`,
                  color: "hsl(var(--foreground) / 0.9)",
                  boxShadow: `inset 0 0 0 1px ${MEDIA_ACCENT}44`,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Honest assessment */}
      {media.honest_assessment && (
        <div
          className="rounded-xl border p-4"
          style={{ borderColor: "#FF572255", background: "#FF57220D" }}
        >
          <div
            className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.18em] mb-2"
            style={{ color: "#FF5722" }}
          >
            <MessageSquareQuote className="w-3 h-3" /> Honest assessment
          </div>
          <p className="text-[14px] text-foreground leading-relaxed font-medium">
            {media.honest_assessment}
          </p>
        </div>
      )}
    </div>
  );
}

/* ---------------- Page ---------------- */

function TrackersPage() {
  const [rows, setRows] = useState<TrackerRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState(() => new Date());

  useEffect(() => {
    fetchLatestTrackers().then((r) => {
      setRows(r);
      setLoaded(true);
      setRefreshedAt(new Date());
    });
  }, []);

  const sourceUpdatedAt = useMemo(() => {
    const stamps = rows.map((r) => r.last_updated).filter((v): v is string => !!v);
    return stamps.sort().reverse()[0] ?? null;
  }, [rows]);

  const handleRefresh = async () => {
    const r = await fetchLatestTrackers();
    setRows(r);
    setRefreshedAt(new Date());
  };

  const byType = useMemo(() => {
    const m = new Map<string, TrackerRow>();
    for (const r of rows) if (!m.has(r.tracker_type)) m.set(r.tracker_type, r);
    return m;
  }, [rows]);

  const live = TRACKER_CATALOG.filter((t) => t.status === "live");
  const upcoming = TRACKER_CATALOG.filter((t) => t.status === "coming_soon");

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-10 lg:py-14 mobile-safe-bottom overflow-x-clip">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8 sm:mb-10 lg:mb-14 max-w-5xl space-y-3"
        >
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.28em] text-cyan"
          >
            <motion.span
              animate={{ scaleY: [1, 0.4, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-3.5 bg-cyan rounded-sm origin-center"
              style={{ boxShadow: "0 0 10px rgba(0,220,220,0.7)" }}
            />
            Performance Trackers
          </motion.div>
          <h1 className="text-[1.6rem] sm:text-3xl md:text-[2.4rem] lg:text-[2.85rem] font-display font-semibold tracking-tight leading-[1.08] break-words">
            Citizens Speak. AI Ranks.{" "}
            <span className="text-cyan bg-gradient-to-r from-cyan via-cyan/80 to-cyan/60 bg-clip-text text-transparent">
              No Official Spin.
            </span>
          </h1>
          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
            Rankings and performance scores for leaders, peace efforts, immigration, crime, and more — based purely on real citizen discourse on X.
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-3">
            <SimulatedDataBadge />
            <DataFreshnessBar
              sourceUpdatedAt={sourceUpdatedAt}
              refreshedAt={refreshedAt}
              onRefresh={handleRefresh}
            />
          </div>
        </motion.header>

        <h2 className="sr-only">Live trackers</h2>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
          {live.map((def, idx) => {
            const row = byType.get(def.tracker_type);
            const inner =
              def.tracker_type === "global_leader_trust" ? (
                <LeaderOverviewCard def={def} row={row} href="/trackers/leaders" />
              ) : def.tracker_type === "peace_normalization" ? (
                <PeaceOverviewCard def={def} row={row} href="/trackers/peace" />
              ) : def.tracker_type === "media_trust" ? (
                <MediaTrustOverviewCard def={def} row={row} />
              ) : def.tracker_type === "football_player_index" ? (
                <FootballOverviewCard def={def} row={row} />
              ) : null;
            if (!inner) return null;
            return (
              <motion.div
                key={def.key}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.08, duration: 0.55, ease: "easeOut" }}
              >
                {inner}
              </motion.div>
            );
          })}
        </section>

        <div className="mt-10 mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border/60" />
          <span className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
            On the roadmap
          </span>
          <div className="h-px flex-1 bg-border/60" />
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {upcoming.map((def, i) => (
            <motion.div
              key={def.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.06, duration: 0.5, ease: "easeOut" }}
            >
              <ComingSoonOverviewCard def={def} index={i} />
            </motion.div>
          ))}
        </section>


        {loaded && rows.length === 0 && (
          <p className="mt-8 text-xs font-mono uppercase tracking-[0.16em] text-muted-foreground text-center">
            Backend sync pending — tracker rows will appear here automatically.
          </p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

/* ---------------- Shared exports for full-page detail routes ---------------- */

export { LeaderboardDetail, PeaceDetail, MediaTrustDetail, formatDate };
