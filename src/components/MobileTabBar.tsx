import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Layers, Scale, Info } from "lucide-react";

const TABS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/topics", label: "Topics", icon: Layers },
  { to: "/trackers", label: "Trackers", icon: Scale },
  { to: "/about", label: "About", icon: Info },
] as const;

export function MobileTabBar() {
  return (
    <nav
      aria-label="Primary mobile navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-4">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <li key={t.to}>
              <Link
                to={t.to}
                activeOptions={{ exact: true }}
                className="flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground"
                activeProps={{
                  className:
                    "flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-mono uppercase tracking-[0.14em] text-cyan",
                }}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
                <span>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
