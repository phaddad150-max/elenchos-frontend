import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import {
  CHECKOUT_PACKAGE_ORDER,
  DESK_PACKAGES,
  isDeskPackageId,
  topicViolatesSafetyPolicy,
  type DeskPackageId,
} from "@/lib/research-desk/packages";

type CommissionBriefFormProps = {
  onPackageChange?: (id: DeskPackageId) => void;
};

/**
 * On-demand commission → Stripe Checkout → unique report URL + PDF.
 * Optional email goes to Stripe/mail provider for one-time delivery only.
 * Commissioned data → research_desk_reports only (never live Topics tables).
 */
export function CommissionBriefForm({ onPackageChange }: CommissionBriefFormProps) {
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

  useEffect(() => {
    onPackageChange?.(pkg);
  }, [pkg, onPackageChange]);

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

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1">
          1 · Package
        </p>
        <p className="text-[11.5px] text-muted-foreground mb-2 leading-snug">
          Full details for each option are on the left — pick one to continue.
        </p>
        <div className="space-y-1.5" role="radiogroup" aria-label="Research package">
          {packages.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={pkg === p.id}
              onClick={() => setPkg(p.id)}
              className={`w-full text-left rounded-xl border px-3 py-2.5 min-h-[44px] touch-manipulation transition-all ${
                pkg === p.id
                  ? "border-cyan/60 bg-cyan/15 shadow-[0_0_24px_-12px_var(--color-cyan-glow)]"
                  : "border-border bg-card/50 hover:border-cyan/35"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-cyan/90">
                    {p.tierLabel}
                  </p>
                  <p className="text-[13px] font-display font-semibold text-foreground leading-snug">
                    {p.title}
                  </p>
                </div>
                <span className="text-cyan font-mono text-[15px] font-semibold shrink-0">
                  ${p.priceUsd}
                </span>
              </div>
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
          placeholder="e.g. Public discourse on housing and irregular migration in Spain, 2024–2026"
          className="w-full rounded-xl border border-border bg-background/80 px-3 py-2.5 text-[13px] min-h-[88px] focus:outline-none focus:border-cyan/50"
        />
      </div>

      {needQuestions && (
        <div className="space-y-2">
          <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
            3 · Your questions (up to 9, optional)
          </p>
          <p className="text-[12px] text-muted-foreground leading-snug">
            One per line. If empty, a standard Socratic pack is applied for discourse analysis.
          </p>
          <textarea
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
            rows={5}
            placeholder={"1. …\n2. …\n3. …"}
            className="w-full rounded-xl border border-border bg-background/80 px-3 py-2.5 text-[13px] font-mono min-h-[110px] focus:outline-none focus:border-cyan/50"
          />
        </div>
      )}

      <div className="space-y-2">
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
          {needQuestions ? "4" : "3"} · Email for link (optional)
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="One-time delivery only — not a mailing list"
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
          Research tool as-is — not legal/medical/investment advice. One-time ${meta.priceUsd}.
          Unique link + PDF after pay (typically minutes, automated). Lawful public research only;
          no illegal use and no violation of X terms or community rules. No account. No personal
          research profile stored on Elenchos.
        </span>
      </label>

      {err && <p className="text-[12px] text-rose-signal font-mono">{err}</p>}

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
