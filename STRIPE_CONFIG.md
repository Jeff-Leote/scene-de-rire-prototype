# Configuration Stripe - Espace Comédie

## Configuration pour le développement local

### Variables d'environnement nécessaires :

```env
# Base de données
DB_HOST=db
DB_USER=root
DB_PASSWORD=root
DB_NAME=espace_comedie

# Stripe (clé de test pour le développement)
STRIPE_SECRET_KEY=sk_test_4eC39HqLyjWDarjtT1zdp7dc

# Frontend
FRONTEND_URL=http://localhost:5173

# JWT
JWT_SECRET=votre_secret_jwt_ici

# Environnement
NODE_ENV=development

# Port
PORT=5000
```

## Configuration pour la production

### Variables d'environnement nécessaires :

```env
# Base de données (configurée sur Render)
DB_HOST=votre_host_db
DB_USER=votre_user_db
DB_PASSWORD=votre_password_db
DB_NAME=espace_comedie

# Stripe (clé secrète réelle pour la production)
STRIPE_SECRET_KEY=sk_live_votre_cle_secrete_reelle

# Frontend (URL de production)
FRONTEND_URL=https://espacecomedie.fr

# JWT
JWT_SECRET=votre_secret_jwt_securise

# Environnement
NODE_ENV=production

# Port
PORT=5000
```

## Cartes de test Stripe

Pour tester en développement, utilisez ces cartes :

- **Succès** : `4242 4242 4242 4242`
- **Échec** : `4000 0000 0000 0002`
- **Date d'expiration** : N'importe quelle date future
- **CVC** : N'importe quels 3 chiffres

## Fonctionnement

Le système détecte automatiquement l'environnement :
- **Développement** : Utilise `http://localhost:5173` et une clé de test
- **Production** : Utilise `https://espacecomedie.fr` et votre clé secrète réelle

## Résolution des problèmes

### Erreur 401 (Unauthorized)
- Vérifiez que votre clé Stripe est valide
- En développement, la clé de test par défaut sera utilisée automatiquement

### Erreur 500 (Internal Server Error)
- Vérifiez les logs du backend pour plus de détails
- Assurez-vous que toutes les variables d'environnement sont configurées
