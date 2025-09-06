//db.js
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "db",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "espace_comedie",
  
  // Optimisations de base
  waitForConnections: true,
  connectionLimit: process.env.NODE_ENV === 'production' ? 10 : 5,
  queueLimit: process.env.NODE_ENV === 'production' ? 20 : 10,
  acquireTimeout: process.env.NODE_ENV === 'production' ? 60000 : 30000,
  
  // Keep-alive pour éviter les déconnexions
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  
  // Optimisations MySQL2
  multipleStatements: false,
  dateStrings: true,
  supportBigNumbers: true,
  bigNumberStrings: true,
});

// Test de la connexion
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

// Démarrer le test de connexion
testConnection();

// Ping continu pour maintenir la connexion active (Railway)
const keepAlivePing = () => {
  const timestamp = new Date().toISOString();
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('❌ RAILWAY DB CONNECTION ERROR:', err.message, '-', timestamp);
      return;
    }
    
    connection.ping((pingErr) => {
      connection.release();
      if (pingErr) {
        console.error('❌ RAILWAY DB PING FAILED:', pingErr.message, '-', timestamp);
      } else {
        console.log('✅ RAILWAY DB PING SUCCESS - Connexion maintenue active -', timestamp);
      }
    });
  });
};

// Ping toutes les 20 secondes pour maintenir la connexion Railway active
setInterval(keepAlivePing, 20000);

// Ping initial après 3 secondes
setTimeout(keepAlivePing, 3000);

console.log('🔄 RAILWAY DB PING AUTOMATIQUE ACTIVÉ - Ping toutes les 20 secondes');

module.exports = pool.promise();
