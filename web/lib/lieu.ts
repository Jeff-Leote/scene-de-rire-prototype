import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';

const REVALIDATE_SECONDS = 7200; // 2h — réduit les requêtes Postgres répétées (egress Supabase)

const getMainLieuImageCached = unstable_cache(
  async (siteId: string) => {
    return prisma.lieu.findFirst({ where: { siteId, isMain: true, deletedAt: null } });
  },
  ['lieu-main-image'],
  { revalidate: REVALIDATE_SECONDS, tags: ['lieu'] }
);

export async function getMainLieuImage() {
  const siteId = process.env.SITE_ID ?? '';
  return getMainLieuImageCached(siteId);
}

const getGalleryLieuImagesCached = unstable_cache(
  async (siteId: string) => {
    return prisma.lieu.findMany({
      where: { siteId, isMain: false, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
  },
  ['lieu-gallery-images'],
  { revalidate: REVALIDATE_SECONDS, tags: ['lieu'] }
);

export async function getGalleryLieuImages() {
  const siteId = process.env.SITE_ID ?? '';
  return getGalleryLieuImagesCached(siteId);
}
