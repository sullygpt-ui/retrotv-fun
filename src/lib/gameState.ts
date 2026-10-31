/**
 * Per-puzzle saves and lifetime stats, in localStorage.
 *
 * Only the daily puzzle moves stats. Archive puzzles save their progress so the
 * archive list can show what you've solved, but they don't count — previously
 * any win incremented the streak, so replaying the archive manufactured a
 * 40-day streak without playing 40 days.
 */
import { addDays } from "./dates";

export interface GameState {
  puzzleNumber: number;
  guesses: string[];
  solved: boolean;
  failed: boolean;
}

export interface Stats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  /** index 0 = solved in 1 guess */
  guessDistribution: number[];
  /** UTC date of the last daily puzzle that was scored. */
  lastDailyDate: string | null;
}

const GAME_KEY = "retrotv_game_";
const STATS_KEY = "retrotv_stats";

const EMPTY_STATS: Stats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: [0, 0, 0, 0, 0, 0],
  lastDailyDate: null,
};

/** localStorage throws in private mode and when site data is blocked. */
function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — the game still plays, it just won't resume */
  }
}

export function getGameState(puzzleNumber: number): GameState | null {
  return read<GameState>(GAME_KEY + puzzleNumber);
}

export function saveGameState(state: GameState): void {
  write(GAME_KEY + state.puzzleNumber, state);
}

export function getStats(): Stats {
  const saved = read<Partial<Stats>>(STATS_KEY);
  // The distribution is always copied — handing out EMPTY_STATS's own array
  // would let a caller's increment mutate the module-level default.
  if (!saved) return { ...EMPTY_STATS, guessDistribution: [...EMPTY_STATS.guessDistribution] };
  return {
    ...EMPTY_STATS,
    ...saved,
    guessDistribution:
      Array.isArray(saved.guessDistribution) && saved.guessDistribution.length === 6
        ? [...saved.guessDistribution]
        : [...EMPTY_STATS.guessDistribution],
  };
}

export function saveStats(stats: Stats): void {
  write(STATS_KEY, stats);
}

/**
 * Score a finished daily puzzle. Idempotent per date, so a re-render or a
 * reload of a finished game can't double-count it.
 *
 * @param guessCount guesses used when won; ignored on a loss.
 */
export function recordDailyResult(date: string, won: boolean, guessCount: number): Stats {
  const stats = getStats();
  if (stats.lastDailyDate === date) return stats;

  stats.gamesPlayed++;
  if (won) {
    stats.gamesWon++;
    const continued = stats.lastDailyDate === addDays(date, -1);
    stats.currentStreak = continued ? stats.currentStreak + 1 : 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    if (guessCount >= 1 && guessCount <= 6) stats.guessDistribution[guessCount - 1]++;
  } else {
    stats.currentStreak = 0;
  }
  stats.lastDailyDate = date;
  saveStats(stats);
  return stats;
}

/**
 * A streak only counts while it's current: if the last scored day is older than
 * yesterday, the run is already over even though nothing has been played since.
 */
export function displayStreak(stats: Stats, today: string): number {
  if (!stats.lastDailyDate) return 0;
  if (stats.lastDailyDate === today || stats.lastDailyDate === addDays(today, -1)) {
    return stats.currentStreak;
  }
  return 0;
}
