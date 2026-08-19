import { Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Layers, Trophy } from "lucide-react";

const ACTIONS = [
  {
    id: "topics",
    href: "/research/library" as const,
    search: { section: "topics" as const },
    label: "Topic analysis",
    icon: Layers,
  },
  {
    id: "cases",
    href: "/research/library" as const,
    search: { section: "cases" as const },
    label: "Case studies",
    icon: FileText,
  },
  {
    id: "trackers",
    href: "/research/library" as const,
    search: { section: "trackers" as const },
    label: "Trackers",
    icon: Trophy,
  },
] as const;

/** Shared bottom CTA row — Dashboard + Research. */
export function GoDeeperCTA() {
  return (
    <section
      aria-label="Go deeper"
      className="rounded-xl border border-border/80 bg-card/30 px-2.5 py-2 sm:px-3 sm:py-2.5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
        <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground shrink-0 px-0.5">
          Go deeper
        </span>
        <div className="flex flex-col sm:flex-row flex-1 gap-1.5 sm:gap-2 min-w-0">
          {ACTIONS.map((a) => (
            <Link
              key={a.id}
              to={a.href}
              search={a.search}
              className="group flex-1 inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[40px] px-3 rounded-lg border border-border/90 bg-background/60 hover:border-cyan/50 hover:bg-cyan/5 text-[12.5px] font-medium text-foreground/90 hover:text-cyan transition-colors touch-manipulation"
            >
              <a.icon className="w-3.5 h-3.5 text-cyan shrink-0" aria-hidden />
              <span className="truncate">{a.label}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
