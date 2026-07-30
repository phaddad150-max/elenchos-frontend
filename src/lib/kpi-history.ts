const KPI_HISTORY_KEY = "cp_kpi_history_v2";
const SAMPLE_CUM_KEY = "cp_sample_analyzed_cum_v1";
const MAX_POINTS = 12;
const MAX_SAMPLE_RUNS = 48;

export type KpiHistoryStore = Record<string, number[]>;

export function readKpiHistory(): KpiHistoryStore {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KPI_HISTORY_KEY) || "{}") as KpiHistoryStore;
  } catch {
    return {};
  }
}

export function appendKpiHistory(values: Record<string, number | undefined>): KpiHistoryStore {
  if (typeof window === "undefined") return {};
  const prev = readKpiHistory();
  const next: KpiHistoryStore = { ...prev };
  for (const [label, value] of Object.entries(values)) {
    if (typeof value !== "number" || Number.isNaN(value)) continue;
    const series = [...(prev[label] ?? [])];
    const last = series[series.length - 1];
    if (last !== value) series.push(value);
    next[label] = series.slice(-MAX_POINTS);
  }
  try {
    window.localStorage.setItem(KPI_HISTORY_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
  return next;
}

type SampleCumStore = {
  /** Running total of posts/items counted across distinct pipeline runs. */
  total: number;
  /** Run ids already folded into `total` (overview generated_at / last_updated). */
  runs: string[];
  lastWindow: number;
};

function readSampleCum(): SampleCumStore {
  if (typeof globalThis.window === "undefined") return { total: 0, runs: [], lastWindow: 0 };
  try {
    const raw = JSON.parse(
      globalThis.window.localStorage.getItem(SAMPLE_CUM_KEY) || "null",
    ) as SampleCumStore | null;
    if (!raw || typeof raw.total !== "number") return { total: 0, runs: [], lastWindow: 0 };
    return {
      total: raw.total,
      runs: Array.isArray(raw.runs) ? raw.runs.map(String) : [],
      lastWindow: typeof raw.lastWindow === "number" ? raw.lastWindow : 0,
    };
  } catch {
    return { total: 0, runs: [], lastWindow: 0 };
  }
}

/**
 * Cumulative sample volume: each distinct pipeline run id adds that run's
 * window sample once. Revisits of the same run do not double-count.
 * Always at least the current window sample (SSR / first paint safe).
 */
export function accumulateTotalSampleAnalyzed(
  runId: string | null | undefined,
  windowSample: number,
): number {
  const windowN =
    typeof windowSample === "number" && windowSample > 0 ? Math.round(windowSample) : 0;
  if (typeof globalThis.window === "undefined") return windowN;

  const store = readSampleCum();
  const id = runId?.trim() || null;

  if (id && windowN > 0 && !store.runs.includes(id)) {
    store.runs = [...store.runs, id].slice(-MAX_SAMPLE_RUNS);
    store.total = (store.total || 0) + windowN;
    store.lastWindow = windowN;
    try {
      globalThis.window.localStorage.setItem(SAMPLE_CUM_KEY, JSON.stringify(store));
    } catch {
      /* ignore quota */
    }
    return store.total;
  }

  // Same run or no id: never go below known cumulative or current window.
  const floor = Math.max(store.total || 0, windowN, store.lastWindow || 0);
  if (windowN > 0 && windowN !== store.lastWindow) {
    store.lastWindow = windowN;
    try {
      globalThis.window.localStorage.setItem(SAMPLE_CUM_KEY, JSON.stringify(store));
    } catch {
      /* ignore */
    }
  }
  return floor;
}

export function peekTotalSampleAnalyzed(): number | undefined {
  if (typeof globalThis.window === "undefined") return undefined;
  const store = readSampleCum();
  return store.total > 0 ? store.total : undefined;
}
