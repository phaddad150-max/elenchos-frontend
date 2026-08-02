import { createFileRoute } from "@tanstack/react-router";
import { buildDeskReport } from "@/lib/research-desk/build-report";
import { isDeskPackageId } from "@/lib/research-desk/packages";
import { getReportByToken, saveReport } from "@/lib/research-desk/store.server";
import { sendReportLinkEmail } from "@/lib/research-desk/email.server";

/**
 * Stripe webhook (optional if finalize is always called from success page).
 * Configure endpoint: https://elenchos.live/api/research/webhook
 * Events: checkout.session.completed
 *
 * Note: signature verification requires raw body; when STRIPE_WEBHOOK_SECRET is set we verify.
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
          // Lightweight check: Stripe-Signature present; full crypto verify recommended in production
          const sig = request.headers.get("stripe-signature");
          if (!sig) {
            return Response.json({ error: "missing signature" }, { status: 400 });
          }
          // Use Stripe SDK verify if available
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
        const token = (meta.token || crypto.randomUUID().replace(/-/g, "")).slice(0, 64);
        const packageId = meta.packageId || "topic-analysis";
        if (!isDeskPackageId(packageId)) {
          return Response.json({ received: true });
        }
        if (await getReportByToken(token)) {
          return Response.json({ received: true, token });
        }

        const topic = (meta.topic || "Untitled").slice(0, 2000);
        const questions = (meta.questions || "").slice(0, 4000);
        const report = buildDeskReport({ token, packageId, topic, questionsRaw: questions });
        await saveReport({
          token,
          stripeSessionId: session.id,
          packageId,
          topic,
          questions,
          report,
        });

        const email = session.customer_details?.email || session.customer_email || "";
        if (email) {
          const origin =
            process.env.SITE_URL?.replace(/\/$/, "") || "https://elenchos.live";
          await sendReportLinkEmail({
            to: email,
            reportUrl: `${origin}/research/report/${token}`,
            topic,
          });
        }

        return Response.json({ received: true, token });
      },
    },
  },
});
