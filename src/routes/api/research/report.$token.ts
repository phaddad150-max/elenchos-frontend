import { createFileRoute } from "@tanstack/react-router";
import { getCommission, getReportByToken } from "@/lib/research-desk/store.server";
import {
  reportToPdfBytes,
  reportToPlainText,
  type DeskReport,
} from "@/lib/research-desk/build-report";
import { getStaticCommissionedReport } from "@/lib/research-desk/seeds/catalog";

/**
 * Thin pipeline = generic default questions used, or missing structured curation.
 * Prefer the curated static seed for known goodwill tokens when that happens.
 */
function isThinPipelineReport(report: DeskReport, staticReport: DeskReport): boolean {
  const qs = report.questions ?? [];
  const staticQs = staticReport.questions ?? [];
  if (staticQs.length >= 5 && qs.length >= 3) {
    // Default-question heuristic from run_commission_topic.default_questions
    const genericHits = qs.filter((q) =>
      /what do ordinary people emphasize|where do official or media frames diverge|what evidence is strong, thin/i.test(
        q,
      ),
    ).length;
    if (genericHits >= 2) return true;
  }
  // Missing Pass-2 style fields + no structured gap objects
  const gaps = report.narrativeGap?.gapPoints ?? [];
  const structuredGaps = gaps.filter((g) => g && typeof g === "object").length;
  const hasCardTitles = (report.questionAnalyses ?? []).some((q) => q.cardTitle?.trim());
  const hasSynthesis = Boolean(report.curatedSynthesis?.headline?.trim());
  if (!hasCardTitles && !hasSynthesis && structuredGaps === 0 && staticQs.length >= 5) {
    return true;
  }
  return false;
}

export const Route = createFileRoute("/api/research/report/$token")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const token = params.token;
        if (!token || token.length < 8) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }

        const commission = await getCommission(token);
        let report =
          commission?.report ??
          (await getReportByToken(token)) ??
          getStaticCommissionedReport(token);

        const staticReport = getStaticCommissionedReport(token);
        if (report && staticReport && isThinPipelineReport(report, staticReport)) {
          // Prefer curated seed body; keep real sample metrics when pipeline had X posts
          const sampleN =
            typeof report.sampleSize === "number" && report.sampleSize > 0
              ? report.sampleSize
              : null;
          report = {
            ...staticReport,
            sampleSize: sampleN ?? staticReport.sampleSize,
            sampleNote: sampleN
              ? report.sampleNote ?? staticReport.sampleNote
              : staticReport.sampleNote,
            overallSentiment: sampleN
              ? report.overallSentiment ?? staticReport.overallSentiment
              : staticReport.overallSentiment,
            divergenceScore: sampleN
              ? report.divergenceScore ?? staticReport.divergenceScore
              : staticReport.divergenceScore,
            generationStatus:
              commission?.status === "ready"
                ? "ready"
                : commission?.status ?? report.generationStatus ?? "ready",
          };
        }

        if (!report && !commission) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }

        const url = new URL(request.url);
        const format = url.searchParams.get("format");

        if (url.searchParams.get("meta") === "1") {
          return Response.json({
            token,
            status: commission?.status ?? report?.generationStatus ?? "ready",
            error: commission?.error_message ?? report?.generationError ?? null,
            hasReport: Boolean(report),
          });
        }

        if (!report) {
          return Response.json(
            {
              error: "Report not ready",
              status: commission?.status ?? "generating",
            },
            { status: 202 },
          );
        }

        const payload: DeskReport = {
          ...report,
          generationStatus:
            commission?.status ?? report.generationStatus ?? "ready",
          generationError:
            commission?.error_message ?? report.generationError ?? undefined,
        };

        if (format === "pdf") {
          const bytes = reportToPdfBytes(payload);
          const ab = bytes.buffer.slice(
            bytes.byteOffset,
            bytes.byteOffset + bytes.byteLength,
          ) as ArrayBuffer;
          return new Response(ab, {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="elenchos-report-${token.slice(0, 8)}.pdf"`,
              "Cache-Control": "private, no-store",
            },
          });
        }
        if (format === "txt") {
          return new Response(reportToPlainText(payload), {
            status: 200,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Content-Disposition": `attachment; filename="elenchos-report-${token.slice(0, 8)}.txt"`,
              "Cache-Control": "private, no-store",
            },
          });
        }

        return Response.json(payload, {
          headers: { "Cache-Control": "private, no-store" },
        });
      },
    },
  },
});
