/**
 * Verify Supabase JWT from Authorization Bearer (Pro checkout / billing APIs).
 * Uses the same jacbalsongvqvaqlfsbx project as supabaseExternal (X / Google OAuth).
 */
import { createClient } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin-emails";

function supabaseUrl() {
  return (
    process.env.SUPABASE_URL?.trim() ||
    process.env.VITE_SUPABASE_URL?.trim() ||
    "https://jacbalsongvqvaqlfsbx.supabase.co"
  );
}

function anonKey() {
  return (
    process.env.SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    process.env.VITE_SUPABASE_ANON_KEY?.trim() ||
    // Fallback: public anon key already shipped in external-client (read-only verify)
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphY2JhbHNvbmd2cXZhcWxmc2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NDg1MjgsImV4cCI6MjA5NTEyNDUyOH0.NZI55Xy8KpqQHdPfQohojnnc-GDef0L8dKQ2oOYI1EU"
  );
}

export type BillingUser = {
  userId: string;
  email: string | null;
};

export async function requireBillingUser(
  request: Request,
): Promise<{ user: BillingUser } | { error: Response }> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      error: Response.json(
        { error: "Sign in required", code: "auth_required" },
        { status: 401 },
      ),
    };
  }
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token || token.split(".").length !== 3) {
    return {
      error: Response.json(
        { error: "Invalid session", code: "auth_invalid" },
        { status: 401 },
      ),
    };
  }

  const supabase = createClient(supabaseUrl(), anonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.id) {
    return {
      error: Response.json(
        { error: "Session expired — sign in again", code: "auth_expired" },
        { status: 401 },
      ),
    };
  }

  return {
    user: {
      userId: data.user.id,
      email: data.user.email ?? null,
    },
  };
}

/** Pro / billing APIs — signed-in allowlisted email only. */
export async function requireAdminBillingUser(
  request: Request,
): Promise<{ user: BillingUser } | { error: Response }> {
  const auth = await requireBillingUser(request);
  if ("error" in auth) return auth;
  if (!isAdminEmail(auth.user.email)) {
    return {
      error: Response.json(
        { error: "Admin only", code: "admin_required" },
        { status: 403 },
      ),
    };
  }
  return auth;
}
