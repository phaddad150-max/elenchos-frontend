import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TopicDetailPage } from "./-topics.shared";
import { getTopic } from "@/lib/feature-topics";

/**
 * SEO / shareable topic analysis URL:
 *   /research/topic/$topicId
 * Legacy: /research/library?section=topics&topic=… and /topics/$topicId
 */
export const Route = createFileRoute("/research/topic/$topicId")({
  head: ({ params }) => {
    const topic = getTopic(params.topicId);
    const title = topic
      ? `${topic.title} · Research · Elenchos`
      : "Topic · Research · Elenchos";
    const description =
      topic?.description?.slice(0, 160) ??
      "Public topic analysis from citizen discourse on X — Elenchos Research Library.";
    const url = `https://elenchos.live/research/topic/${encodeURIComponent(params.topicId)}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: ResearchTopicPage,
});

function ResearchTopicPage() {
  const { topicId } = Route.useParams();
  const navigate = useNavigate();
  return (
    <TopicDetailPage
      topicId={topicId}
      onBack={() =>
        void navigate({
          to: "/research/library",
          search: { section: "topics" },
        })
      }
    />
  );
}
