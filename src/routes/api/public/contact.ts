import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const BodySchema = z.object({
  name: z.string().trim().max(120).optional().default(""),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(3).max(4000),
  source: z.string().trim().max(80).optional().default("contact-form"),
});

export const Route = createFileRoute("/api/public/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const json = await request.json().catch(() => null);
          const parsed = BodySchema.safeParse(json);
          if (!parsed.success) {
            return new Response(
              JSON.stringify({ error: "Invalid input" }),
              { status: 400, headers: { "content-type": "application/json" } },
            );
          }

          // Lovable connector gateway removed — configure a mail provider on Vercel when needed.
          console.info("[contact] message received (email relay not configured)", {
            source: parsed.data.source,
            email: parsed.data.email,
          });

          return new Response(
            JSON.stringify({
              error: "Contact form is temporarily unavailable. Email citizen.pulse101@gmail.com directly.",
            }),
            { status: 503, headers: { "content-type": "application/json" } },
          );
        } catch (e) {
          console.error("contact route error", e);
          return new Response(
            JSON.stringify({ error: "Server error" }),
            { status: 500, headers: { "content-type": "application/json" } },
          );
        }
      },
    },
  },
});