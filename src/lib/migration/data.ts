/**
 * Irregular migration intelligence — free open-data pack for /research-migration.
 * Every quantitative figure carries a source URL. Detections ≠ unique persons.
 * Scope: EU external borders + UK Channel · history from 2011 (Syrian war era).
 */

export type SourceRef = { id: string; label: string; url: string; note?: string };

export const MIGRATION_SOURCES: SourceRef[] = [
  {
    id: "frontex-2025",
    label: "Frontex — irregular crossings 2025 (preliminary)",
    url: "https://www.frontex.europa.eu/media-centre/news/news-release/frontex-irregular-border-crossings-down-26-in-2025-europe-must-stay-prepared-lyKpVb",
    note: "Detections at EU external borders; same person may be counted more than once.",
  },
  {
    id: "frontex-2024",
    label: "Frontex — irregular crossings 2024",
    url: "https://www.frontex.europa.eu/media-centre/news/news-release/irregular-border-crossings-into-eu-drop-sharply-in-2024-oqpweX",
  },
  {
    id: "frontex-map",
    label: "Frontex migratory map / FRAN–JORA detections",
    url: "https://www.frontex.europa.eu/along-eu-borders/migratory-map/",
  },
  {
    id: "uk-home-office",
    label: "UK Home Office — small boat statistics",
    url: "https://www.gov.uk/government/collections/immigration-statistics-quarterly-release",
  },
  {
    id: "iom-missing",
    label: "IOM Missing Migrants Project",
    url: "https://missingmigrants.iom.int/",
  },
  {
    id: "eu-turkey-2016",
    label: "EU–Turkey Statement (18 March 2016)",
    url: "https://www.consilium.europa.eu/en/press/press-releases/2016/03/18/eu-turkey-statement/",
  },
];

/**
 * EU external-border illegal/irregular border-crossing detections (approx. public totals).
 * IMPORTANT: these are detection *events* in a calendar year — not unique people,
 * not the stock of irregular residents, and not a multi-year cumulative total.
 * Same person may be counted more than once (Frontex FRAN/JORA).
 */
export const EU_IBC_SERIES: { year: number; detections: number; note?: string }[] = [
  { year: 2011, detections: 141_000, note: "Order of magnitude pre-crisis baseline (public series)" },
  { year: 2014, detections: 283_000 },
  { year: 2015, detections: 1_822_000, note: "Single-year crisis peak after Syria war escalation — NOT the multi-year total" },
  { year: 2016, detections: 511_000 },
  { year: 2019, detections: 142_000 },
  { year: 2021, detections: 200_000, note: "~199.9k reported" },
  { year: 2022, detections: 330_000 },
  { year: 2023, detections: 380_000, note: "Frontex: +17% vs 2022" },
  { year: 2024, detections: 239_000, note: "Frontex: −38% vs 2023 (order of magnitude)" },
  { year: 2025, detections: 178_000, note: "Frontex preliminary: −26% vs 2024; lowest since 2021" },
];

/** Sum of the published series years above (incomplete years omitted — still multi-million). */
export const EU_IBC_SERIES_SUM = EU_IBC_SERIES.reduce((s, r) => s + r.detections, 0);

/**
 * Why citizen / X discourse often rejects “only 1.8–2M”.
 * Use as counter-rail next to Frontex year charts — not a substitute series.
 */
export const SCALE_DISCREPANCY_RAIL: {
  title: string;
  officialClaim: string;
  citizenClaim: string;
  whyBothCanBeTrue: string[];
  xUse: string;
  falsifier: string;
} = {
  title: "Why X says ‘far more than 1.8–2M’ — and what the chart actually is",
  officialClaim:
    "~1.8M is the Frontex-linked peak for detections in the single year 2015 at EU external borders.",
  citizenClaim:
    "Public discourse on X often treats 1.8–2M as if it were the whole crisis — then correctly notes multi-year pressure, secondary movements, and stock effects feel far larger.",
  whyBothCanBeTrue: [
    "Peak year ≠ cumulative: summing published detection years already exceeds ~4M events in this incomplete series alone (missing several years).",
    "Detections ≠ unique persons: the same person can be counted on multiple attempts or corridors.",
    "Flow ≠ stock: people who entered earlier and stayed (asylum backlog, absconding, secondary movement) are not the annual detection number.",
    "UK Channel + national landing stats are separate products — not inside the Frontex external-border peak figure.",
    "US CBP encounter totals are a different geography — mixing them into an EU ‘2M’ meme confuses the ledger.",
    "Undetected crossings and inland discovery are under-counted in external-border detection charts by design.",
  ],
  xUse:
    "When X samples are selected for this brief, use them to surface how citizens talk about scale (cumulative, stock, crime, speech) and to flag when official messaging cites only the softest year or only the peak-year slogan. Do not invent a fake cumulative ‘official total’ — demand corridor-year ledgers.",
  falsifier:
    "If a public EU ledger publishes unique-person estimates + multi-year corridor-matched returns beside detections, update the hook KPIs to that ledger and retire the discrepancy rail for that claim.",
};

