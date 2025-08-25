//db.js
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "db",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "espace_comedie",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test de la connexion avec retry
const testConnection = (retries = 5, delay = 2000) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error(`Erreur de connexion à la base de données (tentative ${6 - retries}/5):`, err.message);
      if (retries > 1) {
        console.log(`Nouvelle tentative dans ${delay/1000} secondes...`);
        setTimeout(() => testConnection(retries - 1, delay), delay);
      } else {
        console.error('Impossible de se connecter à la base de données après 5 tentatives');
      }
      return;
    }
    console.log('✅ Connexion à la base de données réussie !');
    connection.release();
  });
};

// Démarrer le test de connexion après un délai initial
setTimeout(() => testConnection(), 3000);

module.exports = pool.promise();
