import { createFileRoute } from "@tanstack/react-router";
import { generateCommissionedReport } from "@/lib/research-desk/generate-report.server";
import { isDeskPackageId } from "@/lib/research-desk/packages";
import {
  getCommission,
  updateCommission,
} from "@/lib/research-desk/store.server";
import {
  notifyOpsReportReady,
  sendReportLinkEmail,
} from "@/lib/research-desk/email.server";
import { parseQuestions } from "@/lib/research-desk/build-report";
import {
  dispatchCommissionPipeline,
  packageNeedsXPipeline,
} from "@/lib/research-desk/dispatch-pipeline.server";

/**
 * Stripe webhook for checkout.session.completed.
 * Configure: https://elenchos.live/api/research/webhook
 *
 * X packages (topic-analysis, deep-with-x): dispatch backend Topics pipeline.
 * deep-no-x: generate via SpaceXAI on this server.
 */
export const Route = createFileRoute("/api/research/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_SECRET_KEY?.trim();
        const whSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
        if (!secret) {
          return Response.json({ error: "not configured" }, { status: 503 });
        }

        const raw = await request.text();
        let event: {
          type?: string;
          data?: { object?: Record<string, unknown> };
        };

        if (whSecret) {
          const sig = request.headers.get("stripe-signature");
          if (!sig) {
            return Response.json({ error: "missing signature" }, { status: 400 });
          }
          try {
            const Stripe = (await import("stripe")).default;
            const stripe = new Stripe(secret);
            event = stripe.webhooks.constructEvent(raw, sig, whSecret) as unknown as typeof event;
          } catch (e) {
            console.error("[webhook] signature failed", e);
            return Response.json({ error: "invalid signature" }, { status: 400 });
          }
        } else {
          try {
            event = JSON.parse(raw) as typeof event;
          } catch {
            return Response.json({ error: "bad json" }, { status: 400 });
          }
        }

        if (event.type !== "checkout.session.completed") {
          return Response.json({ received: true });
        }

        const session = event.data?.object as {
          id?: string;
          payment_status?: string;
          metadata?: Record<string, string>;
          customer_details?: { email?: string };
          customer_email?: string;
        };
        if (!session?.id || session.payment_status === "unpaid") {
          return Response.json({ received: true });
        }

        const meta = session.metadata || {};
        const token = (meta.token || "").slice(0, 64);
        if (!token) {
          return Response.json({ received: true, warn: "no token" });
        }

        const commission = await getCommission(token);
        if (!commission) {
          return Response.json({ received: true, warn: "no commission" });
        }

        if (
          commission.status === "ready" &&
          commission.report?.generatedBy === "ai" &&
          (commission.report.sampleSize == null || commission.report.sampleSize > 0)
        ) {
          return Response.json({ received: true, token, status: "already-ready" });
        }

        await updateCommission(token, {
          stripeSessionId: session.id,
          status: "generating",
        });

        const packageId = isDeskPackageId(commission.package_id)
          ? commission.package_id
          : "topic-analysis";

        const origin =
          process.env.SITE_URL?.replace(/\/$/, "") || "https://elenchos.live";
        const reportUrl = `${origin}/research/report/${token}`;
        const pdfUrl = `${origin}/api/research/report/${token}?format=pdf`;

        // X packages: backend Topics pipeline (same as manual workflow)
        if (packageNeedsXPipeline(packageId)) {
          const dispatched = await dispatchCommissionPipeline({
            token,
            topic: commission.topic,
            questions: commission.questions,
            packageId,
          });

          if (dispatched.ok && dispatched.mode === "dispatched") {
            // Leave status generating — runner appends ready row when done
            await notifyOpsReportReady({
              token,
              topic: commission.topic,
              packageId,
              reportUrl,
              pdfUrl,
              questionCount: parseQuestions(commission.questions).length,
              status: "generating",
              generatedBy: "ai",
            }).catch(() => undefined);

            return Response.json({
              received: true,
              token,
              status: "generating",
              pipeline: "dispatched",
            });
          }

          // Dispatch failed — fall back to on-server AI so customer is not stuck
          console.warn("[webhook] dispatch failed, AI fallback", dispatched.detail);
        }

        const report = await generateCommissionedReport({
          token,
          packageId,
          topic: commission.topic,
          questionsRaw: commission.questions,
        });

        await updateCommission(token, {
          stripeSessionId: session.id,
          status: "ready",
          report: { ...report, generationStatus: "ready" },
          errorMessage: report.generationError ?? null,
        });

        await notifyOpsReportReady({
          token,
          topic: commission.topic,
          packageId,
          reportUrl,
          pdfUrl,
          questionCount: parseQuestions(commission.questions).length,
          status: "ready",
          generatedBy: report.generatedBy,
        });

        const email = session.customer_details?.email || session.customer_email || "";
        if (email) {
          await sendReportLinkEmail({
            to: email,
            reportUrl,
            topic: commission.topic,
          });
        }

        return Response.json({ received: true, token, status: "ready" });
      },
    },
  },
});
