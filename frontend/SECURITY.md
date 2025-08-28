# 🛡️ Guide de Sécurité - Espace Comédie Frontend

## 📋 Vue d'ensemble

Ce document décrit les mesures de sécurité implémentées dans l'application frontend React de l'Espace Comédie pour protéger contre les vulnérabilités courantes et assurer la sécurité des utilisateurs.

## 🎯 Objectifs de Sécurité

- ✅ **Protection des données utilisateur** - Chiffrement et validation
- ✅ **Prévention des attaques** - XSS, CSRF, Force Brute
- ✅ **Sécurisation des communications** - API sécurisée
- ✅ **Validation stricte** - Entrées utilisateur contrôlées
- ✅ **Monitoring** - Détection et logging des tentatives d'attaque

---

## 🔒 Mesures de Sécurité Implémentées

### 1. Protection XSS (Cross-Site Scripting)

#### Sanitisation Automatique
Toutes les entrées utilisateur sont automatiquement sanitises avant affichage ou traitement.

```typescript
import { sanitizeString, sanitizeHTML } from '@/utils/security'

// Sanitisation de texte simple
const userInput = '<script>alert("xss")</script>Hello'
const sanitized = sanitizeString(userInput) // Retourne: "Hello"

// Sanitisation HTML avec configuration
const htmlInput = '<img src="x" onerror="alert(\'xss\')">Image'
const safeHtml = sanitizeHTML(htmlInput, { ALLOWED_TAGS: ['img'] })
```

#### Validation des Schémas
Validation stricte avec Zod pour tous les types de données.

```typescript
// Schéma de validation email
export const emailSchema = z
  .string()
  .email('Adresse email invalide')
  .min(1, 'Email requis')
  .max(255, 'Email trop long')

// Schéma de validation mot de passe
export const passwordSchema = z
  .string()
  .min(8, 'Minimum 8 caractères')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Majuscule, minuscule et chiffre requis')
```

### 2. Protection CSRF (Cross-Site Request Forgery)

#### Tokens CSRF Automatiques
Génération et validation automatique de tokens CSRF pour chaque session.

```typescript
import { generateCSRFToken, validateCSRFToken } from '@/utils/security'

// Génération d'un token unique
const token = generateCSRFToken()

// Validation du token
const isValid = validateCSRFToken(token)
```

#### Stockage Sécurisé
Les tokens sont stockés dans des cookies sécurisés avec les flags appropriés.

```typescript
// Configuration des cookies CSRF
const csrfCookieOptions = {
  secure: true,           // HTTPS uniquement
  sameSite: 'strict',     // Protection CSRF
  httpOnly: false,        // Accessible en JavaScript
  maxAge: 3600000         // 1 heure
}
```

### 3. Protection contre les Attaques par Force Brute

#### Rate Limiting Intelligent
Limitation du nombre de tentatives par action avec fenêtres temporelles configurables.

```typescript
// Configuration des limites par action
const RATE_LIMITS = {
  login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },      // 5 tentatives en 15 minutes
  register: { maxAttempts: 3, windowMs: 60 * 60 * 1000 },   // 3 tentatives en 1 heure
  newsletter: { maxAttempts: 10, windowMs: 60 * 60 * 1000 }, // 10 tentatives en 1 heure
  passwordReset: { maxAttempts: 3, windowMs: 60 * 60 * 1000 } // 3 tentatives en 1 heure
}

// Utilisation dans les composants
const { checkRateLimitForAction } = useSecurity()
const isAllowed = checkRateLimitForAction('login', 5, 15 * 60 * 1000)
```

#### Interface Utilisateur Adaptative
Feedback visuel et messages d'erreur informatifs pour l'utilisateur.

```typescript
// Affichage du temps restant
const getRateLimitMessage = () => {
  if (!isRateLimited || !resetTime) return null
  
  const now = new Date()
  const timeLeft = Math.ceil((resetTime.getTime() - now.getTime()) / 1000 / 60)
  
  return `Trop de tentatives. Réessayez dans ${timeLeft} minute${timeLeft > 1 ? 's' : ''}.`
}
```

### 4. Validation des Entrées

#### Validation en Temps Réel
Feedback immédiat à l'utilisateur pendant la saisie.

```typescript
const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value
  setEmail(value)
  
  // Validation en temps réel
  if (value) {
    validateEmailField(value, 'email')
  } else {
    clearErrors()
  }
}
```

#### Types de Validation Implémentés

| Type | Validation | Exemple |
|------|------------|---------|
| **Email** | Format RFC 5322, longueur max 255 | `user@domain.com` |
| **Mot de passe** | 8+ caractères, majuscule, minuscule, chiffre | `Password123` |
| **Nom** | Caractères autorisés, longueur max 50 | `Jean Dupont` |
| **URL** | Domaines autorisés uniquement | `https://espacecomedie.fr` |
| **Téléphone** | Format français | `+33 1 23 45 67 89` |

### 5. Service API Sécurisé

#### En-têtes de Sécurité Automatiques
Tous les appels API incluent automatiquement des en-têtes de sécurité.

