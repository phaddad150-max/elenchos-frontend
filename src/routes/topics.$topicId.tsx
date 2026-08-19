import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Standalone /topics/$topicId retired — topic briefings live in Library.
 */
export const Route = createFileRoute("/topics/$topicId")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/research/library",
      search: { section: "topics", topic: params.topicId },
      replace: true,
    });
  },
});
