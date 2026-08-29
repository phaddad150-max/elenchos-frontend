import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { listSellableDeskTopics } from "@/lib/topic-catalog";
import { getStudioBundle, getTenantByToken, saveStudio } from "@/lib/desk/store.server";

const SaveSchema = z.object({
  token: z.string().min(16).max(80),
  org_name: z.string().trim().min(2).max(80),
  unbranded: z.boolean(),
  logo_url: z.string().trim().url().max(500).optional().or(z.literal("")),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accent_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  topic_ids: z.array(z.string()).max(15),
  custom_topics: z.array(z.string().max(120)).max(15),
  custom_domain: z.string().trim().max(120).optional().or(z.literal("")),
});

export const Route = createFileRoute("/api/desk/studio")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const token = new URL(request.url).searchParams.get("token")?.trim() || "";
        const bundle = token ? await getStudioBundle(token) : null;
        if (
          !bundle ||
          (bundle.tenant.status !== "paid" && bundle.tenant.status !== "live")
        ) {
          return Response.json({ error: "Invalid or unpaid studio link." }, { status: 401 });
        }
        const { tenant, branding, picks } = bundle;
        return Response.json({
          tenant: {
            id: tenant.id,
            status: tenant.status,
            slug: tenant.slug,
            org_name: tenant.org_name,
            email: tenant.email,
            custom_domain: tenant.custom_domain,
          },
          branding,
          picks,
          catalog: listSellableDeskTopics(),
        });
      },
      POST: async ({ request }) => {
        const json = await request.json().catch(() => null);
        const parsed = SaveSchema.safeParse(json);
        if (!parsed.success) {
          return Response.json({ error: "Invalid studio payload." }, { status: 400 });
        }
        const tenant = await getTenantByToken(parsed.data.token);
        if (!tenant || (tenant.status !== "paid" && tenant.status !== "live")) {
          return Response.json({ error: "Invalid or unpaid studio link." }, { status: 401 });
        }
        await saveStudio(tenant, {
          org_name: parsed.data.org_name,
          unbranded: parsed.data.unbranded,
          logo_url: parsed.data.logo_url || null,
          primary_color: parsed.data.primary_color,
          accent_color: parsed.data.accent_color,
          topic_ids: parsed.data.topic_ids,
          custom_topics: parsed.data.custom_topics,
          custom_domain: parsed.data.custom_domain || null,
        });
        return Response.json({ ok: true });
      },
    },
  },
});
