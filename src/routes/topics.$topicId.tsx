import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getTopic } from "@/lib/feature-topics";
import { TopicDetailPage } from "./-topics.shared";

export const Route = createFileRoute("/topics/$topicId")({
  head: ({ params }) => {
    const topic = getTopic(params.topicId);
    const title = topic
      ? `${topic.title} · Public discourse analysis · Elenchos`
      : "Topic analysis · Elenchos";
    const description =
      topic?.description ??
      "Citizen sentiment and narrative divergence from public discourse on X. Socratic topic analysis by Elenchos.";
    const url = `https://elenchos.live/topics/${params.topicId}`;
    return {
      meta: [
        { title },
        { name: "description", content: description.slice(0, 160) },
        { property: "og:title", content: title },
        { property: "og:description", content: description.slice(0, 200) },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: TopicIdRoute,
});

function TopicIdRoute() {
  const { topicId } = Route.useParams();
  const navigate = useNavigate();
  return (
    <TopicDetailPage
      topicId={topicId}
      onBack={() => {
        void navigate({ to: "/topics" });
      }}
    />
  );
}
