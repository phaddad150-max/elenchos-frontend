import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { appendOnlyInsert } from "@/lib/supabase-append-only";
import {
  CONSENT_KEY,
  hasPrivacyChoice,
  writeConsentChoice,
  type ConsentChoice,
} from "@/lib/privacy-consent";
import { denyAnalyticsConsent } from "@/lib/google-analytics";

async function recordConsent(granted: boolean) {
  try {
    const { data } = await supabase.auth.getSession();
    await appendOnlyInsert(supabase, "user_consents", {
      user_id: data.session?.user.id ?? null,
      consent_type: "cookies_and_privacy",
      granted,
      policy_version: "v1",
      user_agent:
        typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
    });
  } catch {
    /* non-blocking */
  }
}

/**
 * Compact GDPR cookie bar — visible until the user chooses.
 * Lightweight (no gtag load until Accept). Re-open via `consent-open` event.
 */
export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Show immediately when no choice yet (first visit / EU compliance).
    setOpen(!hasPrivacyChoice());

    const onReopen = () => setOpen(true);
    window.addEventListener("consent-open", onReopen);
    return () => window.removeEventListener("consent-open", onReopen);
  }, []);

  const set = (value: ConsentChoice) => {
    writeConsentChoice(value); // dispatches consent-changed → GoogleAnalytics enables gtag
    void recordConsent(value === "accepted");
    setOpen(false);
    if (value === "declined") {
      denyAnalyticsConsent();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed z-[100] pointer-events-none inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom,0px))] p-3 sm:p-4 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-md md:bottom-6 md:right-6"
      role="dialog"
      aria-modal="false"
      aria-label="Privacy and cookie consent"
      aria-live="polite"
    >
      <div className="pointer-events-auto rounded-xl border border-cyan/35 bg-card/98 backdrop-blur-md shadow-[0_12px_40px_-12px_rgba(0,0,0,0.55)] p-3 sm:p-3.5">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg border border-cyan/30 bg-cyan/10 grid place-items-center shrink-0 mt-0.5">
            <Cookie className="w-3.5 h-3.5 text-cyan" aria-hidden />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[13px] font-display font-semibold leading-tight">
                Cookies & privacy (EU/GDPR)
              </h3>
              <button
                type="button"
                onClick={() => set("declined")}
                aria-label="Dismiss and use essential cookies only"
                className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground shrink-0 -mt-0.5 -mr-1 min-h-[36px] min-w-[36px] grid place-items-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11.5px] text-muted-foreground leading-snug mt-1">
              Essential cookies keep you signed in. The Google tag is present with analytics off until
              you Accept — no ads, no selling profiles.{" "}
              <Link to="/privacy" className="text-cyan hover:underline">
                Privacy Notice
              </Link>
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => set("accepted")}
                className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-cyan text-background text-[11px] font-semibold hover:bg-cyan/90 touch-manipulation"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => set("declined")}
                className="min-h-[40px] px-3.5 py-1.5 rounded-lg border border-border text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary touch-manipulation"
              >
                Essential only
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { CONSENT_KEY };
