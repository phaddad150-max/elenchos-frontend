import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, FilePenLine, Layers } from "lucide-react";

type Props = {
  /** Short context for commission prefill (topic or report name) */
  contextHint?: string;
  showTopics?: boolean;
  showLibrary?: boolean;
  showCommission?: boolean;
  className?: string;
};

/**
 * One primary CTA + optional secondary next steps at the bottom of free reports.
 */
export function ResearchNextSteps({
  contextHint,
  showTopics = true,
  showLibrary = true,
  showCommission = true,
  className = "",
}: Props) {
  const commissionTo = "/research/commission";
  const commissionNote = contextHint
    ? `Want a private brief on “${contextHint.slice(0, 80)}${contextHint.length > 80 ? "…" : ""}”?`
    : "Want a private multi-source brief on your own question?";

  return (
    <section
      aria-label="Next steps"
      className={`rounded-2xl border border-border/90 bg-card/50 p-4 sm:p-5 space-y-3 ${className}`}
    >
      <h2 className="text-[13px] font-display font-semibold text-foreground">
        What’s next
      </h2>
      <p className="text-[12.5px] text-muted-foreground leading-snug">
        {commissionNote}
      </p>
      <div className="flex flex-col sm:flex-row flex-wrap gap-2">
        {showCommission && (
          <Link
            to={commissionTo}
            className="btn-intel-primary inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-full text-[13px] font-semibold touch-manipulation"
          >
            <FilePenLine className="w-4 h-4" aria-hidden />
            Commission a report · $10 / $20
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
        {showLibrary && (
          <Link
            to="/research/library"
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-full border border-border text-[13px] font-medium text-muted-foreground hover:text-cyan hover:border-cyan/40 touch-manipulation"
          >
            <BookOpen className="w-4 h-4" aria-hidden />
            Back to Library
          </Link>
        )}
        {showTopics && (
          <Link
            to="/topics"
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-full border border-border text-[13px] font-medium text-muted-foreground hover:text-cyan hover:border-cyan/40 touch-manipulation"
          >
            <Layers className="w-4 h-4" aria-hidden />
            Open Topics
          </Link>
        )}
      </div>
    </section>
  );
}
