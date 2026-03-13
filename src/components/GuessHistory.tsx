"use client";

interface GuessHistoryProps {
  guesses: string[];
  answer: string;
  maxGuesses: number;
}

export default function GuessHistory({ guesses, answer, maxGuesses }: GuessHistoryProps) {
  if (guesses.length === 0) return null;

  return (
    <div className="mt-4 space-y-1">
      {guesses.map((g, i) => {
        const isCorrect = g.toLowerCase() === answer.toLowerCase();
        const isSkip = g === "__SKIP__";
        return (
          <div
            key={i}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-dark)] border ${
              isCorrect
                ? "border-green-500"
                : isSkip
                ? "border-gray-600"
                : "border-red-500/50"
            }`}
          >
            <span className="font-retro text-xs w-6">{i + 1}.</span>
            <span className={`flex-1 text-lg ${isCorrect ? "guess-correct" : isSkip ? "guess-skip" : "guess-wrong"}`}>
              {isSkip ? "Skipped" : g}
            </span>
            <span>{isCorrect ? "🟩" : isSkip ? "⬛" : "🟥"}</span>
          </div>
        );
      })}
      {/* Empty remaining slots */}
      {Array.from({ length: maxGuesses - guesses.length }).map((_, i) => (
        <div key={`empty-${i}`} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-dark)] border border-gray-800 opacity-30">
          <span className="font-retro text-xs w-6">{guesses.length + i + 1}.</span>
          <span className="flex-1 text-lg text-gray-600">—</span>
        </div>
      ))}
    </div>
  );
}
