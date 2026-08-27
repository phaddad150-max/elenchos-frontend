import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { MigrationIntelligencePage } from "./research-migration";
import { AviationIntelligencePage } from "./research-aviation";
import { getResearchBrief } from "@/lib/research-catalog";

/**
 * SEO case-study URLs: /research/casestudy/$slug
 * Canonical: irregular-migration | aviation
 */
function resolveKind(
  slug: string,
): "migration" | "aviation" | "preview" | null {
  const key = slug.trim().toLowerCase();
  if (
    key === "irregular-migration" ||
    key === "illegal-migration" ||
    key === "migration"
  ) {
    return "migration";
  }
  if (key === "aviation" || key === "aviation-race-digital-ai") {
    return "aviation";
  }
  if (getResearchBrief(slug)) return "preview";
  return null;
}

export const Route = createFileRoute("/research/casestudy/$slug")({
  beforeLoad: ({ params }) => {
    const key = params.slug.trim().toLowerCase();
    const kind = resolveKind(key);
    if (!kind) throw notFound();

    if (key === "illegal-migration" || key === "migration") {
      throw redirect({
        to: "/research/casestudy/$slug",
        params: { slug: "irregular-migration" },
        replace: true,
      });
    }
    if (key === "aviation-race-digital-ai") {
      throw redirect({
        to: "/research/casestudy/$slug",
        params: { slug: "aviation" },
        replace: true,
      });
    }
    if (kind === "preview") {
      throw redirect({
        to: "/research/preview/$slug",
        params: { slug: params.slug },
        replace: true,
      });
    }
  },
  head: ({ params }) => {
    const kind = resolveKind(params.slug);
    if (kind === "migration") {
      return {
        meta: [
          {
            title: "Illegal migration crisis · EU & UK · Elenchos Research",
          },
          {
            name: "description",
            content:
              "Deep dive: irregular migration since 2011 — detections, corridors, returns honesty, speech cost. Free open data.",
          },
          {
            property: "og:url",
            content:
              "https://elenchos.live/research/casestudy/irregular-migration",
          },
        ],
        links: [
          {
            rel: "canonical",
            href: "https://elenchos.live/research/casestudy/irregular-migration",
          },
        ],
      };
    }
    return {
      meta: [
        {
          title:
            "Aviation after disruption · OEM · satcom · AI · Elenchos Research",
        },
        {
          name: "description",
          content:
            "Deep dive: commercial aviation after COVID — OEM race, networks, satcom, AI ops readiness.",
        },
        {
          property: "og:url",
          content: "https://elenchos.live/research/casestudy/aviation",
        },
      ],
      links: [
        {
          rel: "canonical",
          href: "https://elenchos.live/research/casestudy/aviation",
        },
      ],
    };
  },
  component: CaseStudyPage,
});

function CaseStudyPage() {
  const { slug } = Route.useParams();
  const kind = resolveKind(slug);
  if (kind === "migration") return <MigrationIntelligencePage />;
  return <AviationIntelligencePage />;
}
