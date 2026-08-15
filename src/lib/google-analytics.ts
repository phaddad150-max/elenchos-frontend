export const GA_MEASUREMENT_ID = "G-SM3C2J9L0Z";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function grantAnalyticsConsent() {
  if (typeof window.gtag !== "function") return;
  window.gtag("consent", "update", { analytics_storage: "granted" });
}

export function denyAnalyticsConsent() {
  if (typeof window.gtag !== "function") return;
  window.gtag("consent", "update", { analytics_storage: "denied" });
}

export function trackPageview(path: string) {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}
