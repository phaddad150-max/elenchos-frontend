import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { TenantDeskView } from "@/components/desk/TenantDeskView";

const slugRoute = getRouteApi("/d/$slug");

export const Route = createFileRoute("/d/$slug/")({
  component: TenantOverviewPage,
});

function TenantOverviewPage() {
  const { desk } = slugRoute.useLoaderData();
  if (!desk) return null;
  return <TenantDeskView desk={desk} />;
}
