# 🚨 Guide de Résolution des Erreurs 500 en Production

## 📋 **Problèmes Identifiés**

### **1. Erreurs 500 sur les APIs**
- ❌ `/api/spectacles/all` → 500 Internal Server Error
- ❌ `/api/spectacles/upcoming` → 500 Internal Server Error
- ❌ `feature_collector.js` → Script externe problématique

## 🔍 **Diagnostic Immédiat**

### **Étape 1 : Diagnostic Backend**
```bash
cd backend
npm run diagnostic
```

### **Étape 2 : Vérification des Logs Render**
1. Aller sur [Render Dashboard](https://dashboard.render.com)
2. Sélectionner votre service backend
3. Cliquer sur "Logs"
4. Rechercher les erreurs récentes

### **Étape 3 : Test de Connectivité DB**
```bash
# Depuis Render, tester la connexion DB
cd backend
node -e "
const db = require('./src/db.js');
db.query('SELECT 1 as test')
  .then(() => console.log('✅ DB OK'))
  .catch(err => console.error('❌ DB Error:', err.message));
"
```

## 🚀 **Solutions par Problème**

### **Problème 1 : Variables d'Environnement Manquantes**

**Symptômes :**
- Erreurs 500 sur toutes les routes
- Messages "Cannot read property of undefined"

**Solution :**
1. Vérifier dans Render → Environment Variables
2. S'assurer que ces variables sont définies :
   ```
   DB_HOST=your-railway-host
   DB_USER=your-username
   DB_PASSWORD=your-password
   DB_NAME=espace_comedie
   JWT_SECRET=your-secret
   NODE_ENV=production
   ```

### **Problème 2 : Connexion Base de Données Échoue**

**Symptômes :**
- Erreurs "getaddrinfo ENOTFOUND"
- Timeout sur les requêtes DB

**Solution :**
1. Vérifier que Railway est actif
2. Tester la connectivité depuis Render
3. Vérifier les paramètres de connexion
4. Redémarrer le service backend

### **Problème 3 : Dépendances Manquantes**

**Symptômes :**
- Erreurs "Cannot find module"
- Crash au démarrage

**Solution :**
```bash
cd backend
npm ci --only=production
npm start
```

### **Problème 4 : Problème de Routes**

**Symptômes :**
- Erreurs 500 sur routes spécifiques
- Routes retournent des erreurs

**Solution :**
1. Vérifier que `src/routes/index.js` existe
2. Vérifier que les middlewares sont corrects
3. Tester les routes individuellement

## 🔧 **Actions Immédiates**

### **1. Redémarrage du Service Backend**
```bash
# Dans Render Dashboard
1. Aller sur votre service backend
2. Cliquer sur "Manual Deploy"
3. Sélectionner "Clear build cache & deploy"
4. Attendre le redéploiement
```

### **2. Vérification de la Base de Données**
```bash
# Depuis Railway
1. Aller sur [Railway Dashboard](https://railway.app)
2. Sélectionner votre projet DB
3. Vérifier que le service est actif
4. Tester une connexion directe
```

### **3. Nettoyage du Cache Frontend**
```bash
# Supprimer le build et reconstruire
cd frontend
Remove-Item -Recurse -Force dist
npm run build:prod
```

## 📊 **Monitoring et Prévention**

### **1. Script de Keep-Alive Amélioré**
```bash
# Vérifier que le keep-alive fonctionne
cd backend
node keep-alive.js
```

### **2. Health Check Automatique**
```bash
# Ajouter un endpoint de santé
curl https://your-backend.onrender.com/health
```

### **3. Logs de Performance**
```bash
# Surveiller les performances
cd backend
npm run performance:check
```

## 🎯 **Vérification Post-Correction**

### **1. Test des Routes Critiques**
```bash
# Tester les routes qui échouaient
curl https://your-backend.onrender.com/api/spectacles/all
curl https://your-backend.onrender.com/api/spectacles/upcoming
```

### **2. Vérification des Performances**
- Temps de réponse < 1 seconde
- Pas d'erreurs 500
- Composants s'affichent correctement

### **3. Monitoring Continu**
- Surveiller les logs Render
- Vérifier la connectivité DB
- Tester le keep-alive

## 🚨 **En Cas d'Urgence**

### **1. Rollback Immédiat**
```bash
# Dans Render Dashboard
1. Aller sur "Deploys"
2. Sélectionner la dernière version stable
3. Cliquer sur "Rollback"
```

### **2. Désactivation Temporaire des Optimisations**
```bash
# Commenter temporairement les optimisations avancées
# dans backend/src/server.js et backend/src/db.js
```

### **3. Support Technique**
- Vérifier les logs Render
- Tester la connectivité DB
- Utiliser le script de diagnostic

---

**💡 Conseil :** Commencez toujours par le diagnostic backend (`npm run diagnostic`) pour identifier précisément le problème !
