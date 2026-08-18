import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { enableAnalyticsAndTrack } from "@/lib/google-analytics";
import { readConsentChoice } from "@/lib/privacy-consent";

/**
 * GA4 via gtag.js (G-SM3C2J9L0Z) already bootstrapped in document head with Consent Mode.
 * Grants analytics_storage + sends page views only after cookie Accept.
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
