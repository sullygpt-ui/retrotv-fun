import type { Metadata } from "next";
import Link from "next/link";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import SparkleTrail from "@/components/SparkleTrail";
import { Sidebar, BottomBanner } from "@/components/AdSlot";

// Self-hosted by Next at build time: no render-blocking request to Google and
// no flash of fallback text on the frames.
const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-press-start",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-vt323",
});

export const metadata: Metadata = {
  title: "RetroTV - Daily TV Show Guessing Game",
  description: "Guess the classic 70s & 80s TV show from screenshots! 200+ shows from the 70s and 80s. A new puzzle every day — free, no login required.",
  openGraph: {
    title: "RetroTV - Daily 70s & 80s TV Show Challenge",
    description: "Can you guess the classic TV show from screenshots? 200+ shows, new puzzle daily, free!",
    type: "website",
    url: "https://retrotv.fun",
    siteName: "RetroTV",
  },
  twitter: {
    card: "summary_large_image",
    title: "RetroTV - Daily 70s & 80s TV Show Challenge",
    description: "Can you guess the classic TV show from screenshots? 📺 New puzzle daily!",
  },
  metadataBase: new URL("https://retrotv.fun"),
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${pressStart.variable} ${vt323.variable}`}>
      <body className="min-h-screen">
        <SparkleTrail />
        <div className="crt-overlay" />
        <header className="text-center py-6">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl md:text-3xl text-[var(--amber)] tracking-wider">
              📺 RetroTV
            </h1>
          </Link>
          <p className="text-sm mt-1 text-gray-400 font-retro text-[10px]">
            Daily 70s &amp; 80s TV Show Challenge
          </p>
        </header>
        <div className="flex justify-center gap-6 px-4 pb-12">
          <Sidebar />
          <main className="max-w-lg w-full">
            {children}
          </main>
          <Sidebar />
        </div>
        <BottomBanner />
        <footer className="text-center py-4 text-gray-600 text-sm">
          <nav className="space-x-4 mb-2">
            <Link href="/" className="text-[var(--amber)] hover:underline">Play</Link>
            <Link href="/archive" className="text-[var(--amber)] hover:underline">Archive</Link>
            <Link href="/shows" className="text-[var(--amber)] hover:underline">Shows</Link>
            <Link href="/about" className="text-[var(--amber)] hover:underline">About</Link>
            <Link href="/faq" className="text-[var(--amber)] hover:underline">FAQ</Link>
          </nav>
          <p>RetroTV.fun — A daily dose of nostalgia</p>
          <p className="mt-1"><a href="https://iusedtowatchthis.com" target="_blank" rel="noopener" className="text-[var(--amber)] hover:underline">iusedtowatchthis.com</a> — The 70s &amp; 80s TV Podcast</p>
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
