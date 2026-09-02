import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { TenantShell } from "@/components/desk/TenantShell";
import { getLiveDesk } from "@/lib/desk/store.server";
import { isPubliceyeDemoSlug, isUaeDemoSlug } from "@/lib/desk/catalog";

export const Route = createFileRoute("/d/$slug")({
  beforeLoad: ({ params, location }) => {
    if (isPubliceyeDemoSlug(params.slug)) {
      if (location.pathname.endsWith("/research")) {
        throw redirect({ to: "/publiceye-uae/research", replace: true });
      }
      if (location.pathname.endsWith("/desk")) {
        throw redirect({ to: "/publiceye-uae/desk", replace: true });
      }
      throw redirect({ to: "/publiceye-uae", replace: true });
    }
    if (!isUaeDemoSlug(params.slug)) return;
    if (location.pathname.endsWith("/research")) {
      throw redirect({ to: "/solvocreations-uae/research", replace: true });
    }
    if (location.pathname.endsWith("/desk")) {
      throw redirect({ to: "/solvocreations-uae/desk", replace: true });
    }
    throw redirect({ to: "/solvocreations-uae", replace: true });
  },
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
