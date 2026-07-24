// Curated citizen-journalism topics for the Topics + Compare pages.
// Numbers are illustrative simulation values from the AI pipeline.


export type TopicScore = "positive" | "negative" | "mixed";

export interface TrackerScore {
  label: string;
  score: number; // 0..100, citizen-net positive
  classification: TopicScore;
  caption: string;
}

export interface CompareRow {
  dimension: string;
  traditional: string;
  citizen: string;
  divergence: number; // 0..100
}

export interface SentimentSegment {
  label: string;
  score: number; // 0..100
  note?: string;
  highlight?: "high" | "low";
}

export interface PathExample {
  title: string; // "Positive Path" / "Risk Path"
  pathLabel: string; // scenario name
  exampleLabel: string; // "Success example: UAE" etc.
  exampleBody: string;
}

export interface TimelineMilestone {
  year: string; // "1947", "Oct 2023" etc
  event: string; // short label
  note?: string; // one-line context
  pivotal?: boolean; // emphasized marker
}

export interface HistoricalTimeline {
  rootYear: string; // origin point of the modern problem
  rootEvent: string; // short label
  rootNote: string; // one-line explanation
  milestones: TimelineMilestone[]; // chronological
  summary: string; // 1-2 sentence current-state framing
}

export interface ActionableIntel {
  claims: string[]; // Top citizen claims (verifiable / dominant on X)
  warnings: string[]; // Risk / escalation signals
  opportunities: string[]; // Story angles, openings, leverage points
}

export interface FeatureTopic {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  sampleSize: string;
  confidence?: "High" | "Moderate" | "Low";
  region: string;
  trackers: TrackerScore[];
  segments?: {
    methodology: string;
    items: SentimentSegment[];
  };
  pathExamples?: {
    positive: PathExample;
    risk: PathExample;
  };
  historicalContext?: string;
  historicalTimeline?: HistoricalTimeline;
  actionableIntel?: ActionableIntel;
  simulation: {
    title: string;
    pathA: { label: string; series: number[] };
    pathB: { label: string; series: number[] };
    caption: string;
  };
  insights: {
    citizenSays: string;
    officialSays: string;
    gap: string;
  };
  takeaway: string;
  compare: CompareRow[];
}

