"use client";

import { useState } from "react";
import { SKIP } from "@/lib/matching";

interface ShareButtonProps {
  guesses: string[];
  /** Guess number that won the game, or null if unsolved. */
  solvedOn: number | null;
  puzzleNumber: number;
  maxGuesses: number;
  streak: number;
}

export default function ShareButton({
  guesses,
  solvedOn,
  puzzleNumber,
  maxGuesses,
  streak,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareText = () => {
    const grid = guesses
      .map((g, i) => (solvedOn === i + 1 ? "🟩" : g === SKIP ? "⬛" : "🟥"))
      .join("");
    const remaining = "⬛".repeat(Math.max(maxGuesses - guesses.length, 0));
    const score = solvedOn ? `${solvedOn}/${maxGuesses}` : `X/${maxGuesses}`;
    const streakLine = streak > 1 ? `\n🔥 ${streak} day streak` : "";
    return `📺 RetroTV #${puzzleNumber} ${score}\n${grid}${remaining}${streakLine}\nhttps://retrotv.fun`;
  };

  const handleShare = async () => {
    const text = shareText();

    // Native share sheet on mobile; clipboard everywhere else.
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ text });
        return;
      } catch {
        /* dismissed or unsupported for this payload — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt("Copy your results:", text);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="bg-[var(--amber)] text-black px-6 py-3 rounded-lg font-retro text-sm hover:bg-[var(--amber-dark)] focus-visible:ring-2 focus-visible:ring-white transition pulse-glow"
    >
      {copied ? "Copied! 📋" : "Share Results 📤"}
    </button>
  );
}
