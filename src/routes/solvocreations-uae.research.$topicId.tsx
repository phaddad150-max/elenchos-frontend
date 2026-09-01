import { createFileRoute } from "@tanstack/react-router";
import { SolvoTopicView } from "@/components/desk/SolvoTopicView";

export const Route = createFileRoute("/solvocreations-uae/research/$topicId")({
  component: SolvoTopicPage,
});

function SolvoTopicPage() {
  const { topicId } = Route.useParams();
  return <SolvoTopicView topicId={topicId} />;
}
