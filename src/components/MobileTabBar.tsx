import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Layers, BrainCircuit, Info } from "lucide-react";

const TABS = [
  { to: "/", label: "Home", match: (p: string) => p === "/", icon: LayoutDashboard },
  {
    to: "/topics",
    label: "Topics",
    match: (p: string) => p === "/topics" || p.startsWith("/topics/"),
    icon: Layers,
  },
  {
    to: "/trackers",
    label: "Trackers",
    match: (p: string) => p === "/trackers" || p.startsWith("/trackers/"),
    icon: BrainCircuit,
  },
  { to: "/about", label: "About", match: (p: string) => p === "/about", icon: Info },
] as const;

export function MobileTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Primary"
      className="mobile-tab-bar md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-4 gap-0.5 px-1 pt-1 pb-0.5">
        {TABS.map((t) => {
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
                <Icon
                  className={`w-5 h-5 ${active ? "text-cyan" : ""}`}
                  strokeWidth={active ? 2.4 : 2}
                  aria-hidden
                />
                <span className="leading-none">{t.label}</span>
                {active && (
                  <span
                    className="mt-0.5 h-0.5 w-5 rounded-full bg-cyan"
                    aria-hidden
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
