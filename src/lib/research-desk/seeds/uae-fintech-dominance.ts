/**
 * Goodwill re-run: first paid commission (Fintech UAE/MENA).
 * Full topic + 9 questions + structured Topics-style analysis.
 * Append-only insert only — never overwrites existing rows.
 */
import type { DeskReport } from "../build-report";

export const UAE_FINTECH_TOPIC =
  "UAE Fintech Dominance in MENA: Trust, Policy and Leadership";

export const UAE_FINTECH_TOPIC_LONG =
  "Fintech Services & Solutions in the UAE and Broader Arab/MENA Region: Citizen Trust, Government Backing, and Regional Leadership";

export const UAE_FINTECH_QUESTIONS = [
  "What specific experiences lead citizens to call UAE fintech “superior” to traditional banks or other regions, and how do those match or contradict official hub-strategy claims?",
  "If government and sovereign wealth so heavily enable the ecosystem, to what extent is current fintech success “organic innovation” versus directed policy—and what evidence from user discourse supports either view?",
  "Which fintech solutions earn the strongest spontaneous trust and positive mentions on X, and what concrete features (licenses, integrations, UX) create that credibility versus mere marketing?",
  "Where have specific platforms or sectors lost citizen credibility, and does the official narrative acknowledge those failures at the same speed and depth as public complaints about fees, scams, or friction?",
  "How do ordinary users and customers in the UAE versus the wider Arab/MENA region describe the practical differences in service quality, and what does that reveal about the limits of “regional leadership” claims?",
  "In what ways do citizens compare MENA fintech (especially UAE/Saudi) to Europe, the US, or Asia, and which assumed advantages (regulation speed, capital, lifestyle) hold up under scrutiny of real complaints?",
  "What assumptions about low corruption and high trust in government-backed fintech underpin official messaging, and what subtle divergences appear when citizens discuss transparency, frozen accounts, or sovereign influence?",
  "If sentiment scores shifted dramatically (as with other elenchos topics), what events—funding announcements, regulatory wins, or fraud incidents—would most expose the gap between earned public trust and paid/promoted narratives?",
  "Ultimately, what would authentic citizen-led success look like beyond sovereign metrics, and how might leaders close any authenticity gaps that X discourse already highlights?",
];

