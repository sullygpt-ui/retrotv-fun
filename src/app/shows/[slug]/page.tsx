import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import showsDetail from '@/data/shows-detail.json';

interface ShowDetail {
  name: string;
  slug: string;
  tmdbId: number;
  overview: string;
  first_air_date: string;
  last_air_date: string;
  number_of_seasons: number;
  number_of_episodes: number;
  genres: string[];
  networks: string[];
  vote_average: number;
  poster_path: string | null;
  backdrop_path: string | null;
  created_by: string[];
  tagline: string;
}

const shows = showsDetail as ShowDetail[];

function getShow(slug: string): ShowDetail | undefined {
  return shows.find((s) => s.slug === slug);
}

function yearRange(show: ShowDetail): string {
  const start = show.first_air_date?.slice(0, 4) || '?';
  const end = show.last_air_date?.slice(0, 4) || '?';
  return start === end ? start : `${start}–${end}`;
}

function amazonLink(name: string): string {
  const q = encodeURIComponent(`${name} complete series DVD`);
  return `https://www.amazon.com/s?k=${q}&tag=retrotv01-20`;
}

export function generateStaticParams() {
  return shows.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const show = getShow(slug);
  if (!show) return { title: 'Show Not Found' };

  return {
    title: `${show.name} (${yearRange(show)}) — RetroTV`,
    description: show.overview || `Learn about ${show.name}, a classic TV show from the ${show.first_air_date?.slice(0, 3)}0s.`,
    openGraph: {
      title: `${show.name} — RetroTV`,
      description: show.overview,
      images: show.poster_path
        ? [`https://image.tmdb.org/t/p/w300${show.poster_path}`]
        : undefined,
    },
  };
}

export default async function ShowPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const show = getShow(slug);
  if (!show) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/shows" className="text-[var(--amber)] hover:underline text-sm font-retro">
        ← All Shows
      </Link>

      <div className="mt-6 flex flex-col sm:flex-row gap-6">
        {show.poster_path && (
          <div className="flex-shrink-0">
            <Image
              src={`https://image.tmdb.org/t/p/w300${show.poster_path}`}
              alt={show.name}
              width={200}
              height={300}
              className="rounded border-2 border-[var(--amber)]/30"
            />
          </div>
        )}

        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl text-[var(--amber)] font-heading leading-tight">
            {show.name}
          </h1>
          <p className="text-gray-400 font-retro text-sm mt-1">
            {yearRange(show)} · {show.networks?.join(', ') || 'Unknown Network'}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {show.genres?.map((g) => (
              <Link
                key={g}
                href={`/shows/genre/${g.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="px-2 py-1 bg-[var(--amber)]/10 text-[var(--amber)] text-xs font-retro rounded hover:bg-[var(--amber)]/20 transition"
              >
                {g}
              </Link>
            ))}
          </div>

          <div className="mt-4 text-gray-400 font-retro text-xs space-y-1">
            <p>📺 {show.number_of_seasons} season{show.number_of_seasons !== 1 ? 's' : ''} · {show.number_of_episodes} episodes</p>
            {show.vote_average > 0 && <p>⭐ {show.vote_average.toFixed(1)} / 10</p>}
            {show.created_by?.length > 0 && <p>Created by: {show.created_by.join(', ')}</p>}
          </div>
        </div>
      </div>

      {show.tagline && (
        <p className="mt-6 text-[var(--amber)]/70 italic font-retro text-sm">
          &ldquo;{show.tagline}&rdquo;
        </p>
      )}

      {show.overview && (
        <p className="mt-4 text-gray-300 font-retro text-sm leading-relaxed">
          {show.overview}
        </p>
      )}

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <a
          href={amazonLink(show.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-[var(--amber)] text-black font-retro text-sm rounded hover:brightness-110 transition text-center"
        >
          📀 Own {show.name} on DVD →
        </a>
        <Link
          href="/"
          className="inline-block px-4 py-2 border border-[var(--amber)] text-[var(--amber)] font-retro text-sm rounded hover:bg-[var(--amber)]/10 transition text-center"
        >
          📺 Play today&apos;s puzzle →
        </Link>
      </div>
    </div>
  );
}
