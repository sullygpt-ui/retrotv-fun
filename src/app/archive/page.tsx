"use client";

import { useState, useEffect } from "react";
import { Puzzle } from "@/lib/puzzles";
import Game from "@/components/Game";
import { getGameState } from "@/lib/gameState";

export default function ArchivePage() {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [selected, setSelected] = useState<Puzzle | null>(null);

  useEffect(() => {
    fetch("/puzzles.json")
      .then((r) => r.json())
      .then((data: Puzzle[]) => {
        const today = new Date().toISOString().split("T")[0];
        setPuzzles(data.filter((p) => p.date <= today));
      });
  }, []);

  if (selected) {
    return (
      <div>
        <button
          onClick={() => setSelected(null)}
          className="mb-4 text-[var(--amber)] font-retro text-xs hover:underline"
        >
          ← Back to Archive
        </button>
        <p className="text-center text-gray-400 mb-4 text-sm">{selected.date}</p>
        <Game puzzle={selected} />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm text-[var(--amber)] text-center mb-6">Archive</h2>
      {puzzles.length === 0 ? (
        <p className="text-center text-gray-400">No past puzzles yet.</p>
      ) : (
        <div className="space-y-2">
          {puzzles.map((p) => {
            const state = getGameState(p.id);
            const status = state?.solved ? "🟩" : state?.failed ? "🟥" : "⬜";
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className="w-full flex items-center justify-between bg-[var(--bg-dark)] border border-gray-700 rounded-lg px-4 py-3 hover:border-[var(--amber-dark)] transition"
              >
                <span className="text-lg">{p.date}</span>
                <span className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">#{p.id}</span>
                  <span>{status}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
