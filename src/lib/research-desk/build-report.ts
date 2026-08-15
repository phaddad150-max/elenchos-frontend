import type { DeskPackageId } from "./packages";
import { DESK_PACKAGES } from "./packages";

/** Per-question analysis (Topics-style) */
export type DeskQuestionAnalysis = {
  question: string;
  answer: string;
  /** Short insight headline for cards — never the full Socratic question */
  cardTitle?: string | null;
  sentimentScore: number | null;
  sentimentLabel: string | null;
  keyPoints: string[];
  confidence: "high" | "medium" | "low" | "insufficient";
  theme?: string | null;
};

/** Structured gap point matching live NarrativeGapPanel */
export type DeskGapPoint = {
  claim_citizen?: string | null;
  claim_official_media?: string | null;
  why_it_matters?: string | null;
};

/** Pass-2 style narrative thread */
export type DeskInsightThread = {
  theme?: string;
  headline?: string;
  summary?: string;
  confidence?: string;
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
    /** Brief synthesis overview (optional) */
    fullOverview?: string | null;
    /** Structured preferred; strings accepted for legacy hybrid seeds */
    gapPoints: Array<string | DeskGapPoint>;
  };

  /** Per-user (or standard) Socratic Q&A */
  questionAnalyses?: DeskQuestionAnalysis[];

  keyInsights?: string[];
  /** Pass-2 style threads (preferred over flat keyInsights for UI) */
  insightThreads?: DeskInsightThread[];
  /** Pass-2 curated hero (preferred for synthesis block) */
  curatedSynthesis?: {
    headline?: string | null;
    summary?: string | null;
    confidence?: string | null;
  };
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

function pdfSafe(s: string): string {
  return (s ?? "")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, (ch) => {
      // Keep common punctuation substitutes
      if (ch === "·" || ch === "•") return "-";
      if (ch === "—" || ch === "–") return "-";
      if (ch === "“" || ch === "”" || ch === "„") return '"';
      if (ch === "‘" || ch === "’") return "'";
      if (ch === "…") return "...";
      return "?";
    })
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapPdfLine(line: string, width = 86): string[] {
  const clean = pdfSafe(line);
  if (clean.length <= width) return [clean];
  const out: string[] = [];
  let rest = clean;
  while (rest.length > width) {
    let cut = rest.lastIndexOf(" ", width);
    if (cut < width * 0.45) cut = width;
    out.push(rest.slice(0, cut));
    rest = rest.slice(cut).trimStart();
  }
  if (rest) out.push(rest);
  return out;
}

function gapPointLine(p: string | DeskGapPoint): string {
  if (typeof p === "string") return `- ${p}`;
  const cit = (p.claim_citizen ?? "").trim();
  const off = (p.claim_official_media ?? "").trim();
  const why = (p.why_it_matters ?? "").trim();
  if (cit && off) return `- ${why ? why + ": " : ""}Citizens: ${cit} | Official: ${off}`;
  return `- ${why || cit || off}`;
}

/**
 * Structured sections for PDF/TXT — mirrors Topics page order, not a raw dump.
 * Skips long disclaimers, tokens, and redundant sections blocks.
 */
