/**
 * Terror & Finance Networks — public module.
 * Privacy rule: this module must never export individual or organisational names.
 * Named curation (if any) lives only under archive/ and must not be imported by routes.
 */
import raw from "./public-data.json";
import type {
  CountSlice,
  OfficialSource,
  TerrorFinancePublicData,
} from "./types";

export type {
  ActionTypeBucket,
  CountSlice,
  Observation,
  OfficialSource,
  SeriesPoint,
  SourceKind,
  TerrorFinanceMetrics,
  TerrorFinancePublicData,
} from "./types";

export const TERROR_FINANCE_DATA = raw as TerrorFinancePublicData;

export const TERROR_FINANCE_META = TERROR_FINANCE_DATA.meta;

export const TERROR_FINANCE_METRICS = TERROR_FINANCE_DATA.metrics;

export const TERROR_FINANCE_SOURCES: OfficialSource[] =
  TERROR_FINANCE_DATA.sources;

export const TERROR_FINANCE_OBSERVATIONS = TERROR_FINANCE_DATA.observations;

/** @deprecated Use TERROR_FINANCE_META.privacyCore */
export const NETWORKS_LEDGER_DISCLAIMER = TERROR_FINANCE_META.privacyCore;

export function formatUsdApprox(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1_000_000_000) return `~$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `~$${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `~$${(n / 1_000).toFixed(0)}K`;
  return `~$${n.toLocaleString()}`;
}

export function formatMonthLabel(ym: string): string {
  const [y, m] = ym.split("-");
  const d = new Date(Date.UTC(Number(y), Number(m) - 1, 1));
  if (Number.isNaN(d.getTime())) return ym;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function sortedSlices(slices: CountSlice[]): CountSlice[] {
  return [...slices].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function maxCount(slices: CountSlice[]): number {
  return Math.max(1, ...slices.map((s) => s.count));
}