export const CORRIDORS: {
  id: string;
  name: string;
  short: string;
  role: string;
  risk: "critical" | "high" | "elevated";
}[] = [
  {
    id: "eastern-med",
    name: "Eastern Mediterranean",
    short: "Turkey → Greece / islands",
    role: "Primary bridge after Syrian war; EU–Turkey deal era still shapes leverage.",
    risk: "critical",
  },
  {
    id: "central-med",
    name: "Central Mediterranean",
    short: "N. Africa → Italy / Malta",
    role: "High fatality risk; smuggling economics; NGO–state legal fights.",
    risk: "critical",
  },
  {
    id: "western-balkans",
    name: "Western Balkans",
    short: "Land secondary movements",
    role: "Secondary routes after island/land entry; pressure on Schengen internals.",
    risk: "high",
  },
  {
    id: "western-med",
    name: "Western Mediterranean / Atlantic",
    short: "Morocco → Spain / Canary",
    role: "Atlantic Canary path spikes; Spanish–Morocco dynamics.",
    risk: "high",
  },
  {
    id: "channel",
    name: "English Channel",
    short: "France → UK small boats",
    role: "UK national flashpoint; criminal gangs; speech vs enforcement politics.",
    risk: "critical",
  },
];

export const TIMELINE: { year: string; title: string; body: string }[] = [
  {
    year: "2011+",
    title: "Syrian war & regional shock",
    body: "War and collapse push millions toward Turkey and onward routes. Irregular pressure on the EU rises for years before the 2015 peak.",
  },
  {
    year: "2015",
    title: "Crisis peak (single year)",
    body: "Frontex-linked public series show ~1.8 million illegal border-crossing detections in 2015 alone — the peak year that redefined European politics. Multi-year pressure is larger; see the scale discrepancy rail.",
  },
  {
    year: "2016",
    title: "EU–Turkey Statement",
    body: "Deal logic: money, relocation, and returns in exchange for reduced flows. Transit states learn Europe can be leveraged.",
  },
  {
    year: "2016–2020",
    title: "Hotspots, secondary movements, legal fights",
    body: "Dublin stress, national border controls return in practice, courts and NGOs shape what removals are possible.",
  },
  {
    year: "2021–2023",
    title: "Re-acceleration",
    body: "Post-COVID rebound; 2023 detections ~380k — still far below 2015 but high enough to harden public anger.",
  },
  {
    year: "2024–2025",
    title: "Detections fall — pressure remains",
    body: "Frontex: ~239k (2024), ~178k (2025). Lower crossings ≠ resolved security, cohesion, or free-speech double standards.",
  },
];

export const ORIGINS_NOTE =
  "Top nationalities shift by year and corridor (Syria, Afghanistan, Tunisia, Egypt, Türkiye, Bangladesh, etc.). Always check the latest Frontex FRAN/JORA release — do not treat a static list as eternal.";

export type ActorCard = {
  id: string;
  name: string;
  role: string;
  incentive: string;
  citizenImpact: string;
  openQuestion: string;
};

