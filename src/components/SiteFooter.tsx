import { Link } from "@tanstack/react-router";
import { ContactEmailMe } from "@/components/ContactEmailMe";
import { ELENCHOS_TAGLINE } from "@/lib/brand";

/** Site footer: nav CTAs + legal. Keep short; story lives on About. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-6 pb-20 md:pb-0">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 space-y-2.5 text-muted-foreground">
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-[12px] font-mono"
        >
          <Link to="/" className="text-cyan hover:underline">
            Dashboard
          </Link>
          <Link to="/topics" className="text-cyan hover:underline">
            Topics
          </Link>
          <Link to="/research" className="text-cyan hover:underline">
            Research
          </Link>
          <Link to="/research/library" className="text-cyan hover:underline">
            Library
          </Link>
          <Link to="/research/commission" className="text-cyan hover:underline">
            On-demand · $10
          </Link>
          <Link to="/about" className="hover:text-cyan hover:underline">
            About
          </Link>
          <Link to="/privacy" className="hover:text-cyan hover:underline">
            Privacy
          </Link>
          <ContactEmailMe
            source="footer"
            variant="inline"
            className="text-[11px] sm:text-[12px] font-mono"
          />
        </nav>
        <p className="text-[10px] sm:text-[11px] font-mono leading-relaxed">
          {ELENCHOS_TAGLINE} Independent experimental research. Provided &ldquo;as is&rdquo;. Not
          professional advice.
        </p>
        <p className="text-[10px] sm:text-[11px] font-mono">&copy; 2026 Elenchos</p>
      </div>
    </footer>
  );
}
