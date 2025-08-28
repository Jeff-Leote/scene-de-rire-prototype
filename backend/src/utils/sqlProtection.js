const sqlstring = require('sqlstring');

// Fonction pour échapper les valeurs SQL de manière sécurisée
const escapeSql = (value) => {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  
  if (typeof value === 'number') {
    return value.toString();
  }
  
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  
  if (typeof value === 'string') {
    return sqlstring.escape(value);
  }
  
  if (Array.isArray(value)) {
    return value.map(escapeSql).join(', ');
  }
  
  if (typeof value === 'object') {
    return sqlstring.escape(JSON.stringify(value));
  }
  
  return sqlstring.escape(value.toString());
};

// Fonction pour valider les noms de colonnes et tables
const validateIdentifier = (identifier) => {
  if (!identifier || typeof identifier !== 'string') {
    throw new Error('Identifiant invalide');
  }
  
  // Autoriser seulement les caractères alphanumériques, underscore et point
  const validPattern = /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*$/;
  
  if (!validPattern.test(identifier)) {
    throw new Error(`Identifiant invalide: ${identifier}`);
  }
  
  // Liste des mots-clés SQL à éviter
  const sqlKeywords = [
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE',
    'ALTER', 'TABLE', 'DATABASE', 'INDEX', 'PRIMARY', 'FOREIGN', 'KEY',
    'UNION', 'EXEC', 'EXECUTE', 'SCRIPT', 'DECLARE', 'VARIABLE'
  ];
  
  const upperIdentifier = identifier.toUpperCase();
  if (sqlKeywords.includes(upperIdentifier)) {
    throw new Error(`Identifiant réservé: ${identifier}`);
  }
  
  return identifier;
};

// Fonction pour construire des requêtes SQL de manière sécurisée
const buildSecureQuery = (query, params = {}) => {
  let secureQuery = query;
  
  // Remplacer les paramètres nommés par des valeurs échappées
  Object.keys(params).forEach(key => {
    const placeholder = `:${key}`;
    const value = params[key];
    
    if (secureQuery.includes(placeholder)) {
      secureQuery = secureQuery.replace(new RegExp(placeholder, 'g'), escapeSql(value));
    }
  });
  
  return secureQuery;
};

// Fonction pour valider les conditions WHERE
const validateWhereClause = (whereClause) => {
  if (!whereClause || typeof whereClause !== 'string') {
    throw new Error('Clause WHERE invalide');
  }
  
  // Détecter les tentatives d'injection SQL communes
  const dangerousPatterns = [
    /union\s+select/i,
    /drop\s+table/i,
    /delete\s+from/i,
    /insert\s+into/i,
    /update\s+set/i,
    /exec\s*\(/i,
    /execute\s*\(/i,
    /script\s*>/i,
    /javascript:/i,
    /onload\s*=/i,
    /onerror\s*=/i
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(whereClause)) {
      throw new Error('Clause WHERE contient des éléments dangereux');
    }
  }
  
  return whereClause;
};

// Fonction pour valider les paramètres de pagination
const validatePagination = (page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  
  if (pageNum < 1) {
    throw new Error('Numéro de page invalide');
  }
  
  if (limitNum < 1 || limitNum > 100) {
    throw new Error('Limite invalide (1-100)');
  }
  
  return {
    page: pageNum,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum
  };
};

// Fonction pour valider les paramètres de tri
const validateOrderBy = (orderBy, allowedColumns) => {
  if (!orderBy) {
    return null;
  }
  
  const [column, direction] = orderBy.split(' ');
  const validDirection = ['ASC', 'DESC'].includes(direction?.toUpperCase()) ? direction.toUpperCase() : 'ASC';
  
  if (!allowedColumns.includes(column)) {
    throw new Error(`Colonne de tri non autorisée: ${column}`);
  }
  
  return `${validateIdentifier(column)} ${validDirection}`;
};

// Middleware pour valider les requêtes SQL
const validateSqlQuery = (req, res, next) => {
  try {
    // Valider les paramètres de requête
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (key.toLowerCase().includes('sql') || key.toLowerCase().includes('query')) {
          throw new Error('Paramètre de requête suspect détecté');
        }
      });
    }
    
    // Valider le body pour les requêtes POST/PUT
    if (req.body && (req.method === 'POST' || req.method === 'PUT')) {
      const bodyStr = JSON.stringify(req.body).toLowerCase();
      const dangerousPatterns = [
        'union select',
        'drop table',
        'delete from',
        'insert into',
        'update set',
        'exec(',
        'execute(',
        'script>',
        'javascript:'
      ];
      
      for (const pattern of dangerousPatterns) {
        if (bodyStr.includes(pattern)) {
          throw new Error('Contenu du body suspect détecté');
        }
      }
    }
    
    next();
  } catch (error) {
    console.warn('🚨 Tentative d\'injection SQL détectée:', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      error: error.message
    });
    
    return res.status(400).json({
      error: 'Requête invalide',
      message: 'La requête contient des éléments non autorisés'
    });
  }
};

module.exports = {
  escapeSql,
  validateIdentifier,
  buildSecureQuery,
  validateWhereClause,
  validatePagination,
  validateOrderBy,
  validateSqlQuery
};
