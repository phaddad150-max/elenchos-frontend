import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { TenantResearchView } from "@/components/desk/TenantResearchView";

const parentRoute = getRouteApi("/solvocreations-uae");

export const Route = createFileRoute("/solvocreations-uae/research")({
  component: SolvoResearchPage,
});

function SolvoResearchPage() {
  const { desk } = parentRoute.useLoaderData();
  if (!desk) return null;
  return <TenantResearchView desk={desk} />;
}
