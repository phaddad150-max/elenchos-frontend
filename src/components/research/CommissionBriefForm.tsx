import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, ExternalLink, Loader2, Lock } from "lucide-react";
import {
  CHECKOUT_PACKAGE_ORDER,
  DESK_PACKAGES,
  isDeskPackageId,
  topicViolatesSafetyPolicy,
  type DeskPackageId,
} from "@/lib/research-desk/packages";

/**
 * On-demand commission → Stripe Checkout → unique report URL + PDF.
 * Do not change package ids, prices, or checkout payload without backend review.
 */
export function CommissionBriefForm() {
  const [pkg, setPkg] = useState<DeskPackageId>("deep-no-x");
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("pkg") ?? params.get("package");
    if (raw && isDeskPackageId(raw)) setPkg(raw);
    const preTopic = params.get("topic");
    if (preTopic?.trim()) setTopic(preTopic.trim().slice(0, 800));
  }, []);

  const meta = DESK_PACKAGES[pkg];
  const needQuestions = pkg === "topic-analysis";
  const packages = useMemo(
    () => CHECKOUT_PACKAGE_ORDER.map((id) => DESK_PACKAGES[id]),
    [],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!topic.trim() || topic.trim().length < 8) {
      setErr("Describe your topic in at least a short sentence.");
      return;
    }
    const blocked = topicViolatesSafetyPolicy(topic);
    if (blocked) {
      setErr(blocked);
      return;
    }
    if (needQuestions && questions.trim()) {
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
      const res = await fetch("/api/research/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg,
          topic: topic.trim(),
          questions: questions.trim(),
          email: email.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout unavailable");
      }
      window.location.href = data.url;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Checkout failed");
      setBusy(false);
    }
  }

  const sampleIsExternal = meta.sampleHref.startsWith("http");

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Package picker — full cards, not bare price tiles */}
      <fieldset>
        <legend className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-2.5">
          1 · Choose package
        </legend>
        <div
          className="space-y-2"
          role="radiogroup"
          aria-label="Research package"
        >
          {packages.map((p) => {
            const selected = pkg === p.id;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setPkg(p.id)}
                className={`w-full text-left rounded-xl border px-3.5 py-3 min-h-[56px] touch-manipulation transition-all ${
                  selected
                    ? "border-cyan/60 bg-cyan/12 ring-1 ring-cyan/30"
                    : "border-border/80 bg-background/40 hover:border-cyan/35"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border grid place-items-center ${
                      selected
                        ? "border-cyan bg-cyan text-background"
                        : "border-border"
                    }`}
                    aria-hidden
                  >
                    {selected ? <Check className="w-3 h-3" strokeWidth={3} /> : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-[14px] font-display font-semibold text-foreground leading-snug break-words">
                        {p.tierLabel}
                      </p>
                      <span className="text-cyan font-mono text-[17px] font-semibold shrink-0">
                        ${p.priceUsd}
                      </span>
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-snug mt-0.5 break-words">
                      {p.blurb}
                    </p>
                    {selected && (
                      <div className="mt-2 pt-2 border-t border-cyan/20 space-y-1">
                        <p className="text-[11.5px] text-foreground/85 leading-snug break-words">
                          <span className="text-muted-foreground">Includes: </span>
                          {p.delivers}
                        </p>
                        <p className="text-[10.5px] font-mono text-cyan/90">
                          {p.deliveryNote}
                        </p>
                        <a
                          href={p.sampleHref}
                          className="inline-flex items-center gap-1 text-[11px] text-cyan hover:underline min-h-[28px]"
                          {...(p.sampleHref.startsWith("http")
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {p.sampleLabel}
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-2">
        <label
          htmlFor="commission-topic"
          className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground"
        >
          2 · Your topic
        </label>
        <textarea
          id="commission-topic"
          required
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={3}
          placeholder="e.g. Public discourse on housing and irregular migration in Spain, 2024–2026"
          className="w-full rounded-xl border border-border bg-background/80 px-3 py-2.5 text-[13px] min-h-[88px] focus:outline-none focus:border-cyan/50"
        />
      </div>

      {needQuestions && (
        <div className="space-y-2">
          <label
            htmlFor="commission-questions"
            className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground"
          >
            3 · Questions (optional, up to 9)
          </label>
          <p className="text-[12px] text-muted-foreground leading-snug">
            One per line. Leave empty for a standard Socratic pack.
          </p>
          <textarea
            id="commission-questions"
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
            rows={4}
            placeholder={"1. …\n2. …\n3. …"}
            className="w-full rounded-xl border border-border bg-background/80 px-3 py-2.5 text-[13px] font-mono min-h-[100px] focus:outline-none focus:border-cyan/50"
          />
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="commission-email"
          className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground"
        >
          {needQuestions ? "4" : "3"} · Email for link (optional)
        </label>
        <input
          id="commission-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="One-time delivery only"
          className="w-full rounded-xl border border-border bg-background/80 px-3 py-2.5 text-[13px] min-h-[44px] focus:outline-none focus:border-cyan/50"
          autoComplete="email"
        />
      </div>

      <label className="flex gap-2.5 items-start text-[12px] text-muted-foreground leading-snug cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 rounded border-border shrink-0"
        />
        <span>
          <Lock className="w-3.5 h-3.5 text-cyan inline mr-1 align-[-2px]" aria-hidden />
          Experimental research tool — not legal, medical, or investment advice. One-time $
          {meta.priceUsd}. Unique link + PDF after pay. Lawful public research only; X terms apply.
          No account. No research profile stored on Elenchos.
        </span>
      </label>

      {err && (
        <p className="text-[12px] text-rose-signal font-mono" role="alert">
          {err}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full inline-flex items-center justify-center gap-2 min-h-[52px] px-5 py-3 rounded-full bg-cyan text-background font-display font-semibold text-[15px] hover:bg-cyan/90 touch-manipulation disabled:opacity-50 shadow-[0_0_28px_-8px_var(--color-cyan-glow)]"
      >
        {busy ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Redirecting to Stripe…
          </>
        ) : (
          <>
            Pay ${meta.priceUsd} · get unique report link
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
