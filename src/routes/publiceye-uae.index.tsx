import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { TenantDeskView } from "@/components/desk/TenantDeskView";

const parentRoute = getRouteApi("/publiceye-uae");

export const Route = createFileRoute("/publiceye-uae/")({
  component: PublicEyeOverviewPage,
});

function PublicEyeOverviewPage() {
  const { desk } = parentRoute.useLoaderData();
  if (!desk) return null;
  return <TenantDeskView desk={desk} />;
}
