import type { Metadata } from 'next';
import Link from 'next/link';
import { allShows, genres } from '@/lib/show-data';

export const metadata: Metadata = {
  title: 'Complete List of Classic TV Shows | RetroTV',
  description: 'Browse all 200+ classic 70s and 80s TV shows featured in RetroTV, the daily TV show guessing game. Find your favorites from Happy Days to Knight Rider.',
};

export default function ShowsIndex() {
  const sorted = [...allShows].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-xl md:text-2xl text-[var(--amber)] font-heading mb-2">
          📺 All Shows
        </h1>
        <p className="text-gray-400 font-retro text-sm">
          {sorted.length} classic TV shows from the 70s &amp; 80s
        </p>
      </div>

      {/* Browse by Decade */}
      <div className="bg-[var(--bg-darker)] rounded-lg p-4 border border-gray-700">
        <h2 className="text-[var(--amber)] font-heading text-xs mb-3">Browse by Decade</h2>
        <div className="flex gap-3">
          <Link href="/shows/decade/1970s" className="flex-1 text-center py-2 px-4 bg-[var(--bg-dark)] rounded border border-gray-600 text-[var(--amber)] hover:border-[var(--amber)] transition font-retro text-lg">
            1970s
          </Link>
          <Link href="/shows/decade/1980s" className="flex-1 text-center py-2 px-4 bg-[var(--bg-dark)] rounded border border-gray-600 text-[var(--amber)] hover:border-[var(--amber)] transition font-retro text-lg">
            1980s
          </Link>
        </div>
      </div>

      {/* Browse by Genre */}
      <div className="bg-[var(--bg-darker)] rounded-lg p-4 border border-gray-700">
        <h2 className="text-[var(--amber)] font-heading text-xs mb-3">Browse by Genre</h2>
        <div className="grid grid-cols-2 gap-2">
          {genres.map(g => (
            <Link key={g.slug} href={`/shows/genre/${g.slug}`} className="py-2 px-3 bg-[var(--bg-dark)] rounded border border-gray-600 text-[var(--amber)] hover:border-[var(--amber)] transition font-retro text-sm text-center">
              {g.name}
            </Link>
          ))}
        </div>
      </div>

      {/* All Shows A-Z */}
      <div className="bg-[var(--bg-darker)] rounded-lg p-4 border border-gray-700">
        <h2 className="text-[var(--amber)] font-heading text-xs mb-3">All Shows A–Z</h2>
        <div className="grid grid-cols-1 gap-1">
          {sorted.map(show => (
            <Link key={show.slug} href={`/shows/${show.slug}`} className="py-1.5 px-2 text-gray-300 hover:text-[var(--amber)] hover:bg-[var(--bg-dark)] rounded transition font-retro text-sm">
              {show.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
