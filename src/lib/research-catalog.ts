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
  { code: "D", label: "Discourse", use: "Citizen / diaspora X voices" },
  { code: "O", label: "Official", use: "Policy & government narrative" },
  { code: "M", label: "Media", use: "Elite / press frames (gap side)" },
  { code: "S", label: "Structural", use: "Cited constraints & baselines" },
  { code: "I", label: "Inference", use: "Synthesis — must rest on D/O/M/S" },
  {
    code: "R",
    label: "Elenchos product",
    use: "Prior topic/tracker signal — extra transparency only if relevant",
  },
];

const LEBANON: ResearchBrief = {
  slug: "lebanon-ai-collapse",
  title: "Lebanon After Collapse: AI, US–Israeli Technology, and the Limits of Rapid Transformation",
  subtitle: "A research thesis on discourse, constraints, and conditional paths",
  status: "method",
  region: "Levant",
  themes: ["AI", "governance", "wasta", "security", "demography", "tech levers"],
  updatedAt: "2026-07-26",
  researchQuestion:
    "Under what conditions, and over what time scales, can AI and US–Israeli technology meaningfully affect governance, economy, and attitudes in post-collapse Lebanon — and where do structural constraints (elite capture, proxy politics, demography, identity) bound those effects?",
  methodSummary:
    "Research first, then synthesis, then thesis claims. Four layers: (1) citizen discourse, (2) official narratives, (3) structural constraints, (4) conditional scenarios. Thesis is an output of evidence — not an input. Not advocacy.",
  approach: [
    "Fix method and corpus rules before conclusions",
    "Describe discourse and structure before evaluation",
    "Write 3–7 claims only where evidence supports them, each with a falsifier",
    "Scenarios are if–then paths (12 / 36 / 60 months) — not prophecy",
    "Prior Elenchos Topics/Trackers may be cited as R only if relevant; full external refs always",
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
        "Post-collapse economy, wasta, parallel power, demography, external patrons",
        "Why AI-recovery narratives overclaim",
        "Contribution: discourse + official gap + structural bounds",
      ],
    },
    {
      id: "method",
      number: "3",
      title: "Method",
      status: "ready",
      summary: "Four layers; citizen vs gap side; insufficient-evidence rule; terminology (wasta).",
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
      summary: "AI/digital, wasta, security, Israel/normalization frames, elite trust — after query pack runs.",
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
      summary: "Power, banking, parallel state, human capital, wasta/elite capture, demography, patrons.",
      bullets: [
        "Power & infrastructure",
        "Banking / capital flight",
        "Militia / parallel state / external patrons",
        "Emigration & human capital",
        "Wasta & elite capture",
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
      domain: "Governance / wasta",
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
      detail: "QUERY_PACK.md · wasta · axes A–H · not yet executed",
    },
    {
      id: "x_run",
      label: "X discourse collection",
      done: false,
      detail: "Run Layer 1 citizen queries; code retained posts",
    },
    {
      id: "official",
      label: "Official pack log",
      done: false,
      detail: "US / Lebanese / tech-cooperation statements",
    },
    {
      id: "constraints",
      label: "Constraint matrix (cited)",
      done: false,
      detail: "Structural sources S — not vibes",
    },
    {
      id: "claims",
      label: "Thesis claims",
      done: false,
      detail: "Locked until evidence chapters exist",
    },
    {
      id: "pdf",
      label: "PDF thesis brief",
      done: false,
      detail: "Branded export when draft is ready",
    },
  ],
  openQuestions: [
    "How dense is clean citizen corpus on AI vs wasta after filtering media accounts?",
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
    "Research thesis brief — separate from Topics. Method-first workbench; not live Pass-1 scores.",
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
