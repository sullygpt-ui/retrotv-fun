"use client";

interface RetroTVProps {
  children: React.ReactNode;
}

export default function RetroTV({ children }: RetroTVProps) {
  return (
    <div className="tv-frame tv-glow">
      {/* TV knobs */}
      <div className="flex justify-between mb-2 px-4">
        <div className="w-4 h-4 rounded-full bg-gray-600 border border-gray-500" />
        <div className="w-4 h-4 rounded-full bg-gray-600 border border-gray-500" />
      </div>
      <div className="tv-screen">
        {children}
      </div>
      {/* Channel/volume knobs */}
      <div className="flex justify-center gap-6 mt-3">
        <div className="w-6 h-6 rounded-full bg-gray-700 border-2 border-gray-500" />
        <div className="w-6 h-6 rounded-full bg-gray-700 border-2 border-gray-500" />
      </div>
    </div>
  );
}