export function buildUaeFintechReport(token: string): DeskReport {
  const now = new Date().toISOString();
  const questions = [...UAE_FINTECH_QUESTIONS];

  const questionAnalyses = [
    {
      question: questions[0]!,
      answer:
        "Public praise for UAE fintech often clusters around speed (onboarding, remittances, card issuance), 24/7 app reliability, and English/Arabic product polish—not abstract “innovation.” Users contrast that with branch queues, slow wire desks, and opaque fees at traditional banks. Official hub messaging (global finance gateway, free-zone licences, crypto/fintech sandboxes) overlaps when citizens cite regulatory clarity and multi-currency cards; it diverges when “superior” is treated as lifestyle branding while complaints about FX spreads, frozen accounts, or support dead-ends remain local and persistent. Directional read: superiority claims track UX and access more than systemic trust in the financial state.",
      sentimentScore: 62,
      sentimentLabel: "cautiously positive",
      keyPoints: [
        "Speed and app UX dominate “better than banks” language",
        "Hub claims match when users name licences and free-zone access",
        "Contradictions appear around fees, freezes, and support quality",
      ],
      confidence: "medium" as const,
    },
    {
      question: questions[1]!,
      answer:
        "Citizen discourse rarely frames success as pure garage entrepreneurship. Mentions of ADQ/Mubadala-adjacent capital, DIFC/ADGM pathways, and state digital agendas sit beside founder stories—so the public often treats UAE fintech as policy-enabled scale. “Organic” language appears for product stickiness (daily payments, salary cards); “directed” language appears for sudden category pushes (crypto, CBDC pilots, national payment rails). Evidence from discourse is asymmetric: policy infrastructure is highly visible; independent customer-led growth is asserted more than measured. Honest limit: without a purposive X sample, this is structural reading of common frames, not a census.",
      sentimentScore: 55,
      sentimentLabel: "mixed / policy-aware",
      keyPoints: [
        "Sovereign and free-zone scaffolding is hard for users to ignore",
        "Organic signals = habitual product use; directed signals = campaign-like category pushes",
        "Do not treat either story as exclusive without transaction-level evidence",
      ],
      confidence: "medium" as const,
    },
    {
      question: questions[2]!,
      answer:
        "Spontaneous trust on public platforms tends to attach to concrete affordances: visible licensing (DFSA/FSRA/CBUAE framing), salary and government payment integrations, local card schemes, and low-friction KYC that still feels “official.” Marketing-heavy superlatives without those anchors draw more skepticism. Features that create credibility in discourse: clear dispute paths, transparent fee tables, and interoperability with established banks. Mere influencer placement without operational reliability is often called out as promo. Without a live X scrape this run, treat named “winners” as hypotheses to test—not ranked proof.",
      sentimentScore: 58,
      sentimentLabel: "trust conditional",
      keyPoints: [
        "Licence + integration + fee clarity beat slogans",
        "Promo without ops reliability erodes spontaneous trust",
        "No live X ranking in this report — confidence is directional",
      ],
      confidence: "low" as const,
    },
    {
      question: questions[3]!,
      answer:
        "Credibility losses cluster around fee surprises, account freezes/AML friction, delayed support, and scam/phishing vectors that users blame partly on platform design. Official hub narratives typically stay on licence counts, AUM, and event diplomacy; public complaints move faster and more granularly on fees and freezes. The gap is temporal and tonal: citizen posts personalise harm; official updates generalise progress. Acknowledgement lag is a narrative-gap driver even when regulators later act. Empty stays empty: this briefing does not assert specific unresolved enforcement cases without primary cites.",
      sentimentScore: 42,
      sentimentLabel: "skeptical on accountability",
      keyPoints: [
        "Fees, freezes, scams drive loss of credibility",
        "Official pace is strategic; public pace is incident-driven",
        "Depth gap: personal harm vs aggregate success metrics",
      ],
      confidence: "medium" as const,
    },
    {
      question: questions[4]!,
      answer:
        "UAE-based users more often describe mature app ecosystems, card utility, and multi-currency life; wider Arab/MENA discourse more often stresses remittance cost, currency stress, and uneven local licensing. “Regional leadership” claims look thinner when customers outside the UAE describe delayed expansion, poorer support, or products that work best for residents with Emirates ID and salary in-country. Practical differences reveal that hub leadership can be real for infrastructure and capital—and still not translate to uniform citizen experience region-wide.",
      sentimentScore: 52,
      sentimentLabel: "split by geography",
      keyPoints: [
        "UAE experience ≠ pan-MENA experience",
        "Leadership claims over-index on hub metrics",
        "Remittance and local-market friction bound the region story",
      ],
      confidence: "medium" as const,
    },
    {
      question: questions[5]!,
      answer:
        "Comparisons to Europe/US/Asia swing between “faster regulation and capital” and “weaker consumer redress / higher promo noise.” Assumed advantages that partially hold in discourse: speed of licensing pathways and lifestyle banking. Assumptions that fray under complaints: always-lower fees, always-safer products, and seamless cross-border MENA use. Asia comparisons often praise super-app density; Europe comparisons praise consumer protection. UAE/Saudi discourse sits between ambition and enforcement reality—advantages are not universal and must be claim-tested.",
      sentimentScore: 54,
      sentimentLabel: "comparative / mixed",
      keyPoints: [
        "Speed and capital are the strongest claimed edges",
        "Consumer protection and fee fairness are contested",
        "Cross-border MENA usability is a frequent limit case",
      ],
      confidence: "medium" as const,
    },
    {
      question: questions[6]!,
      answer:
        "Official messaging leans on safety, compliance, and state capacity as trust anchors. Citizen divergences surface when accounts freeze without clear timelines, when “transparency” means marketing dashboards rather than dispute logs, or when sovereign-linked platforms feel politically adjacent. Low-corruption assumptions are not usually denied outright; they are stress-tested by process opacity. That is a subtler gap than “scam vs honest”—it is about predictability and voice for ordinary customers under powerful institutions.",
      sentimentScore: 48,
      sentimentLabel: "trust under stress",
      keyPoints: [
        "State capacity is both trust source and freeze risk",
        "Transparency claims meet process opacity",
        "Sovereign influence is a discourse undercurrent, not always a headline",
      ],
      confidence: "medium" as const,
    },
    {
      question: questions[7]!,
      answer:
        "Large sentiment swings would most likely follow: (a) high-profile fraud or exchange failure with retail losses; (b) mass freeze/AML waves affecting salary users; (c) major regulatory wins that actually cut fees or open interoperability; (d) funding/IPO spectacles that feel extractive if retail product quality lags. Earned trust tracks incident response quality; paid/promoted narratives track conferences and TV. A falsifier for “hub hype dominates trust” would be sustained positive organic discourse after a crisis handled transparently—not after a sponsorship cycle.",
      sentimentScore: 50,
      sentimentLabel: "event-sensitive",
      keyPoints: [
        "Fraud + freezes are downside catalysts",
        "Real fee/interop wins are upside catalysts",
        "Crisis response quality separates earned vs promoted trust",
      ],
      confidence: "medium" as const,
    },
    {
      question: questions[8]!,
      answer:
        "Authentic citizen-led success would show up as: low surprise fees, predictable dispute resolution, products that work for non-expat and cross-border users, and discourse that cites personal utility without heavy promo framing. Leaders close authenticity gaps by matching hub metrics with published complaint SLAs, clearer freeze/AML communication, and less reliance on superlatives when regional service is uneven. Sovereign metrics (licences, AUM, rankings) remain useful—but incomplete without ordinary-user outcomes.",
      sentimentScore: 60,
      sentimentLabel: "constructive / conditional",
      keyPoints: [
        "Citizen success = utility + predictability + voice",
        "Publish complaint handling as hard as licence counts",
        "Regional leadership must be felt outside the hub city",
      ],
      confidence: "medium" as const,
    },
  ];

  const claims = [
    {
      id: "C1",
      domain: "UX vs banks",
      statement:
        "Public praise for UAE fintech is more often about speed and app experience than about abstract financial innovation.",
      confidence: "medium" as const,
      falsifier:
        "A large purposive discourse sample where most positive mentions cite product novelty/R&D rather than speed/fees/UX.",
    },
    {
      id: "C2",
      domain: "Policy scaffolding",
      statement:
        "Citizen frames treat UAE fintech success as significantly policy- and capital-enabled, not purely organic startup selection.",
      confidence: "medium" as const,
      falsifier:
        "Discourse that consistently credits independent founders without free-zone/sovereign/regulatory infrastructure.",
    },
    {
      id: "C3",
      domain: "Narrative gap",
      statement:
        "Official hub narratives update on aggregate success faster than they match the depth of public complaints about fees, freezes, and scams.",
      confidence: "medium" as const,
      falsifier:
        "Systematic official communications that track incident-level retail harm with comparable speed and specificity.",
    },
    {
      id: "C4",
      domain: "Regional leadership",
      statement:
        "“Regional leadership” claims overfit UAE hub conditions and underfit wider MENA service experience (remittances, local support, expansion lag).",
      confidence: "medium" as const,
      falsifier:
        "Consistent pan-MENA user discourse reporting UAE-comparable service quality and access.",
    },
    {
      id: "C5",
      domain: "Method limit",
      statement:
        "This briefing is directional open-source reasoning without a live X sample; platform-level rankings and percentages are not established here.",
      confidence: "high" as const,
      falsifier:
        "A documented, capped X sample with transparent method that supports stronger quantitative claims.",
    },
  ];

  const keyInsights = [
    "“Superior to banks” in public talk is mostly operational (speed, apps, access), not a blank cheque for hub strategy.",
    "Sovereign and free-zone scaffolding is visible enough that pure “organic innovation” narratives underfit citizen frames.",
    "Trust anchors to licences, integrations, and fee clarity; promo without ops reliability is discounted.",
    "Accountability lag (fees/freezes/scams) is a primary citizen–official divergence.",
    "UAE hub experience does not automatically equal MENA-wide leadership in ordinary-user terms.",
    "Authentic success metrics should include dispute SLAs and cross-border usability—not only licences and AUM.",
  ];

  const narrativeGap = {
    headline:
      "Hub superlatives vs lived speed, fees, and freezes—where “dominance” is felt and where it frays",
    citizenFrame:
      "Citizens and customers often describe UAE fintech as faster and more modern than traditional banks, while remaining sharp on fees, freezes, support, and uneven regional rollout. Trust is practical and revocable.",
    officialMediaFrame:
      "Official and hub-facing narratives emphasise global ranking, licence growth, sovereign partnership, events, and strategic positioning as a MENA/global fintech capital.",
    scoreRationale:
      "Moderate–elevated divergence: overlap on modernisation and speed; gap on complaint depth, regional uniformity, and how much success is policy-directed versus organic.",
    gapPoints: [
      "Speed/UX consensus vs fee/freeze friction",
      "Aggregate hub metrics vs personal harm stories",
      "UAE-centric success vs wider MENA service limits",
      "Innovation branding vs visible state scaffolding",
    ],
  };

  const methodNotes = [
    "Package: Topic analysis (public discourse method) — Socratic questions, frames, directional scores.",
    "No live X/public-API sample was attached to this goodwill re-run; sampleSize is null.",
    "Analysis is structured, evidence-framed, and confidence-rated; not a national poll or legal opinion.",
    `Working title (SEO): ${UAE_FINTECH_TOPIC}`,
    `Original commission framing retained for context: ${UAE_FINTECH_TOPIC_LONG}`,
    "Empty stays empty: no invented post counts, usernames, or court-grade conclusions.",
  ];

  const limits = [
    "Not legal, medical, investment, or regulatory advice.",
    "No live social sample this run — spontaneous “top apps” rankings are hypotheses, not measurements.",
    "Named institutions appear as discourse/structural context, not findings of wrongdoing.",
    "AI-assisted structure may contain errors; verify primary sources before policy or commercial use.",
    "Elenchos does not store payment card data or researcher identity dossiers.",
  ];

  const sections: DeskReport["sections"] = [
    {
      heading: "Scope & package",
      body: [
        `Title: ${UAE_FINTECH_TOPIC}`,
        `Original brief: ${UAE_FINTECH_TOPIC_LONG}`,
        "Package: Topic analysis (public discourse)",
        "Goodwill re-run of first paid commission — full 9 questions stored and answered.",
      ],
    },
    {
      heading: "Headline metrics",
      body: [
        "Sentiment: 54 (mixed / conditional trust) — directional only",
        "Divergence: 61 (elevated gap on accountability and regional uniformity)",
        "Sample: none live this run — open-source / structural frames",
      ],
    },
    {
      heading: "Narrative gap",
      body: [
        narrativeGap.headline!,
        `Citizens: ${narrativeGap.citizenFrame}`,
        `Official/media: ${narrativeGap.officialMediaFrame}`,
        ...narrativeGap.gapPoints.map((p) => `· ${p}`),
      ],
    },
    {
      heading: "Question analysis",
      body: questionAnalyses.flatMap((q, i) => [
        `Q${i + 1}. ${q.question}`,
        q.answer,
        ...q.keyPoints.map((k) => `· ${k}`),
        "",
      ]),
    },
    {
      heading: "Key insights",
      body: keyInsights.map((k) => `· ${k}`),
    },
    {
      heading: "Claims",
      body: claims.map(
        (c) =>
          `${c.id} [${c.confidence}] ${c.domain}: ${c.statement} · Falsifier: ${c.falsifier}`,
      ),
    },
    { heading: "Method", body: methodNotes },
    { heading: "Limits", body: limits },
  ];

  return {
    token,
    packageId: "topic-analysis",
    topic: UAE_FINTECH_TOPIC,
    questions,
    title: `${UAE_FINTECH_TOPIC} · Elenchos briefing`,
    createdAt: now,
    updatedAt: now,
    disclaimer:
      "Research tool provided as-is. Not legal, medical, or investment advice. Directional experimental analysis. No live X sample this run.",
    generationStatus: "ready",
    overallSentiment: {
      score: 54,
      label: "mixed / conditional",
      trend: "event-sensitive",
    },
    divergenceScore: 61,
    sampleNote:
      "No live public-discourse sample collected for this run. Scores and frames are directional open-source reasoning under the Topics method (empty stays empty on post counts).",
    sampleSize: null,
    narrativeGap,
    questionAnalyses,
    keyInsights,
    claims,
    chapters: [],
    scenarios: [],
    methodNotes,
    limits,
    sections,
    status: "ready",
    generatedBy: "hybrid",
  };
}
