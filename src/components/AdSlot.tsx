"use client";

export type AdPlacement = "sidebar" | "banner" | "post-game";

interface Ad {
  image: string;
  url: string;
  alt: string;
  label?: string;
}

// Placeholder ads — replace URLs with your Amazon Associates / affiliate links
const SIDEBAR_ADS: Ad[] = [
  {
    image: "/ads/retro-console.svg",
    url: "https://www.amazon.com/?tag=retrotv01-20",
    alt: "Retro Gaming Consoles",
    label: "🕹️ Retro Consoles",
  },
  {
    image: "/ads/tv-boxsets.svg",
    url: "https://www.amazon.com/?tag=retrotv01-20",
    alt: "Classic TV Box Sets",
    label: "📀 Classic TV on DVD",
  },
  {
    image: "/ads/vintage-merch.svg",
    url: "https://www.amazon.com/?tag=retrotv01-20",
    alt: "Vintage 70s & 80s Merch",
    label: "🛒 Retro Merch",
  },
];

const BANNER_ADS: Ad[] = [
  {
    image: "/ads/banner-retro.svg",
    url: "https://www.amazon.com/?tag=retrotv01-20",
    alt: "Shop retro TV & gaming",
    label: "Shop retro TV & gaming on Amazon",
  },
];

function SidebarAd({ ad }: { ad: Ad }) {
  return (
    <a
      href={ad.url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="ad-card group"
    >
      <div className="ad-image-wrap">
        <img src={ad.image} alt={ad.alt} className="ad-image" loading="lazy" />
      </div>
      {ad.label && <span className="ad-label">{ad.label}</span>}
    </a>
  );
}

function BannerAd({ ad }: { ad: Ad }) {
  return (
    <a
      href={ad.url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="ad-banner group"
    >
      <img src={ad.image} alt={ad.alt} className="ad-banner-image" loading="lazy" />
      {ad.label && <span className="ad-banner-label">{ad.label}</span>}
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
  const ad = BANNER_ADS[0];
  return (
    <div className="ad-bottom-banner">
      <BannerAd ad={ad} />
      <p className="ad-disclaimer">Ad</p>
    </div>
  );
}
