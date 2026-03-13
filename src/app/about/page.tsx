import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About RetroTV | Daily 70s & 80s TV Show Guessing Game',
  description: 'RetroTV is a free daily guessing game for fans of classic 70s and 80s TV shows. Like Wordle, but for television nostalgia.',
};

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-xl md:text-2xl text-[var(--amber)] font-heading mb-2">
          📺 About RetroTV
        </h1>
      </div>

      <div className="bg-[var(--bg-darker)] rounded-lg p-5 border border-gray-700 space-y-4 font-retro text-sm text-gray-300 leading-relaxed">
        <p>
          <strong className="text-[var(--amber)]">RetroTV</strong> is a free daily guessing game for fans of classic 70s and 80s television. Think Wordle, but instead of words, you&apos;re guessing TV shows from screenshots.
        </p>

        <h2 className="text-[var(--amber)] font-heading text-xs pt-2">How to Play</h2>
        <p>
          Each day, a new puzzle features a classic TV show. You&apos;ll see a blurry screenshot that gradually gets clearer with each guess. The fewer guesses you need, the better your score. Can you name it on the first frame?
        </p>

        <h2 className="text-[var(--amber)] font-heading text-xs pt-2">Our Library</h2>
        <p>
          RetroTV features over <strong className="text-white">200 shows</strong> from the golden age of television — everything from sitcoms and dramas to action shows and Saturday morning cartoons. Browse the full collection on our{' '}
          <Link href="/shows" className="text-[var(--amber)] hover:underline">shows page</Link>.
        </p>

        <h2 className="text-[var(--amber)] font-heading text-xs pt-2">The Archive</h2>
        <p>
          Missed a day? No problem. Every past puzzle is available in the{' '}
          <Link href="/archive" className="text-[var(--amber)] hover:underline">archive</Link>, so you can catch up anytime.
        </p>

        <h2 className="text-[var(--amber)] font-heading text-xs pt-2">Want More Nostalgia?</h2>
        <p>
          Check out{' '}
          <a href="https://iusedtowatchthis.com" target="_blank" rel="noopener noreferrer" className="text-[var(--amber)] hover:underline">
            I Used to Watch This
          </a>{' '}
          — our companion site where we dive deep into the shows that shaped a generation. Podcast episodes, reviews, and behind-the-scenes stories.
        </p>
      </div>
    </div>
  );
}
