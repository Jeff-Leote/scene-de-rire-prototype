//server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const hpp = require("hpp");
const xss = require("xss-clean");

// Import conditionnel des routes (seulement si DB disponible)
let routes;
try {
  routes = require("./routes");
} catch (error) {
  console.log("⚠️ Routes non chargées - Base de données non disponible");
  routes = null;
}

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
  "https://www.espacecomedie.fr",
  // 🔧 DOMAINES ADDITIONNELS POUR LA PRODUCTION
  "https://espacecomedie.com",
  "https://www.espacecomedie.com"
];

// ====== MIDDLEWARES DE SÉCURITÉ OPTIMISÉS ======

// 1. Helmet - En-têtes de sécurité (optimisé pour la performance)
app.use(helmetConfig);

// 2. CORS - Contrôle d'accès cross-origin (PRODUCTION)
app.use(cors({
  origin: function(origin, callback){
    // 🔧 LOGGING POUR DÉBOGUER LES PROBLÈMES CORS
    console.log(`🌍 CORS - Origine demandée: ${origin}`);
    
    if (!origin) {
      console.log('✅ CORS - Pas d\'origine (requête locale)');
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`✅ CORS - Origine autorisée: ${origin}`);
      return callback(null, true);
    }
    
    // 🔧 VÉRIFICATION DES SOUS-DOMAINES
    const isSubdomain = allowedOrigins.some(allowed => {
      if (allowed.includes('espacecomedie')) {
        return origin.includes('espacecomedie');
      }
      return false;
    });
    
    if (isSubdomain) {
      console.log(`✅ CORS - Sous-domaine autorisé: ${origin}`);
      return callback(null, true);
    }
    
    console.warn(`❌ CORS - Origine non autorisée: ${origin}`);
    console.log(`📋 Origines autorisées:`, allowedOrigins);
    
      const msg = `L'origine ${origin} n'est pas autorisée par la politique CORS.`;
      return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'X-CSRF-Token',
    'Origin',
    'Accept'
  ],
  // 🔧 OPTIONS POUR LA PRODUCTION
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// 3. Rate limiters optimisés pour la production
app.use(rateLimiters.publicRoutes); // ULTRA-PERMISSIF pour les routes publiques
app.use(rateLimiters.general);      // Général pour les autres routes

// 🔧 MIDDLEWARE CORS DE FALLBACK POUR LA PRODUCTION
app.use((req, res, next) => {
  // Ajouter les headers CORS manquants si nécessaire
  const origin = req.headers.origin;
  
  if (origin && (origin.includes('espacecomedie') || origin.includes('localhost'))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Origin, Accept');
  }
  
  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  
  next();
});

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

// 9. Logging de sécurité (optimisé)
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
// Utilisation conditionnelle des routes
if (routes) {
  // Protection CSRF pour les routes API seulement
  app.use("/api", csrfProtection);
app.use("/api", routes);
} else {
  // Routes de fallback sans base de données
  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "not_connected",
      message: "Serveur fonctionnel sans base de données"
    });
  });
  
  app.get("/api/spectacles", (req, res) => {
    res.json({
      spectacles: [],
      pagination: { total: 0 }
    });
  });
  
  app.get("/api/artistes", (req, res) => {
    res.json([]);
  });
  
  app.get("/api/artistes/featured", (req, res) => {
    res.json({
      id: 1,
      name: "Aucun artiste",
      photo: "",
      biographie: "Aucun artiste configuré"
    });
  });
  
  app.get("/api/lieu/images", (req, res) => {
    res.json([]);
  });
  
  app.get("/api/lieu/images/main", (req, res) => {
    res.json({
      id: 1,
      image_path: "",
      description: "Aucune image configurée"
    });
  });
  
  app.get("/api/spectacles/upcoming", (req, res) => {
    res.json([]);
  });
  
  app.get("/api/spectacles/all", (req, res) => {
    res.json([]);
  });
  
  app.get("/api/reservations/availability/:id", (req, res) => {
    res.json({
      spectacle_id: req.params.id,
      available: false,
      remaining_seats: 0,
      total_seats: 0
    });
  });
  
  app.post("/api/reservations/checkout", (req, res) => {
    res.status(503).json({
      error: "Service temporairement indisponible",
      message: "Base de données non connectée"
    });
  });
}

// 🎯 SERVIR LES FICHIERS STATIQUES DU FRONTEND (SPA)
const path = require('path');

// Éviter les 404 bruitées sur des ressources communes
app.get('/favicon.ico', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=86400');
  return res.status(204).end();
});
app.get('/robots.txt', async (req, res) => {
  try {
    const protocol = (req.headers['x-forwarded-proto'] || req.protocol || 'https').toString();
    const host = (req.headers['x-forwarded-host'] || req.headers.host || 'www.espacecomedie.fr').toString();
    const baseUrl = `${protocol}://${host}`;

    const lines = [
      'User-agent: *',
      'Allow: /',
      // Éviter l'indexation d'URLs d'administration et d'API
      'Disallow: /api/',
      'Disallow: /dashboard',
      'Disallow: /connexion?redirect=*',
      '',
      `Sitemap: ${baseUrl}/sitemap.xml`
    ];

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).send(lines.join('\n'));
  } catch (e) {
    return res.status(200).type('text/plain').send('User-agent: *\nAllow: /');
  }
});

