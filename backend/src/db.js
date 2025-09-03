//db.js
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "db",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "espace_comedie",
  
  // 🚀 OPTIMISATIONS POUR LA PRODUCTION - PERFORMANCE MAXIMALE
  waitForConnections: false,        // Ne pas attendre les connexions
  connectionLimit: process.env.NODE_ENV === 'production' ? 3 : 5, // Optimal pour Render
  queueLimit: process.env.NODE_ENV === 'production' ? 5 : 10,    // Limiter la file d'attente
  
  // ⚡ OPTIMISATIONS DE PERFORMANCE AVANCÉES
  acquireTimeout: process.env.NODE_ENV === 'production' ? 30000 : 60000, // 30s en prod
  timeout: process.env.NODE_ENV === 'production' ? 30000 : 60000,        // 30s en prod
  reconnect: true,                  // Reconnecter automatiquement
  
  // 🔧 OPTIMISATIONS SPÉCIFIQUES RENDER
  enableKeepAlive: true,           // Maintenir les connexions actives
  keepAliveInitialDelay: 5000,     // Keep-alive toutes les 5s (plus agressif)
  
  // 📊 OPTIMISATIONS MYSQL2
  multipleStatements: false,        // Sécurité
  dateStrings: true,               // Dates en format string pour éviter les conversions
  supportBigNumbers: true,         // Support des grands nombres
  bigNumberStrings: true,          // Grands nombres en string
  
  // 🎯 OPTIMISATIONS DE POOL
  maxIdle: 10000,                  // Fermer les connexions inactives après 10s
  idleTimeout: 10000,              // Timeout pour les connexions inactives
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
