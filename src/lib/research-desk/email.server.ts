/**
 * Optional one-shot delivery email.
 * Email is used only for send — never written to research_desk_reports.
 */
export async function sendReportLinkEmail(opts: {
  to: string;
  reportUrl: string;
  topic: string;
}): Promise<{ ok: boolean }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.info("[research-desk] RESEND_API_KEY missing — skip email delivery");
    return { ok: false };
  }
  const to = opts.to.trim();
  if (!to || !to.includes("@")) return { ok: false };

  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() || "Elenchos <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Your Elenchos research report link",
        text: [
          "Your on-demand research report is ready.",
          "",
          `Topic: ${opts.topic.slice(0, 200)}`,
          `Unique link (save this — we do not store your email):`,
          opts.reportUrl,
          "",
          "Open the link to read and download PDF.",
          "Elenchos does not keep a copy of your email address after this send.",
          "",
          "— elenchos.live Research Desk",
        ].join("\n"),
      }),
    });
    // Intentionally do not log `to`
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
