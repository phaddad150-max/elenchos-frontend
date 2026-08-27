/**
 * Allowlist for operator surfaces (/pro, /admin/curation).
 * Set VITE_ADMIN_EMAILS (comma-separated) in Vercel + local .env.
 * Server routes also read ADMIN_EMAILS.
 */
function rawAdminEmailList(): string {
  let fromVite = "";
  try {
    const v = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env
      ?.VITE_ADMIN_EMAILS;
    if (typeof v === "string") fromVite = v;
  } catch {
    /* Node path without import.meta.env */
  }
  if (fromVite.trim()) return fromVite;
  if (typeof process === "undefined") return "";
  return (
    process.env.VITE_ADMIN_EMAILS?.trim() ||
    process.env.ADMIN_EMAILS?.trim() ||
    ""
  );
}

export function listAdminEmails(): string[] {
  return rawAdminEmailList()
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const allowed = listAdminEmails();
  if (!allowed.length) return false;
  return allowed.includes(email.trim().toLowerCase());
}
