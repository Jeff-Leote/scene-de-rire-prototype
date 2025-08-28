# 👨‍💻 Guide Développeur - Espace Comédie Frontend

## 📋 Vue d'ensemble

Ce guide est destiné aux développeurs travaillant sur l'application frontend de l'Espace Comédie. Il contient les informations essentielles pour comprendre, maintenir et étendre l'application.

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+ et npm
- Git
- Docker et Docker Compose (optionnel)

### Installation
```bash
# Cloner le projet
git clone <repository-url>
cd scene-de-rire-prototype/frontend

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev
```

### Environnement Docker
```bash
# Depuis la racine du projet
docker-compose up frontend
```

---

## 🏗️ Architecture du Projet

### Structure des Dossiers
```
frontend/
├── src/
│   ├── components/          # Composants React
│   │   ├── ui/             # Composants UI (shadcn)
│   │   ├── Newsletter.tsx  # Newsletter sécurisée
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

### Technologies Utilisées
- **Framework** : React 18 + TypeScript
- **Build Tool** : Vite
- **Styling** : Tailwind CSS + shadcn/ui
- **Routing** : React Router DOM
- **State Management** : React Query (TanStack)
- **Validation** : Zod + React Hook Form
- **Tests** : Vitest + React Testing Library
- **Sécurité** : DOMPurify, js-cookie, rate-limiter-flexible

---

## 🛡️ Système de Sécurité

### Utilisation du Hook de Sécurité
```typescript
import { useSecurity } from '@/hooks/useSecurity'

const MyComponent = () => {
  const {
    validateEmailField,
    validatePasswordField,
    checkRateLimitForAction,
    sanitizeInput,
    handleSecurityError,
    errors,
    isSubmitting
  } = useSecurity()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    const isValidEmail = validateEmailField(email, 'email')
    if (!isValidEmail) return
    
    // Rate limiting
    if (!checkRateLimitForAction('form', 5, 60000)) {
      setError('Trop de tentatives')
      return
    }
    
    // Sanitisation
    const sanitizedEmail = sanitizeInput(email)
    
    // Soumission
    try {
      await secureApi.submitForm({ email: sanitizedEmail })
    } catch (error) {
      handleSecurityError(error)
    }
  }
}
```

### Service API Sécurisé
```typescript
import { secureApi } from '@/services/secureApi'

// Utilisation automatique des en-têtes de sécurité
const data = await secureApi.subscribeNewsletter(email)
const user = await secureApi.login(email, password)
```

### Validation avec Zod
```typescript
import { emailSchema, passwordSchema } from '@/utils/security'

// Validation stricte
const validatedData = emailSchema.parse(email)
const validatedPassword = passwordSchema.parse(password)
```

---

## 🧪 Tests

### Lancer les Tests
```bash
# Tests unitaires
npm test

# Interface de test interactive
npm run test:ui

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

### Écrire des Tests
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('should handle user interaction', () => {
    render(<MyComponent />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(screen.getByText('Clicked')).toBeInTheDocument()
  })
})
```

### Tests de Sécurité
```typescript
import { sanitizeString, validateURL } from '@/utils/security'

describe('Security Utils', () => {
  it('should sanitize malicious input', () => {
    const malicious = '<script>alert("xss")</script>Hello'
    const sanitized = sanitizeString(malicious)
    expect(sanitized).toBe('Hello')
  })

  it('should validate URLs', () => {
    expect(validateURL('https://espacecomedie.fr')).toBe(true)
    expect(validateURL('javascript:alert("xss")')).toBe(false)
  })
})
```

---

## 🎨 Composants UI

### Utilisation de shadcn/ui
```typescript
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const MyComponent = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mon Composant</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Entrez votre texte" />
        <Button>Cliquez-moi</Button>
      </CardContent>
    </Card>
  )
}
```

### Styling avec Tailwind CSS
```typescript
// Classes utilitaires
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h1 className="text-2xl font-bold text-gray-900">Titre</h1>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Action
  </button>
</div>

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Contenu */}
</div>
```

---

## 🔧 Configuration

### Variables d'Environnement
```env
# API
VITE_API_URL=http://localhost:5000

# Sécurité
VITE_CSRF_ENABLED=true
VITE_RATE_LIMIT_ENABLED=true

# Développement
VITE_DEBUG_MODE=true
```

### Configuration TypeScript
```json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Configuration Vite
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

---

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

---

## 🚀 Déploiement

### Build de Production
```bash
npm run build
```

### Vérification du Build
```bash
npm run preview
```

### Déploiement avec Docker
```bash
# Build de l'image
docker build -t espace-comedie-frontend .

# Exécution du conteneur
docker run -p 80:80 espace-comedie-frontend
```

---

## 🔍 Debugging

### Outils de Développement
- **React Developer Tools** : Extension navigateur
- **Redux DevTools** : Pour le state management
- **Network Tab** : Pour les appels API
- **Console** : Pour les logs et erreurs

### Logs de Développement
```typescript
// Logs conditionnels
if (import.meta.env.DEV) {
  console.log('Debug info:', data)
}

// Logs de sécurité
console.warn('Security warning:', warning)
console.error('Security error:', error)
```

### Erreurs Courantes
1. **Erreurs TypeScript** : Vérifier les types et imports
2. **Erreurs de sécurité** : Vérifier la validation des entrées
3. **Erreurs API** : Vérifier les en-têtes et l'authentification
4. **Erreurs de build** : Vérifier les dépendances

---

## 📚 Ressources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vite](https://vitejs.dev/)

### Sécurité
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security](https://react.dev/learn/security)
- [Zod Documentation](https://zod.dev/)

### Tests
- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest DOM](https://github.com/testing-library/jest-dom)

---

## 🤝 Contribution

### Workflow Git
1. Créer une branche feature
2. Développer les fonctionnalités
3. Écrire les tests
4. Vérifier la sécurité
5. Créer une Pull Request

### Standards de Code
- **TypeScript strict** : Utiliser les types appropriés
- **ESLint** : Respecter les règles de linting
- **Prettier** : Formatage automatique
- **Tests** : Couverture minimale de 80%
- **Sécurité** : Validation de toutes les entrées

### Code Review
- Vérifier la sécurité
- Tester les fonctionnalités
- Valider les performances
- Vérifier l'accessibilité
- Contrôler la documentation

---

## 🆘 Support

### Problèmes Courants
- **Erreurs de dépendances** : `npm install` et `npm audit fix`
- **Erreurs TypeScript** : Vérifier les types et imports
- **Erreurs de sécurité** : Consulter la documentation de sécurité
- **Erreurs de build** : Vérifier la configuration Vite

### Contacts
- **Email** : dev@espacecomedie.fr
- **Issues** : GitHub Issues
- **Documentation** : Fichiers de documentation du projet

---

**Ce guide doit être maintenu à jour avec les nouvelles fonctionnalités et bonnes pratiques.** 👨‍💻
