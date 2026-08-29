import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { DESK_PRICE_USD, DESK_PRODUCT_NAME } from "@/lib/desk/catalog";
import { attachStripeSession, createPendingTenant } from "@/lib/desk/store.server";

const BodySchema = z.object({
  orgName: z.string().trim().min(2).max(80),
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

export const Route = createFileRoute("/api/desk/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const secret = process.env.STRIPE_SECRET_KEY?.trim();
          if (!secret) {
            return Response.json(
              { error: "Stripe is not configured. Set STRIPE_SECRET_KEY on Vercel." },
              { status: 503 },
            );
          }
          const json = await request.json().catch(() => null);
          const parsed = BodySchema.safeParse(json);
          if (!parsed.success) {
            return Response.json({ error: "Organization name and a valid email are required." }, { status: 400 });
          }
          const tenant = await createPendingTenant({
            orgName: parsed.data.orgName,
            email: parsed.data.email,
          });
          const origin = siteOrigin(request);
          const params = new URLSearchParams();
          params.set("mode", "subscription");
          params.set(
            "success_url",
            `${origin}/desk/thanks?session_id={CHECKOUT_SESSION_ID}`,
          );
          params.set("cancel_url", `${origin}/desk?cancelled=1`);
          params.set("client_reference_id", tenant.id);
          params.set("metadata[kind]", "desk");
          params.set("metadata[tenantId]", tenant.id);
          params.set("customer_email", tenant.email || parsed.data.email);
          params.set("payment_method_types[0]", "card");
          params.set("line_items[0][quantity]", "1");
          params.set("line_items[0][price_data][currency]", "usd");
          params.set("line_items[0][price_data][unit_amount]", String(DESK_PRICE_USD * 100));
          params.set("line_items[0][price_data][recurring][interval]", "month");
          params.set("line_items[0][price_data][product_data][name]", DESK_PRODUCT_NAME);
          params.set(
            "line_items[0][price_data][product_data][description]",
            "Licensed dashboard. Your tables are created at payment. Scoring logic stays on Elenchos.",
          );

          const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${secret}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
          });
          const data = (await res.json()) as {
            id?: string;
            url?: string;
            error?: { message?: string };
          };
          if (!res.ok || !data.url || !data.id) {
            console.error("[desk-checkout]", data.error?.message);
            return Response.json(
              { error: data.error?.message || "Checkout failed" },
              { status: 502 },
            );
          }
          await attachStripeSession(tenant.id, data.id);
          return Response.json({ url: data.url, sessionId: data.id });
        } catch (e) {
          console.error("[desk-checkout]", e);
          const msg = e instanceof Error ? e.message : "Server error";
          return Response.json({ error: msg }, { status: 500 });
        }
      },
    },
  },
});
