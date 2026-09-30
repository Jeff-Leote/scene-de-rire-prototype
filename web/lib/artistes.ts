import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';

const REVALIDATE_SECONDS = 7200; // 2h — réduit les requêtes Postgres répétées (egress Supabase)

export const getFeaturedArtistes = unstable_cache(
  async (limit: number) => {
    return prisma.artiste.findMany({ take: limit, orderBy: { id: 'asc' } });
  },
  ['artistes-featured'],
  { revalidate: REVALIDATE_SECONDS }
);

export const getAllArtistes = unstable_cache(
  async () => {
    return prisma.artiste.findMany({ orderBy: { id: 'asc' } });
  },
  ['artistes-all'],
  { revalidate: REVALIDATE_SECONDS }
);
