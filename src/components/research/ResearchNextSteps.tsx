import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Home, Sparkles } from "lucide-react";

type Props = {
  /** Short context for Pro analyses hint */
  contextHint?: string;
  showHome?: boolean;
  showLibrary?: boolean;
  showPro?: boolean;
  /** @deprecated use showPro — guest commission removed */
  showCommission?: boolean;
  showTopics?: boolean;
  className?: string;
};

/**
 * Bottom journey CTAs for free reports: Pro analyses + Research Library (+ Home).
 * Guest commission / $10 deepen CTAs are retired.
 */
export function ResearchNextSteps({
  contextHint,
  showHome = true,
  showLibrary = true,
  showPro = true,
  showCommission: _showCommission,
  showTopics: _showTopics,
  className = "",
}: Props) {
  const proNote = contextHint
    ? `Want a private analysis on “${contextHint.slice(0, 80)}${contextHint.length > 80 ? "…" : ""}”? Run it on Pro.`
    : "Want a private analysis on your own question? Run Pro analyses with a token wallet.";

  return (
    <section
      aria-label="Next steps"
      className={`rounded-2xl border border-border/90 bg-card/50 p-4 sm:p-5 space-y-3 ${className}`}
    >
      <h2 className="text-[13px] font-display font-semibold text-foreground">
        What’s next
      </h2>
      <p className="text-[12.5px] text-muted-foreground leading-snug">{proNote}</p>
      <div className="flex flex-col sm:flex-row flex-wrap gap-2">
        {showPro && (
          <Link
            to="/pro"
            className="btn-intel-primary inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-full text-[13px] font-semibold touch-manipulation"
          >
            <Sparkles className="w-4 h-4" aria-hidden />
            Private analyses on Pro
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
        {showLibrary && (
          <Link
            to="/research/library"
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-full border border-border text-[13px] font-medium text-muted-foreground hover:text-cyan hover:border-cyan/40 touch-manipulation"
          >
            <BookOpen className="w-4 h-4" aria-hidden />
            Research Library
          </Link>
        )}
        {showHome && (
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-full border border-border text-[13px] font-medium text-muted-foreground hover:text-cyan hover:border-cyan/40 touch-manipulation"
          >
            <Home className="w-4 h-4" aria-hidden />
            Home
          </Link>
        )}
      </div>
    </section>
  );
}
