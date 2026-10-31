/**
 * UTC date helpers. Everything in the game — puzzle rollover, archive dates,
 * streaks — runs on UTC calendar days so a player's streak can't be broken or
 * padded by their timezone.
 */
export const MS_PER_DAY = 86_400_000;

export function parseUTC(date: string): number {
  return Date.parse(`${date}T00:00:00Z`);
}

export function toISODate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  return toISODate(parseUTC(date) + days * MS_PER_DAY);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((parseUTC(to) - parseUTC(from)) / MS_PER_DAY);
}

export function isISODate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parseUTC(value));
}

/** Today's UTC date as YYYY-MM-DD. */
export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}
