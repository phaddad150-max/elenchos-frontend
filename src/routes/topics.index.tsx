import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Standalone /topics retired — Library is the public home for free topic analyses.
 * Legacy query ?topic=id redirects to Library deep-link.
 */
export const Route = createFileRoute("/topics/")({
  validateSearch: (search: Record<string, unknown>): { topic?: string } => {
    if (typeof search.topic === "string" && search.topic.trim()) {
      return { topic: search.topic.trim() };
    }
    return {};
  },
  beforeLoad: ({ search }) => {
    if (search.topic) {
      throw redirect({
        to: "/research/library",
        search: { section: "topics", topic: search.topic },
        replace: true,
      });
    }
    throw redirect({
      to: "/research/library",
      search: { section: "topics" },
      replace: true,
    });
  },
});
