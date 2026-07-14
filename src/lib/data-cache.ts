/** Clear in-memory dashboard / tracker caches so the next load fetches fresh data. */
export function clearDashboardCaches() {
  if (typeof window === "undefined") return;
  window.dashboardData = undefined as never;
  window.__dashboardDataPromise = undefined;
  window.dashboardOverview = undefined as never;
  window.__dashboardOverviewPromise = undefined;
  window.__citizenSignalsPromise = undefined;
  window.citizenSignals = undefined as never;
  window.curatedInsights = undefined;
  window.__curatedInsightsPromises = undefined;
  window.curatedQaPairs = undefined;
  window.__curatedQaPromises = undefined;
  window.topicHistory = undefined;
  window.__topicHistoryPromises = undefined;
}