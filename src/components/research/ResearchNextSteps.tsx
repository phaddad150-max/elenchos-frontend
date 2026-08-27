import { Link } from "@tanstack/react-router";
import { BookOpen, Home } from "lucide-react";
import { ContactEmailMe } from "@/components/ContactEmailMe";

type Props = {
  /** Short context for a custom-research contact hint */
  contextHint?: string;
  showHome?: boolean;
  showLibrary?: boolean;
  showContact?: boolean;
  /** @deprecated unused */
  showPro?: boolean;
  /** @deprecated unused */
  showCommission?: boolean;
  showTopics?: boolean;
  className?: string;
};

/**
 * Bottom journey CTAs for free reports: Library + Home + contact.
 */
export function ResearchNextSteps({
  contextHint,
  showHome = true,
  showLibrary = true,
  showContact = true,
  showPro: _showPro,
  showCommission: _showCommission,
  showTopics: _showTopics,
  className = "",
}: Props) {
  const note = contextHint
    ? `Keep browsing the free Library, or contact us about “${contextHint.slice(0, 80)}${contextHint.length > 80 ? "…" : ""}”.`
    : "Keep browsing free published work, or contact us for custom research.";

  return (
    <section
      aria-label="Next steps"
      className={`rounded-2xl border border-border/90 bg-card/50 p-4 sm:p-5 space-y-3 ${className}`}
    >
      <h2 className="text-[13px] font-display font-semibold text-foreground">
        What’s next
      </h2>
      <p className="text-[12.5px] text-muted-foreground leading-snug">{note}</p>
      <div className="flex flex-col sm:flex-row flex-wrap gap-2">
        {showContact && (
          <ContactEmailMe
            source="research-next"
            variant="button"
            className="btn-intel-primary inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-full text-[13px] font-semibold touch-manipulation"
            defaultMessage={
              contextHint
                ? `Hi — I’d like to ask about custom research on “${contextHint.slice(0, 120)}”.\n\n`
                : "Hi — I’d like to ask about custom research.\n\n"
            }
          >
            Custom research · contact
          </ContactEmailMe>
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
