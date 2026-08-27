import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Standalone /topics/$topicId retired — topic briefings live in Library.
 */
export const Route = createFileRoute("/topics/$topicId")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/research/topic/$topicId",
      params: { topicId: params.topicId },
      replace: true,
    });
  },
});
