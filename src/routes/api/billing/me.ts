import { createFileRoute } from "@tanstack/react-router";
import { requireBillingUser } from "@/lib/billing/auth.server";
import { MONTHLY_PLANS, TOKEN_COSTS } from "@/lib/billing/catalog";
import { getSubscription, getTokenBalance } from "@/lib/billing/tokens.server";

/**
 * GET /api/billing/me — balance + subscription for signed-in user.
 * Authorization: Bearer <supabase access_token>
 */
export const Route = createFileRoute("/api/billing/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const auth = await requireBillingUser(request);
          if ("error" in auth) return auth.error;
          const { user } = auth;

          const [balance, subscription] = await Promise.all([
            getTokenBalance(user.userId),
            getSubscription(user.userId),
          ]);

          return Response.json({
            userId: user.userId,
            email: user.email,
            balance,
            subscription: subscription
              ? {
                  status: subscription.status,
                  planId: subscription.plan_id,
                  currentPeriodEnd: subscription.current_period_end,
                }
              : null,
            costs: TOKEN_COSTS,
            plans: MONTHLY_PLANS,
          });
        } catch (e) {
          console.error("[billing/me]", e);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});
