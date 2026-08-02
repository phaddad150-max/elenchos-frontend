export type DeskPackageId = "topic-analysis" | "deep-no-x" | "deep-with-x";

export const DESK_PACKAGES: Record<
  DeskPackageId,
  {
    id: DeskPackageId;
    title: string;
    priceUsd: number;
    blurb: string;
    delivers: string;
    includesX: boolean;
  }
> = {
  "topic-analysis": {
    id: "topic-analysis",
    title: "Topic analysis (public discourse)",
    priceUsd: 10,
    blurb: "Socratic-style questions + public discourse analysis (Topics method).",
    delivers:
      "Structured analysis of public discourse themes, frames vs official/media, limits and sample honesty.",
    includesX: true,
  },
  "deep-no-x": {
    id: "deep-no-x",
    title: "Deep dive · multi-source (no X)",
    priceUsd: 10,
    blurb: "Thesis-like multi-source structure without an X sample.",
    delivers: "Chapters, evidence map, claims with falsifiers where evidence holds.",
    includesX: false,
  },
  "deep-with-x": {
    id: "deep-with-x",
    title: "Deep dive · multi-source + X",
    priceUsd: 20,
    blurb: "Deep dive plus capped public-discourse sample on X.",
    delivers: "Deep dive + discourse section with sample limits.",
    includesX: true,
  },
};

export function isDeskPackageId(v: string): v is DeskPackageId {
  return v === "topic-analysis" || v === "deep-no-x" || v === "deep-with-x";
}
