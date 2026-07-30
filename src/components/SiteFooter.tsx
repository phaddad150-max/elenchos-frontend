import { Link } from "@tanstack/react-router";
import { PrivacyComplianceNotice } from "@/components/PrivacyComplianceNotice";
import { ContactEmailMe } from "@/components/ContactEmailMe";

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-6 pb-20 md:pb-0">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 space-y-2 text-muted-foreground">
        <PrivacyComplianceNotice compact />
        <p className="text-[10px] sm:text-[11px] font-mono leading-relaxed">
          <strong className="text-foreground/80">Contact</strong>:{" "}
          <ContactEmailMe source="footer" variant="inline" className="text-[10px] sm:text-[11px] font-mono" />
          {" · "}
          privacy rights, corrections, challenges
        </p>
        <p className="text-[10px] sm:text-[11px] font-mono leading-relaxed sm:whitespace-nowrap sm:overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <strong className="text-foreground/80">Disclaimer</strong>: Independent research project
          for testing purposes only. Experimental analysis of public discourse. Provided &ldquo;as
          is&rdquo; with no warranties. Not professional advice. Use at your own risk.{" "}
          <Link to="/privacy" className="text-cyan hover:underline">
            Privacy Notice
          </Link>
        </p>
        <p className="text-[10px] sm:text-[11px] font-mono">
          &copy; 2026 Elenchos · Public intelligence for ordinary citizens
        </p>
      </div>
    </footer>
  );
}
