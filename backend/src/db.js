//db.js
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "db",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "espace_comedie",
  
  // 🚀 OPTIMISATIONS POUR LA PRODUCTION - PERFORMANCE MAXIMALE
  waitForConnections: true,        // Attendre les connexions disponibles
  connectionLimit: process.env.NODE_ENV === 'production' ? 20 : 5, // AUGMENTÉ À 20 pour la production
  queueLimit: process.env.NODE_ENV === 'production' ? 50 : 10,    // AUGMENTÉ À 50 pour la production
  
  // ⚡ OPTIMISATIONS DE PERFORMANCE AVANCÉES
  acquireTimeout: process.env.NODE_ENV === 'production' ? 60000 : 60000, // 60s en prod (plus tolérant)
  timeout: process.env.NODE_ENV === 'production' ? 60000 : 60000,        // 60s en prod (plus tolérant)
  reconnect: true,                  // Reconnecter automatiquement
  
  // 🔧 OPTIMISATIONS SPÉCIFIQUES RENDER
  enableKeepAlive: true,           // Maintenir les connexions actives
  keepAliveInitialDelay: 10000,    // Keep-alive toutes les 10s (moins agressif)
  
  // 📊 OPTIMISATIONS MYSQL2
  multipleStatements: false,        // Sécurité
  dateStrings: true,               // Dates en format string pour éviter les conversions
  supportBigNumbers: true,         // Support des grands nombres
  bigNumberStrings: true,          // Grands nombres en string
  
  // 🎯 OPTIMISATIONS DE POOL
  maxIdle: 30000,                  // Fermer les connexions inactives après 30s (plus tolérant)
  idleTimeout: 30000,              // Timeout pour les connexions inactives (plus tolérant)
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

// 🔧 PRÉ-ÉTABLIR DES CONNEXIONS POUR LA PRODUCTION
const preEstablishConnections = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.log('🚀 Pré-établissement des connexions DB pour la production...');
    
    try {
      // Pré-établir 5 connexions
      const connections = [];
      for (let i = 0; i < 5; i++) {
        const connection = await pool.promise().getConnection();
        connections.push(connection);
        console.log(`🔌 Connexion ${i + 1} pré-établie`);
      }
      
      // Libérer les connexions après 2 secondes
      setTimeout(() => {
        connections.forEach(conn => conn.release());
        console.log('✅ Connexions pré-établies libérées');
      }, 2000);
      
    } catch (error) {
      console.warn('⚠️ Erreur lors du pré-établissement des connexions:', error.message);
    }
  }
};

// Démarrer le test de connexion immédiatement
testConnection();

// Pré-établir les connexions en production
preEstablishConnections();

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
