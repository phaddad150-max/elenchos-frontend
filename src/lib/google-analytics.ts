import { readConsentChoice } from "@/lib/privacy-consent";

export const GA_MEASUREMENT_ID = "G-SM3C2J9L0Z";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let loadPromise: Promise<void> | null = null;

function ensureDataLayer() {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
  }
}

/** Load gtag only after the user accepts analytics (avoids first-load cost). */
export function loadGoogleAnalytics(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    ensureDataLayer();
    window.gtag!("js", new Date());
    window.gtag!("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src*="googletagmanager.com/gtag/js"]`,
    );
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function grantAnalyticsConsent() {
  ensureDataLayer();
  if (typeof window.gtag !== "function") return;
  window.gtag("consent", "update", { analytics_storage: "granted" });
  window.gtag("config", GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    send_page_view: false,
  });
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

/** Call when consent is accepted: load script, grant, pageview. */
export async function enableAnalyticsAndTrack(path: string) {
  if (readConsentChoice() !== "accepted") return;
  await loadGoogleAnalytics();
  grantAnalyticsConsent();
  trackPageview(path);
}
