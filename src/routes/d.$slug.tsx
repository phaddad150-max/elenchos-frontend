import { Outlet, createFileRoute } from "@tanstack/react-router";
import { TenantShell } from "@/components/desk/TenantShell";
import { getLiveDesk } from "@/lib/desk/store.server";

export const Route = createFileRoute("/d/$slug")({
  loader: async ({ params }) => {
    const desk = await getLiveDesk(params.slug);
    return { desk };
  },
  component: TenantDeskLayout,
});

function TenantDeskLayout() {
  const { desk } = Route.useLoaderData();
  return (
    <TenantShell desk={desk}>
      {desk ? <Outlet /> : null}
    </TenantShell>
  );
}
