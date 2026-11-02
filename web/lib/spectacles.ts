import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';
import type { Spectacle } from '@prisma/client';

const REVALIDATE_SECONDS = 7200; // 2h — réduit les requêtes Postgres répétées (egress Supabase)

function startOfTodayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

// unstable_cache sérialise son résultat en JSON : les champs Date de Prisma reviennent
// sous forme de chaînes après passage par le cache — on les revivifie ici.
function reviveSpectacleDates<T extends { dateSpectacle: Date; heureSpectacle: Date }>(s: T): T {
  return { ...s, dateSpectacle: new Date(s.dateSpectacle), heureSpectacle: new Date(s.heureSpectacle) };
}

/**
 * Une ligne par titre de spectacle, avec sa prochaine date à venir.
 * Un même spectacle (ex: "Tchatcheur comedy club") a plusieurs occurrences en base,
 * une par date/heure — on ne garde ici que la plus proche à venir pour chaque titre.
 */
const getUpcomingSpectaclesByTitleCached = unstable_cache(
  async (siteId: string, limit: number): Promise<Spectacle[]> => {
    const upcoming = await prisma.spectacle.findMany({
      where: { siteId, status: 'PUBLISHED', deletedAt: null, dateSpectacle: { gte: startOfTodayUTC() } },
      orderBy: [{ dateSpectacle: 'asc' }, { heureSpectacle: 'asc' }],
    });

    const seenTitles = new Set<string>();
    const nextPerTitle: Spectacle[] = [];
    for (const spectacle of upcoming) {
      if (seenTitles.has(spectacle.title)) continue;
      seenTitles.add(spectacle.title);
      nextPerTitle.push(spectacle);
      if (nextPerTitle.length >= limit) break;
    }
    return nextPerTitle;
  },
  ['spectacles-upcoming-by-title'],
  { revalidate: REVALIDATE_SECONDS, tags: ['spectacles'] }
);

export async function getUpcomingSpectaclesByTitle(limit: number): Promise<Spectacle[]> {
  const siteId = process.env.SITE_ID ?? '';
  const result = await getUpcomingSpectaclesByTitleCached(siteId, limit);
  return result.map(reviveSpectacleDates);
}

/**
 * Les N prochaines occurrences chronologiques, sans dédoublonnage par titre — un même
 * spectacle peut apparaître plusieurs fois si ses prochaines séances sont les plus proches.
 */
const getNextUpcomingOccurrencesCached = unstable_cache(
  async (siteId: string, limit: number): Promise<Spectacle[]> => {
    return prisma.spectacle.findMany({
      where: { siteId, status: 'PUBLISHED', deletedAt: null, dateSpectacle: { gte: startOfTodayUTC() } },
      orderBy: [{ dateSpectacle: 'asc' }, { heureSpectacle: 'asc' }],
      take: limit,
    });
  },
  ['spectacles-next-occurrences'],
  { revalidate: REVALIDATE_SECONDS, tags: ['spectacles'] }
);

export async function getNextUpcomingOccurrences(limit: number): Promise<Spectacle[]> {
  const siteId = process.env.SITE_ID ?? '';
  const result = await getNextUpcomingOccurrencesCached(siteId, limit);
  return result.map(reviveSpectacleDates);
}

/**
 * Page de spectacles à venir (chronologique, sans dédoublonnage par titre), pour la
 * grille paginée de /programmation.
 */
