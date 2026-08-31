// Middleware pour valider les requêtes SQL
const validateSqlQuery = (req, res, next) => {
  try {
    // Valider les paramètres de requête
    if (req.query) {
      Object.keys(req.query).forEach((key) => {
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
        'javascript:',
      ];

      for (const pattern of dangerousPatterns) {
        if (bodyStr.includes(pattern)) {
          throw new Error('Contenu du body suspect détecté');
        }
      }
    }

    next();
  } catch (error) {
    console.warn("🚨 Tentative d'injection SQL détectée:", {
      ip: req.ip,
      url: req.url,
      method: req.method,
      error: error.message,
    });

    return res.status(400).json({
      error: 'Requête invalide',
      message: 'La requête contient des éléments non autorisés',
    });
  }
};

module.exports = {
  validateSqlQuery,
};
