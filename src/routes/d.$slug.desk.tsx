import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SolvoPlans } from "@/components/desk/SolvoPlans";
import { UAE_DEMO_SLUG } from "@/lib/desk/catalog";
import { UAE_AR, UAE_EN, type UaeLang } from "@/lib/desk/uae";

const slugRoute = getRouteApi("/d/$slug");

export const Route = createFileRoute("/d/$slug/desk")({
  component: TenantDeskPlansPage,
});

function TenantDeskPlansPage() {
  const { desk } = slugRoute.useLoaderData();
  const [lang, setLang] = useState<UaeLang>("en");
  if (!desk) return null;
  const uae = desk.tenant.slug === UAE_DEMO_SLUG || desk.tenant.email === "uae-demo@elenchos.live";
  if (!uae) {
    return (
      <main className="max-w-[720px] mx-auto px-4 py-10 space-y-2">
        <p className="text-[14px] text-muted-foreground">Plans for this desk are not public.</p>
        <Link to="/d/$slug" params={{ slug: desk.tenant.slug || "" }} className="text-cyan hover:underline text-[13px]">
          Back to overview
        </Link>
      </main>
    );
  }
  const copy = lang === "ar" ? UAE_AR : UAE_EN;
  const rtl = lang === "ar";
  return (
    <main
      className="max-w-[860px] mx-auto w-full px-3 sm:px-4 md:px-6 py-5 sm:py-8 space-y-5 relative flex-1 mobile-safe-bottom"
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
      </header>
      <SolvoPlans lang={lang} />
    </main>
  );
}
