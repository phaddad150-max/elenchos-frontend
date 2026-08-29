import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight, Building2, Loader2, Lock, Shield } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { UAE_SOCIAL, socialMetaTags } from "@/lib/social-meta";
import { DESK_INTERVAL, DESK_PRICE_USD } from "@/lib/desk/catalog";
import { UAE_AR, UAE_EN, type UaeLang } from "@/lib/desk/uae";

export const Route = createFileRoute("/uae")({
  validateSearch: (s: Record<string, unknown>): { cancelled?: "1" } =>
    s.cancelled === "1" || s.cancelled === true ? { cancelled: "1" } : {},
  head: () => ({
    meta: socialMetaTags(UAE_SOCIAL),
    links: [
      { rel: "canonical", href: UAE_SOCIAL.url },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap",
      },
    ],
  }),
  component: UaePage,
});

function UaePage() {
  const search = Route.useSearch();
  const [lang, setLang] = useState<UaeLang>("en");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const copy = lang === "ar" ? UAE_AR : UAE_EN;
  const rtl = lang === "ar";

  const onPay = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/desk/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orgName, email, market: "uae" }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setErr(data.error || (rtl ? "فشل الدفع." : "Checkout failed."));
        return;
      }
      window.location.assign(data.url);
    } catch {
      setErr(rtl ? "تعذر بدء الدفع." : "Could not start checkout.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="page-shell dash-landing"
      dir={rtl ? "rtl" : "ltr"}
      style={rtl ? { fontFamily: '"IBM Plex Sans Arabic", "Segoe UI", sans-serif' } : undefined}
    >
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1100px] mx-auto w-full min-w-0 px-2.5 sm:px-4 md:px-6 py-5 sm:py-8 mobile-safe-bottom md:pb-14 relative flex-1 overflow-x-clip space-y-6 sm:space-y-8">
        <div className="flex justify-end">
          <div className="inline-flex rounded-full border border-border p-0.5 text-[12px] font-medium">
            <button
              type="button"
              className={`min-h-[36px] px-3 rounded-full ${lang === "en" ? "bg-cyan/15 text-cyan" : "text-muted-foreground"}`}
              onClick={() => setLang("en")}
            >
              EN
            </button>
            <button
              type="button"
              className={`min-h-[36px] px-3 rounded-full ${lang === "ar" ? "bg-cyan/15 text-cyan" : "text-muted-foreground"}`}
              onClick={() => setLang("ar")}
            >
              العربية
            </button>
          </div>
        </div>

        <header className="page-hero-banner overflow-hidden min-w-0 relative rounded-2xl border border-cyan/30">
          <div className="relative p-4 sm:p-6 md:p-8 space-y-3.5 min-w-0">
            <div className="page-hero-kicker">
              <Building2 className="w-3.5 h-3.5" aria-hidden />
              {copy.kicker}
            </div>
            <h1 className="page-hero-title text-[1.45rem] sm:text-3xl md:text-[2.05rem] break-words max-w-3xl">
              {copy.title}
            </h1>
            <p className="text-[14px] sm:text-[15.5px] text-foreground/90 max-w-2xl leading-relaxed">{copy.blurb}</p>
            <p className="text-[13px] font-display font-semibold text-cyan">
              ${DESK_PRICE_USD}/{DESK_INTERVAL} USD · {rtl ? "جداول عند الدفع" : "tables created at payment"}
            </p>
            <p className="text-[12px] text-amber-signal">{copy.arReview}</p>
          </div>
        </header>

        {search.cancelled ? (
          <p className="text-[13px] text-amber-signal">
            {rtl ? "أُلغي الدفع. يمكنك المحاولة أدناه." : "Checkout cancelled. You can start again below."}
          </p>
        ) : null}

        <div className="grid lg:grid-cols-12 gap-5">
          <section className="lg:col-span-7 space-y-4">
            <h2 className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
              {copy.productTitle}
            </h2>
            <ul className="grid sm:grid-cols-1 gap-3">
              {copy.product.map((item) => (
                <li key={item.title} className="dash-panel p-4 space-y-1.5">
                  <h3 className="font-display font-semibold text-[15px]">{item.title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{item.body}</p>
                </li>
              ))}
            </ul>
            <div className="dash-panel p-4 space-y-2">
              <h3 className="font-display font-semibold text-[15px]">{copy.whyTitle}</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{copy.why}</p>
            </div>
            <div className="dash-panel p-4 space-y-2">
              <h3 className="font-display font-semibold text-[15px]">{copy.buyersTitle}</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{copy.buyers}</p>
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
              <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-cyan" />
              {copy.limits}
            </p>
          </section>

          <section className="lg:col-span-5 space-y-3">
            <form onSubmit={onPay} className="dash-panel p-4 sm:p-5 space-y-3">
              <h2 className="font-display font-semibold text-[1.05rem]">{copy.payCta}</h2>
              <label className="block space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
                  {rtl ? "المؤسسة" : "Organization"}
                </span>
                <input
                  required
                  minLength={2}
                  maxLength={80}
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-border bg-background px-3 text-[14px]"
                  placeholder={rtl ? "شركتك في دبي" : "Your Dubai company"}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
                  {rtl ? "البريد" : "Work email"}
                </span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-border bg-background px-3 text-[14px]"
                  placeholder="you@company.ae"
                />
              </label>
              {err ? <p className="text-[13px] text-rose-signal">{err}</p> : null}
              <button
                type="submit"
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-1.5 min-h-[44px] rounded-full border border-cyan/50 bg-cyan/15 text-cyan text-[14px] font-display font-semibold hover:bg-cyan/25 disabled:opacity-50"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {copy.payCta} · ${DESK_PRICE_USD}/{DESK_INTERVAL}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                <Shield className="w-3.5 h-3.5 mt-0.5 shrink-0 text-cyan" />
                {rtl
                  ? "البطاقة عبر سترايب. جداولك تُنشأ عند نجاح الدفع. لا أرقام مخترعة."
                  : "Card on Stripe. Your tables are created when payment clears. No invented scores."}
              </p>
            </form>
            <Link
              to="/desk/thanks"
              search={{ demo: "uae" }}
              className="w-full inline-flex items-center justify-center gap-1.5 min-h-[44px] rounded-full border border-border text-[13px] font-medium hover:border-cyan/40"
            >
              {copy.walkCta}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link to="/d/$slug" params={{ slug: "uae-prototype" }} className="block text-[12px] text-cyan hover:underline text-center">
              {rtl ? "اللوحة التجريبية الحية" : "Open the live UAE prototype"}
            </Link>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