export const ACTORS: ActorCard[] = [
  {
    id: "turkey",
    name: "Turkey",
    role: "Host + transit + deal partner on the Eastern Med bridge.",
    incentive: "Leverage EU money and politics; manage domestic load; border as bargaining chip.",
    citizenImpact: "Flow volumes into Greece/EU track Ankara–Brussels dynamics as much as war alone.",
    openQuestion: "How much of reduced crossings is enforcement vs displacement to other routes?",
  },
  {
    id: "iran",
    name: "Iran",
    role: "Origin/transit node in regional displacement systems.",
    incentive: "Regime survival; export instability costs; limited cooperation with West.",
    citizenImpact: "Afghans and others move through Iranian space toward Turkey/EU corridors.",
    openQuestion: "Which volume spikes are war-driven vs policy-driven?",
  },
  {
    id: "afghanistan",
    name: "Afghanistan",
    role: "Major origin after decades of war and 2021 collapse.",
    incentive: "Exit pressure under Taliban rule; diaspora pull factors in Europe.",
    citizenImpact: "Sustained irregular attempts via Iran–Turkey and other paths.",
    openQuestion: "What share of claims are protection-genuine vs economic secondary movement?",
  },
  {
    id: "pakistan",
    name: "Pakistan",
    role: "Origin and transit in South Asia–Iran–Turkey chains.",
    incentive: "Remittances, smuggling economies, bilateral deals with Europe.",
    citizenImpact: "Visible nationality in several Frontex yearly tops — varies by year.",
    openQuestion: "Readmission cooperation vs actual returns executed.",
  },
  {
    id: "qatar",
    name: "Qatar",
    role: "Gulf diplomacy/aid soft power (not a primary land corridor).",
    incentive: "Regional influence; mediation brands; investment politics.",
    citizenImpact: "Indirect — funding and diplomacy, not boat logistics.",
    openQuestion: "Where public money trails intersect migration politics (evidence only).",
  },
  {
    id: "eu",
    name: "EU institutions",
    role: "Asylum pact, funding, external deals, free-movement rules under stress.",
    incentive: "Manage optics, member splits, legal baseline that limits hard removal.",
    citizenImpact: "Citizens experience non-enforcement + speech chill as elite betrayal.",
    openQuestion: "Can the Pact deliver returns at scale without political collapse?",
  },
  {
    id: "uk",
    name: "United Kingdom",
    role: "Channel small-boat destination after EU exit.",
    incentive: "Domestic politics of boats vs legal/ECHR constraints.",
    citizenImpact: "Boats became a daily security and trust issue.",
    openQuestion: "What combination of France ops + removals actually cuts crossings?",
  },
  {
    id: "media-ngo-law",
    name: "Media · NGOs · courts",
    role: "Frame language, sea/land facilitation debates, blocking removals, speech cases.",
    incentive: "Mission, funding, legal doctrine, status among elites.",
    citizenImpact: "Illegal entry normalized in speech; criticism often moralized or policed.",
    openQuestion: "Where does humanitarian law end and policy capture begin?",
  },
];

export const SCENARIOS: {
  id: string;
  name: string;
  border: string;
  security: string;
  speech: string;
  politics: string;
}[] = [
  {
    id: "s1",
    name: "Status quo",
    border: "Detections oscillate; smugglers adapt corridors.",
    security: "Residual terror/crime cases + local cohesion stress continue unevenly.",
    speech: "Speech chill stays or hardens in parts of Europe.",
    politics: "Trust in institutions keeps eroding; populist–elite clash intensifies.",
  },
  {
    id: "s2",
    name: "Soft enforcement only",
    border: "More process, limited returns — queues replace deterrence.",
    security: "Secondary movements and absconding remain.",
    speech: "Elite messaging softens language without restoring control.",
    politics: "Public sees theater; demand for hard reverse grows.",
  },
  {
    id: "s3",
    name: "Hard reverse",
    border: "External processing, rapid removal capacity, gang priority.",
    security: "Deterrence can cut crossings (as 2024–25 drops show pressure is policy-sensitive).",
    speech: "Room reopens to debate crime and borders without criminalizing dissent.",
    politics: "Legal and diplomatic fights peak — but citizen trust can recover if results show.",
  },
];

export const REMEDIES: { ask: string; feasibility: string; note: string }[] = [
  {
    ask: "Treat illegal entry as enforced offence + prioritise removals",
    feasibility: "Medium–hard (courts, capacity, origin deals)",
    note: "Citizens have asked for years; capacity and readmission are the bottlenecks.",
  },
  {
    ask: "External processing / safe-third arrangements",
    feasibility: "Hard legally; high political signal",
    note: "UK Rwanda-class fights show legal veto points.",
  },
  {
    ask: "Audit NGO funding where facilitation is contested",
    feasibility: "Medium (transparency laws)",
    note: "Distinguish rescue obligations from open-route incentives.",
  },
  {
    ask: "Restore free debate — stop criminalising peaceful dissent on migration",
    feasibility: "Political + legislative",
    note: "Double standard: normalising illegal entry while policing speech is a legitimacy crisis.",
  },
  {
    ask: "Target smuggling networks as organized crime",
    feasibility: "High consensus, execution varies",
    note: "Cross-border police work; not a substitute for removal capacity.",
  },
];

