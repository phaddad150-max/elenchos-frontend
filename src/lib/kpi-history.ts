const KPI_HISTORY_KEY = "cp_kpi_history_v2";
const MAX_POINTS = 12;

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