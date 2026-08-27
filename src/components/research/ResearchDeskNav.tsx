import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";

/**
 * Research secondary nav — Library only (free published work).
 * Private analyses live on /pro. Legacy /research/commission is unlinked.
 */
const ITEMS = [
  {
    to: "/research/library",
    label: "Research Library",
    short: "Library",
    icon: BookOpen,
    match: (p: string) =>
      p.startsWith("/research/library") ||
      p.startsWith("/research/topic") ||
      p.startsWith("/research/casestudy") ||
      p.startsWith("/research/trackers") ||
      p.startsWith("/research/preview") ||
      p.startsWith("/research/report") ||
      p.startsWith("/research-migration") ||
      p.startsWith("/research-aviation") ||
      p.startsWith("/research/networks-ledger") ||
      p.startsWith("/research/speech-reach") ||
      p.startsWith("/trackers"),
  },
] as const;

export function ResearchDeskNav({ className = "" }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Research sections"
      className={`sticky top-[3.25rem] md:top-[3.75rem] z-20 -mx-0.5 mb-4 sm:mb-5 ${className}`}
    >
      <div className="overflow-x-auto scrollbar-none -mx-1 px-1">
        <ul className="rd-nav-shell flex items-stretch gap-1 min-w-0 w-max sm:w-full sm:max-w-xs rounded-xl p-1">
          {ITEMS.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            return (
              <li key={item.to} className="shrink-0 sm:flex-1 min-w-0">
                <Link
                  to={item.to}
                  className={`rd-nav-item flex items-center justify-center gap-1.5 min-h-[42px] sm:min-h-[44px] px-3 sm:px-4 rounded-lg text-[12px] sm:text-[13px] font-medium touch-manipulation whitespace-nowrap ${
                    active
                      ? "rd-nav-item-active"
                      : "text-muted-foreground border border-transparent hover:text-foreground hover:bg-secondary/50"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 opacity-90" aria-hidden />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

type Crumb = { label: string; to?: string };

/**
 * Consistent breadcrumbs: Home > Research Library > [segments]
 */
export function ResearchBreadcrumb({
  current,
  trail,
}: {
  /** Final segment label when trail is not provided */
  current?: string;
  /** Optional full trail after Research Library (overrides current) */
  trail?: Crumb[];
}) {
  const segments: Crumb[] = trail?.length
    ? trail
    : current
      ? [{ label: current }]
      : [];

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
        to="/research/library"
        className="hover:text-cyan touch-manipulation min-h-[32px] inline-flex items-center shrink-0"
      >
        Research Library
      </Link>
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        return (
          <span key={`${seg.label}-${i}`} className="contents">
            <span aria-hidden className="opacity-50">
              /
            </span>
            {seg.to && !isLast ? (
              <Link
                to={seg.to}
                className="hover:text-cyan touch-manipulation min-h-[32px] inline-flex items-center shrink-0"
              >
                {seg.label}
              </Link>
            ) : (
              <span className="text-foreground/90 font-medium truncate min-w-0">
                {seg.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

/** Sticky back link for deep Research Library pages */
export function ResearchBackBar({
  to = "/research/library",
  label = "Back to Library",
}: {
  to?: string;
  label?: string;
}) {
  return (
    <div className="mb-3">
      <Link
        to={to}
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-cyan hover:underline min-h-[40px] touch-manipulation"
      >
        <span aria-hidden>←</span> {label}
      </Link>
    </div>
  );
}
