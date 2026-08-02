/**
 * Research briefs (case studies) — separate product surface from Topics.
 * Catalog-driven v1 (not Pass-1 / not trackers).
 */

export type ResearchStatus = "method" | "collecting" | "draft" | "published";

export type SourceClass = "D" | "O" | "M" | "S" | "I" | "R";

export type PhaseId = "A" | "B" | "C" | "D" | "E";

export type PhaseStatus = "done" | "active" | "locked" | "empty";

export interface ResearchPhase {
  id: PhaseId;
  label: string;
  status: PhaseStatus;
  note: string;
}

export interface ResearchChapter {
  id: string;
  number: string;
  title: string;
  status: "outline" | "draft" | "empty" | "ready";
  summary: string;
  bullets?: string[];
}

export interface ResearchClaimSlot {
  id: string;
  domain: string;
  statement: string | null;
  confidence: "high" | "medium" | "low" | "insufficient" | null;
  falsifier: string | null;
  status: "empty" | "draft" | "ready";
}

export interface ResearchScenario {
  id: string;
  name: string;
  politics: string;
  techMayAccelerate: string;
  unlikelyFast: string;
}

export interface ResearchCorpusCheck {
  id: string;
  label: string;
  done: boolean;
  detail: string;
}

export interface ResearchBrief {
  slug: string;
  title: string;
  subtitle: string;
  status: ResearchStatus;
  region: string;
  themes: string[];
  updatedAt: string;
  researchQuestion: string;
  methodSummary: string;
  approach: string[];
  sourceClasses: { code: SourceClass; label: string; use: string }[];
  phases: ResearchPhase[];
  chapters: ResearchChapter[];
  claimSlots: ResearchClaimSlot[];
  scenarios: ResearchScenario[];
  corpusChecks: ResearchCorpusCheck[];
  openQuestions: string[];
  /** Optional prior Elenchos product refs — only if relevant; never primary evidence */
  elenchosRefs: { label: string; note: string; href?: string }[];
  pdfUrl?: string | null;
  notATopicBanner: string;
}

export const SOURCE_CLASS_LEGEND: ResearchBrief["sourceClasses"] = [
  { code: "D", label: "Discourse", use: "Citizen / public social: attitudes and frames" },
  { code: "O", label: "Official", use: "Policy claims (scrutinize self-serving states)" },
  {
    code: "M",
    label: "Media",
    use: "Frames; tag M-state / high-scrutiny; never sole fact spine",
  },
  {
    code: "S",
    label: "Scholarly / structural",
    use: "Journals, data, info-ops and propaganda literature",
  },
  { code: "I", label: "Inference", use: "Synthesis; must rest on D/O/M/S/V/W" },
  {
    code: "R",
    label: "Elenchos product",
    use: "Prior product signal; extra transparency only if relevant",
  },
];

/** North-star copy for Research Desk (public freestyle desk — not Topics live scores) */
export const RESEARCH_NORTH_STAR =
  "Open multi-source research desk for citizens and serious readers: thesis-style case studies, national security briefs, and indexes — evidence, gaps, and limits you can check. Not live Topics scores.";

export const RESEARCH_HUMAN_FIRST =
  "Machines may collect and draft. A human analyst reviews the source plan and every claim before publish. No auto-published claims.";

export const RESEARCH_HUMANITY_FORWARD =
  "Prefer findings that clarify evidence and power, state limits clearly, and support accountable choices under hard constraints.";

export const RESEARCH_SCRUTINY_NOTE =
  "High-scrutiny applies to a multi-decade regional information environment, not one channel. Named outlets (e.g. Al Jazeera) are examples inside a wider field across Muslim-majority societies, state and movement media, and diaspora networks where noise and propaganda often bury surface truth. Use for narrative context; triangulate facts; never sole spine. Precision on orgs and funders, with no collective guilt.";

