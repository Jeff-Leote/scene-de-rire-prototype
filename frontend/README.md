# 🎭 Espace Comédie - Application Frontend

## 📋 Vue d'ensemble

Application frontend React pour l'Espace Comédie, une salle de spectacle spécialisée dans l'humour et la comédie. L'application permet la gestion des spectacles, réservations, et offre une interface moderne et sécurisée.

## 🛡️ Sécurité

L'application intègre un **système de sécurité complet** protégeant contre :
- ✅ **XSS** (Cross-Site Scripting) - Sanitisation automatique
- ✅ **CSRF** (Cross-Site Request Forgery) - Tokens de validation
- ✅ **Attaques par Force Brute** - Rate limiting intelligent
- ✅ **Injection** - Validation stricte des entrées
- ✅ **Clickjacking** - Headers de sécurité

### Documentation de Sécurité
- 📖 [Guide de Sécurité](SECURITY.md) - Détails des protections
- 📖 [Implémentation Sécurité](SECURITY_IMPLEMENTATION.md) - Guide technique

## 🚀 Technologies

- **Framework** : React 18 + TypeScript
- **Build Tool** : Vite
- **Styling** : Tailwind CSS + shadcn/ui
- **Routing** : React Router DOM
- **State Management** : React Query (TanStack)
- **Validation** : Zod + React Hook Form
- **Tests** : Vitest + React Testing Library
- **Sécurité** : DOMPurify, js-cookie, rate-limiter-flexible

## 📁 Structure du Projet

```
frontend/
├── src/
│   ├── components/          # Composants React
│   │   ├── ui/             # Composants UI (shadcn)
│   │   ├── Header.tsx      # Navigation
│   │   └── ...
│   ├── pages/              # Pages de l'application
│   ├── hooks/              # Hooks personnalisés
│   │   └── useSecurity.ts  # Hook de sécurité
│   ├── services/           # Services API
│   │   └── secureApi.ts    # Service API sécurisé
│   ├── utils/              # Utilitaires
│   │   └── security.ts     # Fonctions de sécurité
│   ├── contexts/           # Contextes React
│   ├── test/               # Tests unitaires
│   └── types/              # Types TypeScript
├── public/                 # Assets statiques
└── docs/                   # Documentation
```

## 🛠️ Installation et Développement

### Prérequis
- Node.js 18+ et npm
- Docker et Docker Compose (pour l'environnement complet)

### Installation Locale
```bash
# Cloner le projet
git clone <repository-url>
cd scene-de-rire-prototype/frontend

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev
```

### Environnement Docker (Recommandé)
```bash
# Depuis la racine du projet
docker-compose up frontend
```

L'application sera disponible sur `http://localhost:5173`

## 🧪 Tests

### Tests Unitaires
```bash
# Lancer tous les tests
npm test

# Interface de test interactive
npm run test:ui

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

### Tests de Sécurité
```bash
# Audit de sécurité
npm run security:audit

# Correction automatique
npm run security:fix

# Tests manuels de sécurité
node src/test-simple.js
```

## 📦 Scripts Disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Démarre le serveur de développement |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualise le build de production |
| `npm test` | Lance les tests unitaires |
| `npm run test:ui` | Interface de test interactive |
| `npm run test:coverage` | Tests avec rapport de couverture |
| `npm run lint` | Vérification du code |
| `npm run security:audit` | Audit de sécurité des dépendances |

## 🔧 Configuration

### Variables d'Environnement
```env
VITE_API_URL=http://localhost:5000  # URL de l'API backend
```

### Configuration TypeScript
- `tsconfig.json` - Configuration TypeScript principale
- `tsconfig.node.json` - Configuration pour Node.js
- `src/types/test.d.ts` - Types pour les tests

## 🎯 Fonctionnalités Principales

### 🎭 Gestion des Spectacles
- Affichage des spectacles à venir
- Détails des spectacles
- Calendrier des événements
- Recherche et filtrage

### 👥 Gestion des Utilisateurs
- Inscription/Connexion sécurisée
- Profil utilisateur
- Historique des réservations
- Gestion des préférences

### 🏢 Administration
- Dashboard administrateur
- Gestion des spectacles
- Statistiques de vente
- Gestion des utilisateurs

## 🛡️ Système de Sécurité

### Protection XSS
```typescript
import { sanitizeString } from '@/utils/security'

const userInput = '<script>alert("xss")</script>Hello'
const sanitized = sanitizeString(userInput) // "Hello"
```

### Rate Limiting
```typescript
import { useSecurity } from '@/hooks/useSecurity'

const { checkRateLimitForAction } = useSecurity()
const isAllowed = checkRateLimitForAction('login', 5, 15 * 60 * 1000)
```

### Validation Stricte
```typescript
import { contactFormSchema } from '@/utils/security'

const validatedData = contactFormSchema.parse(formData)
```

## 📚 Documentation

- 📖 [Guide de Sécurité](SECURITY.md) - Mesures de sécurité détaillées
- 📖 [Implémentation Sécurité](SECURITY_IMPLEMENTATION.md) - Guide technique
- 📖 [Configuration Production](../PRODUCTION_SETUP.md) - Déploiement
- 📖 [Configuration Email](../EMAIL_CONFIG.md) - Configuration SMTP

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est propriétaire de l'Espace Comédie.

## 🆘 Support

Pour toute question ou problème :
- 📧 Email : contact@espacecomedie.fr
- 🐛 Issues : GitHub Issues
- 📖 Documentation : Voir les fichiers de documentation

---

**Espace Comédie** - Votre salle de spectacle pour l'humour et la comédie ! 🎭✨
