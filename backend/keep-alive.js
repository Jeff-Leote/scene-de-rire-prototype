// 🔄 Script de Keep-Alive pour Render
// Ce script maintient le service actif pour éviter la mise en veille

const https = require('https');
const http = require('http');

// 🚀 Configuration ULTRA-optimisée pour la performance maximale
const KEEP_ALIVE_INTERVAL = 5 * 60 * 1000; // 5 minutes (ultra-agressif vs les 15min de Render)
const HEALTH_CHECK_INTERVAL = 2 * 60 * 1000;  // 2 minutes (vérification ultra-fréquente)

// URLs à maintenir actives
const urls = [
  process.env.FRONTEND_URL || 'https://espacecomedie.fr',
  process.env.BACKEND_URL || 'https://your-backend.onrender.com'
].filter(Boolean);

console.log('🚀 Script de Keep-Alive démarré');
console.log('⏰ Intervalle de keep-alive:', KEEP_ALIVE_INTERVAL / 1000, 'secondes');
console.log('🔍 URLs à maintenir actives:', urls);

// Fonction pour faire un ping HTTP/HTTPS
const pingUrl = (url) => {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, (res) => {
      console.log(`✅ Keep-alive réussi: ${url} - Status: ${res.statusCode}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.warn(`⚠️ Keep-alive échoué: ${url} - ${err.message}`);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      console.warn(`⏰ Timeout keep-alive: ${url}`);
      req.destroy();
      resolve(false);
    });
  });
};

// Fonction principale de keep-alive
const performKeepAlive = async () => {
  console.log(`\n🔄 Keep-alive démarré à ${new Date().toISOString()}`);
  
  const results = await Promise.allSettled(
    urls.map(url => pingUrl(url))
  );
  
  const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
  console.log(`📊 Résultats: ${successCount}/${urls.length} URLs maintenues actives`);
};

// Fonction de vérification de santé
const healthCheck = async () => {
  console.log(`🏥 Vérification de santé à ${new Date().toISOString()}`);
  
  // Vérifier la base de données
  try {
    const db = require('./src/db');
    const [rows] = await db.query('SELECT 1 as health_check');
    console.log('✅ Base de données: OK');
  } catch (error) {
    console.error('❌ Base de données: Erreur -', error.message);
  }
};

// Démarrer les intervalles
setInterval(performKeepAlive, KEEP_ALIVE_INTERVAL);
setInterval(healthCheck, HEALTH_CHECK_INTERVAL);

// Premier keep-alive immédiat
performKeepAlive();

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du script de Keep-Alive...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du script de Keep-Alive...');
  process.exit(0);
});

console.log('✅ Script de Keep-Alive configuré et démarré');
console.log('💡 Utilisez Ctrl+C pour arrêter le script');
