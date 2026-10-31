"use client";

import RetroTV from "./RetroTV";

interface FrameViewerProps {
  frames: string[];
  currentFrame: number; // 0-indexed
}

// Frame 1 is zoomed way in; frame 6 is the full image.
const ZOOM_LEVELS = [2.8, 2.2, 1.7, 1.3, 1.1, 1.0];

// Frames are pre-sized TMDB stills (780px wide), so they're served as-is rather
// than through next/image — optimizing 1,140 static JPEGs would burn image
// transformations for no size win. Dimensions are declared to avoid layout shift.
const FRAME_WIDTH = 780;
const FRAME_HEIGHT = 439;

export default function FrameViewer({ frames, currentFrame }: FrameViewerProps) {
  const frameSrc = frames[currentFrame] || frames[0];
  const zoom = ZOOM_LEVELS[currentFrame] ?? 1.0;
  const nextFrame = frames[currentFrame + 1];

  return (
    <RetroTV>
      <div className="relative w-full h-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={frameSrc}
          src={frameSrc}
          alt={`Screenshot ${currentFrame + 1} of 6 from the mystery TV show`}
          width={FRAME_WIDTH}
          height={FRAME_HEIGHT}
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover"
          style={{ transform: `scale(${zoom})`, transition: "transform 0.5s ease" }}
        />
        {/* Warm the next frame so a wrong guess reveals instantly. */}
        {nextFrame && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={nextFrame} alt="" aria-hidden="true" width={1} height={1} className="absolute opacity-0 pointer-events-none" />
        )}
        <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs font-retro text-[var(--amber)]">
          {currentFrame + 1} / 6
        </div>
      </div>
    </RetroTV>
  );
}
