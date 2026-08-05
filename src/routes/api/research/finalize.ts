import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { generateCommissionedReport } from "@/lib/research-desk/generate-report.server";
import { isDeskPackageId } from "@/lib/research-desk/packages";
import {
  getCommission,
  getReportByToken,
  getTokenBySession,
  updateCommission,
} from "@/lib/research-desk/store.server";
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

          const existingToken = await getTokenBySession(sessionId);
          if (existingToken) {
            const report = await getReportByToken(existingToken);
            if (report?.generationStatus === "ready" || report?.status === "ready") {
              return Response.json({
                token: existingToken,
                reportUrl: `${siteOrigin(request)}/research/report/${existingToken}`,
                status: "ready",
              });
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
            return Response.json(
              { error: session.error?.message || "Session not found" },
              { status: 404 },
            );
          }
          if (session.payment_status !== "paid" && session.status !== "complete") {
            return Response.json({ error: "Payment not completed" }, { status: 402 });
          }

          const meta = session.metadata || {};
          const token = (clientToken || meta.token || "").slice(0, 64);
          if (!token) {
            return Response.json({ error: "Missing report token" }, { status: 400 });
          }

          // Load FULL brief from pre-checkout store (not truncated Stripe metadata)
          let commission = await getCommission(token);
          if (!commission) {
            // Legacy path: only metadata (may be truncated)
            const packageId = meta.packageId || "topic-analysis";
            if (!isDeskPackageId(packageId)) {
              return Response.json({ error: "Invalid package on session" }, { status: 400 });
            }
            const { createPendingCommission } = await import(
              "@/lib/research-desk/store.server"
            );
            await createPendingCommission({
              token,
              packageId,
              topic: (meta.topic || meta.topicHint || "Untitled research topic").slice(0, 8000),
              questions: (meta.questions || "").slice(0, 16000),
            });
            commission = await getCommission(token);
          }
          if (!commission) {
            return Response.json({ error: "Commission not found" }, { status: 404 });
          }

          // Already fully generated
          if (
            commission.status === "ready" &&
            commission.report?.generatedBy === "ai" &&
            commission.report.questionAnalyses?.some(
              (q) => q.answer && !q.answer.includes("pending"),
            )
          ) {
            await updateCommission(token, { stripeSessionId: sessionId });
            return Response.json({
              token,
              reportUrl: `${siteOrigin(request)}/research/report/${token}`,
              status: "ready",
            });
          }

          await updateCommission(token, {
            stripeSessionId: sessionId,
            status: "generating",
            errorMessage: null,
          });

          const packageId = isDeskPackageId(commission.package_id)
            ? commission.package_id
            : "topic-analysis";

          const report = await generateCommissionedReport({
            token,
            packageId,
            topic: commission.topic,
            questionsRaw: commission.questions,
          });

          await updateCommission(token, {
            stripeSessionId: sessionId,
            status: "ready",
            report: { ...report, generationStatus: "ready" },
            errorMessage: report.generationError ?? null,
          });

          const email =
            session.customer_details?.email?.trim() ||
            session.customer_email?.trim() ||
            "";
          if (email) {
            const reportUrl = `${siteOrigin(request)}/research/report/${token}`;
            await sendReportLinkEmail({ to: email, reportUrl, topic: commission.topic });
          }

          return Response.json({
            token,
            reportUrl: `${siteOrigin(request)}/research/report/${token}`,
            status: "ready",
          });
        } catch (e) {
          console.error("[finalize]", e);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});
