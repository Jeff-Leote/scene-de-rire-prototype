/**
 * Ping quotidien vers la base de données, en filet de sécurité contre la mise en pause
 * automatique de Supabase après 7 jours d'inactivité. Le trafic réel du site suffit
 * normalement à générer cette activité — ce ping ne sert qu'à couvrir les périodes
 * creuses (ex: développement, avant le lancement).
 *
 * Volontairement une fois par jour, pas plus : pas besoin de spammer les logs ni la
 * base pour ce que c'est.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }

  const { prisma } = await import('@/lib/prisma');
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  const ping = async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log(`[keep-alive] Ping Supabase réussi - ${new Date().toISOString()}`);
    } catch (error) {
      console.error('[keep-alive] Ping Supabase échoué:', error);
    }
  };

  setInterval(ping, ONE_DAY_MS);
}
