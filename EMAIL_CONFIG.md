# Configuration Email - Espace Comédie

## 🎯 Objectif
Configuration pour que les emails fonctionnent en **local ET en production** sans stress de push.

## 📧 Configuration Actuelle

### Mode Développement (Local)
- **SMTP**: Mailtrap (service de test)
- **Email de réception**: `palik.leote75@outlook.fr`
- **Mode**: Simulation + tentative d'envoi réel si configuré

### Mode Production
- **SMTP**: Outlook (`palik.leote75@outlook.fr`)
- **Email de réception**: `palik.leote75@outlook.fr`

## 🔧 Configuration Rapide

### Option 1: Mailtrap (Recommandé pour le développement)

1. **Allez sur [Mailtrap.io](https://mailtrap.io)**
2. **Créez un compte gratuit**
3. **Créez une boîte de test**
4. **Récupérez les identifiants SMTP**

Puis modifiez `docker-compose.yaml`:
```yaml
- SMTP_HOST=smtp.mailtrap.io
- SMTP_PORT=2525
- SMTP_USER=votre-username-mailtrap
- SMTP_PASS=votre-password-mailtrap
```

### Option 2: Outlook (Pour recevoir directement)

1. **Activez l'authentification à 2 facteurs sur Outlook**
2. **Générez un mot de passe d'application**
3. **Modifiez `docker-compose.yaml`**:

```yaml
# Décommentez ces lignes et commentez Mailtrap
- SMTP_HOST=smtp-mail.outlook.com
- SMTP_PORT=587
- SMTP_USER=palik.leote75@outlook.fr
- SMTP_PASS=votre-mot-de-passe-app-outlook
```

## 🧪 Test

1. **Allez sur votre site** → `http://localhost:5173/contact`
2. **Envoyez un message de test**
3. **Vérifiez les logs du backend**:
   ```bash
   docker-compose logs backend -f
   ```

## 📋 Logs Attendus

### Si SMTP configuré:
```
=== EMAIL ENVOYÉ (MODE DÉVELOPPEMENT) ===
📧 De: noreply@espacecomedie.fr
📧 À: palik.leote75@outlook.fr
📧 Sujet: [Contact] Test
📧 Message: Votre message
✅ Email envoyé avec succès via SMTP: <message-id>
```

### Si SMTP non configuré:
```
=== EMAIL ENVOYÉ (MODE DÉVELOPPEMENT) ===
📧 Email simulé (SMTP non configuré)
```

## 🚀 Production

En production, le système utilisera automatiquement la configuration Outlook configurée dans les variables d'environnement du serveur.

## 💡 Conseils

- **Mailtrap** : Parfait pour le développement, vous voyez tous les emails dans une interface web
- **Outlook** : Pour recevoir directement dans votre boîte mail
- **Pas de push** : Changez juste les variables dans `docker-compose.yaml` et redémarrez le backend

## 🔄 Redémarrage

Après modification de la configuration:
```bash
docker-compose restart backend
```
