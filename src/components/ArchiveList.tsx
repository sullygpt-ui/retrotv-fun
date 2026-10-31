"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getGameState } from "@/lib/gameState";

interface ArchiveEntry {
  date: string;
  number: number;
}

/**
 * The archive list is rendered on the server (so it's crawlable and carries no
 * answers); this adds each puzzle's solved/failed badge from localStorage after
 * hydration.
 */
export default function ArchiveList({ entries }: { entries: ArchiveEntry[] }) {
  const [status, setStatus] = useState<Record<number, string>>({});

  // Badges come from localStorage, which only exists after hydration.
  useEffect(() => {
    const next: Record<number, string> = {};
    for (const entry of entries) {
      const state = getGameState(entry.number);
      if (state?.solved) next[entry.number] = "🟩";
      else if (state?.failed) next[entry.number] = "🟥";
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from localStorage
    setStatus(next);
  }, [entries]);

  return (
    <ul className="space-y-2">
      {entries.map((entry) => (
        <li key={entry.number}>
          <Link
            href={`/archive/${entry.date}`}
            className="w-full flex items-center justify-between bg-[var(--bg-dark)] border border-gray-700 rounded-lg px-4 py-3 hover:border-[var(--amber-dark)] focus-visible:ring-2 focus-visible:ring-[var(--amber)] transition"
          >
            <span className="text-lg">{entry.date}</span>
            <span className="flex items-center gap-2">
              <span className="text-sm text-gray-400">#{entry.number}</span>
              <span>{status[entry.number] ?? "⬜"}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
