import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { buildDeskReport } from "@/lib/research-desk/build-report";
import { isDeskPackageId } from "@/lib/research-desk/packages";
import { getReportByToken, getTokenBySession, saveReport } from "@/lib/research-desk/store.server";
import { sendReportLinkEmail } from "@/lib/research-desk/email.server";

const BodySchema = z.object({
  sessionId: z.string().min(8).max(200),
  token: z.string().min(8).max(80).optional(),
});

function siteOrigin(request: Request): string {
  const env = process.env.SITE_URL?.trim() || process.env.VITE_SITE_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  if (host) return `${proto}://${host}`;
  return "https://elenchos.live";
}

export const Route = createFileRoute("/api/research/finalize")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const secret = process.env.STRIPE_SECRET_KEY?.trim();
          if (!secret) {
            return Response.json({ error: "Stripe not configured" }, { status: 503 });
          }
          const json = await request.json().catch(() => null);
          const parsed = BodySchema.safeParse(json);
          if (!parsed.success) {
            return Response.json({ error: "Invalid input" }, { status: 400 });
          }
          const { sessionId, token: clientToken } = parsed.data;

          // Already finalized?
          const existingToken = await getTokenBySession(sessionId);
          if (existingToken) {
            const report = await getReportByToken(existingToken);
            if (report) {
              return Response.json({ token: existingToken, reportUrl: `${siteOrigin(request)}/research/report/${existingToken}` });
            }
          }

          const res = await fetch(
            `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
            {
              headers: { Authorization: `Bearer ${secret}` },
            },
          );
          const session = (await res.json()) as {
            id?: string;
            payment_status?: string;
            status?: string;
            metadata?: Record<string, string>;
            customer_details?: { email?: string | null };
            customer_email?: string | null;
            error?: { message?: string };
          };
          if (!res.ok) {
            return Response.json({ error: session.error?.message || "Session not found" }, { status: 404 });
          }
          if (session.payment_status !== "paid" && session.status !== "complete") {
            return Response.json({ error: "Payment not completed" }, { status: 402 });
          }

          const meta = session.metadata || {};
          const token = (clientToken || meta.token || crypto.randomUUID().replace(/-/g, "")).slice(0, 64);
          const packageId = meta.packageId || "topic-analysis";
          if (!isDeskPackageId(packageId)) {
            return Response.json({ error: "Invalid package on session" }, { status: 400 });
          }
          const topic = (meta.topic || "Untitled research topic").slice(0, 2000);
          const questions = (meta.questions || "").slice(0, 4000);

          const already = await getReportByToken(token);
          if (already) {
            return Response.json({
              token,
              reportUrl: `${siteOrigin(request)}/research/report/${token}`,
            });
          }

          const report = buildDeskReport({ token, packageId, topic, questionsRaw: questions });
          await saveReport({
            token,
            stripeSessionId: sessionId,
            packageId,
            topic,
            questions,
            report,
          });

          // Optional one-shot email from Stripe customer details — never stored
          const email =
            session.customer_details?.email?.trim() ||
            session.customer_email?.trim() ||
            "";
          if (email) {
            const reportUrl = `${siteOrigin(request)}/research/report/${token}`;
            await sendReportLinkEmail({ to: email, reportUrl, topic });
            // email variable ends here — not written to store
          }

          return Response.json({
            token,
            reportUrl: `${siteOrigin(request)}/research/report/${token}`,
          });
        } catch (e) {
          console.error("[finalize]", e);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});
