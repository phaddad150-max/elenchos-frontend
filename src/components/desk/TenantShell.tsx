import { Link } from "@tanstack/react-router";
import { Radio } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import type { LiveDesk } from "@/lib/desk/types";
import { UAE_DEMO_SLUG } from "@/lib/desk/catalog";

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
  const uae = tenant.slug === UAE_DEMO_SLUG || tenant.email === "uae-demo@elenchos.live";
  const walk =
    uae ||
    tenant.email === "demo@elenchos.live" ||
    tenant.email === "uae-demo@elenchos.live";

  return (
    <div
      className="min-h-screen relative flex flex-col dash-landing"
      style={
        {
          ["--cyan" as string]: primary,
          ["--cyan-glow" as string]: `${primary}73`,
          ["--amber-signal" as string]: accent,
        } as CSSProperties
      }
    >
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <header className="sticky top-0 z-30 nav-shell">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 py-2.5 md:py-3 flex items-center gap-3">
          {branding.logo_url ? (
            <img
              src={branding.logo_url}
              alt=""
              className="h-9 w-9 rounded-full object-cover border border-cyan/35"
            />
          ) : (
            <div className="brand-mark w-9 h-9 rounded-full grid place-items-center shrink-0">
              <Radio className="w-4 h-4 text-cyan" strokeWidth={2.5} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-display font-semibold text-lg sm:text-xl tracking-tight truncate">{title}</p>
            <p className="hidden sm:block text-[10.5px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              {uae
                ? "Workforce speech · method locked"
                : walk
                  ? "Walkthrough desk · not a paid tenant"
                  : "Public discourse desk"}
            </p>
          </div>
          <nav className="hidden md:flex items-center gap-1 nav-pill-group rounded-full p-1" aria-label="Desk pages">
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
          </nav>
        </div>
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
      </header>
      {children}
      {branding.unbranded ? (
        <div className="h-8" />
      ) : (
        <footer className="border-t border-border/80 mt-4 pb-20 md:pb-8 bg-gradient-to-t from-card/40 to-transparent">
          <p className="max-w-[1600px] mx-auto px-4 py-3 text-[11px] font-mono text-muted-foreground">
            Desk hosted on elenchos.live
            {tenant.custom_domain ? ` · connect ${tenant.custom_domain}` : ""}
          </p>
        </footer>
      )}
    </div>
  );
}
