export interface GameState {
  puzzleId: number;
  guesses: string[];
  solved: boolean;
  failed: boolean;
}

export interface Stats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[]; // index 0 = solved in 1, etc.
}

const GAME_KEY = "retrotv_game_";
const STATS_KEY = "retrotv_stats";

export function getGameState(puzzleId: number): GameState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(GAME_KEY + puzzleId);
  return raw ? JSON.parse(raw) : null;
}

export function saveGameState(state: GameState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GAME_KEY + state.puzzleId, JSON.stringify(state));
}

export function getStats(): Stats {
  if (typeof window === "undefined")
    return { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0, guessDistribution: [0, 0, 0, 0, 0, 0] };
  const raw = localStorage.getItem(STATS_KEY);
  if (raw) return JSON.parse(raw);
  return { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0, guessDistribution: [0, 0, 0, 0, 0, 0] };
}

export function saveStats(stats: Stats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function recordWin(guessNumber: number): void {
  const stats = getStats();
  stats.gamesPlayed++;
  stats.gamesWon++;
  stats.currentStreak++;
  stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
  stats.guessDistribution[guessNumber - 1]++;
  saveStats(stats);
}

export function recordLoss(): void {
  const stats = getStats();
  stats.gamesPlayed++;
  stats.currentStreak = 0;
  saveStats(stats);
}
