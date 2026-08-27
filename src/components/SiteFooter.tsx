import { Link } from "@tanstack/react-router";
import { ContactEmailMe } from "@/components/ContactEmailMe";
import { ELENCHOS_TAGLINE } from "@/lib/brand";
import { requestConsentPreferences } from "@/lib/privacy-consent";

const linkClass =
  "text-cyan hover:underline touch-manipulation min-h-[32px] inline-flex items-center";

/** Site footer: main nav + legal. Cyan links. Contact me > Enterprise. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 mt-8 pb-20 md:pb-0 bg-gradient-to-t from-card/40 to-transparent">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 space-y-3 text-muted-foreground">
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[11px] sm:text-[12px] font-mono"
        >
          <Link to="/" className={linkClass}>
            Dashboard
          </Link>
          <Link to="/research/library" className={linkClass}>
            Research Library
          </Link>
          <Link to="/pro" className={linkClass}>
            Pro
          </Link>
          <Link to="/about" className={linkClass}>
            About
          </Link>
          <Link to="/privacy" className={linkClass}>
            Privacy
          </Link>
          <ContactEmailMe
            source="footer-contact"
            variant="inline"
            className={`${linkClass} text-[11px] sm:text-[12px] font-mono`}
            defaultMessage="Hi — I’d like to get in touch about Elenchos.\n\n"
            dialogTitle="Contact me"
            dialogDescription="Corrections, partnerships, privacy rights, or custom research. We read every message."
          >
            Contact me
          </ContactEmailMe>
          <button
            type="button"
            onClick={() => requestConsentPreferences()}
            className={linkClass}
          >
            Cookies
          </button>
        </nav>
        {ELENCHOS_TAGLINE ? (
          <p className="text-[10.5px] sm:text-[11px] text-muted-foreground/90 max-w-3xl leading-relaxed">
            {ELENCHOS_TAGLINE}
          </p>
        ) : null}
      </div>
    </footer>
  );
}
