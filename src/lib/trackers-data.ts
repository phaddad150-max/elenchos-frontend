// Fetches the latest tracker rows from the external Supabase `latest_trackers` view.
// All processing/updates happen in the backend (trackers.py). The UI renders
// strictly from what the database returns.

const SUPABASE_URL = "https://jacbalsongvqvaqlfsbx.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphY2JhbHNvbmd2cXZhcWxmc2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NDg1MjgsImV4cCI6MjA5NTEyNDUyOH0.NZI55Xy8KpqQHdPfQohojnnc-GDef0L8dKQ2oOYI1EU";

export const LEADER_DIMENSIONS = [
  { key: "trust", label: "Trust" },
  { key: "leadership", label: "Leadership" },
  { key: "corruption", label: "Corruption" },
  { key: "economic_performance", label: "Economy" },
  { key: "security_stability", label: "Security" },
  { key: "freedom_speech", label: "Free Speech" },
  { key: "global_influence", label: "Global Influence" },
  { key: "pragmatism_ideology", label: "Pragmatism" },
  { key: "youth_appeal", label: "Youth Appeal" },
  { key: "transparency", label: "Transparency" },
] as const;

export type LeaderDimensionKey = (typeof LEADER_DIMENSIONS)[number]["key"];

export type RankedLeader = {
  rank?: number;
  name: string;
  flag?: string;
  country?: string;
  region?: string;
  overall_score?: number | null;
  divergence?: number;
  official_approval?: number;
  summary?: string;
  posts_analyzed?: number;
  dimensions?: Partial<Record<LeaderDimensionKey, number>>;
  status?: "active" | "waiting" | string;
  message?: string;
  // legacy fallback fields
  popularity?: number;
  positive_x?: number;
  negative_x?: number;
};


export type PeaceMomentum = "Advancing" | "Stagnant" | "Regressing" | string;

export type PeaceCountry = {
  rank?: number;
  name: string;
  key?: string;
  flag?: string;
  region?: string;
  progress?: string;
  // Legacy fields (current backend shape)
  peace_support?: number;
  normalization_depth?: number;
  citizen_support?: number;
  strategic_alignment?: number;
  pragmatism_vs_ideology?: number;
  antisemitism_rejectionism?: number;
  see_through_show?: number;
  divergence?: number;
  summary?: string;
  // New diagnostic shape (data.countries from backend)
  peace_health_score?: number;
  citizen_normalization_support?: number;
  rejectionism_level?: number;
  government_vs_public_gap?: number;
  pragmatism_score?: number;
  cynicism_fatigue?: number;
  us_policy_perception?: number;
  momentum?: PeaceMomentum;
  dominant_narrative?: string;
  key_signals?: string[];
  honest_assessment?: string;
};

// Three diagnostic buckets for the peace index.
export const PEACE_BUCKETS = [
  {
    key: "accords",
    label: "Abraham Accords Countries",
    blurb: "Signed normalization since 2020.",
    members: ["uae", "bahrain", "morocco"],
  },
  {
    key: "treaty",
    label: "Traditional Peace Treaty Countries",
    blurb: "Cold peace via formal state treaties.",
    members: ["egypt", "jordan"],
  },
  {
    key: "next_wave",
    label: "Potential / Next Wave",
    blurb: "On the diplomatic horizon — or stalled.",
    members: ["saudi", "saudi_arabia", "lebanon", "oman", "qatar"],
  },
] as const;

export type PeaceBucketKey = (typeof PEACE_BUCKETS)[number]["key"];

export function bucketForCountry(c: PeaceCountry): PeaceBucketKey | "other" {
  const slug = (c.key || c.name || "").toLowerCase().replace(/\s+/g, "_");
  for (const b of PEACE_BUCKETS) {
    if ((b.members as readonly string[]).some((m) => slug.includes(m))) return b.key;
  }
  return "other";
}

