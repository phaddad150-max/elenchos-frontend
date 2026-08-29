/** Shared Open Graph / Twitter card helpers for consistent X previews. */

const SITE = "https://elenchos.live";
const DEFAULT_OG = `${SITE}/elenchos-og.webp`;
const SPEECH_REACH_OG = `${SITE}/og/speech-reach.jpg`;

export type SocialPageMeta = {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: "website" | "article";
};

export function socialMetaTags(page: SocialPageMeta) {
  const image = page.image ?? DEFAULT_OG;
  const type = page.type ?? "website";
  return [
    { title: page.title },
    { name: "description", content: page.description },
    { property: "og:site_name", content: "Elenchos" },
    { property: "og:type", content: type },
    { property: "og:title", content: page.title },
    { property: "og:description", content: page.description },
    { property: "og:url", content: page.url },
    { property: "og:image", content: image },
    { property: "og:image:alt", content: page.title },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: "@elenchospulse" },
    { name: "twitter:title", content: page.title },
    { name: "twitter:description", content: page.description },
    { name: "twitter:image", content: image },
  ];
}

export const SPEECH_REACH_SOCIAL: SocialPageMeta = {
  title: "Speech Reach · Brazil 2026 Election Filter on X",
  description:
    "Official candidate accounts are kept out of For You recommendations unless you already follow them. The speech stays public.",
  url: `${SITE}/research/speech-reach`,
  image: SPEECH_REACH_OG,
};

export const HOME_SOCIAL: SocialPageMeta = {
  title: "Elenchos · Public Discourse Lens × Research Desk",
  description:
    "Citizen voices vs official frames. Free Dashboard and Research Library — topics, case studies, trackers, and ledgers.",
  url: SITE,
  image: DEFAULT_OG,
};

export const ABOUT_SOCIAL: SocialPageMeta = {
  title: "About Elenchos · ἔλεγχος · Public Discourse Lens × Research Desk",
  description:
    "Elenchos (ἔλεγχος) means cross-examination. Free Dashboard and Research Library. Citizen voices vs official narratives.",
  url: `${SITE}/about`,
  image: DEFAULT_OG,
};

export const DESK_SOCIAL: SocialPageMeta = {
  title: "Buy this dashboard · Elenchos Desk",
  description:
    "Pay for a licensed public-discourse dashboard. Brand it, pick topics, generate a live URL. Scoring logic stays on Elenchos.",
  url: `${SITE}/desk`,
  image: DEFAULT_OG,
};

export const LIBRARY_SOCIAL: SocialPageMeta = {
  title: "Library · Topics, case studies & trackers · Elenchos",
  description:
    "Free library: topic analysis on X, case studies, Leadership, Peace, and Networks Ledger (Terror & Finance + Speech Reach).",
  url: `${SITE}/research/library`,
  image: DEFAULT_OG,
};

/** @deprecated Standalone /topics retired — use LIBRARY_SOCIAL / Library deep-links. */
export const TOPICS_SOCIAL: SocialPageMeta = {
  title: "Topic analyses · Library · Elenchos",
  description:
    "Citizen vs official frames from public X samples — now inside the free Library.",
  url: `${SITE}/research/library`,
  image: DEFAULT_OG,
};
