"use client";

export type AdPlacement = "sidebar" | "banner" | "post-game";

interface Ad {
  url: string;
  alt: string;
  label: string;
  emoji: string;
}

const SIDEBAR_ADS: Ad[] = [
  {
    url: "https://www.amazon.com/s?k=retro+gaming+console+classic&tag=retrotv01-20",
    alt: "Retro Gaming Consoles",
    label: "Retro Consoles",
    emoji: "🕹️",
  },
  {
    url: "https://www.amazon.com/s?k=classic+tv+show+complete+series+DVD+70s+80s&tag=retrotv01-20",
    alt: "Classic TV Box Sets",
    label: "Classic TV on DVD",
    emoji: "📀",
  },
  {
    url: "https://www.amazon.com/s?k=retro+80s+70s+vintage+t-shirt+tv+show&tag=retrotv01-20",
    alt: "Vintage 70s & 80s T-Shirts",
    label: "Retro TV Shirts",
    emoji: "👕",
  },
  {
    url: "https://www.amazon.com/s?k=80s+nostalgia+gifts+retro+vintage&tag=retrotv01-20",
    alt: "80s Nostalgia Gifts",
    label: "Nostalgia Gifts",
    emoji: "🎁",
  },
];

const BANNER_AD: Ad = {
  url: "https://www.amazon.com/s?k=classic+tv+show+70s+80s+complete+series&tag=retrotv01-20",
  alt: "Shop retro TV & gaming on Amazon",
  label: "Shop Classic TV & Retro Gaming on Amazon",
  emoji: "📺",
};

function SidebarAd({ ad }: { ad: Ad }) {
  return (
    <a
      href={ad.url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="ad-card group"
    >
      <div className="ad-emoji">{ad.emoji}</div>
      <span className="ad-label">{ad.label}</span>
    </a>
  );
}

interface PostGameAdProps {
  showName: string;
}

export function PostGameAd({ showName }: PostGameAdProps) {
  const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(showName + " complete series DVD")}&tag=retrotv01-20`;
  return (
    <a
      href={searchUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="post-game-ad group"
    >
      <span className="post-game-ad-text">
        📀 Own <strong>{showName}</strong> — Shop the complete series on Amazon →
      </span>
    </a>
  );
}

export function Sidebar() {
  return (
    <aside className="ad-sidebar">
      <div className="ad-sidebar-inner">
        {SIDEBAR_ADS.map((ad, i) => (
          <SidebarAd key={i} ad={ad} />
        ))}
        <p className="ad-disclaimer">Ad</p>
      </div>
    </aside>
  );
}

export function BottomBanner() {
  return (
    <div className="ad-bottom-banner">
      <a
        href={BANNER_AD.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="ad-banner group"
      >
        <span className="ad-banner-emoji">{BANNER_AD.emoji}</span>
        <span className="ad-banner-label">{BANNER_AD.label}</span>
      </a>
      <p className="ad-disclaimer">Ad</p>
    </div>
  );
}
