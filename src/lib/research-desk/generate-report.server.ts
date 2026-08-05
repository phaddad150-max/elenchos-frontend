/**
 * Generate commissioned Research Desk reports via SpaceXAI (xAI).
 * Server-only. Never invents primary sources as verified facts.
 */
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateObject } from "ai";
import { z } from "zod";
import {
  buildDeskReport,
  defaultSocraticQuestions,
  parseQuestions,
  type DeskReport,
} from "./build-report";
import { DESK_PACKAGES, type DeskPackageId } from "./packages";

const confEnum = z.enum(["high", "medium", "low", "insufficient"]);

const AnalysisSchema = z.object({
  title: z.string(),
  overallSentiment: z.object({
    score: z.number().min(0).max(100).nullable(),
    label: z.string().nullable(),
    trend: z.string().nullable(),
  }),
  divergenceScore: z.number().min(0).max(100).nullable(),
  sampleNote: z.string(),
  sampleSize: z.number().nullable(),
  narrativeGap: z.object({
    headline: z.string().nullable(),
    citizenFrame: z.string(),
    officialMediaFrame: z.string(),
    scoreRationale: z.string().nullable(),
    gapPoints: z.array(z.string()).max(8),
  }),
  questionAnalyses: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
        sentimentScore: z.number().min(0).max(100).nullable(),
        sentimentLabel: z.string().nullable(),
        keyPoints: z.array(z.string()).max(6),
        confidence: confEnum,
      }),
    )
    .max(9),
  keyInsights: z.array(z.string()).max(8),
  claims: z
    .array(
      z.object({
        id: z.string(),
        domain: z.string(),
        statement: z.string(),
        confidence: confEnum,
        falsifier: z.string(),
      }),
    )
    .max(8),
  chapters: z
    .array(
      z.object({
        id: z.string(),
        number: z.string(),
        title: z.string(),
        summary: z.string(),
        bullets: z.array(z.string()).max(6),
      }),
    )
    .max(10),
  scenarios: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        politics: z.string(),
        techMayAccelerate: z.string(),
        unlikelyFast: z.string(),
      }),
    )
    .max(5),
  methodNotes: z.array(z.string()).max(8),
  limits: z.array(z.string()).max(8),
});

function xaiClient() {
  const apiKey =
    process.env.XAI_API_KEY?.trim() ||
    process.env.SPACEXAI_API_KEY?.trim() ||
    process.env.GROK_API_KEY?.trim() ||
    "";
  if (!apiKey) return null;
  return createOpenAICompatible({
    name: "xai",
    baseURL: "https://api.x.ai/v1",
    apiKey,
  });
}

function packagePrompt(packageId: DeskPackageId): string {
  if (packageId === "topic-analysis") {
    return `You produce a public-discourse topic analysis in the Elenchos Topics style.
Focus on: citizen frames vs official/media frames, Socratic answers to each user question,
directional sentiment (0-100) and narrative divergence (0-100) when you can reason about them,
key insights, 3-5 claims with falsifiers, method notes and hard limits.
Do NOT invent live post counts, usernames, or verbatim quotes from X.
If no live sample was provided, set sampleSize null and sampleNote explaining directional open-source reasoning only.
Chapters can be empty for topic-analysis. Prefer rich questionAnalyses.`;
  }
  if (packageId === "deep-no-x") {
    return `You produce a thesis-style multi-source research brief WITHOUT a public X discourse sample.
Focus on: chapters (evidence map), claims with confidence + falsifiers, conditional scenarios,
method and limits. Citizen discourse scores may be null. questionAnalyses should still answer each user question
from open-source / structural reasoning only. Never invent primary-document citations as verified.`;
  }
  return `You produce a thesis-style multi-source brief PLUS a discourse layer.
If no live X sample is attached, state that clearly in sampleNote and keep discourse claims low-confidence / insufficient.
Include chapters, claims, scenarios, and full questionAnalyses. Never invent usernames or post text.`;
}

/**
 * Generate full DeskReport after payment.
 * Falls back to enhanced template if XAI_API_KEY missing or model fails.
 */
