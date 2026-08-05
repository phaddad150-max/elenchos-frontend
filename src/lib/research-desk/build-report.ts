import type { DeskPackageId } from "./packages";
import { DESK_PACKAGES } from "./packages";

/** Per-question analysis (Topics-style) */
export type DeskQuestionAnalysis = {
  question: string;
  answer: string;
  sentimentScore: number | null;
  sentimentLabel: string | null;
  keyPoints: string[];
  confidence: "high" | "medium" | "low" | "insufficient";
};

export type DeskClaim = {
  id: string;
  domain: string;
  statement: string;
  confidence: "high" | "medium" | "low" | "insufficient";
  falsifier: string;
};

export type DeskChapter = {
  id: string;
  number: string;
  title: string;
  summary: string;
  bullets: string[];
};

export type DeskScenario = {
  id: string;
  name: string;
  politics: string;
  techMayAccelerate: string;
  unlikelyFast: string;
};

export type DeskReportStatus =
  | "pending_payment"
  | "paid"
  | "generating"
  | "ready"
  | "failed";

/**
 * Full commissioned report â€” powers Topics-like URL page + PDF + email.
 * Works for topic-analysis and deep-dive packages.
 */
export type DeskReport = {
  token: string;
  packageId: DeskPackageId;
  topic: string;
  questions: string[];
  title: string;
  createdAt: string;
  updatedAt?: string;
  disclaimer: string;
  /** Lifecycle for UI polling */
  generationStatus?: DeskReportStatus;
  generationError?: string;

  /** Topics-style hero */
  overallSentiment?: {
    score: number | null;
    label: string | null;
    trend: string | null;
  };
  divergenceScore?: number | null;
  sampleNote?: string;
  sampleSize?: number | null;

  /** Narrative gap */
  narrativeGap?: {
    headline: string | null;
    citizenFrame: string | null;
    officialMediaFrame: string | null;
    scoreRationale: string | null;
    gapPoints: string[];
  };

  /** Per-user (or standard) Socratic Q&A */
  questionAnalyses?: DeskQuestionAnalysis[];

  keyInsights?: string[];
  claims?: DeskClaim[];
  chapters?: DeskChapter[];
  scenarios?: DeskScenario[];
  methodNotes?: string[];
  limits?: string[];

  /** Legacy flat sections (PDF / fallback) */
  sections: { heading: string; body: string[] }[];

  status: "ready" | "draft";
  sharedPublic?: boolean;
  sharedAt?: string;
  generatedBy?: "ai" | "template" | "hybrid";
};

export function parseQuestions(raw?: string): string[] {
  return (raw ?? "")
    .split("\n")
    .map((l) => l.replace(/^\d+[\).\s:-]+/, "").trim())
    .filter(Boolean)
    .slice(0, 9);
}

export function defaultSocraticQuestions(): string[] {
  return [
    "What do ordinary people emphasize most in public discussion of this topic?",
    "Where do official or media frames diverge from citizen language?",
    "What evidence is strong, thin, or missing?",
    "What would change the main conclusion (falsifiers)?",
    "What practical options follow if the evidence holds?",
  ];
}

