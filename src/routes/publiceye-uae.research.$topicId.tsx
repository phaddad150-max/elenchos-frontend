import { createFileRoute } from "@tanstack/react-router";
import { SolvoTopicView } from "@/components/desk/SolvoTopicView";

export const Route = createFileRoute("/publiceye-uae/research/$topicId")({
  component: PublicEyeTopicPage,
});

function PublicEyeTopicPage() {
  const { topicId } = Route.useParams();
  return <SolvoTopicView topicId={topicId} />;
}
