import { Link, useRouterState } from "@tanstack/react-router";
import { FlaskConical, LayoutDashboard, Radio, Wallet } from "lucide-react";
import { useEffect, type CSSProperties, type ReactNode } from "react";
import type { LiveDesk } from "@/lib/desk/types";
import { isUaeDemoSlug } from "@/lib/desk/catalog";

export function TenantShell({
  desk,
  children,
}: {
  desk: LiveDesk | null;
  children: ReactNode;
}) {
  if (!desk) {
    return (
      <div className="page-shell dash-landing">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <main className="max-w-[640px] mx-auto px-4 py-16 text-center space-y-2 relative">
          <p className="text-[1.35rem] font-display font-semibold tabular-nums">0</p>
          <p className="text-[13px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
            Awaiting data
          </p>
          <p className="text-[14px] text-muted-foreground">This desk is not live yet. Generate a URL from studio.</p>
        </main>
      </div>
    );
  }

  const { tenant, branding } = desk;
  const slug = tenant.slug || "";
  const title = branding.org_name || tenant.org_name || "Public discourse desk";
  const primary = branding.primary_color || "#22d3ee";
  const accent = branding.accent_color || "#f59e0b";
  const uae = isUaeDemoSlug(tenant.slug) || tenant.email === "uae-demo@elenchos.live";
  const walk =
    uae ||
    tenant.email === "demo@elenchos.live" ||
    tenant.email === "uae-demo@elenchos.live";

  const solvoBlue = "#1E4ED8";

  useEffect(() => {
    if (!uae) return;
    const root = document.documentElement;
    const hadDark = root.classList.contains("dark");
    const hadLight = root.classList.contains("light");
    const brandVars = [
      ["--cyan", solvoBlue],
      ["--cyan-glow", "color-mix(in oklab, #1E4ED8 40%, transparent)"],
      ["--primary", solvoBlue],
      ["--accent", solvoBlue],
      ["--ring", solvoBlue],
      ["--magenta", solvoBlue],
    ] as const;
    root.classList.remove("dark");
    root.classList.add("light");
    for (const [prop, value] of brandVars) root.style.setProperty(prop, value);
    return () => {
      root.classList.remove("light");
      if (hadDark) root.classList.add("dark");
      else if (hadLight) root.classList.add("light");
      for (const [prop] of brandVars) root.style.removeProperty(prop);
    };
  }, [uae]);

  return (
    <div
      className={`min-h-screen relative flex flex-col dash-landing ${uae ? "solvo-light light" : ""}`}
      style={
        uae
          ? ({
              ["--cyan" as string]: solvoBlue,
              ["--cyan-glow" as string]: "color-mix(in oklab, #1E4ED8 40%, transparent)",
              ["--primary" as string]: solvoBlue,
              ["--accent" as string]: solvoBlue,
              ["--ring" as string]: solvoBlue,
              ["--magenta" as string]: solvoBlue,
            } as CSSProperties)
          : ({
              ["--cyan" as string]: primary,
              ["--cyan-glow" as string]: `${primary}73`,
              ["--amber-signal" as string]: accent,
            } as CSSProperties)
      }
    >
      {uae ? null : <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />}
      <header className="sticky top-0 z-30 nav-shell">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 py-2.5 md:py-3 flex items-center gap-3">
          {branding.logo_url ? (
            <img
              src={branding.logo_url}
              alt={uae ? "Solvo Creations" : ""}
              className={
                branding.logo_url.includes("solvo")
                  ? "h-10 w-auto max-w-[168px] object-contain object-left"
                  : "h-9 w-9 rounded-full object-cover border border-cyan/35"
              }
            />
          ) : (
            <div className="brand-mark w-9 h-9 rounded-full grid place-items-center shrink-0">
              <Radio className="w-4 h-4 text-cyan" strokeWidth={2.5} />
            </div>
          )}
          {uae ? (
            <div className="min-w-0 flex-1" />
          ) : (
            <div className="min-w-0 flex-1">
              <p className="font-display font-semibold text-lg sm:text-xl tracking-tight truncate">{title}</p>
              <p className="hidden sm:block text-[10.5px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
                {walk ? "Walkthrough desk · not a paid tenant" : "Public discourse desk"}
              </p>
            </div>
          )}
          <nav className="hidden md:flex items-center gap-1 nav-pill-group rounded-full p-1" aria-label="Desk pages">
            {uae ? (
              <SolvoDesktopPills />
            ) : (
              <>
                <Link
                  to="/d/$slug"
                  params={{ slug }}
                  className="nav-tab inline-flex items-center"
                  activeProps={{ className: "nav-tab nav-tab-active inline-flex items-center" }}
                  activeOptions={{ exact: true }}
                >
                  Overview
                </Link>
                <Link
                  to="/d/$slug/research"
                  params={{ slug }}
                  className="nav-tab inline-flex items-center"
                  activeProps={{ className: "nav-tab nav-tab-active inline-flex items-center" }}
                >
                  Research
                </Link>
              </>
            )}
          </nav>
        </div>
        {uae ? null : (
          <nav className="md:hidden px-3 pb-2 flex gap-2" aria-label="Desk pages mobile">
            <Link
              to="/d/$slug"
              params={{ slug }}
              className="flex-1 min-h-[44px] rounded-xl border border-border text-center text-[13px] font-display font-semibold grid place-items-center"
              activeProps={{ className: "flex-1 min-h-[44px] rounded-xl border border-cyan/50 bg-cyan/15 text-cyan text-center text-[13px] font-display font-semibold grid place-items-center" }}
              activeOptions={{ exact: true }}
            >
              Overview
            </Link>
            <Link
              to="/d/$slug/research"
              params={{ slug }}
              className="flex-1 min-h-[44px] rounded-xl border border-border text-center text-[13px] font-display font-semibold grid place-items-center"
              activeProps={{ className: "flex-1 min-h-[44px] rounded-xl border border-cyan/50 bg-cyan/15 text-cyan text-center text-[13px] font-display font-semibold grid place-items-center" }}
            >
              Research
            </Link>
          </nav>
        )}
      </header>
      {children}
      {uae ? <SolvoMobileTabBar /> : null}
      {branding.unbranded ? (
        <div className="h-8" />
      ) : (
        <footer className="border-t border-border/80 mt-4 pb-20 md:pb-8 bg-gradient-to-t from-card/40 to-transparent">
          <p className="max-w-[1600px] mx-auto px-4 py-3 text-[11px] font-mono text-muted-foreground">
            {uae ? (
              <>
                Simulated preview ·{" "}
                <a href="https://www.solvocreations.com/" className="text-cyan hover:underline">
                  solvocreations.com
                </a>
              </>
            ) : (
              <>
                Desk hosted on elenchos.live
                {tenant.custom_domain ? ` · connect ${tenant.custom_domain}` : ""}
              </>
            )}
          </p>
        </footer>
      )}
    </div>
  );
}

