import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { parseQuestions } from "@/lib/research-desk/build-report";
import { generateCommissionedReport } from "@/lib/research-desk/generate-report.server";
import { isDeskPackageId } from "@/lib/research-desk/packages";
import {
  appendCommissionEvent,
  createPendingCommission,
} from "@/lib/research-desk/store.server";
import {
  notifyOpsReportReady,
} from "@/lib/research-desk/email.server";
import {
  buildUaeFintechReport,
  UAE_FINTECH_QUESTIONS,
  UAE_FINTECH_TOPIC,
} from "@/lib/research-desk/seeds/uae-fintech-dominance";

/**
 * Ops-only: create commission + generate report WITHOUT Stripe.
 * Header: x-admin-secret: ADMIN_SECRET (or RESEARCH_ADMIN_SECRET)
 *
 * Body modes:
 * - { "seed": "uae-fintech" } → goodwill first commission recovery
 * - { packageId, topic, questions, useAi?: boolean }
 */
const BodySchema = z.object({
  seed: z.enum(["uae-fintech"]).optional(),
  packageId: z.string().optional(),
  topic: z.string().trim().min(8).max(8000).optional(),
  questions: z.string().trim().max(16000).optional(),
  /** default true when not using curated seed */
  useAi: z.boolean().optional(),
});

function siteOrigin(request: Request): string {
  const env = process.env.SITE_URL?.trim() || process.env.VITE_SITE_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  if (host) return `${proto}://${host}`;
  return "https://elenchos.live";
}

function assertAdmin(request: Request): boolean {
  const secret =
    process.env.ADMIN_SECRET?.trim() ||
    process.env.RESEARCH_ADMIN_SECRET?.trim() ||
    "";
  if (!secret) return false;
  const hdr = request.headers.get("x-admin-secret")?.trim() || "";
  return hdr.length > 0 && hdr === secret;
}

export const Route = createFileRoute("/api/research/admin/commission")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          if (!assertAdmin(request)) {
            return Response.json(
              {
                error:
                  "Unauthorized. Set ADMIN_SECRET (or RESEARCH_ADMIN_SECRET) and pass header x-admin-secret.",
              },
              { status: 401 },
            );
          }

          const json = await request.json().catch(() => null);
          const parsed = BodySchema.safeParse(json);
          if (!parsed.success) {
            return Response.json({ error: "Invalid body" }, { status: 400 });
          }

          const token = crypto.randomUUID().replace(/-/g, "");
          const origin = siteOrigin(request);

          // ── Seed: UAE Fintech goodwill re-run ─────────────────────
          if (parsed.data.seed === "uae-fintech") {
            const questionsText = UAE_FINTECH_QUESTIONS.map(
              (q, i) => `${i + 1}. ${q}`,
            ).join("\n");

            await createPendingCommission({
              token,
              packageId: "topic-analysis",
              topic: UAE_FINTECH_TOPIC,
              questions: questionsText,
            });

            const report = buildUaeFintechReport(token);
            await appendCommissionEvent(token, {
              status: "ready",
              report,
              errorMessage: null,
              stripeSessionId: `goodwill-seed-${token.slice(0, 12)}`,
            });

            const reportUrl = `${origin}/research/report/${token}`;
            const pdfUrl = `${origin}/api/research/report/${token}?format=pdf`;

            await notifyOpsReportReady({
              token,
              topic: UAE_FINTECH_TOPIC,
              packageId: "topic-analysis",
              reportUrl,
              pdfUrl,
              questionCount: UAE_FINTECH_QUESTIONS.length,
              status: "ready",
              generatedBy: report.generatedBy,
            });

            return Response.json({
              ok: true,
              seed: "uae-fintech",
              token,
              topic: UAE_FINTECH_TOPIC,
              questionCount: UAE_FINTECH_QUESTIONS.length,
              reportUrl,
              pdfUrl,
              appendOnly: true,
            });
          }

          // ── Generic admin commission ──────────────────────────────
          const packageId = parsed.data.packageId || "topic-analysis";
          if (!isDeskPackageId(packageId)) {
            return Response.json({ error: "Unknown package" }, { status: 400 });
          }
          const topic = parsed.data.topic?.trim();
          const questions = parsed.data.questions?.trim() || "";
          if (!topic) {
            return Response.json(
              { error: "topic required (or seed: uae-fintech)" },
              { status: 400 },
            );
          }

          await createPendingCommission({
            token,
            packageId,
            topic,
            questions,
          });

          const useAi = parsed.data.useAi !== false;
          const report = useAi
            ? await generateCommissionedReport({
                token,
                packageId,
                topic,
                questionsRaw: questions,
              })
            : (
                await import("@/lib/research-desk/build-report")
              ).buildDeskReport({
                token,
                packageId,
                topic,
                questionsRaw: questions,
                generationStatus: "ready",
              });

          await appendCommissionEvent(token, {
            status: "ready",
            report: { ...report, generationStatus: "ready" },
            errorMessage: report.generationError ?? null,
            stripeSessionId: `admin-${token.slice(0, 12)}`,
          });

          const reportUrl = `${origin}/research/report/${token}`;
          const pdfUrl = `${origin}/api/research/report/${token}?format=pdf`;
          const qCount = parseQuestions(questions).length || report.questions.length;

          await notifyOpsReportReady({
            token,
            topic,
            packageId,
            reportUrl,
            pdfUrl,
            questionCount: qCount,
            status: "ready",
            generatedBy: report.generatedBy,
          });

          return Response.json({
            ok: true,
            token,
            topic,
            questionCount: qCount,
            reportUrl,
            pdfUrl,
            generatedBy: report.generatedBy,
            appendOnly: true,
          });
        } catch (e) {
          console.error("[admin/commission]", e);
          return Response.json(
            { error: e instanceof Error ? e.message : "Server error" },
            { status: 500 },
          );
        }
      },
    },
  },
});
