import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  ScrollText,
  Globe2,
  LineChart,
  Layers,
  Newspaper,
  Microscope,
  Landmark,
  Users,
  Ear,
  Scale,
  Monitor,
  ArrowRight,
  Quote,
  Radio,
  ChevronDown,
  Github,
  Database,
  Cpu,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Elenchos" },
      {
        name: "description",
        content:
          "Elenchos applies the Socratic method to public discourse on X — measuring the gap between official narratives and what citizens actually say, across topics, leaders, and countries.",
      },
      { property: "og:title", content: "About — Elenchos" },
      {
        property: "og:description",
        content:
          "Public Discourse vs Official Narratives. Live citizen sentiment, narrative divergence, and performance trackers — built for journalists, researchers, policymakers, and engaged citizens.",
      },
      { property: "og:url", content: "https://elenchos.live/about" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/about" }],
  }),

  component: AboutPage,
});


// ───────────────────────── Page ─────────────────────────

function AboutPage() {
  return (
    <div className="min-h-screen relative flex flex-col">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1180px] mx-auto w-full px-4 md:px-8 py-6 md:py-12 mobile-safe-bottom md:pb-12 space-y-12 md:space-y-20 relative flex-1 overflow-x-clip">
        <Hero />
        <Pillars />
        <Method />
        <Audience />
        <WhyX />
        <LegalSection />
      </main>

      <SiteFooter />
    </div>
  );
}

// ───────────────────────── Hero ─────────────────────────

function Hero() {
  return (
    <section className="relative">
      <div className="mb-6 flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
        <Link to="/" className="hover:text-cyan transition-colors inline-flex items-center gap-1.5">
          <ArrowRight className="w-3 h-3 rotate-180" />
          Back to dashboard
        </Link>
        <span className="opacity-40">/</span>
        <span className="text-foreground/70">About</span>
      </div>

      <div
        aria-hidden
        className="absolute -inset-x-20 -top-20 h-[360px] opacity-60 pointer-events-none blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 30% 30%, color-mix(in oklab, var(--cyan) 35%, transparent), transparent), radial-gradient(50% 50% at 80% 60%, color-mix(in oklab, var(--emerald-signal) 25%, transparent), transparent)",
        }}
      />

      <div className="relative flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative shrink-0 w-24 h-24 md:w-28 md:h-28"
        >
          <div className="brand-mark w-full h-full rounded-full grid place-items-center relative overflow-hidden">
            <Radio className="w-8 h-8 text-cyan relative z-10" strokeWidth={2.5} />
            <motion.div
              aria-hidden
              className="absolute inset-2 rounded-full border border-cyan/25"
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0deg, transparent 300deg, color-mix(in oklab, var(--cyan) 55%, transparent) 360deg)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            <div
              aria-hidden
              className="absolute inset-0 rounded-full opacity-40"
              style={{
                background:
                  "repeating-conic-gradient(from 0deg, transparent 0deg 8deg, color-mix(in oklab, var(--cyan) 12%, transparent) 8deg 9deg)",
              }}
            />
          </div>
        </motion.div>

        <div className="min-w-0 flex-1">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.28em] text-cyan"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
            </span>
            About Elenchos
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="mt-4 font-display font-semibold tracking-tight leading-[1.08] text-[1.75rem] sm:text-4xl md:text-[2.75rem] lg:text-5xl break-words"
          >
            Elenchos <span className="text-cyan">ἔλεγχος</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mt-5 text-[15px] md:text-lg text-foreground/85 leading-relaxed max-w-2xl space-y-3"
          >
            <span className="block">
              Ancient Greek for cross-examination.Socrates used it to expose the gaps between what people claimed to know and what they truly believed.. revealing contradictions, shaky logic, and comforting illusions.
            </span>
            <span className="block">
              This is the Socratic method: pursuing truth by testing ideas against reality.
            </span>
            <span className="block">
              elenchos.live bring the same approach to X — examining real claims against beliefs and official narratives.
            </span>
          </motion.p>
        </div>
      </div>
    </section>
  );
}

