import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { getTopic } from "@/lib/feature-topics";
import { TOPICS_SOCIAL, socialMetaTags } from "@/lib/social-meta";
import { TopicsListPage } from "./-topics.shared";

export const Route = createFileRoute("/topics/")({
  validateSearch: (search: Record<string, unknown>): { topic?: string } => {
    /** Legacy query param — redirected to path form in beforeLoad */
    if (typeof search.topic === "string" && search.topic.trim()) {
      return { topic: search.topic };
    }
    return {};
  },
  beforeLoad: ({ search }) => {
    const legacy = search.topic;
    if (legacy && getTopic(legacy)) {
      throw redirect({
        to: "/topics/$topicId",
        params: { topicId: legacy },
        replace: true,
      });
    }
  },
  head: () => ({
    meta: socialMetaTags(TOPICS_SOCIAL),
    links: [{ rel: "canonical", href: TOPICS_SOCIAL.url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Topics · Public discourse analysis · Elenchos",
          description:
            "Socratic public discourse analysis: citizen sentiment and narrative gaps from public X samples.",
          url: "https://elenchos.live/topics",
        }),
      },
    ],
  }),
  component: TopicsIndexRoute,
});

function TopicsIndexRoute() {
  const navigate = useNavigate();
  return (
    <TopicsListPage
      onOpen={(id) => {
        void navigate({ to: "/topics/$topicId", params: { topicId: id } });
      }}
    />
  );
}
