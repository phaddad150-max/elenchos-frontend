/**
 * Research thesis briefs — separate product surface from Topics.
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
  { code: "D", label: "Discourse", use: "Citizen / public social — attitudes & frames" },
  { code: "O", label: "Official", use: "Policy claims (scrutinize self-serving states)" },
  {
    code: "M",
    label: "Media",
    use: "Frames; tag M-state / high-scrutiny — never sole fact spine",
  },
  {
    code: "S",
    label: "Scholarly / structural",
    use: "Journals, data, info-ops & propaganda literature",
  },
  { code: "I", label: "Inference", use: "Synthesis — must rest on D/O/M/S/V/W" },
  {
    code: "R",
    label: "Elenchos product",
    use: "Prior product signal — extra transparency only if relevant",
  },
];

/** North-star copy for Research workbench */
export const RESEARCH_NORTH_STAR =
  "Human-gated, multi-source thesis research — surface evidence, expose deception, equip freer choices.";

export const RESEARCH_HUMAN_FIRST =
  "Machines may collect and draft. A human approves the source plan, gates every thesis claim, and approves publish. No auto-published claims.";

export const RESEARCH_HUMANITY_FORWARD =
  "Prefer findings that reduce deception, clarify power, and expand peaceful, accountable, evidence-based choice — including under corruption, proxy rule, and information warfare.";

export const RESEARCH_SCRUTINY_NOTE =
  "High-scrutiny applies to a multi-decade regional information environment—not one channel. Named outlets (e.g. Al Jazeera) are examples inside a wider field across Muslim-majority societies, state and movement media, and diaspora networks where noise and propaganda often bury surface truth. Use for narrative context; triangulate facts; never sole spine. Precision on orgs and funders — no collective guilt.";

