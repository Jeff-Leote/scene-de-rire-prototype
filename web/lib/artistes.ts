import { prisma } from './prisma';

export async function getFeaturedArtistes(limit: number) {
  return prisma.artiste.findMany({ take: limit, orderBy: { id: 'asc' } });
}
