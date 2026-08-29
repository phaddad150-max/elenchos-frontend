import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Layers, Palette, Radio, Shield } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ContactEmailMe } from "@/components/ContactEmailMe";
import { DESK_SOCIAL, socialMetaTags } from "@/lib/social-meta";

export const Route = createFileRoute("/desk")({
  head: () => ({
    meta: socialMetaTags(DESK_SOCIAL),
    links: [{ rel: "canonical", href: DESK_SOCIAL.url }],
  }),
  component: DeskPage,
});

const INCLUDED = [
  {
    icon: Radio,
    title: "This dashboard, as yours",
    body: "The live elenchos.live desk is the prototype: public-discourse signals, heatmap, topic briefings. You get that product — not a new science project.",
  },
  {
    icon: Palette,
    title: "Your brand, or none",
    body: "Ship with your name, colors, and domain — or run unbranded. Elenchos does not have to appear on the public face.",
  },
  {
    icon: Layers,
    title: "Topics you choose and fund",
    body: "You pick the topics. You pay to sample them. No weekly X/Grok refresh unless the sample is funded — the public prototype stays as the demo.",
  },
] as const;

const DEFAULT_INQUIRY = `Hi — I want to buy an Elenchos desk.

Organization:
Brand: own brand / unbranded (no Elenchos mark)
Topics we want sampled:
Domain / audience:

`;

function DeskPage() {
  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1100px] mx-auto w-full min-w-0 px-2.5 sm:px-4 md:px-6 py-5 sm:py-8 mobile-safe-bottom md:pb-14 relative flex-1 overflow-x-clip space-y-6 sm:space-y-8">
        <header className="page-hero-banner overflow-hidden min-w-0 relative rounded-2xl border border-cyan/30">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_12%_0%,color-mix(in_oklab,var(--cyan)_22%,transparent),transparent_55%),radial-gradient(ellipse_at_88%_40%,color-mix(in_oklab,var(--amber-signal)_12%,transparent),transparent_50%)]" />
          <div className="relative p-4 sm:p-6 md:p-8 space-y-3.5 min-w-0">
            <div className="page-hero-kicker">
              <Building2 className="w-3.5 h-3.5" aria-hidden />
              Organizations · one product
            </div>
            <h1 className="page-hero-title text-[1.55rem] sm:text-3xl md:text-[2.05rem] break-words max-w-3xl">
              Buy this desk
            </h1>
            <p className="text-[14px] sm:text-[15.5px] text-foreground/90 max-w-2xl leading-relaxed">
              One public offer: the dashboard you can already use on elenchos.live, licensed
              to your organization — with your branding or none, and topics you choose and pay
              to keep sampled.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center pt-1">
              <ContactEmailMe
                source="desk-enterprise"
                variant="button"
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-5 rounded-full border border-cyan/50 bg-cyan/15 text-cyan text-[13.5px] font-display font-semibold hover:bg-cyan/25"
                defaultMessage={DEFAULT_INQUIRY}
                dialogTitle="Request a desk"
                dialogDescription="Tell us the organization, brand choice, and topics. We reply from the Elenchos inbox — no self-serve checkout."
              >
                Request a desk
              </ContactEmailMe>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 text-[13px] font-medium text-muted-foreground hover:text-cyan"
              >
                Open the live prototype
                <ArrowRight className="w-3.5 h-3.5" aria-hidden />
              </Link>
            </div>
          </div>
        </header>

        <section aria-labelledby="desk-included" className="space-y-3">
          <h2
            id="desk-included"
            className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground"
          >
            What you buy — one option
          </h2>
          <ul className="grid sm:grid-cols-3 gap-3">
            {INCLUDED.map((item) => (
              <li
                key={item.title}
                className="dash-panel p-4 sm:p-5 space-y-2.5 min-h-[168px] flex flex-col"
              >
                <span className="w-9 h-9 rounded-lg border border-cyan/35 bg-cyan/10 text-cyan grid place-items-center">
                  <item.icon className="w-4 h-4" aria-hidden />
                </span>
                <h3 className="font-display font-semibold text-[15px] leading-snug">
                  {item.title}
                </h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed flex-1">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="desk-prototype"
          className="rounded-2xl border border-border/80 bg-card/40 p-4 sm:p-6 space-y-3"
        >
          <h2
            id="desk-prototype"
            className="text-[11px] font-mono uppercase tracking-[0.16em] text-cyan"
          >
            Prototype
          </h2>
          <p className="text-[15px] font-display font-semibold text-foreground">
            You already used it. This is the product.
          </p>
          <p className="text-[13.5px] text-muted-foreground leading-relaxed max-w-2xl">
            Public discourse around a topic of selection, heatmap, leadership boards, and the
            Research Library are the working surface. We do not sell a vaporware mock. The
            public site remains the citizen demo; a paid desk is that same stack with your
            face on it and a sample you fund.
          </p>
          <ul className="grid sm:grid-cols-2 gap-2 text-[13px] text-foreground/90">
            <li className="rounded-xl border border-border/80 px-3 py-2.5">
              Unbranded — no Elenchos mark on the public face
            </li>
            <li className="rounded-xl border border-border/80 px-3 py-2.5">
              Your brand — name, colors, domain
            </li>
            <li className="rounded-xl border border-border/80 px-3 py-2.5">
              Your topic list — only what you pay to refresh
            </li>
            <li className="rounded-xl border border-border/80 px-3 py-2.5">
              Contact-only sale — no extra public plan grid
            </li>
          </ul>
        </section>

        <aside className="rounded-xl border border-dashed border-border/80 px-4 py-3 text-[12.5px] text-muted-foreground flex items-start gap-2">
          <Shield className="w-3.5 h-3.5 mt-0.5 shrink-0 text-cyan" aria-hidden />
          <span>
            Citizen journalism on the public Library stays free. A desk does not buy silence or
            a censorship bureau — it buys a branded (or unbranded) discourse dashboard and the
            samples you fund. Method and falsifiers stay visible.
          </span>
        </aside>
      </main>

      <SiteFooter />
    </div>
  );
}
