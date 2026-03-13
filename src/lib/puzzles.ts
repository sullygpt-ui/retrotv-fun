export interface Puzzle {
  id: number;
  date: string;
  showName: string;
  showSlug: string;
  tmdbId: number;
  frames: string[];
}

let puzzlesCache: Puzzle[] | null = null;

export async function getAllPuzzles(): Promise<Puzzle[]> {
  if (puzzlesCache) return puzzlesCache;
  const res = await fetch("/puzzles.json");
  puzzlesCache = await res.json();
  return puzzlesCache!;
}

export async function getTodaysPuzzle(): Promise<Puzzle | null> {
  const puzzles = await getAllPuzzles();
  const today = new Date().toISOString().split("T")[0];
  return puzzles.find((p) => p.date === today) || puzzles[0] || null;
}

export async function getPuzzleByDate(date: string): Promise<Puzzle | null> {
  const puzzles = await getAllPuzzles();
  return puzzles.find((p) => p.date === date) || null;
}

export function getPuzzleForToday(puzzles: Puzzle[]): Puzzle | null {
  const today = new Date().toISOString().split("T")[0];
  return puzzles.find((p) => p.date === today) || puzzles[0] || null;
}
