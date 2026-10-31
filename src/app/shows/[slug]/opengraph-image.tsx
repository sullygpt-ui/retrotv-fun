import { ImageResponse } from 'next/og';
import showsDetail from '@/data/shows-detail.json';

export const alt = 'RetroTV — Daily 70s & 80s TV Show Guessing Game';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface ShowDetail {
  name: string;
  slug: string;
  first_air_date: string;
  last_air_date: string;
  networks: string[];
  genres: string[];
}

const shows = showsDetail as ShowDetail[];

/**
 * Per-show share card. Drawn from text only — no remote poster fetch — so it
 * renders fast and can't fail on a TMDB hiccup.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const show = shows.find((s) => s.slug === slug);
  const name = show?.name ?? 'Classic TV';
  const start = show?.first_air_date?.slice(0, 4);
  const end = show?.last_air_date?.slice(0, 4);
  const years = start ? (end && end !== start ? `${start}–${end}` : start) : '';
  const meta = [years, show?.networks?.[0], show?.genres?.[0]].filter(Boolean).join('  ·  ');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(160deg, #15110b 0%, #2a2014 55%, #0d0b07 100%)',
          color: '#FFB347',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ fontSize: 34, letterSpacing: 6, color: '#b9833a' }}>📺 RETROTV.FUN</div>
        <div
          style={{
            fontSize: name.length > 28 ? 72 : 92,
            fontWeight: 700,
            lineHeight: 1.05,
            marginTop: 28,
            color: '#FFD9A0',
          }}
        >
          {name}
        </div>
        {meta && <div style={{ fontSize: 36, marginTop: 24, color: '#c79a5f' }}>{meta}</div>}
        <div style={{ fontSize: 32, marginTop: 48, color: '#a98d64' }}>
          Guess the show from six screenshots — a new puzzle every day
        </div>
      </div>
    ),
    size,
  );
}
