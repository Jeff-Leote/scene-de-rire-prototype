import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';

export interface CarrouselContent {
  spectacleIds: number[];
}

export interface TexteContent {
  title: string;
  text: string;
}

export interface ImageContent {
  path: string;
  alt?: string;
}

export interface PageBlock {
  type: 'carrousel' | 'texte' | 'image';
  visible: boolean;
  content: CarrouselContent | TexteContent | ImageContent;
}

export interface PublishedPageVersion {
  id: string;
  blocks: PageBlock[];
}

async function fetchPublishedPageVersion(siteId: string, slug: string): Promise<PublishedPageVersion | null> {
  if (!siteId) return null;
  try {
    const page = await prisma.page.findUnique({
      where: { siteId_slug: { siteId, slug } },
      include: {
        versions: {
          where: { status: 'PUBLISHED' },
          take: 1,
          orderBy: { publishedAt: 'desc' },
          select: { id: true, blocks: true },
        },
      },
    });
    const version = page?.versions[0];
    if (!version) return null;
    return { id: version.id, blocks: version.blocks as unknown as PageBlock[] };
  } catch {
    return null;
  }
}

// Un cache par page pour que revalidateTag n'invalide que la page concernée
const getAccueilVersionCached = unstable_cache(
  (siteId: string) => fetchPublishedPageVersion(siteId, 'accueil'),
  ['published-page-version-accueil'],
  { tags: ['page-accueil'] }
);

const getLieuVersionCached = unstable_cache(
  (siteId: string) => fetchPublishedPageVersion(siteId, 'le-lieu'),
  ['published-page-version-le-lieu'],
  { tags: ['page-le-lieu'] }
);

export function getPublishedPageVersion(slug: string): Promise<PublishedPageVersion | null> {
  const siteId = process.env.SITE_ID ?? '';
  if (slug === 'le-lieu') return getLieuVersionCached(siteId);
  return getAccueilVersionCached(siteId);
}
