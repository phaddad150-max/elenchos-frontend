import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getReportByToken } from "@/lib/research-desk/store.server";
import { sendReportLinkEmail } from "@/lib/research-desk/email.server";

const BodySchema = z.object({
  token: z.string().trim().min(8).max(120),
  email: z.string().trim().email().max(200),
});

function siteOrigin(request: Request): string {
  const env = process.env.SITE_URL?.trim() || process.env.VITE_SITE_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  if (host) return `${proto}://${host}`;
  return "https://elenchos.live";
}

/** One-shot email of unique report link — email not stored. */
export const Route = createFileRoute("/api/research/email")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const json = await request.json().catch(() => null);
          const parsed = BodySchema.safeParse(json);
          if (!parsed.success) {
            return Response.json({ error: "Invalid input" }, { status: 400 });
          }
          const report = await getReportByToken(parsed.data.token);
          if (!report) {
            return Response.json({ error: "Report not found" }, { status: 404 });
          }
          const reportUrl = `${siteOrigin(request)}/research/report/${parsed.data.token}`;
          const sent = await sendReportLinkEmail({
            to: parsed.data.email,
            reportUrl,
            topic: report.topic,
          });
          if (!sent.ok) {
            return Response.json(
              {
                error:
                  "Email delivery not configured (RESEND_API_KEY) or send failed. Copy the link instead.",
              },
              { status: 503 },
            );
          }
          return Response.json({ ok: true });
        } catch (e) {
          console.error("[research-email]", e);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});