export function reportToSections(r: DeskReport): { heading: string; body: string[] }[] {
  const out: { heading: string; body: string[] }[] = [];
  const pkgTitle = DESK_PACKAGES[r.packageId]?.title ?? r.packageId;

  out.push({
    heading: "Topic briefing",
    body: [
      r.topic,
      `Package: ${pkgTitle}`,
      r.sampleSize != null && r.sampleSize > 0
        ? `Sample: ${r.sampleSize} posts`
        : "Sample: directional (no live X count)",
    ],
  });

  out.push({
    heading: "Headline metrics",
    body: [
      `Sentiment: ${r.overallSentiment?.score ?? "-"} (${r.overallSentiment?.label ?? "-"})`,
      `Divergence: ${r.divergenceScore ?? "-"}`,
      r.sampleNote && r.sampleSize
        ? r.sampleNote.slice(0, 200)
        : "",
    ].filter(Boolean),
  });

  if (r.curatedSynthesis?.headline || r.curatedSynthesis?.summary) {
    out.push({
      heading: "Curated synthesis",
      body: [
        r.curatedSynthesis.headline ?? "",
        r.curatedSynthesis.summary ?? "",
      ].filter(Boolean),
    });
  }

  if (r.narrativeGap) {
    const g = r.narrativeGap;
    const gapLines = (g.gapPoints ?? []).map(gapPointLine);
    out.push({
      heading: "Narrative gap · citizen vs official / media",
      body: [
        g.headline ? g.headline : "",
        g.scoreRationale ? `Why this score: ${g.scoreRationale}` : "",
        g.citizenFrame ? `Citizens: ${g.citizenFrame}` : "",
        g.officialMediaFrame ? `Official / media: ${g.officialMediaFrame}` : "",
        ...gapLines,
      ].filter(Boolean),
    });
  }

  if (r.insightThreads?.length) {
    out.push({
      heading: "Narrative threads",
      body: r.insightThreads.map((t, i) => {
        const head = t.headline || t.summary || `Thread ${i + 1}`;
        const theme = t.theme ? `[${t.theme}] ` : "";
        const sum = t.summary && t.summary !== head ? ` - ${t.summary}` : "";
        return `${i + 1}. ${theme}${head}${sum}`;
      }),
    });
  } else if (r.keyInsights?.length) {
    out.push({
      heading: "Narrative threads",
      body: r.keyInsights.slice(0, 6).map((k, i) => `${i + 1}. ${k}`),
    });
  }

  if (r.questionAnalyses?.length) {
    out.push({
      heading: "Key insights",
      body: r.questionAnalyses.flatMap((q, i) => {
        const title = q.cardTitle?.trim() || q.question.slice(0, 90);
        const score =
          q.sentimentScore != null ? ` [${q.sentimentScore}]` : "";
        return [
          `${i + 1}. ${title}${score}`,
          q.answer,
          ...(q.keyPoints ?? []).slice(0, 3).map((k) => `   - ${k}`),
          "",
        ];
      }),
    });
  }

  if (r.packageId !== "topic-analysis" && r.claims?.length) {
    out.push({
      heading: "Claims",
      body: r.claims.map(
        (c) =>
          `${c.id} [${c.confidence}] ${c.domain}: ${c.statement} | Falsifier: ${c.falsifier}`,
      ),
    });
  }

  if (r.packageId !== "topic-analysis" && r.chapters?.length) {
    for (const ch of r.chapters) {
      out.push({
        heading: `${ch.number} ${ch.title}`,
        body: [ch.summary, ...ch.bullets.map((b) => `- ${b}`)],
      });
    }
  }

  // Short method only (max 4 bullets) — no wall of ops notes
  const method = (r.methodNotes ?? []).slice(0, 4);
  const limits = (r.limits ?? []).slice(0, 4);
  if (method.length || limits.length) {
    out.push({
      heading: "Method & limits",
      body: [
        ...method.map((m) => `- ${m}`),
        ...limits.map((m) => `- ${m}`),
      ],
    });
  }

  return out;
}

export function reportToPlainText(r: DeskReport): string {
  const sections = reportToSections(r);
  const lines = [
    "ELENCHOS · Public Discourse Lens x Research Desk",
    r.title,
    r.topic,
    "",
    ...sections.flatMap((s) => [`## ${s.heading}`, ...s.body, ""]),
    "elenchos.live",
  ];
  return lines.join("\n");
}

/**
 * Branded multi-page PDF mirroring Topics briefing structure:
 * header brand · metrics · synthesis · gap · threads · insights · method.
 * No raw token dumps, no duplicated section walls.
 */
