import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight, Building2, Layers, Loader2, Lock, Palette, Radio, Shield } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { DESK_SOCIAL, socialMetaTags } from "@/lib/social-meta";
import { DESK_INCLUDED, DESK_INTERVAL, DESK_PRICE_USD, DESK_PRODUCT_BLURB } from "@/lib/desk/catalog";

export const Route = createFileRoute("/desk/")({
  validateSearch: (s: Record<string, unknown>): { cancelled?: "1" } =>
    s.cancelled === "1" || s.cancelled === true ? { cancelled: "1" } : {},
  head: () => ({
    meta: socialMetaTags(DESK_SOCIAL),
    links: [{ rel: "canonical", href: DESK_SOCIAL.url }],
  }),
  component: DeskPage,
});

function DeskPage() {
  const search = Route.useSearch();
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onPay = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/desk/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orgName, email }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setErr(data.error || "Checkout failed.");
        return;
      }
      window.location.assign(data.url);
    } catch {
      setErr("Could not start checkout.");
    } finally {
      setBusy(false);
    }
  };

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
              Buy this dashboard
            </h1>
            <p className="text-[14px] sm:text-[15.5px] text-foreground/90 max-w-2xl leading-relaxed">
              {DESK_PRODUCT_BLURB} Like a site template: pay, brand it, pick topics, generate a live
              link. Connect your own domain when you are ready.
            </p>
            <p className="text-[13px] font-display font-semibold text-cyan">
              ${DESK_PRICE_USD}/{DESK_INTERVAL} · tables created at payment
            </p>
          </div>
        </header>

        {search.cancelled ? (
          <p className="text-[13px] text-amber-signal">Checkout cancelled. You can start again below.</p>
        ) : null}

        <div className="grid lg:grid-cols-12 gap-5">
          <section className="lg:col-span-7 space-y-3">
            <h2 className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
              What you buy
            </h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: Radio, title: "This dashboard, as yours", body: "elenchos.live is the template. You get the same public-discourse surface." },
                { icon: Palette, title: "Brand after you pay", body: "Colors, name, logo — or unbranded. Studio opens only after Stripe." },
                { icon: Layers, title: "Pick topics, then Generate", body: "Catalog topics copy existing samples. Custom names stay 0 · awaiting data until a funded run." },
                { icon: Lock, title: "Code stays locked", body: "You do not get Pass-1 / scoring logic. You buy the desk, not the method." },
              ].map((item) => (
                <li key={item.title} className="dash-panel p-4 space-y-2 min-h-[140px] flex flex-col">
                  <span className="w-9 h-9 rounded-lg border border-cyan/35 bg-cyan/10 text-cyan grid place-items-center">
                    <item.icon className="w-4 h-4" aria-hidden />
                  </span>
                  <h3 className="font-display font-semibold text-[15px]">{item.title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed flex-1">{item.body}</p>
                </li>
              ))}
            </ul>
            <ul className="text-[12.5px] text-muted-foreground space-y-1 pt-1">
              {DESK_INCLUDED.map((line) => (
                <li key={line}>· {line}</li>
              ))}
            </ul>
          </section>

          <section className="lg:col-span-5">
            <form
              onSubmit={onPay}
              className="dash-panel p-4 sm:p-5 space-y-3"
              aria-labelledby="desk-checkout"
            >
              <h2 id="desk-checkout" className="font-display font-semibold text-[1.05rem]">
                Checkout
              </h2>
              <p className="text-[12.5px] text-muted-foreground leading-relaxed">
                Stripe takes the card. After payment you land in the studio — not a message popup —
                to brand the desk and generate your live URL.
              </p>
              <label className="block space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
                  Organization
                </span>
                <input
                  required
                  minLength={2}
                  maxLength={80}
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-border bg-background px-3 text-[14px]"
                  placeholder="Acme Research"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
                  Work email
                </span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-border bg-background px-3 text-[14px]"
                  placeholder="you@org.com"
                />
              </label>
              {err ? <p className="text-[13px] text-rose-signal">{err}</p> : null}
              <button
                type="submit"
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-1.5 min-h-[44px] rounded-full border border-cyan/50 bg-cyan/15 text-cyan text-[14px] font-display font-semibold hover:bg-cyan/25 disabled:opacity-50"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Pay ${DESK_PRICE_USD}/{DESK_INTERVAL}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                <Shield className="w-3.5 h-3.5 mt-0.5 shrink-0 text-cyan" />
                Card on Stripe. Your desk tables are created when payment clears. No invented scores.
              </p>
              <Link to="/" className="text-[12px] text-cyan hover:underline inline-flex items-center gap-1">
                Open the live prototype
                <ArrowRight className="w-3 h-3" />
              </Link>
            </form>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
