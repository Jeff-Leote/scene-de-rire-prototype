# Sécurité - Espace Comédie Backend

## 🔒 Mesures de Sécurité Implémentées

### 1. Protection contre les Attaques XSS (Cross-Site Scripting)

**Mesures implémentées :**
- **Sanitisation des entrées** : Utilisation de `sanitize-html` pour nettoyer les données utilisateur
- **En-têtes de sécurité** : Configuration Helmet avec `x-xss-protection`
- **Validation des données** : Express-validator pour valider les formats d'entrée
- **Échappement automatique** : Middleware `xss-clean` pour nettoyer les requêtes

**Exemple de protection :**
```javascript
// Les scripts malveillants sont automatiquement supprimés
const userInput = '<script>alert("xss")</script>Hello';
// Résultat : "Hello"
```

### 2. Protection contre les Injections SQL

**Mesures implémentées :**
- **Requêtes préparées** : Utilisation de `mysql2` avec paramètres échappés
- **Validation des identifiants** : Vérification des noms de tables/colonnes
- **Détection de patterns malveillants** : Filtrage des tentatives d'injection
- **Échappement des valeurs** : Utilisation de `sqlstring` pour échapper les données

**Exemple de protection :**
```javascript
// Tentative d'injection bloquée
const maliciousInput = "'; DROP TABLE users; --";
// Résultat : Requête rejetée avec erreur 400
```

### 3. Protection contre les Attaques par Force Brute

**Mesures implémentées :**
- **Limitation de taux** : `express-rate-limit` configuré différemment selon les routes
- **Limites spécifiques** :
  - Authentification : 5 tentatives par 15 minutes
  - Inscription : 3 tentatives par heure
  - Général : 100 requêtes par 15 minutes
- **Blocage progressif** : Augmentation des délais après échecs

**Configuration :**
```javascript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
  skipSuccessfulRequests: true
});
```

### 4. Protection CSRF (Cross-Site Request Forgery)

**Mesures implémentées :**
- **Validation d'origine** : Vérification des en-têtes `Origin` et `Referer`
- **Liste blanche** : Seules les origines autorisées sont acceptées
- **Protection des routes sensibles** : POST, PUT, DELETE uniquement

**Origines autorisées :**
- `http://localhost:5173` (développement)
- `https://espacecomedie.fr` (production)
- `https://scene-de-rire-prototype.onrender.com` (staging)

### 5. En-têtes de Sécurité (Helmet)

**En-têtes configurés :**
- `X-Content-Type-Options: nosniff` - Empêche le MIME sniffing
- `X-Frame-Options: SAMEORIGIN` - Protection contre le clickjacking
- `X-XSS-Protection: 1; mode=block` - Protection XSS du navigateur
- `Content-Security-Policy` - Politique de sécurité du contenu
- `Strict-Transport-Security` - Force HTTPS en production

### 6. Validation et Sanitisation des Données

**Validations implémentées :**
- **Email** : Format valide et normalisation
- **Mot de passe** : Complexité requise (8+ caractères, majuscule, minuscule, chiffre, caractère spécial)
- **Noms** : Format alphabétique uniquement
- **Prix** : Nombres positifs uniquement
- **Dates** : Format ISO 8601
- **Heures** : Format HH:MM

### 7. Logging de Sécurité

**Événements surveillés :**
- Tentatives d'injection SQL
- Tentatives XSS
- Dépassements de limites de taux
- Requêtes suspectes
- Erreurs d'authentification

**Format des logs :**
```javascript
console.warn('🚨 Événement de sécurité détecté:', {
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  url: req.url,
  method: req.method,
  timestamp: new Date().toISOString()
});
```

## 🧪 Tests de Sécurité

### Tests Unitaires
- **Authentification** : Validation des tokens, gestion des erreurs
- **Validation** : Formats d'entrée, sanitisation
- **Rate Limiting** : Respect des limites, blocage des abus

### Tests d'Intégration
- **Protection XSS** : Tentatives d'injection de scripts
- **Protection SQL** : Tentatives d'injection SQL
- **CORS** : Validation des origines
- **En-têtes** : Présence des en-têtes de sécurité

### Tests de Charge
- **Rate Limiting** : Vérification du respect des limites
- **Performance** : Temps de réponse sous charge

## 🚀 Déploiement Sécurisé

### Variables d'Environnement Requises
```bash
# Base de données
DB_HOST=localhost
DB_USER=user
DB_PASSWORD=strong_password
DB_NAME=espace_comedie

# JWT
JWT_SECRET=very_long_random_secret_key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Stripe
STRIPE_SECRET_KEY=sk_test_...

# Environnement
NODE_ENV=production
```

### Recommandations de Production
1. **HTTPS obligatoire** : Redirection automatique vers HTTPS
2. **Secrets sécurisés** : Utilisation de gestionnaires de secrets
3. **Monitoring** : Surveillance des logs de sécurité
4. **Backup** : Sauvegarde régulière de la base de données
5. **Mises à jour** : Maintenance régulière des dépendances

## 📊 Monitoring et Alertes

### Métriques à Surveiller
- Nombre de tentatives d'authentification échouées
- Requêtes bloquées par les middlewares de sécurité
- Temps de réponse des endpoints
- Utilisation de la base de données

### Alertes Recommandées
- Plus de 10 tentatives d'authentification échouées par heure
- Plus de 100 requêtes bloquées par jour
- Temps de réponse moyen > 2 secondes
- Erreurs de base de données > 5%

## 🔧 Maintenance

### Vérifications Régulières
1. **Audit des dépendances** : `npm audit`
2. **Mise à jour des packages** : `npm update`
3. **Révision des logs** : Analyse des événements de sécurité
4. **Test des sauvegardes** : Vérification de la restauration

### Procédures d'Urgence
1. **Attaque détectée** : Blocage immédiat de l'IP
2. **Fuite de données** : Rotation des secrets, audit complet
3. **Panne de service** : Activation du mode maintenance

## 📚 Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practices-security.html)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
