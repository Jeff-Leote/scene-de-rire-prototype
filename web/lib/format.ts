/**
 * Formate une date de spectacle (YYYY-MM-DD) en français long, ex: "mardi 1 septembre 2026".
 */
export function formatSpectacleDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

/**
 * Formate une heure de spectacle en HH:mm, en acceptant un objet Date (Prisma renvoie
 * les colonnes @db.Time comme une date épochée à 1970-01-01).
 */
export function formatSpectacleTime(time: Date | string): string {
  const d = typeof time === 'string' ? new Date(time) : time;
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(d);
}
