import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { requireBillingUser } from "@/lib/billing/auth.server";
import { TOKEN_COSTS, type PrivateRunKind } from "@/lib/billing/catalog";
import { creditTokens, debitTokens } from "@/lib/billing/tokens.server";
import { parseQuestions } from "@/lib/research-desk/build-report";
import {
  dispatchCommissionPipeline,
  packageNeedsXPipeline,
} from "@/lib/research-desk/dispatch-pipeline.server";
import { generateCommissionedReport } from "@/lib/research-desk/generate-report.server";
import {
  isDeskPackageId,
  topicViolatesSafetyPolicy,
  type DeskPackageId,
} from "@/lib/research-desk/packages";
import {
  createPrivateTokenRun,
  updateCommission,
} from "@/lib/research-desk/store.server";

/**
 * POST /api/pro/run — debit tokens + start private analysis.
 *
 * DATA PROTECTION:
 * - Debits only via debit_tokens (billing tables).
 * - INSERT new research_desk_reports rows only (user_id set).
 * - Never writes topic_snapshots / curated_* / dashboard_* / public KPIs.
 */
const BodySchema = z.object({
  packageId: z.string(),
  topic: z.string().trim().min(8).max(8000),
  questions: z.string().trim().max(16000).optional().default(""),
});

function costFor(packageId: DeskPackageId): number {
  return TOKEN_COSTS[packageId as PrivateRunKind] ?? 0;
}

export const Route = createFileRoute("/api/pro/run")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const auth = await requireBillingUser(request);
          if ("error" in auth) return auth.error;
          const { user } = auth;

          const json = await request.json().catch(() => null);
          const parsed = BodySchema.safeParse(json);
          if (!parsed.success) {
            return Response.json({ error: "Invalid input" }, { status: 400 });
          }
          const { packageId: rawPkg, topic, questions } = parsed.data;
          if (!isDeskPackageId(rawPkg)) {
            return Response.json({ error: "Unknown package" }, { status: 400 });
          }
          const packageId = rawPkg;
          const safety = topicViolatesSafetyPolicy(topic);
          if (safety) {
            return Response.json({ error: safety }, { status: 400 });
          }

          const cost = costFor(packageId);
          if (cost <= 0) {
            return Response.json({ error: "Invalid token cost" }, { status: 400 });
          }

          const token = crypto.randomUUID().replace(/-/g, "");

          const debited = await debitTokens({
            userId: user.userId,
            amount: cost,
            reason: "private_run",
            refType: "private_run",
            refId: token,
            metadata: { packageId, topicHint: topic.trim().slice(0, 80) },
          });
          if (!debited.ok) {
            const status = debited.error === "insufficient_balance" ? 402 : 500;
            return Response.json(
              {
                error:
                  debited.error === "insufficient_balance"
                    ? `Need ${cost} tokens — buy a pack or subscribe.`
                    : "Could not debit tokens",
                code: debited.error,
                cost,
              },
              { status },
            );
          }

          await createPrivateTokenRun({
            token,
            userId: user.userId,
            packageId,
            topic: topic.trim(),
            questions: (questions || "").trim(),
            tokensCharged: cost,
          });

          const origin =
            process.env.SITE_URL?.replace(/\/$/, "") || "https://elenchos.live";
          const reportUrl = `${origin}/research/report/${token}`;

          // X packages: dispatch backend (writes desk only — never public snapshots)
          if (packageNeedsXPipeline(packageId)) {
            const dispatched = await dispatchCommissionPipeline({
              token,
              topic: topic.trim(),
              questions: (questions || "").trim(),
              packageId,
            });

            if (dispatched.ok && dispatched.mode === "dispatched") {
              return Response.json({
                token,
                reportUrl,
                status: "generating",
                pipeline: "dispatched",
                tokensCharged: cost,
                balance: debited.balance,
                questionCount: parseQuestions(questions || "").length,
              });
            }
            console.warn(
              "[pro/run] dispatch failed, AI fallback",
              dispatched.detail,
            );
          }

          try {
            const report = await generateCommissionedReport({
              token,
              packageId,
              topic: topic.trim(),
              questionsRaw: (questions || "").trim(),
            });

            await updateCommission(token, {
              status: "ready",
              report: { ...report, generationStatus: "ready" },
              errorMessage: report.generationError ?? null,
            });

            return Response.json({
              token,
              reportUrl,
              status: "ready",
              pipeline: "ai",
              tokensCharged: cost,
              balance: debited.balance,
              questionCount: parseQuestions(questions || "").length,
            });
          } catch (genErr) {
            console.error("[pro/run] generate failed", genErr);
            await updateCommission(token, {
              status: "failed",
              errorMessage:
                genErr instanceof Error ? genErr.message : "generation failed",
            });
            // Refund tokens on hard generation failure
            await creditTokens({
              userId: user.userId,
              delta: cost,
              reason: "refund",
              refType: "private_run_refund",
              refId: token,
              metadata: { packageId },
            });
            return Response.json(
              {
                error: "Generation failed — tokens refunded",
                token,
                reportUrl,
                status: "failed",
              },
              { status: 502 },
            );
          }
        } catch (e) {
          console.error("[pro/run]", e);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});
