import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  denyAnalyticsConsent,
  grantAnalyticsConsent,
  trackPageview,
} from "@/lib/google-analytics";
import { readConsentChoice } from "@/lib/privacy-consent";

/** Sends page views after cookie consent; covers client-side route changes. */
export function GoogleAnalytics() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.searchStr });

  useEffect(() => {
    const send = () => {
      if (readConsentChoice() !== "accepted") {
        denyAnalyticsConsent();
        return;
      }
      grantAnalyticsConsent();
      trackPageview(`${pathname}${search ?? ""}`);
    };
    send();
    window.addEventListener("consent-changed", send);
    return () => window.removeEventListener("consent-changed", send);
  }, [pathname, search]);

  return null;
}