const SOLVO_TABS = [
  {
    to: "/solvocreations-uae" as const,
    label: "Dashboard",
    match: (p: string) => p === "/solvocreations-uae" || p === "/solvocreations-uae/",
    icon: LayoutDashboard,
  },
  {
    to: "/solvocreations-uae/research" as const,
    label: "Research Desk",
    match: (p: string) =>
      p.startsWith("/solvocreations-uae/research") ||
      p.startsWith("/solvocreations-uae/topic") ||
      p.startsWith("/solvocreations-uae/casestudy"),
    icon: FlaskConical,
  },
  {
    to: "/solvocreations-uae/desk" as const,
    label: "Desk",
    match: (p: string) => p.startsWith("/solvocreations-uae/desk"),
    icon: Wallet,
  },
];

function SolvoDesktopPills() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <>
      {SOLVO_TABS.map((t) => {
        const active = t.match(pathname);
        return (
          <Link
            key={t.to}
            to={t.to}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "nav-tab nav-tab-active inline-flex items-center"
                : "nav-tab inline-flex items-center"
            }
          >
            {t.label}
          </Link>
        );
      })}
    </>
  );
}

function SolvoMobileTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      aria-label="Primary"
      className="mobile-tab-bar md:hidden fixed bottom-0 inset-x-0 z-40"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid gap-0.5 px-1 pt-1 pb-0.5 grid-cols-3">
        {SOLVO_TABS.map((t) => {
          const Icon = t.icon;
          const active = t.match(pathname);
          return (
            <li key={t.to}>
              <Link
                to={t.to}
                aria-current={active ? "page" : undefined}
                className={`mobile-tab flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] rounded-xl text-[11px] font-display font-semibold tracking-wide touch-manipulation transition-colors ${
                  active
                    ? "mobile-tab-active text-cyan bg-cyan/12"
                    : "text-muted-foreground active:bg-secondary/70"
                }`}
              >
                <span className="relative inline-flex">
                  <Icon
                    className={`w-5 h-5 ${active ? "text-cyan" : ""}`}
                    strokeWidth={active ? 2.4 : 2}
                    aria-hidden
                  />
                </span>
                <span className="leading-none">{t.label}</span>
                {active ? <span className="mt-0.5 h-0.5 w-5 rounded-full bg-cyan" aria-hidden /> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
