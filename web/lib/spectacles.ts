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
  async (limit: number): Promise<Spectacle[]> => {
    const upcoming = await prisma.spectacle.findMany({
      where: { dateSpectacle: { gte: startOfTodayUTC() } },
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
  { revalidate: REVALIDATE_SECONDS }
);

export async function getUpcomingSpectaclesByTitle(limit: number): Promise<Spectacle[]> {
  const result = await getUpcomingSpectaclesByTitleCached(limit);
  return result.map(reviveSpectacleDates);
}

/**
 * Les N prochaines occurrences chronologiques, sans dédoublonnage par titre — un même
 * spectacle peut apparaître plusieurs fois si ses prochaines séances sont les plus proches.
 */
const getNextUpcomingOccurrencesCached = unstable_cache(
  async (limit: number): Promise<Spectacle[]> => {
    return prisma.spectacle.findMany({
      where: { dateSpectacle: { gte: startOfTodayUTC() } },
      orderBy: [{ dateSpectacle: 'asc' }, { heureSpectacle: 'asc' }],
      take: limit,
    });
  },
  ['spectacles-next-occurrences'],
  { revalidate: REVALIDATE_SECONDS }
);

export async function getNextUpcomingOccurrences(limit: number): Promise<Spectacle[]> {
  const result = await getNextUpcomingOccurrencesCached(limit);
  return result.map(reviveSpectacleDates);
}

/**
 * Page de spectacles à venir (chronologique, sans dédoublonnage par titre), pour la
 * grille paginée de /programmation.
 */
const getUpcomingSpectaclesPageCached = unstable_cache(
  async (page: number, limit: number) => {
    const where = { dateSpectacle: { gte: startOfTodayUTC() } };
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
  { revalidate: REVALIDATE_SECONDS }
);

export async function getUpcomingSpectaclesPage(page: number, limit: number) {
  const result = await getUpcomingSpectaclesPageCached(page, limit);
  return { ...result, items: result.items.map(reviveSpectacleDates) };
}

/**
 * Une occurrence précise, pour la page détail /programmation/[id].
 */
const getSpectacleByIdCached = unstable_cache(
  async (id: number): Promise<Spectacle | null> => {
    return prisma.spectacle.findUnique({ where: { id } });
  },
  ['spectacle-by-id'],
  { revalidate: REVALIDATE_SECONDS }
);

export async function getSpectacleById(id: number): Promise<Spectacle | null> {
  const result = await getSpectacleByIdCached(id);
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
      where: { categoryId },
      orderBy: { id: 'asc' },
      take: limit,
    });
  },
  ['photos-for-category'],
  { revalidate: REVALIDATE_SECONDS }
);

/**
 * Id + date de chaque occurrence à venir, pour générer le sitemap (une URL par page
 * détail réellement utile — inutile d'indexer des séances déjà passées).
 */
const getUpcomingSpectacleIdsForSitemapCached = unstable_cache(
  async () => {
    return prisma.spectacle.findMany({
      where: { dateSpectacle: { gte: startOfTodayUTC() } },
      select: { id: true, dateSpectacle: true },
      orderBy: { dateSpectacle: 'asc' },
    });
  },
  ['spectacle-ids-for-sitemap'],
  { revalidate: REVALIDATE_SECONDS }
);

export async function getUpcomingSpectacleIdsForSitemap() {
  const result = await getUpcomingSpectacleIdsForSitemapCached();
  return result.map((s) => ({ ...s, dateSpectacle: new Date(s.dateSpectacle) }));
}

/**
 * Toutes les occurrences, pour alimenter le calendrier mensuel (navigation côté client
 * sans requête supplémentaire par mois).
 */
const getAllSpectaclesForCalendarCached = unstable_cache(
  async () => {
    return prisma.spectacle.findMany({
      select: { id: true, title: true, dateSpectacle: true, heureSpectacle: true },
      orderBy: { dateSpectacle: 'asc' },
    });
  },
  ['spectacles-all-for-calendar'],
  { revalidate: REVALIDATE_SECONDS }
);

export async function getAllSpectaclesForCalendar() {
  const result = await getAllSpectaclesForCalendarCached();
  return result.map(reviveSpectacleDates);
}