/** Structured report â€” template fallback when AI is unavailable. */
export function buildDeskReport(input: {
  token: string;
  packageId: DeskPackageId;
  topic: string;
  questionsRaw?: string;
  generationStatus?: DeskReportStatus;
}): DeskReport {
  const pkg = DESK_PACKAGES[input.packageId];
  const parsed = parseQuestions(input.questionsRaw);
  const qBlock = parsed.length > 0 ? parsed : defaultSocraticQuestions();

  const questionAnalyses: DeskQuestionAnalysis[] = qBlock.map((q) => ({
    question: q,
    answer:
      "Analysis pending or unavailable. Re-run generation after payment, or contact Elenchos if this persists.",
    sentimentScore: null,
    sentimentLabel: null,
    keyPoints: [],
    confidence: "insufficient",
  }));

  const sections: DeskReport["sections"] = [
    {
      heading: "Scope & package",
      body: [
        `Topic: ${input.topic.trim()}`,
        `Package: ${pkg.title} ($${pkg.priceUsd})`,
        `Includes public-discourse (X-style) layer: ${pkg.includesX ? "yes (when sample available)" : "no"}`,
        "This report is a structured research product, not legal, medical, or investment advice.",
      ],
    },
    {
      heading: "Your questions",
      body: qBlock.map((q, i) => `${i + 1}. ${q}`),
    },
    {
      heading: "Method",
      body: [
        pkg.delivers,
        "Empty stays empty: no invented polls or fabricated citations.",
        "Directional insights only â€” not a national census.",
      ],
    },
    {
      heading: "Limits",
      body: [
        "Not a substitute for counsel, regulators, or licensed professionals.",
        "No private data scraping or illegal acquisition of information.",
        "AI-assisted structure may be used; verify primary sources.",
      ],
    },
  ];

  return {
    token: input.token,
    packageId: input.packageId,
    topic: input.topic.trim(),
    questions: qBlock,
    title: `Elenchos report Â· ${input.topic.trim().slice(0, 80)}`,
    createdAt: new Date().toISOString(),
    disclaimer:
      "Research tool provided as-is. Not legal, medical, or investment advice. No warranty of completeness.",
    generationStatus: input.generationStatus ?? "ready",
    overallSentiment: { score: null, label: null, trend: null },
    divergenceScore: null,
    sampleNote: "No live sample attached to this template fallback.",
    sampleSize: null,
    narrativeGap: {
      headline: null,
      citizenFrame: null,
      officialMediaFrame: null,
      scoreRationale: null,
      gapPoints: [],
    },
    questionAnalyses,
    keyInsights: [],
    claims: [],
    chapters: [],
    scenarios: [],
    methodNotes: [pkg.delivers],
    limits: sections.find((s) => s.heading === "Limits")?.body ?? [],
    sections,
    status: "draft",
    generatedBy: "template",
  };
}

/** Flatten rich report into sections for PDF / plain text. */
export function reportToSections(r: DeskReport): { heading: string; body: string[] }[] {
  if (r.sections?.length && r.generatedBy === "template" && !r.questionAnalyses?.some((q) => q.answer && !q.answer.includes("pending"))) {
    return r.sections;
  }

  const out: { heading: string; body: string[] }[] = [];
  out.push({
    heading: "Scope",
    body: [
      `Title: ${r.title}`,
      `Topic: ${r.topic}`,
      `Package: ${DESK_PACKAGES[r.packageId]?.title ?? r.packageId}`,
      r.disclaimer,
    ],
  });

  if (r.overallSentiment || r.divergenceScore != null) {
    out.push({
      heading: "Headline metrics",
      body: [
        `Sentiment: ${r.overallSentiment?.score ?? "â€”"} (${r.overallSentiment?.label ?? "â€”"})`,
        `Divergence: ${r.divergenceScore ?? "â€”"}`,
        r.sampleNote ?? "",
      ].filter(Boolean),
    });
  }

  if (r.narrativeGap) {
    const g = r.narrativeGap;
    out.push({
      heading: "Narrative gap",
      body: [
        g.headline ? `Headline: ${g.headline}` : "",
        g.citizenFrame ? `Citizens: ${g.citizenFrame}` : "",
        g.officialMediaFrame ? `Official / media: ${g.officialMediaFrame}` : "",
        g.scoreRationale ? `Rationale: ${g.scoreRationale}` : "",
        ...(g.gapPoints ?? []).map((p) => `Â· ${p}`),
      ].filter(Boolean),
    });
  }

  if (r.questionAnalyses?.length) {
    out.push({
      heading: "Question analysis",
      body: r.questionAnalyses.flatMap((q, i) => [
        `Q${i + 1}. ${q.question}`,
        `Answer: ${q.answer}`,
        q.sentimentScore != null
          ? `Sentiment: ${q.sentimentScore} (${q.sentimentLabel ?? "â€”"}) Â· confidence ${q.confidence}`
          : `Confidence: ${q.confidence}`,
        ...q.keyPoints.map((k) => `  Â· ${k}`),
        "",
      ]),
    });
  }

  if (r.keyInsights?.length) {
    out.push({ heading: "Key insights", body: r.keyInsights.map((k) => `Â· ${k}`) });
  }

  if (r.claims?.length) {
    out.push({
      heading: "Claims",
      body: r.claims.map(
        (c) =>
          `${c.id} [${c.confidence}] ${c.domain}: ${c.statement} Â· Falsifier: ${c.falsifier}`,
      ),
    });
  }

  if (r.chapters?.length) {
    for (const ch of r.chapters) {
      out.push({
        heading: `${ch.number} ${ch.title}`,
        body: [ch.summary, ...ch.bullets.map((b) => `Â· ${b}`)],
      });
    }
  }

  if (r.scenarios?.length) {
    out.push({
      heading: "Scenarios",
      body: r.scenarios.flatMap((s) => [
        `${s.id} Â· ${s.name}`,
        `Politics: ${s.politics}`,
        `Tech may accelerate: ${s.techMayAccelerate}`,
        `Unlikely fast: ${s.unlikelyFast}`,
        "",
      ]),
    });
  }

  if (r.methodNotes?.length) {
    out.push({ heading: "Method", body: r.methodNotes });
  }
  if (r.limits?.length) {
    out.push({ heading: "Limits", body: r.limits });
  }

  return out.length ? out : r.sections;
}

