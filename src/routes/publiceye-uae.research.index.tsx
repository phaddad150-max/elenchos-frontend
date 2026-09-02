import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { TenantResearchView } from "@/components/desk/TenantResearchView";

const parentRoute = getRouteApi("/publiceye-uae");

export const Route = createFileRoute("/publiceye-uae/research/")({
  component: PublicEyeResearchIndexPage,
});

function PublicEyeResearchIndexPage() {
  const { desk } = parentRoute.useLoaderData();
  if (!desk) return null;
  return <TenantResearchView desk={desk} />;
}
