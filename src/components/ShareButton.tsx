"use client";

import { useState } from "react";

interface ShareButtonProps {
  guesses: string[];
  answer: string;
  puzzleId: number;
  won: boolean;
}

export default function ShareButton({ guesses, answer, puzzleId, won }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const generateShareText = () => {
    const grid = guesses
      .map((g) => {
        if (g === "__SKIP__") return "⬛";
        return g.toLowerCase() === answer.toLowerCase() ? "🟩" : "🟥";
      })
      .join("");
    // Pad remaining with black
    const remaining = "⬛".repeat(6 - guesses.length);
    const score = won ? `${guesses.length}/6` : "X/6";
    return `📺 RetroTV #${puzzleId} ${score}\n${grid}${remaining}\nhttps://retrotv.fun`;
  };

  const handleShare = async () => {
    const text = generateShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      prompt("Copy your results:", text);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="bg-[var(--amber)] text-black px-6 py-3 rounded-lg font-retro text-sm hover:bg-[var(--amber-dark)] transition pulse-glow"
    >
      {copied ? "Copied! 📋" : "Share Results 📤"}
    </button>
  );
}