export function reportToPlainText(r: DeskReport): string {
  const sections = reportToSections(r);
  const lines = [
    r.title,
    `Token: ${r.token}`,
    `Created: ${r.createdAt}`,
    r.disclaimer,
    "",
    ...sections.flatMap((s) => [`## ${s.heading}`, ...s.body, ""]),
    "â€” elenchos.live Research Desk",
  ];
  return lines.join("\n");
}
/**
 * Multi-page text PDF (Helvetica, ~52 lines/page).
 * Readable export of the same content as the report URL.
 */
export function reportToPdfBytes(r: DeskReport): Uint8Array {
  const text = reportToPlainText(r);
  const rawLines = text.split(/\r?\n/);
  const wrapped: string[] = [];
  for (const line of rawLines) {
    const clean = line
      .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "?")
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
    if (clean.length <= 88) {
      wrapped.push(clean);
      continue;
    }
    let rest = clean;
    while (rest.length > 88) {
      let cut = rest.lastIndexOf(" ", 88);
      if (cut < 40) cut = 88;
      wrapped.push(rest.slice(0, cut));
      rest = rest.slice(cut).trimStart();
    }
    if (rest) wrapped.push(rest);
  }

  const linesPerPage = 52;
  const pages: string[][] = [];
  for (let i = 0; i < wrapped.length; i += linesPerPage) {
    pages.push(wrapped.slice(i, i + linesPerPage));
  }
  if (pages.length === 0) pages.push(["(empty report)"]);

  const enc = new TextEncoder();
  type PdfObj = { id: number; raw: string };
  const list: PdfObj[] = [];
  list.push({ id: 1, raw: "1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n" });
  list.push({
    id: 3,
    raw: "3 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n",
  });

  const pageIds: number[] = [];
  let nextId = 4;
  for (const pageLines of pages) {
    const contentId = nextId++;
    const pageId = nextId++;
    pageIds.push(pageId);
    const contentParts = ["BT", "/F1 10 Tf", "50 780 Td", "13 TL"];
    pageLines.forEach((line, idx) => {
      if (idx === 0) contentParts.push(`(${line}) Tj`);
      else contentParts.push(`T* (${line}) Tj`);
    });
    contentParts.push("ET");
    const stream = contentParts.join("\n");
    const streamBytes = enc.encode(stream).length;
    list.push({
      id: contentId,
      raw: `${contentId} 0 obj<< /Length ${streamBytes} >>stream\n${stream}\nendstream\nendobj\n`,
    });
    list.push({
      id: pageId,
      raw: `${pageId} 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentId} 0 R /Resources << /Font << /F1 3 0 R >> >> >>endobj\n`,
    });
  }
  const kids = pageIds.map((id) => `${id} 0 R`).join(" ");
  list.push({
    id: 2,
    raw: `2 0 obj<< /Type /Pages /Kids [ ${kids} ] /Count ${pageIds.length} >>endobj\n`,
  });

  list.sort((a, b) => a.id - b.id);
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const o of list) {
    offsets[o.id] = enc.encode(pdf).length;
    pdf += o.raw;
  }
  const maxId = Math.max(...list.map((o) => o.id));
  const xrefPos = enc.encode(pdf).length;
  pdf += `xref\n0 ${maxId + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let id = 1; id <= maxId; id++) {
    const off = offsets[id];
    if (off == null) pdf += "0000000000 65535 f \n";
    else pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer<< /Size ${maxId + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  return enc.encode(pdf);
}
