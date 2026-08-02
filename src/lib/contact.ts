/**
 * Canonical contact for Elenchos.
 * Raw email is for Privacy Notice / server delivery only — not marketing chrome.
 */
export const ELENCHOS_CONTACT_EMAIL = "citizen.pulse101@gmail.com";

export const ELENCHOS_CONTACT_MAILTO = `mailto:${ELENCHOS_CONTACT_EMAIL}`;

/** Soft CTA label for public UI */
export const ELENCHOS_CONTACT_CTA = "Email me";

export const ELENCHOS_CONTACT_LABEL = "Contact / corrections";

export const ELENCHOS_X_HANDLE = "@elenchospulse";
export const ELENCHOS_X_URL = "https://x.com/elenchospulse";

/** Site-facing contact line (no raw Gmail) */
export const ELENCHOS_CONTACT_PUBLIC =
  "Message us via Email me on elenchos.live · or " + ELENCHOS_X_HANDLE;

export function buildContactMailto(opts: {
  name?: string;
  fromEmail?: string;
  message: string;
  source?: string;
}): string {
  const isEnterprise = opts.source ? /enterprise/i.test(opts.source) : false;
  const subject = encodeURIComponent(
    isEnterprise
      ? `Elenchos ENTERPRISE · ${opts.source}`
      : opts.source
        ? `Elenchos · ${opts.source}`
        : "Elenchos contact",
  );
  const lines = [
    isEnterprise ? "=== ENTERPRISE INQUIRY ===" : null,
    opts.message.trim(),
    "",
    "---",
    opts.name ? `Name: ${opts.name}` : null,
    opts.fromEmail ? `Reply-to: ${opts.fromEmail}` : null,
    opts.source ? `Source: ${opts.source}` : null,
  ].filter(Boolean);
  const body = encodeURIComponent(lines.join("\n"));
  return `mailto:${ELENCHOS_CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}