// ───────────────────────── Pillars (Dashboard / Topics / Trackers) ─────────────────────────

const PILLARS = [
  {
    icon: LineChart,
    title: "Dashboard Overview",
    to: "/",
    blurb:
      "A live map of citizen sentiment, narrative divergence, and the signals moving today's conversation.",
    accent: "cyan",
  },
  {
    icon: Layers,
    title: "Topics",
    to: "/topics",
    blurb:
      "Deep dives on every monitored topic. Nine balanced questions, scored 0–100, with the gap to official narratives surfaced.",
    accent: "emerald",
  },
  {
    icon: Scale,
    title: "Trackers",
    to: "/trackers",
    blurb:
      "Performance scorecards for leaders and countries — trust, popularity, and the live Peace & Normalization index.",
    accent: "amber",
  },
] as const;

const PILLAR_DETAILS: Record<string, string[]> = {
  "Dashboard Overview": [
    "Live KPI tiles with narrative divergence and peace indices",
    "Citizen signal feed with curated Pass 2 highlights",
    "3D globe heatmap anchored to real topic data",
  ],
  Topics: [
    "Nine balanced questions scored 0–100 per topic",
    "Pass 2 curated insight threads and Q&A pairs",
    "Historical sentiment sparklines across snapshots",
  ],
  Trackers: [
    "Global leader trust ranked by citizen discourse",
    "Peace & normalization index by country",
    "Football player index during World Cup cycles",
  ],
};

