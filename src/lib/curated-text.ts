/**
 * Shared helpers for curated insight UI — strip repeated sentences across
 * hero / narrative / evolution / insight threads so popups stay scannable.
 */

function normalizeKey(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function tokens(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3),
  );
}

/** Near-duplicate check: exact, containment, or high token overlap. */
export function sentencesSimilar(a: string, b: string, jaccard = 0.68): boolean {
  const ka = normalizeKey(a);
  const kb = normalizeKey(b);
  if (!ka || !kb) return false;
  if (ka === kb) return true;
  // Containment only when the shorter key is substantial
  const shorter = ka.length <= kb.length ? ka : kb;
  const longer = ka.length <= kb.length ? kb : ka;
  if (shorter.length >= 24 && longer.includes(shorter)) return true;

  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.size === 0 || tb.size === 0) return false;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter += 1;
  const union = ta.size + tb.size - inter;
  return union > 0 && inter / union >= jaccard;
}

export function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 12);
}

/**
 * Keep unique sentences from `text`, dropping anything that repeats an earlier
 * sentence in the same text or matches any sentence in `against`.
 */
export function uniqueProse(
  text: string | null | undefined,
  against: Array<string | null | undefined> = [],
): string {
  if (!text?.trim()) return "";
  const blocked = against.flatMap((p) => (p ? splitSentences(p) : []));
  const out: string[] = [];
  for (const s of splitSentences(text)) {
    if (out.some((o) => sentencesSimilar(o, s))) continue;
    if (blocked.some((o) => sentencesSimilar(o, s))) continue;
    out.push(s);
  }
  return out.join(" ");
}

/** True when almost all of `candidate` is already covered by `corpus`. */
export function isMostlyCoveredBy(
  candidate: string,
  corpus: string,
  coverage = 0.75,
): boolean {
  if (!candidate.trim() || !corpus.trim()) return false;
  const cand = splitSentences(candidate);
  if (cand.length === 0) return true;
  const covered = cand.filter((s) =>
    splitSentences(corpus).some((c) => sentencesSimilar(s, c)),
  ).length;
  return covered / cand.length >= coverage;
}
