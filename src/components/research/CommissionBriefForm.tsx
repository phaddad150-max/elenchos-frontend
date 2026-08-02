import { useMemo, useState } from "react";
import { ArrowRight, Check, Lock, Loader2 } from "lucide-react";
import { buildContactMailto, ELENCHOS_CONTACT_CTA } from "@/lib/contact";

export type CommissionStyle = "topic-analysis" | "deep-no-x" | "deep-with-x";

const PACKAGES: {
  id: CommissionStyle;
  title: string;
  price: string;
  priceUsd: number;
  blurb: string;
  delivers: string;
}[] = [
  {
    id: "topic-analysis",
    title: "Topic analysis (public discourse)",
    price: "$10",
    priceUsd: 10,
    blurb: "Socratic-style questions + analysis of public discourse around your topic (Topics method).",
    delivers: "Sentiment-style scoring, key themes, citizen vs official/media frames where sample allows.",
  },
  {
    id: "deep-no-x",
    title: "Deep dive · multi-source (no X)",
    price: "$10",
    priceUsd: 10,
    blurb: "Thesis-like structure: open web, official, media, scholarly where free. No X sample.",
    delivers: "Chapters outline, evidence map, claims with confidence/falsifiers when evidence holds.",
  },
  {
    id: "deep-with-x",
    title: "Deep dive · multi-source + X",
    price: "$20",
    priceUsd: 20,
    blurb: "Same deep dive plus a capped public-discourse sample on X for street frames.",
    delivers: "Everything in deep dive + discourse section with sample size and limits.",
  },
];

/**
 * On-demand commission — privacy-first, low fixed prices.
 * Payment processor checkout ships next; v1 captures structured order intent.
 */
export function CommissionBriefForm() {
  const [pkg, setPkg] = useState<CommissionStyle>("topic-analysis");
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const meta = useMemo(() => PACKAGES.find((p) => p.id === pkg)!, [pkg]);
  const needQuestions = pkg === "topic-analysis";

  const body = useMemo(() => {
    return [
      "Elenchos Research Desk — on-demand order",
      `Package: ${meta.title} (${meta.price})`,
      `Topic: ${topic.trim()}`,
      needQuestions && questions.trim()
        ? `Socratic / analysis questions:\n${questions.trim()}`
        : needQuestions
          ? "Questions: (user may refine after confirm)"
          : null,
      email.trim() ? `Delivery email: ${email.trim()}` : "Delivery: unique link (no email)",
      "Disclaimer accepted: research tool as-is; not legal/medical/investment advice; no private data scraping.",
    ]
      .filter(Boolean)
      .join("\n");
  }, [meta, topic, questions, email, needQuestions]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!topic.trim() || topic.trim().length < 8) {
      setErr("Describe your topic in at least a short sentence.");
      return;
    }
    if (needQuestions && questions.trim().length > 0) {
      const lines = questions
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length > 9) {
        setErr("Please keep to at most 9 questions (one per line).");
        return;
      }
    }
    if (!consent) {
      setErr("Please confirm the notice below.");
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
            source: "research-commission",
            email: delivery,
            message: body,
            name: "",
            website: "",
          }),
        });
        if (!res.ok) {
          window.location.href = buildContactMailto({
            message: body,
            source: "research-commission",
            fromEmail: delivery,
          });
        }
      } else {
        window.location.href = buildContactMailto({
          message: body,
          source: "research-commission",
        });
      }
      setDone(true);
    } catch {
      window.location.href = buildContactMailto({
        message: body,
        source: "research-commission",
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
          <Check className="w-4 h-4" /> Order request sent
        </p>
        <p className="text-[13px] text-foreground/90 leading-relaxed">
          Next: we confirm scope and send a <strong>one-time payment link</strong> ({meta.price}).
          After payment you receive a <strong>unique report link</strong> and PDF when ready. No
          account. No card numbers stored on Elenchos.
        </p>
        <p className="text-[12px] font-mono text-muted-foreground">{ELENCHOS_CONTACT_CTA}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-2">
          1 · Package
        </p>
        <div className="space-y-2">
          {PACKAGES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPkg(p.id)}
              className={`w-full text-left rounded-xl border px-3.5 py-3 min-h-[44px] touch-manipulation transition-colors ${
                pkg === p.id
                  ? "border-cyan/50 bg-cyan/12"
                  : "border-border bg-card/40 hover:border-cyan/30"
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[13px] sm:text-[14px] font-display font-semibold text-foreground">
                  {p.title}
                </p>
                <span className="text-cyan font-mono text-[14px] font-semibold shrink-0">
                  {p.price}
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-1 leading-snug">{p.blurb}</p>
              <p className="text-[11px] text-foreground/80 mt-1.5 leading-snug">
                Delivers: {p.delivers}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
          2 · Topic
        </p>
        <textarea
          required
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={3}
          placeholder="e.g. Public discourse on housing and migration in Spain, 2024–2026"
          className="w-full rounded-xl border border-border bg-background/80 px-3 py-2.5 text-[13px] min-h-[88px] focus:outline-none focus:border-cyan/50"
        />
      </div>

      {needQuestions && (
        <div className="space-y-2">
          <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
            3 · Your questions (up to 9, optional)
          </p>
          <p className="text-[12px] text-muted-foreground leading-snug">
            One question per line. If empty, we apply a standard Socratic pack for public discourse
            analysis.
          </p>
          <textarea
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
            rows={6}
            placeholder={"1. …\n2. …\n3. …"}
            className="w-full rounded-xl border border-border bg-background/80 px-3 py-2.5 text-[13px] font-mono min-h-[120px] focus:outline-none focus:border-cyan/50"
          />
        </div>
      )}

      <div className="space-y-2">
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
          {needQuestions ? "4" : "3"} · Delivery email (optional)
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Only for this order — not a newsletter"
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
          I understand this is a research tool provided as-is: not legal, medical, or investment
          advice; not for covert surveillance; findings depend on available public sources;
          payment is one-time ({meta.price}); unique link + PDF when ready; no account required.
        </span>
      </label>

      {err && <p className="text-[12px] text-rose-signal font-mono">{err}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3 rounded-full bg-cyan/20 border border-cyan/50 text-cyan font-display font-semibold text-[14px] hover:bg-cyan/30 touch-manipulation disabled:opacity-50"
      >
        {busy ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Sending…
          </>
        ) : (
          <>
            Request order · {meta.price}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
