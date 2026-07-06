import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Heart,
  Sparkles,
  CreditCard,
  AlertTriangle,
  Flame,
  Plus,
  ArrowLeft,
  Clock,
  ShieldCheck,
  Database,
  Cpu,
  CheckCircle2,
  Mail,
  Send,
} from "lucide-react";
import {
  SPONSOR_TOPICS,
  SPONSOR_COMING_SOON_TOPICS,
  SPONSOR_PENDING_STORAGE_KEY,
  SPONSOR_ENABLED,
  SPONSOR_CUSTOM_QUESTIONS,
} from "@/lib/sponsor-topics";
import { loadDashboardOverview, type IntelFeedItem } from "@/lib/dashboard-data";

// External Supabase project (anon key is safe to expose for invoking
// public Edge Functions). The trusted write into topic_sponsorships happens
// server-side inside the stripe-webhook Edge Function using the service role.
const SUPABASE_URL = "https://jacbalsongvqvaqlfsbx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphY2JhbHNvbmd2cXZhcWxmc2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NDg1MjgsImV4cCI6MjA5NTEyNDUyOH0.NZI55Xy8KpqQHdPfQohojnnc-GDef0L8dKQ2oOYI1EU";

type Mode = "live" | "custom" | "contact";
type Step = "intro" | "form";

const TIERS_BY_MODE: Record<Exclude<Mode, "contact">, readonly number[]> = {
  live: [10, 25, 50, 75, 100],
  custom: [30, 60, 90, 120, 150],
};



