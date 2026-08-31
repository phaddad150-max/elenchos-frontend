import type { UaeLang } from "@/lib/desk/uae";
import { SOLVO_SIM_PAID } from "@/lib/desk/solvo-sim";
import { SimulatedDataBadge } from "@/components/SimulatedDataBadge";

/** Solvo prototype board. Labeled simulated figures — same locked bands as the public desk. */
export function PaidEarnedPanel({ lang }: { lang: UaeLang }) {
  const ar = lang === "ar";
  const cards = ar
    ? [
        { label: "مدفوع / رسمي", hint: "تعزيز وحسابات وزارات وإعلام", value: SOLVO_SIM_PAID.volume },
        { label: "مكتسب / قوة عاملة", hint: "ردود وذكر عضوي من حسابات عادية", value: SOLVO_SIM_PAID.earned },
        { label: "نزاهة", hint: "ناس حقيقيون مقابل مزارع وانتحال", value: SOLVO_SIM_PAID.integrity },
        { label: "فجوة السرد", hint: "الإطار الرسمي/الإعلامي مقابل كلام العاملين", value: SOLVO_SIM_PAID.gap },
      ]
    : [
        { label: "Paid / official", hint: "Boosts, ministry and media accounts", value: SOLVO_SIM_PAID.volume },
        { label: "Earned / workforce", hint: "Unprompted ordinary accounts", value: SOLVO_SIM_PAID.earned },
        { label: "Integrity", hint: "Real people vs farms and impersonation", value: SOLVO_SIM_PAID.integrity },
        { label: "Narrative gap", hint: "Official/media frame vs workforce speech", value: SOLVO_SIM_PAID.gap },
      ];

  return (
    <section className="dash-panel p-3 sm:p-5 space-y-3">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display font-semibold text-[0.98rem] sm:text-[1.15rem]">
            {ar ? "خطاب عام × مكتب بحث" : "Public discourse × research desk"}
          </h2>
          <SimulatedDataBadge />
        </div>
        <p className="text-[12px] text-muted-foreground leading-relaxed">
          {ar
            ? "نفس منطق التقييم المقفول. الأرقام أدناه تجريبية لمعاينة سولفو — ليست عيّنة إكس حية."
            : "Same locked scoring logic. Figures below are a Solvo preview simulation — not a live X sample."}
        </p>
      </div>
      <ul className="grid sm:grid-cols-2 xl:grid-cols-4 gap-2">
        {cards.map((c) => (
          <li key={c.label} className="rounded-xl border border-border/80 bg-background/40 px-3 py-3 space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">{c.label}</p>
            <p className="text-[1.2rem] font-display font-semibold tabular-nums text-cyan">{c.value}</p>
            <p className="text-[11px] text-muted-foreground leading-snug">{c.hint}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
