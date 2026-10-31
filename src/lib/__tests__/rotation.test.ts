import { describe, expect, it } from "vitest";
import {
  EPOCH,
  ROTATION_LENGTH,
  answerHash,
  dateForPuzzleNumber,
  currentPoolSize,
  dayIndex,
  getPublicPuzzle,
  getPuzzle,
  isValidPuzzleDate,
} from "@/lib/rotation";
import { addDays, todayUTC } from "@/lib/dates";
import { normalizeTitle } from "@/lib/matching";
import rotation from "@/data/rotation.json";

describe("scheduling", () => {
  it("numbers the epoch as puzzle #1", () => {
    expect(getPuzzle(EPOCH)?.number).toBe(1);
    expect(dayIndex(EPOCH)).toBe(0);
    expect(dateForPuzzleNumber(1)).toBe(EPOCH);
  });

  it("preserves the original 190-day schedule", () => {
    // Puzzle numbers key localStorage saves, so day N must keep its show.
    expect(getPuzzle(EPOCH)?.showName).toBe("The A-Team");
    expect(getPuzzle("2026-09-18")?.number).toBe(190);
    expect(getPuzzle("2026-09-18")?.showName).toBe("Buck Rogers in the 25th Century");
  });

  it("keeps already-played days fixed when the pool grows", () => {
    // schedule.json froze the pool at 190 through day 232, so adding shows
    // must not reassign puzzles people have played or pages Google has indexed.
    expect(getPuzzle(dateForPuzzleNumber(191))?.showName).toBe(getPuzzle(EPOCH)?.showName);
    expect(getPuzzle(dateForPuzzleNumber(232))?.showName).toBe("Kung Fu");
    expect(getPuzzle(dateForPuzzleNumber(233))?.showName).toBe("Battlestar Galactica");
    expect(currentPoolSize(dateForPuzzleNumber(233))).toBe(190);

    // The larger pool takes over from the next day.
    expect(currentPoolSize(dateForPuzzleNumber(234))).toBe(ROTATION_LENGTH);
    expect(ROTATION_LENGTH).toBeGreaterThan(190);
  });

  it("debuts a newly added batch the day the pool grows", () => {
    // Appended shows would otherwise wait out the rest of the cycle — months.
    const debut = getPuzzle(dateForPuzzleNumber(234))!;
    const newest = rotation.slice(190) as { showName: string }[];
    expect(newest.length).toBeGreaterThan(0);
    expect(debut.showName).toBe(newest[0].showName);
  });

  it("never runs out of puzzles", () => {
    // The day after the original schedule ended used to fall back to puzzle #1.
    const wrapDate = dateForPuzzleNumber(191);
    expect(getPuzzle(wrapDate)?.number).toBe(191);
    expect(getPuzzle(wrapDate)?.showName).toBe(getPuzzle(EPOCH)?.showName);

    const farFuture = addDays(EPOCH, 10_000);
    expect(getPuzzle(farFuture)?.number).toBe(10_001);
    expect(getPuzzle(farFuture)?.frames).toHaveLength(6);
  });

  it("has no puzzle before launch", () => {
    expect(getPuzzle(addDays(EPOCH, -1))).toBeNull();
  });

  it("only serves launched, non-future dates", () => {
    const today = todayUTC();
    expect(isValidPuzzleDate(today)).toBe(true);
    expect(isValidPuzzleDate(addDays(today, 1))).toBe(false);
    expect(isValidPuzzleDate(addDays(EPOCH, -1))).toBe(false);
    expect(isValidPuzzleDate("not-a-date")).toBe(false);
    expect(isValidPuzzleDate("2026-13-45")).toBe(false);
  });

  it("builds six frame paths that don't name the show", () => {
    const frames = getPuzzle(EPOCH)!.frames;
    expect(frames).toHaveLength(6);
    expect(frames.map((f) => f.replace(/.*\//, ""))).toEqual([
      "1.jpg",
      "2.jpg",
      "3.jpg",
      "4.jpg",
      "5.jpg",
      "6.jpg",
    ]);
    for (const frame of frames) {
      expect(frame).not.toContain("a-team");
      expect(frame).toMatch(/^\/frames\/[0-9a-f]{16}\/[1-6]\.jpg$/);
    }
  });
});

describe("getPublicPuzzle", () => {
  it("never includes the answer, not even in the frame URLs", async () => {
    const puzzle = await getPublicPuzzle(EPOCH);
    expect(Object.keys(puzzle!).sort()).toEqual(["answerHash", "date", "frames", "number"]);
    const payload = JSON.stringify(puzzle).toLowerCase();
    expect(payload).not.toContain("a-team");
    expect(payload).not.toContain("a team");
  });

  it("hashes the normalized answer so guesses can be checked client-side", async () => {
    const puzzle = await getPublicPuzzle(EPOCH);
    expect(puzzle!.answerHash).toBe(await answerHash("The A-Team"));
    expect(puzzle!.answerHash).toBe(await answerHash("a-team"));
    expect(normalizeTitle("The A-Team")).toBe("team");
  });
});
