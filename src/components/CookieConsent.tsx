import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CONSENT_KEY = "elenchos_consent_v1";

async function recordConsent(granted: boolean) {
  try {
    const { data } = await supabase.auth.getSession();
    await supabase.from("user_consents").insert({
      user_id: data.session?.user.id ?? null,
      consent_type: "cookies_and_privacy",
      granted,
      policy_version: "v1",
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
    });
  } catch {
    /* non-blocking */
  }
}

export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(CONSENT_KEY);
    if (!stored) setOpen(true);
  }, []);

  const set = (value: "accepted" | "declined") => {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
      window.dispatchEvent(new Event("consent-changed"));
    } catch {
      /* ignore */
    }
    recordConsent(value === "accepted");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-3 md:p-5 pointer-events-none">
      <div className="pointer-events-auto max-w-3xl mx-auto rounded-2xl border border-cyan/30 bg-background/95 backdrop-blur-xl shadow-2xl p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div className="brand-mark w-9 h-9 rounded-full grid place-items-center shrink-0">
            <Cookie className="w-4 h-4 text-cyan" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-display font-semibold mb-1">
              Privacy & cookies (EU/GDPR)
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We use a session cookie to keep you signed in and store your email +
              authentication metadata in EU-region cloud infrastructure. No
              advertising or third-party tracking. See our{" "}
              <Link to="/privacy" className="text-cyan hover:underline">
                Privacy Notice
              </Link>{" "}
              for full details, your rights, and how to request deletion.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => set("accepted")}
                className="px-4 py-1.5 rounded-full bg-cyan text-background text-[11px] font-mono uppercase tracking-[0.18em] font-bold hover:bg-cyan/90"
              >
                Accept & continue
              </button>
              <button
                onClick={() => set("declined")}
                className="px-4 py-1.5 rounded-full border border-border text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                Essential only & continue
              </button>
            </div>
          </div>
          <button
            onClick={() => set("declined")}
            aria-label="Close"
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