/** 10-second hook — era first, then scale (ordinary people remember the arc) */
export const HOOK_KPIS: {
  label: string;
  value: string;
  sub: string;
  tone: "rose" | "amber" | "cyan" | "emerald";
}[] = [
  {
    label: "Since",
    value: "2011",
    sub: "Syrian war era → continuous political crisis",
    tone: "emerald",
  },
  {
    label: "2015 peak year",
    value: "~1.8M",
    sub: "One year of detections — not the multi-year total",
    tone: "rose",
  },
  {
    label: "Series sum (listed years)",
    value: `~${(EU_IBC_SERIES_SUM / 1_000_000).toFixed(1)}M`,
    sub: "Detection events across published years in this brief (incomplete; still multi-million)",
    tone: "amber",
  },
  {
    label: "2025 detections",
    value: "~178k",
    sub: "Down sharply — problem not “over”",
    tone: "cyan",
  },
];

/** Frontline pressure — schematic, route-linked (not a full league table) */
export const FRONTLINE_STATES: {
  code: string;
  name: string;
  role: string;
  pressure: "critical" | "high" | "elevated";
}[] = [
  { code: "GR", name: "Greece", role: "Eastern Med islands / land — first EU door after Turkey", pressure: "critical" },
  { code: "IT", name: "Italy", role: "Central Med landings — high volume + fatality risk", pressure: "critical" },
  { code: "ES", name: "Spain", role: "Western Med + Canary Atlantic path", pressure: "high" },
  { code: "UK", name: "United Kingdom", role: "Channel small boats — political flashpoint", pressure: "critical" },
  { code: "CY", name: "Cyprus", role: "Eastern Med pressure relative to size", pressure: "high" },
  { code: "MT", name: "Malta", role: "Central Med SAR / disembarkation stress", pressure: "elevated" },
  { code: "BG", name: "Bulgaria", role: "Land external border + secondary routes", pressure: "elevated" },
  { code: "FR", name: "France", role: "Channel staging + secondary movements", pressure: "high" },
];

/** Policy archetypes — dated examples, not moral scorecards */
export const POLICY_STANCE: {
  stance: "resist" | "open" | "mixed";
  title: string;
  examples: { place: string; note: string }[];
}[] = [
  {
    stance: "resist",
    title: "Harder external control / national pushback",
    examples: [
      { place: "Hungary / parts of CEE", note: "Border barrier politics; refusal of relocation quotas as sovereignty frame." },
      { place: "Poland (selected eras)", note: "Eastern land border crisis response; security-first messaging." },
      { place: "Italy (selected eras)", note: "Naval/NGO rules + Albania-type external processing attempts — contested in courts." },
      { place: "Greece (selected ops)", note: "Evros fence / pushback allegations vs deterrence — both claimed; document both rails." },
      { place: "UK", note: "Small-boat criminal focus + external processing attempts (legal veto points)." },
    ],
  },
  {
    stance: "open",
    title: "Magnet / soft-enforcement eras",
    examples: [
      { place: "Germany 2015–16", note: "High intake moment that defined European politics; later partial tightening." },
      { place: "Sweden (pre-tightening eras)", note: "High per-capita asylum reputation; later policy reverse under pressure." },
      { place: "EU institutional baseline", note: "Legal limits on removal + Dublin stress often produce de facto stays." },
      { place: "Selected NGO–route interfaces", note: "Rescue and litigation can be life-saving and still change route incentives — research both." },
    ],
  },
  {
    stance: "mixed",
    title: "Swing / dual track",
    examples: [
      { place: "France", note: "Tough rhetoric + Channel reality; speech and public-order cases in parallel." },
      { place: "Spain", note: "Canary spikes vs Morocco cooperation cycles." },
      { place: "Netherlands / Denmark (eras)", note: "From open reputations toward stricter national packages." },
    ],
  },
];

