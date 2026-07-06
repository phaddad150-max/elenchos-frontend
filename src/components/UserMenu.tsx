import { useEffect, useState } from "react";
import { LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { supabaseExternal } from "@/integrations/supabase/external-client";

export function UserMenu() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const refresh = async () => {
      const [a, b] = await Promise.all([
        supabase.auth.getSession(),
        supabaseExternal.auth.getSession(),
      ]);
      const u = a.data.session?.user ?? b.data.session?.user ?? null;
      if (!u) return setLabel(null);
      const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
      setLabel(
        u.email ??
          (typeof meta.user_name === "string" ? `@${meta.user_name}` : null) ??
          (typeof meta.preferred_username === "string" ? `@${meta.preferred_username}` : null) ??
          (typeof meta.name === "string" ? meta.name : null) ??
          "Signed in",
      );
    };
    refresh();
    const { data: s1 } = supabase.auth.onAuthStateChange(() => refresh());
    const { data: s2 } = supabaseExternal.auth.onAuthStateChange(() => refresh());
    return () => {
      s1.subscription.unsubscribe();
      s2.subscription.unsubscribe();
    };
  }, []);

  if (!label) return null;

  const handleSignOut = async () => {
    await Promise.all([
      supabase.auth.signOut(),
      supabaseExternal.auth.signOut(),
    ]);
    window.location.assign("/");
  };

  return (
    <div className="hidden md:flex items-center gap-2">
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-border bg-secondary/50 text-[11px] font-mono text-muted-foreground max-w-[180px]">
        <User className="w-3 h-3 text-cyan shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <button
        onClick={handleSignOut}
        className="p-2 rounded-lg hover:bg-secondary border border-border text-muted-foreground hover:text-foreground"
        aria-label="Sign out"
        title="Sign out"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
