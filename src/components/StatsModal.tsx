"use client";

import { useEffect, useRef } from "react";
import { Stats, displayStreak } from "@/lib/gameState";

interface StatsModalProps {
  stats: Stats | null;
  /** Today's UTC date, used to decide whether a streak is still running. */
  today: string;
  open: boolean;
  onClose: () => void;
}

export default function StatsModal({ stats, today, open, onClose }: StatsModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !stats) return null;

  const winPct = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
  const maxDist = Math.max(...stats.guessDistribution, 1);
  const streak = displayStreak(stats, today);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Statistics"
    >
      <div
        className="bg-[var(--bg-dark)] border border-[var(--amber-dark)] rounded-xl p-6 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm text-[var(--amber)]">Statistics</h2>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close statistics"
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center mb-6">
          {[
            [stats.gamesPlayed, "Played"],
            [winPct, "Win %"],
            [streak, "Streak"],
            [stats.maxStreak, "Max"],
          ].map(([val, label]) => (
            <div key={String(label)}>
              <div className="text-2xl text-white">{String(val)}</div>
              <div className="text-xs text-gray-400">{String(label)}</div>
            </div>
          ))}
        </div>

        <h3 className="text-xs text-[var(--amber)] mb-2">Guess Distribution</h3>
        <div className="space-y-1">
          {stats.guessDistribution.map((count, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-4 text-right text-sm">{i + 1}</span>
              <div
                className="stat-bar rounded text-right px-2 text-xs text-black font-bold"
                style={{ width: `${Math.max((count / maxDist) * 100, 8)}%` }}
              >
                {count}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-[10px] text-gray-500 font-retro leading-relaxed">
          Only the daily puzzle counts toward stats — archive puzzles are just for fun.
        </p>
      </div>
    </div>
  );
}
