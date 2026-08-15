/**
 * One-shot emails for Research Desk.
 * Payer email is never written to research_desk_reports.
 */
import { ELENCHOS_CONTACT_EMAIL } from "@/lib/contact";
import { DESK_PACKAGES, type DeskPackageId } from "./packages";

async function sendResend(opts: {
  to: string | string[];
  subject: string;
  text: string;
}): Promise<{ ok: boolean }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.info("[research-desk] RESEND_API_KEY missing — skip email");
    return { ok: false };
  }
  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() || "Elenchos <onboarding@resend.dev>";
  const to = Array.isArray(opts.to) ? opts.to : [opts.to];

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: opts.subject,
        text: opts.text,
      }),
    });
    if (!res.ok) {
      console.error("[research-desk] email send failed", res.status);
      return { ok: false };
    }
    return { ok: true };
  } catch (e) {
    console.error("[research-desk] email send error", e);
    return { ok: false };
  }
}

/** Optional delivery to the paying user (Stripe email). Not stored. */
export async function sendReportLinkEmail(opts: {
  to: string;
  reportUrl: string;
  topic: string;
}): Promise<{ ok: boolean }> {
  const to = opts.to.trim();
  if (!to || !to.includes("@")) return { ok: false };
  return sendResend({
    to,
    subject: "Your Elenchos research report link",
    text: [
      "Your commissioned research report is ready.",
      "",
      `Topic: ${opts.topic.slice(0, 300)}`,
      `Unique link (save this — we do not store your email):`,
      opts.reportUrl,
      "",
      "Open the link to read and download PDF.",
      "Elenchos does not keep a copy of your email address after this send.",
      "",
      "— elenchos.live Research Desk",
    ].join("\n"),
  });
}

/**
 * Always notify Elenchos ops when a commissioned report is ready.
 * Default inbox: citizen.pulse101@gmail.com
 */
export async function notifyOpsReportReady(opts: {
  token: string;
  topic: string;
  packageId: DeskPackageId | string;
  reportUrl: string;
  pdfUrl?: string;
  questionCount: number;
  status?: string;
  generatedBy?: string;
}): Promise<{ ok: boolean }> {
  const to =
    process.env.CONTACT_TO_EMAIL?.trim() ||
    process.env.OPS_NOTIFY_EMAIL?.trim() ||
    ELENCHOS_CONTACT_EMAIL;
  const pkgLabel =
    DESK_PACKAGES[opts.packageId as DeskPackageId]?.title ?? opts.packageId;
  const subject = `[Elenchos] Commissioned report ready · ${pkgLabel} · ${opts.topic.slice(0, 60)}`;
  const pdfUrl =
    opts.pdfUrl ||
    opts.reportUrl.replace("/research/report/", "/api/research/report/") +
      (opts.reportUrl.includes("?") ? "&" : "?") +
      "format=pdf";

  return sendResend({
    to,
    subject,
    text: [
      "A commissioned Research Desk report is ready.",
      "",
      `Package: ${pkgLabel}`,
      `Topic: ${opts.topic}`,
      `Token: ${opts.token}`,
      `Questions stored: ${opts.questionCount}`,
      `Status: ${opts.status ?? "ready"}`,
      `Generator: ${opts.generatedBy ?? "—"}`,
      "",
      "Report page (Topics-style layout):",
      opts.reportUrl,
      "",
      "PDF download:",
      pdfUrl,
      "",
      "— elenchos.live automated ops notify",
    ].join("\n"),
  });
}
