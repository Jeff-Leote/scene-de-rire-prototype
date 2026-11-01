import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';

const REVALIDATE_SECONDS = 7200; // 2h — réduit les requêtes Postgres répétées (egress Supabase)

const getFeaturedArtistesCached = unstable_cache(
  async (siteId: string, limit: number) => {
    return prisma.artiste.findMany({
      where: { siteId, deletedAt: null },
      take: limit,
      orderBy: { id: 'asc' },
    });
  },
  ['artistes-featured'],
  { revalidate: REVALIDATE_SECONDS, tags: ['artistes'] }
);

export async function getFeaturedArtistes(limit: number) {
  const siteId = process.env.SITE_ID ?? '';
  return getFeaturedArtistesCached(siteId, limit);
}

const getAllArtistesCached = unstable_cache(
  async (siteId: string) => {
    return prisma.artiste.findMany({
      where: { siteId, deletedAt: null },
      orderBy: { id: 'asc' },
    });
  },
  ['artistes-all'],
  { revalidate: REVALIDATE_SECONDS, tags: ['artistes'] }
);

export async function getAllArtistes() {
  const siteId = process.env.SITE_ID ?? '';
  return getAllArtistesCached(siteId);
}
