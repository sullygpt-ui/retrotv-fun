import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import showsDetail from "@/data/shows-detail.json";
import { isValidPuzzleDate, pastDates } from "@/lib/rotation";
import { allShows, genres, getShowsByGenre } from "@/lib/show-data";

/**
 * A sitemap that lists a URL which 404s is worse than not listing it: Search
 * Console reports it as an error against the property. Genre slugs used to be
 * derived from raw TMDB genre names ("Sci-Fi & Fantasy", "Kids", "War &
 * Politics"), none of which are routes, so 9 of 508 URLs were dead.
 */
describe("sitemap", () => {
  const entries = sitemap();
  const paths = entries.map((entry) => new URL(entry.url).pathname);
  const knownShows = new Set((showsDetail as { slug: string }[]).map((show) => show.slug));
  const knownGenres = new Set(genres.map((genre) => genre.slug));

  it("lists every URL once, on the canonical host", () => {
    expect(paths).toHaveLength(new Set(paths).size);
    for (const entry of entries) {
      expect(new URL(entry.url).origin).toBe("https://retrotv.fun");
    }
  });

  it("only points at routes that exist", () => {
    const staticPaths = new Set(["/", "/about", "/faq", "/shows", "/archive"]);

    for (const path of paths) {
      if (staticPaths.has(path)) continue;

      const genre = path.match(/^\/shows\/genre\/(.+)$/);
      if (genre) {
        expect(knownGenres, path).toContain(genre[1]);
        // generateStaticParams covers every genre, but an empty page is still
        // a thin page Google will flag.
        expect(getShowsByGenre(genre[1]).length, path).toBeGreaterThan(0);
        continue;
      }

      const decade = path.match(/^\/shows\/decade\/(.+)$/);
      if (decade) {
        expect(["1970s", "1980s"], path).toContain(decade[1]);
        continue;
      }

      const show = path.match(/^\/shows\/(.+)$/);
      if (show) {
        expect(knownShows, path).toContain(show[1]);
        continue;
      }

      const archive = path.match(/^\/archive\/(.+)$/);
      if (archive) {
        expect(isValidPuzzleDate(archive[1]), path).toBe(true);
        continue;
      }

      throw new Error(`sitemap lists an unrecognised path: ${path}`);
    }
  });

  it("gives every show in the library a detail page", () => {
    // /shows lists everything in shows.json, but /shows/<slug> is generated
    // from shows-detail.json. A batch added to one and not the other puts
    // dozens of 404s behind links on an indexed page — run
    // scripts/fetch_show_details.py after adding shows.
    const detailed = new Set((showsDetail as { slug: string }[]).map((s) => s.slug));
    const undetailed = allShows.map((s) => s.slug).filter((slug) => !detailed.has(slug));
    expect(undetailed).toEqual([]);
  });

  it("covers every show, genre and past puzzle", () => {
    const listed = new Set(paths);
    for (const slug of knownShows) expect(listed).toContain(`/shows/${slug}`);
    for (const slug of knownGenres) expect(listed).toContain(`/shows/genre/${slug}`);
    for (const date of pastDates()) expect(listed).toContain(`/archive/${date}`);
  });
});
