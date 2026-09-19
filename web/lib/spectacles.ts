import { prisma } from './prisma';
import type { Spectacle } from '@prisma/client';

function startOfTodayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/**
 * Une ligne par titre de spectacle, avec sa prochaine date à venir.
 * Un même spectacle (ex: "Tchatcheur comedy club") a plusieurs occurrences en base,
 * une par date/heure — on ne garde ici que la plus proche à venir pour chaque titre.
 */
export async function getUpcomingSpectaclesByTitle(limit: number): Promise<Spectacle[]> {
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
}

/**
 * Les N prochaines occurrences chronologiques, sans dédoublonnage par titre — un même
 * spectacle peut apparaître plusieurs fois si ses prochaines séances sont les plus proches.
 */
export async function getNextUpcomingOccurrences(limit: number): Promise<Spectacle[]> {
  return prisma.spectacle.findMany({
    where: { dateSpectacle: { gte: startOfTodayUTC() } },
    orderBy: [{ dateSpectacle: 'asc' }, { heureSpectacle: 'asc' }],
    take: limit,
  });
}

/**
 * Toutes les occurrences, pour alimenter le calendrier mensuel (navigation côté client
 * sans requête supplémentaire par mois).
 */
export async function getAllSpectaclesForCalendar() {
  return prisma.spectacle.findMany({
    select: { id: true, title: true, dateSpectacle: true, heureSpectacle: true },
    orderBy: { dateSpectacle: 'asc' },
  });
}