```typescript
// En-têtes de sécurité automatiques
export function addSecurityHeaders(headers: Record<string, string> = {}): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',        // Prévention CSRF
    'X-Content-Type-Options': 'nosniff',         // Prévention MIME sniffing
    'X-Frame-Options': 'DENY',                   // Prévention clickjacking
    'X-XSS-Protection': '1; mode=block',         // Protection XSS navigateur
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    ...headers
  }
}
```

#### Gestion d'Erreurs Sécurisée
Traitement centralisé des erreurs avec logging sécurisé.

```typescript
// Gestion d'erreurs dans les composants
try {
  const response = await secureApi.subscribeNewsletter(email)
  setMessage('Inscription réussie !')
} catch (error: any) {
  if (error.name === 'ZodError') {
    setMessage('Format d\'email invalide')
  } else if (error.status === 429) {
    setMessage('Trop de tentatives. Veuillez réessayer plus tard.')
  } else {
    handleSecurityError(error) // Logging sécurisé
  }
}
```

---

## 🛠️ Implémentation Technique

### Hook de Sécurité Centralisé

```typescript
// src/hooks/useSecurity.ts
export const useSecurity = () => {
  return {
    // Validation
    validateEmailField,
    validatePasswordField,
    validateNameField,
    
    // Rate limiting
    checkRateLimitForAction,
    isRateLimited,
    resetTime,
    
    // Sanitisation
    sanitizeInput,
    
    // Gestion d'erreurs
    handleSecurityError,
    clearSecurityError,
    
    // État du formulaire
    isSubmitting,
    setIsSubmitting,
    errors,
    clearErrors
  }
}
```

### Service API Sécurisé

```typescript
// src/services/secureApi.ts
export const secureApi = {
  // Méthodes sécurisées
  subscribeNewsletter: async (email: string) => {
    const sanitizedEmail = sanitizeString(email)
    const validatedData = newsletterFormSchema.parse({ email: sanitizedEmail })
    
    return fetch('/api/newsletter', {
      method: 'POST',
      headers: addSecurityHeaders(),
      body: JSON.stringify(validatedData)
    })
  },
  
  // Autres méthodes...
}
```

### Utilitaires de Sécurité

```typescript
// src/utils/security.ts
export const sanitizeString = (input: string): string => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })
}

export const generateCSRFToken = (): string => {
  return crypto.randomUUID()
}

export const checkRateLimitForAction = (
  action: string, 
  maxAttempts: number, 
  windowMs: number
): boolean => {
  // Implémentation du rate limiting
}
```

---

## 🧪 Tests de Sécurité

### Tests Unitaires
66 tests unitaires couvrant toutes les fonctionnalités de sécurité.

```bash
# Lancer les tests
npm test

# Tests avec couverture
npm run test:coverage

# Tests de sécurité spécifiques
npm run test:security
```

### Tests Manuels
Script de validation rapide pour vérifier les protections.

```bash
# Tests manuels de sécurité
node src/test-simple.js
```

### Exemple de Test
```typescript
describe('XSS Protection', () => {
  it('should sanitize malicious input', () => {
    const malicious = '<script>alert("xss")</script>Hello'
    const sanitized = sanitizeString(malicious)
    expect(sanitized).toBe('Hello')
  })
})
```

---

## 📊 Monitoring et Logging

### Détection d'Attaques
- Logging automatique des tentatives d'attaque
- Alertes pour les patterns suspects
- Métriques de sécurité en temps réel

### Métriques Collectées
- Nombre de tentatives de connexion échouées
- Tentatives de XSS détectées
- Violations de rate limiting
- Erreurs de validation CSRF

---

## 🚀 Bonnes Pratiques

### Pour les Développeurs
1. **Toujours utiliser** `useSecurity` hook pour les formulaires
2. **Valider** toutes les entrées utilisateur avec Zod
3. **Sanitiser** le contenu avant affichage
4. **Utiliser** `secureApi` pour tous les appels API
5. **Tester** les protections de sécurité

### Pour les Utilisateurs
1. **Utiliser** des mots de passe forts
2. **Ne jamais partager** les tokens de session
3. **Signaler** les comportements suspects
4. **Maintenir** les navigateurs à jour

---

## 🔧 Configuration

### Variables d'Environnement
```env
# Sécurité
VITE_CSRF_ENABLED=true
VITE_RATE_LIMIT_ENABLED=true
VITE_XSS_PROTECTION_ENABLED=true

# API
VITE_API_URL=http://localhost:5000
```

### Configuration TypeScript
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

---

## 📚 Ressources

- 📖 [Implémentation Sécurité](SECURITY_IMPLEMENTATION.md) - Guide technique détaillé
- 📖 [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Vulnérabilités courantes
- 📖 [React Security](https://react.dev/learn/security) - Sécurité React
- 📖 [Zod Documentation](https://zod.dev/) - Validation de schémas

---

## 🆘 Support Sécurité

Pour signaler une vulnérabilité de sécurité :
- 📧 Email : security@espacecomedie.fr
- 🔒 PGP Key : Disponible sur demande
- ⏰ Réponse : Sous 24h

**La sécurité de nos utilisateurs est notre priorité absolue !** 🛡️
