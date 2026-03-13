"use client";

import RetroTV from "./RetroTV";

interface FrameViewerProps {
  frames: string[];
  currentFrame: number; // 0-indexed
  totalGuesses: number;
}

// Zoom levels: frame 1 is zoomed way in, frame 6 is full image
const ZOOM_LEVELS = [2.8, 2.2, 1.7, 1.3, 1.1, 1.0];

export default function FrameViewer({ frames, currentFrame, totalGuesses }: FrameViewerProps) {
  const frameSrc = frames[currentFrame] || frames[0];
  const zoom = ZOOM_LEVELS[currentFrame] || 1.0;

  return (
    <RetroTV>
      <div className="relative w-full h-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={frameSrc}
          alt={`Frame ${currentFrame + 1} of 6`}
          className="w-full h-full object-cover"
          style={{
            transform: `scale(${zoom})`,
            transition: "transform 0.5s ease",
          }}
        />
        {/* Frame counter */}
        <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs font-retro text-[var(--amber)]">
          {currentFrame + 1} / 6
        </div>
      </div>
    </RetroTV>
  );
}
