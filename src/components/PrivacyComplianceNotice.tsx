import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";

/** Always-visible GDPR summary — shown on login and in footer areas. */
export function PrivacyComplianceNotice({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        <Shield className="w-3 h-3 inline-block mr-1 text-cyan align-[-2px]" />
        EU/GDPR: session cookie for sign-in; profile data on EU infrastructure. No ad tracking.{" "}
        <Link to="/privacy" className="text-cyan hover:underline">
          Privacy Notice
        </Link>
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-cyan/30 bg-cyan/[0.06] p-3.5 space-y-2">
      <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-cyan">
        <Shield className="w-3.5 h-3.5 shrink-0" />
        Privacy &amp; cookies (EU/GDPR)
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        We use a session cookie to keep you signed in and store your email and authentication
        metadata on EU-region cloud infrastructure. No advertising or third-party tracking.
        See our{" "}
        <Link to="/privacy" className="text-cyan hover:underline">
          Privacy Notice
        </Link>{" "}
        for lawful basis, your rights, and deletion requests.
      </p>
    </div>
  );
}