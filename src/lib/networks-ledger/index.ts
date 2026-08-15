import raw from "./data.json";
import type {
  ActionType,
  LedgerEntry,
  LinkedActor,
  LinkedActorKind,
  NetworkTag,
  NetworksLedgerData,
  RegionFocus,
} from "./types";

export type {
  ActionType,
  CountryCode,
  LedgerEntry,
  LedgerLocation,
  LedgerSource,
  LinkedActor,
  LinkedActorKind,
  LinkedActorRole,
  NetworkTag,
  NetworksLedgerData,
  RegionFocus,
} from "./types";

export const NETWORKS_LEDGER_DISCLAIMER =
  (raw as NetworksLedgerData).meta.disclaimer;

export const NETWORKS_LEDGER_DATA = raw as NetworksLedgerData;

export const ALL_ENTRIES: LedgerEntry[] = NETWORKS_LEDGER_DATA.entries;

export const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  designation: "Designation",
  arrest: "Arrest",
  charges: "Charges / Case",
  asset_freeze: "Asset freeze / block",
  forfeiture: "Forfeiture",
  joint_action: "Joint action (TFTC/multilateral)",
};

export const NETWORK_OPTIONS: NetworkTag[] = [
  "IRGC",
  "Hezbollah",
  "Muslim Brotherhood",
  "Hamas",
  "Mixed / Axis",
];

export const REGION_OPTIONS: { value: RegionFocus | "all"; label: string }[] = [
  { value: "all", label: "All regions" },
  { value: "US", label: "United States" },
  { value: "Gulf", label: "Gulf / TFTC" },
  { value: "Europe", label: "Europe" },
  { value: "Lebanon", label: "Lebanon" },
  { value: "Africa", label: "Africa" },
  { value: "Other", label: "Other" },
];

export const LINKED_KIND_LABELS: Record<LinkedActorKind, string> = {
  organization: "Organization",
  country: "Country",
  institution: "Institution",
  ngo: "NGO",
  person: "Person",
  company: "Company",
};

/** Marker colors by primary network tag */
export const NETWORK_MARKER_COLORS: Record<NetworkTag, string> = {
  IRGC: "#f43f5e",
  Hezbollah: "#f59e0b",
  "Muslim Brotherhood": "#22d3ee",
  Hamas: "#a78bfa",
  "Mixed / Axis": "#94a3b8",
};

const SINCE_2025 = "2025-01-01";

export function computeMetrics(entries: LedgerEntry[] = ALL_ENTRIES) {
  const designations = entries.filter(
    (e) => e.type === "designation" || e.type === "joint_action",
  ).length;
  const arrestsCharges = entries.filter(
    (e) => e.type === "arrest" || e.type === "charges",
  ).length;
  const quantified = entries
    .filter((e) => typeof e.amountUsd === "number" && e.amountUsd > 0)
    .reduce((sum, e) => sum + (e.amountUsd ?? 0), 0);
  const seenAmounts = new Set<string>();
  let quantifiedUnique = 0;
  for (const e of entries) {
    if (!e.amountUsd || e.amountUsd <= 0) continue;
    const key = `${e.amountUsd}|${e.title.slice(0, 40)}`;
    const packageKey =
      e.id.includes("hamieh") && e.amountUsd === 100_000_000
        ? "hamieh-100m"
        : key;
    if (seenAmounts.has(packageKey)) continue;
    seenAmounts.add(packageKey);
    quantifiedUnique += e.amountUsd;
  }
  const since2025 = entries.filter((e) => e.date >= SINCE_2025).length;

  return {
    totalDesignations: designations,
    totalArrestsCharges: arrestsCharges,
    quantifiedFundsUsd: quantifiedUnique || quantified,
    actionsSince2025: since2025,
    totalEntries: entries.length,
  };
}

export function flagshipEntries(entries: LedgerEntry[] = ALL_ENTRIES): LedgerEntry[] {
  return entries
    .filter((e) => e.flagship)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function formatUsd(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

export function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function filterEntries(
  entries: LedgerEntry[],
  opts: {
    q?: string;
    network?: string;
    type?: string;
    country?: string;
    region?: string;
  },
): LedgerEntry[] {
  const q = (opts.q ?? "").trim().toLowerCase();
  return entries
    .filter((e) => {
      if (opts.network && opts.network !== "all") {
        if (!e.networks.includes(opts.network as NetworkTag)) return false;
      }
      if (opts.type && opts.type !== "all") {
        if (e.type !== opts.type) return false;
      }
      if (opts.country && opts.country !== "all") {
        if (e.location.country !== opts.country) return false;
      }
      if (opts.region && opts.region !== "all") {
        if (!e.regionFocus.includes(opts.region as RegionFocus)) return false;
      }
      if (!q) return true;
      const linked = (e.linkedActors ?? [])
        .map((a) => `${a.name} ${a.relation} ${a.kind} ${a.role}`)
        .join(" ");
      const hay = [
        e.title,
        e.summary,
        e.entities.join(" "),
        e.networks.join(" "),
        e.location.label,
        e.source.agency,
        e.id,
        linked,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}

/** Collapse map pins by rounded lat/lng so click shows stacked actions. */
export function groupEntriesByLocation(entries: LedgerEntry[]) {
  const map = new Map<
    string,
    { lat: number; lng: number; label: string; entries: LedgerEntry[]; primaryNetwork: NetworkTag }
  >();
  for (const e of entries) {
    const key = `${e.location.lat.toFixed(2)},${e.location.lng.toFixed(2)}`;
    const existing = map.get(key);
    if (existing) {
      existing.entries.push(e);
    } else {
      map.set(key, {
        lat: e.location.lat,
        lng: e.location.lng,
        label: e.location.label,
        entries: [e],
        primaryNetwork: e.networks[0] ?? "Mixed / Axis",
      });
    }
  }
  return [...map.values()];
}

export function primaryNetwork(entry: LedgerEntry): NetworkTag {
  return entry.networks[0] ?? "Mixed / Axis";
}

export function linkedActorsOf(entry: LedgerEntry): LinkedActor[] {
  return entry.linkedActors ?? [];
}
