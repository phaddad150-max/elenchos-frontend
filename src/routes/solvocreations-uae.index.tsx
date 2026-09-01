import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { TenantDeskView } from "@/components/desk/TenantDeskView";

const parentRoute = getRouteApi("/solvocreations-uae");

export const Route = createFileRoute("/solvocreations-uae/")({
  component: SolvoOverviewPage,
});

function SolvoOverviewPage() {
  const { desk } = parentRoute.useLoaderData();
  if (!desk) return null;
  return <TenantDeskView desk={desk} />;
}
