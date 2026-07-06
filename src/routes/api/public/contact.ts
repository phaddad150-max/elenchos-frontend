import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const BodySchema = z.object({
  name: z.string().trim().max(120).optional().default(""),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(3).max(4000),
  source: z.string().trim().max(80).optional().default("sponsor-modal"),
});

const RECIPIENT = "citizen.pulse101@gmail.com";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";

function b64url(str: string): string {
  // btoa handles latin1; encode utf8 first
  const utf8 = unescape(encodeURIComponent(str));
  return btoa(utf8).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function buildRaw(params: {
  to: string;
  replyTo: string;
  subject: string;
  text: string;
}): string {
  const lines = [
    `To: ${params.to}`,
    `Reply-To: ${params.replyTo}`,
    `Subject: ${params.subject}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "MIME-Version: 1.0",
    "",
    params.text,
  ];
  return b64url(lines.join("\r\n"));
}

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

          const lovableKey = process.env.LOVABLE_API_KEY;
          const gmailKey = process.env.GOOGLE_MAIL_API_KEY;
          if (!lovableKey || !gmailKey) {
            return new Response(
              JSON.stringify({ error: "Email service not configured" }),
              { status: 500, headers: { "content-type": "application/json" } },
            );
          }

          const { name, email, message, source } = parsed.data;
          const displayName = name || "(no name provided)";
          const subject = `Elenchos · new message from ${displayName}`;
          const text = [
            `From: ${displayName} <${email}>`,
            `Source: ${source}`,
            "",
            message,
          ].join("\n");

          const raw = buildRaw({
            to: RECIPIENT,
            replyTo: email,
            subject,
            text,
          });

          const res = await fetch(`${GATEWAY_URL}/users/me/messages/send`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${lovableKey}`,
              "X-Connection-Api-Key": gmailKey,
            },
            body: JSON.stringify({ raw }),
          });

          if (!res.ok) {
            const body = await res.text().catch(() => "");
            console.error("Gmail send failed", res.status, body);
            return new Response(
              JSON.stringify({ error: "Unable to send message" }),
              { status: 502, headers: { "content-type": "application/json" } },
            );
          }

          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
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
