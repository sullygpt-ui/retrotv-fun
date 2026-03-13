"use client";

import { useState, useEffect } from "react";
import { Puzzle, getPuzzleForToday } from "@/lib/puzzles";
import Game from "@/components/Game";

export default function Home() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/puzzles.json")
      .then((r) => r.json())
      .then((puzzles: Puzzle[]) => {
        const today = getPuzzleForToday(puzzles);
        setPuzzle(today);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="font-retro text-[var(--amber)] text-sm animate-pulse">Loading today&apos;s puzzle...</p>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="text-center py-20">
        <p className="font-retro text-red-400 text-sm">No puzzle available today!</p>
        <p className="text-gray-400 mt-2">Check back tomorrow.</p>
      </div>
    );
  }

  return <Game puzzle={puzzle} />;
}
