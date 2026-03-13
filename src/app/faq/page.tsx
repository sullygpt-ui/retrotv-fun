import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FAQ | RetroTV - Daily TV Show Guessing Game',
  description: 'Frequently asked questions about RetroTV, the daily 70s and 80s TV show guessing game. Learn how to play, scoring, and more.',
};

const faqs = [
  {
    q: 'When does a new puzzle drop?',
    a: 'A brand new puzzle goes live every day at midnight UTC. That\'s 7 PM Eastern / 6 PM Central the day before.',
  },
  {
    q: 'How many shows are included?',
    a: 'Over 200 classic TV shows from the 1970s and 1980s — sitcoms, dramas, action shows, cartoons, and more.',
  },
  {
    q: 'What decades are covered?',
    a: 'RetroTV focuses on the golden age of television: the 1970s and 1980s. Some shows span both decades.',
  },
  {
    q: 'How does scoring work?',
    a: 'You get up to 6 guesses. Each wrong guess reveals a clearer screenshot. Your score is based on how few guesses you needed — getting it on the first (blurriest) frame is the best!',
  },
  {
    q: 'Can I play old puzzles?',
    a: 'Yes! Every past puzzle is available in the archive. Go back and play any day you missed.',
  },
  {
    q: 'I got it wrong — can I try again?',
    a: 'Each puzzle is one attempt per day. But come back tomorrow for a fresh challenge, or explore the archive for past puzzles you haven\'t tried.',
  },
  {
    q: 'Who made this?',
    a: 'RetroTV was built by fans of classic television. We also run iusedtowatchthis.com, a companion site dedicated to the shows that shaped a generation.',
  },
];

export default function FAQPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-xl md:text-2xl text-[var(--amber)] font-heading mb-2">
          ❓ FAQ
        </h1>
        <p className="text-gray-400 font-retro text-sm">
          Frequently Asked Questions
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-[var(--bg-darker)] rounded-lg p-4 border border-gray-700">
            <h2 className="text-[var(--amber)] font-heading text-xs mb-2">{faq.q}</h2>
            <p className="text-gray-300 font-retro text-sm leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="text-center space-y-2">
        <Link href="/about" className="text-[var(--amber)] hover:underline font-retro text-sm block">
          Learn more about RetroTV →
        </Link>
        <Link href="/shows" className="text-[var(--amber)] hover:underline font-retro text-sm block">
          Browse all shows →
        </Link>
        <a href="https://iusedtowatchthis.com" target="_blank" rel="noopener noreferrer" className="text-[var(--amber)] hover:underline font-retro text-sm block">
          Visit I Used to Watch This →
        </a>
      </div>
    </div>
  );
}
