import { createFileRoute } from "@tanstack/react-router";
import { getCommission, getReportByToken } from "@/lib/research-desk/store.server";
import { reportToPdfBytes, reportToPlainText } from "@/lib/research-desk/build-report";

export const Route = createFileRoute("/api/research/report/$token")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const token = params.token;
        if (!token || token.length < 8) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }

        const commission = await getCommission(token);
        const report = commission?.report ?? (await getReportByToken(token));
        if (!report && !commission) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }

        const url = new URL(request.url);
        const format = url.searchParams.get("format");

        // Status-only for polling while generating
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

        // Merge generation status onto report for the page
        const payload = {
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
