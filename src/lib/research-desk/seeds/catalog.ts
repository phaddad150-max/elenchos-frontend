/**
 * Static commissioned archive cards — always shown under Topics → Archived.
 * Report bodies resolve via fixed tokens (seed module) or Supabase.
 * Never overwrites DB; this is read-only catalog for the product surface.
 */
import {
  UAE_FINTECH_REPORT_TOKEN,
  UAE_FINTECH_TOPIC,
  buildUaeFintechReport,
} from "./uae-fintech-dominance";
import type { DeskReport } from "../build-report";

export type CommissionedArchiveEntry = {
  token: string;
  title: string;
  topic: string;
  packageId: "topic-analysis" | "deep-no-x" | "deep-with-x";
  sharedAt: string | null;
  sentimentScore: number | null;
  divergenceScore: number | null;
};

const uaePreview = buildUaeFintechReport(UAE_FINTECH_REPORT_TOKEN);

/** Always-on archive list for topic-analysis commissions (customer delivery). */
export const STATIC_TOPIC_COMMISSIONED_ARCHIVE: CommissionedArchiveEntry[] = [
  {
    token: UAE_FINTECH_REPORT_TOKEN,
    title: uaePreview.title,
    topic: UAE_FINTECH_TOPIC,
    packageId: "topic-analysis",
    sharedAt: "2026-08-05T00:00:00.000Z",
    sentimentScore: uaePreview.overallSentiment?.score ?? 54,
    divergenceScore: uaePreview.divergenceScore ?? 61,
  },
];

/** Resolve bundled goodwill / static reports by token (no DB required). */
export function getStaticCommissionedReport(token: string): DeskReport | null {
  if (token === UAE_FINTECH_REPORT_TOKEN) {
    return {
      ...buildUaeFintechReport(token),
      sharedPublic: true,
      sharedAt: "2026-08-05T00:00:00.000Z",
      generationStatus: "ready",
      status: "ready",
    };
  }
  return null;
}

export function isStaticCommissionedToken(token: string): boolean {
  return token === UAE_FINTECH_REPORT_TOKEN;
}
