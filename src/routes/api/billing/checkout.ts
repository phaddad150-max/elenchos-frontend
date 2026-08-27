import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { requireAdminBillingUser } from "@/lib/billing/auth.server";
import { isMonthlyPlanId, proSubscriptionsActive } from "@/lib/billing/catalog";
import {
  createMonthlyPlanCheckout,
  stripeSecret,
} from "@/lib/billing/stripe.server";
import { getSubscription } from "@/lib/billing/tokens.server";

const BodySchema = z.object({
  /** Monthly plan: pack_starter | pack_plus | pack_mega */
  kind: z.literal("monthly_plan"),
  planId: z.string(),
});

export const Route = createFileRoute("/api/billing/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          if (!proSubscriptionsActive()) {
            return Response.json(
              {
                error:
                  "Pro subscriptions are inactive while Testing Mode is on. Contact Elenchos for Enterprise.",
              },
              { status: 503 },
            );
          }

          if (!stripeSecret()) {
            return Response.json(
              {
                error: "Checkout is not available right now.",
              },
              { status: 503 },
            );
          }

          const auth = await requireAdminBillingUser(request);
          if ("error" in auth) return auth.error;
          const { user } = auth;

          const json = await request.json().catch(() => null);
          const parsed = BodySchema.safeParse(json);
          if (!parsed.success) {
            return Response.json(
              {
                error:
                  "Invalid input — use { kind: 'monthly_plan', planId: 'pack_starter'|'pack_plus'|'pack_mega' }",
              },
              { status: 400 },
            );
          }

          const planId = parsed.data.planId;
          if (!isMonthlyPlanId(planId)) {
            return Response.json({ error: "Unknown plan" }, { status: 400 });
          }

          const sub = await getSubscription(user.userId);
          if (sub?.status === "active" || sub?.status === "trialing") {
            return Response.json(
              {
                error:
                  "You already have an active monthly plan. Cancel or change it in Stripe Customer Portal first (coming soon), or contact support.",
                code: "already_subscribed",
                planId: sub.plan_id,
              },
              { status: 409 },
            );
          }

          const session = await createMonthlyPlanCheckout({
            request,
            userId: user.userId,
            email: user.email,
            planId,
            customerId: sub?.stripe_customer_id ?? null,
          });
          if (!session.ok) {
            return Response.json(
              {
                error: session.message || "Checkout failed.",
              },
              { status: 502 },
            );
          }
          return Response.json({
            url: session.url,
            sessionId: session.sessionId,
            kind: "monthly_plan",
            planId,
          });
        } catch (e) {
          console.error("[billing/checkout]", e);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});