export function reportToPdfBytes(r: DeskReport): Uint8Array {
  const sections = reportToSections(r);
  const lines: Array<{ text: string; size: number; gapAfter?: number }> = [];

  const push = (text: string, size = 10, gapAfter = 0) => {
    for (const w of wrapPdfLine(text, size >= 14 ? 52 : size >= 12 ? 62 : 86)) {
      lines.push({ text: w, size, gapAfter });
    }
    if (gapAfter) lines[lines.length - 1]!.gapAfter = gapAfter;
  };

  push("ELENCHOS", 11, 2);
  push("Public Discourse Lens x Research Desk", 9, 8);
  push(r.topic || r.title, 14, 4);
  const kind =
    r.generatedBy === "hybrid" || r.packageId === "topic-analysis"
      ? "Topic briefing"
      : r.packageId.startsWith("deep")
        ? "Multi-source briefing"
        : "Research briefing";
  push(`${kind} · elenchos.live`, 9, 10);

  const sent = r.overallSentiment?.score ?? "-";
  const div = r.divergenceScore ?? "-";
  const sample =
    r.sampleSize != null && r.sampleSize > 0 ? String(r.sampleSize) : "-";
  push(
    `Sentiment ${sent}   |   Divergence ${div}   |   Sample ${sample}`,
    11,
    14,
  );

  for (const sec of sections) {
    if (sec.heading === "Topic briefing" || sec.heading === "Headline metrics") {
      continue; // already in header strip
    }
    push(sec.heading.toUpperCase(), 11, 6);
    for (const b of sec.body) {
      if (!b?.trim()) {
        lines.push({ text: " ", size: 8, gapAfter: 4 });
        continue;
      }
      push(b, 10, 3);
    }
    lines.push({ text: " ", size: 8, gapAfter: 8 });
  }

  push("elenchos.live · experimental research · not legal advice", 8, 0);

  // Paginate with variable line heights
  const pageH = 792;
  const marginTop = 56;
  const marginBottom = 48;
  const usable = pageH - marginTop - marginBottom;
  const pages: Array<Array<{ text: string; size: number; y: number }>> = [];
  let page: Array<{ text: string; size: number; y: number }> = [];
  let y = pageH - marginTop;

  const flush = () => {
    if (page.length) pages.push(page);
    page = [];
    y = pageH - marginTop;
  };

  for (const line of lines) {
    const lh = line.size + 3 + (line.gapAfter ?? 0);
    if (y - lh < marginBottom) flush();
    page.push({ text: line.text, size: line.size, y });
    y -= lh;
  }
  flush();
  if (pages.length === 0) {
    pages.push([{ text: "(empty report)", size: 10, y: pageH - marginTop }]);
  }

  const enc = new TextEncoder();
  type PdfObj = { id: number; raw: string };
  const list: PdfObj[] = [];
  list.push({ id: 1, raw: "1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n" });
  list.push({
    id: 3,
    raw: "3 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n",
  });
  list.push({
    id: 4,
    raw: "4 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>endobj\n",
  });

  const pageIds: number[] = [];
  let nextId = 5;
  const totalPages = pages.length;

  pages.forEach((pageLines, pageIndex) => {
    const contentId = nextId++;
    const pageId = nextId++;
    pageIds.push(pageId);

    const ops: string[] = [];
    // subtle top brand bar
    ops.push("0.75 0.88 0.92 rg");
    ops.push("0 760 612 32 re f");
    ops.push("0.15 0.55 0.65 RG 1.5 w");
    ops.push("40 758 m 572 758 l S");

    for (const pl of pageLines) {
      const font = pl.size >= 11 ? "/F2" : "/F1";
      ops.push("BT");
      ops.push(`${font} ${pl.size} Tf`);
      ops.push("0.12 0.14 0.18 rg");
      ops.push(`50 ${pl.y.toFixed(1)} Td`);
      ops.push(`(${pl.text}) Tj`);
      ops.push("ET");
    }

    // footer
    const footer = pdfSafe(
      `elenchos.live  ·  ${pageIndex + 1} / ${totalPages}`,
    );
    ops.push("BT /F1 8 Tf 0.45 0.48 0.52 rg 50 28 Td");
    ops.push(`(${footer}) Tj ET`);

    const stream = ops.join("\n");
    const streamBytes = enc.encode(stream).length;
    list.push({
      id: contentId,
      raw: `${contentId} 0 obj<< /Length ${streamBytes} >>stream\n${stream}\nendstream\nendobj\n`,
    });
    list.push({
      id: pageId,
      raw: `${pageId} 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentId} 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> >>endobj\n`,
    });
  });

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
