# 🚀 Configuration Production - Envoi d'Emails

## 📧 Configuration SMTP pour Production

### 1. Variables d'Environnement Requises

Assurez-vous que ces variables sont définies dans votre environnement de production :

```bash
# Configuration SMTP Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=junior97301@gmail.com
SMTP_PASS=azwrabuivhturkpq
FROM_EMAIL=contact@espacecomedie.fr

# Environnement
NODE_ENV=production
FRONTEND_URL=https://espacecomedie.fr
```

### 2. Configuration Gmail

#### Étape 1 : Activer l'Authentification à 2 Facteurs
1. Allez sur [myaccount.google.com](https://myaccount.google.com)
2. Sécurité → Authentification à 2 facteurs → Activer

#### Étape 2 : Créer un Mot de Passe d'Application
1. Sécurité → Mots de passe d'application
2. Sélectionnez "Autre" et nommez-le "Espace Comédie"
3. Copiez le mot de passe généré (16 caractères)
4. Utilisez ce mot de passe dans `SMTP_PASS`

### 3. Déploiement avec Docker Compose

#### Option A : Utiliser le fichier de production
```bash
# Utiliser la configuration de production
docker-compose -f docker-compose.prod.yaml up -d
```

#### Option B : Variables d'environnement personnalisées
```bash
# Créer un fichier .env pour la production
cat > .env.prod << EOF
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=junior97301@gmail.com
SMTP_PASS=azwrabuivhturkpq
FROM_EMAIL=contact@espacecomedie.fr
FRONTEND_URL=https://espacecomedie.fr
EOF

# Démarrer avec les variables personnalisées
docker-compose --env-file .env.prod up -d
```

### 4. Test de la Configuration

#### Test en Local (Développement)
```bash
# Tester la configuration SMTP
docker exec scene-de-rire-prototype-backend-1 node test-smtp.js
```

#### Test en Production
```bash
# Se connecter au serveur de production
ssh user@your-server.com

# Tester la configuration SMTP
docker exec your-backend-container node test-smtp.js
```

### 5. Vérification des Logs

#### Surveiller les logs d'envoi d'emails
```bash
# Logs en temps réel
docker-compose logs -f backend | grep "📧"

# Logs spécifiques aux emails
docker-compose logs backend | grep -E "(📧|❌|✅)"
```

### 6. Dépannage

#### Erreur EAUTH (Authentification)
```
❌ Erreur d'authentification SMTP - Vérifiez les identifiants Gmail
```
**Solutions :**
- Vérifiez que l'authentification à 2 facteurs est activée
- Utilisez un mot de passe d'application (pas le mot de passe principal)
- Vérifiez que l'email et le mot de passe sont corrects

#### Erreur ECONNECTION (Connexion)
```
❌ Erreur de connexion au serveur SMTP - Vérifiez la configuration réseau
```
**Solutions :**
- Vérifiez votre connexion internet
- Vérifiez que le port 587 n'est pas bloqué par le firewall
- Testez la connectivité : `telnet smtp.gmail.com 587`

#### Erreur ETIMEDOUT (Timeout)
```
❌ Timeout de connexion au serveur SMTP
```
**Solutions :**
- Vérifiez la configuration réseau du serveur
- Augmentez les timeouts si nécessaire
- Vérifiez que Gmail n'a pas temporairement bloqué l'IP

### 7. Sécurité

#### Bonnes Pratiques
- ✅ Utilisez des mots de passe d'application Gmail
- ✅ Ne stockez jamais les credentials en dur dans le code
- ✅ Utilisez des variables d'environnement
- ✅ Limitez l'accès aux logs de production
- ✅ Surveillez les tentatives d'envoi d'emails

#### Rotation des Credentials
- Changez régulièrement le mot de passe d'application
- Surveillez les logs d'activité Gmail
- Utilisez des comptes dédiés pour l'envoi d'emails

### 8. Monitoring

#### Métriques à Surveiller
- Taux de succès d'envoi d'emails
- Temps de réponse SMTP
- Erreurs d'authentification
- Quotas Gmail (limite quotidienne)

#### Alertes Recommandées
- Échec d'authentification SMTP
- Taux d'échec > 5%
- Quota Gmail atteint à 80%

---

## 🔧 Commandes Utiles

### Redémarrer le Backend
```bash
docker-compose restart backend
```

### Voir les Variables d'Environnement
```bash
docker exec scene-de-rire-prototype-backend-1 env | grep SMTP
```

### Tester l'Envoi d'Email
```bash
docker exec scene-de-rire-prototype-backend-1 node test-smtp.js
```

### Logs en Temps Réel
```bash
docker-compose logs -f backend
```

---

## 📞 Support

En cas de problème :
1. Vérifiez les logs : `docker-compose logs backend`
2. Testez la configuration : `node test-smtp.js`
3. Vérifiez les variables d'environnement
4. Consultez la documentation Gmail SMTP

