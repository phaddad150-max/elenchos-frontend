import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, FlaskConical, FilePenLine } from "lucide-react";

/**
 * Research Desk secondary nav — three doors only:
 * Desk (hub) · Library (all free work) · Commission report (paid)
 */
const ITEMS = [
  {
    to: "/research",
    label: "Desk",
    short: "Desk",
    icon: FlaskConical,
    match: (p: string) => p === "/research" || p === "/research/",
  },
  {
    to: "/research/library",
    label: "Library",
    short: "Library",
    icon: BookOpen,
    match: (p: string) =>
      p.startsWith("/research/library") ||
      p.startsWith("/research/preview") ||
      p.startsWith("/research/report") ||
      p.startsWith("/research-migration") ||
      p.startsWith("/research/networks-ledger") ||
      p.startsWith("/research/speech-reach") ||
      p.startsWith("/research/intelligence") ||
      p.startsWith("/research/fraud-ledger") ||
      p.startsWith("/trackers"),
  },
  {
    to: "/research/commission",
    label: "Commission report",
    short: "Commission",
    icon: FilePenLine,
    match: (p: string) => p.startsWith("/research/commission"),
  },
] as const;

export function ResearchDeskNav({ className = "" }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Research Desk sections"
      className={`sticky top-[3.25rem] md:top-[3.75rem] z-20 -mx-0.5 mb-4 sm:mb-5 ${className}`}
    >
      <div className="overflow-x-auto scrollbar-none -mx-1 px-1">
        <ul className="rd-nav-shell flex items-stretch gap-1 min-w-0 w-max sm:w-full sm:max-w-full rounded-xl p-1">
          {ITEMS.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            return (
              <li key={item.to} className="shrink-0 sm:flex-1 min-w-0">
                <Link
                  to={item.to}
                  className={`rd-nav-item flex items-center justify-center gap-1.5 min-h-[42px] sm:min-h-[44px] px-2.5 sm:px-3 rounded-lg text-[11.5px] sm:text-[12.5px] font-medium touch-manipulation whitespace-nowrap ${
                    active
                      ? "rd-nav-item-active"
                      : "text-muted-foreground border border-transparent hover:text-foreground hover:bg-secondary/50"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 opacity-90" aria-hidden />
                  <span className="sm:hidden">{item.short}</span>
                  <span className="hidden sm:inline truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export function ResearchBreadcrumb({ current }: { current: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] text-muted-foreground mb-2 min-w-0"
    >
      <Link
        to="/"
        className="hover:text-cyan touch-manipulation min-h-[32px] inline-flex items-center shrink-0"
      >
        Home
      </Link>
      <span aria-hidden className="opacity-50">
        /
      </span>
      <Link
        to="/research"
        className="hover:text-cyan touch-manipulation min-h-[32px] inline-flex items-center shrink-0"
      >
        Research Desk
      </Link>
      <span aria-hidden className="opacity-50">
        /
      </span>
      <span className="text-foreground/90 font-medium truncate min-w-0">{current}</span>
    </nav>
  );
}
