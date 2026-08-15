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

/** North-star copy for Research Desk landing */
export const RESEARCH_NORTH_STAR =
  "Free Library: public discourse on X, multi-source case studies, indexes and ledgers — or commission a private multi-source report. Evidence and limits you can check — not vibes.";

/** Short landing line (solo operator, privacy-first). */
export const RESEARCH_LANDING_LINE =
  "Free library of topics, case studies, and trackers. Commission a private deep dive when you need more.";

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

const AVIATION: ResearchBrief = {
  slug: "aviation-race-digital-ai",
  title:
    "Aviation After Disruption: Airlines, Manufacturers, Innovation Race, and Readiness for Digital & AI Economies",
  subtitle:
    "Who is winning the commercial aviation race after COVID — safety, connectivity (incl. Starlink-class satcom), payments (incl. crypto), and AI readiness",
  status: "draft",
  region: "Global",
  themes: [
    "airlines",
    "OEM manufacturers",
    "Starlink / satcom",
    "crypto payments",
    "safety",
    "AI readiness",
    "post-COVID recovery",
  ],
  updatedAt: "2026-08-02",
  researchQuestion:
    "After COVID-era disruption and recovery, which airlines and manufacturers lead on safety, network strategy, cabin/connectivity innovation (including satellite internet), payment innovation (including crypto), and structural readiness for digital/AI operations — and who is lagging?",
  methodSummary:
    "Thesis-style multi-source brief: industry data and official filings (O), trade/media frames (M), scholarly/ops literature (S), public product announcements (W). Claims require confidence + falsifier. Not investment advice. Not a Topics X pulse.",
  approach: [
    "Spine: OEM order books, airline financial/ops KPIs, safety public ratings (with method limits), connectivity rollout maps",
    "Innovation lanes: satcom (Starlink Aviation / competitors), payments (crypto acceptors), AI ops (maintenance, pricing, crew)",
    "Winners/losers framed as multi-criteria index — not a single stock tip",
    "Human review before publish; free-first collect; empty when thin",
  ],
  sourceClasses: SOURCE_CLASS_LEGEND,
  phases: [
    {
      id: "A",
      label: "Method & corpus",
      status: "active",
      note: "Outline locked; free web/official spine next",
    },
    {
      id: "B",
      label: "Empirical layers",
      status: "active",
      note: "OEM · network carriers · GCC long-haul · LCC · satcom · payments",
    },
    {
      id: "C",
      label: "Synthesis / gaps",
      status: "locked",
      note: "After corpus freeze",
    },
    {
      id: "D",
      label: "Claims",
      status: "locked",
      note: "Human-gated claims on winners/laggards",
    },
    {
      id: "E",
      label: "Scenarios",
      status: "locked",
      note: "Fuel shocks · supply chain · regulation · AI adoption paths",
    },
  ],
  chapters: [
    {
      id: "scope",
      number: "1",
      title: "Scope & method",
      status: "draft",
      summary:
        "Commercial passenger aviation focus: OEMs (Airbus/Boeing/others), full-service vs LCC, Gulf/Asia long-haul, North Atlantic, satcom and payments as innovation proxies.",
      bullets: [
        "Not general aviation / military platforms as primary",
        "Safety scores: public indices with known biases stated",
        "Crypto/satcom: product announcements ≠ fleet-wide rollout",
      ],
    },
    {
      id: "covid",
      number: "2",
      title: "Shock & recovery (COVID → now)",
      status: "outline",
      summary:
        "Demand collapse, government support, capacity discipline, cargo pivot, then traffic recovery and labor/aircraft bottlenecks.",
    },
    {
      id: "oem",
      number: "3",
      title: "Manufacturers: competition & risks",
      status: "outline",
      summary:
        "Airbus vs Boeing delivery credibility, certification risk, supply chain, China/COMAC wildcard, aftermarket economics.",
    },
    {
      id: "airlines",
      number: "4",
      title: "Airlines: networks, margins, strategy",
      status: "outline",
      summary:
        "Gulf hubs, Asian majors, US majors, European network vs LCC. Who rebuilt networks faster; who over-expanded.",
    },
    {
      id: "innovation",
      number: "5",
      title: "Innovation race: satcom, cabin, payments, AI",
      status: "draft",
      summary:
        "Starlink Aviation and rival satcom; Emirates and peers on connectivity and payments (incl. crypto where announced); AI for ops vs marketing claims.",
      bullets: [
        "Map which carriers announced Starlink-class or high-throughput satcom and status (trial / partial / fleet)",
        "Emirates crypto payment acceptance: scope (routes, currencies, partner) and limits",
        "AI: predictive maintenance, dynamic pricing, crew rostering — evidence vs press release",
      ],
    },
    {
      id: "index",
      number: "6",
      title: "Readiness index: safety · digital · AI",
      status: "outline",
      summary:
        "Transparent multi-criteria scorecard (safety public metrics, balance sheet resilience, connectivity, digital product, AI ops signals). Winners/laggards with falsifiers.",
    },
    {
      id: "scenarios",
      number: "7",
      title: "Risks, threats, opportunities",
      status: "outline",
      summary:
        "Fuel & geopolitics, certification/safety events, climate policy, labor, OEM delays, digital moats.",
    },
  ],
  claimSlots: [
    {
      id: "av-t1",
      domain: "OEM race",
      statement: null,
      confidence: null,
      falsifier: "If Boeing delivery reliability and certification confidence reverse Airbus share trends without subsidy distortion.",
      status: "empty",
    },
    {
      id: "av-t2",
      domain: "Gulf long-haul",
      statement: null,
      confidence: null,
      falsifier: "If Gulf hubs lose transfer share to secondary Asian hubs on identical long-haul O&D.",
      status: "empty",
    },
    {
      id: "av-t3",
      domain: "Connectivity",
      statement:
        "Satellite high-throughput internet (incl. Starlink Aviation class) is becoming a competitive cabin differentiator; rollout remains uneven by airline and aircraft.",
      confidence: "medium",
      falsifier: "If major carriers abandon satcom pilots for cost without passenger yield response.",
      status: "draft",
    },
    {
      id: "av-t4",
      domain: "Payments",
      statement:
        "Select premium carriers (e.g. Emirates announcements on crypto payment rails) test alternative payment acceptance; this is not yet industry standard.",
      confidence: "medium",
      falsifier: "If crypto checkout is withdrawn or limited to PR corridors with negligible volume.",
      status: "draft",
    },
    {
      id: "av-t5",
      domain: "AI readiness",
      statement: null,
      confidence: null,
      falsifier: "If AI ops pilots show no measurable dispatch reliability or cost delta after 24 months.",
      status: "empty",
    },
  ],
  scenarios: [
    {
      id: "av-a",
      name: "OEM dual oligopoly holds",
      politics: "Certification politics and industrial policy favor continuity.",
      techMayAccelerate: "Composite/production digital twins cut delays slowly.",
      unlikelyFast: "COMAC displacing Western OEM on Western airline fleets inside 5 years.",
    },
    {
      id: "av-b",
      name: "Connectivity arms race",
      politics: "Passenger expectations force fleet retrofits.",
      techMayAccelerate: "Starlink-class and competitors race on latency/cost.",
      unlikelyFast: "Universal free high-speed IFC without yield or premium packaging.",
    },
    {
      id: "av-c",
      name: "AI ops winners",
      politics: "Labor rules shape how fast AI rostering/maintenance scale.",
      techMayAccelerate: "Predictive maintenance cuts AOGs for early adopters.",
      unlikelyFast: "Fully autonomous commercial passenger flight this decade.",
    },
  ],
  corpusChecks: [
    {
      id: "oem-filings",
      label: "OEM delivery & backlog public series",
      done: false,
      detail: "Airbus/Boeing monthly/annual + competitor notes",
    },
    {
      id: "satcom-map",
      label: "Satcom / Starlink Aviation carrier list",
      done: false,
      detail: "Announced vs installed — airline press + vendor",
    },
    {
      id: "payments",
      label: "Crypto / alternative payments announcements",
      done: false,
      detail: "Emirates and peers — primary sources only",
    },
    {
      id: "safety",
      label: "Public safety ratings method note",
      done: false,
      detail: "State biases and coverage limits explicitly",
    },
  ],
  openQuestions: [
    "Which airlines have fleet-wide vs trial Starlink-class connectivity, and on which frames?",
    "What is the measured passenger yield from satcom / crypto payment experiments?",
    "How should an AI-readiness index weight ops vs marketing claims?",
    "Post-COVID: who kept capacity discipline vs who is structurally over-levered?",
  ],
  elenchosRefs: [],
  pdfUrl: null,
  notATopicBanner:
    "Thesis-style Research Desk brief (separate from Topics). Multi-source · human-gated claims · not live X scores · not investment advice.",
};

