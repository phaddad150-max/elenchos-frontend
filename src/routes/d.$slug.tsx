import { createFileRoute } from "@tanstack/react-router";
import { TenantDeskView } from "@/components/desk/TenantDeskView";
import { getLiveDesk } from "@/lib/desk/store.server";

export const Route = createFileRoute("/d/$slug")({
  loader: async ({ params }) => {
    const desk = await getLiveDesk(params.slug);
    return { desk };
  },
  component: TenantDeskPage,
});

function TenantDeskPage() {
  const { desk } = Route.useLoaderData();
  return <TenantDeskView desk={desk} />;
}
