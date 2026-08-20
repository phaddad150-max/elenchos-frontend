/**
 * Aviation deep-dive intelligence pack — free public sources for /research-aviation.
 * Not investment advice. Announcements ≠ fleet-wide install. Safety metrics have method bias.
 */

export type SourceRef = { id: string; label: string; url: string; note?: string };

export const AVIATION_SOURCES: SourceRef[] = [
  {
    id: "iata-econ",
    label: "IATA — industry economics / statistics",
    url: "https://www.iata.org/en/publications/economics/",
    note: "Industry RPK/ASK, yields, cost pressure — re-check latest release.",
  },
  {
    id: "icao-safety",
    label: "ICAO — safety",
    url: "https://www.icao.int/safety/Pages/default.aspx",
  },
  {
    id: "easa",
    label: "EASA — European aviation safety",
    url: "https://www.easa.europa.eu/en",
  },
  {
    id: "faa-safety",
    label: "FAA — safety",
    url: "https://www.faa.gov/safety",
  },
  {
    id: "airbus-commercial",
    label: "Airbus — commercial aircraft",
    url: "https://www.airbus.com/en/products-services/commercial-aircraft",
    note: "Company source (W) — triangulate with independent series.",
  },
  {
    id: "boeing-commercial",
    label: "Boeing — commercial airplanes",
    url: "https://www.boeing.com/commercial/",
    note: "Company source (W).",
  },
  {
    id: "starlink-aviation",
    label: "Starlink Aviation product",
    url: "https://www.starlink.com/business/aviation",
    note: "Vendor product page — not installed base census.",
  },
  {
    id: "emirates-media",
    label: "Emirates media centre",
    url: "https://www.emirates.com/media-centre/",
    note: "Carrier announcements (connectivity, payments).",
  },
  {
    id: "ec-air",
    label: "European Commission — air transport",
    url: "https://transport.ec.europa.eu/transport-modes/air_en",
  },
];

export const HOOK_HEADLINE =
  "After COVID, the aviation race is not only seats — it is delivery trust, cabin bandwidth, and who can actually run AI ops.";

export const HOOK_SUB =
  "Commercial passenger spine · OEMs · network carriers · LCC · satcom · payments · AI readiness. Free open sources. Interactive under 10 minutes. Not investment advice.";

/** One-screen thesis for Library cards + case_study_snapshots.summary */
export const EXECUTIVE_SUMMARY =
  "Post-2020 aviation competition shifted from filling seats to three harder races: which OEM can deliver aircraft on trust, which networks win cabin connectivity (Starlink-class vs legacy IFC), and which operators can turn AI into measurable ops KPIs (AOG, pricing, rostering) — not slogans. This brief maps OEMs, carriers, innovation lanes, and falsifiable claims from free public sources.";

/** Deep-dive section teasers (also stored on case_study_snapshots.subheadlines) */
export const SUBHEADLINES: { id: string; title: string; blurb: string }[] = [
  {
    id: "shock",
    title: "Shock & uneven recovery",
    blurb: "2020 collapse → cargo masks → labor and airframe bottlenecks; traffic rebuild ≠ margin rebuild.",
  },
  {
    id: "oem",
    title: "OEM delivery trust",
    blurb: "Airbus vs Boeing: backlog credibility, certification risk, and industrial rate limits.",
  },
  {
    id: "networks",
    title: "Network & product race",
    blurb: "Hub carriers and LCCs compete on network design and cabin product — not seat cost alone.",
  },
  {
    id: "cabin",
    title: "Cabin bandwidth",
    blurb: "Starlink Aviation-class deals ≠ fleet-wide install; announced IFC ≠ every frame connected.",
  },
  {
    id: "ai-ops",
    title: "Who can run AI ops",
    blurb: "Score AOG hours, dynamic pricing, and rostering stability — ignore ‘AI airline’ press releases.",
  },
  {
    id: "claims",
    title: "Claims you can falsify",
    blurb: "Every thesis has a kill-switch: delivery slips, IFC install rates, or ops KPIs that don’t move.",
  },
];

/** Stable slug for case_study_snapshots.case_slug */
export const CASE_SLUG = "aviation-race-digital-ai";

