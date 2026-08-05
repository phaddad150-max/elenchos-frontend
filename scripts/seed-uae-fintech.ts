/**
 * Seed full UAE Fintech goodwill report (append-only INSERT).
 *
 * PowerShell:
 *   $env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."
 *   $env:SUPABASE_URL="https://xxx.supabase.co"   # optional
 *   npx tsx scripts/seed-uae-fintech.ts
 */
import { randomUUID } from "node:crypto";
import {
  buildUaeFintechReport,
  UAE_FINTECH_QUESTIONS,
  UAE_FINTECH_REPORT_TOKEN,
  UAE_FINTECH_TOPIC,
} from "../src/lib/research-desk/seeds/uae-fintech-dominance";

const url =
  process.env.SUPABASE_URL?.trim() ||
  process.env.VITE_SUPABASE_URL?.trim() ||
  "https://jacbalsongvqvaqlfsbx.supabase.co";
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.SUPABASE_KEY?.trim() ||
  "";

if (!key) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// Fixed token so Topics archive + customer URL stay stable
const token = UAE_FINTECH_REPORT_TOKEN;
const questionsText = UAE_FINTECH_QUESTIONS.map((q, i) => `${i + 1}. ${q}`).join("\n");
const report = buildUaeFintechReport(token);
const t0 = new Date().toISOString();
const t1 = new Date(Date.now() + 1000).toISOString();

async function insert(row: Record<string, unknown>) {
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
    throw new Error(`Insert failed ${res.status}: ${t.slice(0, 500)}`);
  }
}

// Append-only: pending then ready (two new rows)
await insert({
  id: randomUUID(),
  token,
  stripe_session_id: null,
  package_id: "topic-analysis",
  topic: UAE_FINTECH_TOPIC,
  questions: questionsText,
  report: { ...report, generationStatus: "pending_payment", status: "draft" },
  created_at: t0,
  shared_public: false,
  shared_at: null,
  status: "pending_payment",
  error_message: null,
});

// shared_public: true → appears under Topics → Archived (Commissioned cards)
const sharedAt = t1;
const readyReport = {
  ...report,
  sharedPublic: true,
  sharedAt,
};
await insert({
  id: randomUUID(),
  token,
  stripe_session_id: `goodwill-seed-${token.slice(0, 12)}`,
  package_id: "topic-analysis",
  topic: UAE_FINTECH_TOPIC,
  questions: questionsText,
  report: readyReport,
  created_at: t1,
  shared_public: true,
  shared_at: sharedAt,
  status: "ready",
  error_message: null,
});

console.log("Seeded UAE Fintech topic analysis (append-only).");
console.log("Topic:", UAE_FINTECH_TOPIC);
console.log("Questions:", UAE_FINTECH_QUESTIONS.length);
console.log("Token:", token);
console.log("");
console.log("Report page:");
console.log(`  https://elenchos.live/research/report/${token}`);
console.log("PDF download:");
console.log(`  https://elenchos.live/api/research/report/${token}?format=pdf`);
