import { MetadataRoute } from 'next';
import showsDetail from '@/data/shows-detail.json';
import { todayUTC } from '@/lib/dates';
import { pastDates } from '@/lib/rotation';
import { genres, getShowsByGenre } from '@/lib/show-data';

// Regenerated daily so each new puzzle and archive day enters the sitemap.
export const revalidate = 86400;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://retrotv.fun';
  const today = new Date(`${todayUTC()}T00:00:00Z`);

  const staticPages: MetadataRoute.Sitemap = [
    // Trailing slash: the home page's canonical is `/`, and a <loc> that
    // redirects is a round trip Google doesn't need to make.
    { url: `${baseUrl}/`, lastModified: today, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/archive`, lastModified: today, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/faq`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/shows`, lastModified: today, changeFrequency: 'weekly', priority: 0.8 },
  ];

  // Every past puzzle is a playable page.
  const archivePages: MetadataRoute.Sitemap = pastDates().map((date) => ({
    url: `${baseUrl}/archive/${date}`,
    lastModified: new Date(`${date}T00:00:00Z`),
    changeFrequency: 'yearly' as const,
    priority: 0.4,
  }));

  // Decade pages
  const decades = ['1970s', '1980s'];
  const decadePages: MetadataRoute.Sitemap = decades.map((d) => ({
    url: `${baseUrl}/shows/decade/${d}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Genre pages. These come from the site's own browse buckets, not from raw
  // TMDB genre names: TMDB calls things "Sci-Fi & Fantasy", "Kids" and
  // "War & Politics", none of which are routes, so deriving slugs from show
  // data put 9 URLs in the sitemap that 404.
  const genrePages: MetadataRoute.Sitemap = genres
    .filter((genre) => getShowsByGenre(genre.slug).length > 0)
    .map((genre) => ({
      url: `${baseUrl}/shows/genre/${genre.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

  // Show pages
  const showPages: MetadataRoute.Sitemap = (showsDetail as { slug: string }[]).map((s) => ({
    url: `${baseUrl}/shows/${s.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...decadePages, ...genrePages, ...showPages, ...archivePages];
}
