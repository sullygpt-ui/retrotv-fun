import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Game from "@/components/Game";
import { todayUTC } from "@/lib/dates";
import { dayIndex, getPublicPuzzle, isValidPuzzleDate, pastDates } from "@/lib/rotation";

// Past puzzles never change, so each page is generated once and then cached.
export const revalidate = 86400;

/** Prerender the recent archive; older days render on first request. */
export function generateStaticParams() {
  return pastDates(30).map((date) => ({ date }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  if (!isValidPuzzleDate(date)) return { title: "Puzzle Not Found — RetroTV" };
  const number = dayIndex(date) + 1;
  return {
    title: `Puzzle #${number} (${date}) — RetroTV`,
    description: `Play RetroTV puzzle #${number} from ${date}. Guess the classic 70s or 80s TV show from six screenshots.`,
    alternates: { canonical: `/archive/${date}` },
  };
}

export default async function ArchivePuzzlePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!isValidPuzzleDate(date)) notFound();

  const puzzle = await getPublicPuzzle(date);
  if (!puzzle) notFound();

  return (
    <div>
      <Link
        href="/archive"
        className="mb-4 inline-block text-[var(--amber)] font-retro text-xs hover:underline"
      >
        ← Back to Archive
      </Link>
      <p className="text-center text-gray-400 mb-4 text-sm">
        Puzzle #{puzzle.number} · {date}
      </p>
      <Game puzzle={puzzle} today={todayUTC()} isDaily={false} />
    </div>
  );
}