const BRIEFS: ResearchBrief[] = [LEBANON, AVIATION];

export function listResearchBriefs(): ResearchBrief[] {
  return BRIEFS;
}

export type ResearchStyleId = "intel" | "thesis" | "freestyle";

export const RESEARCH_STYLES: {
  id: ResearchStyleId;
  title: string;
  short: string;
  forWhom: string;
  method: string;
  cta: string;
  href?: string;
  hash?: string;
}[] = [
  {
    id: "intel",
    title: "Investigative intelligence",
    short: "Public discourse vs official & media frames",
    forWhom: "Citizens, journalists, operators who need the live pulse",
    method:
      "X-grounded Topics analysis: citizen sample, sentiment, narrative divergence, human-curated insights. Contrasts ordinary speech with official and media messaging.",
    cta: "Open Topics analysis",
    href: "/topics",
  },
  {
    id: "thesis",
    title: "Thesis-style brief",
    short: "Academic / research depth with claims & falsifiers",
    forWhom: "Researchers, analysts, serious readers",
    method:
      "Multi-source corpus (scholarly, official, media, optional discourse). Structured chapters, confidence-rated claims, scenarios, explicit limits. Human review before publish.",
    cta: "Browse case studies",
    hash: "desk-thesis",
  },
  {
    id: "freestyle",
    title: "Free-style · on demand",
    short: "Run the same method on your topic",
    forWhom: "Anyone who wants a structured report on a topic they choose",
    method:
      "You pick topic + report style (Topics analysis or thesis-like). One-time fee. Privacy-first checkout. Same evidence discipline — not a vibes chatbot.",
    cta: "Commission a brief",
    hash: "desk-commission",
  },
];

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