/** Public discourse themes (citizen language) — X sample depth next when authorized */
export const DISCOURSE_THEMES: { theme: string; note: string }[] = [
  { theme: "Housing & wages", note: "Inflows blamed for rent and low-skill wage pressure in hotspots." },
  { theme: "Crime & two-tier policing", note: "Citizens claim unequal enforcement; needs case-level evidence, not slogans." },
  { theme: "Boats as daily news", note: "Channel / Med landings as proof the state lost control." },
  { theme: "Elite hypocrisy", note: "Private security for elites vs open streets for everyone else." },
  { theme: "Speech chill", note: "Fear of job loss or prosecution for describing illegal entry as crime." },
  { theme: "Cultural cohesion", note: "Parallel societies, no-go claims, school/hospital load — local first." },
];

/**
 * Labeling pattern: enforcement → “racist / far-right” frames.
 * Evidence = discourse pattern + examples to deepen; not a conspiracy dossier.
 */
export const LABELING_PATTERN: {
  claim: string;
  examples: string[];
  falsifier: string;
} = {
  claim:
    "Governments and parties that prioritise border enforcement are routinely framed as racist or far-right by segments of media, NGOs, and international bodies — while illegal entry is softened in language.",
  examples: [
    "CEE barrier policies covered as xenophobia first, capacity/security second.",
    "Italian or Greek deterrence ops described as ‘far right’ even under centrist coalitions.",
    "UK small-boat policy fights moralised as cruelty; gang profits under-emphasised.",
    "Citizens using ‘illegal’ face etiquette policing while unauthorized entry is ‘irregular migration’.",
  ],
  falsifier:
    "If major outlets consistently lead with smuggling economics, removal rates, and citizen security metrics alongside rights language, the ‘one-way moral frame’ claim weakens.",
};

/**
 * Advocacy / funding research lane — public trails only.
 * Open Society and similar: document public grants/missions; do not invent control networks.
 */
export const ADVOCACY_FUNDING_LANE: {
  title: string;
  body: string;
  method: string[];
  falsifier: string;
} = {
  title: "Funding & advocacy networks (open trails)",
  body:
    "Migration litigation, reception, and narrative work is a funded sector. Some foundations (including Open Society network entities and other large philanthropies) publish grants supporting rights, litigation, and media ecosystems. That is researchable. It is not proof of total control of Europe — it is a map of incentives.",
  method: [
    "Start from public grant databases and foundation annual reports.",
    "Map org → grant purpose → country/theme (asylum, detention, speech).",
    "Separate humanitarian rescue from strategic litigation that blocks removals.",
    "Never substitute funder maps for Frontex detection numbers.",
  ],
  falsifier:
    "If grant trails show no material link to policy outcomes in a given country-year, drop the causal claim for that cell.",
};

/** Interactive map nodes — schematic; figures are qualitative or order-of-magnitude public signals */
export type EntryPoint = {
  id: string;
  name: string;
  shortLabel: string;
  corridor: string;
  role: string;
  risk: "critical" | "high" | "elevated";
  /** SVG coordinates on 400×280 map */
  x: number;
  y: number;
  svgPath: string;
  entriesNote: string;
  returnsNote: string;
  honesty: string;
  destinations?: string[];
};

