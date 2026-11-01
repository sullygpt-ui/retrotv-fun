import { beforeEach, describe, expect, it } from "vitest";
import { displayStreak, getStats, recordDailyResult, saveStats } from "@/lib/gameState";

/** Minimal localStorage so the module under test can run outside a browser. */
function installStorage() {
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, "window", { value: globalThis, configurable: true });
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
    },
    configurable: true,
  });
  return store;
}

describe("daily stats", () => {
  beforeEach(() => {
    installStorage().clear();
  });

  it("extends a streak only on consecutive days", () => {
    recordDailyResult("2026-10-01", true, 3);
    expect(getStats().currentStreak).toBe(1);

    recordDailyResult("2026-10-02", true, 2);
    expect(getStats().currentStreak).toBe(2);

    // Skipped 2026-10-03 entirely.
    recordDailyResult("2026-10-04", true, 4);
    const stats = getStats();
    expect(stats.currentStreak).toBe(1);
    expect(stats.maxStreak).toBe(2);
    expect(stats.gamesPlayed).toBe(3);
    expect(stats.gamesWon).toBe(3);
  });

  it("resets the streak on a loss", () => {
    recordDailyResult("2026-10-01", true, 1);
    recordDailyResult("2026-10-02", false, 6);
    const stats = getStats();
    expect(stats.currentStreak).toBe(0);
    expect(stats.gamesPlayed).toBe(2);
    expect(stats.gamesWon).toBe(1);
  });

  it("scores a given day only once", () => {
    recordDailyResult("2026-10-01", true, 3);
    recordDailyResult("2026-10-01", true, 3);
    recordDailyResult("2026-10-01", false, 6);
    const stats = getStats();
    expect(stats.gamesPlayed).toBe(1);
    expect(stats.currentStreak).toBe(1);
    expect(stats.guessDistribution[2]).toBe(1);
  });

  it("records the winning guess count", () => {
    recordDailyResult("2026-10-01", true, 1);
    recordDailyResult("2026-10-02", true, 6);
    expect(getStats().guessDistribution).toEqual([1, 0, 0, 0, 0, 1]);
  });

  it("shows a streak as over once a day is missed", () => {
    recordDailyResult("2026-10-01", true, 2);
    expect(displayStreak(getStats(), "2026-10-01")).toBe(1);
    expect(displayStreak(getStats(), "2026-10-02")).toBe(1);
    expect(displayStreak(getStats(), "2026-10-03")).toBe(0);
  });

  it("migrates stats saved before streak dates existed", () => {
    saveStats({
      gamesPlayed: 5,
      gamesWon: 4,
      currentStreak: 4,
      maxStreak: 4,
      guessDistribution: [0, 1, 1, 1, 1, 0],
    } as never);
    const stats = getStats();
    expect(stats.lastDailyDate).toBeNull();
    expect(stats.gamesPlayed).toBe(5);
    expect(displayStreak(stats, "2026-10-01")).toBe(0);
  });
});
