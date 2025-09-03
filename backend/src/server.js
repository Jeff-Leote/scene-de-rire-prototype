//server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const hpp = require("hpp");
const xss = require("xss-clean");
const routes = require("./routes");

// Import des middlewares de sécurité optimisés
const { 
  createRateLimiters, 
  sanitizeInput, 
  helmetConfig, 
  csrfProtection, 
  securityLogger 
} = require("./middleware/security");

const { validateSqlQuery } = require("./utils/sqlProtection");

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration des limites de taux optimisées pour la production
const rateLimiters = createRateLimiters();

const allowedOrigins = [
  "http://localhost:5173",
  "https://scene-de-rire-prototype.onrender.com",
  "https://scene-de-rire-prototype-1.onrender.com",
  "https://espacecomedie.fr",
  "https://www.espacecomedie.fr"
];

// ====== MIDDLEWARES DE SÉCURITÉ OPTIMISÉS ======

// 1. Helmet - En-têtes de sécurité (optimisé pour la performance)
app.use(helmetConfig);

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

// 3. Rate limiters optimisés pour la production
app.use(rateLimiters.publicRoutes); // ULTRA-PERMISSIF pour les routes publiques
app.use(rateLimiters.general);      // Général pour les autres routes

// 4. Protection contre les attaques HTTP Parameter Pollution
app.use(hpp());

// 5. Protection contre les attaques XSS
app.use(xss());

// 6. Configuration du body parser avec limite de taille optimisée
app.use(express.json({ limit: '5mb' })); // Réduit de 10mb à 5mb
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// 7. Sanitisation des entrées (optimisée)
app.use(sanitizeInput);

// 8. Validation des requêtes SQL (optimisée)
app.use(validateSqlQuery);

// 9. Protection CSRF (optimisée)
app.use(csrfProtection);

// 10. Logging de sécurité (optimisé)
app.use(securityLogger);

// 🔧 MIDDLEWARE DE PERFORMANCE ET MONITORING
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log minimal en production pour éviter le spam
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  }
  
  // Monitoring des temps de réponse
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) { // Log seulement les requêtes lentes (>1s)
      console.warn(`⚠️ Requête lente: ${req.method} ${req.url} - ${duration}ms`);
    }
  });
  
  next();
});

// 🔧 Endpoint de test pour vérifier le rate limiting
app.get('/api/rate-limit-test', (req, res) => {
  res.json({
    message: 'Rate limiting test réussi !',
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    rateLimitInfo: {
      remaining: req.headers['x-ratelimit-remaining'],
      reset: req.headers['x-ratelimit-reset'],
      limit: req.headers['x-ratelimit-limit']
    }
  });
});

// 🔧 Endpoint de santé pour vérifier la DB et les performances
app.get('/api/health', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Test de la base de données
    const db = require('./db');
    await db.query('SELECT 1 as health_check');
    
    const duration = Date.now() - startTime;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      responseTime: `${duration}ms`,
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message,
      responseTime: `${duration}ms`
    });
  }
});

// Routes API
app.use("/api", routes);

// Route de base
app.get("/", (req, res) => {
  res.json({ 
    message: "API is working!", 
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Gestion des erreurs optimisée
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err);
  
  // En production, ne pas exposer les détails d'erreur
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Erreur interne du serveur' 
    : err.message;
  
  res.status(err.status || 500).json({ 
    error: errorMessage,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 🚀 OPTIMISATIONS POUR RENDER - PERFORMANCE MAXIMALE
if (process.env.NODE_ENV === 'production') {
  // Keep-alive optimisé pour éviter la mise en veille
  setInterval(() => {
    console.log('🔄 Keep-alive ping -', new Date().toISOString());
    
    // Vérification de la base de données
    const db = require('./db');
    db.query('SELECT 1 as health_check')
      .then(() => console.log('✅ DB: OK'))
      .catch(err => console.warn('⚠️ DB: Erreur -', err.message));
      
  }, 8 * 60 * 1000); // Toutes les 8 minutes (moins agressif)
  
  // Optimisation de la mémoire
  setInterval(() => {
    if (global.gc) {
      global.gc();
      console.log('🧹 Garbage collection effectuée');
    }
  }, 60 * 60 * 1000); // Toutes les 60 minutes (moins agressif)
}

// Démarrer le serveur seulement si exécuté directement
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⏰ Heure de démarrage: ${new Date().toISOString()}`);
  });
}

module.exports = app;
