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
import schedule from "../data/schedule.json";
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

/**
 * How the day number maps into the pool, over time.
 *
 * A plain `day % ROTATION.length` breaks twice when shows are added: it
 * reassigns days that have already been played (including archive pages search
 * engines have indexed), and the new shows sit at the end of the pool unseen
 * until the cycle wraps, which can be months away.
 *
 * So each segment pins a pool size and a starting index from the day it takes
 * effect. `build_rotation.py` appends a segment starting tomorrow whose
 * `startIndex` is the first newly added show, which freezes history and lets a
 * new batch debut the next day. Segments are ordered by `fromDay`.
 */
interface ScheduleSegment {
  fromDay: number;
  poolSize: number;
  startIndex: number;
  /**
   * Set on the segment that picks up after a fresh run, which starts at
   * whichever index has gone longest unseen rather than at 0. Only
   * build_rotation.py reads it — it tells a later run which segments are
   * queued debuts it must not skip past.
   */
  resume?: boolean;
}

const SCHEDULE = schedule as ScheduleSegment[];

function segmentForDay(day: number): ScheduleSegment {
  let active = SCHEDULE[0];
  for (const segment of SCHEDULE) {
    if (segment.fromDay <= day) active = segment;
    else break;
  }
  return active;
}

/** Index into ROTATION for a given day since EPOCH. */
function rotationIndex(day: number): number {
  const segment = segmentForDay(day);
  const poolSize = Math.min(segment.poolSize, ROTATION.length);
  return (segment.startIndex + (day - segment.fromDay)) % poolSize;
}

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
  const show = ROTATION[rotationIndex(i)];
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

/**
 * Whether a date's answer is safe to publish.
 *
 * Archive pages name their show so they can rank for it, but today's puzzle is
 * the one with streaks at stake, so its answer must never reach the HTML. Only
 * dates strictly before today qualify.
 */
export function isSettledPuzzleDate(date: string, today: string = todayUTC()): boolean {
  return isValidPuzzleDate(date) && date < today;
}

/** How many distinct shows are in the rotation. */
export const ROTATION_LENGTH = ROTATION.length;

/** How many shows the puzzle for a date was drawn from. */
export function currentPoolSize(date: string): number {
  const segment = segmentForDay(dayIndex(date));
  return Math.min(segment.poolSize, ROTATION.length);
}