export const ENTRY_POINTS: EntryPoint[] = [
  {
    id: "aegean",
    name: "Aegean islands / Eastern Med",
    shortLabel: "Aegean",
    corridor: "Eastern Mediterranean",
    role: "Sea crossing TR → GR islands; historic 2015 peak corridor; still active at lower volume.",
    risk: "critical",
    x: 275,
    y: 145,
    svgPath: "M310 140 Q290 150 275 145",
    entriesNote: "Major share of 2015 peak; multi-year Frontex Eastern Med detections",
    returnsNote: "EU–Turkey statement era returns/readmissions — incomplete vs politics of the deal",
    honesty: "Deal rhetoric often exceeds transparent, sustained return statistics at scale.",
    destinations: ["Greece", "Secondary Schengen (DE, FR, …)"],
  },
  {
    id: "central-med",
    name: "Central Mediterranean",
    shortLabel: "C. Med",
    corridor: "Central Mediterranean",
    role: "Sea Libya/Tunisia → Italy/Malta; high fatality risk; smuggling + NGO–state legal interface.",
    risk: "critical",
    x: 200,
    y: 175,
    svgPath: "M190 220 Q195 195 200 175",
    entriesNote: "Recurring high detections on Central Med in post-2014 series",
    returnsNote: "Libya/Tunisia return narratives contested; volume often opaque vs landings news",
    honesty: "Daily landing headlines dominate; comparable multi-year return ledgers are thinner in public briefing.",
    destinations: ["Italy", "Malta", "Secondary north"],
  },
  {
    id: "canary",
    name: "Canary / Atlantic",
    shortLabel: "Canary",
    corridor: "Western Africa / Atlantic",
    role: "Atlantic boat route to Spanish Canaries; deadly when active.",
    risk: "high",
    x: 70,
    y: 200,
    svgPath: "M90 235 Q70 220 70 200",
    entriesNote: "Spike years visible in Spanish/Canary public stats",
    returnsNote: "West Africa return cooperation — episodic; not a steady public time series in EU press packs",
    honesty: "Spike coverage ≠ continuous published return counts.",
    destinations: ["Spain (Canary)", "Mainland ES"],
  },
  {
    id: "western-med",
    name: "Western Med / Gibraltar approaches",
    shortLabel: "W. Med",
    corridor: "Western Mediterranean",
    role: "Morocco → Spain land/sea; Ceuta/Melilla pressure points.",
    risk: "high",
    x: 115,
    y: 175,
    svgPath: "M130 210 Q120 190 115 175",
    entriesNote: "Persistent Western Med detections; Spain–Morocco cycle",
    returnsNote: "Officials often cite Morocco cooperation and returns — public granular multi-year return series rarely match the slogan intensity",
    honesty:
      "‘Returned to Morocco’ is a frequent political line. Demand: year-by-year return figures next to year-by-year illegal crossings for the same corridor.",
    destinations: ["Spain", "Secondary FR/EU"],
  },
  {
    id: "balkans",
    name: "Western Balkans land",
    shortLabel: "Balkans",
    corridor: "Western Balkans",
    role: "Land secondary movement after first entry; pressure on Schengen internals.",
    risk: "high",
    x: 245,
    y: 115,
    svgPath: "M270 145 Q255 130 245 115",
    entriesNote: "Strong secondary-route signal in several post-2015 years",
    returnsNote: "Dublin/transfers and national returns — fragmented across states",
    honesty: "Secondary routes make ‘entry = destination’ false; stats must separate first entry vs stay.",
    destinations: ["DE", "FR", "AT", "other Schengen"],
  },
  {
    id: "channel",
    name: "English Channel small boats",
    shortLabel: "Channel",
    corridor: "Channel",
    role: "France → UK small boats; criminal facilitation; high political salience.",
    risk: "critical",
    x: 105,
    y: 70,
    svgPath: "M120 95 Q110 80 105 70",
    entriesNote: "UK Home Office small-boat series (public quarterly)",
    returnsNote: "Returns/removals lag boat arrivals in public debate; external processing attempts legally contested",
    honesty: "Arrivals are daily news; returns are slower, legal-bound, and less transparent as a single EU-style series.",
    destinations: ["United Kingdom"],
  },
  {
    id: "evros",
    name: "Evros / land TR–GR",
    shortLabel: "Evros",
    corridor: "Eastern land",
    role: "Land border fence & pushback allegations vs deterrence claims — dual narratives.",
    risk: "high",
    x: 285,
    y: 125,
    svgPath: "M305 135 Q295 130 285 125",
    entriesNote: "Land detections lower than 2015 sea peak but still strategic",
    returnsNote: "Pushback vs legal return — contested; independent counts incomplete",
    honesty: "Both ‘secure border’ and ‘rights abuse’ claims need primary evidence; neither replaces Frontex series.",
    destinations: ["Greece", "Secondary EU"],
  },
];

export const RETURNS_HONESTY = {
  title: "Crossings vs returns — the missing ledger",
  body: "Political communication often pairs daily illegal crossings with confident lines about returns (e.g. to Morocco or other partners). Open research finds a persistent gap: arrival and detection figures are relatively public (Frontex FRAN/JORA, national landing stats), while multi-year, corridor-matched return/readmission ledgers are incomplete, delayed, or buried in fragmented national reports. This page refuses slogan returns without numbers.",
  ask: "For each corridor: detections (or landings) by year since 2011 · returns/readmissions by year to named partner · legal basis · source URL.",
  moroccoNote:
    "Spain–Morocco cooperation is real and episodic. Treat ‘returned to Morocco’ as a claim that must show annual counts beside Western Med / Canary entry pressure — not a press-conference substitute.",
};