export async function generateCommissionedReport(input: {
  token: string;
  packageId: DeskPackageId;
  topic: string;
  questionsRaw: string;
}): Promise<DeskReport> {
  const pkg = DESK_PACKAGES[input.packageId];
  const questions = parseQuestions(input.questionsRaw);
  const qBlock = questions.length > 0 ? questions : defaultSocraticQuestions();
  const fallback = buildDeskReport({
    token: input.token,
    packageId: input.packageId,
    topic: input.topic,
    questionsRaw: input.questionsRaw,
    generationStatus: "ready",
  });

  const client = xaiClient();
  if (!client) {
    console.warn("[research-desk] XAI_API_KEY missing — template fallback with user questions preserved");
    return {
      ...fallback,
      questions: qBlock,
      questionAnalyses: qBlock.map((q) => ({
        question: q,
        answer:
          "AI generation is not configured on this deployment (missing XAI_API_KEY). Your questions were saved. Contact Elenchos to regenerate this briefing, or set XAI_API_KEY and re-run finalize.",
        sentimentScore: null,
        sentimentLabel: null,
        keyPoints: [],
        confidence: "insufficient" as const,
      })),
      generationStatus: "ready",
      generatedBy: "template",
      status: "draft",
    };
  }

  try {
    const modelName =
      process.env.XAI_MODEL?.trim() ||
      process.env.SPACEXAI_MODEL?.trim() ||
      "grok-4-1-fast-reasoning";

    const { object } = await generateObject({
      model: client.chatModel(modelName),
      schema: AnalysisSchema,
      temperature: 0.35,
      system: `You are the Elenchos Research Desk analyst.
DNA: truth-seeking, defender of ordinary people, free speech, empty stays empty.
Never invent polls, vote shares, or primary-source quotes. Mark confidence honestly.
Output is experimental research, not legal/medical/investment advice.
${packagePrompt(input.packageId)}`,
      prompt: [
        `Package: ${pkg.title} ($${pkg.priceUsd})`,
        `Topic: ${input.topic.trim()}`,
        `User questions (answer EACH one in questionAnalyses, same order):`,
        ...qBlock.map((q, i) => `${i + 1}. ${q}`),
        "",
        "Produce a complete structured briefing for the web report page.",
      ].join("\n"),
    });

    // Ensure every user question appears
    const qaByQ = new Map(
      object.questionAnalyses.map((q) => [q.question.trim().toLowerCase(), q]),
    );
    const questionAnalyses = qBlock.map((q) => {
      const hit =
        qaByQ.get(q.trim().toLowerCase()) ||
        object.questionAnalyses.find((a) =>
          a.question.toLowerCase().includes(q.slice(0, 40).toLowerCase()),
        );
      if (hit) {
        return {
          question: q,
          answer: hit.answer,
          sentimentScore: hit.sentimentScore,
          sentimentLabel: hit.sentimentLabel,
          keyPoints: hit.keyPoints ?? [],
          confidence: hit.confidence,
        };
      }
      return {
        question: q,
        answer: "No structured answer returned for this question — treat as insufficient evidence.",
        sentimentScore: null,
        sentimentLabel: null,
        keyPoints: [] as string[],
        confidence: "insufficient" as const,
      };
    });

    const sections: DeskReport["sections"] = [
      {
        heading: "Scope & package",
        body: [
          `Topic: ${input.topic.trim()}`,
          `Package: ${pkg.title}`,
          object.sampleNote,
        ],
      },
      {
        heading: "Headline metrics",
        body: [
          `Sentiment: ${object.overallSentiment.score ?? "—"} (${object.overallSentiment.label ?? "—"})`,
          `Divergence: ${object.divergenceScore ?? "—"}`,
        ],
      },
      {
        heading: "Narrative gap",
        body: [
          object.narrativeGap.headline ?? "",
          `Citizens: ${object.narrativeGap.citizenFrame}`,
          `Official/media: ${object.narrativeGap.officialMediaFrame}`,
          ...object.narrativeGap.gapPoints.map((p) => `· ${p}`),
        ].filter(Boolean),
      },
      {
        heading: "Question analysis",
        body: questionAnalyses.flatMap((q, i) => [
          `Q${i + 1}. ${q.question}`,
          q.answer,
          ...q.keyPoints.map((k) => `· ${k}`),
        ]),
      },
      {
        heading: "Key insights",
        body: object.keyInsights.map((k) => `· ${k}`),
      },
      {
        heading: "Claims",
        body: object.claims.map(
          (c) => `${c.id} [${c.confidence}] ${c.statement} · Falsifier: ${c.falsifier}`,
        ),
      },
      {
        heading: "Method",
        body: object.methodNotes,
      },
      {
        heading: "Limits",
        body: object.limits,
      },
    ];

    const report: DeskReport = {
      token: input.token,
      packageId: input.packageId,
      topic: input.topic.trim(),
      questions: qBlock,
      title: object.title.slice(0, 160) || `Elenchos report · ${input.topic.trim().slice(0, 80)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      disclaimer:
        "Research tool provided as-is. Not legal, medical, or investment advice. Directional experimental analysis.",
      generationStatus: "ready",
      overallSentiment: object.overallSentiment,
      divergenceScore: object.divergenceScore,
      sampleNote: object.sampleNote,
      sampleSize: object.sampleSize,
      narrativeGap: object.narrativeGap,
      questionAnalyses,
      keyInsights: object.keyInsights,
      claims: object.claims,
      chapters: object.chapters,
      scenarios: object.scenarios,
      methodNotes: object.methodNotes,
      limits: object.limits,
      sections,
      status: "ready",
      generatedBy: "ai",
    };
    return report;
  } catch (e) {
    console.error("[research-desk] AI generate failed", e);
    return {
      ...fallback,
      questions: qBlock,
      generationStatus: "ready",
      generationError: e instanceof Error ? e.message : "Generation failed",
      generatedBy: "template",
      questionAnalyses: qBlock.map((q) => ({
        question: q,
        answer:
          "Automated analysis failed for this run. Your topic and questions were saved. Contact Elenchos for a re-run, or refresh after ops retry generation.",
        sentimentScore: null,
        sentimentLabel: null,
        keyPoints: [],
        confidence: "insufficient" as const,
      })),
      status: "draft",
    };
  }
}
