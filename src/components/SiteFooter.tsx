import { Link } from "@tanstack/react-router";
import { ContactEmailMe } from "@/components/ContactEmailMe";

/** Minimal site footer: legal links + short disclaimer only. Operator story lives on About. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-6 pb-20 md:pb-0">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 space-y-2 text-muted-foreground">
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
          &copy; 2026 Elenchos
        </p>
      </div>
    </footer>
  );
}
