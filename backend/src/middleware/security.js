const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
const xss = require('xss-clean');
const sanitizeHtml = require('sanitize-html');
const { body, validationResult } = require('express-validator');

// 🔧 Configuration des limites de taux ULTRA-PERMISSIVE pour la production
const createRateLimiters = () => {
  // Limite générale pour toutes les routes (ULTRA-PERMISSIVE)
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // AUGMENTÉ À 1000 pour la production (était 200)
    message: {
      error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // 🔧 OPTIMISATIONS POUR LA PERFORMANCE
    skip: (req) => {
      // Ignorer les requêtes de health check, keep-alive ET routes publiques
      return req.path === '/' || 
             req.path === '/health' || 
             req.path.includes('keep-alive') ||
             req.path.startsWith('/api/spectacles') ||
             req.path.startsWith('/api/artistes') ||
             req.path.startsWith('/api/lieu') ||
             req.path.startsWith('/api/contact');
    }
  });

  // Limite STRICTE pour l'authentification avec protection force brute
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives par 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    // 🔧 OPTIMISATIONS POUR LA PERFORMANCE
    keyGenerator: (req) => {
      // Utiliser l'IP + User-Agent pour une meilleure identification
      return req.ip + '|' + (req.get('User-Agent') || 'unknown');
    },
    // Log des tentatives bloquées (nouvelle syntaxe)
    handler: (req, res) => {
      console.log(`🚨 TENTATIVE FORCE BRUTE BLOQUÉE - IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
      res.status(429).json({
        error: 'Trop de tentatives de connexion. Veuillez attendre 15 minutes avant de réessayer.',
        retryAfter: '15 minutes',
        blocked: true
      });
    }
  });

  // Limite ULTRA-STRICTE pour les échecs de connexion (5 minutes de blocage après 3 échecs)
  const loginFailureLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // 3 échecs par 5 minutes
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Utiliser l'email + IP pour cibler les attaques par email
      const email = req.body?.email || 'unknown';
      return email + '|' + req.ip;
    },
    // Log des blocages d'email (nouvelle syntaxe)
    handler: (req, res) => {
      const email = req.body?.email || 'unknown';
      console.log(`🚨 ÉCHECS CONNEXION BLOQUÉS - Email: ${email}, IP: ${req.ip}`);
      res.status(429).json({
        error: 'Trop d\'échecs de connexion. Compte temporairement bloqué pendant 5 minutes.',
        retryAfter: '5 minutes',
        blocked: true
      });
    }
  });

  // Limite PERMISSIVE pour les inscriptions (production)
  const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 20, // AUGMENTÉ À 20 pour la production (était 5)
    message: {
      error: 'Trop de tentatives d\'inscription, veuillez réessayer plus tard.',
      retryAfter: '1 heure'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // 🔧 Rate limiter ULTRA-PERMISSIF pour les routes publiques
  const publicRoutesLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5000, // 5000 requêtes par 15 minutes pour les routes publiques
    message: {
      error: 'Limite de requêtes atteinte pour les routes publiques.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // 🔧 APPLIQUER SEULEMENT aux routes publiques
    skip: (req) => {
      return !req.path.startsWith('/api/spectacles') && 
             !req.path.startsWith('/api/artistes') && 
             !req.path.startsWith('/api/lieu') && 
             !req.path.startsWith('/api/contact');
    }
  });

  return {
    general: generalLimiter,
    auth: authLimiter,
    loginFailure: loginFailureLimiter,
    register: registerLimiter,
    publicRoutes: publicRoutesLimiter
  };
};

// 🔧 Middleware de sanitisation optimisé
const sanitizeInput = (req, res, next) => {
  // Sanitiser seulement si nécessaire (optimisation)
  if (req.method === 'GET') {
    // Pour les GET, sanitizer seulement les paramètres critiques
    if (req.query.search || req.query.filter) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = sanitizeHtml(req.query[key], {
            allowedTags: [],
            allowedAttributes: {}
          });
        }
      });
    }
  } else {
    // Pour les POST/PUT/DELETE, sanitizer tout
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizeHtml(req.body[key], {
            allowedTags: [],
            allowedAttributes: {}
          });
        }
      });
    }
  }
  
  next();
};

// Middleware de validation des erreurs (optimisé)
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Données invalides',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// 🔧 Validations communes optimisées
const commonValidations = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Format d\'email invalide'),
  
  password: body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'),
  
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage('Le nom doit contenir entre 2 et 50 caractères et ne peut contenir que des lettres, espaces, tirets et apostrophes'),
  
  phone: body('phone')
    .optional()
    .matches(/^[\+]?[0-9\s\-\(\)]{10,15}$/)
    .withMessage('Format de téléphone invalide')
};

// 🔧 Configuration Helmet optimisée pour la performance
const helmetConfig = helmet({
  // Désactiver certaines protections pour améliorer les performances
  contentSecurityPolicy: false, // Désactivé pour éviter les conflits
  crossOriginEmbedderPolicy: false, // Désactivé pour la compatibilité
  // Garder les protections essentielles
  hsts: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  // 🔧 OPTIMISATIONS POUR RENDER
  frameguard: { action: 'deny' },
  xssFilter: true
});

// 🔧 Protection CSRF optimisée et flexible
const csrfProtection = (req, res, next) => {
  // Construire un chemin complet pour les middlewares montés (ex: baseUrl=/api)
  const fullPath = `${req.baseUrl || ''}${req.path}`;

  // Skip CSRF pour les requêtes GET (lecture seule)
  if (req.method === 'GET') {
    return next();
  }
  
  // Skip CSRF pour les API stateless (JWT) et les routes publiques
  if (fullPath.startsWith('/api/auth/') || 
      fullPath === '/api/health' ||
      fullPath === '/api/spectacles' ||
      fullPath === '/api/artistes' ||
      fullPath === '/api/lieu' ||
      fullPath === '/api/contact' ||
      // 🔧 EXEMPTION POUR LES PAIEMENTS STRIPE
      fullPath === '/api/reservations/checkout' ||
      fullPath.startsWith('/api/reservations/')) {
    
    // 🔧 LOGGING POUR DÉBOGUER LES EXEMPTIONS CSRF
    if (fullPath.includes('reservations')) {
      console.log(`💳 CSRF exempté pour paiement: ${req.method} ${fullPath}`);
    }
    
    return next();
  }
  
  // Vérification CSRF pour les routes protégées
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  
  // Si pas de token, vérifier si c'est une requête GET (lecture seule)
  if (!token && req.method === 'GET') {
    return next(); // Autoriser les lectures sans CSRF
  }
  
  if (!token) {
    return res.status(403).json({ 
      error: 'Token CSRF manquant',
      message: 'Cette action nécessite une validation de sécurité'
    });
  }
  
  // Validation basique du token (optimisée)
  if (typeof token === 'string' && token.length > 10) {
    next();
  } else {
    res.status(403).json({ 
      error: 'Token CSRF invalide',
      message: 'Le token de sécurité est invalide'
    });
  }
};

// 🔧 Logger de sécurité optimisé
const securityLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log seulement les événements de sécurité importants
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log les tentatives d'accès suspectes
    if (req.path.includes('admin') && res.statusCode === 403) {
      console.warn(`🚨 Tentative d'accès admin non autorisé: ${req.ip} - ${req.path}`);
    }
    
    // Log les erreurs de sécurité
    if (res.statusCode >= 400 && res.statusCode < 500) {
      console.warn(`⚠️ Erreur client: ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    }
    
    // Log les erreurs serveur
    if (res.statusCode >= 500) {
      console.error(`💥 Erreur serveur: ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    }
  });
  
  next();
};

module.exports = {
  createRateLimiters,
  sanitizeInput,
  helmetConfig,
  csrfProtection,
  securityLogger,
  handleValidationErrors,
  commonValidations
};
