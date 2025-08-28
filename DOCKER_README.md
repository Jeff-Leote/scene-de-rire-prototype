# 🐳 Guide Docker - Scene de Rire

## 🚀 Démarrage Rapide

### Option 1 : Démarrage Simple
```bash
docker-compose up -d
```

### Option 2 : Build et Démarrage
```bash
# Construire les images
docker-compose build

# Démarrer les services
docker-compose up -d
```

## 📍 URLs d'Accès

- **Frontend** : http://localhost:5173
- **Backend** : http://localhost:5000
- **PhpMyAdmin** : http://localhost:8080
- **Base de données** : localhost:3307

## 🛠️ Commandes Utiles

```bash
# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down

# Redémarrer un service spécifique
docker-compose restart backend
docker-compose restart frontend

# Nettoyer Docker
docker system prune -f
```

## 🔧 Configuration

Le projet utilise :
- **Node.js 24** (Alpine) pour le backend et frontend
- **MySQL 8.0** pour la base de données
- **PhpMyAdmin** pour la gestion de la DB

## 📁 Structure Docker

```
├── backend/
│   ├── Dockerfile          # Image backend optimisée
│   └── .dockerignore       # Fichiers exclus du build
├── frontend/
│   ├── Dockerfile.simple   # Image frontend simplifiée
│   └── .dockerignore       # Fichiers exclus du build
└── docker-compose.yaml     # Configuration des services
```

## ✅ Problèmes Résolus

- ✅ Permissions Windows avec Docker
- ✅ Fichiers de configuration problématiques
- ✅ Build context optimisé
- ✅ Images Docker fonctionnelles

## 🎉 Prêt à l'Emploi !

L'application est maintenant prête à être utilisée avec Docker !
