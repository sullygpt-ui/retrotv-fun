"use client";

import { useCallback, useEffect, useState } from "react";
import { SKIP, guessKey } from "@/lib/matching";
import { sha256Hex } from "@/lib/hash";
import type { PublicPuzzle, PuzzleAnswer } from "@/lib/puzzle-types";
import {
  GameState,
  Stats,
  getGameState,
  getStats,
  recordDailyResult,
  saveGameState,
} from "@/lib/gameState";
import FrameViewer from "./FrameViewer";
import GuessInput from "./GuessInput";
import GuessHistory from "./GuessHistory";
import ShareButton from "./ShareButton";
import StatsModal from "./StatsModal";
import { PostGameAd } from "./AdSlot";
import HowToPlay from "./HowToPlay";

const MAX_GUESSES = 6;

interface GameProps {
  puzzle: PublicPuzzle;
  /** Today's UTC date, from the server, so streaks ignore client clock skew. */
  today: string;
  /** False for archive puzzles, which don't affect stats or streaks. */
  isDaily?: boolean;
}

export default function Game({ puzzle, today, isDaily = true }: GameProps) {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [failed, setFailed] = useState(false);
  const [restored, setRestored] = useState(false);
  const [checking, setChecking] = useState(false);
  const [answer, setAnswer] = useState<PuzzleAnswer | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);

  const gameOver = solved || failed;

  // Restore any saved progress for this puzzle. localStorage can't be read
  // while rendering on the server, so this has to happen after hydration.
  /* eslint-disable react-hooks/set-state-in-effect -- hydrating from localStorage */
  useEffect(() => {
    const saved = getGameState(puzzle.number);
    setGuesses(saved?.guesses ?? []);
    setSolved(saved?.solved ?? false);
    setFailed(saved?.failed ?? false);
    setStats(getStats());
    setRestored(true);
  }, [puzzle.number]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // The answer isn't in the page payload, so fetch it once the game is over.
  useEffect(() => {
    if (!gameOver || answer) return;
    let active = true;
    fetch(`/api/reveal/${puzzle.date}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: PuzzleAnswer | null) => {
        if (active && data) setAnswer(data);
      })
      .catch(() => {
        /* leave the answer hidden rather than breaking the end screen */
      });
    return () => {
      active = false;
    };
  }, [gameOver, answer, puzzle.date]);

  const finish = useCallback(
    (nextGuesses: string[], won: boolean) => {
      const state: GameState = {
        puzzleNumber: puzzle.number,
        guesses: nextGuesses,
        solved: won,
        failed: !won,
      };
      saveGameState(state);
      setGuesses(nextGuesses);
      if (won) setSolved(true);
      else setFailed(true);
      setStats(isDaily ? recordDailyResult(puzzle.date, won, nextGuesses.length) : getStats());
    },
    [isDaily, puzzle.date, puzzle.number],
  );

  const handleGuess = async (raw: string) => {
    if (gameOver || checking) return;

    const isSkip = raw === SKIP;
    const key = isSkip ? "" : guessKey(raw);
    if (!isSkip && !key) return;

    setChecking(true);
    try {
      const correct = !isSkip && (await sha256Hex(key)) === puzzle.answerHash;
      const nextGuesses = [...guesses, raw];

      if (correct) {
        finish(nextGuesses, true);
      } else if (nextGuesses.length >= MAX_GUESSES) {
        finish(nextGuesses, false);
      } else {
        saveGameState({
          puzzleNumber: puzzle.number,
          guesses: nextGuesses,
          solved: false,
          failed: false,
        });
        setGuesses(nextGuesses);
      }
    } finally {
      setChecking(false);
    }
  };

  const currentFrame = Math.min(guesses.length, MAX_GUESSES - 1);
  // On a win, keep showing the frame they solved it on rather than jumping ahead.
  const visibleFrame = solved ? Math.max(guesses.length - 1, 0) : currentFrame;

  return (
    <div>
      <HowToPlay />
      <FrameViewer frames={puzzle.frames} currentFrame={visibleFrame} />

      {gameOver ? (
        <div className="mt-6 text-center space-y-4">
          {solved ? (
            <div>
              <p className="text-green-400 font-retro text-sm">🎉 Correct!</p>
              <p className="text-2xl mt-2">{answer?.showName ?? "…"}</p>
              <p className="text-gray-400">
                You got it in {guesses.length} {guesses.length === 1 ? "guess" : "guesses"}!
              </p>
            </div>
          ) : (
            <div>
              <p className="text-red-400 font-retro text-sm">📺 Game Over</p>
              <p className="text-2xl mt-2">{answer?.showName ?? "…"}</p>
              <p className="text-gray-400">
                {isDaily ? "Better luck tomorrow!" : "Try another day from the archive."}
              </p>
            </div>
          )}
          <div className="flex justify-center gap-4 flex-wrap">
            <ShareButton
              guesses={guesses}
              solvedOn={solved ? guesses.length : null}
              puzzleNumber={puzzle.number}
              maxGuesses={MAX_GUESSES}
              streak={isDaily ? stats?.currentStreak ?? 0 : 0}
            />
            <button
              onClick={() => setShowStats(true)}
              className="bg-gray-700 text-white px-4 py-3 rounded-lg font-retro text-xs hover:bg-gray-600 transition"
            >
              📊 Stats
            </button>
          </div>
          {answer && <PostGameAd showName={answer.showName} />}
        </div>
      ) : (
        restored && <GuessInput onGuess={handleGuess} disabled={checking} />
      )}

      <GuessHistory
        guesses={guesses}
        solvedOn={solved ? guesses.length : null}
        maxGuesses={MAX_GUESSES}
      />

      {!gameOver && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowStats(true)}
            className="text-[var(--amber)] text-sm hover:underline"
          >
            📊 View Stats
          </button>
        </div>
      )}

      <StatsModal
        stats={stats}
        today={today}
        open={showStats}
        onClose={() => setShowStats(false)}
      />
    </div>
  );
}
