import { createFileRoute } from "@tanstack/react-router";
import { getReportByToken } from "@/lib/research-desk/store.server";
import { reportToPdfBytes, reportToPlainText } from "@/lib/research-desk/build-report";

export const Route = createFileRoute("/api/research/report/$token")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const token = params.token;
        if (!token || token.length < 8) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }
        const report = await getReportByToken(token);
        if (!report) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }

        const url = new URL(request.url);
        const format = url.searchParams.get("format");

        if (format === "pdf") {
          const bytes = reportToPdfBytes(report);
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
          return new Response(reportToPlainText(report), {
            status: 200,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Content-Disposition": `attachment; filename="elenchos-report-${token.slice(0, 8)}.txt"`,
              "Cache-Control": "private, no-store",
            },
          });
        }

        return Response.json(report, {
          headers: { "Cache-Control": "private, no-store" },
        });
      },
    },
  },
});
