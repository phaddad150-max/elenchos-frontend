import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { getTopic } from "@/lib/feature-topics";
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
    meta: [
      { title: "Topics · Public discourse analysis · Elenchos" },
      {
        name: "description",
        content:
          "Topics: Socratic public discourse analysis on X. Citizen sentiment and narrative gaps vs official and media frames. Sample sizes shown. Commission the same style from Research Desk.",
      },
      { property: "og:title", content: "Topics · Public discourse analysis · Elenchos" },
      {
        property: "og:description",
        content:
          "Open a topic for citizen vs official frames and scores. Then run the same method on your own topic from Research Desk.",
      },
      { property: "og:url", content: "https://elenchos.live/topics" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/topics" }],
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
