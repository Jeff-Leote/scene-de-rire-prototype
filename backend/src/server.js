//server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const hpp = require("hpp");
const xss = require("xss-clean");
const routes = require("./routes");

// Import des middlewares de sécurité
// const { 
//   createRateLimiters, 
//   sanitizeInput, 
//   helmetConfig, 
//   csrfProtection, 
//   securityLogger 
// } = require("./middleware/security");

// const { validateSqlQuery } = require("./utils/sqlProtection");

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration des limites de taux
// const rateLimiters = createRateLimiters();

const allowedOrigins = [
  "http://localhost:5173",
  "https://scene-de-rire-prototype.onrender.com",
  "https://scene-de-rire-prototype-1.onrender.com",
  "https://espacecomedie.fr",
  "https://www.espacecomedie.fr"
];

// ====== MIDDLEWARES DE SÉCURITÉ ======

// 1. Helmet - En-têtes de sécurité
// app.use(helmetConfig);

// 2. CORS - Contrôle d'accès cross-origin
app.use(cors({
  origin: function(origin, callback){
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `L'origine ${origin} n'est pas autorisée par la politique CORS.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token']
}));

// 3. Limite de taux générale
// app.use(rateLimiters.general);

// 4. Protection contre les attaques HTTP Parameter Pollution
app.use(hpp());

// 5. Protection contre les attaques XSS
app.use(xss());

// 6. Configuration du body parser avec limite de taille
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 7. Sanitisation des entrées
// app.use(sanitizeInput);

// 8. Validation des requêtes SQL
// app.use(validateSqlQuery);

// 9. Protection CSRF
// app.use(csrfProtection);

// 10. Logging de sécurité
// app.use(securityLogger);

// Middleware de logging minimal en production
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  }
  next();
});

// Routes API
app.use("/api", routes);

// Route de base
app.get("/", (req, res) => {
  res.json({ message: "API is working!" });
});

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  if (!err) {
    console.error('[ERROR HANDLER] Middleware called without error object.');
    return res.status(500).json({
      error: 'Internal Server Error',
      details: 'Erreur inconnue (aucun objet d\'erreur fourni).'
    });
  }

  console.error('[ERROR HANDLER]', err);

  const errorDetails = {
    message: err.message || 'Une erreur inconnue est survenue',
    name: err.name || 'Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack || 'Stack inconnue' })
  };

  res.status(500).json({
    error: 'Internal Server Error',
    details: errorDetails.message
  });
});


// Export de l'app pour les tests
module.exports = app;

// Démarrage du serveur seulement si le fichier est exécuté directement
if (require.main === module) {
  const startServer = () => {
    app.listen(PORT, () => {
      console.log(`Serveur backend démarré sur http://localhost:${PORT}`);
    });
  };

  // Démarrer le serveur après un délai pour laisser la base de données se connecter
  setTimeout(startServer, 5000);
}
