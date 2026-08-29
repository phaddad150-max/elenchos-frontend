import type { UaeLang } from "@/lib/desk/uae";

/** Prototype board. Never invent paid/earned volumes. */
export function PaidEarnedPanel({ lang }: { lang: UaeLang }) {
  const ar = lang === "ar";
  const cards = ar
    ? [
        { label: "مدفوع / رسمي", hint: "تعزيز وحسابات وزارات وإعلام" },
        { label: "مكتسب / قوة عاملة", hint: "ردود وذكر عضوي من حسابات عادية" },
        { label: "نزاهة", hint: "ناس حقيقيون مقابل مزارع وانتحال" },
        { label: "فجوة السرد", hint: "الإطار الرسمي/الإعلامي مقابل كلام العاملين" },
      ]
    : [
        { label: "Paid / official", hint: "Boosts, ministry and media accounts" },
        { label: "Earned / workforce", hint: "Unprompted ordinary accounts" },
        { label: "Integrity", hint: "Real people vs farms and impersonation" },
        { label: "Narrative gap", hint: "Official/media frame vs workforce speech" },
      ];

  return (
    <section className="dash-panel p-3 sm:p-5 space-y-3">
      <div className="space-y-1">
        <h2 className="font-display font-semibold text-[0.98rem] sm:text-[1.15rem]">
          {ar ? "كلام القوة العاملة مقابل الرسمي والإعلام" : "Workforce speech vs official and media"}
        </h2>
        <p className="text-[12px] text-muted-foreground leading-relaxed">
          {ar
            ? "العيّنة: حسابات عادية. الوزارات والإعلام للمقارنة — ليست صوت الجمهور. المنهج مقفول. بلا اختراع أرقام."
            : "The sample is unprompted ordinary accounts. Ministry and media are contrast — not the public voice. Method locked. Volumes stay 0 · awaiting data until a billed run."}
        </p>
      </div>
      <ul className="grid sm:grid-cols-2 xl:grid-cols-4 gap-2">
        {cards.map((c) => (
          <li key={c.label} className="rounded-xl border border-border/80 bg-background/40 px-3 py-3 space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">{c.label}</p>
            <p className="text-[12px] font-mono text-muted-foreground">0 · {ar ? "بانتظار البيانات" : "awaiting data"}</p>
            <p className="text-[11px] text-muted-foreground leading-snug">{c.hint}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
