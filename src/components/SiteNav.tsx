import { Link } from "@tanstack/react-router";
import { Radio } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { ThemePreferenceTabs } from "@/components/ThemePreferenceTabs";
import { MobileTabBar } from "@/components/MobileTabBar";
import { GlobalSearch } from "@/components/GlobalSearch";
import type { ReactNode } from "react";


function XLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function NewBadge({ className, strokeWidth: _ }: { className?: string; strokeWidth?: number }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[3px] bg-cyan px-[3px] py-[1px] text-[7px] font-bold uppercase leading-none tracking-wider text-background ${className ?? ""}`}
    >
      NEW
    </span>
  );
}

const TABS = [
  { to: "/", label: "Dashboard Overview", icon: null },
  { to: "/topics", label: "Topics", icon: null },
  { to: "/trackers", label: "Trackers", icon: null },
  { to: "/about", label: "About", icon: null },
] as const;
void NewBadge;


export function SiteNav({ rightSlot }: { rightSlot?: ReactNode }) {
  return (
    <>
      <nav className="sticky top-0 z-30 nav-shell">
        <div className="border-b border-border/40 bg-background/40">
          <div className="max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 py-2 flex items-center justify-center">
            <ThemePreferenceTabs />
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 py-2.5 md:py-3.5 flex items-center justify-between gap-2 sm:gap-3">
          <Link to="/" className="flex items-center gap-2 md:gap-3 group min-w-0">
            <div className="brand-mark w-9 h-9 md:w-10 md:h-10 rounded-full grid place-items-center shrink-0">
              <Radio className="w-4 h-4 text-cyan" strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex flex-col leading-none min-w-0">
                <span className="text-xl md:text-2xl font-display font-semibold tracking-tight text-glow-cyan truncate">
                  Elenchos
                </span>
                <span className="hidden sm:block text-[10.5px] font-mono uppercase tracking-[0.18em] text-muted-foreground mt-1">
                  CROSSED EXAMINED PUBLIC DISCOURSE
                </span>
              </div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1 nav-pill-group rounded-full p-1">
            {TABS.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className="nav-tab inline-flex items-center gap-1.5"
                activeProps={{ className: "nav-tab nav-tab-active inline-flex items-center gap-1.5" }}
                activeOptions={{ exact: true }}
              >
                {t.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <GlobalSearch />
            <UserMenu />
            {rightSlot}
            <a
              href="https://x.com/elenchospulse"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-cyan/40 bg-cyan/10 text-cyan hover:bg-cyan/20 text-[11px] font-mono uppercase tracking-[0.18em]"
              aria-label="Follow Elenchos on X"
            >
              <XLogo className="w-3.5 h-3.5" />
              Follow
            </a>
          </div>
        </div>
      </nav>
      <MobileTabBar />
    </>
  );

}
