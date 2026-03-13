"use client";

import { useState, useEffect, useCallback } from "react";
import { Puzzle } from "@/lib/puzzles";
import { GameState, getGameState, saveGameState, getStats, recordWin, recordLoss } from "@/lib/gameState";
import FrameViewer from "./FrameViewer";
import GuessInput from "./GuessInput";
import GuessHistory from "./GuessHistory";
import ShareButton from "./ShareButton";
import StatsModal from "./StatsModal";
import { PostGameAd } from "./AdSlot";
import HowToPlay from "./HowToPlay";

const MAX_GUESSES = 6;

interface GameProps {
  puzzle: Puzzle;
}

export default function Game({ puzzle }: GameProps) {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [failed, setFailed] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState(getStats());

  // Load saved state
  useEffect(() => {
    const saved = getGameState(puzzle.id);
    if (saved) {
      setGuesses(saved.guesses);
      setSolved(saved.solved);
      setFailed(saved.failed);
    }
  }, [puzzle.id]);

  const currentFrame = Math.min(guesses.length, MAX_GUESSES - 1);
  const gameOver = solved || failed;

  const save = useCallback((g: string[], s: boolean, f: boolean) => {
    const state: GameState = { puzzleId: puzzle.id, guesses: g, solved: s, failed: f };
    saveGameState(state);
  }, [puzzle.id]);

  const handleGuess = (show: string) => {
    if (gameOver) return;
    const newGuesses = [...guesses, show];
    const isCorrect = show.toLowerCase() === puzzle.showName.toLowerCase();

    if (isCorrect) {
      setSolved(true);
      save(newGuesses, true, false);
      recordWin(newGuesses.length);
      setStats(getStats());
    } else if (newGuesses.length >= MAX_GUESSES) {
      setFailed(true);
      save(newGuesses, false, true);
      recordLoss();
      setStats(getStats());
    } else {
      save(newGuesses, false, false);
    }
    setGuesses(newGuesses);
  };

  const handleSkip = () => {
    handleGuess("__SKIP__");
  };

  return (
    <div>
      <HowToPlay />
      <FrameViewer
        frames={puzzle.frames}
        currentFrame={gameOver && solved ? guesses.length - 1 : currentFrame}
        totalGuesses={guesses.length}
      />

      {gameOver ? (
        <div className="mt-6 text-center space-y-4">
          {solved ? (
            <div>
              <p className="text-xl text-green-400 font-retro text-sm">🎉 Correct!</p>
              <p className="text-2xl mt-2">{puzzle.showName}</p>
              <p className="text-gray-400">You got it in {guesses.length} {guesses.length === 1 ? "guess" : "guesses"}!</p>
            </div>
          ) : (
            <div>
              <p className="text-xl text-red-400 font-retro text-sm">📺 Game Over</p>
              <p className="text-2xl mt-2">{puzzle.showName}</p>
              <p className="text-gray-400">Better luck tomorrow!</p>
            </div>
          )}
          <div className="flex justify-center gap-4">
            <ShareButton guesses={guesses} answer={puzzle.showName} puzzleId={puzzle.id} won={solved} />
            <button
              onClick={() => setShowStats(true)}
              className="bg-gray-700 text-white px-4 py-3 rounded-lg font-retro text-xs hover:bg-gray-600 transition"
            >
              📊 Stats
            </button>
          </div>
          <PostGameAd showName={puzzle.showName} />
        </div>
      ) : (
        <GuessInput onGuess={handleGuess} onSkip={handleSkip} disabled={gameOver} />
      )}

      <GuessHistory guesses={guesses} answer={puzzle.showName} maxGuesses={MAX_GUESSES} />

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

      <StatsModal stats={stats} open={showStats} onClose={() => setShowStats(false)} />
    </div>
  );
}
