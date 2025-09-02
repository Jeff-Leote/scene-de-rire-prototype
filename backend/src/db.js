//db.js
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "db",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "espace_comedie",
  
  // 🔧 OPTIMISATIONS POUR LA PRODUCTION
  waitForConnections: false,        // Ne pas attendre les connexions
  connectionLimit: 5,               // Réduire le nombre de connexions (optimal pour Render)
  queueLimit: 10,                   // Limiter la file d'attente
  
  // ⚡ OPTIMISATIONS DE PERFORMANCE
  acquireTimeout: 60000,            // 60s max pour acquérir une connexion
  timeout: 60000,                   // 60s max pour les requêtes
  reconnect: true,                  // Reconnecter automatiquement
  keepAliveInitialDelay: 10000,    // Keep-alive toutes les 10s
  
  // 🚀 OPTIMISATIONS SPÉCIFIQUES RENDER
  enableKeepAlive: true,           // Maintenir les connexions actives
  keepAliveInitialDelay: 10000,    // Délai initial du keep-alive
});

// Test de la connexion avec retry optimisé
const testConnection = (retries = 3, delay = 1000) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error(`❌ Erreur de connexion à la base de données (tentative ${4 - retries}/3):`, err.message);
      if (retries > 1) {
        console.log(`🔄 Nouvelle tentative dans ${delay/1000} seconde...`);
        setTimeout(() => testConnection(retries - 1, delay), delay);
      } else {
        console.error('💥 Impossible de se connecter à la base de données après 3 tentatives');
      }
      return;
    }
    console.log('✅ Connexion à la base de données réussie !');
    connection.release();
  });
};

// Démarrer le test de connexion immédiatement (pas de délai)
testConnection();

// 🔧 Gestion des événements du pool pour le monitoring
pool.on('connection', (connection) => {
  console.log('🔌 Nouvelle connexion MySQL établie');
});

pool.on('acquire', (connection) => {
  console.log('📥 Connexion MySQL acquise');
});

pool.on('release', (connection) => {
  console.log('📤 Connexion MySQL libérée');
});

pool.on('enqueue', () => {
  console.log('⏳ Requête en attente dans la file MySQL');
});

module.exports = pool.promise();
