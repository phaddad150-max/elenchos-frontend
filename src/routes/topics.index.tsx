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
      { title: "Topics — Elenchos" },
      {
        name: "description",
        content:
          "Explore what ordinary citizens are saying about major global issues. Real public conversations, analyzed with care and transparency.",
      },
      { property: "og:title", content: "Topics — Elenchos" },
      {
        property: "og:description",
        content: "Live citizen sentiment from public X discourse, analyzed across nine dimensions per topic.",
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
          name: "Live Topics: Public Square Sentiment",
          description:
            "Live citizen sentiment from public X discourse, analyzed across nine dimensions per topic.",
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
