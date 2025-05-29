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

// Test de la connexion
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
    return;
  }
  console.log('Connexion à la base de données réussie !');
  connection.release();
});

module.exports = pool.promise();
