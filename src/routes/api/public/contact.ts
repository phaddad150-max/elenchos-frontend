import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const BodySchema = z.object({
  name: z.string().trim().max(120).optional().default(""),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(3).max(4000),
  source: z.string().trim().max(80).optional().default("contact-form"),
  /** Honeypot — must be empty */
  website: z.string().trim().max(200).optional().default(""),
});

/** Simple in-memory rate limit (per server instance). */
const hits = new Map<string, { n: number; t: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const row = hits.get(ip);
  if (!row || now - row.t > WINDOW_MS) {
    hits.set(ip, { n: 1, t: now });
    return true;
  }
  if (row.n >= MAX_PER_WINDOW) return false;
  row.n += 1;
  return true;
}

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

async function sendViaResend(opts: {
  to: string;
  from: string;
  replyTo: string;
  subject: string;
  text: string;
  apiKey: string;
}): Promise<{ ok: boolean; status: number; detail?: string }> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: opts.from,
      to: [opts.to],
      reply_to: opts.replyTo,
      subject: opts.subject,
      text: opts.text,
    }),
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 300);
    return { ok: false, status: res.status, detail };
  }
  return { ok: true, status: res.status };
}

export const Route = createFileRoute("/api/public/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const ip = clientIp(request);
          if (!rateLimit(ip)) {
            return new Response(JSON.stringify({ error: "Too many messages. Try again later." }), {
              status: 429,
              headers: { "content-type": "application/json" },
            });
          }

          const json = await request.json().catch(() => null);
          const parsed = BodySchema.safeParse(json);
          if (!parsed.success) {
            return new Response(JSON.stringify({ error: "Invalid input" }), {
              status: 400,
              headers: { "content-type": "application/json" },
            });
          }

          // Honeypot filled → pretend success
          if (parsed.data.website) {
            return new Response(JSON.stringify({ ok: true }), {
              status: 200,
              headers: { "content-type": "application/json" },
            });
          }

          const to =
            process.env.CONTACT_TO_EMAIL?.trim() || "citizen.pulse101@gmail.com";
          const from =
            process.env.CONTACT_FROM_EMAIL?.trim() ||
            "Elenchos Contact <onboarding@resend.dev>";
          const apiKey = process.env.RESEND_API_KEY?.trim();

          const { name, email, message, source } = parsed.data;
          const subject = `[Elenchos] ${source} · ${email}`;
          const text = [
            message,
            "",
            "---",
            name ? `Name: ${name}` : null,
            `Reply-to: ${email}`,
            `Source: ${source}`,
            `IP: ${ip}`,
          ]
            .filter(Boolean)
            .join("\n");

          if (!apiKey) {
            // Client will open mailto — do not expose inbox in error text
            console.info("[contact] RESEND_API_KEY missing — client mailto fallback", {
              source,
              hasEmail: Boolean(email),
            });
            return new Response(
              JSON.stringify({
                error: "Form delivery not configured yet.",
                fallbackMailto: true,
              }),
              { status: 503, headers: { "content-type": "application/json" } },
            );
          }

          const sent = await sendViaResend({
            to,
            from,
            replyTo: email,
            subject,
            text,
            apiKey,
          });

          if (!sent.ok) {
            console.error("[contact] Resend failed", sent.status, sent.detail);
            return new Response(
              JSON.stringify({
                error: "Delivery failed. Please try again shortly.",
                fallbackMailto: true,
              }),
              { status: 502, headers: { "content-type": "application/json" } },
            );
          }

          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch (e) {
          console.error("contact route error", e);
          return new Response(JSON.stringify({ error: "Server error", fallbackMailto: true }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
