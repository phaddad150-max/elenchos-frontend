import { readConsentChoice } from "@/lib/privacy-consent";

/** GA4 Measurement ID (gtag.js). Not a GTM container (GTM-…). */
export const GA_MEASUREMENT_ID = "G-SM3C2J9L0Z";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let loadPromise: Promise<void> | null = null;
let consentGranted = false;

/**
 * Official gtag stub must push the Arguments object — not a rest array.
 * Pushing `args` (Array) breaks Google's pre-load dataLayer queue, so config /
 * page_view commands never fire after gtag.js boots.
 * @see https://developers.google.com/tag-platform/gtagjs/install
 */
function ensureGtagStub() {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === "function") return;
  // Important: use `arguments`, not `...args` + push(args)
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
}

/**
 * Load gtag.js. Consent default is set before the script tag so Consent Mode
 * queues correctly. Script loads only when we intend to track (after Accept).
 */
export function loadGoogleAnalytics(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    ensureGtagStub();

    const accepted = readConsentChoice() === "accepted";
    // Consent Mode v2 defaults — must run before gtag.js processes the queue
    window.gtag!("consent", "default", {
      analytics_storage: accepted ? "granted" : "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 500,
    });
    window.gtag!("js", new Date());

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`,
    );
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.onload = () => resolve();
    script.onerror = () => {
      // Allow a later retry if the network failed
      loadPromise = null;
      resolve();
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function grantAnalyticsConsent() {
  if (typeof window === "undefined") return;
  ensureGtagStub();
  window.gtag!("consent", "update", {
    analytics_storage: "granted",
  });
  consentGranted = true;
}

export function denyAnalyticsConsent() {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("consent", "update", { analytics_storage: "denied" });
  consentGranted = false;
}

/**
 * SPA page view via gtag config (GA4 recommended for client-side navigations).
 */
export function trackPageview(path: string) {
  if (typeof window === "undefined") return;
  if (readConsentChoice() !== "accepted") return;
  if (typeof window.gtag !== "function") return;

  window.gtag("config", GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
    send_page_view: true,
  });
}

/** Call when consent is accepted (or on route change after Accept). */
export async function enableAnalyticsAndTrack(path: string) {
  if (typeof window === "undefined") return;
  if (readConsentChoice() !== "accepted") return;

  await loadGoogleAnalytics();
  // Ensure real gtag from the script has replaced the stub when possible
  ensureGtagStub();

  if (!consentGranted) {
    grantAnalyticsConsent();
  }
  trackPageview(path);
}