const getUpcomingSpectaclesPageCached = unstable_cache(
  async (siteId: string, page: number, limit: number) => {
    const where = { siteId, status: 'PUBLISHED', deletedAt: null, dateSpectacle: { gte: startOfTodayUTC() } };
    const [items, total] = await Promise.all([
      prisma.spectacle.findMany({
        where,
        orderBy: [{ dateSpectacle: 'asc' }, { heureSpectacle: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.spectacle.count({ where }),
    ]);
    return { items, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
  },
  ['spectacles-upcoming-page'],
  { revalidate: REVALIDATE_SECONDS, tags: ['spectacles'] }
);

export async function getUpcomingSpectaclesPage(page: number, limit: number) {
  const siteId = process.env.SITE_ID ?? '';
  const result = await getUpcomingSpectaclesPageCached(siteId, page, limit);
  return { ...result, items: result.items.map(reviveSpectacleDates) };
}

/**
 * Une occurrence précise, pour la page détail /programmation/[id].
 */
const getSpectacleByIdCached = unstable_cache(
  async (siteId: string, id: number): Promise<Spectacle | null> => {
    return prisma.spectacle.findFirst({ where: { id, siteId, status: 'PUBLISHED', deletedAt: null } });
  },
  ['spectacle-by-id'],
  { revalidate: REVALIDATE_SECONDS, tags: ['spectacles'] }
);

export async function getSpectacleById(id: number): Promise<Spectacle | null> {
  const siteId = process.env.SITE_ID ?? '';
  const result = await getSpectacleByIdCached(siteId, id);
  return result ? reviveSpectacleDates(result) : null;
}

/**
 * Prochaine occurrence d'un titre précis, pour la page /sponsorise/[slug]
 * (landing page publicitaire adressée par titre plutôt que par id).
 */
const getNextOccurrenceByTitleCached = unstable_cache(
  async (siteId: string, title: string): Promise<Spectacle | null> => {
    return prisma.spectacle.findFirst({
      where: { siteId, status: 'PUBLISHED', deletedAt: null, title, dateSpectacle: { gte: startOfTodayUTC() } },
      orderBy: [{ dateSpectacle: 'asc' }, { heureSpectacle: 'asc' }],
    });
  },
  ['spectacle-next-by-title'],
  { revalidate: REVALIDATE_SECONDS, tags: ['spectacles'] }
);

export async function getNextOccurrenceByTitle(title: string): Promise<Spectacle | null> {
  const siteId = process.env.SITE_ID ?? '';
  const result = await getNextOccurrenceByTitleCached(siteId, title);
  return result ? reviveSpectacleDates(result) : null;
}

/**
 * Jusqu'à `limit` photos additionnelles liées à la catégorie du spectacle (pas au
 * spectacle lui-même — le rattachement se fait par catégorie, comme sur le site actuel).
 */
export const getPhotosForCategory = unstable_cache(
  async (categoryId: number | null, limit: number) => {
    if (!categoryId) return [];
    return prisma.photoAdditionnelle.findMany({
      where: { categoryId, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
      take: limit,
    });
  },
  ['photos-for-category'],
  { revalidate: REVALIDATE_SECONDS, tags: ['spectacles'] }
);

/**
 * Id + date de chaque occurrence à venir, pour générer le sitemap (une URL par page
 * détail réellement utile — inutile d'indexer des séances déjà passées).
 */
const getUpcomingSpectacleIdsForSitemapCached = unstable_cache(
  async (siteId: string) => {
    return prisma.spectacle.findMany({
      where: { siteId, status: 'PUBLISHED', deletedAt: null, dateSpectacle: { gte: startOfTodayUTC() } },
      select: { id: true, dateSpectacle: true },
      orderBy: { dateSpectacle: 'asc' },
    });
  },
  ['spectacle-ids-for-sitemap'],
  { revalidate: REVALIDATE_SECONDS, tags: ['spectacles'] }
);

export async function getUpcomingSpectacleIdsForSitemap() {
  const siteId = process.env.SITE_ID ?? '';
  const result = await getUpcomingSpectacleIdsForSitemapCached(siteId);
  return result.map((s) => ({ ...s, dateSpectacle: new Date(s.dateSpectacle) }));
}

/**
 * Toutes les occurrences, pour alimenter le calendrier mensuel (navigation côté client
 * sans requête supplémentaire par mois).
 */
const getAllSpectaclesForCalendarCached = unstable_cache(
  async (siteId: string) => {
    return prisma.spectacle.findMany({
      where: { siteId, status: 'PUBLISHED', deletedAt: null },
      select: { id: true, title: true, dateSpectacle: true, heureSpectacle: true },
      orderBy: { dateSpectacle: 'asc' },
    });
  },
  ['spectacles-all-for-calendar'],
  { revalidate: REVALIDATE_SECONDS, tags: ['spectacles'] }
);

export async function getAllSpectaclesForCalendar() {
  const siteId = process.env.SITE_ID ?? '';
  const result = await getAllSpectaclesForCalendarCached(siteId);
  return result.map(reviveSpectacleDates);
}

/**
 * Spectacles ciblés par leurs identifiants (carrousel piloté par des blocs).
 * Filtre ceux qui n'existent pas ou ne sont pas publiés ; pas de cache — les IDs
 * changent à chaque publication de page, le cache de page suffit.
 */
export async function getSpectaclesByIds(ids: number[]): Promise<Spectacle[]> {
  if (ids.length === 0) return [];
  const siteId = process.env.SITE_ID ?? '';
  const spectacles = await prisma.spectacle.findMany({
    where: { id: { in: ids }, siteId, status: 'PUBLISHED', deletedAt: null },
  });
  // Restitue l'ordre défini dans le bloc
  const indexed = new Map(spectacles.map((s) => [s.id, s]));
  return ids.flatMap((id) => {
    const s = indexed.get(id);
    return s ? [reviveSpectacleDates(s)] : [];
  });
}
