import { describe, expect, it } from "vitest";
import { ALIAS_ENTRIES, normalizeTitle } from "@/lib/matching";
import { SHOW_LIST, guessKey, titlesMatch } from "@/lib/shows";
import rotation from "@/data/rotation.json";

describe("normalizeTitle", () => {
  it("strips punctuation, case and articles", () => {
    expect(normalizeTitle("The A-Team")).toBe("team");
    expect(normalizeTitle("M*A*S*H")).toBe("mash");
    expect(normalizeTitle("Diff'rent Strokes")).toBe("diffrent strokes");
    expect(normalizeTitle("'Allo 'Allo!")).toBe("allo allo");
    expect(normalizeTitle("Magnum, P.I.")).toBe("magnum pi");
    expect(normalizeTitle("Dungeons & Dragons")).toBe("dungeons and dragons");
  });

  it("is stable under whitespace and accents", () => {
    expect(normalizeTitle("  the   love   boat ")).toBe("love boat");
    expect(normalizeTitle("Pingü")).toBe("pingu");
  });

  it("is idempotent, so a key never re-normalizes to something else", () => {
    for (const title of ["The A-Team", "A Pup Named Scooby-Doo", "An Audience With", "The The"]) {
      const once = normalizeTitle(title);
      expect(normalizeTitle(once)).toBe(once);
    }
  });
});

describe("titlesMatch", () => {
  it("accepts the titles players actually type", () => {
    expect(titlesMatch("mash", "M*A*S*H")).toBe(true);
    expect(titlesMatch("The Simpsons", "The Simpsons")).toBe(true);
    expect(titlesMatch("simpsons", "The Simpsons")).toBe(true);
    expect(titlesMatch("allo allo", "'Allo 'Allo!")).toBe(true);
    expect(titlesMatch("gi joe", "G.I. Joe")).toBe(true);
    // Dropping the leading article used to produce a different key.
    expect(titlesMatch("A-Team", "The A-Team")).toBe(true);
    expect(titlesMatch("a team", "The A-Team")).toBe(true);
  });

  it("resolves nicknames through the alias table", () => {
    expect(titlesMatch("TMNT", "Teenage Mutant Ninja Turtles")).toBe(true);
    expect(titlesMatch("poirot", "Agatha Christie's Poirot")).toBe(true);
    expect(titlesMatch("buck rogers", "Buck Rogers in the 25th Century")).toBe(true);
    expect(titlesMatch("mst3k", "Mystery Science Theater 3000")).toBe(true);
  });

  it("rejects wrong and empty guesses", () => {
    expect(titlesMatch("Cheers", "Taxi")).toBe(false);
    expect(titlesMatch("", "Taxi")).toBe(false);
    expect(titlesMatch("   ", "Taxi")).toBe(false);
    expect(titlesMatch("!!!", "Taxi")).toBe(false);
  });
});

describe("answer reachability", () => {
  it("every show in the rotation is in the guessable list", () => {
    const keys = new Set(SHOW_LIST.map(normalizeTitle));
    const unreachable = (rotation as { showName: string }[])
      .map((entry) => entry.showName)
      .filter((name) => !keys.has(normalizeTitle(name)));
    expect(unreachable).toEqual([]);
  });

  it("no alias shadows a show's exact title", () => {
    // Ghostbusters (1986) and Spider-Man (1981) both collide with nicknames
    // for older shows; the exact title has to win or they'd be unwinnable.
    for (const name of SHOW_LIST) {
      expect(guessKey(name)).toBe(normalizeTitle(name));
    }
    expect(titlesMatch("Ghostbusters", "Ghostbusters")).toBe(true);
    expect(titlesMatch("Spider-Man", "Spider-Man")).toBe(true);
    // A nickname still resolves when it isn't itself a title.
    expect(titlesMatch("real ghostbusters", "The Real Ghostbusters")).toBe(true);
  });

  it("every alias points at a show that is actually in the library", () => {
    // An alias for a show that was never added, or whose title was typed from
    // memory, silently resolves a guess to nothing.
    const keys = new Set(SHOW_LIST.map(normalizeTitle));
    const dangling = ALIAS_ENTRIES.filter(([, target]) => !keys.has(normalizeTitle(target)));
    expect(dangling).toEqual([]);
  });
});
