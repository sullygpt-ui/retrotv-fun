import Link from "next/link";
import Game from "@/components/Game";
import { todayUTC } from "@/lib/dates";
import { ROTATION_LENGTH, getPublicPuzzle } from "@/lib/rotation";

// Today's puzzle is rendered on the server, so the page arrives playable
// instead of blank-then-fetch — and only one day's data is ever sent.
// Revalidating hourly keeps the puzzle current across the UTC midnight rollover.
export const revalidate = 3600;

export default async function Home() {
  const today = todayUTC();
  const puzzle = await getPublicPuzzle(today);

  if (!puzzle) {
    return (
      <div className="text-center py-20">
        <p className="font-retro text-red-400 text-sm">No puzzle available today!</p>
        <p className="text-gray-400 mt-2">Check back tomorrow.</p>
      </div>
    );
  }

  return (
    <div>
      <Game puzzle={puzzle} today={today} />

      <section className="mt-12 text-gray-400 font-retro text-xs leading-relaxed space-y-3">
        <h2 className="text-[var(--amber)] text-sm">
          Puzzle #{puzzle.number} — guess the classic TV show
        </h2>
        <p>
          RetroTV is a daily guessing game for television&apos;s golden age. Every day you get six
          screenshots from one classic show, starting zoomed far in. Name the show in as few
          frames as you can, then share your score.
        </p>
        <p>
          The library covers {ROTATION_LENGTH} series from the 1970s and 1980s — sitcoms like{" "}
          <Link href="/shows/genre/comedy" className="text-[var(--amber)] hover:underline">
            Cheers and Taxi
          </Link>
          , detective hours like{" "}
          <Link href="/shows/genre/crime-detective" className="text-[var(--amber)] hover:underline">
            Columbo and Magnum, P.I.
          </Link>
          , Saturday-morning{" "}
          <Link
            href="/shows/genre/cartoons-animation"
            className="text-[var(--amber)] hover:underline"
          >
            cartoons
          </Link>
          , and{" "}
          <Link href="/shows/genre/sci-fi" className="text-[var(--amber)] hover:underline">
            sci-fi
          </Link>{" "}
          from Battlestar Galactica to Quantum Leap.
        </p>
        <p>
          A new puzzle unlocks at midnight UTC. Missed one? Every past puzzle is playable in the{" "}
          <Link href="/archive" className="text-[var(--amber)] hover:underline">
            archive
          </Link>
          , and you can browse all{" "}
          <Link href="/shows" className="text-[var(--amber)] hover:underline">
            {ROTATION_LENGTH}+ shows
          </Link>{" "}
          with cast, network and air-date details. No login, no app, free forever.
        </p>
      </section>
    </div>
  );
}
