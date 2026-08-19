import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Database,
  Cookie,
  UserX,
  CreditCard,
  FlaskConical,
  Globe2,
  KeyRound,
  Scale,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ELENCHOS_CONTACT_EMAIL, ELENCHOS_CONTACT_MAILTO } from "@/lib/contact";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Notice · Elenchos" },
      {
        name: "description",
        content:
          "Elenchos privacy notice: free browsing without an account; Pro plans use X/Google OAuth. Stripe handles payments. GDPR rights & EU controller details.",
      },
      { property: "og:title", content: "Privacy Notice · Elenchos" },
      {
        property: "og:description",
        content:
          "Free public research stays account-free. Pro authentication, subscription data, and GDPR-aligned processing for Elenchos (elenchos.live).",
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
    <div className="min-h-screen flex flex-col bg-background page-shell">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-40" />
      <SiteNav />
      <main className="flex-1 max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12 w-full relative mobile-safe-bottom">
        <header className="page-hero-banner mb-6 p-4 sm:p-5">
          <p className="page-hero-kicker">Privacy &amp; data protection</p>
          <h1 className="page-hero-title text-2xl md:text-3xl mt-2">Privacy Notice</h1>
          <p className="page-hero-sub mt-2 text-[13px]">
            Version 3 · Pro subscriptions &amp; authentication · {new Date().getFullYear()}
          </p>
        </header>

        <div className="space-y-4">
          <Section icon={ShieldCheck} title="Who we are (controller)">
            <p>
              Elenchos (elenchos.live) is an experimental public-discourse and research product
              based in the EU. We help people compare citizen conversation with official frames,
              browse public research, and (for Pro subscribers) run authenticated private research.
            </p>
            <p>
              Contact (GDPR requests and questions):{" "}
              <a href={ELENCHOS_CONTACT_MAILTO} className="text-cyan hover:underline break-all">
                {ELENCHOS_CONTACT_EMAIL}
              </a>
              {" · "}
              <Link to="/about" className="text-cyan hover:underline">
                About
              </Link>
              {" · "}
              <Link to="/research" className="text-cyan hover:underline">
                Research
              </Link>
            </p>
          </Section>

          <Section icon={Globe2} title="Free browsing without an account">
            <p>
              The Dashboard, Research Library, and public trackers/topics{" "}
              <strong className="text-foreground/90">work without creating an account</strong>.
              Sign-in is not required to read public research.
            </p>
            <p>
              We do not run advertising cookies or sell personal profiles. Hosting and security logs
              (e.g. IP at the edge) may exist at the infrastructure layer like any website; we do not
              build marketing dossiers from them.
            </p>
          </Section>

          <Section icon={KeyRound} title="Pro accounts &amp; authentication">
            <p>
              Paid <strong className="text-foreground/90">Pro / subscription</strong> features
              require authentication via <strong className="text-foreground/85">X (Twitter) OAuth</strong>{" "}
              and/or <strong className="text-foreground/85">Google OAuth</strong> (through Supabase
              Auth). When you sign in we process identity data needed to run your account.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong className="text-foreground/85">Stored:</strong> Supabase user id;
                email and/or username from the OAuth provider; subscription status; Stripe customer
                id; token wallet balance; private research reports tied to your{" "}
                <code className="text-foreground/80">user_id</code>.
              </li>
              <li>
                <strong className="text-foreground/85">Not stored by Elenchos:</strong> card numbers
                or full payment credentials (handled by Stripe).
              </li>
            </ul>
            <p>
              Legacy guest commission links (if any remain) are{" "}
              <strong className="text-foreground/85">token-based</strong> rather than tied to a
              Pro account identity. Pro authenticated accounts do have identity linked to the
              subscription and private reports.
            </p>
          </Section>

          <Section icon={FlaskConical} title="Private research reports">
            <p>
              Private reports created under a Pro account are associated with your authenticated{" "}
              <code className="text-foreground/80">user_id</code>. Topic/questions text, report
              content, package or wallet usage, and timestamps are retained so you can access your
              work while the account (and report retention) remain active.
            </p>
            <p>
              Treat private report URLs as confidential. If a sharing option publishes a report to
              the public library, only the shared research content is shown — not payment data.
            </p>
          </Section>

          <Section icon={Database} title="Public discourse analysis">
            <p>
              Topic and dashboard analysis uses{" "}
              <strong className="text-foreground/90">aggregated public X posts</strong> retrieved
              via platform APIs — not private messages. We produce scores, themes, and paraphrased
              summaries. We do not sell individual user profiles or private-message dossiers.
            </p>
            <p>
              Sample sizes and method limits are shown so insights stay directional, not “census”
              claims. Public aggregates are not personal dossiers about visitors.
            </p>
          </Section>

          <Section icon={CreditCard} title="Payments &amp; plans">
            <p>
              Subscriptions are processed via <strong className="text-foreground/90">Stripe Checkout</strong>.
              Elenchos never receives or stores full card data (PCI stays with Stripe). Monthly plans
              include <strong className="text-foreground/85">Starter</strong>,{" "}
              <strong className="text-foreground/85">Plus</strong>, and{" "}
              <strong className="text-foreground/85">Mega</strong>. Stripe’s privacy notice applies
              to payment data they process as processor/controller for card handling.
            </p>
          </Section>

          <Section icon={Cookie} title="Cookies">
            <p>
              We may store a theme preference and similar strictly useful local settings in your
              browser. The Google Analytics tag (measurement ID{" "}
              <strong className="text-foreground/90">G-SM3C2J9L0Z</strong>) is present with Consent
              Mode; analytics storage stays off until you choose{" "}
              <strong className="text-foreground/90">Accept</strong> on the cookie banner. After
              Accept we count page visits with IP anonymization. We do not use advertising cookies
              or sell personal profiles. Choose Essential only to keep analytics off. You can clear
              site data in your browser at any time.
            </p>
          </Section>

          <Section icon={Scale} title="Lawful bases (GDPR)">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong className="text-foreground/85">Contract:</strong> providing paid
                subscriptions, wallet/token features, and private research reports.
              </li>
              <li>
                <strong className="text-foreground/85">Legitimate interests:</strong> operating the
                public research site (Dashboard, library, public trackers/topics), security, and
                service integrity — balanced against your rights.
              </li>
              <li>
                <strong className="text-foreground/85">Consent:</strong> non-essential analytics
                cookies (Google Analytics via Consent Mode).
              </li>
            </ul>
          </Section>

          <Section icon={Database} title="Processors &amp; recipients">
            <p>We use the following categories of processors / identity providers:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong className="text-foreground/85">Supabase</strong> — authentication and
                database.
              </li>
              <li>
                <strong className="text-foreground/85">Stripe</strong> — payments and subscription
                billing.
              </li>
              <li>
                <strong className="text-foreground/85">Vercel</strong> — hosting and edge delivery.
              </li>
              <li>
                <strong className="text-foreground/85">X / Google</strong> — OAuth identity
                providers when you choose to sign in with them.
              </li>
              <li>
                <strong className="text-foreground/85">Email provider</strong> — if used for
                transactional messages (e.g. delivery or account notices).
              </li>
            </ul>
          </Section>

          <Section icon={UserX} title="Your rights (GDPR)">
            <ul className="list-disc pl-5 space-y-1">
              <li>Access to your personal data.</li>
              <li>Rectification of inaccurate data.</li>
              <li>Erasure (“right to be forgotten”) where applicable.</li>
              <li>Restriction of processing.</li>
              <li>Data portability where applicable.</li>
              <li>Objection to processing based on legitimate interests.</li>
              <li>Lodge a complaint with your EU/EEA supervisory authority.</li>
            </ul>
            <p>
              To exercise these rights, contact us at{" "}
              <a href={ELENCHOS_CONTACT_MAILTO} className="text-cyan hover:underline break-all">
                {ELENCHOS_CONTACT_EMAIL}
              </a>
              . For Pro accounts, identify the account (e.g. sign-in email/username). For any
              remaining token-based guest commission links, include the report token.
            </p>
          </Section>

          <Section icon={ShieldCheck} title="Retention">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong className="text-foreground/85">Account data:</strong> retained while the
                account is active (and as needed for legal/billing obligations after closure).
              </li>
              <li>
                <strong className="text-foreground/85">Private reports:</strong> retained while kept
                for the user under the account.
              </li>
              <li>
                <strong className="text-foreground/85">Public aggregates:</strong> not personal
                dossiers about site visitors; discourse analytics use public posts in aggregated
                form.
              </li>
            </ul>
          </Section>

          <p className="text-[12px] text-muted-foreground leading-relaxed px-1">
            This notice describes Elenchos’s processing for free browsing and Pro authentication.
            It is not legal advice. We may update it when the product or processors change; the
            version line above reflects the current revision.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
