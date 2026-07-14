export const CONSENT_KEY = "elenchos_consent_v1";

export type ConsentChoice = "accepted" | "declined";

export function readConsentChoice(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(CONSENT_KEY);
  if (stored === "accepted" || stored === "declined") return stored;
  return null;
}

export function hasPrivacyChoice(): boolean {
  return readConsentChoice() !== null;
}

export function writeConsentChoice(value: ConsentChoice): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new Event("consent-changed"));
}