/**
 * The guessable show list.
 *
 * Derived from scripts/shows.json — the same file the frame fetcher and puzzle
 * rotation are built from — so every answer is always typeable. It used to be a
 * hand-maintained array, which drifted until 101 of 190 answers were missing
 * from it and those puzzles could not be won.
 */
import showsJson from "../../scripts/shows.json";
import { aliasTarget, normalizeTitle } from "./matching";

interface ShowEntry {
  name: string;
  slug: string;
  tmdbId: number;
}

/** Every show title, de-duplicated by normalized form and sorted. */
export const SHOW_LIST: string[] = (() => {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const show of showsJson as ShowEntry[]) {
    const key = normalizeTitle(show.name);
    if (key && !seen.has(key)) {
      seen.add(key);
      names.push(show.name);
    }
  }
  return names.sort((a, b) => a.localeCompare(b));
})();

const SEARCH_INDEX = SHOW_LIST.map((name) => ({ name, key: normalizeTitle(name) }));

const SHOW_KEYS = new Set(SEARCH_INDEX.map((entry) => entry.key));

/**
 * Resolve whatever the player typed to the normalized key to compare against.
 *
 * An exact show title always wins over a nickname, so adding a show can never
 * be shadowed by an alias that used to point elsewhere. Returns an empty string
 * for input that normalizes to nothing.
 */
export function guessKey(input: string): string {
  const key = normalizeTitle(input);
  if (!key) return "";
  if (SHOW_KEYS.has(key)) return key;
  return aliasTarget(key) ?? key;
}

/** True when the player's text names the given show. */
export function titlesMatch(guess: string, showName: string): boolean {
  const key = guessKey(guess);
  return key !== "" && key === normalizeTitle(showName);
}

/**
 * Autocomplete, ranked so the obvious answer comes first: titles starting with
 * the query, then titles with a word starting with it, then any substring.
 */
export function searchShows(query: string, limit = 8): string[] {
  const q = normalizeTitle(query);
  if (!q) return [];

  const starts: string[] = [];
  const wordStarts: string[] = [];
  const contains: string[] = [];

  for (const { name, key } of SEARCH_INDEX) {
    if (key.startsWith(q)) starts.push(name);
    else if (key.includes(` ${q}`)) wordStarts.push(name);
    else if (key.includes(q)) contains.push(name);
  }

  return [...starts, ...wordStarts, ...contains].slice(0, limit);
}
