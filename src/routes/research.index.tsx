import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Research tab lands directly on Library content.
 * No intermediate landing page.
 */
export const Route = createFileRoute("/research/")({
  beforeLoad: () => {
    throw redirect({
      to: "/research/library",
      replace: true,
    });
  },
});
