import { useEffect, useState } from "react";
import { supabaseExternal } from "@/integrations/supabase/external-client";
import { isAdminEmail } from "@/lib/admin-emails";

/** True when the current OAuth session email is in VITE_ADMIN_EMAILS. */
export function useAdminSession(): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const apply = (email?: string | null) => setOk(isAdminEmail(email));
    void supabaseExternal.auth.getSession().then(({ data }) => {
      apply(data.session?.user?.email ?? null);
    });
    const { data } = supabaseExternal.auth.onAuthStateChange((_e, session) => {
      apply(session?.user?.email ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return ok;
}