export const HOOK_KPIS: {
  label: string;
  value: string;
  sub: string;
  tone: "cyan" | "amber" | "emerald" | "rose";
}[] = [
  {
    label: "Shock window",
    value: "2020+",
    sub: "Demand collapse → uneven recovery",
    tone: "rose",
  },
  {
    label: "OEM spine",
    value: "2",
    sub: "Western dual oligopoly (Airbus · Boeing)",
    tone: "amber",
  },
  {
    label: "Cabin race",
    value: "Satcom",
    sub: "Starlink-class vs legacy IFC — uneven install",
    tone: "cyan",
  },
  {
    label: "AI score",
    value: "Ops KPIs",
    sub: "Not slogans — AOG · pricing · rostering",
    tone: "emerald",
  },
];

export const CHAPTERS: { id: string; n: string; title: string; seconds: string }[] = [
  { id: "shock", n: "01", title: "Shock & recovery", seconds: "~90s" },
  { id: "oem", n: "02", title: "OEM race", seconds: "~90s" },
  { id: "networks", n: "03", title: "Networks", seconds: "~90s" },
  { id: "innovation", n: "04", title: "Innovation lanes", seconds: "~2m" },
  { id: "index", n: "05", title: "Readiness index", seconds: "~90s" },
  { id: "claims", n: "06", title: "Claims", seconds: "~90s" },
  { id: "scenarios", n: "07", title: "Scenarios", seconds: "~60s" },
];

/** Directional industry traffic recovery (order-of-magnitude public narrative). */
export const TRAFFIC_RECOVERY: { year: string; label: string; score: number; note: string }[] = [
  { year: "2019", label: "Pre-shock baseline", score: 100, note: "Reference year for many series" },
  { year: "2020", label: "Collapse", score: 34, note: "Passenger demand crater; cargo held some systems up" },
  { year: "2021", label: "Partial reopen", score: 48, note: "Domestic first; long-haul lag" },
  { year: "2022", label: "Re-acceleration", score: 72, note: "Labor + aircraft bottlenecks appear" },
  { year: "2023", label: "Near-rebuild", score: 88, note: "Traffic ≠ sustainable margin everywhere" },
  { year: "2024–25", label: "Normalize uneven", score: 96, note: "Winners: capacity discipline + product" },
];

export const OEM_COMPARE: {
  id: string;
  name: string;
  edge: string;
  risk: string;
  score: number;
  tone: "cyan" | "amber" | "emerald" | "rose";
}[] = [
  {
    id: "airbus",
    name: "Airbus",
    edge: "Delivery credibility narrative · A320 family backlog depth",
    risk: "Supply-chain rate limits · industrial concentration",
    score: 78,
    tone: "emerald",
  },
  {
    id: "boeing",
    name: "Boeing",
    edge: "Installed base · aftermarket · US industrial weight",
    risk: "Certification / quality trust · production recovery pace",
    score: 52,
    tone: "amber",
  },
  {
    id: "comac",
    name: "COMAC",
    edge: "State backing · domestic Chinese demand path",
    risk: "Western certification wall · global support network",
    score: 28,
    tone: "rose",
  },
];

export const NETWORK_CARDS: {
  id: string;
  name: string;
  short: string;
  body: string;
  pressure: "critical" | "high" | "elevated" | "stable";
}[] = [
  {
    id: "gulf",
    name: "Gulf hubs",
    short: "Emirates · Qatar · Etihad",
    body: "Transfer product + long-haul density. Compete on network design and cabin product, not seat cost alone.",
    pressure: "high",
  },
  {
    id: "us-majors",
    name: "US majors",
    short: "Network + domestic core",
    body: "Scale and fortress hubs. Labor and aircraft availability bind growth more than pure demand.",
    pressure: "elevated",
  },
  {
    id: "eu-network",
    name: "European network",
    short: "Full-service + slots",
    body: "Slot politics, climate policy cost, and LCC flank pressure. Recovery quality varies by balance sheet.",
    pressure: "high",
  },
  {
    id: "lcc",
    name: "LCC / ultra-LCC",
    short: "Point-to-point machines",
    body: "Cost leadership when fuel and labor allow. Over-expansion is the classic failure mode.",
    pressure: "elevated",
  },
  {
    id: "asia",
    name: "Asian majors",
    short: "Long-haul rebuild",
    body: "China reopening and secondary hubs reshape transfer competition with Gulf and Europe.",
    pressure: "high",
  },
  {
    id: "cargo",
    name: "Cargo overlay",
    short: "Belly + freighter",
    body: "COVID cargo profits masked passenger collapse for some systems — not a permanent moat.",
    pressure: "stable",
  },
];

