import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Lock } from "lucide-react";
import { SolvoPlans } from "@/components/desk/SolvoPlans";
import {
  SOLVO_INSIGHT_AED,
  SOLVO_PULSE_AED,
  SOLVO_SETUP_AED,
  formatAed,
} from "@/lib/desk/catalog";
import { UAE_AR, UAE_EN, type UaeLang } from "@/lib/desk/uae";
import { SOLVO_TOPICS } from "@/lib/desk/solvo-topics";

const parentRoute = getRouteApi("/solvocreations-uae");

export const Route = createFileRoute("/solvocreations-uae/desk")({
  validateSearch: (s: Record<string, unknown>): { cancelled?: "1" } =>
    s.cancelled === "1" || s.cancelled === true ? { cancelled: "1" } : {},
  component: SolvoDeskPlansPage,
});

function SolvoDeskPlansPage() {
  const { desk } = parentRoute.useLoaderData();
  const search = Route.useSearch();
  const [lang, setLang] = useState<UaeLang>("en");
  if (!desk) return null;
  const copy = lang === "ar" ? UAE_AR : UAE_EN;
  const rtl = lang === "ar";
  return (
    <main
      className="max-w-[1100px] mx-auto w-full px-3 sm:px-4 md:px-6 py-5 sm:py-8 space-y-6 relative flex-1 mobile-safe-bottom"
      dir={rtl ? "rtl" : "ltr"}
    >
      <div className="flex justify-end">
        <div className="inline-flex rounded-full border border-border p-0.5 text-[11px] font-medium">
          <button
            type="button"
            className={`min-h-[32px] px-2.5 rounded-full ${lang === "en" ? "bg-cyan/15 text-cyan" : "text-muted-foreground"}`}
            onClick={() => setLang("en")}
          >
            EN
          </button>
          <button
            type="button"
            className={`min-h-[32px] px-2.5 rounded-full ${lang === "ar" ? "bg-cyan/15 text-cyan" : "text-muted-foreground"}`}
            onClick={() => setLang("ar")}
          >
            العربية
          </button>
        </div>
      </div>
      <header className="space-y-2">
        <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-cyan">{copy.kicker}</p>
        <h1 className="page-hero-title text-[1.45rem] sm:text-2xl">{copy.payCta}</h1>
        <p className="text-[14px] text-muted-foreground leading-relaxed max-w-2xl">{copy.blurb}</p>
        <p className="text-[13px] font-display font-semibold text-cyan">
          {formatAed(SOLVO_SETUP_AED)} {rtl ? "تأسيس لمرة واحدة" : "one-time setup"} ·{" "}
          {rtl ? "نبض" : "Pulse"} {formatAed(SOLVO_PULSE_AED)}/{rtl ? "شهر" : "mo"} ·{" "}
          {rtl ? "رؤية" : "Insight"} {formatAed(SOLVO_INSIGHT_AED)}/{rtl ? "شهر" : "mo"}
        </p>
      </header>
      {search.cancelled ? (
        <p className="text-[13px] text-amber-signal">
          {rtl ? "أُلغي الدفع. يمكنك المحاولة أدناه." : "Checkout cancelled. You can start again below."}
        </p>
      ) : null}
      <div className="grid lg:grid-cols-12 gap-5">
        <section className="lg:col-span-7 space-y-4">
          <ul className="grid gap-3">
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
          <p className="text-[12px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-cyan" />
            {copy.limits}
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {SOLVO_TOPICS.map((t) => (
              <li
                key={t.id}
                className="text-[11px] font-mono rounded-full border border-border px-2.5 py-1 text-muted-foreground"
              >
                {t.name}
              </li>
            ))}
          </ul>
        </section>
        <section className="lg:col-span-5 space-y-3">
          <SolvoPlans lang={lang} />
          <Link
            to="/desk/thanks"
            search={{ demo: "uae" }}
            className="w-full inline-flex items-center justify-center gap-1.5 min-h-[44px] rounded-full border border-border text-[13px] font-medium hover:border-cyan/40"
          >
            {copy.walkCta}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </section>
      </div>
    </main>
  );
}