export function SponsorModal({
  open,
  onClose,
  initialTopic,
}: {
  open: boolean;
  onClose: () => void;
  initialTopic?: string;
}) {
  const presetIsLive =
    initialTopic && (SPONSOR_TOPICS as readonly string[]).includes(initialTopic);
  const presetIsComing =
    initialTopic &&
    (SPONSOR_COMING_SOON_TOPICS as readonly string[]).includes(initialTopic);

  const [step, setStep] = useState<Step>("intro");
  const [mode, setMode] = useState<Mode>("live");
  const [topic, setTopic] = useState<string>(
    presetIsLive || presetIsComing ? (initialTopic as string) : SPONSOR_TOPICS[0],
  );
  const [customTopic, setCustomTopic] = useState("");
  const [customWhy, setCustomWhy] = useState("");
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [tier, setTier] = useState<number>(50);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trending, setTrending] = useState<IntelFeedItem[]>([]);

  useEffect(() => {
    if (!open) return;
    loadDashboardOverview().then((o) => {
      const seen = new Set<string>();
      const out: IntelFeedItem[] = [];
      (o?.intel_feed ?? []).forEach((it) => {
        if (!it?.topic || seen.has(it.topic)) return;
        seen.add(it.topic);
        out.push(it);
      });
      setTrending(out.slice(0, 5));
    });
  }, [open]);

  useEffect(() => {
    if (!open || !initialTopic) return;
    if ((SPONSOR_TOPICS as readonly string[]).includes(initialTopic)) {
      setTopic(initialTopic);
    }
  }, [open, initialTopic]);

  const amount = tier;
  const selectedTopic = mode === "custom" ? customTopic.trim() : topic;
  const topicValid =
    mode === "custom"
      ? customTopic.trim().length >= 3
      : mode === "live"
        ? Boolean(selectedTopic)
        : true;
  const contactValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && message.trim().length >= 3;

  const canSubmit =
    !submitting &&
    (mode === "contact" ? contactValid : topicValid && amount > 0);

  function reset() {
    setStep("intro");
    setMode("live");
    setTopic(SPONSOR_TOPICS[0]);
    setCustomTopic("");
    setCustomWhy("");
    setCustomAnswers({});
    setTier(50);
    setName("");
    setEmail("");
    setMessage("");
    setError(null);
    setSubmitting(false);
    setContactSent(false);
  }

  function handleClose() {
    if (submitting) return;
    onClose();
    setTimeout(reset, 250);
  }

  function selectMode(next: Mode) {
    setMode(next);
    if (next === "live") setTier(50);
    if (next === "custom") setTier(60);
    setStep("form");
  }

  function buildReason(): string {
    if (mode !== "custom") return message.trim();
    const qa = SPONSOR_CUSTOM_QUESTIONS.map((q) => {
      const v = (customAnswers[q.id] || "").trim();
      return v ? `${q.label}\n${v}` : null;
    })
      .filter(Boolean)
      .join("\n\n");
    const parts = [
      "[Suggested topic]",
      customWhy.trim() ? `Why this matters: ${customWhy.trim()}` : null,
      qa || null,
      message.trim() ? `Note: ${message.trim()}` : null,
    ].filter(Boolean);
    return parts.join("\n\n");
  }

  async function handleSubmit() {
    if (!canSubmit) return;

    if (mode === "contact") {
      setError(null);
      setSubmitting(true);
      try {
        const res = await fetch("/api/public/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            message: message.trim(),
            source: "sponsor-modal:custom-dashboard",
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setContactSent(true);
      } catch (e) {
        console.error("Contact send failed", e);
        setError("Unable to send message. Please try again.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const isCustom = mode === "custom";
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/create-stripe-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            topic: selectedTopic,
            topic_status: isCustom ? "suggested" : "live",
            amount_eur: amount,
            sponsor_name: name.trim() || null,
            sponsor_email: email.trim() || null,
            reason: buildReason() || null,
            success_url: "https://elenchos.live/topics?success=true",
            cancel_url:
              typeof window !== "undefined"
                ? `${window.location.origin}/?sponsor=cancelled`
                : undefined,
          }),
        },
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json()) as { url?: string; error?: string };
      if (data?.url) {
        try {
          if (selectedTopic) {
            window.localStorage.setItem(SPONSOR_PENDING_STORAGE_KEY, selectedTopic);
          }
        } catch {}
        window.location.href = data.url;
        return;
      }
      throw new Error(data?.error || "No checkout URL returned");
    } catch (e: any) {
      console.error("Sponsorship checkout failed", e);
      setError("Unable to start payment. Please try again.");
      setSubmitting(false);
    }
  }

  const trendingFiltered = useMemo(
    () =>
      trending.filter(
        (t) => t.topic && (SPONSOR_TOPICS as readonly string[]).includes(t.topic),
      ),
    [trending],
  );

  const activeTiers =
    mode === "custom" ? TIERS_BY_MODE.custom : TIERS_BY_MODE.live;

  if (!SPONSOR_ENABLED) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-md grid place-items-center p-4"
        >
          <motion.div
            initial={{ scale: 0.96, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong rounded-3xl max-w-xl w-full p-6 relative max-h-[92vh] overflow-y-auto"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* ─────────── STEP 1 · INTRO / HOW IT WORKS ─────────── */}
            {step === "intro" && (
              <div>
                <div className="mb-5 pr-10">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-mono uppercase tracking-[0.2em] border border-cyan/50 bg-cyan/10 text-cyan mb-2">
                    <Heart className="w-3 h-3" /> Sponsor a Topic
                  </div>
                  <h2 className="text-2xl font-display font-semibold leading-tight">
                    How sponsorship works on Elenchos
                  </h2>
                  <p className="text-[13px] text-muted-foreground mt-2 leading-relaxed">
                    Elenchos is an independent citizen-sentiment dashboard. Sponsorship
                    funds the data layer that powers the analysis. It does not buy
                    influence over the findings.
                  </p>
                </div>

                {/* Three clickable paths */}
                <div className="grid gap-2.5 mb-5">
                  <button
                    type="button"
                    onClick={() => selectMode("live")}
                    className="group text-left rounded-xl border border-cyan/30 bg-cyan/5 p-4 transition-all hover:border-cyan/70 hover:bg-cyan/10 hover:-translate-y-0.5 hover:shadow-[0_0_24px_-6px_hsl(var(--cyan)/0.5)] cursor-pointer"
                  >
                    <div className="inline-flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-[0.18em] text-cyan mb-1.5">
                      <Sparkles className="w-3 h-3" /> Live topic
                    </div>
                    <div className="text-[14px] font-display font-semibold mb-1 group-hover:text-cyan transition-colors">
                      Boost an existing topic
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                      Increases sample size, regional coverage and refresh frequency
                      on a topic already in the pipeline. Brackets €10–€100.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectMode("custom")}
                    className="group text-left rounded-xl border border-amber-signal/30 bg-amber-signal/5 p-4 transition-all hover:border-amber-signal/70 hover:bg-amber-signal/10 hover:-translate-y-0.5 hover:shadow-[0_0_24px_-6px_hsl(var(--amber-signal)/0.5)] cursor-pointer"
                  >
                    <div className="inline-flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-[0.18em] text-amber-signal mb-1.5">
                      <Plus className="w-3 h-3" /> Suggest your own
                    </div>
                    <div className="text-[14px] font-display font-semibold mb-1 group-hover:text-amber-signal transition-colors">
                      Bring a new topic online
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                      Define the topic and the 9 questions. Activated within 24h of
                      successful payment. Brackets €30–€150.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectMode("contact")}
                    className="group text-left rounded-xl border border-violet-400/30 bg-violet-400/5 p-4 transition-all hover:border-violet-400/70 hover:bg-violet-400/10 hover:-translate-y-0.5 hover:shadow-[0_0_24px_-6px_rgb(167_139_250/0.5)] cursor-pointer"
                  >
                    <div className="inline-flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-[0.18em] text-violet-300 mb-1.5">
                      <Mail className="w-3 h-3" /> Customize your dashboard
                    </div>
                    <div className="text-[14px] font-display font-semibold mb-1 group-hover:text-violet-300 transition-colors">
                      Talk to us directly
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                      Need a bespoke dashboard, private feed or enterprise setup?
                      Send us a message and we will reply within 24h.
                    </p>
                  </button>
                </div>

                {/* Where the money goes */}
                <div className="rounded-xl border border-border bg-background/40 p-4">
                  <div className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-3">
                    Where your sponsorship goes
                  </div>
                  <ul className="space-y-2.5 text-[12.5px]">
                    <li className="flex gap-2.5">
                      <Database className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
                      <span>
                        <span className="font-display font-semibold">X API data pulls</span>
                        <span className="text-muted-foreground"> — filtered recent posts across regions and languages.</span>
                      </span>
                    </li>
                    <li className="flex gap-2.5">
                      <Cpu className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
                      <span>
                        <span className="font-display font-semibold">Grok (xAI) analysis</span>
                        <span className="text-muted-foreground"> — 9 fixed Socratic questions per topic, strict Elenchos prompt.</span>
                      </span>
                    </li>
                    <li className="flex gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
                      <span>
                        <span className="font-display font-semibold">Infrastructure & security</span>
                        <span className="text-muted-foreground"> — storage, scheduled refresh jobs, monitoring.</span>
                      </span>
                    </li>
                  </ul>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-[0.18em] text-amber-signal">
                    <Clock className="w-3 h-3" /> Activation within 24 hours of successful payment
                  </div>
                </div>
              </div>
            )}

            {/* ─────────── STEP 2 · FORM ─────────── */}
            {step === "form" && (
              <div>
                <div className="mb-5 pr-10">
                  <button
                    type="button"
                    onClick={() => setStep("intro")}
                    className="inline-flex items-center gap-1 text-[10.5px] font-mono uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground mb-2"
                  >
                    <ArrowLeft className="w-3 h-3" /> How it works
                  </button>
                  <h2 className="text-2xl font-display font-semibold leading-tight">
                    {mode === "live" && "Boost an existing topic"}
                    {mode === "custom" && "Suggest your own topic"}
                    {mode === "contact" && "Customize your dashboard"}
                  </h2>
                </div>

                {/* LIVE TOPIC */}
                {mode === "live" && (
                  <section className="space-y-2 mb-4">
                    <label className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                      1 · Select Topic
                    </label>
                    {trendingFiltered.length > 0 && (
                      <div className="mb-2">
                        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-signal/80 mb-1.5 inline-flex items-center gap-1">
                          <Flame className="w-3 h-3" /> Trending in citizen signals
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {trendingFiltered.map((t) => (
                            <button
                              key={t.topic}
                              type="button"
                              onClick={() => setTopic(t.topic!)}
                              className={`px-2 py-1 rounded-full border text-[11px] transition-colors ${
                                topic === t.topic
                                  ? "bg-cyan/15 border-cyan/60 text-cyan"
                                  : "border-border hover:border-cyan/40 text-foreground/80"
                              }`}
                            >
                              {t.topic}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg bg-secondary/40 border border-border text-sm focus:outline-none focus:border-cyan/60 appearance-none bg-no-repeat bg-right pr-9"
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2300d5ff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
                        backgroundPosition: "right 10px center",
                      }}
                    >
                      {SPONSOR_TOPICS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </section>
                )}

                {/* SUGGEST YOUR OWN */}
                {mode === "custom" && (
                  <section className="space-y-3 mb-4">
                    <label className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                      1 · Define your topic
                    </label>
                    <div className="rounded-lg border border-amber-signal/40 bg-amber-signal/5 p-2.5 text-[11.5px] text-amber-signal leading-relaxed inline-flex items-start gap-1.5">
                      <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>
                        Custom topics are activated within <strong>24 hours</strong> of
                        successful payment. Your inputs below feed the backend job
                        that configures the Grok analysis.
                      </span>
                    </div>
                    <input
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="Topic name (e.g. EU energy security & citizen unrest)"
                      maxLength={140}
                      className="w-full px-3 py-2 rounded-lg bg-secondary/40 border border-border text-sm focus:outline-none focus:border-cyan/60"
                    />
                    <div>
                      <div className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
                        The 9 questions for your topic
                      </div>
                      <div className="space-y-2">
                        {SPONSOR_CUSTOM_QUESTIONS.map((q) => (
                          <div key={q.id} className="space-y-1">
                            <label className="text-[11px] text-foreground/80 font-display">
                              {q.label}
                            </label>
                            <textarea
                              value={customAnswers[q.id] || ""}
                              onChange={(e) =>
                                setCustomAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: e.target.value,
                                }))
                              }
                              placeholder={q.placeholder}
                              rows={2}
                              maxLength={400}
                              className="w-full px-3 py-2 rounded-lg bg-secondary/40 border border-border text-[12.5px] resize-none focus:outline-none focus:border-cyan/60"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-foreground/80 font-display inline-flex items-center gap-1.5">
                        Why this matters
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.16em]">
                          optional
                        </span>
                      </label>
                      <textarea
                        value={customWhy}
                        onChange={(e) => setCustomWhy(e.target.value)}
                        placeholder="Context, urgency, who benefits from this analysis…"
                        maxLength={500}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg bg-secondary/40 border border-border text-[12.5px] resize-none focus:outline-none focus:border-cyan/60"
                      />
                    </div>
                  </section>
                )}

                {/* PAYMENT MODES — Amount + sponsor info */}
                {mode !== "contact" && (
                  <>
                    <section className="space-y-2 mb-4">
                      <label className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                        2 · Amount (EUR)
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {activeTiers.map((a) => {
                          const active = tier === a;
                          return (
                            <button
                              key={a}
                              type="button"
                              onClick={() => setTier(a)}
                              className={`py-2.5 rounded-lg border text-sm font-display font-semibold transition-all hover:-translate-y-0.5 ${
                                active
                                  ? "bg-cyan/10 border-cyan/60 text-cyan"
                                  : "border-border hover:border-cyan/40 text-foreground/85"
                              }`}
                            >
                              €{a}
                            </button>
                          );
                        })}
                      </div>
                    </section>

                    <section className="space-y-2 mb-5">
                      <label className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                        3 · Optional · About you
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Name (optional)"
                          maxLength={80}
                          className="px-3 py-2 rounded-lg bg-secondary/40 border border-border text-sm focus:outline-none focus:border-cyan/60"
                        />
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email (receipt & activation)"
                          type="email"
                          maxLength={120}
                          className="px-3 py-2 rounded-lg bg-secondary/40 border border-border text-sm focus:outline-none focus:border-cyan/60"
                        />
                      </div>
                      {mode === "live" && (
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Why are you sponsoring this? (optional)"
                          maxLength={280}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg bg-secondary/40 border border-border text-sm resize-none focus:outline-none focus:border-cyan/60"
                        />
                      )}
                    </section>
                  </>
                )}

                {/* CONTACT MODE */}
                {mode === "contact" && contactSent && (
                  <section className="mb-5 px-4 py-6 rounded-xl border border-cyan/30 bg-cyan/5 text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-cyan/15 border border-cyan/30">
                      <CheckCircle2 className="w-5 h-5 text-cyan" />
                    </div>
                    <p className="text-sm font-display font-semibold">
                      Message sent. We will reply within 24 hours.
                    </p>
                  </section>
                )}
                {mode === "contact" && !contactSent && (
                  <section className="space-y-2 mb-5">
                    <p className="text-[12.5px] text-muted-foreground leading-relaxed mb-2">
                      Tell us what you would like to track and how you would use a
                      custom dashboard. We reply within 24 hours.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Name (optional)"
                        maxLength={80}
                        className="px-3 py-2 rounded-lg bg-secondary/40 border border-border text-sm focus:outline-none focus:border-violet-400/60"
                      />
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email *"
                        type="email"
                        maxLength={120}
                        className="px-3 py-2 rounded-lg bg-secondary/40 border border-border text-sm focus:outline-none focus:border-violet-400/60"
                      />
                    </div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="What would you like your dashboard to track? Audiences, regions, decisions it should inform…"
                      maxLength={1000}
                      rows={5}
                      className="w-full px-3 py-2 rounded-lg bg-secondary/40 border border-border text-sm resize-none focus:outline-none focus:border-violet-400/60"
                    />
                  </section>
                )}

                {error && (
                  <div className="mb-3 flex items-start gap-2 px-3 py-2 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-[12px]">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {!(mode === "contact" && contactSent) && (
                  <button
                    type="button"
                    disabled={!canSubmit}
                    onClick={handleSubmit}
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-display font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${
                      mode === "contact"
                        ? "bg-violet-400 text-background hover:bg-violet-400/90"
                        : "bg-cyan text-background hover:bg-cyan/90"
                    }`}
                  >
                    {mode === "contact" ? (
                      <>
                        <Send className="w-4 h-4" />
                        {submitting ? "Sending…" : "Send message"}
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        {submitting
                          ? "Redirecting to Stripe…"
                          : `Sponsor Now · €${amount || 0}`}
                      </>
                    )}
                  </button>
                )}
                {mode !== "contact" && (
                  <p className="text-[10.5px] text-muted-foreground font-mono text-center mt-3 uppercase tracking-wider inline-flex items-center justify-center gap-1.5 w-full">
                    <CheckCircle2 className="w-3 h-3 text-cyan" />
                    Secure Stripe checkout · Activation within 24h of payment
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
