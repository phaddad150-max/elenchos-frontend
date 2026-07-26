import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Public /research/$slug is retired while Research is in private preview.
 * Old links go to Coming soon — workbench lives at /research/preview/$slug.
 */
export const Route = createFileRoute("/research/$slug")({
  beforeLoad: ({ params }) => {
    // Safety: never treat "preview" as a brief slug if routing order is ambiguous
    if (params.slug === "preview") {
      throw redirect({ to: "/research/preview", replace: true });
    }
    throw redirect({
      to: "/research",
      replace: true,
    });
  },
  head: () => ({
    meta: [
      { title: "Research — Coming soon · Elenchos" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: () => null,
});
