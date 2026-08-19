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

const AVIATION: ResearchBrief = {
  slug: "aviation-race-digital-ai",
  title:
    "Aviation After Disruption: Airlines, Manufacturers, Innovation Race, and Readiness for Digital & AI Economies",
  subtitle:
    "Who is winning the commercial aviation race after COVID — safety, connectivity (incl. Starlink-class satcom), payments (incl. crypto), and AI readiness",
  status: "published",
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
  updatedAt: "2026-08-15",
  researchQuestion:
    "After COVID-era disruption and recovery, which airlines and manufacturers lead on safety, network strategy, cabin/connectivity innovation (including satellite internet), payment innovation (including crypto), and structural readiness for digital/AI operations — and who is lagging?",
  methodSummary:
    "Thesis-style multi-source brief: industry data and official filings (O), trade/media frames (M), scholarly/ops literature (S), public product announcements (W). Claims require confidence + falsifier. Not investment advice. Not a Topics X pulse. Short PDF v1.0 published with free S+O pack.",
  approach: [
    "Spine: OEM public series, airline recovery KPIs, safety public ratings (with method limits), connectivity rollout maps",
    "Innovation lanes: satcom (Starlink Aviation / competitors), payments (crypto acceptors), AI ops (maintenance, pricing, crew)",
    "Winners/laggards framed as multi-criteria index — not a single stock tip",
    "Human review before publish; free-first collect; empty when thin",
  ],
  sourceClasses: SOURCE_CLASS_LEGEND,
  phases: [
    {
      id: "A",
      label: "Method & corpus",
      status: "done",
      note: "Method locked · free query pack complete under aviation-race-digital-ai",
    },
    {
      id: "B",
      label: "Empirical layers",
      status: "done",
      note: "S 10 OpenAlex queries · O/W 10 seeds · optional M/D packs ready",
    },
    {
      id: "C",
      label: "Synthesis / gaps",
      status: "done",
      note: "SYNTHESIS.md + short PDF v1.0",
    },
    {
      id: "D",
      label: "Claims",
      status: "done",
      note: "T1–T5 human-framed with confidence + falsifiers",
    },
    {
      id: "E",
      label: "Scenarios",
      status: "done",
      note: "OEM oligopoly · connectivity arms race · AI ops winners",
    },
  ],
  chapters: [
    {
      id: "scope",
      number: "1",
      title: "Scope & method",
      status: "ready",
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
      status: "ready",
      summary:
        "Demand collapse, government support, capacity discipline, cargo pivot, then traffic recovery and labor/aircraft bottlenecks.",
    },
    {
      id: "oem",
      number: "3",
      title: "Manufacturers: competition & risks",
      status: "ready",
      summary:
        "Airbus vs Boeing delivery credibility, certification risk, supply chain, China/COMAC wildcard, aftermarket economics.",
    },
    {
      id: "airlines",
      number: "4",
      title: "Airlines: networks, margins, strategy",
      status: "ready",
      summary:
        "Gulf hubs, Asian majors, US majors, European network vs LCC. Who rebuilt networks faster; who over-expanded.",
    },
    {
      id: "innovation",
      number: "5",
      title: "Innovation race: satcom, cabin, payments, AI",
      status: "ready",
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
      status: "ready",
      summary:
        "Transparent multi-criteria scorecard (safety public metrics, balance sheet resilience, connectivity, digital product, AI ops signals). Winners/laggards with falsifiers.",
    },
    {
      id: "scenarios",
      number: "7",
      title: "Risks, threats, opportunities",
      status: "ready",
      summary:
        "Fuel & geopolitics, certification/safety events, climate policy, labor, OEM delays, digital moats.",
    },
  ],
  claimSlots: [
    {
      id: "av-t1",
      domain: "OEM race",
      statement:
        "Airbus retains delivery-credibility advantage in public commercial narratives versus Boeing while certification and production quality remain contested; COMAC is not yet a near-term replacement on most Western airline fleets.",
      confidence: "medium",
      falsifier:
        "If Boeing delivery reliability and certification confidence reverse Airbus share trends without subsidy distortion — or COMAC places large Western-regulated fleets within 5 years.",
      status: "ready",
    },
    {
      id: "av-t2",
      domain: "Gulf long-haul",
      statement:
        "Gulf hub carriers remain structurally competitive on long-haul transfer product and network design; competitive pressure comes from Asian hubs and network rewiring, not from hub disappearance.",
      confidence: "medium",
      falsifier: "If Gulf hubs lose transfer share to secondary Asian hubs on identical long-haul O&D.",
      status: "ready",
    },
    {
      id: "av-t3",
      domain: "Connectivity",
      statement:
        "Satellite high-throughput internet (incl. Starlink Aviation class) is becoming a competitive cabin differentiator; rollout remains uneven by airline and aircraft.",
      confidence: "medium",
      falsifier: "If major carriers abandon satcom pilots for cost without passenger yield response.",
      status: "ready",
    },
    {
      id: "av-t4",
      domain: "Payments",
      statement:
        "Select premium carriers (e.g. Emirates announcements on crypto payment rails) test alternative payment acceptance; this is not yet industry standard.",
      confidence: "medium",
      falsifier: "If crypto checkout is withdrawn or limited to PR corridors with negligible volume.",
      status: "ready",
    },
    {
      id: "av-t5",
      domain: "AI readiness",
      statement:
        "AI readiness is best scored on ops metrics (maintenance AOG reduction, pricing discipline, rostering stability) rather than marketing language; early adopters may gain reliability edges, but evidence remains uneven across carriers.",
      confidence: "medium",
      falsifier: "If AI ops pilots show no measurable dispatch reliability or cost delta after 24 months.",
      status: "ready",
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
      done: true,
      detail: "Airbus/Boeing public hubs + OpenAlex OEM queries (S2–S3, S10) in free pack",
    },
    {
      id: "satcom-map",
      label: "Satcom / Starlink Aviation carrier list",
      done: true,
      detail: "Starlink Aviation product seed + satcom scholarly queries + GDELT M pack",
    },
    {
      id: "payments",
      label: "Crypto / alternative payments announcements",
      done: true,
      detail: "Scholarly S8 + GDELT M6 + Emirates media centre seed (W — primary announcements)",
    },
    {
      id: "safety",
      label: "Public safety ratings method note",
      done: true,
      detail: "ICAO / EASA / FAA seeds + S4; method biases stated in short PDF",
    },
  ],
  openQuestions: [
    "Which airlines have fleet-wide vs trial Starlink-class connectivity, and on which frames?",
    "What is the measured passenger yield from satcom / crypto payment experiments?",
    "How should an AI-readiness index weight ops vs marketing claims?",
    "Post-COVID: who kept capacity discipline vs who is structurally over-levered?",
  ],
  elenchosRefs: [],
  pdfUrl: "/reports/aviation-race-digital-ai-thesis-brief.pdf",
  notATopicBanner:
    "Thesis-style Research Desk brief (separate from Topics). Multi-source · human-gated claims · not live X scores · not investment advice.",
};

const BRIEFS: ResearchBrief[] = [AVIATION];

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
      "X-grounded topic analysis in the Library: citizen sample, sentiment, narrative divergence, human-curated insights. Contrasts ordinary speech with official and media messaging.",
    cta: "Open Library topics",
    href: "/research/library?section=topics",
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
