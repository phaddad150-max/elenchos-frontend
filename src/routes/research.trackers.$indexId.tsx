import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * SEO tracker URLs: /research/trackers/$indexId
 * Maps public slugs → existing tracker pages (then we can migrate shells later).
 */
const INDEX_MAP: Record<string, string> = {
  "country-leader-index": "/trackers/leaders",
  "countryleader-index": "/trackers/leaders",
  leaders: "/trackers/leaders",
  "global-leader-trust": "/trackers/leaders",
  "ai-business-index": "/trackers/business",
  business: "/trackers/business",
  "ai-business-leaders": "/trackers/business",
  "citizen-journalism-index": "/trackers/citizen-discourse",
  "citizen-discourse": "/trackers/citizen-discourse",
  "peace-normalization-index": "/trackers/peace",
  peace: "/trackers/peace",
};

export const Route = createFileRoute("/research/trackers/$indexId")({
  beforeLoad: ({ params }) => {
    const key = params.indexId.trim().toLowerCase();
    const dest = INDEX_MAP[key];
    if (dest === "/trackers/leaders") {
      throw redirect({ to: "/trackers/leaders", replace: true });
    }
    if (dest === "/trackers/business") {
      throw redirect({ to: "/trackers/business", replace: true });
    }
    if (dest === "/trackers/citizen-discourse") {
      throw redirect({ to: "/trackers/citizen-discourse", replace: true });
    }
    if (dest === "/trackers/peace") {
      throw redirect({ to: "/trackers/peace", replace: true });
    }
    throw redirect({ to: "/trackers", replace: true });
  },
});
