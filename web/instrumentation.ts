/**
 * Ping quotidien vers la base de données, en filet de sécurité contre la mise en pause
 * automatique de Supabase après 7 jours d'inactivité. Le trafic réel du site suffit
 * normalement à générer cette activité — ce ping ne sert qu'à couvrir les périodes
 * creuses (ex: développement, avant le lancement).
 *
 * Volontairement une fois par jour, pas plus : pas besoin de spammer les logs ni la
 * base pour ce que c'est.
 */
async function startSupabasePing() {
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

/**
 * Ping externe toutes les 8 minutes vers l'URL publique du service, pour éviter la mise
 * en veille du plan gratuit Render (seuil de 15 minutes d'inactivité). Même logique que
 * le keep-alive de l'ancien backend Express (backend/src/server.js).
 */
function startRenderPing() {
  const https = require('https') as typeof import('https');
  const url = process.env.RENDER_EXTERNAL_URL || 'https://espace-comedie.onrender.com';
  const EIGHT_MINUTES_MS = 8 * 60 * 1000;

  const ping = () => {
    const timestamp = new Date().toISOString();
    https
      .get(url, (res) => {
        console.log(`[keep-alive] Ping Render réussi - ${res.statusCode} - ${timestamp}`);
      })
      .on('error', (error) => {
        console.error('[keep-alive] Ping Render échoué:', error.message, '-', timestamp);
      });
  };

  setInterval(ping, EIGHT_MINUTES_MS);
}

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }

  await startSupabasePing();

  if (process.env.NODE_ENV === 'production') {
    startRenderPing();
  }
}
