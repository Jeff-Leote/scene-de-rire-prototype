# Configuration Stripe

## Variables d'environnement requises

### Backend (.env ou docker-compose.yaml)
```env
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_stripe
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique_stripe
VITE_API_URL=http://localhost:5000
```

## Configuration pour différents environnements

### Développement local
- Utilisez les clés de test Stripe
- FRONTEND_URL=http://localhost:5173
- NODE_ENV=development

### Production (Render)
- Utilisez les clés de production Stripe
- FRONTEND_URL=https://espacecomedie.fr
- NODE_ENV=production

## Obtenir vos clés Stripe

1. Créez un compte sur [stripe.com](https://stripe.com)
2. Allez dans le Dashboard Stripe
3. Dans "Developers" > "API keys"
4. Copiez vos clés publiques et secrètes

## Test des paiements

### Cartes de test Stripe
- **Succès** : 4242 4242 4242 4242
- **Échec** : 4000 0000 0000 0002
- **Date d'expiration** : N'importe quelle date future
- **CVC** : N'importe quels 3 chiffres

## Dépannage

### Erreur "Invalid URL"
- Vérifiez que FRONTEND_URL contient le protocole (http:// ou https://)
- Assurez-vous que l'URL est accessible

### Erreur de clé API
- Vérifiez que les clés Stripe sont correctes
- Assurez-vous d'utiliser les bonnes clés (test vs production)

### Problèmes de redirection
- Vérifiez que les URLs de succès/annulation sont correctes
- Testez les URLs dans votre navigateur