export const X_THREAD_DRAFT: string[] = [
  "1/ Illegal entry at EU scale was normalised. Speech against it was often policed. Citizens paid. Full brief: https://elenchos.live/research-migration",
  "2/ Don’t confuse charts: 2015 ~1.8M is the peak YEAR of Frontex detections — not the multi-year total. Listed years in our series already sum past ~4M detection events (not unique people). X is right to reject the soft ‘only 2M ever’ slogan.",
  "3/ 2024–25 detections fell (~239k → ~178k). Lower flow ≠ restored trust, returns ledger, or free speech. Corridors + open vs resist inside. — @elenchospulse",
];

export const HOOK_HEADLINE =
  "Illegal entry at scale was normalised. Speech against it was often policed. Citizens paid.";

export const HOOK_SUB =
  "EU + UK Channel · free open data first · what ordinary people need to see in 10 seconds — full picture under 10 minutes.";

/** One-screen thesis for Library cards + case_study_snapshots.summary */
export const EXECUTIVE_SUMMARY =
  "Since the Syrian war era (2011+), Europe faced multi-year irregular pressure. The often-cited ~1.8M figure is the 2015 peak year of Frontex-linked illegal border-crossing detections — not unique people and not the multi-year total. This brief separates peak-year charts from cumulative pressure, maps corridors and frontline states, contrasts open vs resist policy eras, and uses an X/citizen scale rail to counter soft slogans when discourse claims ‘far more than 1.8–2M.’";

/** Deep-dive section teasers (also stored on case_study_snapshots.subheadlines) */
export const SUBHEADLINES: { id: string; title: string; blurb: string }[] = [
  {
    id: "scale",
    title: "Peak year vs multi-year pressure",
    blurb: "~1.8M = 2015 detections alone; listed years already sum multi-million events — not unique persons.",
  },
  {
    id: "x-rail",
    title: "Why X rejects ‘only 2M’",
    blurb: "Cumulative, stock, Channel, and undetected crossings explain citizen scale claims without inventing fake official totals.",
  },
  {
    id: "corridors",
    title: "Corridors & frontline states",
    blurb: "Eastern/Central/Western Med, Balkans, Channel — GR · IT · ES · UK first.",
  },
  {
    id: "stance",
    title: "Open vs resist",
    blurb: "Policy archetypes and dated examples — magnet eras vs barriers and court fights.",
  },
  {
    id: "returns",
    title: "Crossings vs returns ledger",
    blurb: "Arrival stats are public; corridor-matched multi-year returns often are not — refuse slogan returns.",
  },
  {
    id: "speech",
    title: "Discourse & speech cost",
    blurb: "Illegal entry softened in language; enforcement speech often framed as ‘racist’ — evidence rails, not vibes.",
  },
];

/** Stable slug for case_study_snapshots.case_slug */
export const CASE_SLUG = "irregular-migration";

/** Editorial timestamps (ISO date) — shown on case page + Library cards */
export const PUBLISHED_AT = "2026-08-20";
export const UPDATED_AT = "2026-08-20";

/** Chapters designed for <10 min total (~1–1.5 min each) */
export const CHAPTERS: { id: string; n: string; title: string; seconds: string; blurb: string }[] = [
  { id: "scale", n: "01", title: "Scale since 2011", seconds: "~75s", blurb: "How big, how long, detections ≠ persons." },
  { id: "corridors", n: "02", title: "Corridors & frontline", seconds: "~75s", blurb: "Entry systems + most-affected states." },
  { id: "stance", n: "03", title: "Open vs resist", seconds: "~75s", blurb: "Policy archetypes, not moral scorecards." },
  { id: "damage", n: "04", title: "Risks & social gravity", seconds: "~75s", blurb: "Capacity, cohesion, and elite failure — not slogans." },
  { id: "discourse", n: "05", title: "Discourse & labels", seconds: "~90s", blurb: "Citizen themes, ‘racist’ frames, funding trails." },
  { id: "actors", n: "06", title: "Who shapes flows", seconds: "~75s", blurb: "Turkey to EU institutions — roles, not memes." },
  { id: "reverse", n: "07", title: "If nothing changes", seconds: "~75s", blurb: "Scenarios + reverse policies citizens asked for." },
];
