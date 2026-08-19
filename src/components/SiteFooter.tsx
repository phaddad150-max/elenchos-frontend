import { Link } from "@tanstack/react-router";
import { ContactEmailMe } from "@/components/ContactEmailMe";
import { ELENCHOS_TAGLINE } from "@/lib/brand";
import { requestConsentPreferences } from "@/lib/privacy-consent";

/** Site footer: main nav + legal. Library lives under Research; no public commission CTAs. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 mt-8 pb-20 md:pb-0 bg-gradient-to-t from-card/40 to-transparent">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 space-y-3 text-muted-foreground">
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[11px] sm:text-[12px] font-mono"
        >
          <Link to="/" className="text-cyan hover:underline">
            Dashboard
          </Link>
          <Link to="/research/library" className="text-cyan hover:underline">
            Research
          </Link>
          <Link to="/pro" className="text-cyan hover:underline">
            Pro
          </Link>
          <Link to="/about" className="hover:text-cyan hover:underline">
            About
          </Link>
          <Link to="/privacy" className="hover:text-cyan hover:underline">
            Privacy
          </Link>
          <ContactEmailMe
            source="footer-enterprise"
            variant="inline"
            className="text-[11px] sm:text-[12px] font-mono text-cyan"
            defaultMessage="Hi — I'm interested in Enterprise: personalized dashboards and custom research.\n\n"
            dialogTitle="Enterprise inquiry"
            dialogDescription="Personalized dashboards, custom topics, team research. Contact only — no self-serve checkout."
          >
            Enterprise
          </ContactEmailMe>
          <button
            type="button"
            onClick={() => requestConsentPreferences()}
            className="hover:text-cyan hover:underline"
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
