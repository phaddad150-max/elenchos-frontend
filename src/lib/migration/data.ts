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

/** EU external-border illegal/irregular border-crossing detections (approx. public totals). */
export const EU_IBC_SERIES: { year: number; detections: number; note?: string }[] = [
  { year: 2011, detections: 141_000, note: "Order of magnitude pre-crisis baseline (public series)" },
  { year: 2014, detections: 283_000 },
  { year: 2015, detections: 1_822_000, note: "Crisis peak after Syria war escalation" },
  { year: 2016, detections: 511_000 },
  { year: 2019, detections: 142_000 },
  { year: 2021, detections: 200_000, note: "~199.9k reported" },
  { year: 2022, detections: 330_000 },
  { year: 2023, detections: 380_000, note: "Frontex: +17% vs 2022" },
  { year: 2024, detections: 239_000, note: "Frontex preliminary: −38% vs 2023" },
  { year: 2025, detections: 178_000, note: "Frontex preliminary: −26% vs 2024; lowest since 2021" },
];

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
    title: "Crisis peak",
    body: "Frontex-linked public series show detections on the order of ~1.8 million illegal border-crossings at EU external borders — the scale that redefined European politics.",
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
    ask: "Target smuggling networks as organised crime",
    feasibility: "High consensus, execution varies",
    note: "Cross-border police work; not a substitute for removal capacity.",
  },
];

/** 10-second hook — four numbers ordinary people remember */
export const HOOK_KPIS: {
  label: string;
  value: string;
  sub: string;
  tone: "rose" | "amber" | "cyan" | "emerald";
}[] = [
  {
    label: "2015 peak detections",
    value: "~1.8M",
    sub: "EU external illegal border-crossings (order of magnitude)",
    tone: "rose",
  },
  {
    label: "2023 detections",
    value: "~380k",
    sub: "Frontex: still a mass-security scale year",
    tone: "amber",
  },
  {
    label: "2025 detections",
    value: "~178k",
    sub: "Down sharply — problem not “over”",
    tone: "cyan",
  },
  {
    label: "Since",
    value: "2011",
    sub: "Syrian war era → continuous political crisis",
    tone: "emerald",
  },
];

export const HOOK_HEADLINE =
  "Illegal entry at scale was normalised. Speech against it was often policed. Citizens paid.";

export const HOOK_SUB =
  "EU + UK Channel · free open data first · what ordinary people need to see in 10 seconds — full picture under 10 minutes.";

/** Chapters designed for <10 min total (~1–1.5 min each) */
export const CHAPTERS: { id: string; n: string; title: string; seconds: string; blurb: string }[] = [
  { id: "scale", n: "01", title: "Scale since 2011", seconds: "~90s", blurb: "How big, how long, detections ≠ persons." },
  { id: "corridors", n: "02", title: "Corridors & entry", seconds: "~75s", blurb: "Where pressure hits Europe and the Channel." },
  { id: "damage", n: "03", title: "Security & damage", seconds: "~90s", blurb: "Why this is national-security scale, not a slogan." },
  { id: "elites", n: "04", title: "Elite failure", seconds: "~90s", blurb: "Politicians, media, NGOs, courts — incentives." },
  { id: "speech", n: "05", title: "Crime vs speech", seconds: "~75s", blurb: "Illegal crossing softened; dissent hardened." },
  { id: "actors", n: "06", title: "Who shapes flows", seconds: "~90s", blurb: "Turkey to EU institutions — roles, not memes." },
  { id: "reverse", n: "07", title: "If nothing changes · reverse", seconds: "~90s", blurb: "Scenarios + what citizens have asked for." },
];
