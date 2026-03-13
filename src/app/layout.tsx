import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RetroTV - Daily TV Show Guessing Game",
  description: "Guess the classic 70s & 80s TV show from screenshots! A new puzzle every day.",
  openGraph: {
    title: "RetroTV - Daily TV Show Guessing Game",
    description: "Guess the classic 70s & 80s TV show from screenshots!",
    type: "website",
    url: "https://retrotv.fun",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="crt-overlay" />
        <header className="text-center py-6">
          <h1 className="text-2xl md:text-3xl text-[var(--amber)] tracking-wider">
            📺 RetroTV
          </h1>
          <p className="text-sm mt-1 text-gray-400 font-retro text-[10px]">
            Daily 70s &amp; 80s TV Show Challenge
          </p>
        </header>
        <main className="max-w-lg mx-auto px-4 pb-12">
          {children}
        </main>
        <footer className="text-center py-4 text-gray-600 text-sm">
          <nav className="space-x-4 mb-2">
            <a href="/" className="text-[var(--amber)] hover:underline">Play</a>
            <a href="/archive" className="text-[var(--amber)] hover:underline">Archive</a>
          </nav>
          <p>RetroTV.fun — A daily dose of nostalgia</p>
        </footer>
      </body>
    </html>
  );
}
