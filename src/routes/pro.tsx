import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  FilePenLine,
  FlaskConical,
  Loader2,
  LogIn,
  Sparkles,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { supabaseExternal } from "@/integrations/supabase/external-client";
import { oauthReturnTo } from "@/lib/auth-redirect";
import {
  MONTHLY_PLAN_ORDER,
  MONTHLY_PLANS,
  TOKEN_COSTS,
  type MonthlyPlanId,
} from "@/lib/billing/catalog";
import { DESK_PACKAGES, type DeskPackageId } from "@/lib/research-desk/packages";
import { socialMetaTags } from "@/lib/social-meta";

const PRO_SOCIAL = {
  title: "Pro · Private research · Elenchos",
  description:
    "Monthly Starter, Plus, or Mega plans. Token wallet for private deep-dive analyses. Public Library stays free.",
  url: "https://elenchos.live/pro",
};

/** v1: deep-no-x only on /pro UI. */
const PRO_RUN_PACKAGE: DeskPackageId = "deep-no-x";

export const Route = createFileRoute("/pro")({
  validateSearch: (s: Record<string, unknown>) => ({
    billing: typeof s.billing === "string" ? s.billing : undefined,
    kind: typeof s.kind === "string" ? s.kind : undefined,
    plan: typeof s.plan === "string" ? s.plan : undefined,
  }),
  head: () => ({
    meta: socialMetaTags(PRO_SOCIAL),
    links: [{ rel: "canonical", href: PRO_SOCIAL.url }],
  }),
  component: ProDeskPage,
});

type BillingMe = {
  balance: number;
  subscription: {
    status: string;
    planId: string;
    currentPeriodEnd: string | null;
  } | null;
};

async function accessToken(): Promise<string | null> {
  const { data } = await supabaseExternal.auth.getSession();
  return data.session?.access_token ?? null;
}

function planLabel(planId: string | undefined): string {
  if (!planId) return "";
  return MONTHLY_PLANS[planId as MonthlyPlanId]?.title ?? planId;
}

