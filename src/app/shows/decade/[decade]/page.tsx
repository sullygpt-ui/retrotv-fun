import type { Metadata } from 'next';
import Link from 'next/link';
import { getShowsByDecade } from '@/lib/show-data';
import { notFound } from 'next/navigation';

const decadeInfo: Record<string, { title: string; desc: string; label: string }> = {
  '1970s': {
    title: 'Best 70s TV Shows | RetroTV',
    desc: 'Explore classic 1970s TV shows featured in RetroTV. From All in the Family to Happy Days — test your knowledge of the best 70s television.',
    label: '1970s',
  },
  '1980s': {
    title: 'Best 80s TV Shows | RetroTV',
    desc: 'Explore classic 1980s TV shows featured in RetroTV. From Knight Rider to The A-Team — test your knowledge of the best 80s television.',
    label: '1980s',
  },
};

export function generateStaticParams() {
  return [{ decade: '1970s' }, { decade: '1980s' }];
}

export async function generateMetadata({ params }: { params: Promise<{ decade: string }> }): Promise<Metadata> {
  const { decade } = await params;
  const info = decadeInfo[decade];
  if (!info) return {};
  return { title: info.title, description: info.desc };
}

export default async function DecadePage({ params }: { params: Promise<{ decade: string }> }) {
  const { decade } = await params;
  const info = decadeInfo[decade];
  if (!info) notFound();

  const shows = getShowsByDecade(decade as '1970s' | '1980s');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Link href="/shows" className="text-gray-500 hover:text-[var(--amber)] font-retro text-xs">← All Shows</Link>
        <h1 className="text-xl md:text-2xl text-[var(--amber)] font-heading mt-2 mb-1">
          📺 {info.label} TV Shows
        </h1>
        <p className="text-gray-400 font-retro text-sm">
          {shows.length} shows from the {info.label}
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
    </div>
  );
}
