"use client";

import RetroTV from "./RetroTV";

interface FrameViewerProps {
  frames: string[];
  currentFrame: number; // 0-indexed
  totalGuesses: number;
}

export default function FrameViewer({ frames, currentFrame, totalGuesses }: FrameViewerProps) {
  const blurLevel = Math.max(0, 5 - currentFrame);
  const frameSrc = frames[currentFrame] || frames[0];

  return (
    <RetroTV>
      <div className="relative w-full h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={frameSrc}
          alt={`Frame ${currentFrame + 1} of 6`}
          className={`w-full h-full object-cover frame-blur-${blurLevel}`}
          style={{ transition: "filter 0.5s ease" }}
        />
        {/* Frame counter */}
        <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs font-retro text-[var(--amber)]">
          {currentFrame + 1} / 6
        </div>
      </div>
    </RetroTV>
  );
}
