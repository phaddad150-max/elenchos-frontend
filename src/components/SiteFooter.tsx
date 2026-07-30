import { Link } from "@tanstack/react-router";
import { ContactEmailMe } from "@/components/ContactEmailMe";

/**
 * Single footer block: human operator, privacy, contact, short legal.
 * Avoids repeating GDPR strip + disclaimer + contact as three near-duplicates.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-6 pb-20 md:pb-0">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 space-y-3 text-muted-foreground">
        <p className="text-[11px] sm:text-[12px] leading-relaxed max-w-3xl">
          <strong className="text-foreground/90">elenchos.live</strong> is run and managed by a
          human: an ordinary person with experience in communications, research, data analysis,
          digital ecosystems, APIs, and AI tools. This dashboard is not operated by an autonomous
          agent or bot. AI assistance (xAI / SpaceXAI models only) is used for coding, development,
          fetching, filtering, analysis, and reasoning under that human’s direction.
        </p>
        <p className="text-[10px] sm:text-[11px] font-mono leading-relaxed">
          <Link to="/privacy" className="text-cyan hover:underline">
            Privacy Notice
          </Link>
          {" · "}
          <Link to="/about" className="text-cyan hover:underline">
            About
          </Link>
          {" · "}
          <ContactEmailMe
            source="footer"
            variant="inline"
            className="text-[10px] sm:text-[11px] font-mono"
          />
          {" · "}
          Independent experimental research. Provided &ldquo;as is&rdquo;. Not professional advice.
          Use at your own risk.
        </p>
        <p className="text-[10px] sm:text-[11px] font-mono">
          &copy; 2026 Elenchos · Public intelligence for ordinary citizens
        </p>
      </div>
    </footer>
  );
}
