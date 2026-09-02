import { Outlet, createFileRoute, notFound } from "@tanstack/react-router";
import { TenantShell } from "@/components/desk/TenantShell";
import { getLiveDesk } from "@/lib/desk/store.server";
import { PUBLICEYE_DEMO_SLUG } from "@/lib/desk/catalog";

export const Route = createFileRoute("/publiceye-uae")({
  beforeLoad: () => {
    throw notFound();
  },
  loader: async () => {
    const desk = await getLiveDesk(PUBLICEYE_DEMO_SLUG);
    return { desk };
  },
  component: PublicEyeUaeLayout,
});

function PublicEyeUaeLayout() {
  const { desk } = Route.useLoaderData();
  return <TenantShell desk={desk}>{desk ? <Outlet /> : null}</TenantShell>;
}
