/**
 * Canonical public origin for OAuth return URLs.
 * Avoids www vs apex / preview-host mismatches that break Google redirect allowlists.
 */
export function publicSiteOrigin(): string {
  const env =
    (typeof import.meta !== "undefined" &&
      (import.meta as { env?: Record<string, string> }).env?.VITE_SITE_URL?.trim()) ||
    "";
  if (env) return env.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "elenchos.live" || host === "www.elenchos.live") {
      return "https://elenchos.live";
    }
    return window.location.origin;
  }
  return "https://elenchos.live";
}

/** Where Google/X should send the user after Supabase finishes the OAuth exchange. */
export function oauthReturnTo(path = "/pro"): string {
  const base = publicSiteOrigin();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
