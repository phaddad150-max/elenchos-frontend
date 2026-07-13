import { useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { supabaseExternal } from "@/integrations/supabase/external-client";
import { AuthScreen } from "./AuthScreen";
import { Loader2, Radio } from "lucide-react";

const CONSENT_KEY = "elenchos_consent_v1";

function hasPrivacyChoice() {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(CONSENT_KEY);
  return stored === "accepted" || stored === "declined";
}

export function AuthGate({ children }: { children: ReactNode }) {
  const [primarySession, setPrimarySession] = useState<Session | null>(null);
  const [externalSession, setExternalSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasConsent, setHasConsent] = useState(false);
  const session = primarySession ?? externalSession;

  useEffect(() => {
    setHasConsent(hasPrivacyChoice());

    let sub1: { subscription: { unsubscribe: () => void } } | undefined;
    try {
      const { data } = supabase.auth.onAuthStateChange((_e, s) => setPrimarySession(s));
      sub1 = data;
    } catch {
      // Primary Supabase env not configured on this host — external OAuth only.
    }

    const { data: sub2 } = supabaseExternal.auth.onAuthStateChange((_e, s) => setExternalSession(s));

    Promise.allSettled([
      sub1 ? supabase.auth.getSession() : Promise.resolve({ data: { session: null } }),
      supabaseExternal.auth.getSession(),
    ]).then(([a, b]) => {
      if (a.status === "fulfilled") setPrimarySession(a.value.data.session);
      if (b.status === "fulfilled") setExternalSession(b.value.data.session);
      setLoading(false);
    });

    const onStorage = () => setHasConsent(hasPrivacyChoice());
    window.addEventListener("storage", onStorage);
    window.addEventListener("consent-changed", onStorage);

    return () => {
      sub1?.subscription.unsubscribe();
      sub2.subscription.unsubscribe();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("consent-changed", onStorage);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen relative grid place-items-center bg-background">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-3 text-muted-foreground">
          <div className="brand-mark w-10 h-10 rounded-full grid place-items-center">
            <Radio className="w-4 h-4 text-cyan" strokeWidth={2.5} />
          </div>
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      </div>
    );
  }

  if (!session) return <AuthScreen hasConsent={hasConsent} />;

  return <>{children}</>;
}