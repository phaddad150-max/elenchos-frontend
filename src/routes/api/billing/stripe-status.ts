import { createFileRoute } from "@tanstack/react-router";
import {
  listStripeEnvKeyModes,
  resolveStripeSecret,
  stripeEnvPresence,
} from "@/lib/billing/catalog";

/**
 * Safe Stripe env diagnostic — no secret values, only key names + test/live/empty.
 * Open: https://elenchos.live/api/billing/stripe-status
 */
export const Route = createFileRoute("/api/billing/stripe-status")({
  server: {
    handlers: {
      GET: async () => {
        const resolved = resolveStripeSecret();
        return Response.json({
          ok: true,
          packs_mode_required: "test",
          secret_mode: resolved.mode,
          secret_source: resolved.source,
          can_checkout_test_packs: resolved.mode === "test",
          env: stripeEnvPresence(),
          stripe_keys_seen: listStripeEnvKeyModes(),
          hint:
            resolved.mode === "test"
              ? "Test secret is active — Pro pack checkout should work."
              : "No sk_test_ secret visible. Edit STRIPE_SECRET_KEY on Vercel Production to your sk_test_… value, Save, Redeploy, then reopen this URL.",
        });
      },
    },
  },
});
