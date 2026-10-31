/**
 * Puzzle scheduling.
 *
 * Puzzles are derived from the date rather than read from a fixed calendar, so
 * the game can never run out: day N shows `rotation[N % rotation.length]`.
 * Day 0 is EPOCH and is puzzle #1, which keeps every puzzle number (and the
 * localStorage saves keyed by it) identical to the original 190-day schedule.
 *
 * Server-only — importing this from a client component would ship every answer
 * to the browser. Use `getPublicPuzzle` to cross that boundary.
 */
import rotation from "../data/rotation.json";
import { addDays, daysBetween, isISODate, todayUTC } from "./dates";
import { sha256Hex } from "./hash";
import { normalizeTitle } from "./matching";
import type { PublicPuzzle, PuzzleAnswer } from "./puzzle-types";

/** One entry in the rotation: a show with a complete set of frames on disk. */
interface RotationEntry extends PuzzleAnswer {
  tmdbId: number;
  /**
   * Opaque directory holding the show's frames. Frames are not served from
   * /frames/<slug>/ because the image URL would give the answer away — see
   * scripts/frame_dirs.py.
   */
  frameDir: string;
}

export interface Puzzle extends PuzzleAnswer {
  number: number;
  date: string;
  tmdbId: number;
  frames: string[];
}

/** Launch day: puzzle #1. */
export const EPOCH = "2026-03-13";

const ROTATION = rotation as RotationEntry[];

/** Whole days from EPOCH to `date`; negative before launch. */
export function dayIndex(date: string): number {
  return daysBetween(EPOCH, date);
}

/** The date a given puzzle number falls on. */
export function dateForPuzzleNumber(n: number): string {
  return addDays(EPOCH, n - 1);
}

/** True for a launched, non-future date we are willing to serve. */
export function isValidPuzzleDate(date: string): boolean {
  if (!isISODate(date)) return false;
  const i = dayIndex(date);
  return i >= 0 && i <= dayIndex(todayUTC());
}

/** The puzzle for a date, answer included. Null before launch. */
export function getPuzzle(date: string): Puzzle | null {
  const i = dayIndex(date);
  if (i < 0) return null;
  const show = ROTATION[i % ROTATION.length];
  return {
    number: i + 1,
    date,
    showName: show.showName,
    showSlug: show.showSlug,
    tmdbId: show.tmdbId,
    frames: Array.from({ length: 6 }, (_, f) => `/frames/${show.frameDir}/${f + 1}.jpg`),
  };
}

/** Hash of a show's normalized title — what the client compares guesses against. */
export function answerHash(showName: string): Promise<string> {
  return sha256Hex(normalizeTitle(showName));
}

/** The browser-safe view of a puzzle: frames plus a hash, never the answer. */
export async function getPublicPuzzle(date: string): Promise<PublicPuzzle | null> {
  const puzzle = getPuzzle(date);
  if (!puzzle) return null;
  return {
    number: puzzle.number,
    date: puzzle.date,
    frames: puzzle.frames,
    answerHash: await answerHash(puzzle.showName),
  };
}

/** Past puzzle dates, newest first, excluding today. */
export function pastDates(limit?: number): string[] {
  const days = dayIndex(todayUTC());
  const out: string[] = [];
  for (let i = days - 1; i >= 0 && (limit === undefined || out.length < limit); i--) {
    out.push(dateForPuzzleNumber(i + 1));
  }
  return out;
}

/** How many distinct shows are in the rotation. */
export const ROTATION_LENGTH = ROTATION.length;
