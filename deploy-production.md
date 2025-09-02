# 🚀 Guide de Déploiement Production - Optimisations de Performance

## 📋 **Problème Identifié**
- **Latence de 30 secondes** lors du premier accès après inactivité
- **Services Render** se mettent en veille après 15 minutes d'inactivité
- **Base de données Railway** peut également se mettre en veille

## 🔧 **Solutions Implémentées**

### **1. Pool de Connexions MySQL Optimisé**
```javascript
// backend/src/db.js - Configuration optimisée
const pool = mysql.createPool({
  // 🔧 OPTIMISATIONS POUR LA PRODUCTION
  waitForConnections: false,        // Ne pas attendre les connexions
  connectionLimit: 5,               // Optimal pour Render
  queueLimit: 10,                   // Limiter la file d'attente
  
  // ⚡ OPTIMISATIONS DE PERFORMANCE
  acquireTimeout: 60000,            // 60s max pour acquérir une connexion
  timeout: 60000,                   // 60s max pour les requêtes
  reconnect: true,                  // Reconnecter automatiquement
  enableKeepAlive: true,           // Maintenir les connexions actives
  keepAliveInitialDelay: 10000,    // Keep-alive toutes les 10s
});
```

### **2. Middlewares de Sécurité Optimisés**
```javascript
// backend/src/server.js - Middlewares activés et optimisés
app.use(helmetConfig);              // En-têtes de sécurité
app.use(rateLimiters.general);      // Rate limiting optimisé
app.use(sanitizeInput);             // Sanitisation intelligente
app.use(validateSqlQuery);          // Validation SQL
app.use(csrfProtection);            // Protection CSRF
app.use(securityLogger);            // Logging de sécurité
```

### **3. Script de Keep-Alive**
```bash
# Démarrer le script de keep-alive
node backend/keep-alive.js
```

## 🚀 **Déploiement en Production**

### **Étape 1 : Variables d'Environnement Render**

#### **Backend (Render)**
```env
# Base de données Railway
DB_HOST=your-railway-host.railway.app
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=espace_comedie

# Environnement
NODE_ENV=production
PORT=5000

# JWT
JWT_SECRET=your_very_long_secure_jwt_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=junior97301@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=contact@espacecomedie.fr

# URLs
FRONTEND_URL=https://espacecomedie.fr
BACKEND_URL=https://your-backend.onrender.com

# Stripe (Production)
STRIPE_SECRET_KEY=sk_live_your_production_key
```

#### **Frontend (Render)**
```env
VITE_API_URL=https://your-backend.onrender.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_production_key
```

### **Étape 2 : Configuration Railway**

#### **Variables d'Environnement Railway**
```env
MYSQL_ROOT_PASSWORD=your_secure_password
MYSQL_DATABASE=espace_comedie
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
```

#### **Configuration MySQL Optimisée**
```sql
-- Optimisations pour la production
SET GLOBAL innodb_buffer_pool_size = 268435456;  -- 256MB
SET GLOBAL max_connections = 100;
SET GLOBAL wait_timeout = 28800;                 -- 8 heures
SET GLOBAL interactive_timeout = 28800;          -- 8 heures
```

### **Étape 3 : Déploiement avec Keep-Alive**

#### **Option A : Keep-Alive Intégré**
```bash
# Le serveur inclut déjà un keep-alive automatique
# Pas d'action supplémentaire nécessaire
```

#### **Option B : Keep-Alive Externe (Recommandé)**
```bash
# Créer un service Render séparé pour le keep-alive
# Ou utiliser un service externe comme UptimeRobot
```

## 📊 **Monitoring et Optimisations**

### **1. Métriques à Surveiller**
- **Temps de réponse** : Objectif < 2 secondes
- **Connexions DB actives** : Maintenir entre 2-5
- **Mémoire utilisée** : < 80% de la limite Render
- **CPU** : < 70% en moyenne

### **2. Logs de Performance**
```bash
# Surveiller les requêtes lentes
grep "⚠️ Requête lente" backend/logs/app.log

# Surveiller les connexions DB
grep "🔌 Nouvelle connexion MySQL" backend/logs/app.log

# Surveiller le keep-alive
grep "🔄 Keep-alive" backend/logs/app.log
```

### **3. Optimisations Supplémentaires**

#### **Cache Redis (Optionnel)**
```javascript
// Ajouter Redis pour le cache des requêtes fréquentes
const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL
});
```

#### **CDN pour les Images**
```javascript
// Utiliser un CDN pour les images statiques
const imageUrl = process.env.NODE_ENV === 'production' 
  ? `https://your-cdn.com/images/${filename}`
  : `/images/${filename}`;
```

## 🔍 **Dépannage**

### **Problème : Latence Persistante**
```bash
# 1. Vérifier les logs Render
# 2. Vérifier la connectivité Railway
# 3. Tester le keep-alive manuellement
curl https://your-backend.onrender.com/health
```

### **Problème : Base de Données Lente**
```bash
# 1. Vérifier les connexions actives
# 2. Optimiser les requêtes SQL
# 3. Vérifier les index de la base
```

### **Problème : Service Render en Veille**
```bash
# 1. Vérifier que le keep-alive fonctionne
# 2. Augmenter la fréquence des pings
# 3. Utiliser un service externe (UptimeRobot, Pingdom)
```

## 📈 **Résultats Attendus**

### **Avant Optimisation**
- ⏱️ **Premier accès** : 30+ secondes
- 🐌 **Requêtes DB** : 5-10 secondes
- 💤 **Mise en veille** : Après 15 minutes

### **Après Optimisation**
- ⚡ **Premier accès** : 2-5 secondes
- 🚀 **Requêtes DB** : 100-500ms
- 🔄 **Keep-alive** : Service toujours actif

## 🎯 **Prochaines Étapes**

1. **Déployer** les optimisations
2. **Tester** les performances
3. **Monitorer** les métriques
4. **Ajuster** si nécessaire
5. **Implémenter** Redis (optionnel)

---

## 📞 **Support**

En cas de problème :
1. Vérifier les logs Render
2. Tester la connectivité DB
3. Vérifier le keep-alive
4. Consulter les métriques de performance