app.get('/sitemap.xml', async (req, res) => {
  try {
    const protocol = (req.headers['x-forwarded-proto'] || req.protocol || 'https').toString();
    const host = (req.headers['x-forwarded-host'] || req.headers.host || 'www.espacecomedie.fr').toString();
    const baseUrl = `${protocol}://${host}`;

    // Routes statiques publiques
    const staticRoutes = [
      '/',
      '/spectacles',
      '/le-lieu',
      '/artistes',
      '/contact',
      '/connexion',
      '/inscription'
    ];

    // Récupération des spectacles pour générer les URLs dynamiques /spectacles/:id
    let dynamicRoutes = [];
    try {
      const db = require('./db');
      const [rows] = await db.query(`
        SELECT id, date_spectacle
        FROM spectacle
        ORDER BY date_spectacle DESC
        LIMIT 500
      `);
      dynamicRoutes = rows.map(r => ({
        loc: `/spectacles/${r.id}`,
        lastmod: r.date_spectacle ? new Date(r.date_spectacle).toISOString().split('T')[0] : undefined
      }));
    } catch (err) {
      console.warn('⚠️ Sitemap: impossible de charger les spectacles depuis la DB:', err.message);
    }

    const urls = [
      // Statiques
      ...staticRoutes.map(path => ({ loc: path })),
      // Dynamiques
      ...dynamicRoutes
    ];

    const urlset = urls.map(u => {
      const loc = `${baseUrl}${u.loc}`;
      const lastmodTag = u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : '';
      // Priorités simples: page d'accueil > sections > détails
      const priority = u.loc === '/' ? '1.0' : (u.loc.startsWith('/spectacles/') ? '0.6' : '0.8');
      const changefreq = u.loc === '/' ? 'daily' : (u.loc.startsWith('/spectacles/') ? 'weekly' : 'weekly');
      return `<url><loc>${loc}</loc>${lastmodTag}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
    }).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlset}</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(xml);
  } catch (e) {
    console.error('❌ Erreur génération sitemap:', e);
    return res.status(500).type('text/plain').send('Sitemap generation error');
  }
});
// Vite uniquement en dev; en prod l'asset est fingerprinté
app.get('/vite.svg', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=86400');
  return res.status(204).end();
});

// Servir les fichiers statiques du frontend buildé
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Route de base - rediriger vers le frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

// 🎯 ROUTING SPA - Toutes les routes non-API redirigent vers index.html
app.get('*', (req, res) => {
  // Si c'est une route API, laisser passer
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  
  // Pour toutes les autres routes, servir le fichier index.html (SPA routing)
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
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

// 🚀 OPTIMISATIONS POUR RAILWAY - PERFORMANCE MAXIMALE
if (process.env.NODE_ENV === 'production') {
  console.log('🚀 MODE PRODUCTION DÉTECTÉ - Keep-alive activé');
  
  // Keep-alive ULTRA-AGRESSIF pour éviter la mise en veille Railway
  setInterval(() => {
    const timestamp = new Date().toISOString();
    console.log('🔄 RAILWAY KEEP-ALIVE PING -', timestamp);
    console.log('📊 Mémoire utilisée:', Math.round(process.memoryUsage().heapUsed / 1024 / 1024), 'MB');
    
    // Vérification de la base de données
    const db = require('./db');
    db.query('SELECT 1 as health_check')
      .then(() => {
        console.log('✅ RAILWAY DB PING RÉUSSI -', timestamp);
      })
      .catch(err => {
        console.error('❌ RAILWAY DB PING ÉCHOUÉ -', err.message, '-', timestamp);
      });
      
  }, 30 * 1000); // Toutes les 30 secondes (ULTRA-AGRESSIF pour Railway)
  
  // Ping externe pour maintenir l'instance active
  setInterval(() => {
    const https = require('https');
    const url = process.env.RAILWAY_PUBLIC_DOMAIN || 'https://scene-de-rire-prototype.onrender.com';
    const timestamp = new Date().toISOString();
    
    console.log('🌐 RAILWAY PING EXTERNE DÉMARRÉ -', timestamp);
    
    https.get(`${url}/api/health`, (res) => {
      console.log('✅ RAILWAY PING EXTERNE RÉUSSI -', res.statusCode, '-', timestamp);
    }).on('error', (err) => {
      console.error('❌ RAILWAY PING EXTERNE ÉCHOUÉ -', err.message, '-', timestamp);
    });
  }, 45 * 1000); // Toutes les 45 secondes
  
  // Optimisation de la mémoire
  setInterval(() => {
    if (global.gc) {
      global.gc();
      console.log('🧹 RAILWAY GARBAGE COLLECTION -', new Date().toISOString());
    }
  }, 60 * 60 * 1000); // Toutes les 60 minutes
  
  console.log('✅ RAILWAY KEEP-ALIVE SYSTÈME ACTIVÉ - Ping toutes les 30s');
} else {
  console.log('🔧 MODE DÉVELOPPEMENT - Keep-alive désactivé');
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
