/**
 * Seed goodwill UAE Fintech commission into Supabase (append-only INSERT).
 *
 * Usage (PowerShell):
 *   $env:SUPABASE_URL="https://YOUR.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."
 *   node scripts/seed-uae-fintech.mjs
 *
 * Or after deploy with ADMIN_SECRET:
 *   curl -X POST https://elenchos.live/api/research/admin/commission `
 *     -H "content-type: application/json" `
 *     -H "x-admin-secret: YOUR_ADMIN_SECRET" `
 *     -d "{\"seed\":\"uae-fintech\"}"
 */

import { randomUUID } from "node:crypto";

const TOPIC =
  "UAE Fintech Dominance in MENA: Trust, Policy and Leadership";
const TOPIC_LONG =
  "Fintech Services & Solutions in the UAE and Broader Arab/MENA Region: Citizen Trust, Government Backing, and Regional Leadership";

const QUESTIONS = [
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

const url =
  process.env.SUPABASE_URL?.trim() ||
  process.env.VITE_SUPABASE_URL?.trim() ||
  "https://jacbalsongvqvaqlfsbx.supabase.co";
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.SUPABASE_KEY?.trim() ||
  "";

if (!key) {
  console.error(
    "Missing SUPABASE_SERVICE_ROLE_KEY. Set it then re-run, or use the admin API after deploy.",
  );
  process.exit(1);
}

const token = randomUUID().replace(/-/g, "");
const id1 = randomUUID();
const id2 = randomUUID();
const now = new Date().toISOString();
const questionsText = QUESTIONS.map((q, i) => `${i + 1}. ${q}`).join("\n");

// Minimal ready report shell — production prefers admin seed with full analysis.
// This script inserts pending + ready with structured payload matching server seed shape.
const report = {
  token,
  packageId: "topic-analysis",
  topic: TOPIC,
  questions: QUESTIONS,
  title: `${TOPIC} · Elenchos briefing`,
  createdAt: now,
  updatedAt: now,
  disclaimer:
    "Research tool provided as-is. Not legal, medical, or investment advice. Directional experimental analysis.",
  generationStatus: "ready",
  overallSentiment: { score: 54, label: "mixed / conditional", trend: "event-sensitive" },
  divergenceScore: 61,
  sampleNote:
    "No live public-discourse sample this run. Directional open-source frames only.",
  sampleSize: null,
  narrativeGap: {
    headline:
      "Hub superlatives vs lived speed, fees, and freezes—where dominance is felt and where it frays",
    citizenFrame:
      "Faster apps and access vs banks; sharp on fees, freezes, support, uneven regional rollout.",
    officialMediaFrame:
      "Licence growth, sovereign partnership, rankings, and MENA/global hub positioning.",
    scoreRationale:
      "Overlap on modernisation; gap on complaint depth and regional uniformity.",
    gapPoints: [
      "Speed/UX vs fee/freeze friction",
      "Aggregate metrics vs personal harm",
      "UAE hub vs wider MENA service",
    ],
  },
  questionAnalyses: QUESTIONS.map((q) => ({
    question: q,
    answer:
      "See full analysis on the report page after seed via /api/research/admin/commission {seed:uae-fintech} for complete answers. This lightweight SQL seed only guarantees storage of topic + questions.",
    sentimentScore: null,
    sentimentLabel: null,
    keyPoints: [],
    confidence: "insufficient",
  })),
  keyInsights: [],
  claims: [],
  chapters: [],
  scenarios: [],
  methodNotes: [
    `SEO title: ${TOPIC}`,
    `Original framing: ${TOPIC_LONG}`,
    "Prefer admin seed endpoint for full hybrid analysis body.",
  ],
  limits: ["Not professional advice.", "No live X sample this seed path."],
  sections: [
    {
      heading: "Scope",
      body: [TOPIC, TOPIC_LONG, "9 questions stored", "Use admin seed for full analysis body"],
    },
    {
      heading: "Questions",
      body: QUESTIONS.map((q, i) => `${i + 1}. ${q}`),
    },
  ],
  status: "ready",
  generatedBy: "template",
};

async function insert(row) {
  const res = await fetch(`${url}/rest/v1/research_desk_reports`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Insert failed ${res.status}: ${t.slice(0, 400)}`);
  }
}

const pending = {
  id: id1,
  token,
  stripe_session_id: null,
  package_id: "topic-analysis",
  topic: TOPIC,
  questions: questionsText,
  report: { ...report, generationStatus: "pending_payment", status: "draft" },
  created_at: now,
  shared_public: false,
  shared_at: null,
  status: "pending_payment",
  error_message: null,
};

const ready = {
  id: id2,
  token,
  stripe_session_id: `goodwill-seed-${token.slice(0, 12)}`,
  package_id: "topic-analysis",
  topic: TOPIC,
  questions: questionsText,
  report,
  created_at: new Date(Date.now() + 1000).toISOString(),
  shared_public: false,
  shared_at: null,
  status: "ready",
  error_message: null,
};

console.log("Inserting append-only rows for token", token);
await insert(pending);
await insert(ready);
console.log("OK");
console.log("Report URL: https://elenchos.live/research/report/" + token);
console.log("PDF URL:    https://elenchos.live/api/research/report/" + token + "?format=pdf");
console.log(
  "\nFor FULL analysis answers, call admin seed after deploy:\n",
  `curl -X POST https://elenchos.live/api/research/admin/commission -H "content-type: application/json" -H "x-admin-secret: $ADMIN_SECRET" -d "{\\"seed\\":\\"uae-fintech\\"}"`,
);
