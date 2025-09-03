# 🚀 Guide d'Optimisation des Performances - Production

## 📋 **Problème Identifié**
- **Latence de 30 secondes** lors du premier accès après inactivité
- **Services Render** se mettent en veille après 15 minutes d'inactivité
- **Base de données Railway** peut également se mettre en veille

## 🔧 **Solutions Implémentées**

### **1. Frontend - Optimisations Vite + React**

#### **Configuration Vite Optimisée**
```typescript
// vite.config.ts
build: {
  target: 'es2015',           // Support des navigateurs modernes
  minify: 'terser',           // Minification avancée
  rollupOptions: {
    output: {
      manualChunks: {         // Code splitting intelligent
        vendor: ['react', 'react-dom', 'react-router-dom'],
        ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        utils: ['date-fns', 'zod', 'react-hook-form'],
        charts: ['recharts'],
        stripe: ['@stripe/stripe-js', '@stripe/react-stripe-js']
      }
    }
  }
}
```

#### **Hooks Optimisés avec React Query**
```typescript
// hooks/useOptimizedQuery.ts
export function useSpectaclesQuery(page: number = 1, limit: number = 9) {
  return useOptimizedQuery(
    ['spectacles', 'list', page.toString(), limit.toString()],
    `/api/spectacles?page=${page}&limit=${limit}`,
    {
      staleTime: 2 * 60 * 1000,    // 2 minutes pour les spectacles
      gcTime: 5 * 60 * 1000,       // 5 minutes en cache
    }
  );
}
```

#### **Configuration React Query Optimisée**
```typescript
// App.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutes
      gcTime: 10 * 60 * 1000,      // 10 minutes
      refetchOnWindowFocus: false,  // Pas de refetch automatique
      refetchOnMount: false,        // Pas de refetch au montage si en cache
    }
  }
});
```

### **2. Backend - Pool de Connexions MySQL Optimisé**

#### **Configuration MySQL Avancée**
```javascript
// backend/src/db.js
const pool = mysql.createPool({
  // 🚀 OPTIMISATIONS POUR LA PRODUCTION
  connectionLimit: process.env.NODE_ENV === 'production' ? 3 : 5, // Optimal pour Render
  queueLimit: process.env.NODE_ENV === 'production' ? 5 : 10,    // Limiter la file d'attente
  
  // ⚡ OPTIMISATIONS DE PERFORMANCE AVANCÉES
  acquireTimeout: process.env.NODE_ENV === 'production' ? 30000 : 60000, // 30s en prod
  timeout: process.env.NODE_ENV === 'production' ? 30000 : 60000,        // 30s en prod
  
  // 🔧 OPTIMISATIONS SPÉCIFIQUES RENDER
  enableKeepAlive: true,           // Maintenir les connexions actives
  keepAliveInitialDelay: 5000,     // Keep-alive toutes les 5s (agressif)
  
  // 📊 OPTIMISATIONS MYSQL2
  dateStrings: true,               // Dates en format string
  supportBigNumbers: true,         // Support des grands nombres
  
  // 🎯 OPTIMISATIONS DE POOL
  maxIdle: 10000,                  // Fermer les connexions inactives après 10s
  idleTimeout: 10000,              // Timeout pour les connexions inactives
});
```

### **3. Keep-Alive Agressif**

#### **Script de Keep-Alive Optimisé**
```javascript
// backend/keep-alive.js
const KEEP_ALIVE_INTERVAL = 10 * 60 * 1000; // 10 minutes (plus agressif)
const HEALTH_CHECK_INTERVAL = 3 * 60 * 1000;  // 3 minutes (vérification fréquente)
```

#### **Keep-Alive Intégré au Serveur**
```javascript
// backend/src/server.js
if (process.env.NODE_ENV === 'production') {
  // Keep-alive agressif pour éviter la mise en veille
  setInterval(() => {
    console.log('🔄 Keep-alive ping -', new Date().toISOString());
    
    // Vérification de la base de données
    const db = require('./db');
    db.query('SELECT 1 as health_check')
      .then(() => console.log('✅ DB: OK'))
      .catch(err => console.warn('⚠️ DB: Erreur -', err.message));
      
  }, 8 * 60 * 1000); // Toutes les 8 minutes
  
  // Optimisation de la mémoire
  setInterval(() => {
    if (global.gc) {
      global.gc();
      console.log('🧹 Garbage collection effectuée');
    }
  }, 30 * 60 * 1000); // Toutes les 30 minutes
}
```

### **4. Scripts de Build Optimisés**

#### **Build de Production**
```bash
# Build optimisé avec analyse
npm run build:prod

# Analyse de la taille des bundles
npm run build:analyze

# Vérification des performances
npm run performance:check
```

#### **Script de Build Automatisé**
```javascript
// frontend/build-production.js
// 1. Nettoyage du dossier dist
// 2. Vérification des dépendances
// 3. Build optimisé
// 4. Analyse de la taille des bundles
// 5. Vérification des fichiers critiques
// 6. Optimisations finales
```

## 🚀 **Déploiement en Production**

### **Étape 1 : Build Frontend Optimisé**
```bash
cd frontend
npm run build:prod
```

### **Étape 2 : Déploiement Backend**
```bash
cd backend
# Le serveur inclut déjà les optimisations de performance
npm start
```

### **Étape 3 : Keep-Alive Externe (Recommandé)**
```bash
# Utiliser un service externe comme UptimeRobot
# Ou déployer le script keep-alive sur un service séparé
node keep-alive.js
```

## 📊 **Métriques de Performance**

### **Objectifs de Performance**
- **Premier accès** : < 3 secondes (vs 30s avant)
- **Requêtes DB** : < 500ms (vs 5-10s avant)
- **Temps de réponse API** : < 1 seconde
- **Taille des bundles** : < 2MB total

### **Monitoring**
```bash
# Logs de performance
grep "⚠️ Requête lente" backend/logs/app.log

# Connexions DB actives
grep "🔌 Nouvelle connexion MySQL" backend/logs/app.log

# Keep-alive
grep "🔄 Keep-alive" backend/logs/app.log
```

## 🔍 **Dépannage des Performances**

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
- ⚡ **Premier accès** : 2-3 secondes
- 🚀 **Requêtes DB** : 100-500ms
- 🔄 **Keep-alive** : Service toujours actif
- 📦 **Bundles** : Code splitting intelligent
- 🎯 **Cache** : React Query optimisé

## 🎯 **Prochaines Étapes**

1. **Déployer** les optimisations
2. **Tester** les performances
3. **Monitorer** les métriques
4. **Ajuster** si nécessaire
5. **Implémenter** Redis (optionnel)

## 📞 **Support**

En cas de problème :
1. Vérifier les logs Render
2. Tester la connectivité DB
3. Vérifier le keep-alive
4. Consulter les métriques de performance
5. Utiliser les scripts de diagnostic

---

**🚀 Votre application est maintenant optimisée pour des performances maximales en production !**
