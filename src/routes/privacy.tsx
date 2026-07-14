import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ShieldCheck, Mail, Database, Cookie, Globe2, UserX } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Notice — Elenchos" },
      {
        name: "description",
        content:
          "How Elenchos collects, stores, and protects your data. GDPR-aligned privacy notice for EU citizens.",
      },
      { property: "og:title", content: "Privacy Notice — Elenchos" },
      {
        property: "og:description",
        content:
          "How Elenchos collects, stores, and protects your data. GDPR-aligned privacy notice for EU citizens.",
      },
      { property: "og:url", content: "https://elenchos.live/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/privacy" }],
  }),

  component: PrivacyPage,
});

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-border rounded-2xl p-5 md:p-6 bg-card/40">
      <div className="flex items-center gap-3 mb-3">
        <div className="brand-mark w-9 h-9 rounded-full grid place-items-center">
          <Icon className="w-4 h-4 text-cyan" />
        </div>
        <h2 className="text-lg font-display font-semibold">{title}</h2>
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteNav />
      <main className="flex-1 max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-14 w-full">
        <header className="mb-8">
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-cyan mb-2">
            Privacy & Data Protection
          </p>
          <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight">
            Privacy Notice
          </h1>
          <p className="text-xs text-muted-foreground mt-3">
            Version 1 · Last updated {new Date().getFullYear()}
          </p>
        </header>

        <div className="space-y-5">
          <Section icon={ShieldCheck} title="Who we are">
            <p>
              Elenchos is a citizen-journalism intelligence dashboard. This notice
              explains what personal data we collect when you create an account
              and how we use it. It is aligned with the EU General Data Protection
              Regulation (GDPR).
            </p>
            <p>
              For questions or to exercise your rights, contact us at{" "}
              <a href="mailto:privacy@elenchos.live" className="text-cyan hover:underline">
                privacy@elenchos.live
              </a>
              .
            </p>
          </Section>

          <Section icon={Database} title="What we collect">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Authentication identifier:</strong> the OAuth subject ID
                returned by Google or X when you sign in. We never see or store
                your password — authentication happens entirely on the
                provider's side.
              </li>
              <li>
                <strong>Profile metadata:</strong> the email address, display
                name, and avatar URL released to us by your chosen identity
                provider (Google).
              </li>
              <li>
                <strong>Consent records:</strong> timestamp and version of the
                privacy notice you accepted, plus your browser user-agent.
              </li>
              <li>
                <strong>Session cookie:</strong> a strictly necessary cookie that
                keeps you signed in.
              </li>
            </ul>
            <p>
              We do <strong>not</strong> collect passwords, run email/password
              accounts, use advertising cookies, third-party analytics, or
              behavioural tracking. We do not sell your data.
            </p>
          </Section>

          <Section icon={Globe2} title="Where your data is stored">
            <p>
              Your account and consent records are stored in Supabase
              (PostgreSQL) on EU-region infrastructure.
              Authentication tokens are exchanged over TLS and stored encrypted
              at rest.
            </p>
            <p>
              Lawful basis: <em>contract</em> (Art. 6(1)(b) GDPR) to provide the
              dashboard you signed up for, and <em>consent</em> (Art. 6(1)(a))
              for the cookie banner choice you made.
            </p>
          </Section>

          <Section icon={Cookie} title="Cookies">
            <p>
              We use one strictly-necessary session cookie to keep you signed in.
              No tracking, advertising, or analytics cookies are set. You can
              clear cookies at any time via your browser settings — you will be
              signed out.
            </p>
          </Section>

          <Section icon={UserX} title="Your rights (GDPR)">
            <ul className="list-disc pl-5 space-y-1">
              <li>Right to access (Art. 15) — request a copy of your data.</li>
              <li>Right to rectification (Art. 16) — correct inaccurate data.</li>
              <li>Right to erasure (Art. 17) — request account deletion.</li>
              <li>Right to restrict / object to processing (Art. 18 & 21).</li>
              <li>Right to data portability (Art. 20).</li>
              <li>
                Right to lodge a complaint with your national supervisory
                authority.
              </li>
            </ul>
            <p>
              To exercise any right, email{" "}
              <a href="mailto:privacy@elenchos.live" className="text-cyan hover:underline">
                privacy@elenchos.live
              </a>
              . We respond within 30 days.
            </p>
          </Section>

          <Section icon={Mail} title="Communication">
            <p>
              Because authentication is delegated to Google and X, we do not
              send confirmation or password-reset emails. We only contact you
              for essential service or security notices using the email
              released by your identity provider. No marketing emails are sent
              without separate, explicit opt-in, and you can unsubscribe at
              any time from any non-essential message.
            </p>
          </Section>
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan/40 bg-cyan/10 text-cyan text-[11px] font-mono uppercase tracking-[0.18em] hover:bg-cyan/20"
          >
            Back to dashboard
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
