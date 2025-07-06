# Configuration Stripe

## Variables d'environnement nécessaires

Pour que le système de paiement fonctionne, vous devez configurer les variables d'environnement suivantes :

### Dans docker-compose.yaml

```yaml
environment:
  - STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
  - FRONTEND_URL=http://localhost:5173
```

### Variables d'environnement

1. **STRIPE_SECRET_KEY** : Votre clé secrète Stripe (commence par `sk_test_` pour les tests)
2. **FRONTEND_URL** : L'URL de votre frontend

## Configuration Stripe

### 1. Créer un compte Stripe
- Allez sur [stripe.com](https://stripe.com)
- Créez un compte développeur

### 2. Récupérer les clés API
- Dans le dashboard Stripe, allez dans "Developers" > "API keys"
- Copiez la "Publishable key" et la "Secret key"

### 3. Tester avec des cartes
- **Succès** : `4242 4242 4242 4242`
- **Échec** : `4000 0000 0000 0002`
- **Annulation** : `4000 0000 0000 9995`

## Fonctionnement

1. L'utilisateur sélectionne ses spectacles
2. Il remplit ses informations
3. Il clique sur "Payer"
4. Une session Stripe Checkout est créée
5. L'utilisateur est redirigé vers Stripe pour saisir sa carte
6. Après paiement, il est redirigé vers `/payment-status`
7. Le statut du paiement est vérifié via l'API Stripe
8. L'utilisateur voit un toast de confirmation et est redirigé vers ses réservations

## Sécurité

- Les clés Stripe sont stockées dans les variables d'environnement
- Les paiements sont traités directement via l'API Stripe 