export const INNOVATION_LANES: {
  id: string;
  title: string;
  status: string;
  body: string;
  watch: string;
  tone: "cyan" | "amber" | "emerald" | "rose";
}[] = [
  {
    id: "satcom",
    title: "Satcom / high-throughput IFC",
    status: "Arms race",
    body: "Starlink Aviation-class and competitors sell low-latency cabin internet. Announced airline deals ≠ fleet-wide install on every frame.",
    watch: "Trial vs partial vs fleet · passenger yield · retrofit cost",
    tone: "cyan",
  },
  {
    id: "cabin",
    title: "Cabin product",
    status: "Premium fight",
    body: "Premium long-haul still sells seats with space, service, and entertainment — connectivity is the new table stakes layer.",
    watch: "Retrofit cycles · aircraft availability",
    tone: "emerald",
  },
  {
    id: "payments",
    title: "Payments innovation",
    status: "Experimental",
    body: "Select premium carriers test alternative rails (including crypto acceptance announcements). Volume and corridor limits are often opaque.",
    watch: "Withdrawal risk · partner rails · real take-rate",
    tone: "amber",
  },
  {
    id: "ai",
    title: "AI ops",
    status: "KPI or hype",
    body: "Credible lanes: predictive maintenance, dynamic pricing discipline, crew rostering. Marketing “AI airline” without dispatch metrics is weak evidence.",
    watch: "AOG hours · cancellation rate · cost per ASK",
    tone: "rose",
  },
];

/** Interactive readiness scorecard — directional multi-criteria, not stock ratings. */
export const READINESS_ROWS: {
  id: string;
  name: string;
  type: "OEM" | "Carrier";
  safety: number;
  balance: number;
  connectivity: number;
  digital: number;
  aiOps: number;
  note: string;
}[] = [
  {
    id: "airbus",
    name: "Airbus",
    type: "OEM",
    safety: 72,
    balance: 74,
    connectivity: 40,
    digital: 55,
    aiOps: 58,
    note: "OEM scores weight delivery trust + industrial digital twins, not cabin IFC.",
  },
  {
    id: "boeing",
    name: "Boeing",
    type: "OEM",
    safety: 48,
    balance: 52,
    connectivity: 38,
    digital: 50,
    aiOps: 54,
    note: "Public trust drag on certification/production still dominates narrative.",
  },
  {
    id: "emirates",
    name: "Emirates-class hub",
    type: "Carrier",
    safety: 78,
    balance: 80,
    connectivity: 82,
    digital: 76,
    aiOps: 62,
    note: "Illustrative premium hub profile — product + network strength.",
  },
  {
    id: "us-major",
    name: "US major network",
    type: "Carrier",
    safety: 74,
    balance: 70,
    connectivity: 58,
    digital: 64,
    aiOps: 60,
    note: "Scale advantage; IFC and AI ops uneven by fleet.",
  },
  {
    id: "eu-lcc",
    name: "EU LCC machine",
    type: "Carrier",
    safety: 70,
    balance: 66,
    connectivity: 42,
    digital: 58,
    aiOps: 52,
    note: "Cost first; cabin connectivity often secondary product.",
  },
];

