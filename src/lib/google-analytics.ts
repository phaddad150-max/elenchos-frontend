import { CONSENT_KEY, readConsentChoice } from "@/lib/privacy-consent";

/** GA4 Measurement ID (gtag.js). Not a GTM container (GTM-…). */
export const GA_MEASUREMENT_ID = "G-SM3C2J9L0Z";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let consentGranted = false;

/**
 * Official stub: must push Arguments (not a rest array) so Google’s queue works.
 * @see https://developers.google.com/tag-platform/gtagjs/install
 */
export function ensureGtagStub() {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === "function") return;
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
}

/**
 * Consent default MUST run before gtag.js processes the queue (Consent Mode v2).
 * analytics_storage stays denied until Accept unless the user already accepted.
 */
export function getGtagConsentDefaultInlineScript(): string {
  const key = CONSENT_KEY;
  return `(function(){window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;var g=false;try{g=localStorage.getItem(${JSON.stringify(key)})==="accepted";}catch(e){}gtag("consent","default",{analytics_storage:g?"granted":"denied",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied",wait_for_update:500});})();`;
}

/** After the async gtag.js tag: js timestamp + config (no page_view until Accept). */
export function getGtagConfigInlineScript(): string {
  const id = GA_MEASUREMENT_ID;
  return `(function(){window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag("js",new Date());gtag("config",${JSON.stringify(id)},{anonymize_ip:true,send_page_view:false});})();`;
}

export function grantAnalyticsConsent() {
  if (typeof window === "undefined") return;
  ensureGtagStub();
  window.gtag!("consent", "update", { analytics_storage: "granted" });
  consentGranted = true;
}

export function denyAnalyticsConsent() {
  if (typeof window === "undefined") return;
  ensureGtagStub();
  if (typeof window.gtag !== "function") return;
  window.gtag("consent", "update", { analytics_storage: "denied" });
  consentGranted = false;
}

/** SPA page view after consent (GA4 config pattern). */
export function trackPageview(path: string) {
  if (typeof window === "undefined") return;
  if (readConsentChoice() !== "accepted") return;
  ensureGtagStub();
  if (typeof window.gtag !== "function") return;

  window.gtag("config", GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
    send_page_view: true,
  });
}

/**
 * After Accept (or on route change when already accepted): grant storage + pageview.
 * Tag script is already in the document head via Consent Mode bootstrap.
 */
export async function enableAnalyticsAndTrack(path: string) {
  if (typeof window === "undefined") return;
  if (readConsentChoice() !== "accepted") return;

  ensureGtagStub();
  if (!consentGranted) {
    grantAnalyticsConsent();
  }
  trackPageview(path);
}
