// External Supabase project (jacbalsongvqvaqlfsbx) used for Google + X OAuth on
// non-Lovable hosts (e.g. Vercel). Lovable Cloud auth only works on elenchos.live.
// Dashboard data also reads from this project via dashboard-data.ts.
import { createClient } from "@supabase/supabase-js";

const EXTERNAL_SUPABASE_URL = "https://jacbalsongvqvaqlfsbx.supabase.co";
const EXTERNAL_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphY2JhbHNvbmd2cXZhcWxmc2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NDg1MjgsImV4cCI6MjA5NTEyNDUyOH0.NZI55Xy8KpqQHdPfQohojnnc-GDef0L8dKQ2oOYI1EU";

export const supabaseExternal = createClient(
  EXTERNAL_SUPABASE_URL,
  EXTERNAL_SUPABASE_ANON_KEY,
  {
    auth: {
      // Distinct storage key so it never collides with the primary client's session.
      storageKey: "sb-external-auth-token",
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