export const CLAIMS: {
  id: string;
  domain: string;
  statement: string;
  confidence: "high" | "medium" | "low";
  falsifier: string;
}[] = [
  {
    id: "t1",
    domain: "OEM race",
    statement:
      "Airbus retains delivery-credibility advantage in public commercial narratives versus Boeing while certification and production quality remain contested; COMAC is not yet a near-term replacement on most Western airline fleets.",
    confidence: "medium",
    falsifier:
      "Boeing delivery reliability and certification confidence reverse share trends without subsidy distortion — or COMAC places large Western-regulated fleets within 5 years.",
  },
  {
    id: "t2",
    domain: "Gulf long-haul",
    statement:
      "Gulf hub carriers remain structurally competitive on long-haul transfer product and network design; competitive pressure comes from Asian hubs and network rewiring, not from hub disappearance.",
    confidence: "medium",
    falsifier: "Gulf hubs lose transfer share to secondary Asian hubs on identical long-haul O&D.",
  },
  {
    id: "t3",
    domain: "Connectivity",
    statement:
      "Satellite high-throughput internet (incl. Starlink Aviation class) is becoming a competitive cabin differentiator; rollout remains uneven by airline and aircraft.",
    confidence: "medium",
    falsifier: "Major carriers abandon satcom pilots for cost without passenger yield response.",
  },
  {
    id: "t4",
    domain: "Payments",
    statement:
      "Select premium carriers test alternative payment acceptance (incl. crypto rails in announcements); this is not yet industry standard.",
    confidence: "medium",
    falsifier: "Crypto checkout is withdrawn or limited to PR corridors with negligible volume.",
  },
  {
    id: "t5",
    domain: "AI readiness",
    statement:
      "AI readiness is best scored on ops metrics (AOG reduction, pricing discipline, rostering stability) rather than marketing language; evidence remains uneven across carriers.",
    confidence: "medium",
    falsifier: "AI ops pilots show no measurable dispatch reliability or cost delta after 24 months.",
  },
];

export const SCENARIOS: {
  id: string;
  name: string;
  politics: string;
  tech: string;
  unlikely: string;
}[] = [
  {
    id: "a",
    name: "OEM dual oligopoly holds",
    politics: "Certification politics and industrial policy favor continuity.",
    tech: "Digital twins cut production delays slowly.",
    unlikely: "COMAC displacing Western OEM on Western fleets inside 5 years.",
  },
  {
    id: "b",
    name: "Connectivity arms race",
    politics: "Passenger expectations force fleet retrofits.",
    tech: "Starlink-class and rivals race on latency/cost.",
    unlikely: "Universal free high-speed IFC without yield packaging.",
  },
  {
    id: "c",
    name: "AI ops winners",
    politics: "Labor rules shape how fast AI rostering/maintenance scale.",
    tech: "Predictive maintenance cuts AOGs for early adopters.",
    unlikely: "Fully autonomous commercial passenger flight this decade.",
  },
];

export const TIMELINE: { year: string; title: string; body: string }[] = [
  {
    year: "2019",
    title: "Pre-shock peak system",
    body: "Record traffic era; OEM dual oligopoly entrenched; IFC still mostly legacy air-to-ground / older satcom.",
  },
  {
    year: "2020–21",
    title: "Collapse & bailouts",
    body: "Passenger demand crater; governments backstop majors; cargo becomes a lifeline for some networks.",
  },
  {
    year: "2022–23",
    title: "Reopen stress",
    body: "Traffic returns faster than aircraft, pilots, and MRO capacity — delays and labor fights define the recovery.",
  },
  {
    year: "2023–25",
    title: "Product race restarts",
    body: "Cabin and satcom announcements accelerate; OEM delivery trust becomes the industrial story; AI ops marketing floods the tape.",
  },
  {
    year: "Now",
    title: "Score the install base",
    body: "Winners will show installed connectivity, certified production stability, and ops KPIs — not only press releases.",
  },
];

export const X_THREAD_DRAFT = [
  "1/ After COVID, aviation isn’t only “seats back.” It’s who can deliver aircraft, who owns cabin bandwidth, and who runs AI on ops metrics — not slogans. Deep dive: elenchos.live/research-aviation",
  "2/ OEM dual oligopoly still rules the West. Delivery credibility is a strategic asset. COMAC is a horizon risk, not a 5-year Western fleet swap. Not investment advice.",
  "3/ Starlink-class satcom + experimental payments + AI maintenance: announcement ≠ fleet install. Score install base and AOG hours. Full interactive brief on Elenchos.",
];

export const METHOD_RAILS =
  "A · Industry stats (IATA / public series) · B · Power (OEM · regulators · hubs) · C · Product race (satcom · payments · AI ops). Company pages are W (announcements). Safety indices need method limits every time.";
