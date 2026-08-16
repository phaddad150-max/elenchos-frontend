import { Link, useRouterState } from "@tanstack/react-router";
import { MessageSquareShare, Shield } from "lucide-react";

/**
 * Sibling branches under Networks Ledger:
 * Terror & Finance · Speech Reach
 *
 * Speech Reach uses /research/speech-reach (not nested under networks-ledger)
 * so TanStack never keeps the parent ledger page mounted.
 */
const BRANCHES = [
  {
    to: "/research/networks-ledger" as const,
    label: "Terror & Finance",
    description: "Aggregate official actions · names on source lists",
    icon: Shield,
    match: (p: string) =>
      p === "/research/networks-ledger" || p === "/research/networks-ledger/",
  },
  {
    to: "/research/speech-reach" as const,
    label: "Speech Reach",
    description: "Algorithmic distribution of public speech",
    icon: MessageSquareShare,
    match: (p: string) =>
      p === "/research/speech-reach" ||
      p === "/research/speech-reach/" ||
      p.includes("speech-reach"),
  },
] as const;

export function LedgerBranchNav({ className = "" }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Networks Ledger branches"
      className={`mb-5 sm:mb-6 ${className}`}
    >
      <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground mb-2 px-0.5">
        Networks Ledger branches
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
        {BRANCHES.map((b) => {
          const active = b.match(pathname);
          const Icon = b.icon;
          return (
            <Link
              key={b.to}
              to={b.to}
              preload="intent"
              className={`group relative flex items-start gap-3 rounded-xl border p-3 sm:p-3.5 transition-colors min-h-[72px] touch-manipulation ${
                active
                  ? "border-cyan/50 bg-cyan/[0.08] shadow-[0_0_24px_-12px_var(--cyan-glow)]"
                  : "border-border/80 bg-card/40 hover:border-cyan/35 hover:bg-card/60"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span
                className={`w-10 h-10 rounded-xl border grid place-items-center shrink-0 ${
                  active
                    ? "border-cyan/40 bg-cyan/15 text-cyan"
                    : "border-border/80 bg-secondary/40 text-muted-foreground group-hover:text-cyan"
                }`}
              >
                <Icon className="w-5 h-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[14px] font-display font-semibold ${
                      active ? "text-cyan" : "text-foreground group-hover:text-cyan"
                    }`}
                  >
                    {b.label}
                  </span>
                  {active && (
                    <span className="text-[9px] font-mono uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full border border-cyan/40 text-cyan bg-cyan/10">
                      Viewing
                    </span>
                  )}
                </span>
                <span className="block text-[12px] text-muted-foreground mt-0.5 leading-snug">
                  {b.description}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
