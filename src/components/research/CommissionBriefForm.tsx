import { useMemo, useState } from "react";
import { ArrowRight, Check, Lock, Loader2 } from "lucide-react";
import {
  ELENCHOS_CONTACT_CTA,
  buildContactMailto,
} from "@/lib/contact";

export type CommissionStyle = "topic-analysis" | "thesis";

const TIERS = [
  {
    id: "lite",
    label: "Lite structured brief",
    price: "€79",
    blurb: "Scoped question, core sources, 4–6 claims, limits box. ~1 week target after payment.",
  },
  {
    id: "full",
    label: "Full thesis-style pack",
    price: "€199",
    blurb: "Chapters, multi-source spine, claim table, scenarios, source appendix. Human-reviewed.",
  },
] as const;

/**
 * Free-style commission UX — privacy-first.
 * Payment processor checkout ships next; v1 captures structured intent + optional one-time email for delivery.
 * Does not store card data; does not require account.
 */
export function CommissionBriefForm() {
  const [style, setStyle] = useState<CommissionStyle>("thesis");
  const [tier, setTier] = useState<(typeof TIERS)[number]["id"]>("lite");
  const [topic, setTopic] = useState("");
  const [region, setRegion] = useState("");
  const [goal, setGoal] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const tierMeta = useMemo(() => TIERS.find((t) => t.id === tier) ?? TIERS[0], [tier]);

  const body = useMemo(() => {
    return [
      "Elenchos Research Desk — commission request (no account)",
      `Style: ${style === "topic-analysis" ? "Topics / public discourse analysis" : "Thesis-style multi-source brief"}`,
      `Tier: ${tierMeta.label} (${tierMeta.price})`,
      `Topic: ${topic.trim()}`,
      region.trim() ? `Region / scope: ${region.trim()}` : null,
      goal.trim() ? `Goal: ${goal.trim()}` : null,
      email.trim() ? `Delivery email (optional, one-time): ${email.trim()}` : "Delivery: no email — contact via reply channel",
      "Privacy: user asked for no long-term identity storage; payment via processor when live.",
    ]
      .filter(Boolean)
      .join("\n");
  }, [style, tierMeta, topic, region, goal, email]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!topic.trim() || topic.trim().length < 8) {
      setErr("Add a clear topic (at least a short sentence).");
      return;
    }
    if (!consent) {
      setErr("Confirm the privacy & method notice to continue.");
      return;
    }
    setBusy(true);
    try {
      const delivery = email.trim();
      if (delivery) {
        const res = await fetch("/api/public/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: "research-desk-commission",
            email: delivery,
            message: body,
            name: "",
            website: "",
          }),
        });
        if (!res.ok) {
          window.location.href = buildContactMailto({
            message: body,
            source: "research-desk-commission",
            fromEmail: delivery,
          });
        }
      } else {
        window.location.href = buildContactMailto({
          message: body,
          source: "research-desk-commission",
        });
      }
      setDone(true);
    } catch {
      window.location.href = buildContactMailto({
        message: body,
        source: "research-desk-commission",
        fromEmail: email.trim() || undefined,
      });
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-cyan/40 bg-cyan/10 px-4 py-5 space-y-2">
        <p className="inline-flex items-center gap-2 text-cyan font-display font-semibold text-[15px]">
          <Check className="w-4 h-4" /> Request received
        </p>
        <p className="text-[13px] text-foreground/90 leading-relaxed">
          We will confirm scope and payment link (card via Stripe Checkout; crypto option as available).
          No card details are ever stored on Elenchos servers. If email was provided, it is used only
          to deliver this order — not a marketing list.
        </p>
        <p className="text-[12px] font-mono text-muted-foreground">{ELENCHOS_CONTACT_CTA}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-2">
          1 · Report style
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <StylePick
            active={style === "topic-analysis"}
            title="Topics analysis style"
            desc="Public discourse (X) vs official & media frames — same DNA as live Topics."
            onClick={() => setStyle("topic-analysis")}
          />
          <StylePick
            active={style === "thesis"}
            title="Thesis-like brief"
            desc="Multi-source chapters, claims with confidence & falsifiers — academic/analyst depth."
            onClick={() => setStyle("thesis")}
          />
        </div>
      </div>

      <div>
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-2">
          2 · Depth / fee (one-time)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TIERS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTier(t.id)}
              className={`text-left rounded-xl border px-3 py-3 min-h-[44px] touch-manipulation transition-colors ${
                tier === t.id
                  ? "border-cyan/50 bg-cyan/12"
                  : "border-border bg-card/40 hover:border-cyan/30"
              }`}
            >
              <p className="text-[13px] font-display font-semibold text-foreground">
                {t.label}{" "}
                <span className="text-cyan font-mono text-[12px]">{t.price}</span>
              </p>
              <p className="text-[11.5px] text-muted-foreground mt-1 leading-snug">{t.blurb}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
          3 · Your topic
        </p>
        <label className="block">
          <span className="sr-only">Research topic</span>
          <textarea
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={3}
            placeholder="e.g. ‘EU–Morocco return agreements: claimed vs documented returns 2015–2025’"
            className="w-full rounded-xl border border-border bg-background/80 px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/70 min-h-[88px] focus:outline-none focus:border-cyan/50"
          />
        </label>
        <input
          type="text"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="Region / geography (optional)"
          className="w-full rounded-xl border border-border bg-background/80 px-3 py-2.5 text-[13px] min-h-[44px] focus:outline-none focus:border-cyan/50"
        />
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="What decision or question should this brief answer? (optional)"
          className="w-full rounded-xl border border-border bg-background/80 px-3 py-2.5 text-[13px] min-h-[44px] focus:outline-none focus:border-cyan/50"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email for delivery only (optional — not required to browse the desk)"
          className="w-full rounded-xl border border-border bg-background/80 px-3 py-2.5 text-[13px] min-h-[44px] focus:outline-none focus:border-cyan/50"
          autoComplete="email"
        />
      </div>

      <label className="flex gap-2.5 items-start text-[12px] text-muted-foreground leading-snug cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 rounded border-border"
        />
        <span>
          <Lock className="w-3.5 h-3.5 text-cyan inline mr-1 align-[-2px]" aria-hidden />
          I understand: no account required; optional email is only for this delivery; card/crypto
          details are handled by the payment processor (not stored on Elenchos); reports are
          research not legal/investment advice; human review before published delivery.
        </span>
      </label>

      {err && <p className="text-[12px] text-rose-signal font-mono">{err}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3 rounded-full bg-cyan/20 border border-cyan/50 text-cyan font-display font-semibold text-[14px] hover:bg-cyan/30 touch-manipulation disabled:opacity-50"
      >
        {busy ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Sending…
          </>
        ) : (
          <>
            Request commission · {tierMeta.price}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
      <p className="text-[11px] font-mono text-muted-foreground">
        Checkout link is confirmed after scope review. Crypto and cards accepted via processor when
        payment step is enabled for your order.
      </p>
    </form>
  );
}

function StylePick({
  active,
  title,
  desc,
  onClick,
}: {
  active: boolean;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-xl border px-3 py-3 min-h-[44px] touch-manipulation transition-colors ${
        active ? "border-cyan/50 bg-cyan/12" : "border-border bg-card/40 hover:border-cyan/30"
      }`}
    >
      <p className="text-[13px] font-display font-semibold text-foreground">{title}</p>
      <p className="text-[11.5px] text-muted-foreground mt-1 leading-snug">{desc}</p>
    </button>
  );
}
