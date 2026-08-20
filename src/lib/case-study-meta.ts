/**
 * Shared helpers for case-study timestamps (Library cards + deep-dive heroes).
 */

/** Format ISO date (YYYY-MM-DD or full ISO) for UI — UTC calendar day. */
export function formatCaseStudyDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Compact line for heroes: Published · Updated */
export function caseStudyTimestampLine(opts: {
  publishedAt: string;
  updatedAt: string;
}): string {
  const pub = formatCaseStudyDate(opts.publishedAt);
  const upd = formatCaseStudyDate(opts.updatedAt);
  if (pub === upd) return `Updated ${upd}`;
  return `Published ${pub} · Updated ${upd}`;
}
