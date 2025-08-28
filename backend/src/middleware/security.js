const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
const xss = require('xss-clean');
const sanitizeHtml = require('sanitize-html');
const { body, validationResult } = require('express-validator');

// Configuration des limites de taux pour prévenir les attaques par force brute
const createRateLimiters = () => {
  // Limite générale pour toutes les routes
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limite chaque IP à 100 requêtes par fenêtre
    message: {
      error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Limite stricte pour l'authentification
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limite chaque IP à 5 tentatives de connexion par fenêtre
    message: {
      error: 'Trop de tentatives de connexion, veuillez réessayer plus tard.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Ne pas compter les connexions réussies
  });

  // Limite pour les inscriptions
  const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 3, // limite chaque IP à 3 inscriptions par heure
    message: {
      error: 'Trop de tentatives d\'inscription, veuillez réessayer plus tard.',
      retryAfter: '1 heure'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  return {
    general: generalLimiter,
    auth: authLimiter,
    register: registerLimiter
  };
};

// Middleware de validation et sanitisation des données
const sanitizeInput = (req, res, next) => {
  // Sanitiser les paramètres de requête
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeHtml(req.query[key], {
          allowedTags: [],
          allowedAttributes: {}
        });
      }
    });
  }

  // Sanitiser le body
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

  next();
};

// Middleware de validation des erreurs
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

// Validations communes
const commonValidations = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  
  password: body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'),
  
  name: body('firstName', 'lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage('Le nom doit contenir entre 2 et 50 caractères et ne peut contenir que des lettres'),
  
  title: body('title')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Le titre doit contenir entre 3 et 255 caractères'),
  
  description: body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('La description doit contenir entre 10 et 1000 caractères'),
  
  price: body('prix')
    .isFloat({ min: 0 })
    .withMessage('Le prix doit être un nombre positif'),
  
  date: body('date_spectacle')
    .isISO8601()
    .withMessage('Date invalide'),
  
  time: body('heure_spectacle')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Heure invalide (format HH:MM)')
};

// Middleware de protection CSRF (simplifié pour API)
const csrfProtection = (req, res, next) => {
  // Vérifier l'origine de la requête pour les requêtes sensibles
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    const origin = req.get('Origin');
    const referer = req.get('Referer');
    
    // Liste des origines autorisées
    const allowedOrigins = [
      'http://localhost:5173',
      'https://scene-de-rire-prototype.onrender.com',
      'https://espacecomedie.fr',
      'https://www.espacecomedie.fr'
    ];
    
    if (origin && !allowedOrigins.includes(origin)) {
      return res.status(403).json({
        error: 'Origine non autorisée',
        message: 'Requête rejetée pour des raisons de sécurité'
      });
    }
  }
  
  next();
};

// Middleware de logging de sécurité
const securityLogger = (req, res, next) => {
  const securityEvents = [];
  
  // Détecter les tentatives suspectes
  if (req.body && Object.keys(req.body).some(key => 
    typeof req.body[key] === 'string' && 
    (req.body[key].includes('<script>') || req.body[key].includes('javascript:'))
  )) {
    securityEvents.push('XSS_ATTEMPT');
  }
  
  if (req.query && Object.keys(req.query).some(key => 
    typeof req.query[key] === 'string' && 
    req.query[key].toLowerCase().includes('union select')
  )) {
    securityEvents.push('SQL_INJECTION_ATTEMPT');
  }
  
  if (securityEvents.length > 0) {
    console.warn(`🚨 Événement de sécurité détecté: ${securityEvents.join(', ')}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

// Configuration Helmet pour les en-têtes de sécurité
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

module.exports = {
  createRateLimiters,
  sanitizeInput,
  handleValidationErrors,
  commonValidations,
  csrfProtection,
  securityLogger,
  helmetConfig
};
