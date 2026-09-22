import type { MetadataRoute } from 'next';
import { getUpcomingSpectacleIdsForSitemap } from '@/lib/spectacles';
import { BASE_URL } from '@/lib/config';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const upcomingSpectacles = await getUpcomingSpectacleIdsForSitemap();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/programmation`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/le-lieu`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/artistes`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const spectacleRoutes: MetadataRoute.Sitemap = upcomingSpectacles.map((spectacle) => ({
    url: `${BASE_URL}/programmation/${spectacle.id}`,
    lastModified: spectacle.dateSpectacle,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...spectacleRoutes];
}
