import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { TenantResearchView } from "@/components/desk/TenantResearchView";

const slugRoute = getRouteApi("/d/$slug");

export const Route = createFileRoute("/d/$slug/research")({
  component: TenantResearchPage,
});

function TenantResearchPage() {
  const { desk } = slugRoute.useLoaderData();
  if (!desk) return null;
  return <TenantResearchView desk={desk} />;
}
