import { Link, useRouterState } from "@tanstack/react-router";
import { Brain, FlaskConical, Library, Sparkles } from "lucide-react";

/**
 * Secondary nav for Research Desk + subpages.
 * Live Topics and topic-analysis commissions stay under /topics only.
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
    icon: Library,
    match: (p: string) =>
      p.startsWith("/research/library") ||
      p.startsWith("/research/preview") ||
      p.startsWith("/research/report") ||
      p.startsWith("/research-migration"),
  },
  {
    to: "/research/networks-ledger",
    label: "Intelligence",
    short: "Intel",
    icon: Brain,
    match: (p: string) =>
      p.startsWith("/research/networks-ledger") ||
      p.startsWith("/research/intelligence") ||
      p.startsWith("/research/fraud-ledger") ||
      p.startsWith("/trackers"),
  },
  {
    to: "/research/commission",
    label: "On-demand",
    short: "On-demand",
    icon: Sparkles,
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
        <ul className="flex items-stretch gap-1 min-w-0 w-max sm:w-full sm:max-w-full sm:flex-wrap rounded-xl border border-border/80 bg-card/85 backdrop-blur-md p-1 shadow-sm">
          {ITEMS.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            return (
              <li key={item.to} className="shrink-0 sm:flex-1 min-w-0">
                <Link
                  to={item.to}
                  className={`flex items-center justify-center gap-1.5 min-h-[42px] sm:min-h-[44px] px-2.5 sm:px-3 rounded-lg text-[11.5px] sm:text-[12.5px] font-medium touch-manipulation transition-colors whitespace-nowrap ${
                    active
                      ? "bg-cyan/15 text-cyan border border-cyan/40 shadow-[0_0_0_1px_color-mix(in_oklab,var(--cyan)_20%,transparent)]"
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
      <p className="mt-1.5 px-0.5 text-[10.5px] text-muted-foreground leading-snug">
        <strong className="font-medium text-foreground/80">Library</strong> = published case
        studies. <strong className="font-medium text-foreground/80">Intelligence</strong> =
        ledgers &amp; citizen trackers. Live Topics stay on{" "}
        <Link to="/topics" className="text-cyan hover:underline font-medium">
          Topics
        </Link>
        .
      </p>
    </nav>
  );
}

/** Compact breadcrumb trail for Research subpages */
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
