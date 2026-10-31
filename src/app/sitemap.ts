import { MetadataRoute } from 'next';
import showsDetail from '@/data/shows-detail.json';
import { todayUTC } from '@/lib/dates';
import { pastDates } from '@/lib/rotation';

// Regenerated daily so each new puzzle and archive day enters the sitemap.
export const revalidate = 86400;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://retrotv.fun';
  const today = new Date(`${todayUTC()}T00:00:00Z`);

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: today, changeFrequency: 'daily', priority: 1.0 },
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

  // Genre pages
  const genres = new Set<string>();
  (showsDetail as { genres?: string[] }[]).forEach((s) =>
    s.genres?.forEach((g) => genres.add(g.toLowerCase().replace(/[^a-z0-9]+/g, '-')))
  );
  const genrePages: MetadataRoute.Sitemap = [...genres].map((g) => ({
    url: `${baseUrl}/shows/genre/${g}`,
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
