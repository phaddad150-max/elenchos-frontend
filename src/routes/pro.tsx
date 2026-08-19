import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  Coins,
  FilePenLine,
  Loader2,
  LogIn,
  Sparkles,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { supabaseExternal } from "@/integrations/supabase/external-client";
import {
  MONTHLY_PLAN_ORDER,
  MONTHLY_PLANS,
  TOKEN_COSTS,
  type MonthlyPlanId,
} from "@/lib/billing/catalog";
import { DESK_PACKAGES, type DeskPackageId } from "@/lib/research-desk/packages";
import { socialMetaTags } from "@/lib/social-meta";

/** v1: only deep-no-x on /pro UI (API can still accept other packages later). */
const PRO_RUN_PACKAGES: DeskPackageId[] = ["deep-no-x"];

const PRO_SOCIAL = {
  title: "Pro Research Desk · Elenchos",
  description:
    "Monthly Starter, Plus, or Mega plans for research tokens and private analyses. Public Library stays free.",
  url: "https://elenchos.live/pro",
};

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

function ProDeskPage() {
  const search = Route.useSearch();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [me, setMe] = useState<BillingMe | null>(null);
  const [meError, setMeError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [runPkg, setRunPkg] = useState<DeskPackageId>("deep-no-x");
  const [runTopic, setRunTopic] = useState("");
  const [runQuestions, setRunQuestions] = useState("");
  const [runBusy, setRunBusy] = useState(false);

  const refreshMe = useCallback(async () => {
    const token = await accessToken();
    if (!token) {
      setMe(null);
      return;
    }
    setMeError(null);
    try {
      const res = await fetch("/api/billing/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as BillingMe & { error?: string };
      if (!res.ok) {
        setMeError(data.error || "Could not load wallet");
        setMe(null);
        return;
      }
      setMe({ balance: data.balance, subscription: data.subscription });
    } catch {
      setMeError("Could not load wallet");
      setMe(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    supabaseExternal.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      const u = data.session?.user;
      setUserId(u?.id ?? null);
      setUserEmail(u?.email ?? u?.user_metadata?.preferred_username ?? null);
      setAuthLoading(false);
      if (u) void refreshMe();
    });
    const { data: sub } = supabaseExternal.auth.onAuthStateChange((_e, session) => {
      const u = session?.user;
      setUserId(u?.id ?? null);
      setUserEmail(u?.email ?? u?.user_metadata?.preferred_username ?? null);
      if (u) void refreshMe();
      else setMe(null);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [refreshMe]);

  useEffect(() => {
    if (search.billing === "success") {
      setBanner(
        "Subscription checkout complete — monthly tokens appear after Stripe confirms (usually a few seconds).",
      );
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
    const { error } = await supabaseExternal.auth.signInWithOAuth({
      provider: "x",
      options: { redirectTo: `${window.location.origin}/pro` },
    });
    if (error) setActionError(error.message);
  };

  const signInGoogle = async () => {
    setActionError(null);
    const { error } = await supabaseExternal.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/pro` },
    });
    if (error) setActionError(error.message);
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
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setActionError(data.error || "Checkout failed");
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

  const runCost = TOKEN_COSTS[runPkg] ?? 0;
  const canAfford = (me?.balance ?? 0) >= runCost;

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
          packageId: runPkg,
          topic: runTopic.trim(),
          questions: runQuestions.trim(),
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        reportUrl?: string;
        status?: string;
        tokensCharged?: number;
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

      <main className="max-w-[960px] mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 py-6 sm:py-10 mobile-safe-bottom md:pb-14 relative flex-1 space-y-6">
        <header className="page-hero-banner overflow-hidden relative rounded-2xl border border-cyan/25">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_20%_0%,color-mix(in_oklab,var(--cyan)_20%,transparent),transparent_55%)]" />
          <div className="relative p-5 sm:p-7 space-y-3">
            <div className="page-hero-kicker inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" aria-hidden />
              Pro Research Desk
            </div>
            <h1 className="page-hero-title text-[1.45rem] sm:text-2xl md:text-[1.85rem]">
              Monthly plans · private token runs
            </h1>
            <p className="text-[13.5px] sm:text-[14.5px] text-muted-foreground leading-relaxed max-w-2xl">
              Choose Starter, Plus, or Mega (monthly). Tokens refill each period for private
              analyses. Free published work stays in the{" "}
              <Link to="/research/library" className="text-cyan underline-offset-2 hover:underline">
                Library
              </Link>
              . Guest one-time checkout:{" "}
              <Link
                to="/research/commission"
                className="text-cyan underline-offset-2 hover:underline"
              >
                Commission
              </Link>
              .
            </p>
          </div>
        </header>

        {banner && (
          <p
            role="status"
            className="rounded-xl border border-cyan/35 bg-cyan/10 px-4 py-3 text-[13px] text-foreground/90"
          >
            {banner}
          </p>
        )}

        {/* Auth + wallet */}
        <section className="rounded-2xl border border-border bg-card/50 p-4 sm:p-5 space-y-3">
          <h2 className="text-base font-display font-semibold tracking-tight">Account</h2>
          {authLoading ? (
            <p className="text-[13px] text-muted-foreground inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Checking session…
            </p>
          ) : userId ? (
            <div className="space-y-2">
              <p className="text-[13px] text-foreground/90">
                Signed in
                {userEmail ? (
                  <>
                    {" "}
                    as <span className="font-mono text-cyan">{userEmail}</span>
                  </>
                ) : null}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-mono">
                  Balance:{" "}
                  <span className="text-cyan text-lg font-semibold">
                    {me?.balance ?? "—"}
                  </span>{" "}
                  tokens
                </p>
                {proActive && (
                  <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-signal/40 text-emerald-signal">
                    Pro {me?.subscription?.status}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => void refreshMe()}
                  className="text-[12px] text-muted-foreground hover:text-cyan underline-offset-2 hover:underline"
                >
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="text-[12px] text-muted-foreground hover:text-cyan underline-offset-2 hover:underline"
                >
                  Sign out
                </button>
              </div>
              {meError && (
                <p className="text-[12px] text-amber-signal">{meError}</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[13px] text-muted-foreground">
                Sign in to subscribe monthly and keep a private token balance. Browsing the Library
                stays free and anonymous.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void signInX()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-display font-semibold border border-border bg-foreground text-background hover:bg-foreground/90"
                >
                  <LogIn className="w-4 h-4" /> Continue with X
                </button>
                <button
                  type="button"
                  onClick={() => void signInGoogle()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-display font-semibold border border-cyan/40 bg-cyan/10 text-cyan hover:bg-cyan/15"
                >
                  <LogIn className="w-4 h-4" /> Continue with Google
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

        <section
          aria-labelledby="pro-plans"
          className="rounded-2xl border border-border bg-card/50 p-4 sm:p-5 space-y-3"
        >
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-signal" aria-hidden />
            <h2 id="pro-plans" className="text-base font-display font-semibold tracking-tight">
              Monthly plans
            </h2>
          </div>
          <p className="text-[12.5px] text-muted-foreground">
            Three paid options on Stripe. Tokens credit on subscribe and each renewal. One active
            plan per account for now.
          </p>
          <ul className="grid gap-2.5 sm:grid-cols-3">
            {MONTHLY_PLAN_ORDER.map((id) => {
              const p = MONTHLY_PLANS[id];
              const isCurrent =
                proActive && me?.subscription?.planId === id;
              return (
                <li
                  key={id}
                  className={`rounded-xl border p-3.5 space-y-2 flex flex-col ${
                    isCurrent
                      ? "border-cyan/55 bg-cyan/10"
                      : "border-border/80 bg-background/40"
                  }`}
                >
                  <p className="text-sm font-semibold">{p.title}</p>
                  <p className="text-[12px] text-muted-foreground flex-1">{p.blurb}</p>
                  <p className="text-sm font-mono text-cyan">
                    ${p.priceUsd}/mo · {p.tokensGranted} tokens
                  </p>
                  <button
                    type="button"
                    disabled={!userId || !!busy || proActive}
                    onClick={() => void startCheckout(id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 rounded-lg text-[12.5px] font-semibold border border-border hover:border-cyan/45 hover:bg-cyan/5 disabled:opacity-50"
                  >
                    {busy === id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isCurrent ? (
                      "Current plan"
                    ) : proActive ? (
                      "Plan active"
                    ) : userId ? (
                      "Subscribe"
                    ) : (
                      "Sign in"
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="text-[11px] font-mono text-muted-foreground">
            Env: STRIPE_PRICE_PACK_STARTER · _PLUS · _MEGA
          </p>
        </section>

        <section
          aria-labelledby="pro-run"
          className="rounded-2xl border border-cyan/30 bg-card/50 p-4 sm:p-5 space-y-4"
        >
          <div className="space-y-1">
            <h2 id="pro-run" className="text-base font-display font-semibold tracking-tight">
              Start a private run
            </h2>
            <p className="text-[12.5px] text-muted-foreground leading-relaxed">
              Debits your wallet and inserts a private desk report only — never public Topics /
              dashboard KPIs. Same method as guest Commission.
            </p>
          </div>

          <fieldset className="space-y-2" disabled={!userId || runBusy}>
            <legend className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1">
              Package (v1)
            </legend>
            <div className="grid gap-2 sm:grid-cols-1 max-w-md">
              {PRO_RUN_PACKAGES.map((id) => {
                const pkg = DESK_PACKAGES[id];
                const selected = runPkg === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setRunPkg(id)}
                    className={`text-left rounded-xl border p-3 space-y-1 transition-colors ${
                      selected
                        ? "border-cyan/55 bg-cyan/10"
                        : "border-border/80 bg-background/40 hover:border-cyan/35"
                    }`}
                  >
                    <p className="text-[13px] font-semibold">{pkg.tierLabel}</p>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      {pkg.blurb} Topic-analysis and deep+X open later.
                    </p>
                    <p className="text-[12px] font-mono text-cyan">
                      {TOKEN_COSTS[id]} tokens
                    </p>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              Topic
            </span>
            <textarea
              value={runTopic}
              onChange={(e) => setRunTopic(e.target.value)}
              rows={3}
              disabled={!userId || runBusy}
              placeholder="What should we analyse? (public-interest topic)"
              className="w-full rounded-xl border border-border bg-background/60 px-3 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-cyan/40 disabled:opacity-50"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              Questions (optional)
            </span>
            <textarea
              value={runQuestions}
              onChange={(e) => setRunQuestions(e.target.value)}
              rows={3}
              disabled={!userId || runBusy}
              placeholder="One question per line — Socratic prompts help"
              className="w-full rounded-xl border border-border bg-background/60 px-3 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-cyan/40 disabled:opacity-50"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!userId || runBusy || runTopic.trim().length < 8 || !canAfford}
              onClick={() => void startPrivateRun()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-display font-semibold border border-cyan/40 bg-cyan text-background hover:bg-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <p className="text-[12px] text-muted-foreground font-mono">
              Wallet: {me?.balance ?? "—"} · Cost: {runCost}
            </p>
          </div>
        </section>

        <section
          aria-labelledby="pro-costs"
          className="rounded-2xl border border-border bg-card/50 p-4 sm:p-5 space-y-3"
        >
          <h2 id="pro-costs" className="text-base font-display font-semibold tracking-tight">
            Token costs (provisional)
          </h2>
          <ul className="space-y-2 text-[13px]">
            <li className="flex justify-between gap-3 border-b border-border/60 pb-2">
              <span>Topic analysis (T1 · capped X)</span>
              <span className="font-mono text-cyan shrink-0">
                {TOKEN_COSTS["topic-analysis"]} tokens
              </span>
            </li>
            <li className="flex justify-between gap-3 border-b border-border/60 pb-2">
              <span>Deep dive · no X (T2)</span>
              <span className="font-mono text-cyan shrink-0">
                {TOKEN_COSTS["deep-no-x"]} tokens
              </span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Deep dive · + X (T3)</span>
              <span className="font-mono text-cyan shrink-0">
                {TOKEN_COSTS["deep-with-x"]} tokens
              </span>
            </li>
          </ul>
        </section>

        <aside className="rounded-xl border border-dashed border-border p-4 text-[12.5px] text-muted-foreground space-y-2">
          <p className="flex items-start gap-2">
            <BookOpen className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden />
            Free researched material lives only in the Library — Pro never replaces that surface.
          </p>
          <p className="flex items-start gap-2">
            <FilePenLine className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden />
            Need a one-off report without an account? Use guest Commission (USD via Stripe).
          </p>
        </aside>
      </main>

      <SiteFooter />
    </div>
  );
}
