import { useState, type FormEvent } from "react";
import { ArrowRight, Loader2, Lock, Shield } from "lucide-react";
import {
  SOLVO_INTERVAL,
  SOLVO_PLANS,
  SOLVO_SETUP_AED,
  formatAed,
  isPubliceyeDeskEmail,
  normalizeDeskEmail,
  type SolvoPlanId,
} from "@/lib/desk/catalog";
import type { UaeLang } from "@/lib/desk/uae";

export function SolvoPlans({
  lang = "en",
  market = "publiceye",
}: {
  lang?: UaeLang;
  market?: "publiceye";
}) {
  const rtl = lang === "ar";
  const [plan, setPlan] = useState<SolvoPlanId>("pulse");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const selected = SOLVO_PLANS[plan];
  const allowed = isPubliceyeDeskEmail(email);

  const onUnlock = (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!isPubliceyeDeskEmail(email)) {
      setErr(
        rtl
          ? "هذا المكتب بدعوة فقط."
          : "BrandEye desk checkout is invitation-only.",
      );
      setUnlocked(false);
      return;
    }
    setEmail(normalizeDeskEmail(email));
    setUnlocked(true);
  };

  const onPay = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!isPubliceyeDeskEmail(email)) {
      setErr(rtl ? "هذا المكتب بدعوة فقط." : "BrandEye desk checkout is invitation-only.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/desk/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          orgName,
          email: normalizeDeskEmail(email),
          market,
          plan,
        }),
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
    <div className="space-y-4" dir={rtl ? "rtl" : "ltr"}>
      <div className="grid sm:grid-cols-2 gap-3">
        {(Object.values(SOLVO_PLANS) as (typeof SOLVO_PLANS)[SolvoPlanId][]).map((p) => {
          const active = plan === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlan(p.id)}
              className={`text-start rounded-2xl border p-4 space-y-2 min-h-[180px] flex flex-col transition-colors ${
                active
                  ? "border-cyan/60 bg-cyan/10"
                  : "border-border bg-card/40 hover:border-cyan/35"
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-display font-semibold text-[16px]">{rtl ? p.nameAr : p.name}</p>
                <p className="text-[13px] font-display font-semibold text-cyan tabular-nums">
                  {formatAed(p.monthlyAed)}
                  <span className="text-muted-foreground font-normal">/{SOLVO_INTERVAL}</span>
                </p>
              </div>
              <p className="text-[12.5px] text-muted-foreground leading-relaxed">
                {rtl ? p.blurbAr : p.blurb}
              </p>
              <ul className="text-[12px] text-muted-foreground space-y-1 flex-1">
                {(rtl ? p.includesAr : p.includes).map((line) => (
                  <li key={line}>· {line}</li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <p className="text-[12px] text-muted-foreground leading-relaxed">
        {rtl
          ? `${formatAed(SOLVO_SETUP_AED)} تأسيس لمرة واحدة. التحديث الأسبوعي مشمول.`
          : `${formatAed(SOLVO_SETUP_AED)} one-time setup. Weekly refresh included.`}
      </p>

      {!unlocked ? (
        <form onSubmit={onUnlock} className="dash-panel p-4 sm:p-5 space-y-3">
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
            <div>
              <h2 className="font-display font-semibold text-[1.05rem]">
                {rtl ? "دخول المكتب بدعوة ودفع" : "Desk access is invitation + payment"}
              </h2>
              <p className="text-[12.5px] text-muted-foreground leading-relaxed mt-1">
                {rtl
                  ? "أدخل البريد المصرّح لفتح الدفع."
                  : "Enter the operator email to unlock checkout. A live desk only opens after Stripe payment."}
              </p>
            </div>
          </div>
          <label className="block space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              {rtl ? "البريد المصرّح" : "Authorized email"}
            </span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErr(null);
              }}
              className="w-full min-h-[44px] rounded-xl border border-border bg-background px-3 text-[14px]"
              placeholder="citizen.pulse101@gmail.com"
              autoComplete="email"
            />
          </label>
          {err ? <p className="text-[13px] text-rose-signal">{err}</p> : null}
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-1.5 min-h-[44px] rounded-full border border-cyan/50 bg-cyan/15 text-cyan text-[14px] font-display font-semibold hover:bg-cyan/25"
          >
            {rtl ? "متابعة للدفع" : "Continue to payment"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      ) : (
        <form onSubmit={onPay} className="dash-panel p-4 sm:p-5 space-y-3">
          <h2 className="font-display font-semibold text-[1.05rem]">
            {rtl ? "ادفع وخصّص لوحتك" : "Pay and brand your desk"}
          </h2>
          <p className="text-[12.5px] text-muted-foreground leading-relaxed">
            {`${formatAed(SOLVO_SETUP_AED)} setup + ${formatAed(selected.monthlyAed)}/${SOLVO_INTERVAL} · ${selected.name}.`}
          </p>
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
              placeholder="Your Dubai company"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Work email</span>
            <input
              required
              type="email"
              readOnly
              value={email}
              className="w-full min-h-[44px] rounded-xl border border-border bg-muted/40 px-3 text-[14px] text-muted-foreground"
            />
          </label>
          {err ? <p className="text-[13px] text-rose-signal">{err}</p> : null}
          <button
            type="submit"
            disabled={busy || !allowed}
            className="w-full inline-flex items-center justify-center gap-1.5 min-h-[44px] rounded-full border border-cyan/50 bg-cyan/15 text-cyan text-[14px] font-display font-semibold hover:bg-cyan/25 disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Pay with Stripe · {formatAed(SOLVO_SETUP_AED)} + {formatAed(selected.monthlyAed)}/{SOLVO_INTERVAL}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
            <Shield className="w-3.5 h-3.5 mt-0.5 shrink-0 text-cyan" />
            Prices in UAE dirhams on Stripe. BrandEye tables only — existing Elenchos rows are not overwritten.
          </p>
        </form>
      )}
    </div>
  );
}
