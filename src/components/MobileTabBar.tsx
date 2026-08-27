import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FlaskConical, Sparkles, Info } from "lucide-react";
import { useAdminSession } from "@/lib/use-admin-session";

/** Main nav (mobile): Dashboard · Research · Pro · About — Library nested under Research only. */
const TABS = [
  { to: "/", label: "Home", match: (p: string) => p === "/", icon: LayoutDashboard },
  {
    to: "/research/library",
    label: "Research",
    match: (p: string) =>
      p === "/research" ||
      p.startsWith("/research/") ||
      p.startsWith("/research-") ||
      p === "/trackers" ||
      p.startsWith("/trackers/") ||
      p === "/topics" ||
      p.startsWith("/topics/"),
    icon: FlaskConical,
  },
  {
    to: "/pro",
    label: "Pro",
    match: (p: string) => p === "/pro" || p.startsWith("/pro/"),
    icon: Sparkles,
  },
  { to: "/about", label: "About", match: (p: string) => p === "/about", icon: Info },
] as const;

export function MobileTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showPro = useAdminSession();
  const tabs = showPro ? TABS : TABS.filter((t) => t.to !== "/pro");

  return (
    <nav
      aria-label="Primary"
      className="mobile-tab-bar md:hidden fixed bottom-0 inset-x-0 z-40"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className={`grid gap-0.5 px-1 pt-1 pb-0.5 ${showPro ? "grid-cols-4" : "grid-cols-3"}`}>
        {tabs.map((t) => {
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
                  {t.to === "/pro" && (
                    <span className="absolute -top-2 -right-3.5 inline-flex items-center justify-center rounded-md bg-cyan px-1 py-0.5 text-[9px] font-bold uppercase leading-none tracking-wide text-background shadow-[0_0_8px_-1px_rgba(0,200,200,0.7)]">
                      NEW
                    </span>
                  )}
                </span>
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
