import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Game from "@/components/Game";
import showsDetail from "@/data/shows-detail.json";
import { genreLinks } from "@/lib/show-data";
import { addDays, todayUTC } from "@/lib/dates";
import {
  dayIndex,
  getPublicPuzzle,
  getPuzzle,
  isSettledPuzzleDate,
  isValidPuzzleDate,
  pastDates,
} from "@/lib/rotation";

// Past puzzles never change, so each page is generated once and then cached.
export const revalidate = 86400;

interface ShowFacts {
  slug: string;
  overview: string;
  first_air_date: string;
  last_air_date: string;
  number_of_seasons: number;
  number_of_episodes: number;
  genres: string[];
  networks: string[];
}

const FACTS = new Map(
  (showsDetail as ShowFacts[]).map((show) => [show.slug, show]),
);

function yearRange(facts: ShowFacts | undefined): string {
  const start = facts?.first_air_date?.slice(0, 4);
  const end = facts?.last_air_date?.slice(0, 4);
  if (!start) return "";
  return start === end ? start : `${start}–${end}`;
}

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
  const alternates = { canonical: `/archive/${date}` };
  const answer = isSettledPuzzleDate(date) ? getPuzzle(date) : null;

  // Naming the show is the whole point of an answer page: "<show> screenshot
  // quiz" and "puzzle #N answer" are the queries these pages can win. Today's
  // puzzle stays unnamed.
  if (!answer) {
    return {
      title: `Puzzle #${number} (${date}) — RetroTV`,
      description: `Play RetroTV puzzle #${number} from ${date}. Guess the classic 70s or 80s TV show from six screenshots.`,
      alternates,
      // Today's puzzle is already the home page; this route is the same game
      // at a second URL, so keep it out of the index.
      robots: { index: false, follow: true },
    };
  }

  const years = yearRange(FACTS.get(answer.showSlug));
  return {
    title: `RetroTV puzzle #${number} answer: ${answer.showName}`,
    description:
      `The answer to RetroTV puzzle #${number} (${date}) was ${answer.showName}` +
      `${years ? `, which aired ${years}` : ""}. Play the puzzle yourself from six screenshots, ` +
      `then read up on the show.`,
    alternates,
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

  const answer = isSettledPuzzleDate(date) ? getPuzzle(date) : null;
  const facts = answer ? FACTS.get(answer.showSlug) : undefined;
  const years = yearRange(facts);

  const previous = dayIndex(date) > 0 ? addDays(date, -1) : null;
  const next = isSettledPuzzleDate(addDays(date, 1)) ? addDays(date, 1) : null;

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

      {answer && (
        <>
          {/*
            Collapsed by default so nobody scrolling the archive is spoiled,
            but rendered on the server and inside <details>, which Google
            indexes — the text is in the HTML either way.
          */}
          <details className="mt-8 bg-[var(--bg-darker)] border border-gray-700 rounded-lg px-5 py-4">
            <summary className="cursor-pointer text-[var(--amber)] font-heading text-xs">
              Reveal the answer
            </summary>

            <div className="mt-4 space-y-3 font-retro text-sm text-gray-300 leading-relaxed">
              <h2 className="text-[var(--amber)] font-heading text-sm">
                {answer.showName}
              </h2>

              <p>
                Puzzle #{puzzle.number} ran on {date}, and the answer was{" "}
                <strong className="text-white">{answer.showName}</strong>
                {years ? `, which aired ${years}` : ""}
                {facts?.networks?.length ? ` on ${facts.networks.join(", ")}` : ""}.
                {facts?.number_of_episodes
                  ? ` It ran ${facts.number_of_seasons} season${facts.number_of_seasons === 1 ? "" : "s"} and ${facts.number_of_episodes} episodes.`
                  : ""}
              </p>

              {facts?.overview && <p>{facts.overview}</p>}

              {genreLinks(facts?.genres).length > 0 && (
                <p className="text-gray-400 text-xs">
                  Genres:{" "}
                  {genreLinks(facts?.genres).map((genre, i) => (
                    <span key={genre.slug}>
                      {i > 0 ? ", " : ""}
                      <Link
                        href={`/shows/genre/${genre.slug}`}
                        className="text-[var(--amber)] hover:underline"
                      >
                        {genre.name}
                      </Link>
                    </span>
                  ))}
                </p>
              )}

              <p>
                <Link
                  href={`/shows/${answer.showSlug}`}
                  className="text-[var(--amber)] hover:underline"
                >
                  More about {answer.showName} →
                </Link>
              </p>
            </div>
          </details>
        </>
      )}

      {/* Prev/next give the archive a crawlable spine instead of 200+ orphans
          hanging off one index page. */}
      <nav className="mt-6 flex items-center justify-between font-retro text-xs">
        {previous ? (
          <Link href={`/archive/${previous}`} className="text-[var(--amber)] hover:underline">
            ← Puzzle #{puzzle.number - 1}
          </Link>
        ) : (
          <span />
        )}
        <Link href="/" className="text-gray-400 hover:text-[var(--amber)]">
          Play today&apos;s puzzle
        </Link>
        {next ? (
          <Link href={`/archive/${next}`} className="text-[var(--amber)] hover:underline">
            Puzzle #{puzzle.number + 1} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
