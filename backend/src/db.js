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
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('❌ Erreur ping DB:', err.message);
      return;
    }
    
    connection.ping((pingErr) => {
      connection.release();
      if (pingErr) {
        console.error('❌ Ping DB échoué:', pingErr.message);
      } else {
        console.log('🏓 Ping DB réussi - Connexion maintenue active');
      }
    });
  });
};

// Ping toutes les 30 secondes pour maintenir la connexion Railway active
setInterval(keepAlivePing, 30000);

// Ping initial après 5 secondes
setTimeout(keepAlivePing, 5000);

console.log('🔄 Ping automatique activé - Connexion DB maintenue active');

module.exports = pool.promise();
