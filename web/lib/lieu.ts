import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';

const REVALIDATE_SECONDS = 7200; // 2h — réduit les requêtes Postgres répétées (egress Supabase)

export const getMainLieuImage = unstable_cache(
  async () => {
    return prisma.lieu.findFirst({ where: { isMain: true } });
  },
  ['lieu-main-image'],
  { revalidate: REVALIDATE_SECONDS }
);

export const getGalleryLieuImages = unstable_cache(
  async () => {
    return prisma.lieu.findMany({ where: { isMain: false }, orderBy: { id: 'asc' } });
  },
  ['lieu-gallery-images'],
  { revalidate: REVALIDATE_SECONDS }
);
