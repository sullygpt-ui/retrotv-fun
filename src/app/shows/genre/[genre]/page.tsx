import type { Metadata } from 'next';
import Link from 'next/link';
import { getShowsByGenre, genres } from '@/lib/show-data';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return genres.map(g => ({ genre: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ genre: string }> }): Promise<Metadata> {
  const { genre } = await params;
  const info = genres.find(g => g.slug === genre);
  if (!info) return {};
  return {
    title: `${info.name} TV Shows from the 70s & 80s | RetroTV`,
    description: `Browse classic ${info.name.toLowerCase()} TV shows from the 1970s and 1980s featured in RetroTV, the daily TV show guessing game.`,
  };
}

export default async function GenrePage({ params }: { params: Promise<{ genre: string }> }) {
  const { genre } = await params;
  const info = genres.find(g => g.slug === genre);
  if (!info) notFound();

  const shows = getShowsByGenre(genre);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Link href="/shows" className="text-gray-500 hover:text-[var(--amber)] font-retro text-xs">← All Shows</Link>
        <h1 className="text-xl md:text-2xl text-[var(--amber)] font-heading mt-2 mb-1">
          🎬 {info.name}
        </h1>
        <p className="text-gray-400 font-retro text-sm">
          {shows.length} classic {info.name.toLowerCase()} shows
        </p>
      </div>

      <div className="bg-[var(--bg-darker)] rounded-lg p-4 border border-gray-700">
        <div className="grid grid-cols-1 gap-1">
          {shows.map(show => (
            <Link key={show.slug} href={`/shows/${show.slug}`} className="py-1.5 px-2 text-gray-300 hover:text-[var(--amber)] hover:bg-[var(--bg-dark)] rounded transition font-retro text-sm">
              {show.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Other genres */}
      <div className="bg-[var(--bg-darker)] rounded-lg p-4 border border-gray-700">
        <h2 className="text-[var(--amber)] font-heading text-xs mb-3">Other Genres</h2>
        <div className="flex flex-wrap gap-2">
          {genres.filter(g => g.slug !== genre).map(g => (
            <Link key={g.slug} href={`/shows/genre/${g.slug}`} className="py-1 px-3 bg-[var(--bg-dark)] rounded border border-gray-600 text-[var(--amber)] hover:border-[var(--amber)] transition font-retro text-xs">
              {g.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
