import type { Metadata } from "next";
import "./globals.css";
import SparkleTrail from "@/components/SparkleTrail";
import { Sidebar, BottomBanner } from "@/components/AdSlot";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen">
        <SparkleTrail />
        <div className="crt-overlay" />
        <header className="text-center py-6">
          <h1 className="text-2xl md:text-3xl text-[var(--amber)] tracking-wider">
            📺 RetroTV
          </h1>
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
            <a href="/" className="text-[var(--amber)] hover:underline">Play</a>
            <a href="/archive" className="text-[var(--amber)] hover:underline">Archive</a>
          </nav>
          <p>RetroTV.fun — A daily dose of nostalgia</p>
        </footer>
      </body>
    </html>
  );
}
