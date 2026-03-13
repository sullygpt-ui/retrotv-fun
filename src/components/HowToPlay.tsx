"use client";

import { useState, useEffect } from "react";

export default function HowToPlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("retrotv-seen-instructions");
    if (!seen) {
      setOpen(true);
      localStorage.setItem("retrotv-seen-instructions", "1");
    }
  }, []);

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="text-[var(--amber)] text-sm hover:underline font-retro text-[10px] w-full text-center"
      >
        {open ? "▼" : "▶"} How to Play
      </button>
      {open && (
        <div className="mt-2 p-4 rounded-lg text-sm text-gray-300 space-y-2"
          style={{ background: "rgba(30,25,18,0.7)", border: "1px solid rgba(255,179,71,0.15)" }}
        >
          <p>🔍 <strong>Guess the classic 70s or 80s TV show</strong> from a series of screenshots.</p>
          <p>📺 You get <strong>6 guesses</strong>. Each wrong guess (or skip) reveals a new, easier frame.</p>
          <p>⌨️ Start typing to search — pick from the list or skip if you&apos;re stuck.</p>
          <p>📊 A new puzzle drops every day. Share your score with friends!</p>
        </div>
      )}
    </div>
  );
}
