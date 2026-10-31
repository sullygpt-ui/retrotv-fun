import type { Metadata } from "next";
import ArchiveList from "@/components/ArchiveList";
import { dayIndex, pastDates } from "@/lib/rotation";
import { todayUTC } from "@/lib/dates";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Puzzle Archive — RetroTV",
  description:
    "Play every past RetroTV puzzle. Guess the classic 70s and 80s TV show from six screenshots.",
  alternates: { canonical: "/archive" },
};

export default function ArchivePage() {
  const dates = pastDates();
  const entries = dates.map((date) => ({ date, number: dayIndex(date) + 1 }));
  const total = dayIndex(todayUTC()) + 1;

  return (
    <div>
      <h1 className="text-sm text-[var(--amber)] text-center mb-2">Archive</h1>
      <p className="text-center text-gray-400 font-retro text-[10px] mb-6">
        {entries.length} past puzzles · today is #{total} · archive plays don&apos;t affect your
        streak
      </p>
      {entries.length === 0 ? (
        <p className="text-center text-gray-400">No past puzzles yet.</p>
      ) : (
        <ArchiveList entries={entries} />
      )}
    </div>
  );
}
