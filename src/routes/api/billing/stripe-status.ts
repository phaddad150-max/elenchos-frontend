import { createFileRoute } from "@tanstack/react-router";
import {
  listStripeEnvKeyModes,
  resolveStripeSecret,
  stripeEnvPresence,
} from "@/lib/billing/catalog";

function assertAdmin(request: Request): boolean {
  const secret =
    process.env.ADMIN_SECRET?.trim() ||
    process.env.RESEARCH_ADMIN_SECRET?.trim() ||
    "";
  if (!secret) return false;
  const hdr = request.headers.get("x-admin-secret")?.trim() || "";
  return hdr.length > 0 && hdr === secret;
}

/**
 * Stripe env diagnostic — no secret values.
 * Not public: requires x-admin-secret (ADMIN_SECRET or RESEARCH_ADMIN_SECRET).
 */
export const Route = createFileRoute("/api/billing/stripe-status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!assertAdmin(request)) {
          return new Response(null, { status: 404 });
        }
        const resolved = resolveStripeSecret();
        return Response.json({
          ok: true,
          packs_mode_required: "test",
          secret_mode: resolved.mode,
          secret_source: resolved.source,
          can_checkout_test_packs: resolved.mode === "test",
          env: stripeEnvPresence(),
          stripe_keys_seen: listStripeEnvKeyModes(),
        });
      },
    },
  },
});
