import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { DESK_CURRENCY, DESK_RUN_EUR, SOLVO_CURRENCY } from "@/lib/desk/catalog";
import { chargeDeskRun } from "@/lib/desk/billing.server";
import {
  countDeskTopics,
  generateLiveUrl,
  getTenantByToken,
  getStudioBundle,
  isSolvoTenantId,
  publicDeskPath,
} from "@/lib/desk/store.server";

const BodySchema = z.object({
  token: z.string().min(16).max(80),
});

export const Route = createFileRoute("/api/desk/run")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const json = await request.json().catch(() => null);
        const parsed = BodySchema.safeParse(json);
        if (!parsed.success) {
          return Response.json({ error: "Missing studio token." }, { status: 400 });
        }
        const tenant = await getTenantByToken(parsed.data.token);
        if (!tenant || (tenant.status !== "paid" && tenant.status !== "live")) {
          return Response.json({ error: "Pay for a desk first." }, { status: 401 });
        }
        const bundle = await getStudioBundle(parsed.data.token);
        const n = countDeskTopics(bundle?.picks);
        if (n < 1) {
          return Response.json({ error: "Pick at least one topic before a run." }, { status: 400 });
        }
        try {
          const billed = await chargeDeskRun({ tenant, topicCount: n });
          const slug = await generateLiveUrl(tenant);
          const solvo =
            isSolvoTenantId(tenant.id) || tenant.market === "uae" || Boolean(tenant.plan);
          return Response.json({
            ok: true,
            slug,
            path: publicDeskPath(slug),
            researchPath: `${publicDeskPath(slug)}/research`,
            topicCount: n,
            amount: billed.amountCents / 100,
            currency: solvo ? SOLVO_CURRENCY : DESK_CURRENCY,
            charged: billed.charged,
            demo: billed.demo,
            perTopic: solvo ? 0 : DESK_RUN_EUR,
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Run failed";
          return Response.json({ error: msg }, { status: 402 });
        }
      },
    },
  },
});
