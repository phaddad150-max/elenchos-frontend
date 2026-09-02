import { Outlet, createFileRoute } from "@tanstack/react-router";
import { TenantShell } from "@/components/desk/TenantShell";
import { getLiveDesk } from "@/lib/desk/store.server";
import { PUBLICEYE_DEMO_SLUG } from "@/lib/desk/catalog";
import { PUBLICEYE_SOCIAL, socialMetaTags } from "@/lib/social-meta";

export const Route = createFileRoute("/publiceye-uae")({
  head: () => ({
    meta: socialMetaTags(PUBLICEYE_SOCIAL),
    links: [
      { rel: "canonical", href: PUBLICEYE_SOCIAL.url },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap",
      },
    ],
  }),
  loader: async () => {
    const desk = await getLiveDesk(PUBLICEYE_DEMO_SLUG);
    return { desk };
  },
  component: PublicEyeUaeLayout,
});

function PublicEyeUaeLayout() {
  const { desk } = Route.useLoaderData();
  return <TenantShell desk={desk}>{desk ? <Outlet /> : null}</TenantShell>;
}
