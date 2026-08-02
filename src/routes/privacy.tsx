import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Database,
  Cookie,
  UserX,
  CreditCard,
  FlaskConical,
  Globe2,
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
          "Elenchos privacy notice: browse without an account. On-demand Research Desk reports store no personal identity. Card data stays with Stripe. GDPR-aligned.",
      },
      { property: "og:title", content: "Privacy Notice · Elenchos" },
      {
        property: "og:description",
        content:
          "No personal dossiers. Optional one-time email for report delivery is not stored by Elenchos. Public discourse analysis uses aggregated public posts.",
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
            Version 2 · Updated for Research Desk on-demand reports · {new Date().getFullYear()}
          </p>
        </header>

        <div className="space-y-4">
          <Section icon={ShieldCheck} title="Who we are">
            <p>
              Elenchos (elenchos.live) is an experimental public-discourse and research product.
              We help people check citizen conversation vs official frames, and commission
              structured research reports.
            </p>
            <p>
              Contact:{" "}
              <a href={ELENCHOS_CONTACT_MAILTO} className="text-cyan hover:underline break-all">
                {ELENCHOS_CONTACT_EMAIL}
              </a>
              {" · "}
              <Link to="/about" className="text-cyan hover:underline">
                About
              </Link>
              {" · "}
              <Link to="/research" className="text-cyan hover:underline">
                Research Desk
              </Link>
            </p>
          </Section>

          <Section icon={Globe2} title="Browsing without an account">
            <p>
              You can use the Dashboard, Topics, Research library, and public reports{" "}
              <strong className="text-foreground/90">without creating an account</strong>. We do not
              require sign-in to read.
            </p>
            <p>
              We do not run advertising cookies or sell personal profiles. Hosting and security logs
              (e.g. IP at the edge) may exist at the infrastructure layer like any website; we do not
              build marketing dossiers from them.
            </p>
          </Section>

          <Section icon={FlaskConical} title="Research Desk · on-demand reports">
            <p>
              When you commission a report, we process{" "}
              <strong className="text-foreground/90">topic text and package choice</strong> — not
              your identity as a product.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong className="text-foreground/85">Stored:</strong> report token, package type,
                topic/questions text, report content, payment session id, timestamps.
              </li>
              <li>
                <strong className="text-foreground/85">Not stored by Elenchos:</strong> card numbers,
                crypto wallet secrets, name fields for commission orders, long-term email lists.
              </li>
              <li>
                <strong className="text-foreground/85">Optional email:</strong> if you provide one,
                it is used only to send your unique report link (via our email provider), then not
                kept in the report database.
              </li>
              <li>
                <strong className="text-foreground/85">Payment:</strong> handled by Stripe (or
                similar). Their privacy policy applies to payment data.
              </li>
            </ul>
            <p>
              Your unique report URL is private to people who have the link. Treat it like a secret
              document link.
            </p>
          </Section>

          <Section icon={Database} title="Public discourse analysis (Topics / Dashboard)">
            <p>
              For topic analysis we process <strong className="text-foreground/90">publicly available</strong>{" "}
              posts retrieved via platform APIs. We produce aggregates (scores, themes, paraphrased
              summaries). We do not sell individual user profiles scraped from private messages.
            </p>
            <p>
              Sample sizes and method limits are shown so insights stay directional, not “census”
              claims.
            </p>
          </Section>

          <Section icon={CreditCard} title="Payments">
            <p>
              One-time fees for on-demand research are processed by Stripe Checkout. Elenchos never
              receives or stores full card data (PCI stays with the processor). Crypto is available
              only if enabled on the Stripe account.
            </p>
          </Section>

          <Section icon={Cookie} title="Cookies">
            <p>
              Theme preference and similar strictly useful local settings may be stored in your
              browser. We do not use advertising or third-party analytics cookies for tracking. You
              can clear site data in your browser at any time.
            </p>
          </Section>

          <Section icon={UserX} title="Your rights (GDPR)">
            <ul className="list-disc pl-5 space-y-1">
              <li>Access, rectification, erasure, restriction, and portability where personal data exists.</li>
              <li>Object to processing based on legitimate interests where applicable.</li>
              <li>Lodge a complaint with your supervisory authority.</li>
            </ul>
            <p>
              For Research Desk orders without an account, the main artifact we hold is the{" "}
              <strong className="text-foreground/85">report token and content</strong>. Contact us
              with that token if you need deletion of a paid report record.
            </p>
          </Section>

          <p className="text-[12px] text-muted-foreground leading-relaxed px-1">
            Lawful bases typically include contract (delivering a paid report) and legitimate
            interests (operating a public research site) with minimization as design goal. This
            notice is not legal advice.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
