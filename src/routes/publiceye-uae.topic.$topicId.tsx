import { createFileRoute } from "@tanstack/react-router";
import { SolvoTopicView } from "@/components/desk/SolvoTopicView";

export const Route = createFileRoute("/publiceye-uae/topic/$topicId")({
  component: PublicEyeTopicAliasPage,
});

function PublicEyeTopicAliasPage() {
  const { topicId } = Route.useParams();
  return <SolvoTopicView topicId={topicId} />;
}
