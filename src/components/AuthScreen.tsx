import { useState } from "react";
import { Radio, Loader2, AlertCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabaseExternal } from "@/integrations/supabase/external-client";
import { CookieConsent } from "@/components/CookieConsent";

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

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.5 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.3 0-.6-.1-1.1-.2-1.6H12z" />
    </svg>
  );
}

export function AuthScreen({ hasConsent }: { hasConsent: boolean }) {
  const [loading, setLoading] = useState<null | "google" | "twitter">(null);
  const [error, setError] = useState<string | null>(null);

  const blockIfNoConsent = () => {
    if (!hasConsent && !hasStoredPrivacyChoice()) {
      setError("Please choose a privacy & cookie option below to continue.");
      return true;
    }
    return false;
  };

  const handleGoogle = async () => {
    setError(null);
    if (blockIfNoConsent()) return;
    setLoading("google");
    try {
      const { error: oauthError } = await supabaseExternal.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (oauthError) {
        setError(oauthError.message || "Google sign-in failed");
        setLoading(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Google sign-in failed");
      setLoading(null);
    }
  };

  const handleTwitter = async () => {
    setError(null);
    if (blockIfNoConsent()) return;
    setLoading("twitter");
    try {
      const { error: oauthError } = await supabaseExternal.auth.signInWithOAuth({
        provider: "x",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (oauthError) {
        setError(oauthError.message || "X sign-in failed");
        setLoading(null);
      }
      // On success, browser redirects to X — no need to clear loading.
    } catch (e) {
      setError(e instanceof Error ? e.message : "X sign-in failed");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="brand-mark w-12 h-12 rounded-full grid place-items-center mb-3">
            <Radio className="w-5 h-5 text-cyan" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-glow-cyan">
            Elenchos
          </h1>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground mt-1">
            Sign in to access the dashboard
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur p-5 md:p-6 shadow-xl">
          <p className="text-xs text-muted-foreground text-center mb-5 leading-relaxed">
            Continue with a trusted identity provider. We never see or store
            your password — only your basic profile (name, email, avatar) is
            shared with us.
          </p>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading !== null}
              className="w-full inline-flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border bg-background hover:bg-secondary text-sm font-medium disabled:opacity-60 transition-colors"
            >
              {loading === "google" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <GoogleIcon className="w-4 h-4" />
              )}
              Continue with Google
            </button>

            <button
              type="button"
              onClick={handleTwitter}
              disabled={loading !== null}
              className="w-full inline-flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border bg-foreground text-background hover:bg-foreground/90 text-sm font-medium disabled:opacity-60 transition-colors"
            >
              {loading === "twitter" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XIcon className="w-4 h-4" />
              )}
              Continue with X
            </button>
          </div>

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
          . Your identity-provider profile (name, email, avatar) and
          authentication metadata are stored securely on EU-hosted
          infrastructure. We never sell your data and never receive your
          provider password.
        </p>
      </div>
      <CookieConsent />
    </div>
  );
}
