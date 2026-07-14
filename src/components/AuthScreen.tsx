import { useState } from "react";
import { Radio, Loader2, AlertCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabaseExternal } from "@/integrations/supabase/external-client";
import { CookieConsent } from "@/components/CookieConsent";
import { ThemePreferenceTabs } from "@/components/ThemePreferenceTabs";

const CONSENT_KEY = "elenchos_consent_v1";

function hasStoredPrivacyChoice() {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(CONSENT_KEY);
  return stored === "accepted" || stored === "declined";
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function AuthScreen({ hasConsent }: { hasConsent: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const blockIfNoConsent = () => {
    if (!hasConsent && !hasStoredPrivacyChoice()) {
      setError("Please choose a privacy & cookie option below to continue.");
      return true;
    }
    return false;
  };

  const handleTwitter = async () => {
    setError(null);
    if (blockIfNoConsent()) return;
    setLoading(true);
    try {
      const { error: oauthError } = await supabaseExternal.auth.signInWithOAuth({
        provider: "x",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (oauthError) {
        setError(oauthError.message || "X sign-in failed");
        setLoading(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "X sign-in failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-background">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <header className="relative z-20 w-full border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-center">
          <ThemePreferenceTabs />
        </div>
      </header>
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="brand-mark w-12 h-12 rounded-full grid place-items-center mb-3">
              <Radio className="w-5 h-5 text-cyan" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-glow-cyan">
              Elenchos
            </h1>
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground mt-1">
              Sign in with X to access the dashboard
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 backdrop-blur p-5 md:p-6 shadow-xl">
            <p className="text-xs text-muted-foreground text-center mb-5 leading-relaxed">
              Continue with your X account. We never see or store your password — only
              your basic profile (name, handle, avatar) is shared with us.
            </p>

            <button
              type="button"
              onClick={handleTwitter}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border bg-foreground text-background hover:bg-foreground/90 text-sm font-medium disabled:opacity-60 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XIcon className="w-4 h-4" />}
              Continue with X
            </button>

            {error && (
              <div className="mt-4 flex items-start gap-2 text-xs text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground text-center mt-5 leading-relaxed">
            By signing in you agree to our{" "}
            <Link to="/privacy" className="text-cyan hover:underline">
              Privacy Notice
            </Link>
            . Your X profile and authentication metadata are stored securely on
            EU-hosted infrastructure. We never sell your data and never receive your
            password.
          </p>
        </div>
      </div>
      <CookieConsent />
    </div>
  );
}