export const FEATURE_TOPICS: FeatureTopic[] = [
  {
    id: "arab-israeli-normalization",
    title: "Arab–Israeli Normalization",
    shortTitle: "Normalization",
    description:
      "Citizen sentiment toward peace, Abraham Accords expansion, economic benefits vs resistance narratives.",
    sampleSize: "~380K X posts analyzed",
    confidence: "High",
    region: "Gulf States · Levant · E. Med",
    segments: {
      methodology: "Segmented by language, location signals, and self-identification on X.",
      items: [
        { label: "Arab_GCC", score: 79, note: "Strongest support", highlight: "high" },
        { label: "Arab_Levant", score: 41, note: "Most resistant", highlight: "low" },
        { label: "Israeli_Public", score: 71 },
      ],
    },
    pathExamples: {
      positive: {
        title: "Positive Path",
        pathLabel: "Normalization deepens",
        exampleLabel: "Success model: UAE",
        exampleBody:
          "Diversification, openness, visa-free corridors and tech investment turning citizen optimism into measurable trade and tourism upside.",
      },
      risk: {
        title: "Risk Path",
        pathLabel: "Conflict relapse freezes accords",
        exampleLabel: "Cautionary signal: Gaza spillover",
        exampleBody:
          "Renewed Gaza escalation or Iran-proxy strike resets street sentiment and pushes governments to slow-roll diplomatic openings.",
      },
    },
    historicalContext:
      "Abraham Accords (2020) normalized UAE-Bahrain-Israel ties, expanded to Morocco and Sudan. Saudi-Israel track paused after Oct 2023 Gaza war. Citizen openness rebuilt fastest in GCC; slowest in Levant Core, where displacement narratives still dominate.",
    historicalTimeline: {
      rootYear: "1947",
      rootEvent: "UN Partition Plan",
      rootNote:
        "Resolution 181 partitioned Mandatory Palestine — the unresolved starting point of every subsequent Arab-Israeli question.",
      summary:
        "Eight decades of conflict and four formal peace tracks. Citizen sentiment in 2026 is shaped less by 1948 framing and more by the post-2020 economic-integration thesis — except in the Levant.",
      milestones: [
        {
          year: "1948",
          event: "Israel founded · Nakba",
          note: "First Arab-Israeli war and Palestinian displacement.",
          pivotal: true,
        },
        { year: "1967", event: "Six-Day War", note: "West Bank, Gaza, Sinai, Golan occupied." },
        { year: "1979", event: "Egypt-Israel peace", note: "Camp David — first Arab state to normalize." },
        { year: "1993", event: "Oslo Accords", note: "Mutual recognition; two-state framework." },
        { year: "1994", event: "Jordan-Israel peace", note: "Second Arab state to normalize." },
        { year: "2020", event: "Abraham Accords", note: "UAE, Bahrain, Morocco, Sudan normalize.", pivotal: true },
        { year: "Oct 2023", event: "Gaza war", note: "Saudi track paused; Levant sentiment regresses.", pivotal: true },
        {
          year: "2025-26",
          event: "Quiet GCC re-engagement",
          note: "Trade, visas, IMEC corridor restart on citizen-positive momentum.",
        },
      ],
    },
    actionableIntel: {
      claims: [
        "GCC citizens overwhelmingly frame normalization through jobs, visas, flights and tech — not ideology.",
        "Under-35 cohort across Gulf + diaspora supports continued accords at ~2x the rate of 45+.",
        "Resistance arguments remain concentrated in identifiable activist clusters, not the broader feed.",
      ],
      warnings: [
        "Levant sentiment is 38 pts below GCC — any new Gaza flare-up will widen the regional split further.",
        "Iran-proxy strike on Gulf infrastructure is the single highest-probability trigger for accord rollback.",
        "Governments under-communicating economic upside leaves the narrative open to spoiler campaigns.",
      ],
      opportunities: [
        "Verifiable story: trade and tourism numbers between Accord states have outpaced official forecasts.",
        "Under-covered angle: Saudi public opinion on Israel ties is more permissive than Riyadh signals.",
        "Counter-narrative watch: coordinated 'normalization equals betrayal' framing — track origin clusters.",
      ],
    },
    trackers: [
      {
        label: "Political Stability Sentiment",
        score: 64,
        classification: "positive",
        caption: "Citizens increasingly view normalization as stabilizing; loud minority dissent.",
      },
      {
        label: "Economic Growth Sentiment",
        score: 78,
        classification: "positive",
        caption: "Strong belief in trade, tourism and tech corridor upside.",
      },
      {
        label: "Social Coherence & Tolerance",
        score: 49,
        classification: "mixed",
        caption: "Generational split: under-35 cohort markedly more open than 45+.",
      },
    ],
    simulation: {
      title: "Normalization path vs Conflict path · 12-month projection",
      pathA: { label: "Normalization path", series: [42, 48, 55, 60, 64, 68, 71, 73, 75, 77, 79, 82] },
      pathB: { label: "Conflict path", series: [42, 39, 35, 32, 30, 28, 27, 25, 24, 22, 20, 18] },
      caption: "Citizen sentiment index projection under each scenario, indexed to today.",
    },
    insights: {
      citizenSays:
        "Visible majority of Gulf and diaspora voices frame normalization through jobs, visas, flights and tech. Resistance arguments remain loud but concentrated in known activist clusters.",
      officialSays:
        "Official channels emphasize cautious progress, conditional on Palestinian-track movement, while soft-pedaling on direct economic upside.",
      gap: "+24-pt citizen-vs-official gap: citizens are notably more optimistic on economic benefits than governments publicly admit.",
    },
    takeaway:
      "The street is ahead of the podium on economics. Governments under-communicate the upside their own citizens already see on X.",
    compare: [
      {
        dimension: "Likelihood of further accords (next 24m)",
        traditional: "Polls / academic: cautious — 35–45%",
        citizen: "X engagement-weighted signal: 62%",
        divergence: 22,
      },
      {
        dimension: "Economic benefit perception",
        traditional: "Govt comms: muted, conditional",
        citizen: "Citizens: strongly positive (78/100)",
        divergence: 31,
      },
      {
        dimension: "Public opposition strength",
        traditional: "Mainstream media: framed as majority",
        citizen: "X clusters: vocal minority, ~22% of share",
        divergence: 28,
      },
    ],
  },
  {
    id: "iranian-voices-vs-regime",
    title: "Iranian Voices vs Islamic Regime",
    shortTitle: "Iranian Voices",
    description: "Inside voices, diaspora hopes, and the growing call for freedom after 47 years of theocracy.",
    sampleSize: "~520K X posts analyzed",
    confidence: "High",
    region: "Inside Iran · Diaspora",
    segments: {
      methodology: "Segmented by location signals (Inside Iran vs Diaspora) and Persian/English language on X.",
      items: [
        { label: "Inside_Iran", score: 26, note: "Anti-regime majority despite suppression", highlight: "low" },
        { label: "Iranian_Diaspora", score: 22, note: "Loudest anti-regime + pro-Pahlavi voices", highlight: "low" },
        { label: "Regime_Aligned", score: 74, note: "Concentrated, bot-amplified", highlight: "high" },
        { label: "Under_35_Inside", score: 31, note: "Generational rejection of theocracy" },
      ],
    },

    pathExamples: {
      positive: {
        title: "Positive Path",
        pathLabel: "Citizen-led liberalization",
        exampleLabel: "Reference signal: 2022 Mahsa Amini wave",
        exampleBody:
          "Civil-liberties demands break through suppression; international coalitions back inside-Iran voices; sanctions relief tied to reform.",
      },
      risk: {
        title: "Risk Path",
        pathLabel: "Regime continuity + proxy expansion",
        exampleLabel: "Cautionary model: post-2009 Green Movement freeze",
        exampleBody:
          "Crackdowns silence visible dissent online while economic decay continues — legitimacy gap widens but no transition mechanism exists.",
      },
    },
    historicalContext:
      "Sustained citizen mobilization since 2009 Green Movement, 2017–18 economic protests, 2019 fuel-price uprising, and 2022 Mahsa Amini movement. Rial collapse and proxy spending have pushed inside-Iran X discourse decisively against regional adventurism.",
    historicalTimeline: {
      rootYear: "1979",
      rootEvent: "Islamic Revolution",
      rootNote:
        "Overthrow of the Shah and founding of the Islamic Republic — the institutional origin of the current regime-citizen gap.",
      summary:
        "Five waves of citizen mobilization in fifteen years, each larger and more diffuse than the last. The regime's external narrative now contradicts what its own X-active citizens publish daily.",
      milestones: [
        {
          year: "1979",
          event: "Islamic Republic founded",
          note: "Theocratic constitution; clerical guardianship locked in.",
          pivotal: true,
        },
        { year: "1980-88", event: "Iran-Iraq war", note: "Foundational trauma; consolidates IRGC power." },
        { year: "2009", event: "Green Movement", note: "First mass post-election uprising; brutally suppressed." },
        { year: "2015", event: "JCPOA signed", note: "Brief economic opening." },
        { year: "2018", event: "US withdraws from JCPOA", note: "Sanctions re-imposed; rial begins collapse." },
        { year: "2019", event: "Fuel-price uprising", note: "Nationwide, cross-class — internet shutdown response." },
        {
          year: "2022",
          event: "Mahsa Amini movement",
          note: "Largest civil-liberties wave since 1979.",
          pivotal: true,
        },
        {
          year: "2024-26",
          event: "Currency collapse + proxy attrition",
          note: "Hezbollah weakened, Assad fallen, Houthis isolated.",
          pivotal: true,
        },
      ],
    },
    actionableIntel: {
      claims: [
        "Inside-Iran X voices reject the Islamic Republic and its regional proxies at a sustained ~75% majority despite filtering.",
        "Pro-Reza Pahlavi (exiled Crown Prince) sentiment is rising fast in diaspora clusters and among under-35 inside Iran as a unifying secular-monarchist symbol.",
        "Exhaustion with theocracy, proxy wars, and rial collapse dominates Persian-language conversation — not ideology.",
      ],
      warnings: [
        "Regime-aligned bot networks are inflating engagement on state media — divergence widening, not narrowing.",
        "Internet shutdowns precede crackdowns by 48–72h — track Iran routing telemetry as an early warning.",
        "Proxy attrition (Hezbollah weakened, Assad fallen) raises pressure for a domestic show of force.",
      ],
      opportunities: [
        "Verifiable angle: anti-proxy sentiment now spans clerical-leaning conservatives, not just liberals.",
        "Under-reported: provincial protest frequency outpaces Tehran coverage by 4:1 in 2025.",
        "Pahlavi-symbol momentum: track which diaspora clusters convert symbolic support into organized political infrastructure.",
      ],
    },

    trackers: [
      {
        label: "Political Stability Sentiment",
        score: 21,
        classification: "negative",
        caption: "Citizens overwhelmingly perceive regime as illegitimate and brittle.",
      },
      {
        label: "Economic Growth Sentiment",
        score: 18,
        classification: "negative",
        caption: "Sanctions, currency collapse and corruption dominate citizen framing.",
      },
      {
        label: "Social Coherence & Tolerance",
        score: 44,
        classification: "mixed",
        caption: "Generational and ethnic divides; strong push for civil liberties.",
      },
    ],
    simulation: {
      title: "Regime continuity vs Citizen-led transition · 18-month projection",
      pathA: { label: "Regime continuity", series: [50, 48, 47, 45, 43, 41, 40, 38, 36, 34, 32, 30] },
      pathB: { label: "Citizen-led transition", series: [50, 52, 55, 58, 60, 63, 66, 68, 70, 72, 74, 76] },
      caption: "Projected legitimacy index. Higher = more popular legitimacy.",
    },
    insights: {
      citizenSays:
        "Inside-Iran posts (Persian + English) consistently reject regional adventurism — Hezbollah, Houthis, Hamas — and demand domestic investment. Diaspora amplifies and protects these voices from suppression.",
      officialSays:
        "Regime channels frame proxies as resistance assets and downplay domestic unrest. State media inflates support metrics.",
      gap: "+58-pt gap on proxy support: regime claims majority backing, citizen X data shows the opposite.",
    },
    takeaway:
      "The largest citizen-vs-official gap in the region. The regime's external narrative is increasingly disconnected from its own X-active citizens.",
    compare: [
      {
        dimension: "Support for regional proxies",
        traditional: "State media: 'majority backs resistance'",
        citizen: "X signal: ~78% oppose or are indifferent",
        divergence: 58,
      },
      {
        dimension: "Regime legitimacy",
        traditional: "Official polls: high approval",
        citizen: "Engagement-weighted X: collapsing",
        divergence: 49,
      },
      {
        dimension: "Economic outlook",
        traditional: "State outlets: stable, 'resistance economy'",
        citizen: "Citizens: crisis, corruption, exit intent",
        divergence: 41,
      },
    ],
  },
  {
    id: "maritime-ai-greece-global-role",
    title: "Maritime AI Industry & Greece's Global Role",
    shortTitle: "Maritime AI & Greece",
    description:
      "Citizen sentiment on the maritime AI industry and Greece's global role in shipping, ports, and AI-driven maritime innovation.",
    sampleSize: "",
    confidence: "Moderate",
    region: "Global · Greece",
    trackers: [],
    simulation: {
      title: "Live data",
      pathA: { label: "Live", series: [] },
      pathB: { label: "Live", series: [] },
      caption: "",
    },
    insights: { citizenSays: "", officialSays: "", gap: "" },
    takeaway: "",
    compare: [],
  },
  {
    id: "global-ai-race",
    title: "The Global AI Race",
    shortTitle: "Global AI Race",
    description:
      "Citizen sentiment on the global AI race — US, China, EU competition, regulation, jobs and safety.",
    sampleSize: "",
    confidence: "Moderate",
    region: "Global",
    trackers: [],
    simulation: {
      title: "Live data",
      pathA: { label: "Live", series: [] },
      pathB: { label: "Live", series: [] },
      caption: "",
    },
    insights: { citizenSays: "", officialSays: "", gap: "" },
    takeaway: "",
    compare: [],
  },

  {
    id: "new-us-foreign-policy",
    title: "Trump Administration Actions & US Politics",
    shortTitle: "Trump Admin & US Politics",
    description:
      "Citizen sentiment in the US and in the top five countries most directly affected by current US foreign-policy shifts — Ukraine, Israel, Taiwan, Iran, and Mexico — on alliances, trade, deterrence, and migration.",
    sampleSize: "~420K X posts analyzed",
    confidence: "Moderate",
    region: "Global · US + Ukraine · Israel · Taiwan · Iran · Mexico",
    segments: {
      methodology:
        "Segmented by language, geolocation signals, and self-identification on X across the US and the five most affected publics.",
      items: [
        { label: "US_Public", score: 54 },
        { label: "Ukraine_Public", score: 41, note: "Most exposed", highlight: "low" },
        { label: "Israel_Public", score: 66, note: "Strongest alignment", highlight: "high" },
        { label: "Taiwan_Public", score: 58 },
        { label: "Iran_Public", score: 47 },
        { label: "Mexico_Public", score: 39, highlight: "low" },
      ],
    },
    pathExamples: {
      positive: {
        title: "Positive Path",
        pathLabel: "Coherent realignment",
        exampleLabel: "Success signal: clarified deterrence",
        exampleBody:
          "Consistent US signaling rebuilds allied trust, deters adversaries, and reopens trade corridors — citizens in affected countries read the new posture as credible rather than chaotic.",
      },
      risk: {
        title: "Risk Path",
        pathLabel: "Allied drift + opportunistic adversaries",
        exampleLabel: "Cautionary signal: hedging cascade",
        exampleBody:
          "Mixed messaging on Ukraine, Taiwan, and the Iran file pushes allies to hedge with China and the EU while adversaries probe — citizen sentiment in exposed publics tilts toward fatalism.",
      },
    },
    historicalContext:
      "The post-2024 US administration reframed alliances, trade, migration, and deterrence simultaneously. Citizens in the five most-affected publics are recalibrating in real time on X.",
    actionableIntel: {
      claims: [
        "US citizens are split but converging on transactional alliances and tougher border enforcement.",
        "Israeli and Taiwanese publics broadly read the new posture as stronger deterrence.",
        "Ukrainian and Mexican publics report the sharpest anxiety about reliability and economic spillovers.",
      ],
      warnings: [
        "Allied hedging accelerates if Ukraine support signals stay ambiguous through the next cycle.",
        "Iran-track escalation risk rises whenever US domestic messaging diverges from regional posture.",
        "Mexico discourse is dominated by tariff + migration fears — a single enforcement incident could spike sentiment.",
      ],
      opportunities: [
        "Under-covered: Taiwanese citizen sentiment is more pro-US than headline polling suggests.",
        "Story angle: divergence between US elite framing and citizen framing on Ukraine aid.",
        "Verifiable: cross-country sentiment on trade tariffs is moving faster than official statements.",
      ],
    },
    trackers: [
      {
        label: "Political Stability Sentiment",
        score: 51,
        classification: "mixed",
        caption: "Citizens read the new posture as decisive in some arenas, erratic in others.",
      },
      {
        label: "Economic Growth Sentiment",
        score: 48,
        classification: "mixed",
        caption: "Tariff + supply-chain anxiety especially visible in Mexico and Taiwan.",
      },
      {
        label: "Social Coherence & Tolerance",
        score: 44,
        classification: "mixed",
        caption: "Migration and identity framings dominate US-side discourse.",
      },
    ],
    simulation: {
      title: "Coherent realignment vs Allied drift · 12-month projection",
      pathA: { label: "Coherent realignment", series: [50, 52, 54, 57, 60, 62, 64, 66, 68, 70, 71, 73] },
      pathB: { label: "Allied drift", series: [50, 48, 45, 42, 39, 37, 35, 33, 31, 29, 27, 25] },
      caption: "Composite citizen confidence across the US + five most affected publics.",
    },
    insights: {
      citizenSays:
        "Citizens across the five affected publics read the new US posture pragmatically — some see clarity, others see chaos, but almost no one reads it as continuity.",
      officialSays:
        "Official US messaging emphasizes deterrence and burden-sharing; affected-country officials emphasize either reassurance or hedging.",
      gap: "Citizen and official framings diverge most sharply on Ukraine, Iran, and Mexico tracks.",
    },
    takeaway:
      "Publics in the five most-affected countries are repricing the United States in real time. The signal is loudest where the policy stakes are most concrete.",
    compare: [
      {
        dimension: "Reliability of US alliance commitments",
        traditional: "Official: 'America First, allies share burden'",
        citizen: "Allied publics: split — Israel/Taiwan reassured, Ukraine anxious",
        divergence: 34,
      },
      {
        dimension: "Trade + tariff posture",
        traditional: "Policy press: strategic competition framing",
        citizen: "Mexico + Taiwan X: cost-of-living + jobs framing",
        divergence: 31,
      },
      {
        dimension: "Iran file",
        traditional: "Official: maximum pressure + deterrence",
        citizen: "Iranian publics: opportunity for change framing",
        divergence: 28,
      },
    ],
  },
  {
    id: "crypto-regulation-financial-markets",
    title: "Crypto Regulation & Financial Markets Volatility",
    shortTitle: "Crypto & Markets",
    description:
      "Citizen sentiment on crypto regulation, central-bank actions, equity market shocks, and the political fight over financial freedom vs systemic risk.",
    sampleSize: "~200K X posts analyzed",
    confidence: "Moderate",
    region: "Global · US · EU · APAC",
    segments: {
      methodology:
        "Segmented by retail-investor self-identification, institutional commentary, and policy-aligned communities on X.",
      items: [
        { label: "Retail_Investors", score: 58 },
        { label: "Crypto_Native", score: 71, note: "Strongest pro-regulation-clarity push", highlight: "high" },
        { label: "TradFi_Voices", score: 49 },
        { label: "Policy_Watchers", score: 44 },
        { label: "General_Public", score: 41, highlight: "low" },
      ],
    },
    pathExamples: {
      positive: {
        title: "Positive Path",
        pathLabel: "Clear rules + market stability",
        exampleLabel: "Success signal: rules-of-the-road",
        exampleBody:
          "Coherent regulation reduces uncertainty, on-shore liquidity returns, and citizens read policy as protective rather than punitive.",
      },
      risk: {
        title: "Risk Path",
        pathLabel: "Regulatory whiplash + volatility cascade",
        exampleLabel: "Cautionary signal: enforcement-by-press-release",
        exampleBody:
          "Inconsistent enforcement and macro shocks compound — retail trust collapses and capital migrates to opaque venues.",
      },
    },
    historicalContext:
      "Post-2024 crypto cycle, ETF approvals, banking-system stress, and AI-driven equity concentration have collapsed the line between crypto and traditional markets in citizen discourse.",
    actionableIntel: {
      claims: [
        "Crypto-native voices want clarity, not absence, of regulation.",
        "Retail investors increasingly read equity-market moves through a political lens.",
        "Stablecoin and CBDC framing splits sharply along ideological lines.",
      ],
      warnings: [
        "Single high-profile enforcement action can flip sentiment within hours.",
        "Cross-asset contagion between crypto and tech-heavy indices is now the default expectation.",
      ],
      opportunities: [
        "Under-covered: bipartisan citizen appetite for stablecoin clarity.",
        "Story angle: divergence between regulator framing and retail-investor framing.",
      ],
    },
    trackers: [
      {
        label: "Political Stability Sentiment",
        score: 47,
        classification: "mixed",
        caption: "Citizens read financial-policy posture as politically charged.",
      },
      {
        label: "Economic Growth Sentiment",
        score: 50,
        classification: "mixed",
        caption: "Volatility framing dominates over growth framing.",
      },
      {
        label: "Social Coherence & Tolerance",
        score: 45,
        classification: "mixed",
        caption: "Financial-freedom vs systemic-risk debate hardens identity lines.",
      },
    ],
    simulation: {
      title: "Rules clarity vs Regulatory whiplash · 12-month projection",
      pathA: { label: "Rules clarity", series: [50, 52, 54, 57, 59, 61, 63, 65, 66, 68, 69, 71] },
      pathB: { label: "Regulatory whiplash", series: [50, 47, 44, 41, 39, 37, 35, 33, 31, 30, 28, 26] },
      caption: "Composite citizen confidence in financial-system fairness.",
    },
    insights: {
      citizenSays:
        "Citizens want predictable rules and read volatility through a political lens, not a purely economic one.",
      officialSays:
        "Official messaging emphasizes systemic-risk containment and consumer protection.",
      gap: "Citizen framing centers on access and fairness; official framing centers on stability.",
    },
    takeaway:
      "Crypto and traditional markets are now one citizen-discourse arena. Policy clarity is the dominant ask.",
    compare: [
      {
        dimension: "Crypto regulation posture",
        traditional: "Official: consumer protection + systemic risk",
        citizen: "X: clarity + access framing",
        divergence: 32,
      },
      {
        dimension: "Equity market volatility",
        traditional: "Official: orderly markets",
        citizen: "Retail X: political-economy framing",
        divergence: 29,
      },
      {
        dimension: "Stablecoins / CBDC",
        traditional: "Policy press: monetary sovereignty",
        citizen: "Citizen X: financial-freedom framing",
        divergence: 34,
      },
    ],
  },
  {
    id: "levant-realignment",
    title: "Eastern Mediterranean Alliance: Greece–Cyprus–Israel",
    shortTitle: "E. Med Alliance",
    description:
      "Economic growth, energy cooperation, policy alignment, and public sentiment between Greece, Cyprus and Israel.",
    sampleSize: "~310K X posts analyzed",
    confidence: "Moderate",
    region: "Eastern Mediterranean",
    segments: {
      methodology: "Segmented by country (Greece, Cyprus, Israel) and Greek/English/Hebrew language signals on X.",
      items: [
        { label: "Greek_Public", score: 68, note: "Strong support for trilateral cooperation", highlight: "high" },
        { label: "Cypriot_Public", score: 71, note: "Energy + security upside", highlight: "high" },
        { label: "Israeli_Public", score: 64, note: "Regional anchor with EU access" },
      ],
    },
    pathExamples: {
      positive: {
        title: "Positive Path",
        pathLabel: "Energy + IMEC integration deepens",
        exampleLabel: "Success signal: EastMed gas + EuroAsia Interconnector",
        exampleBody:
          "Subsea power and gas links activate, trilateral defense drills expand, EU funding flows into joint infrastructure — citizens see growth, security and tourism compound.",
      },
      risk: {
        title: "Risk Path",
        pathLabel: "Turkey-EEZ friction escalates",
        exampleLabel: "Cautionary signal: 2020 maritime standoff",
        exampleBody:
          "Renewed Turkish EEZ challenges or Cyprus-related provocations freeze the energy corridor and slow private investment despite citizen appetite.",
      },
    },
    historicalContext:
      "Trilateral Greece–Cyprus–Israel cooperation formalized after the 2010 EastMed gas discoveries. Annual summits since 2016, IMEC corridor (2023), and the EuroAsia Interconnector reshaped citizen perception of the Eastern Mediterranean as an integrated energy and security space.",
    historicalTimeline: {
      rootYear: "1974",
      rootEvent: "Cyprus partition",
      rootNote:
        "Turkish invasion divided Cyprus and fixed the modern Eastern Mediterranean security dilemma the trilateral alliance now addresses.",
      summary:
        "Five decades from partition trauma to an energy-and-security alliance. Citizen sentiment in all three publics has converged around economic integration as the durable answer to regional volatility.",
      milestones: [
        {
          year: "1974",
          event: "Cyprus invasion + partition",
          note: "Greek-Turkish-Cypriot security triangle locked in.",
          pivotal: true,
        },
        { year: "1996", event: "Imia/Kardak crisis", note: "Greek-Turkish near-war over Aegean islets." },
        {
          year: "2010",
          event: "EastMed gas discoveries",
          note: "Leviathan, Aphrodite fields rewrite regional energy map.",
          pivotal: true,
        },
        { year: "2016", event: "First trilateral summit", note: "Greece–Cyprus–Israel formalize annual cooperation." },
        { year: "2020", event: "Turkey-Greece EEZ standoff", note: "Naval friction over disputed maritime zones." },
        { year: "2020", event: "EastMed Gas Forum founded", note: "Multilateral energy governance body." },
        {
          year: "2023",
          event: "IMEC corridor announced",
          note: "India–Middle East–Europe artery anchors E. Med role.",
          pivotal: true,
        },
        {
          year: "2025-26",
          event: "EuroAsia Interconnector progress",
          note: "Subsea power link Israel–Cyprus–Greece advances.",
        },
      ],
    },
    actionableIntel: {
      claims: [
        "Greek, Cypriot and Israeli publics independently rank trilateral cooperation as a top-3 foreign policy priority on X.",
        "Energy security and tourism upside dominate citizen framing — not historical or religious framing.",
        "Under-40 cohorts in all three countries treat the alliance as the default regional order.",
      ],
      warnings: [
        "Turkish EEZ provocations remain the single highest-probability trigger for escalation.",
        "EU dependency on alliance success creates political exposure if energy projects slip schedule.",
        "Cyprus reunification framing risks being instrumentalized by external actors to weaken trilateral cohesion.",
      ],
      opportunities: [
        "Verifiable story: trilateral trade and tourism flows have grown every year since 2016.",
        "Under-covered angle: Cypriot optimism on EuroAsia Interconnector outpaces official communications.",
        "Source diversity: pair X engagement with EastMed Gas Forum and EU funding data for grounded reporting.",
      ],
    },
    trackers: [
      {
        label: "Political Stability Sentiment",
        score: 66,
        classification: "positive",
        caption: "Citizens view trilateral cooperation as a stabilizing regional anchor.",
      },
      {
        label: "Economic Growth Sentiment",
        score: 72,
        classification: "positive",
        caption: "Energy, tourism, and IMEC-linked investment dominate positive framing.",
      },
      {
        label: "Social Coherence & Tolerance",
        score: 58,
        classification: "mixed",
        caption: "Strong tri-public alignment; pockets of historical-grievance friction remain.",
      },
    ],
    simulation: {
      title: "Integration path vs Turkish-friction path · 18-month projection",
      pathA: { label: "Integration deepens", series: [62, 64, 66, 68, 70, 72, 74, 75, 77, 79, 80, 82] },
      pathB: { label: "Turkish-friction escalates", series: [62, 60, 57, 54, 51, 48, 46, 44, 41, 39, 36, 34] },
      caption: "Tri-public citizen confidence index in Greece–Cyprus–Israel cooperation.",
    },
    insights: {
      citizenSays:
        "Greek, Cypriot and Israeli citizens overwhelmingly frame the alliance as economic and security upside — energy, tourism, EU access, joint defense — distinct from older historical-grievance frames.",
      officialSays:
        "Governments emphasize cautious diplomatic progress and process language; under-communicate the scale of citizen enthusiasm for deeper integration.",
      gap: "+21-pt citizen-vs-official gap on appetite for accelerating energy and defense integration.",
    },
    takeaway:
      "All three publics have already aligned. Officials are catching up to citizen appetite for a formal Eastern Mediterranean economic and security bloc.",
    compare: [
      {
        dimension: "Appetite for trilateral defense integration",
        traditional: "Foreign-policy press: cautious, NATO-deferential",
        citizen: "Tri-public X: strongly supportive",
        divergence: 26,
      },
      {
        dimension: "EastMed energy corridor outlook",
        traditional: "Analysts: hedged on Turkish disruption risk",
        citizen: "Citizens: optimistic, jobs-and-bills framing",
        divergence: 28,
      },
      {
        dimension: "Tourism + cross-border investment",
        traditional: "Mainstream: incremental coverage",
        citizen: "X: enthusiastic, under-35 dominated",
        divergence: 19,
      },
    ],
  },
  // ── Test topics (is_live: false on backend) ──────────────────────
  // These render exactly like live topics. Detail view reads live
  // Supabase data via LIVE_TOPIC_KEYS; if no snapshot exists yet for
  // the current month, the panel shows a "No data yet" state.
  // Static fields below are header/description only — never displayed
  // as analysis.
  {
    id: "eu-migration-green-divisions",
    title: "Migration, Green Policies & Internal EU Divisions",
    shortTitle: "EU Migration & Green",
    description:
      "Citizen sentiment on migration policy, green-transition costs, and the widening political divisions inside the EU.",
    sampleSize: "",
    confidence: "Moderate",
    region: "European Union",
    trackers: [],
    simulation: {
      title: "Live data",
      pathA: { label: "Live", series: [] },
      pathB: { label: "Live", series: [] },
      caption: "",
    },
    insights: { citizenSays: "", officialSays: "", gap: "" },
    takeaway: "",
    compare: [],
  },
  {
    id: "government-performance-corruption",
    title: "Government Performance, Corruption & Scandals",
    shortTitle: "Government & Corruption",
    description:
      "How citizens judge government performance, trust in institutions, and reactions to corruption scandals.",
    sampleSize: "",
    confidence: "Moderate",
    region: "Global",
    trackers: [],
    simulation: {
      title: "Live data",
      pathA: { label: "Live", series: [] },
      pathB: { label: "Live", series: [] },
      caption: "",
    },
    insights: { citizenSays: "", officialSays: "", gap: "" },
    takeaway: "",
    compare: [],
  },
  {
    id: "crime-safety-lawlessness",
    title: "Crime, Safety & Lawlessness",
    shortTitle: "Crime & Safety",
    description:
      "Citizen perceptions of crime, public safety, and how lawlessness shapes everyday life.",
    sampleSize: "",
    confidence: "Moderate",
    region: "Global",
    trackers: [],
    simulation: {
      title: "Live data",
      pathA: { label: "Live", series: [] },
      pathB: { label: "Live", series: [] },
      caption: "",
    },
    insights: { citizenSays: "", officialSays: "", gap: "" },
    takeaway: "",
    compare: [],
  },
  {
    id: "political-polarization-populism",
    title: "Political Polarization & Populism Rise",
    shortTitle: "Polarization & Populism",
    description:
      "How polarization is deepening and where citizen frustration is fueling populist movements.",
    sampleSize: "",
    confidence: "Moderate",
    region: "Global",
    trackers: [],
    simulation: {
      title: "Live data",
      pathA: { label: "Live", series: [] },
      pathB: { label: "Live", series: [] },
      caption: "",
    },
    insights: { citizenSays: "", officialSays: "", gap: "" },
    takeaway: "",
    compare: [],
  },
  {
    id: "cuba-sanctions-domino",
    title: "Cuba Sanctions & the Domino Effect",
    shortTitle: "Cuba Sanctions",
    description:
      "Citizen sentiment on Cuba sanctions and the knock-on effects across the region and diaspora.",
    sampleSize: "",
    confidence: "Moderate",
    region: "Latin America",
    trackers: [],
    simulation: {
      title: "Live data",
      pathA: { label: "Live", series: [] },
      pathB: { label: "Live", series: [] },
      caption: "",
    },
    insights: { citizenSays: "", officialSays: "", gap: "" },
    takeaway: "",
    compare: [],
  },
  {
    id: "us-iran-confrontation",
    title: "US-Iran Confrontation: Sanctions, Networks & Regime Pressure",
    shortTitle: "US–Iran Confrontation",
    description:
      "Near-real-time citizen discourse on US and allied pressure against the Iranian regime — Treasury financial networks, military posture, proxies, and regime-survival narratives after decades of confrontation.",
    sampleSize: "",
    confidence: "Moderate",
    region: "United States / Middle East",
    trackers: [],
    simulation: {
      title: "Live data",
      pathA: { label: "Live", series: [] },
      pathB: { label: "Live", series: [] },
      caption: "",
    },
    insights: { citizenSays: "", officialSays: "", gap: "" },
    takeaway: "",
    compare: [],
  },
  {
    id: "elon-musk-public-voices",
    title: "Public Voices on Elon Musk: Trust, Media Frames & Power",
    shortTitle: "Elon Musk · Public Voices",
    description:
      "Citizen discourse on Elon Musk — character, companies, free speech, and power — tested against media and official narratives. Same Elenchos method as every other topic: ground in public posts, surface gaps honestly.",
    sampleSize: "",
    confidence: "Moderate",
    region: "Global",
    trackers: [],
    simulation: {
      title: "Live data",
      pathA: { label: "Live", series: [] },
      pathB: { label: "Live", series: [] },
      caption: "",
    },
    insights: { citizenSays: "", officialSays: "", gap: "" },
    takeaway: "",
    compare: [],
  },
  {
    id: "fifa-world-cup-2026",
    title: "FIFA World Cup 2026",
    shortTitle: "World Cup 2026",
    description:
      "Archived tournament monitor — fan excitement, host-nation politics, commercialization and geopolitics from the 2026 World Cup cycle.",
    sampleSize: "",
    confidence: "Moderate",
    region: "Global",
    trackers: [],
    simulation: {
      title: "Live data",
      pathA: { label: "Live", series: [] },
      pathB: { label: "Live", series: [] },
      caption: "",
    },
    insights: { citizenSays: "", officialSays: "", gap: "" },
    takeaway: "",
    compare: [],
  },
  {
    id: "us-ai-economy-boom",
    title: "US AI Economy Boom & American Technological Renaissance",
    shortTitle: "US AI Economy Boom",
    description:
      "Citizen sentiment on the US AI economy boom — investment surge, productivity gains, labor market shifts and the American technological renaissance.",
    sampleSize: "",
    confidence: "Moderate",
    region: "United States",
    trackers: [],
    simulation: {
      title: "Live data",
      pathA: { label: "Live", series: [] },
      pathB: { label: "Live", series: [] },
      caption: "",
    },
    insights: { citizenSays: "", officialSays: "", gap: "" },
    takeaway: "",
    compare: [],
  },
];


export function getTopic(id: string): FeatureTopic | undefined {
  return FEATURE_TOPICS.find((t) => t.id === id);
}

