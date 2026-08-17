export const CONSENT_KEY = "elenchos_consent_v1";

export type ConsentChoice = "accepted" | "declined";

/** In-memory fallback when localStorage is blocked (private mode, etc.). */
let memoryChoice: ConsentChoice | null = null;

export function readConsentChoice(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(CONSENT_KEY);
    if (stored === "accepted" || stored === "declined") {
      memoryChoice = stored;
      return stored;
    }
  } catch {
    /* storage unavailable */
  }
  return memoryChoice;
}

export function hasPrivacyChoice(): boolean {
  return readConsentChoice() !== null;
}

export function writeConsentChoice(value: ConsentChoice): void {
  if (typeof window === "undefined") return;
  memoryChoice = value;
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* still dismiss via memory for this session */
  }
  window.dispatchEvent(new Event("consent-changed"));
}

/** Re-open the cookie bar (footer “Privacy & cookies” control). */
export function requestConsentPreferences(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("consent-open"));
}
