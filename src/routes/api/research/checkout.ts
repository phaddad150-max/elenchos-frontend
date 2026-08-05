import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { DESK_PACKAGES, isDeskPackageId } from "@/lib/research-desk/packages";
import { createPendingCommission } from "@/lib/research-desk/store.server";

const BodySchema = z.object({
  packageId: z.string(),
  topic: z.string().trim().min(8).max(8000),
  questions: z.string().trim().max(16000).optional().default(""),
  /** Optional delivery email — passed to Stripe only, never stored by Elenchos */
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
});

function siteOrigin(request: Request): string {
  const env = process.env.SITE_URL?.trim() || process.env.VITE_SITE_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  if (host) return `${proto}://${host}`;
  return "https://elenchos.live";
}

export const Route = createFileRoute("/api/research/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const secret = process.env.STRIPE_SECRET_KEY?.trim();
          if (!secret) {
            return Response.json(
              {
                error:
                  "Stripe is not configured yet. Set STRIPE_SECRET_KEY in Vercel (and run the research_desk_reports migration).",
              },
              { status: 503 },
            );
          }

          const json = await request.json().catch(() => null);
          const parsed = BodySchema.safeParse(json);
          if (!parsed.success) {
            return Response.json({ error: "Invalid input" }, { status: 400 });
          }
          const { packageId, topic, questions, email } = parsed.data;
          if (!isDeskPackageId(packageId)) {
            return Response.json({ error: "Unknown package" }, { status: 400 });
          }
          const pkg = DESK_PACKAGES[packageId];
          const origin = siteOrigin(request);
          const token = crypto.randomUUID().replace(/-/g, "");

          // CRITICAL: store full topic + questions BEFORE Stripe.
          // Do NOT put long text in Stripe metadata (500 char cap truncates 9 questions).
          await createPendingCommission({
            token,
            packageId,
            topic: topic.trim(),
            questions: (questions || "").trim(),
          });

          const params = new URLSearchParams();
          params.set("mode", "payment");
          params.set(
            "success_url",
            `${origin}/research/report/${token}?session_id={CHECKOUT_SESSION_ID}`,
          );
          params.set("cancel_url", `${origin}/research/commission?cancelled=1`);
          params.set("client_reference_id", token);
          params.set("metadata[token]", token);
          params.set("metadata[packageId]", packageId);
          // Short display crumbs only — full brief is in DB by token
          params.set("metadata[topicHint]", topic.trim().slice(0, 80));
          params.set("payment_method_types[0]", "card");
          params.set("payment_method_types[1]", "crypto");
          params.set("line_items[0][quantity]", "1");
          params.set("line_items[0][price_data][currency]", "usd");
          params.set(
            "line_items[0][price_data][unit_amount]",
            String(pkg.priceUsd * 100),
          );
          params.set(
            "line_items[0][price_data][product_data][name]",
            `Elenchos Research: ${pkg.title}`,
          );
          params.set(
            "line_items[0][price_data][product_data][description]",
            `On-demand briefing (unique link + PDF). Full brief stored by token — not in card metadata.`,
          );
          if (email) {
            params.set("customer_email", email);
          }

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
          if (!res.ok || !data.url) {
            if (data.error?.message?.toLowerCase().includes("crypto")) {
              params.delete("payment_method_types[1]");
              const res2 = await fetch("https://api.stripe.com/v1/checkout/sessions", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${secret}`,
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: params.toString(),
              });
              const data2 = (await res2.json()) as {
                id?: string;
                url?: string;
                error?: { message?: string };
              };
              if (!res2.ok || !data2.url) {
                console.error("[checkout] stripe error", data2.error?.message);
                return Response.json(
                  { error: data2.error?.message || "Checkout failed" },
                  { status: 502 },
                );
              }
              return Response.json({ url: data2.url, sessionId: data2.id, token });
            }
            console.error("[checkout] stripe error", data.error?.message);
            return Response.json(
              { error: data.error?.message || "Checkout failed" },
              { status: 502 },
            );
          }

          return Response.json({ url: data.url, sessionId: data.id, token });
        } catch (e) {
          console.error("[checkout]", e);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});
