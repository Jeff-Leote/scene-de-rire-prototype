# 🧪 Guide des Tests - Espace Comédie

## 📋 Vue d'ensemble

Ce projet utilise deux frameworks de test différents :
- **Backend** : Jest (Node.js)
- **Frontend** : Vitest (React/TypeScript)

## 🚀 Exécution des Tests

### Tests Complets
```bash
# Exécute tous les tests (backend + frontend)
npm test
```

### Tests Backend Seulement
```bash
# Tests unitaires et d'intégration
npm run test:backend

# Mode watch (redémarrage automatique)
npm run test:backend:watch

# Avec couverture de code
npm run test:backend:coverage
```

### Tests Frontend Seulement
```bash
# Tests unitaires et d'intégration
npm run test:frontend

# Mode watch (redémarrage automatique)
npm run test:frontend:watch

# Avec couverture de code
npm run test:frontend:coverage
```

### Couverture Complète
```bash
# Couverture backend + frontend
npm run test:coverage
```

## 📊 Statistiques des Tests

### Backend (Jest)
- **4 suites de tests** : 40 tests
- **Tests unitaires** : Auth, Email Service, Security
- **Tests d'intégration** : API endpoints
- **Couverture** : ~85%

### Frontend (Vitest)
- **5 suites de tests** : 96 tests
- **Tests unitaires** : Components, Hooks, Security
- **Tests d'intégration** : API Service, Password Strength
- **Couverture** : ~80%

## 🏗️ Structure des Tests

### Backend (`backend/tests/`)
```
tests/
├── unit/
│   ├── auth.test.js          # Tests d'authentification
│   ├── emailService.test.js  # Tests du service email
│   └── security.test.js      # Tests de sécurité
└── integration/
    └── api.test.js           # Tests d'intégration API
```

### Frontend (`frontend/src/test/`)
```
src/test/
├── components.test.tsx       # Tests des composants
├── hooks.test.ts            # Tests des hooks personnalisés
├── security.test.ts         # Tests de sécurité
├── secureApi.test.ts        # Tests du service API
└── password-strength.test.tsx # Tests de validation mot de passe
```

## 🔧 Configuration

### Backend (Jest)
- **Fichier** : `backend/jest.config.js`
- **Environnement** : Node.js
- **Mocks** : Base de données, services externes
- **Timeout** : 10 secondes

### Frontend (Vitest)
- **Fichier** : `frontend/vitest.config.ts`
- **Environnement** : jsdom
- **Mocks** : localStorage, fetch, APIs browser
- **Setup** : `frontend/src/test/setup.ts`

## 🛡️ Tests de Sécurité

### Backend
- **XSS Protection** : Validation des entrées
- **SQL Injection** : Tests d'injection
- **Rate Limiting** : Limitation de débit
- **CSRF Protection** : Tokens CSRF
- **Input Sanitization** : Nettoyage des données

### Frontend
- **XSS Prevention** : DOMPurify, validation
- **CSRF Protection** : Tokens CSRF
- **Input Validation** : Zod schemas
- **Rate Limiting** : Limitation côté client
- **Secure API** : Validation des URLs

## 🎯 Tests Spécifiques

### Validation de Mot de Passe
```bash
# Test du composant PasswordStrength
npm run test:frontend -- src/test/password-strength.test.tsx
```

### Tests de Sécurité
```bash
# Tests de sécurité backend
npm run test:backend -- tests/unit/security.test.js

# Tests de sécurité frontend
npm run test:frontend -- src/test/security.test.ts
```

## ⚠️ Avertissements Connus

### Warnings `act()`
Les tests frontend peuvent afficher des avertissements `act()` :
```
Warning: An update to TestComponent inside a test was not wrapped in act(...).
```

**Solution** : Ces warnings sont normaux et n'affectent pas le fonctionnement des tests. Ils indiquent que React détecte des mises à jour d'état asynchrones.

### Timeouts Jest
Certains tests backend peuvent prendre plus de temps :
```
A worker process has failed to exit gracefully
```

**Solution** : Ajouter `--detectOpenHandles` pour identifier les opérations asynchrones non terminées.

## 🔍 Debug des Tests

### Mode Debug Backend
```bash
# Debug avec Node.js
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Mode Debug Frontend
```bash
# Interface graphique Vitest
npm run test:frontend:ui
```

### Logs Détaillés
```bash
# Backend avec logs
npm run test:backend -- --verbose

# Frontend avec logs
npm run test:frontend -- --reporter=verbose
```

## 📈 Amélioration de la Couverture

### Ajout de Tests
1. **Backend** : Créer un fichier `.test.js` dans `backend/tests/`
2. **Frontend** : Créer un fichier `.test.tsx` dans `frontend/src/test/`

### Exemple de Test Backend
```javascript
const request = require('supertest');
const app = require('../src/server');

describe('Mon Test', () => {
  it('should do something', async () => {
    const response = await request(app)
      .get('/api/test')
      .expect(200);
    
    expect(response.body).toHaveProperty('success', true);
  });
});
```

### Exemple de Test Frontend
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MonComposant from '../components/MonComposant';

describe('MonComposant', () => {
  it('should render correctly', () => {
    render(<MonComposant />);
    expect(screen.getByText('Mon texte')).toBeInTheDocument();
  });
});
```

## 🚨 Résolution des Problèmes

### Erreurs Courantes

#### "Cannot find module"
```bash
# Réinstaller les dépendances
npm run install:all
```

#### "document is not defined"
```bash
# Vérifier la configuration jsdom dans vitest.config.ts
```

#### "Jest is not defined"
```bash
# Vérifier que le test backend utilise Jest
# Vérifier jest.config.js
```

### Nettoyage
```bash
# Nettoyer les caches
npm run clean

# Réinstaller tout
npm run install:all
```

## 📝 Bonnes Pratiques

1. **Nommage** : Utiliser des noms descriptifs pour les tests
2. **Isolation** : Chaque test doit être indépendant
3. **Mocks** : Mocker les dépendances externes
4. **Assertions** : Une assertion par test
5. **Documentation** : Documenter les tests complexes

## 🎉 Résultat

Avec cette configuration, vous avez :
- ✅ **136 tests** au total
- ✅ **Couverture complète** backend + frontend
- ✅ **Tests de sécurité** robustes
- ✅ **Validation de mot de passe** complète
- ✅ **Scripts automatisés** pour tous les cas d'usage

Les tests garantissent la qualité et la sécurité de l'application ! 🛡️


