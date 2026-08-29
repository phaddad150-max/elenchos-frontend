import type { UaeLang } from "@/lib/desk/uae";

/** Prototype board. Never invent paid/earned volumes. */
export function PaidEarnedPanel({ lang }: { lang: UaeLang }) {
  const ar = lang === "ar";
  const cards = ar
    ? [
        { label: "حجم مدفوع", hint: "إعلانات وترندات معززة" },
        { label: "حجم مكتسب", hint: "ردود واقتباسات وذكر عضوي" },
        { label: "درجة النزاهة", hint: "حسابات حقيقية مقابل مزارع" },
        { label: "فجوة السرد", hint: "إطار الحملة مقابل إطار الناس" },
      ]
    : [
        { label: "Paid volume", hint: "Promoted ads, takeovers, boosts" },
        { label: "Earned volume", hint: "Replies, quotes, organic mentions" },
        { label: "Integrity score", hint: "Real accounts vs farms" },
        { label: "Narrative gap", hint: "Campaign frame vs citizen frame" },
      ];

  return (
    <section className="dash-panel p-3 sm:p-5 space-y-3">
      <div className="space-y-1">
        <h2 className="font-display font-semibold text-[0.98rem] sm:text-[1.15rem]">
          {ar ? "مدفوع مقابل مكتسب على إكس" : "Paid vs earned on X"}
        </h2>
        <p className="text-[12px] text-muted-foreground leading-relaxed">
          {ar
            ? "إكس سطح القياس. الواجهة مصدر السجل. xAI طبقة التحليل — مع بوابة بشرية. ليست بكسل عائد خاص."
            : "X is the measurement surface. X API is the source of record. xAI is the analysis layer — with a human gate. Not a private ROAS pixel."}
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
