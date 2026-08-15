import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  ExternalLink,
  Loader2,
  Lock,
  MessageSquareQuote,
  FileStack,
  Radio,
} from "lucide-react";
import { ContactEmailMe } from "@/components/ContactEmailMe";
import {
  DESK_PACKAGES,
  isDeskPackageId,
  topicViolatesSafetyPolicy,
  type DeskPackageId,
} from "@/lib/research-desk/packages";

const ENTERPRISE_DEFAULT_MESSAGE =
  "Hi — I'm interested in Enterprise for Elenchos: personalized dashboards, custom topics, and team research. Here's what I need:\n\n";

/** Display order on commission page (prices unchanged). */
const PACKAGE_DISPLAY_ORDER: DeskPackageId[] = [
  "topic-analysis",
  "deep-no-x",
  "deep-with-x",
];

const PACKAGE_ICONS: Record<DeskPackageId, typeof Radio> = {
  "topic-analysis": MessageSquareQuote,
  "deep-no-x": FileStack,
  "deep-with-x": Radio,
};

/**
 * Commission → Stripe Checkout → unique report URL + PDF.
 * Package ids/prices/checkout payload shape must stay compatible with backend.
 */
export function CommissionBriefForm() {
  const [pkg, setPkg] = useState<DeskPackageId | null>(null);
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState("");
  // Deep-dive brief fields (serialized into topic/questions for existing API)
  const [researchQuestion, setResearchQuestion] = useState("");
  const [scope, setScope] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [angles, setAngles] = useState("");
  const [mustCover, setMustCover] = useState("");
  const [exclude, setExclude] = useState("");
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
    if (preTopic?.trim()) {
      const t = preTopic.trim().slice(0, 800);
      setTopic(t);
      setResearchQuestion(t);
    }
  }, []);

  // Scroll briefing into view after package selection (form mounts next paint)
  useEffect(() => {
    if (!pkg || typeof document === "undefined") return;
    const t = window.setTimeout(() => {
      document
        .getElementById("commission-brief")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
    return () => window.clearTimeout(t);
  }, [pkg]);

  const packages = useMemo(
    () => PACKAGE_DISPLAY_ORDER.map((id) => DESK_PACKAGES[id]),
    [],
  );
  const meta = pkg ? DESK_PACKAGES[pkg] : null;
  const isTopicAnalysis = pkg === "topic-analysis";
  const isDeep = pkg === "deep-no-x" || pkg === "deep-with-x";

  function buildDeepPayload(): { topic: string; questions: string } {
    const rq = researchQuestion.trim();
    const parts: string[] = [];
    if (scope.trim()) parts.push(`Scope / geography: ${scope.trim()}`);
    if (timeframe.trim()) parts.push(`Timeframe: ${timeframe.trim()}`);
    if (mustCover.trim()) parts.push(`Must cover:\n${mustCover.trim()}`);
    if (angles.trim()) parts.push(`Research angles / sub-questions:\n${angles.trim()}`);
    if (exclude.trim()) parts.push(`Out of scope / exclude:\n${exclude.trim()}`);
    return {
      topic: rq,
      questions: parts.join("\n\n"),
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!pkg || !meta) {
      setErr("Select a package first.");
      return;
    }

    let topicOut = "";
    let questionsOut = "";

    if (isTopicAnalysis) {
      topicOut = topic.trim();
      questionsOut = questions.trim();
      if (!topicOut || topicOut.length < 8) {
        setErr("Describe your topic in at least a short sentence.");
        return;
      }
      if (questionsOut) {
        const lines = questionsOut
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        if (lines.length > 9) {
          setErr("Please keep to at most 9 questions (one per line).");
          return;
        }
      }
    } else if (isDeep) {
      const built = buildDeepPayload();
      topicOut = built.topic;
      questionsOut = built.questions;
      if (!topicOut || topicOut.length < 8) {
        setErr("State a clear research question (at least a short sentence).");
        return;
      }
      if (!scope.trim() || scope.trim().length < 4) {
        setErr("Add scope (region, actors, or domain) so the deep dive stays grounded.");
        return;
      }
    }

    const blocked = topicViolatesSafetyPolicy(topicOut);
    if (blocked) {
      setErr(blocked);
      return;
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
          topic: topicOut,
          questions: questionsOut,
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
    <div className="space-y-6 sm:space-y-7 min-w-0">
      {/* Package cards — price + description always visible */}
      <div>
        <h2 className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-3 px-0.5">
          Choose a package
        </h2>
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3"
          role="radiogroup"
          aria-label="Research package"
        >
          {packages.map((p) => {
            const selected = pkg === p.id;
            const Icon = PACKAGE_ICONS[p.id];
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  setPkg(p.id);
                  setErr(null);
                }}
                className={`rd-card group relative flex flex-col h-full min-h-[220px] text-left rounded-2xl border p-4 sm:p-5 transition-all touch-manipulation overflow-hidden ${
                  selected
                    ? "border-cyan/60 bg-cyan/10 ring-1 ring-cyan/35 shadow-[0_0_32px_-14px_var(--cyan-glow)]"
                    : "border-border/80 bg-card/55 hover:border-cyan/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span
                    className={`w-10 h-10 rounded-xl border grid place-items-center ${
                      selected
                        ? "border-cyan/50 bg-cyan/15 text-cyan"
                        : "border-border bg-background/50 text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" aria-hidden />
                  </span>
                  <span
                    className={`text-[1.35rem] font-display font-semibold tabular-nums ${
                      selected ? "text-cyan" : "text-foreground"
                    }`}
                  >
                    ${p.priceUsd}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[14px] sm:text-[15px] font-display font-semibold text-foreground leading-snug break-words">
                    {p.tierLabel}
                  </p>
                  {selected && (
                    <span className="shrink-0 w-5 h-5 rounded-full bg-cyan text-background grid place-items-center">
                      <Check className="w-3 h-3" strokeWidth={3} aria-hidden />
                    </span>
                  )}
                </div>
                <p className="text-[12.5px] text-muted-foreground leading-relaxed break-words flex-1">
                  {p.blurb}
                </p>
                <p className="text-[11.5px] text-foreground/80 leading-snug mt-2.5 break-words border-t border-border/60 pt-2.5">
                  <span className="text-muted-foreground">Delivers: </span>
                  {p.delivers}
                </p>
                <p className="text-[10.5px] font-mono text-cyan/90 mt-1.5">{p.deliveryNote}</p>
                <a
                  href={p.sampleHref}
                  className="inline-flex items-center gap-1 text-[11px] text-cyan hover:underline min-h-[32px] mt-1"
                  {...(p.sampleHref.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  onClick={(e) => e.stopPropagation()}
                >
                  {p.sampleLabel}
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </button>
            );
          })}

          {/* Enterprise card — same grid structure, email path */}
          <div className="rd-card relative flex flex-col h-full min-h-[220px] rounded-2xl border border-amber-signal/35 bg-amber-signal/[0.06] p-4 sm:p-5 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-3">
              <span className="w-10 h-10 rounded-xl border border-amber-signal/40 bg-amber-signal/10 text-amber-signal grid place-items-center">
                <Building2 className="w-5 h-5" aria-hidden />
              </span>
              <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-amber-signal">
                Contact
              </span>
            </div>
            <p className="text-[14px] sm:text-[15px] font-display font-semibold text-foreground leading-snug">
              Enterprise
            </p>
            <p className="text-[12.5px] text-muted-foreground leading-relaxed mt-1 flex-1 break-words">
              Custom dashboards, ongoing research, and team delivery — not fixed $10/$20 checkout.
            </p>
            <p className="text-[11.5px] text-foreground/80 leading-snug mt-2.5 border-t border-amber-signal/20 pt-2.5 break-words">
              Email with scope. No self-serve card form on this path.
            </p>
            <ContactEmailMe
              source="research-enterprise-package"
              variant="button"
              defaultMessage={ENTERPRISE_DEFAULT_MESSAGE}
              dialogTitle="Enterprise inquiry"
              dialogDescription="Describe dashboards, topics, or ongoing research."
              className="mt-3 w-full justify-center border-amber-signal/45 bg-amber-signal/12 text-amber-signal text-[12.5px] font-semibold min-h-[40px]"
            >
              Email me
            </ContactEmailMe>
          </div>
        </div>
      </div>

      {/* Briefing form — opens after package selection */}
      {pkg && meta && (
        <form
          onSubmit={onSubmit}
          id="commission-brief"
          className="rounded-2xl border border-cyan/35 bg-card/60 p-4 sm:p-5 md:p-6 space-y-5 shadow-[0_0_48px_-28px_var(--color-cyan-glow)] scroll-mt-28"
        >
          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border/70 pb-3">
            <div className="min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-cyan">
                Your brief · ${meta.priceUsd}
              </p>
              <h3 className="text-[15px] sm:text-base font-display font-semibold text-foreground mt-0.5 break-words">
                {meta.title}
              </h3>
              <p className="text-[12px] text-muted-foreground mt-1 max-w-2xl break-words">
                {isTopicAnalysis
                  ? "Same public-discourse method as live Topics. Add up to 9 Socratic questions or leave blank for a standard pack."
                  : "Thesis-style multi-source brief. The more precise your scope and angles, the stronger the report."}
              </p>
            </div>
          </div>

          {isTopicAnalysis && (
            <>
              <div className="space-y-2">
                <label
                  htmlFor="commission-topic"
                  className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Topic *
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
              <div className="space-y-2">
                <label
                  htmlFor="commission-questions"
                  className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Questions (optional, up to 9)
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
            </>
          )}

          {isDeep && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="deep-research-q"
                  className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Research question *
                </label>
                <p className="text-[12px] text-muted-foreground leading-snug">
                  The central question the brief should answer (thesis-style).
                </p>
                <textarea
                  id="deep-research-q"
                  required
                  value={researchQuestion}
                  onChange={(e) => setResearchQuestion(e.target.value)}
                  rows={3}
                  placeholder="e.g. After COVID disruption, which commercial aviation segments lead on safety, connectivity, and AI readiness — and who is lagging?"
                  className="w-full rounded-xl border border-border bg-background/80 px-3 py-2.5 text-[13px] min-h-[88px] focus:outline-none focus:border-cyan/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label
                    htmlFor="deep-scope"
                    className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    Scope · region / actors *
                  </label>
                  <textarea
                    id="deep-scope"
                    required
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    rows={2}
                    placeholder="e.g. Global OEMs + GCC long-haul carriers; exclude military aviation"
                    className="w-full rounded-xl border border-border bg-background/80 px-3 py-2.5 text-[13px] min-h-[72px] focus:outline-none focus:border-cyan/50"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="deep-timeframe"
                    className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    Timeframe
                  </label>
                  <input
                    id="deep-timeframe"
                    type="text"
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    placeholder="e.g. 2020–2026 recovery window"
                    className="w-full rounded-xl border border-border bg-background/80 px-3 py-2.5 text-[13px] min-h-[44px] focus:outline-none focus:border-cyan/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="deep-must"
                  className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Must cover (chapters / evidence)
                </label>
                <p className="text-[12px] text-muted-foreground leading-snug">
                  Sections, sources, or claims you need on the page.
                </p>
                <textarea
                  id="deep-must"
                  value={mustCover}
                  onChange={(e) => setMustCover(e.target.value)}
                  rows={3}
                  placeholder={"Safety public ratings method\nSatcom rollout maps\nPayment innovation (incl. crypto)"}
                  className="w-full rounded-xl border border-border bg-background/80 px-3 py-2.5 text-[13px] min-h-[88px] focus:outline-none focus:border-cyan/50"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="deep-angles"
                  className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Sub-questions / angles
                </label>
                <p className="text-[12px] text-muted-foreground leading-snug">
                  Optional. One per line — helps structure claims and falsifiers.
                </p>
                <textarea
                  id="deep-angles"
                  value={angles}
                  onChange={(e) => setAngles(e.target.value)}
                  rows={3}
                  placeholder={"Who kept capacity discipline post-COVID?\nWhere is Starlink-class satcom fleet-wide vs trial?"}
                  className="w-full rounded-xl border border-border bg-background/80 px-3 py-2.5 text-[13px] min-h-[88px] focus:outline-none focus:border-cyan/50"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="deep-exclude"
                  className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Out of scope
                </label>
                <textarea
                  id="deep-exclude"
                  value={exclude}
                  onChange={(e) => setExclude(e.target.value)}
                  rows={2}
                  placeholder="e.g. Not investment advice; skip military platforms"
                  className="w-full rounded-xl border border-border bg-background/80 px-3 py-2.5 text-[13px] min-h-[64px] focus:outline-none focus:border-cyan/50"
                />
              </div>

              {pkg === "deep-with-x" && (
                <p className="text-[12px] text-cyan/90 rounded-xl border border-cyan/25 bg-cyan/5 px-3 py-2.5 leading-snug">
                  This package adds a capped public X discourse sample on top of the multi-source
                  spine (when API credits allow).
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="commission-email"
              className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground"
            >
              Email for link (optional)
            </label>
            <input
              id="commission-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="One-time delivery only"
              className="w-full max-w-md rounded-xl border border-border bg-background/80 px-3 py-2.5 text-[13px] min-h-[44px] focus:outline-none focus:border-cyan/50"
              autoComplete="email"
            />
          </div>

          <label className="flex gap-2.5 items-start text-[12px] text-muted-foreground leading-snug cursor-pointer max-w-2xl">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 rounded border-border shrink-0"
            />
            <span>
              <Lock className="w-3.5 h-3.5 text-cyan inline mr-1 align-[-2px]" aria-hidden />
              Experimental research tool — not legal, medical, or investment advice. One-time $
              {meta.priceUsd}. Unique link + PDF after pay. Lawful public research only; X terms
              apply when discourse is included. No account. No research profile stored on Elenchos.
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
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[52px] px-6 py-3 rounded-full bg-cyan text-background font-display font-semibold text-[15px] hover:bg-cyan/90 touch-manipulation disabled:opacity-50 shadow-[0_0_28px_-8px_var(--color-cyan-glow)]"
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
      )}

      {!pkg && (
        <p className="text-[13px] text-muted-foreground text-center sm:text-left px-1">
          Select a package above to open the briefing form.
        </p>
      )}
    </div>
  );
}
