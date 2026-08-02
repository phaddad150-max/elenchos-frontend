import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ELENCHOS_CONTACT_EMAIL } from "@/lib/contact";

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

const INBOX = ELENCHOS_CONTACT_EMAIL;

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

/**
 * Free FormSubmit AJAX → Gmail. Works without RESEND_API_KEY.
 * First real send may need a one-time activation click in the inbox.
 */
async function sendViaFormSubmit(opts: {
  name: string;
  email: string;
  subject: string;
  text: string;
}): Promise<{ ok: boolean; detail?: string }> {
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(INBOX)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: opts.name || "Elenchos visitor",
        email: opts.email,
        _replyto: opts.email,
        _subject: opts.subject,
        message: opts.text,
        _template: "table",
        _captcha: "false",
      }),
    });
    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).slice(0, 200);
      return { ok: false, detail };
    }
    const data = (await res.json().catch(() => ({}))) as { success?: string | boolean };
    if (data.success === false) return { ok: false, detail: "formsubmit rejected" };
    return { ok: true };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : "formsubmit error" };
  }
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
            process.env.CONTACT_TO_EMAIL?.trim() || INBOX;
          const from =
            process.env.CONTACT_FROM_EMAIL?.trim() ||
            "Elenchos Contact <onboarding@resend.dev>";
          const apiKey = process.env.RESEND_API_KEY?.trim();

          const { name, email, message, source } = parsed.data;
          const isEnterprise = /enterprise/i.test(source);
          const subject = isEnterprise
            ? `[Elenchos ENTERPRISE] ${source} · ${email}`
            : `[Elenchos] ${source} · ${email}`;
          const text = [
            isEnterprise ? "=== ENTERPRISE INQUIRY ===" : null,
            message,
            "",
            "---",
            name ? `Name: ${name}` : null,
            `Reply-to: ${email}`,
            `Source: ${source}`,
            `IP: ${ip}`,
            `Inbox: ${to}`,
          ]
            .filter(Boolean)
            .join("\n");

          // 1) Resend when configured
          if (apiKey) {
            const sent = await sendViaResend({
              to,
              from,
              replyTo: email,
              subject,
              text,
              apiKey,
            });
            if (sent.ok) {
              return new Response(
                JSON.stringify({ ok: true, channel: "resend" }),
                { status: 200, headers: { "content-type": "application/json" } },
              );
            }
            console.error("[contact] Resend failed — trying FormSubmit", sent.status, sent.detail);
          }

          // 2) FormSubmit → citizen.pulse101@gmail.com (no API key)
          const fs = await sendViaFormSubmit({
            name: name || "Elenchos visitor",
            email,
            subject,
            text,
          });
          if (fs.ok) {
            return new Response(
              JSON.stringify({ ok: true, channel: "formsubmit" }),
              { status: 200, headers: { "content-type": "application/json" } },
            );
          }
          console.error("[contact] FormSubmit failed", fs.detail);

          // 3) Client opens mailto as last resort
          return new Response(
            JSON.stringify({
              error: "Could not deliver via server. Opening your mail app.",
              fallbackMailto: true,
            }),
            { status: 503, headers: { "content-type": "application/json" } },
          );
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