const LEBANON: ResearchBrief = {
  slug: "lebanon-ai-collapse",
  title: "Lebanon After Collapse: AI, US–Israeli Technology, and the Limits of Rapid Transformation",
  subtitle: "A structured research brief on discourse, constraints, and conditional paths",
  status: "draft",
  region: "Levant",
  themes: [
    "AI",
    "governance",
    "corrupt patronage",
    "security",
    "demography",
    "tech levers",
  ],
  updatedAt: "2026-07-30",
  researchQuestion:
    "Under what conditions, and over what time scales, can AI and US–Israeli technology meaningfully affect governance, economy, and attitudes in post-collapse Lebanon, and where do structural constraints (elite capture, proxy politics, demography, identity) bound those effects?",
  methodSummary:
    "Multi-source research: scholarly, surveys, open web, official, media frames, and discourse, not X-only. Uses a thesis-style structure: claims only with evidence, confidence, and falsifiers. High-scrutiny media and info-ops literature are tiered, not treated as neutral fact alone. Not advocacy.",
  approach: [
    "Spine first: scholarly (S) + official/open (O/W); claims only with confidence + falsifier",
    "Discourse (D) optional and non-recurring: one-shot X if street frames needed, not a Topics pulse",
    "Empty when thin: no invented citizen attitudes; T4 stays non-poll even with thin D",
    "Human analyst review on claims and PDF before publish; free-first collect; freeze corpus after gate",
  ],
  sourceClasses: SOURCE_CLASS_LEGEND,
  phases: [
    {
      id: "A",
      label: "Method & corpus",
      status: "done",
      note: "Method note, outline, and query pack locked",
    },
    {
      id: "B",
      label: "Empirical layers",
      status: "done",
      note: "S~191 · O/W 12 · M 29 (GDELT) · D 38 (thin X) · GH 2026-07-29/30",
    },
    {
      id: "C",
      label: "Synthesis / gaps",
      status: "done",
      note: "SYNTHESIS.md multi-source · short brief v1.1",
    },
    {
      id: "D",
      label: "Claims",
      status: "done",
      note: "T1–T6 human-reviewed 2026-07-30; T4 low (thin D, not a poll)",
    },
    {
      id: "E",
      label: "Scenarios",
      status: "done",
      note: "A/B/C evidence-tagged · in short PDF",
    },
  ],
  chapters: [
    {
      id: "abstract",
      number: "1",
      title: "Abstract",
      status: "ready",
      summary: "Short PDF front matter: question, free corpus, findings, claims, limits.",
    },
    {
      id: "intro",
      number: "2",
      title: "Introduction",
      status: "outline",
      summary: "Why Lebanon is a hard case; what this study does and does not claim.",
      bullets: [
        "Post-collapse economy, corrupt patronage (*wasta*), parallel power, demography, external patrons",
        "Why AI-recovery narratives overclaim",
        "Contribution: discourse + official gap + structural bounds",
      ],
    },
    {
      id: "method",
      number: "3",
      title: "Method",
      status: "ready",
      summary:
        "Research → evidence → claims. Spine = S + O. Discourse optional one-shot. Corrupt patronage (*wasta*) named in English first.",
      bullets: [
        "Structural constraints (S) + official narratives (O) as objects of analysis",
        "Optional D (X) only if owner authorizes. not free-social substitutes for this topic",
        "Scenarios after evidence; insufficient-evidence rule",
      ],
    },
    {
      id: "official",
      number: "4",
      title: "Official narratives",
      status: "draft",
      summary: "See SYNTHESIS.md Ch.4. WB/IMF/State/USAID frames; AI–Israel tech thin in O pack.",
    },
    {
      id: "discourse",
      number: "5",
      title: "Citizen & diaspora discourse",
      status: "empty",
      summary: "Insufficient D (X not run). Optional mode=x later.",
    },
    {
      id: "gaps",
      number: "6",
      title: "Narrative gaps",
      status: "draft",
      summary: "Partial without D. O vs S floors; street gap TBD. SYNTHESIS.md Ch.6.",
    },
    {
      id: "constraints",
      number: "7",
      title: "Structural constraints",
      status: "draft",
      summary: "Constraint matrix from OpenAlex themes. SYNTHESIS.md Ch.7.",
      bullets: [
        "Banking / electricity: high",
        "Parallel force + wasta: high",
        "Emigration / demography: medium–high",
        "Info environment: medium",
      ],
    },
    {
      id: "tech",
      number: "8",
      title: "Technology levers (conditional)",
      status: "draft",
      summary: "Conditional accelerators only. SYNTHESIS.md Ch.8.",
    },
    {
      id: "claims",
      number: "9",
      title: "Claims",
      status: "ready",
      summary: "T1–T6 human-reviewed 2026-07-30 · short PDF v1.",
    },
    {
      id: "scenarios",
      number: "10",
      title: "Conditional scenarios",
      status: "ready",
      summary: "A/B/C with evidence tags. SYNTHESIS + PDF.",
    },
    {
      id: "open",
      number: "11",
      title: "Open questions",
      status: "outline",
      summary: "Further research without forcing early claims. No weak cross-country analogies.",
    },
    {
      id: "biblio",
      number: "12",
      title: "Bibliography & source log",
      status: "empty",
      summary: "Full external sources required; R optional and labeled.",
    },
  ],
  claimSlots: [
    {
      id: "t1",
      domain: "Governance / corrupt patronage (*wasta*)",
      statement:
        "Digital/AI tools alone unlikely to dismantle wasta without elite/enforcement change (S+O).",
      confidence: "medium",
      falsifier: "Measurable patronage drop via digital enforcement without elite turnover.",
      status: "ready",
    },
    {
      id: "t2",
      domain: "Official speed vs structural floors",
      statement:
        "IMF/WB reform+aid paths bounded by banking + infrastructure; fast narratives ignoring floors unsupported.",
      confidence: "medium",
      falsifier: "Rapid recovery with frozen banking + intermittent power.",
      status: "ready",
    },
    {
      id: "t3",
      domain: "AI admin ceiling",
      statement: "AI admin faces hard ceiling under electricity + parallel-state constraints.",
      confidence: "medium",
      falsifier: "Reliable national e-gov under current power/security setup.",
      status: "ready",
    },
    {
      id: "t4",
      domain: "Attitude / hate change",
      statement:
        "Thin purposive D (n=38) + S still insufficient to claim AI/US–Israeli tech rapidly shifts mass attitudes (not a poll).",
      confidence: "low",
      falsifier: "Larger longitudinal D + surveys show rapid tech-only attitude shifts.",
      status: "ready",
    },
    {
      id: "t5",
      domain: "Conditional economic recovery",
      statement: "External tech recovery plausible under B/C scenarios, not continuity capture (A).",
      confidence: "medium",
      falsifier: "Dual-use boom under full proxy veto + frozen deposits.",
      status: "ready",
    },
    {
      id: "t6",
      domain: "Proxy / sovereignty bound",
      statement:
        "Incomplete monopoly of force binds reform depth; O sovereignty language alone does not remove it.",
      confidence: "medium",
      falsifier: "Deep reform while parallel arms remain decisive.",
      status: "ready",
    },
  ],
  scenarios: [
    {
      id: "A",
      name: "Continuity capture",
      politics: "Same elite + proxy veto",
      techMayAccelerate: "Apps, service PR",
      unlikelyFast: "Corruption culture, hate norms, demography",
    },
    {
      id: "B",
      name: "Constrained reform",
      politics: "Partial sovereignty + external leverage",
      techMayAccelerate: "Water/ag, digital admin, growth pockets",
      unlikelyFast: "Full deradicalization",
    },
    {
      id: "C",
      name: "Strategic realignment",
      politics: "Sustained anti-proxy + pro-normality path",
      techMayAccelerate: "Faster dual-use & infrastructure with partners",
      unlikelyFast: "Identity/hate without security monopoly",
    },
  ],
  corpusChecks: [
    {
      id: "method",
      label: "Method freeze",
      done: true,
      detail: "METHOD.md · phases A–E · anti-advocacy rules",
    },
    {
      id: "outline",
      label: "Chapter outline",
      done: true,
      detail: "OUTLINE.md · 13 chapters · claim templates",
    },
    {
      id: "query",
      label: "Query pack v1",
      done: true,
      detail: "query_pack.json + QUERY_PACK.md ready",
    },
    {
      id: "collector",
      label: "Collector pipeline shipped",
      done: true,
      detail: "Free-first: OpenAlex (S) + official seeds (O) + optional min-X · GH default all-free",
    },
    {
      id: "free_run",
      label: "Free collect (S + O) run",
      done: true,
      detail:
        "Done. OpenAlex S (~191) + official/seeds O/W (12 usable: live HTML, Wayback, or curated excerpts).",
    },
    {
      id: "gdelt_run",
      label: "Optional: GDELT media (M)",
      done: true,
      detail:
        "Done 2026-07-30. mode=media-gdelt · n=29 unique · class M media frames only · not citizen D.",
    },
    {
      id: "x_run",
      label: "Optional: thin X sample",
      done: true,
      detail:
        "Done 2026-07-30. mode=x · blocks B,D · max 12 · n=38 unique · purposive, not a poll.",
    },
    {
      id: "official",
      label: "Official pack (O/W)",
      done: true,
      detail: "12 seeds usable (hard_fails=0). Some via Wayback/curated excerpt when live HTML blocked.",
    },
    {
      id: "constraints",
      label: "Constraint matrix (S)",
      done: true,
      detail: "OpenAlex structural insert ~191 unique scholarly rows.",
    },
    {
      id: "claims",
      label: "Claims",
      done: true,
      detail:
        "T1–T6 human-reviewed 2026-07-30. T4 low (thin D present; still not mass-attitude claim).",
    },
    {
      id: "pdf",
      label: "PDF research brief",
      done: true,
      detail: "Short PDF v1.1 multi-source. public/reports/lebanon-ai-collapse-thesis-brief.pdf",
    },
  ],
  openQuestions: [
    "How dense is clean citizen talk on AI vs wasta after filtering media accounts in the thin D sample?",
    "Which official timelines (if any) are explicit enough to gap-test against banking/power floors?",
    "Where does thin street discourse treat Israeli water/tech as survival vs betrayal (directional only)?",
    "What can be said about demography without overclaiming from structure alone?",
  ],
  elenchosRefs: [],
  pdfUrl: "/reports/lebanon-ai-collapse-thesis-brief.pdf",
  notATopicBanner:
    "Research brief (separate from Topics). Multi-source · human-reviewed before publish · not live topic scores.",
};

const BRIEFS: ResearchBrief[] = [LEBANON];

export function listResearchBriefs(): ResearchBrief[] {
  return BRIEFS;
}

export function getResearchBrief(slug: string): ResearchBrief | undefined {
  return BRIEFS.find((b) => b.slug === slug);
}

export function researchStatusLabel(status: ResearchStatus): string {
  switch (status) {
    case "method":
      return "Method locked";
    case "collecting":
      return "Collecting evidence";
    case "draft":
      return "Draft";
    case "published":
      return "Published";
  }
}
