"use client";

import { SKIP } from "@/lib/matching";

interface GuessHistoryProps {
  guesses: string[];
  /** Guess number that won the game, or null if unsolved. */
  solvedOn: number | null;
  maxGuesses: number;
}

export default function GuessHistory({ guesses, solvedOn, maxGuesses }: GuessHistoryProps) {
  if (guesses.length === 0) return null;

  return (
    <ol className="mt-4 space-y-1">
      {guesses.map((g, i) => {
        const isCorrect = solvedOn === i + 1;
        const isSkip = g === SKIP;
        return (
          <li
            key={i}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-dark)] border ${
              isCorrect ? "border-green-500" : isSkip ? "border-gray-600" : "border-red-500/50"
            }`}
          >
            <span className="font-retro text-xs w-6">{i + 1}.</span>
            <span
              className={`flex-1 text-lg ${
                isCorrect ? "guess-correct" : isSkip ? "guess-skip" : "guess-wrong"
              }`}
            >
              {isSkip ? "Skipped" : g}
            </span>
            <span aria-hidden="true">{isCorrect ? "🟩" : isSkip ? "⬛" : "🟥"}</span>
            <span className="sr-only">{isCorrect ? "correct" : isSkip ? "skipped" : "wrong"}</span>
          </li>
        );
      })}
      {Array.from({ length: maxGuesses - guesses.length }).map((_, i) => (
        <li
          key={`empty-${i}`}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-dark)] border border-gray-800 opacity-30"
        >
          <span className="font-retro text-xs w-6">{guesses.length + i + 1}.</span>
          <span className="flex-1 text-lg text-gray-600">—</span>
        </li>
      ))}
    </ol>
  );
}