function Pillars() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section>
      <SectionHeading
        kicker="What you can do here"
        title="Three lenses on the same public square"
        sub="Three sections. One backend. Move between them to see what citizens really think, how much it differs from official stories, and how peace and more scores."
      />
      <div className="mt-7 grid md:grid-cols-3 gap-3.5">
        {PILLARS.map((p, i) => {
          const Icon = p.icon;
          const color =
            p.accent === "cyan"
              ? "var(--cyan)"
              : p.accent === "emerald"
                ? "var(--emerald-signal)"
                : "var(--amber-signal)";
          const active = hovered === p.title;
          const details = PILLAR_DETAILS[p.title] ?? [];
          return (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              onMouseEnter={() => setHovered(p.title)}
              onMouseLeave={() => setHovered(null)}
            >
              <Link
                to={p.to}
                className="group relative block glass rounded-2xl p-6 h-full overflow-hidden border-t-2 transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_var(--cyan-glow)]"
                style={{ borderTopColor: color }}
              >
                <div
                  aria-hidden
                  className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity"
                  style={{ background: color }}
                />
                <div
                  className="inline-flex p-2 rounded-lg border"
                  style={{
                    background: `color-mix(in oklab, ${color} 15%, transparent)`,
                    borderColor: `color-mix(in oklab, ${color} 35%, transparent)`,
                    color,
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="mt-4 font-display font-semibold text-lg tracking-tight">
                  {p.title}
                </h3>
                <p className="mt-2 text-[13.5px] text-muted-foreground leading-relaxed">
                  {p.blurb}
                </p>
                <motion.div
                  initial={false}
                  animate={{ height: active ? "auto" : 0, opacity: active ? 1 : 0 }}
                  className="overflow-hidden"
                >
                  <ul className="mt-3 pt-3 border-t border-border/60 space-y-1.5">
                    {details.map((d) => (
                      <li key={d} className="flex gap-2 text-[12px] text-foreground/85 leading-snug">
                        <span className="text-cyan font-mono shrink-0">›</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </motion.div>
                <div
                  className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.2em] opacity-80 group-hover:opacity-100"
                  style={{ color }}
                >
                  Open <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

// ───────────────────────── Method ─────────────────────────

const STEPS = [
  {
    icon: Ear,
    title: "Listen",
    body:
      "We read thousands of unfiltered public posts on X — including places where speech is usually suppressed.",
  },
  {
    icon: Microscope,
    title: "Analyze",
    body:
      "Grok parses each conversation for meaning, sentiment, sample size, and timestamp — no hand-curated takes.",
  },
  {
    icon: Scale,
    title: "Score & Contrast",
    body:
      "Every topic gets a 0–100 divergence score against the official narrative.",
  },
  {
    icon: Monitor,
    title: "Surface",
    body:
      "Signals, trackers, and scorecards ship straight to the frontend — the backend is the single source of truth.",
  },
] as const;

function Method() {
  const [activeStep, setActiveStep] = useState<string | null>(null);

  return (
    <section>
      <SectionHeading
        kicker="The Method"
        title="Elenchos in four moves"
        sub="ἔλεγχος — Socratic cross-examination — applied to a noisy modern public square."
      />

      <div className="mt-7 relative">
        <div
          aria-hidden
          className="hidden md:block absolute top-[34px] left-6 right-6 h-px bg-[linear-gradient(90deg,transparent,var(--cyan)_20%,var(--cyan)_80%,transparent)] opacity-50"
        />
        <ol className="grid md:grid-cols-4 gap-3.5">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = activeStep === s.title;
            return (
              <motion.li
                key={s.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                onMouseEnter={() => setActiveStep(s.title)}
                onMouseLeave={() => setActiveStep(null)}
                onClick={() => setActiveStep(active ? null : s.title)}
                className={`relative glass rounded-xl p-6 cursor-pointer transition-all border ${
                  active ? "border-cyan/50 shadow-[0_0_28px_-12px_var(--cyan-glow)]" : "border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={active ? { scale: 1.06 } : { scale: 1 }}
                    className="relative w-11 h-11 rounded-full grid place-items-center bg-background border border-cyan/40 text-cyan shadow-[0_0_18px_var(--cyan-glow)]"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="absolute -top-1.5 -right-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-cyan text-background">
                      0{i + 1}
                    </span>
                  </motion.div>
                  <div className="font-display font-semibold tracking-tight">{s.title}</div>
                </div>
                <p className="mt-3 text-[13px] text-muted-foreground leading-relaxed">{s.body}</p>
                <motion.div
                  initial={false}
                  animate={{ opacity: active ? 1 : 0, height: active ? "auto" : 0 }}
                  className="overflow-hidden"
                >
                  <p className="mt-3 pt-3 border-t border-border/60 text-[11px] font-mono uppercase tracking-[0.18em] text-cyan">
                    Move {i + 1} · {s.title}
                  </p>
                </motion.div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

// ───────────────────────── Audience (interactive tabs) ─────────────────────────

const AUDIENCE = [
  {
    id: "journalists",
    label: "Journalists",
    icon: Newspaper,
    headline: "Sourcing leads, not opinions.",
    points: [
      "Spot divergence between citizen sentiment and official statements before it breaks.",
      "Pull defensible 0–100 scores with sample sizes and timestamps into your story.",
      "Track regions where independent reporting is hardest to verify.",
    ],
  },
  {
    id: "researchers",
    label: "Researchers",
    icon: Microscope,
    headline: "Reproducible signals, transparent samples.",
    points: [
      "Nine balanced questions per topic, scored consistently across snapshots.",
      "Small samples are kept small on purpose — authenticity over volume.",
      "Backend is the single source of truth; the dashboard never invents numbers.",
    ],
  },
  {
    id: "policy",
    label: "Policymakers",
    icon: Landmark,
    headline: "The gap between what is said and what is felt.",
    points: [
      "Leader trust and country-level peace indices in one scorecard.",
      "Identify regions where the government–public gap is widest.",
      "Use divergence as an early-warning indicator, not a verdict.",
    ],
  },
  {
    id: "citizens",
    label: "Citizens",
    icon: Users,
    headline: "Your voice, measured honestly.",
    points: [
      "See how your peers actually feel — not what cable news says they feel.",
      "Click any signal to read the reasoning behind the score.",
      "Free and open to read. No account required to explore.",
    ],
  },
] as const;

function Audience() {
  const [active, setActive] = useState<(typeof AUDIENCE)[number]["id"]>("journalists");
  const current = AUDIENCE.find((a) => a.id === active)!;
  const Icon = current.icon;

  return (
    <section>
      <SectionHeading
        kicker="Built for"
        title="Independent eyes on public discourse"
        sub="One dashboard, four lenses. Pick yours."
      />

      <div className="mt-7 grid md:grid-cols-[260px_1fr] gap-4">
        <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible -mx-5 px-5 md:mx-0 md:px-0">
          {AUDIENCE.map((a) => {
            const A = a.icon;
            const isActive = a.id === active;
            return (
              <button
                key={a.id}
                onClick={() => setActive(a.id)}
                className={`shrink-0 md:shrink flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-left text-sm transition-all border ${
                  isActive
                    ? "bg-cyan/10 border-cyan/50 text-foreground shadow-[0_0_24px_-10px_var(--cyan-glow)]"
                    : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <A className={`w-4 h-4 ${isActive ? "text-cyan" : ""}`} />
                <span className="font-display font-medium">{a.label}</span>
              </button>
            );
          })}
        </div>

        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="glass rounded-2xl p-6 md:p-7 border-t-2 border-t-cyan/60 relative overflow-hidden"
        >
          <div
            aria-hidden
            className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-25 blur-2xl bg-cyan"
          />
          <div className="flex items-center gap-2.5 text-cyan">
            <div className="p-2 rounded-lg bg-cyan/15 border border-cyan/30">
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-[11px] font-mono uppercase tracking-[0.22em]">
              For {current.label}
            </div>
          </div>
          <h3 className="mt-3 font-display font-semibold text-2xl tracking-tight leading-tight">
            {current.headline}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {current.points.map((p) => (
              <li key={p} className="flex gap-2.5 text-[14px] text-foreground/90 leading-relaxed">
                <span className="text-cyan font-mono mt-0.5 shrink-0">›</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

// ───────────────────────── Why X / Stack ─────────────────────────

const STACK_ITEMS = [
  {
    id: "x-api",
    label: "X API",
    color: "cyan",
    icon: Globe2,
    blurb: "Raw public posts — the unfiltered public square at global scale.",
  },
  {
    id: "grok",
    label: "xAI · Grok",
    color: "cyan",
    icon: Cpu,
    blurb: "Reasoning layer: sentiment, divergence, and narrative synthesis.",
  },
  {
    id: "supabase",
    label: "Supabase",
    color: "emerald",
    icon: Database,
    blurb: "Single source of truth — snapshots, trackers, and curated insights.",
  },
  {
    id: "github",
    label: "GitHub",
    color: "muted",
    icon: Github,
    blurb: "Scheduled workflows for Pass 1 snapshots and Pass 2 curation.",
  },
  {
    id: "cursor",
    label: "Cursor",
    color: "muted",
    icon: Sparkles,
    blurb: "Frontend and pipeline development environment.",
  },
] as const;

function WhyX() {
  const [stackHover, setStackHover] = useState<string | null>(null);
  return (
    <section className="grid md:grid-cols-2 gap-4">
      <div className="glass rounded-2xl p-6 md:p-7 relative overflow-hidden">
        <div className="flex items-center gap-2 text-cyan">
          <div className="p-1.5 rounded-md bg-cyan/15 border border-cyan/30">
            <Globe2 className="w-4 h-4" />
          </div>
          <h2 className="font-display font-semibold tracking-[0.18em] uppercase text-sm">
            Why X
          </h2>
        </div>
        <p className="mt-3 text-[14.5px] text-foreground/90 leading-relaxed">
          X currently offers the most open access to unfiltered public discussion at global scale.
          That makes it the best available proxy for the public square — particularly in countries
          where state media dominates the official record.
        </p>
        <figure className="mt-5 rounded-xl border border-border bg-secondary/40 p-4">
          <Quote className="w-4 h-4 text-cyan/80" />
          <blockquote className="mt-2 text-[14px] italic text-foreground/85 leading-relaxed">
            The unexamined narrative is not worth believing.
          </blockquote>
          <figcaption className="mt-2 text-[10.5px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
            — after Socrates
          </figcaption>
        </figure>
      </div>

      <div className="glass rounded-2xl p-6 md:p-7 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -bottom-20 -right-16 w-64 h-64 rounded-full opacity-15 blur-3xl bg-cyan"
        />
        <div className="flex items-center gap-2 text-cyan">
          <div className="p-1.5 rounded-md bg-cyan/15 border border-cyan/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="font-display font-semibold tracking-[0.18em] uppercase text-sm">
            The stack
          </h2>
        </div>
        <p className="mt-3 text-[14.5px] text-foreground/90 leading-relaxed">
          Public posts from the <span className="text-cyan font-semibold">X API</span> are reasoned
          over by <span className="text-cyan font-semibold">xAI's Grok</span> and written straight
          into <span className="text-cyan font-semibold">Supabase</span> as the single source of
          truth — no hand-edited numbers, no other models in the loop.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {STACK_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = stackHover === item.id;
            const colorClass =
              item.color === "cyan"
                ? "border-cyan/40 bg-cyan/10 text-cyan"
                : item.color === "emerald"
                  ? "border-emerald-signal/40 bg-emerald-signal/10 text-emerald-signal"
                  : "border-border bg-secondary/60 text-muted-foreground";
            return (
              <button
                key={item.id}
                type="button"
                onMouseEnter={() => setStackHover(item.id)}
                onMouseLeave={() => setStackHover(null)}
                onFocus={() => setStackHover(item.id)}
                onBlur={() => setStackHover(null)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10.5px] font-mono uppercase tracking-[0.18em] transition-all hover:-translate-y-0.5 ${colorClass} ${
                  active ? "ring-1 ring-cyan/40 shadow-[0_0_20px_-10px_var(--cyan-glow)]" : ""
                }`}
              >
                <Icon className="w-3 h-3" />
                {item.label}
              </button>
            );
          })}
        </div>
        <motion.p
          key={stackHover ?? "default"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-[12.5px] text-muted-foreground leading-relaxed min-h-[2.5rem]"
        >
          {stackHover
            ? STACK_ITEMS.find((s) => s.id === stackHover)?.blurb
            : "Hover a layer to see how it fits the pipeline."}
        </motion.p>
      </div>
    </section>
  );
}

// ───────────────────────── Legal ─────────────────────────

const DISCLAIMER_POINTS = [
  "Independent experimental research — not a commercial business, news outlet, or advisory service.",
  "All insights are algorithmically generated. No warranties on accuracy, completeness, or timeliness.",
  "Not professional, financial, legal, or political advice. Verify before acting.",
  "Use of this dashboard is entirely at your own risk.",
];

function LegalSection() {
  return (
    <section>
      <Collapsible defaultOpen={false} className="glass rounded-2xl p-6 md:p-7">
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 text-left group">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="p-1.5 rounded-md bg-secondary border border-border">
              <ScrollText className="w-4 h-4" />
            </div>
            <h2 className="font-display font-semibold tracking-[0.18em] uppercase text-sm">
              Legal Disclaimer
            </h2>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className="mt-4 space-y-2">
            {DISCLAIMER_POINTS.map((p) => (
              <li
                key={p}
                className="flex gap-2.5 text-[13px] text-foreground/85 leading-relaxed"
              >
                <span className="text-cyan font-mono mt-0.5 shrink-0">›</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[13px] text-foreground/85 leading-relaxed">
            For data processing, cookies, and your GDPR rights, see our{" "}
            <Link to="/privacy" className="text-cyan hover:underline">
              Privacy Notice
            </Link>
            .
          </p>
          <p className="mt-3 text-[10.5px] font-mono uppercase tracking-[0.2em] text-emerald-signal">
            Status: Live · independent research
          </p>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}

// ───────────────────────── Shared ─────────────────────────

function SectionHeading({
  kicker,
  title,
  sub,
}: {
  kicker: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="max-w-2xl">
      <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.28em] text-cyan">
        <span className="w-1 h-3.5 bg-cyan rounded-sm" />
        {kicker}
      </div>
      <h2 className="mt-3 font-display font-semibold tracking-tight text-[24px] sm:text-[28px] md:text-[34px] leading-[1.1]">
        {title}
      </h2>
      {sub && (
        <p className="mt-2.5 text-[14.5px] text-muted-foreground leading-relaxed">{sub}</p>
      )}
    </div>
  );
}