export type FootballPlayerEntry = {
  rank?: number;
  player_name: string;
  nationality?: string;
  team?: string;
  still_in_competition?: boolean;
  sentiment_score?: number | null;
  sentiment_label?: string;
  mention_salience?: number | null;
  trend?: "rising" | "falling" | "stable" | string;
  fan_takeaway?: string;
  evidence?: string[];
  experience_tags?: string[];
  status?: "active" | "waiting" | "eliminated" | string;
};

export type FootballPlayerIndexData = {
  players?: FootballPlayerEntry[];
  teams_eliminated?: string[];
  golden_boot_race_summary?: string;
  key_insights?: string[];
  posts_analyzed?: number;
  snapshot_date?: string;
};

function normalizeTeamName(name?: string): string {
  return (name ?? "").toLowerCase().trim().replace(/national team/gi, "").trim();
}

function playerTeamLabel(p: FootballPlayerEntry): string {
  return normalizeTeamName(p.team || p.nationality);
}

function teamMatchesEliminated(teamLabel: string, eliminated: string): boolean {
  const a = normalizeTeamName(teamLabel);
  const b = normalizeTeamName(eliminated);
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

function isActiveCompetitionPlayer(p: FootballPlayerEntry, eliminated: string[]): boolean {
  if (p.still_in_competition === false || p.status === "eliminated") return false;
  const label = playerTeamLabel(p);
  return !eliminated.some((e) => teamMatchesEliminated(label, e));
}

export function extractFootballPlayers(row?: TrackerRow): FootballPlayerEntry[] {
  const data = (row?.data ?? {}) as FootballPlayerIndexData;
  const eliminated = Array.isArray(data.teams_eliminated) ? data.teams_eliminated : [];
  const players = Array.isArray(data.players) ? data.players : [];
  return [...players]
    .filter((p) => p?.player_name && isActiveCompetitionPlayer(p, eliminated))
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
    .map((p, i) => ({ ...p, rank: i + 1 }));
}

export function extractFootballIndexMeta(row?: TrackerRow): FootballPlayerIndexData {
  return (row?.data ?? {}) as FootballPlayerIndexData;
}

export type TrackerRow = {
  id?: string;
  tracker_type: string;
  created_at?: string;
  last_updated?: string;
  region?: string | null;
  item_count?: number | null;
  main_entity?: string | null;
  snapshot_label?: string | null;
  overall_score?: number | null;
  deep_dive_summary?: string | null;
  key_insights?: string[] | null;
  data?: Record<string, unknown> | null;
};

async function fetchTrackerRows(endpoint: "latest_trackers" | "trackers"): Promise<TrackerRow[] | null> {
  // Prefer last_updated so append-only history ranks correctly; fall back created_at.
  const order =
    endpoint === "trackers"
      ? "&order=last_updated.desc.nullslast,created_at.desc"
      : "";
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${endpoint}?select=*&limit=200${order}`,
    {
      cache: "no-store",
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    },
  );
  if (!res.ok) return null;
  const rows = (await res.json()) as TrackerRow[];
  return Array.isArray(rows) ? rows : null;
}

/** Count leaders with real scores (exclude waiting / null scores). */
function countActiveScoredLeaders(data: Record<string, unknown>): number {
  let count = 0;
  const collect = (raw: unknown) => {
    if (!Array.isArray(raw)) return;
    for (const item of raw) {
      if (!item || typeof item !== "object") continue;
      const l = item as RankedLeader;
      if (l.status === "waiting") continue;
      if (typeof l.overall_score === "number") count += 1;
    }
  };

  const regions = data.regions;
  if (regions && typeof regions === "object" && Object.keys(regions as object).length > 0) {
    for (const bucket of Object.values(regions as Record<string, unknown>)) {
      collect(bucket);
    }
    return count;
  }
  // Backend historical shape: top-level americas / europe arrays
  for (const key of ["americas", "europe", "middle_east", "global"] as const) {
    collect(data[key]);
  }
  if (count > 0) return count;
  collect(data.ranked_leaders);
  collect(data.leaders);
  return count;
}

/** -1 = empty / unusable for display; higher = richer payload. */
function trackerRowQuality(row: TrackerRow): number {
  const data = (row.data ?? {}) as Record<string, unknown>;
  const itemCount = typeof row.item_count === "number" ? row.item_count : null;

  if (row.tracker_type === "football_player_index") {
    const players = Array.isArray(data.players) ? data.players.length : 0;
    const posts = typeof data.posts_analyzed === "number" ? data.posts_analyzed : 0;
    if (players <= 0) return -1;
    return players * 1000 + posts;
  }

  if (row.tracker_type === "global_leader_trust") {
    // Prefer explicit item_count when backend sets it; still validate payload.
    const active = countActiveScoredLeaders(data);
    if (active <= 0) return -1;
    if (itemCount != null && itemCount <= 0) return -1;
    return active * 1000 + (itemCount ?? active);
  }

  if (itemCount != null) {
    if (itemCount <= 0) return -1;
    return itemCount;
  }

  // Peace / media: any non-empty structured data counts as substantive.
  if (data.detailed_countries && typeof data.detailed_countries === "object") {
    const n = Object.keys(data.detailed_countries as object).length;
    return n > 0 ? n : -1;
  }
  if (data.countries && typeof data.countries === "object") {
    const n = Object.keys(data.countries as object).length;
    return n > 0 ? n : -1;
  }
  if (data.regions && typeof data.regions === "object" && row.tracker_type === "media_trust") {
    const n = Object.keys(data.regions as object).length;
    return n > 0 ? n : -1;
  }
  if (Array.isArray(data.ranked_leaders) && data.ranked_leaders.length > 0) {
    return data.ranked_leaders.length;
  }
  if (Array.isArray(data.leaders) && data.leaders.length > 0) return data.leaders.length;

  if (!data || Object.keys(data).length === 0) return -1;
  return 1;
}

function trackerRecencyMs(row: TrackerRow): number {
  return Date.parse(row.last_updated ?? row.created_at ?? "") || 0;
}

/**
 * One row per tracker_type: never let an empty newer insert (e.g. football
 * item_count=0) hide a prior substantive snapshot. Among substantive rows,
 * prefer the freshest last_updated.
 */
function dedupeLatestTrackerRows(rows: TrackerRow[]): TrackerRow[] {
  const buckets = new Map<string, TrackerRow[]>();
  for (const r of rows) {
    if (!r?.tracker_type) continue;
    const list = buckets.get(r.tracker_type) ?? [];
    list.push(r);
    buckets.set(r.tracker_type, list);
  }
  const latest: TrackerRow[] = [];
  for (const group of buckets.values()) {
    group.sort((a, b) => {
      const qa = trackerRowQuality(a);
      const qb = trackerRowQuality(b);
      const aSub = qa >= 0 ? 1 : 0;
      const bSub = qb >= 0 ? 1 : 0;
      if (aSub !== bSub) return bSub - aSub;
      const ta = trackerRecencyMs(a);
      const tb = trackerRecencyMs(b);
      if (ta !== tb) return tb - ta;
      return qb - qa;
    });
    latest.push(group[0]!);
  }
  return latest;
}

export async function fetchLatestTrackers(): Promise<TrackerRow[]> {
  try {
    // Primary source of truth: the `trackers` table (append-only history).
    const trackerRows = await fetchTrackerRows("trackers");
    if (trackerRows && trackerRows.length > 0) return dedupeLatestTrackerRows(trackerRows);

    // Fallback to the `latest_trackers` view if the table read fails.
    const latestRows = await fetchTrackerRows("latest_trackers");
    return latestRows ? dedupeLatestTrackerRows(latestRows) : [];
  } catch {
    return [];
  }
}

// ---------- Normalizers (backend may evolve; tolerate both shapes) ----------

export const LEADER_REGION_BUCKETS = [
  { key: "americas", label: "Americas" },
  { key: "europe", label: "Europe" },
  { key: "middle_east", label: "Middle East" },
  { key: "global", label: "Global" },
] as const;

export type LeaderRegionBucketKey = (typeof LEADER_REGION_BUCKETS)[number]["key"];

function coerceLeaders(raw: unknown, regionLabel?: string): RankedLeader[] {
  if (!raw) return [];
  let leaders: RankedLeader[] = [];
  if (Array.isArray(raw)) {
    leaders = raw as RankedLeader[];
  } else if (typeof raw === "object") {
    leaders = Object.entries(raw as Record<string, RankedLeader>).map(([name, v]) => ({
      name,
      ...(v as object),
    })) as RankedLeader[];
  }
  return leaders.map((l) => ({
    ...l,
    region: l.region ?? regionLabel,
    overall_score:
      typeof l.overall_score === "number"
        ? l.overall_score
        : l.overall_score === null
          ? null
          : typeof l.popularity === "number"
            ? l.popularity
            : typeof l.positive_x === "number"
              ? l.positive_x
              : undefined,
  }));
}

function sortLeaders(leaders: RankedLeader[]): RankedLeader[] {
  const arr = [...leaders];
  arr.sort((a, b) => {
    const ar = typeof a.rank === "number" ? a.rank : Infinity;
    const br = typeof b.rank === "number" ? b.rank : Infinity;
    if (ar !== br) return ar - br;
    const as = typeof a.overall_score === "number" ? a.overall_score : -1;
    const bs = typeof b.overall_score === "number" ? b.overall_score : -1;
    return bs - as;
  });
  return arr;
}

function mapLeaderRegionBucket(region?: string): LeaderRegionBucketKey {
  const r = (region ?? "").toLowerCase();
  if (
    /(america|latin|caribbean|usa|u\.s\.|canada|mexico|brazil|argentin|chile|colomb|peru|salvador)/.test(
      r,
    )
  ) {
    return "americas";
  }
  if (/(europe|eu\b|uk|britain|france|germany|italy|spain|hungary|ukraine)/.test(r)) {
    return "europe";
  }
  if (/(middle east|gulf|arab|israel|iran|turkey|saudi)/.test(r)) {
    return "middle_east";
  }
  return "global";
}

/** True when a regional list has at least one scored (non-waiting) leader. */
function hasScoredLeaders(list: RankedLeader[]): boolean {
  return list.some((l) => l.status !== "waiting" && typeof l.overall_score === "number");
}

/**
 * Leaderboard shapes supported:
 * 1) data.regions = { americas: [...], europe: [...], ... }
 * 2) top-level data.americas / data.europe (trackers.py)
 * 3) legacy data.ranked_leaders / data.leaders (Jun 30 shape — still the last good snapshot)
 *
 * Waiting-only regional shells must not hide ranked_leaders fallbacks.
 */
export function extractLeadersByRegion(
  row?: TrackerRow,
): Record<LeaderRegionBucketKey, RankedLeader[]> {
  const data = (row?.data ?? {}) as Record<string, unknown>;
  const regions =
    data.regions && typeof data.regions === "object"
      ? (data.regions as Record<string, unknown>)
      : {};
  const out = {} as Record<LeaderRegionBucketKey, RankedLeader[]>;
  for (const bucket of LEADER_REGION_BUCKETS) {
    out[bucket.key] = [];
  }

  for (const bucket of LEADER_REGION_BUCKETS) {
    // Prefer nested regions[key], fall back to top-level data[key] from backend.
    const raw = regions[bucket.key] ?? data[bucket.key];
    const leaders = sortLeaders(coerceLeaders(raw, bucket.label));
    // Keep waiting rows only if we also have scored peers in that bucket
    const scored = leaders.filter(
      (l) => l.status !== "waiting" && typeof l.overall_score === "number",
    );
    const waiting = leaders.filter((l) => l.status === "waiting");
    const merged = scored.length > 0 ? [...scored, ...waiting] : scored;
    out[bucket.key] = merged.slice(0, 20).map((l, i) => ({ ...l, rank: l.rank ?? i + 1 }));
  }

  const hasRegionalScored = LEADER_REGION_BUCKETS.some((b) => hasScoredLeaders(out[b.key]));
  if (!hasRegionalScored) {
    // Legacy / historical: ranked_leaders with overall_score (e.g. id 15 Jun 30)
    const legacy = sortLeaders(
      coerceLeaders((data.ranked_leaders ?? data.leaders) as unknown),
    ).filter((l) => l.status !== "waiting" && typeof l.overall_score === "number");

    for (const l of legacy) {
      const bucket = mapLeaderRegionBucket(l.region);
      out[bucket].push(l);
    }
    for (const bucket of LEADER_REGION_BUCKETS) {
      out[bucket.key] = sortLeaders(out[bucket.key])
        .slice(0, 20)
        .map((l, i) => ({ ...l, rank: l.rank ?? i + 1 }));
    }
  }
  return out;
}

export function extractRankedLeaders(row?: TrackerRow): RankedLeader[] {
  const byRegion = extractLeadersByRegion(row);
  const all: RankedLeader[] = [];
  for (const bucket of LEADER_REGION_BUCKETS) all.push(...byRegion[bucket.key]);
  if (all.length > 0) return sortLeaders(all);

  // Final legacy fallback
  const data = (row?.data ?? {}) as Record<string, unknown>;
  const raw = (data.ranked_leaders ?? data.leaders) as unknown;
  const withScore = sortLeaders(coerceLeaders(raw));
  return withScore.map((l, i) => ({ ...l, rank: l.rank ?? i + 1 }));
}


function countryLookupKey(value?: string): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function peaceCountriesFromRaw(raw: unknown): PeaceCountry[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as PeaceCountry[];
  if (typeof raw === "object") {
    return Object.entries(raw as Record<string, PeaceCountry>).map(([key, v]) => ({
      key,
      name: (v as PeaceCountry).name ?? key,
      ...(v as object),
    })) as PeaceCountry[];
  }
  return [];
}

function mergePeaceRankingWithDetails(
  rankingRaw: unknown,
  detailsRaw: unknown,
): PeaceCountry[] {
  const ranking = peaceCountriesFromRaw(rankingRaw);
  const details = peaceCountriesFromRaw(detailsRaw);
  if (ranking.length === 0) return details;

  const detailByKey = new Map<string, PeaceCountry>();
  for (const d of details) {
    detailByKey.set(countryLookupKey(d.key || d.name), d);
    detailByKey.set(countryLookupKey(d.name), d);
  }

  return ranking.map((r, index) => {
    const detail = detailByKey.get(countryLookupKey(r.key || r.name)) ?? detailByKey.get(countryLookupKey(r.name));
    return {
      ...(detail ?? {}),
      ...r,
      key: r.key ?? detail?.key,
      rank: r.rank ?? index + 1,
      name: r.name ?? detail?.name ?? r.key ?? `Country ${index + 1}`,
      flag: r.flag ?? detail?.flag,
    };
  });
}

function derivedPeaceHealthScore(c: PeaceCountry): number | undefined {
  const support =
    typeof c.citizen_normalization_support === "number"
      ? c.citizen_normalization_support
      : typeof c.citizen_support === "number"
        ? c.citizen_support
        : undefined;
  const pragmatism =
    typeof c.pragmatism_score === "number"
      ? c.pragmatism_score
      : typeof c.pragmatism_vs_ideology === "number"
        ? c.pragmatism_vs_ideology
        : undefined;
  const rejectionism =
    typeof c.rejectionism_level === "number"
      ? c.rejectionism_level
      : typeof c.antisemitism_rejectionism === "number"
        ? c.antisemitism_rejectionism
        : undefined;
  const institutional =
    typeof c.us_policy_perception === "number"
      ? c.us_policy_perception
      : typeof c.normalization_depth === "number"
        ? c.normalization_depth
        : undefined;

  const parts: number[] = [];
  if (typeof support === "number") parts.push(support);
  if (typeof pragmatism === "number") parts.push(pragmatism);
  if (typeof rejectionism === "number") parts.push(100 - rejectionism);
  if (typeof institutional === "number") parts.push(institutional);
  if (parts.length === 0) return undefined;
  return Math.round(parts.reduce((s, v) => s + v, 0) / parts.length);
}

export function extractPeaceCountries(row?: TrackerRow): PeaceCountry[] {
  const data = (row?.data ?? {}) as Record<string, unknown>;
  // Prefer the new diagnostic `countries` map. If the backend sends both a
  // ranking list and detailed country records, preserve the ranking while
  // enriching it with the detailed diagnostic fields from the same DB row.
  let arr = peaceCountriesFromRaw(data.countries);
  if (arr.length === 0) {
    arr = mergePeaceRankingWithDetails(data.all_countries_ranking, data.detailed_countries);
  }
  if (arr.length === 0) return [];

  // Normalize: derive new diagnostic fields from legacy fields when missing.
  arr = arr.map((c) => {
    const norm: PeaceCountry = { ...c };
    if (norm.citizen_normalization_support == null && typeof c.citizen_support === "number") {
      norm.citizen_normalization_support = c.citizen_support;
    }
    if (norm.rejectionism_level == null && typeof c.antisemitism_rejectionism === "number") {
      norm.rejectionism_level = c.antisemitism_rejectionism;
    }
    if (
      norm.government_vs_public_gap == null &&
      typeof c.normalization_depth === "number" &&
      typeof c.citizen_support === "number"
    ) {
      norm.government_vs_public_gap = Math.max(
        0,
        Math.min(100, c.normalization_depth - c.citizen_support),
      );
    }
    if (norm.pragmatism_score == null && typeof c.pragmatism_vs_ideology === "number") {
      norm.pragmatism_score = c.pragmatism_vs_ideology;
    }
    if (norm.cynicism_fatigue == null && typeof c.see_through_show === "number") {
      norm.cynicism_fatigue = c.see_through_show;
    }
    if (norm.us_policy_perception == null && typeof c.strategic_alignment === "number") {
      norm.us_policy_perception = c.strategic_alignment;
    }
    if (norm.peace_health_score == null && typeof c.peace_support === "number") {
        norm.peace_health_score = c.peace_support;
    }
    return norm;
  });

  // Some backend snapshots carry a placeholder health score repeated across
  // every country while also providing the actual diagnostic dimensions. In
  // that case, build the display score from those ingested backend fields so
  // the tracker index matches the detailed diagnostic evidence.
  const explicitScores = arr
    .map((c) => c.peace_health_score)
    .filter((v): v is number => typeof v === "number");
  const hasUniformPlaceholderScore =
    explicitScores.length > 1 && new Set(explicitScores.map((v) => Math.round(v))).size === 1;
  if (hasUniformPlaceholderScore) {
    arr = arr.map((c) => {
      const derived = derivedPeaceHealthScore(c);
      return typeof derived === "number" ? { ...c, peace_health_score: derived } : c;
    });
  } else {
    arr = arr.map((c) => {
      if (typeof c.peace_health_score === "number") return c;
      const derived = derivedPeaceHealthScore(c);
      return typeof derived === "number" ? { ...c, peace_health_score: derived } : c;
    });
  }

  // Sort by peace_health_score desc by default.
  arr.sort((a, b) => {
    const ar = typeof a.rank === "number" ? a.rank : Infinity;
    const br = typeof b.rank === "number" ? b.rank : Infinity;
    if (ar !== br) return ar - br;
    return (b.peace_health_score ?? -1) - (a.peace_health_score ?? -1);
  });
  return arr.map((c, i) => ({ ...c, rank: c.rank ?? i + 1 }));
}

export function momentumColor(m?: string): string {
  if (!m) return "#6B7280";
  const s = m.toLowerCase();
  if (/advanc|improv|gain|positive/.test(s)) return "#00C853";
  if (/regress|declin|deterior|negative/.test(s)) return "#FF1744";
  if (/stagn|flat|hold|stall/.test(s)) return "#FFAB00";
  return "#6B7280";
}

export function momentumIcon(m?: string): "up" | "down" | "flat" {
  if (!m) return "flat";
  const s = m.toLowerCase();
  if (/advanc|improv|gain|positive/.test(s)) return "up";
  if (/regress|declin|deterior|negative/.test(s)) return "down";
  return "flat";
}


export type TrackerDefinition = {
  key: string;
  tracker_type: string;
  title: string;
  tagline: string;
  status: "live" | "coming_soon";
  accent: "cyan" | "amber" | "violet" | "emerald" | "rose";
};

export const TRACKER_CATALOG: TrackerDefinition[] = [
  {
    key: "global-leader-trust",
    tracker_type: "global_leader_trust",
    title: "Global Leader Trust & Popularity",
    tagline:
      "Live citizen trust scores for world leaders measured against official approval narratives.",
    status: "live",
    accent: "amber",
  },
  {
    key: "peace-normalization",
    tracker_type: "peace_normalization",
    title: "Peace & Normalization with Israel",
    tagline:
      "Citizen vs. official sentiment on Abraham Accords expansion, ceasefires, and regional normalization.",
    status: "live",
    accent: "cyan",
  },
  {
    key: "football-players",
    tracker_type: "football_player_index",
    title: "Gladiator Podium · Football Player Index",
    tagline:
      "Fan discourse rankings for World Cup players — form, legacy, golden-boot race and post-match sentiment from earned media on X.",
    status: "live",
    accent: "emerald",
  },
  {
    key: "immigration-borders",
    tracker_type: "immigration_borders",
    title: "Immigration & Borders (EU + US)",
    tagline: "Cross-Atlantic citizen sentiment on border policy, asylum, and enforcement.",
    status: "coming_soon",
    accent: "violet",
  },
  {
    key: "crime-safety",
    tracker_type: "crime_safety",
    title: "Crime & Safety (EU + US)",
    tagline: "Public perception of safety, policing, and crime trends across major cities.",
    status: "coming_soon",
    accent: "emerald",
  },
  {
    key: "corruption-governance",
    tracker_type: "corruption_governance",
    title: "Corruption & Governance (EU + US)",
    tagline:
      "Citizen perception of institutional trust, transparency, and accountability vs. official narratives.",
    status: "coming_soon",
    accent: "rose",
  },
];

// Clubbed regions. "Americas" combines US + Latin America; "Europe" combines EU + Europe.
export const LEADER_REGIONS = [
  "All",
  "Americas",
  "Europe",
  "Middle East",
  "Asia",
  "Africa",
  "Global",
] as const;

export type LeaderRegionGroup = (typeof LEADER_REGIONS)[number];

/** Normalize the raw `region` string from the backend into one of the grouped buckets. */
export function normalizeLeaderRegion(raw?: string | null): LeaderRegionGroup | "Other" {
  if (!raw) return "Other";
  const r = raw.toLowerCase().trim();
  if (/(us|u\.s\.|united states|north america|usa|canada|mexico|latin|south america|americas|brazil|argentin|chile|colomb|venezuel|peru|cuba)/.test(r))
    return "Americas";
  if (/(eu|europe|euro|uk|britain|england|france|germany|italy|spain|nordic|baltic|balkan|poland|netherlands|greece|portugal|ireland|austria|hungary|czech|romania|sweden|norway|denmark|finland|switzerland|belgium)/.test(r))
    return "Europe";
  if (/(middle east|me|gulf|gcc|levant|israel|saudi|iran|iraq|syria|lebanon|jordan|egypt|qatar|emirates|uae|kuwait|bahrain|oman|yemen|turkey|palestin)/.test(r))
    return "Middle East";
  if (/(asia|china|japan|korea|india|pakistan|indonesia|vietnam|thailand|philippines|malaysia|singapore|taiwan|asean)/.test(r))
    return "Asia";
  if (/(africa|nigeria|kenya|ethiopia|south africa|morocco|algeria|tunisia|ghana|sudan|uganda)/.test(r))
    return "Africa";
  if (/(global|world|international)/.test(r)) return "Global";
  return "Other";
}

/** Activity proxy used to pick top 10 per region. Prefers posts_analyzed; falls back to overall_score. */
export function leaderActivity(l: RankedLeader): number {
  if (typeof l.posts_analyzed === "number") return l.posts_analyzed;
  if (typeof l.overall_score === "number") return l.overall_score;
  return -1;
}


