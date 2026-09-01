import { Outlet, createFileRoute } from "@tanstack/react-router";
import { TenantShell } from "@/components/desk/TenantShell";
import { getLiveDesk } from "@/lib/desk/store.server";
import { UAE_DEMO_SLUG } from "@/lib/desk/catalog";
import { UAE_SOCIAL, socialMetaTags } from "@/lib/social-meta";

export const Route = createFileRoute("/solvocreations-uae")({
  head: () => ({
    meta: socialMetaTags(UAE_SOCIAL),
    links: [
      { rel: "canonical", href: UAE_SOCIAL.url },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap",
      },
    ],
  }),
  loader: async () => {
    const desk = await getLiveDesk(UAE_DEMO_SLUG);
    return { desk };
  },
  component: SolvoUaeLayout,
});

function SolvoUaeLayout() {
  const { desk } = Route.useLoaderData();
  return <TenantShell desk={desk}>{desk ? <Outlet /> : null}</TenantShell>;
}
