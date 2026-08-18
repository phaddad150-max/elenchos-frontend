import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { enableAnalyticsAndTrack } from "@/lib/google-analytics";
import { readConsentChoice } from "@/lib/privacy-consent";

/**
 * GA4 via gtag.js (measurement ID G-SM3C2J9L0Z).
 * Loads and sends page views only after cookie Accept.
 * Note: this is GA4 gtag — not a GTM-XXXX container snippet.
 */
export function GoogleAnalytics() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.searchStr });

  useEffect(() => {
    const path = `${pathname}${search ?? ""}`;
    const send = () => {
      if (readConsentChoice() !== "accepted") return;
      void enableAnalyticsAndTrack(path);
    };
    send();
    window.addEventListener("consent-changed", send);
    return () => window.removeEventListener("consent-changed", send);
  }, [pathname, search]);

  return null;
}