function ProDeskPage() {
  const search = Route.useSearch();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [me, setMe] = useState<BillingMe | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [runTopic, setRunTopic] = useState("");
  const [runQuestions, setRunQuestions] = useState("");
  const [runBusy, setRunBusy] = useState(false);

  const refreshMe = useCallback(async () => {
    const token = await accessToken();
    if (!token) {
      setMe(null);
      return;
    }
    try {
      const res = await fetch("/api/billing/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as BillingMe & { error?: string };
      if (!res.ok) {
        setMe(null);
        return;
      }
      setMe({ balance: data.balance, subscription: data.subscription });
    } catch {
      setMe(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Never leave the Pro auth panel spinning forever if getSession hangs.
    const failSafe = window.setTimeout(() => {
      if (!cancelled) setAuthReady(true);
    }, 3500);

    const finish = (session: { user?: { id?: string; email?: string | null; user_metadata?: Record<string, unknown> } } | null) => {
      if (cancelled) return;
      const u = session?.user;
      setUserId(u?.id ?? null);
      setUserEmail(
        (u?.email as string | undefined) ??
          (u?.user_metadata?.preferred_username as string | undefined) ??
          (u?.user_metadata?.user_name as string | undefined) ??
          null,
      );
      setAuthReady(true);
      window.clearTimeout(failSafe);
      if (u?.id) void refreshMe();
      else setMe(null);
    };

    void supabaseExternal.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          console.warn("[pro] getSession", error.message);
          finish(null);
          return;
        }
        finish(data.session);
      })
      .catch((e) => {
        console.warn("[pro] getSession failed", e);
        finish(null);
      });

    const { data: sub } = supabaseExternal.auth.onAuthStateChange((_e, session) => {
      finish(session);
    });
    return () => {
      cancelled = true;
      window.clearTimeout(failSafe);
      sub.subscription.unsubscribe();
    };
  }, [refreshMe]);

  useEffect(() => {
    if (search.billing === "success") {
      setBanner("Subscription confirmed. Tokens appear within a few seconds.");
      void refreshMe();
      const t = window.setTimeout(() => void refreshMe(), 2500);
      return () => window.clearTimeout(t);
    }
    if (search.billing === "cancelled") {
      setBanner("Checkout cancelled — nothing charged.");
    }
  }, [search.billing, refreshMe]);

  const signInX = async () => {
    setActionError(null);
    setBusy("oauth-x");
    try {
      const { data, error } = await supabaseExternal.auth.signInWithOAuth({
        provider: "x",
        options: {
          redirectTo: oauthReturnTo("/pro"),
          skipBrowserRedirect: false,
        },
      });
      if (error) {
        setActionError(
          error.message || "X sign-in failed. Check that the app URL is allowed in Supabase Auth.",
        );
        return;
      }
      if (!data?.url) {
        setActionError("X sign-in did not return a redirect URL. Is the X provider enabled in Supabase?");
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "X sign-in failed");
    } finally {
      setBusy(null);
    }
  };

  const signInGoogle = async () => {
    setActionError(null);
    setBusy("oauth-google");
    try {
      const { data, error } = await supabaseExternal.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: oauthReturnTo("/pro"),
          skipBrowserRedirect: false,
        },
      });
      if (error) {
        setActionError(
          error.message.includes("redirect") || error.status === 400
            ? "Google blocked sign-in (redirect URI mismatch). In Google Cloud Console add: https://jacbalsongvqvaqlfsbx.supabase.co/auth/v1/callback — then enable Google in Supabase Auth providers."
            : error.message || "Google sign-in failed.",
        );
        return;
      }
      if (!data?.url) {
        setActionError(
          "Google sign-in did not return a redirect URL. Enable Google provider in Supabase Auth.",
        );
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Google sign-in failed");
    } finally {
      setBusy(null);
    }
  };

  const signOut = async () => {
    await supabaseExternal.auth.signOut();
    setMe(null);
  };

  const startCheckout = async (planId: MonthlyPlanId) => {
    setActionError(null);
    const token = await accessToken();
    if (!token) {
      setActionError("Sign in to continue.");
      return;
    }
    setBusy(planId);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ kind: "monthly_plan", planId }),
      });
      const data = (await res.json()) as {
        url?: string;
        error?: string;
        env?: Record<string, boolean | string | null>;
      };
      if (!res.ok || !data.url) {
        let envHint = "";
        if (data.env?.secret_mode === "live") {
          envHint =
            " · Fastest fix: set STRIPE_SECRET_KEY itself to sk_test_… on Production, then Redeploy.";
        }
        setActionError((data.error || "Checkout failed") + envHint);
        return;
      }
      window.location.href = data.url;
    } catch {
      setActionError("Checkout failed");
    } finally {
      setBusy(null);
    }
  };

  const proActive =
    me?.subscription?.status === "active" ||
    me?.subscription?.status === "trialing";

  const runCost = TOKEN_COSTS[PRO_RUN_PACKAGE];
  const canAfford = (me?.balance ?? 0) >= runCost;
  const pkgMeta = DESK_PACKAGES[PRO_RUN_PACKAGE];

  const startPrivateRun = async () => {
    setActionError(null);
    const token = await accessToken();
    if (!token) {
      setActionError("Sign in to run a private analysis.");
      return;
    }
    if (runTopic.trim().length < 8) {
      setActionError("Topic must be at least 8 characters.");
      return;
    }
    setRunBusy(true);
    try {
      const res = await fetch("/api/pro/run", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId: PRO_RUN_PACKAGE,
          topic: runTopic.trim(),
          questions: runQuestions.trim(),
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        reportUrl?: string;
        balance?: number;
      };
      if (!res.ok || !data.reportUrl) {
        setActionError(data.error || "Private run failed");
        void refreshMe();
        return;
      }
      if (typeof data.balance === "number") {
        setMe((prev) =>
          prev ? { ...prev, balance: data.balance as number } : prev,
        );
      } else {
        void refreshMe();
      }
      window.location.href = data.reportUrl;
    } catch {
      setActionError("Private run failed");
    } finally {
      setRunBusy(false);
    }
  };

  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1400px] mx-auto w-full min-w-0 px-2.5 sm:px-4 md:px-6 py-5 sm:py-8 mobile-safe-bottom md:pb-14 relative flex-1 space-y-5 sm:space-y-6">
        <header className="page-hero-banner overflow-hidden min-w-0 relative">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_15%_0%,color-mix(in_oklab,var(--cyan)_22%,transparent),transparent_50%),radial-gradient(ellipse_at_85%_30%,color-mix(in_oklab,var(--amber-signal)_12%,transparent),transparent_45%)]" />
          <div className="relative p-4 sm:p-5 md:p-7 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="page-hero-kicker inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" aria-hidden />
                Pro
              </div>
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-signal/50 bg-amber-signal/15 px-2.5 py-1 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-amber-signal"
                title="Offers and package value props are not final"
              >
                <FlaskConical className="w-3.5 h-3.5" aria-hidden />
                Testing mode
              </span>
            </div>
            {userId ? (
              <>
                <h1 className="page-hero-title text-[1.4rem] sm:text-2xl md:text-[2rem] whitespace-normal md:whitespace-nowrap">
                  Your Pro desk · token wallet ready
                </h1>
                <p className="page-hero-sub mt-2 text-[13px] sm:text-[14.5px] md:whitespace-nowrap md:overflow-hidden md:text-ellipsis">
                  Signed in{userEmail ? ` as ${userEmail}` : ""}. Subscribe for monthly tokens, then
                  run private deep dives — free Library stays open to everyone.
                </p>
              </>
            ) : (
              <>
                <h1 className="page-hero-title text-[1.4rem] sm:text-2xl md:text-[2rem] whitespace-normal md:whitespace-nowrap">
                  Private research with a token wallet
                </h1>
                <p className="page-hero-sub mt-2 text-[13px] sm:text-[14.5px] md:whitespace-nowrap md:overflow-hidden md:text-ellipsis">
                  Monthly plans credit tokens for private deep dives · free{" "}
                  <Link
                    to="/research/library"
                    className="text-cyan underline-offset-2 hover:underline"
                  >
                    Library
                  </Link>{" "}
                  stays open — no account required.
                </p>
              </>
            )}
          </div>
        </header>

        <div className="max-w-[920px] mx-auto w-full space-y-5 sm:space-y-6">
        <aside
          role="status"
          aria-label="Pro testing mode"
          className="rounded-2xl border border-amber-signal/45 bg-amber-signal/[0.1] px-4 py-3.5 sm:px-5 sm:py-4 space-y-2"
        >
          <p className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-amber-signal">
            <FlaskConical className="w-3.5 h-3.5" aria-hidden />
            Testing mode · offers not locked
          </p>
          <p className="text-[13px] sm:text-[13.5px] text-foreground/90 leading-relaxed">
            Starter / Plus / Mega are early checkout experiments. Package copy is still thin —
            full value descriptions, workspace outcomes, and{" "}
            <strong className="font-semibold text-foreground">
              API connectors to popular user workspaces
            </strong>{" "}
            (Notion, Slack, Drive, and similar) land before we lock pricing. Public Library stays
            free; treat paid plans as beta until that ship.
          </p>
        </aside>

        {banner && (
          <p
            role="status"
            className="rounded-xl border border-cyan/30 bg-cyan/[0.08] px-4 py-3 text-[13px] text-foreground/90"
          >
            {banner}
          </p>
        )}

        {/* Account / wallet */}
        <section className="rounded-2xl border border-border/90 bg-card/50 p-4 sm:p-5 space-y-3">
          {!authReady ? (
            <div className="h-10 flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              <span className="text-[12.5px]">Checking sign-in…</span>
            </div>
          ) : userId ? (
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div className="space-y-1.5 min-w-0">
                <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
                  Wallet
                </p>
                <p className="text-[1.65rem] sm:text-3xl font-display font-semibold tracking-tight text-cyan tabular-nums">
                  {me?.balance ?? "—"}
                  <span className="text-[13px] sm:text-sm font-mono font-normal text-muted-foreground ml-2">
                    tokens
                  </span>
                </p>
                <p className="text-[12.5px] text-muted-foreground truncate">
                  {userEmail ? (
                    <span className="font-mono text-foreground/80">{userEmail}</span>
                  ) : (
                    "Signed in"
                  )}
                  {proActive && (
                    <>
                      {" · "}
                      <span className="text-emerald-signal">
                        {planLabel(me?.subscription?.planId)} active
                      </span>
                    </>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void signOut()}
                className="self-start sm:self-auto text-[12px] text-muted-foreground hover:text-cyan underline-offset-2 hover:underline min-h-[36px]"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[13px] text-muted-foreground leading-relaxed max-w-lg">
                Sign in to subscribe and run private analyses. Dashboard and Research stay free
                without an account.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => void signInX()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-display font-semibold border border-border bg-foreground text-background hover:bg-foreground/90 touch-manipulation disabled:opacity-50 min-h-[44px]"
                >
                  {busy === "oauth-x" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                  Continue with X
                </button>
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => void signInGoogle()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-display font-semibold border border-cyan/40 bg-cyan/10 text-cyan hover:bg-cyan/15 touch-manipulation disabled:opacity-50 min-h-[44px]"
                >
                  {busy === "oauth-google" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                  Continue with Google
                </button>
              </div>
            </div>
          )}
          {actionError && (
            <p className="text-[12.5px] text-red-400" role="alert">
              {actionError}
            </p>
          )}
        </section>

        {/* Monthly plans */}
        <section aria-labelledby="pro-plans" className="space-y-3">
          <div className="px-0.5">
            <h2
              id="pro-plans"
              className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground"
            >
              Monthly plans
            </h2>
            <p className="text-[12.5px] text-muted-foreground mt-1">
              Tokens credit on subscribe and each renewal. One active plan per account.{" "}
              <span className="text-amber-signal">Testing — value pack not final.</span>
            </p>
          </div>
          <ul className="grid gap-2.5 sm:grid-cols-3">
            {MONTHLY_PLAN_ORDER.map((id, i) => {
              const p = MONTHLY_PLANS[id];
              const isCurrent = proActive && me?.subscription?.planId === id;
              return (
                <motion.li
                  key={id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className={`rounded-2xl border p-4 flex flex-col gap-2.5 min-h-[168px] ${
                    isCurrent
                      ? "border-cyan/50 bg-cyan/[0.08]"
                      : "border-border/90 bg-card/50"
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <p className="text-[15px] font-display font-semibold">{p.title}</p>
                    <p className="text-[12px] text-muted-foreground leading-snug">{p.blurb}</p>
                  </div>
                  <p className="text-[15px] font-mono text-cyan tabular-nums">
                    ${p.priceUsd}
                    <span className="text-[11px] text-muted-foreground">/mo</span>
                    <span className="text-[12px] text-muted-foreground ml-2">
                      · {p.tokensGranted} tokens
                    </span>
                  </p>
                  <button
                    type="button"
                    disabled={!userId || !!busy || proActive}
                    onClick={() => void startCheckout(id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 rounded-full text-[13px] font-display font-semibold border border-cyan/40 bg-cyan/10 text-cyan hover:bg-cyan/15 disabled:opacity-45 disabled:cursor-not-allowed touch-manipulation"
                  >
                    {busy === id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isCurrent ? (
                      "Current plan"
                    ) : proActive ? (
                      "Plan active"
                    ) : userId ? (
                      "Subscribe"
                    ) : (
                      "Sign in to subscribe"
                    )}
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </section>

        {/* Private run */}
        <section
          aria-labelledby="pro-run"
          className="rounded-2xl border border-cyan/30 bg-card/50 p-4 sm:p-5 space-y-4"
        >
          <div className="space-y-1">
            <h2
              id="pro-run"
              className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground"
            >
              Start a private run
            </h2>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              {pkgMeta.tierLabel} · {runCost} tokens. Writes a private desk report only — never the
              public dashboard.
            </p>
          </div>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              Topic
            </span>
            <textarea
              value={runTopic}
              onChange={(e) => setRunTopic(e.target.value)}
              rows={3}
              disabled={!userId || runBusy}
              placeholder="What should we analyse?"
              className="w-full rounded-xl border border-border bg-background/60 px-3 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-cyan/40 disabled:opacity-50"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              Questions <span className="normal-case tracking-normal">(optional)</span>
            </span>
            <textarea
              value={runQuestions}
              onChange={(e) => setRunQuestions(e.target.value)}
              rows={2}
              disabled={!userId || runBusy}
              placeholder="One question per line"
              className="w-full rounded-xl border border-border bg-background/60 px-3 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-cyan/40 disabled:opacity-50"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3 pt-0.5">
            <button
              type="button"
              disabled={
                !userId || runBusy || runTopic.trim().length < 8 || !canAfford
              }
              onClick={() => void startPrivateRun()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-display font-semibold border border-cyan/50 bg-cyan text-background hover:bg-cyan/90 disabled:opacity-45 disabled:cursor-not-allowed touch-manipulation min-h-[44px]"
            >
              {runBusy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FilePenLine className="w-4 h-4" aria-hidden />
              )}
              {!userId
                ? "Sign in to run"
                : !canAfford
                  ? `Need ${runCost} tokens`
                  : `Run · ${runCost} tokens`}
            </button>
            {userId && (
              <span className="text-[12px] font-mono text-muted-foreground tabular-nums">
                Balance {me?.balance ?? "—"}
              </span>
            )}
          </div>
        </section>

        <aside className="rounded-xl border border-dashed border-border/80 px-4 py-3 text-[12.5px] text-muted-foreground flex items-start gap-2">
          <BookOpen className="w-3.5 h-3.5 mt-0.5 shrink-0 text-cyan" aria-hidden />
          <span>
            Free published research lives under{" "}
            <Link to="/research/library" className="text-cyan hover:underline">
              Research
            </Link>
            . Pro never replaces that surface.
          </span>
        </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