const LEBANON: ResearchBrief = {
  slug: "lebanon-ai-collapse",
  title: "Lebanon After Collapse: AI, US–Israeli Technology, and the Limits of Rapid Transformation",
  subtitle: "A research thesis on discourse, constraints, and conditional paths",
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
  updatedAt: "2026-07-26",
  researchQuestion:
    "Under what conditions, and over what time scales, can AI and US–Israeli technology meaningfully affect governance, economy, and attitudes in post-collapse Lebanon — and where do structural constraints (elite capture, proxy politics, demography, identity) bound those effects?",
  methodSummary:
    "Human-first multi-source research: scholarly, surveys, open web, official, media frames, and discourse — not X-only. Thesis claims are an output of evidence and a human gate. High-scrutiny media and info-ops literature are tiered, not laundered as neutral fact. Not advocacy.",
  approach: [
    "Human-first: source plan, claims, and PDF require a human gate",
    "Multi-source: S/V/W/O/M/D — social discourse is one layer, not the spine",
    "Scrutiny ladder: multi-decade regional noise field (state/movement media across the region — not one outlet); frame evidence; triangulate facts",
    "Humanity-forward: recover truth under propaganda load; pro-agency; no dehumanization or collective guilt",
    "Claims only with evidence mix + confidence + falsifier; empty when thin",
    "Elenchos R only if relevant, over and above full external bibliography",
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
      status: "active",
      note: "Discourse · official · constraints — collection next",
    },
    {
      id: "C",
      label: "Synthesis / gaps",
      status: "locked",
      note: "After Layer B findings",
    },
    {
      id: "D",
      label: "Thesis claims",
      status: "locked",
      note: "Empty until evidence supports claims",
    },
    {
      id: "E",
      label: "Scenarios",
      status: "locked",
      note: "Conditional 12 / 36 / 60 month paths",
    },
  ],
  chapters: [
    {
      id: "abstract",
      number: "1",
      title: "Abstract",
      status: "empty",
      summary: "Written last — question, method, findings, claims, limits.",
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
        "Four layers; citizen vs gap side; insufficient-evidence rule; corrupt patronage system (local: *wasta* = existing corrupt system).",
      bullets: [
        "Layer 1 — X discourse (ordinary voices only)",
        "Layer 2 — Official narrative pack (objects of analysis)",
        "Layer 3 — Constraint matrix (cited)",
        "Layer 4 — Conditional scenarios after evidence",
        "R = optional Elenchos product ref only if relevant",
      ],
    },
    {
      id: "official",
      number: "4",
      title: "Official narratives",
      status: "empty",
      summary: "US / Lebanese elite / tech-cooperation frames — fill from logged statements only.",
    },
    {
      id: "discourse",
      number: "5",
      title: "Citizen & diaspora discourse",
      status: "empty",
      summary:
        "AI/digital, corrupt patronage (*wasta*), security, Israel/normalization frames, elite trust — after query pack runs.",
    },
    {
      id: "gaps",
      number: "6",
      title: "Narrative gaps",
      status: "empty",
      summary: "Citizen (D) vs official/media (O/M) — structured mismatch, not “citizen always right.”",
    },
    {
      id: "constraints",
      number: "7",
      title: "Structural constraints",
      status: "outline",
      summary:
        "Power, banking, parallel state, human capital, corrupt patronage (*wasta*)/elite capture, demography, patrons.",
      bullets: [
        "Power & infrastructure",
        "Banking / capital flight",
        "Militia / parallel state / external patrons",
        "Emigration & human capital",
        "Corrupt patronage (*wasta*) as existing system & social fabric",
        "Demography & identity blocs",
      ],
    },
    {
      id: "tech",
      number: "8",
      title: "Technology levers (conditional)",
      status: "outline",
      summary: "AI admin, water/ag, energy, info tools — ceilings under politics and constraints.",
    },
    {
      id: "claims",
      number: "9",
      title: "Thesis claims",
      status: "empty",
      summary: "3–7 claims with evidence mix, confidence, and falsifiers — after chapters 4–8.",
    },
    {
      id: "scenarios",
      number: "10",
      title: "Conditional scenarios",
      status: "outline",
      summary: "A Continuity capture · B Constrained reform · C Strategic realignment.",
    },
    {
      id: "greece",
      number: "11",
      title: "Greece side-note",
      status: "outline",
      summary: "Weak analogy only — different sovereignty and constraint set.",
    },
    {
      id: "open",
      number: "12",
      title: "Open questions",
      status: "outline",
      summary: "Further research without forcing early claims.",
    },
    {
      id: "biblio",
      number: "13",
      title: "Bibliography & source log",
      status: "empty",
      summary: "Full external sources required; R optional and labeled.",
    },
  ],
  claimSlots: [
    {
      id: "t1",
      domain: "Governance / corrupt patronage (*wasta*)",
      statement: null,
      confidence: null,
      falsifier: null,
      status: "empty",
    },
    {
      id: "t2",
      domain: "Official speed vs citizen cynicism",
      statement: null,
      confidence: null,
      falsifier: null,
      status: "empty",
    },
    {
      id: "t3",
      domain: "AI admin ceiling",
      statement: null,
      confidence: null,
      falsifier: null,
      status: "empty",
    },
    {
      id: "t4",
      domain: "Attitude / hate change",
      statement: null,
      confidence: null,
      falsifier: null,
      status: "empty",
    },
    {
      id: "t5",
      domain: "Conditional economic recovery",
      statement: null,
      confidence: null,
      falsifier: null,
      status: "empty",
    },
    {
      id: "t6",
      domain: "Proxy / sovereignty bound",
      statement: null,
      confidence: null,
      falsifier: null,
      status: "empty",
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
        "Done — OpenAlex S (~191) + official/seeds O/W (12 usable: live HTML, Wayback, or curated excerpts). No X used.",
    },
    {
      id: "x_run",
      label: "Optional: thin X sample",
      done: false,
      detail:
        "Skip for no-budget default. Only if street frames needed — mode=x · blocks B,D · max 12.",
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
      label: "Thesis claims",
      done: false,
      detail: "NEXT — human gate only after synthesis chapters from evidence",
    },
    {
      id: "pdf",
      label: "PDF thesis brief",
      done: false,
      detail: "After draft content is ready",
    },
  ],
  openQuestions: [
    "How dense is clean citizen corpus on AI vs corrupt patronage (*wasta*) after filtering media accounts?",
    "What is normalized as social fabric in Lebanon vs other Arab contexts (e.g. Gulf/UAE) on patronage and corruption — per evidence only?",
    "Which official timelines (if any) are explicit enough to gap-test?",
    "Where does discourse treat Israeli water/tech as survival vs betrayal?",
    "What can be said about demography without overclaiming from X alone?",
  ],
  elenchosRefs: [
    {
      label: "Peace / normalization tracker (Lebanon row)",
      note: "Optional R only if discussing normalization/attitude points — bucketed regional sample, not a national poll. Not incorporated into method spine.",
      href: "/peace",
    },
  ],
  pdfUrl: null,
  notATopicBanner:
    "Research thesis brief — separate from Topics. Human-gated · multi-source · not live Pass-1 scores.",
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
