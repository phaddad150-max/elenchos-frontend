import type { DeskPackageId } from "./packages";
import { DESK_PACKAGES } from "./packages";

export type DeskReport = {
  token: string;
  packageId: DeskPackageId;
  topic: string;
  questions: string[];
  title: string;
  createdAt: string;
  disclaimer: string;
  sections: { heading: string; body: string[] }[];
  status: "ready" | "draft";
  /** Opt-in: listed in public Research library for others to read */
  sharedPublic?: boolean;
  sharedAt?: string;
};

/** Structured report template — no personal data; content only. */
export function buildDeskReport(input: {
  token: string;
  packageId: DeskPackageId;
  topic: string;
  questionsRaw?: string;
}): DeskReport {
  const pkg = DESK_PACKAGES[input.packageId];
  const questions = (input.questionsRaw ?? "")
    .split("\n")
    .map((l) => l.replace(/^\d+[\).\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 9);

  const qBlock =
    questions.length > 0
      ? questions
      : [
          "What do ordinary people emphasize most in public discussion of this topic?",
          "Where do official or media frames diverge from citizen language?",
          "What evidence is strong, thin, or missing?",
          "What would change the main conclusion (falsifiers)?",
          "What practical options follow if the evidence holds?",
        ];

  const sections: DeskReport["sections"] = [
    {
      heading: "Scope & package",
      body: [
        `Topic: ${input.topic.trim()}`,
        `Package: ${pkg.title} ($${pkg.priceUsd})`,
        `Includes public-discourse (X-style) layer: ${pkg.includesX ? "yes (capped sample method)" : "no"}`,
        "This report is a structured research product, not legal, medical, or investment advice.",
      ],
    },
    {
      heading: "Method (what this delivers)",
      body: [
        pkg.delivers,
        "Evidence rails are separated: (A) open/official sources where available, (B) media frames, (C) public discourse themes when included.",
        "Empty stays empty: no invented polls or fabricated citations.",
        "Human review may refine claims before final wording; first delivery is a structured starter brief you can iterate.",
      ],
    },
    {
      heading: "Guiding questions",
      body: qBlock.map((q, i) => `${i + 1}. ${q}`),
    },
    {
      heading: "Working findings (starter frame)",
      body: [
        `Public and open sources on “${input.topic.trim()}” should be triaged for primary vs secondary material before strong claims.`,
        pkg.includesX
          ? "Discourse layer: treat X/public social as attitudes and frames only — never as a census or court-grade fact spine."
          : "No X layer in this package: conclusions about street mood stay out of scope unless added in a later order.",
        "Map actors, incentives, and timelines next; attach URLs and dates to every quantitative claim.",
        "Flag where EU/US official series, industry filings, or academic reviews are required before publication use.",
      ],
    },
    {
      heading: "Claims template (fill with evidence)",
      body: [
        "Claim 1 (high bar): … · Confidence: … · Falsifier: …",
        "Claim 2: … · Confidence: … · Falsifier: …",
        "Claim 3: … · Confidence: … · Falsifier: …",
      ],
    },
    {
      heading: "Limits (read carefully)",
      body: [
        "Not a substitute for counsel, regulators, or licensed professionals.",
        "No private data scraping, no doxxing, no illegal acquisition of information.",
        "AI-assisted structure may be used; errors are possible — verify primary sources.",
        "Elenchos does not store payment card data or researcher identity dossiers.",
      ],
    },
  ];

  return {
    token: input.token,
    packageId: input.packageId,
    topic: input.topic.trim(),
    questions: qBlock,
    title: `Elenchos report · ${input.topic.trim().slice(0, 80)}`,
    createdAt: new Date().toISOString(),
    disclaimer:
      "Research tool provided as-is. Not legal, medical, or investment advice. No warranty of completeness.",
    sections,
    status: "ready",
  };
}

export function reportToPlainText(r: DeskReport): string {
  const lines = [
    r.title,
    `Token: ${r.token}`,
    `Created: ${r.createdAt}`,
    r.disclaimer,
    "",
    ...r.sections.flatMap((s) => [`## ${s.heading}`, ...s.body, ""]),
    "— elenchos.live Research Desk",
  ];
  return lines.join("\n");
}

/** Minimal multi-page text PDF (no external deps). */
export function reportToPdfBytes(r: DeskReport): Uint8Array {
  const text = reportToPlainText(r);
  const escaped = text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\r/g, "");
  const lines = escaped.split("\n");
  const contentLines: string[] = ["BT", "/F1 10 Tf", "50 780 Td", "14 TL"];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.slice(0, 90);
    if (i === 0) contentLines.push(`(${line}) Tj`);
    else contentLines.push(`T* (${line}) Tj`);
  }
  contentLines.push("ET");
  const stream = contentLines.join("\n");
  const objects: string[] = [];
  objects.push("1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n");
  objects.push("2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n");
  objects.push(
    "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj\n",
  );
  objects.push(
    `4 0 obj<< /Length ${stream.length} >>stream\n${stream}\nendstream\nendobj\n`,
  );
  objects.push("5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n");

  const enc = new TextEncoder();
  const byteLen = (s: string) => enc.encode(s).length;
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(byteLen(pdf));
    pdf += obj;
  }
  const xrefPos = byteLen(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  return enc.encode(pdf);
}
