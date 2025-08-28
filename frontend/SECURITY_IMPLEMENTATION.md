# 🛠️ Guide d'Implémentation Sécurité - Espace Comédie Frontend

## 📋 Vue d'ensemble

Ce document détaille l'implémentation technique du système de sécurité frontend de l'Espace Comédie. Il fournit des instructions détaillées pour comprendre, maintenir et étendre les protections de sécurité.

---

## 🏗️ Architecture du Système de Sécurité

### Structure des Fichiers
```
src/
├── utils/
│   └── security.ts           # Utilitaires de sécurité centralisés
├── services/
│   └── secureApi.ts          # Service API sécurisé
├── hooks/
│   └── useSecurity.ts        # Hook React pour la sécurité
├── test/
│   ├── security.test.ts      # Tests des utilitaires
│   ├── api.test.ts           # Tests du service API
│   ├── hooks.test.ts         # Tests des hooks
│   └── components.test.tsx   # Tests des composants
└── types/
    └── test.d.ts             # Types pour les tests
```

### Flux de Sécurité
```
1. Entrée Utilisateur
   ↓
2. Validation Zod (Schémas)
   ↓
3. Sanitisation DOMPurify
   ↓
4. Rate Limiting Check
   ↓
5. Appel API Sécurisé
   ↓
6. Gestion d'Erreurs
   ↓
7. Feedback Utilisateur
```

---

## 🔧 Implémentation Détaillée

### 1. Utilitaires de Sécurité (`src/utils/security.ts`)

#### Schémas de Validation Zod
```typescript
import { z } from 'zod'

// Schéma email avec validation stricte
export const emailSchema = z
  .string()
  .email('Adresse email invalide')
  .min(1, 'Email requis')
  .max(255, 'Email trop long')
  .transform(val => val.toLowerCase().trim())

// Schéma mot de passe avec complexité requise
export const passwordSchema = z
  .string()
  .min(8, 'Minimum 8 caractères')
  .regex(/^(?=.*[a-z])/, 'Au moins une minuscule')
  .regex(/^(?=.*[A-Z])/, 'Au moins une majuscule')
  .regex(/^(?=.*\d)/, 'Au moins un chiffre')
  .regex(/^(?=.*[@$!%*?&])/, 'Au moins un caractère spécial')

// Schéma nom avec caractères autorisés
export const nameSchema = z
  .string()
  .min(1, 'Nom requis')
  .max(50, 'Nom trop long')
  .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Caractères non autorisés')

// Schéma newsletter
export const newsletterFormSchema = z.object({
  email: emailSchema
})
```

#### Fonctions de Sanitisation
```typescript
import DOMPurify from 'dompurify'

// Sanitisation de texte simple
export const sanitizeString = (input: string): string => {
  if (!input) return ''
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  })
}

// Sanitisation HTML avec configuration
export const sanitizeHTML = (input: string, config?: any): string => {
  if (!input) return ''
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href'],
    ...config
  })
}

// Validation d'URL avec liste blanche
export const validateURL = (url: string): boolean => {
  const allowedDomains = [
    'localhost',
    '127.0.0.1',
    'espacecomedie.fr',
    'scene-de-rire-prototype.onrender.com'
  ]
  
  try {
    const urlObj = new URL(url)
    return allowedDomains.some(domain => urlObj.hostname.includes(domain))
  } catch {
    return false
  }
}
```

#### Gestion des Tokens CSRF
```typescript
import Cookies from 'js-cookie'

// Génération de token CSRF
export const generateCSRFToken = (): string => {
  const token = crypto.randomUUID()
  Cookies.set('csrf-token', token, {
    secure: true,
    sameSite: 'strict',
    expires: 1 // 1 jour
  })
  return token
}

// Validation de token CSRF
export const validateCSRFToken = (token: string): boolean => {
  const storedToken = Cookies.get('csrf-token')
  return token === storedToken
}

// Récupération du token actuel
export const getCSRFToken = (): string | undefined => {
  return Cookies.get('csrf-token')
}
```

#### Rate Limiting
```typescript
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export const checkRateLimitForAction = (
  action: string,
  maxAttempts: number,
  windowMs: number
): boolean => {
  const now = Date.now()
  const key = `rate_limit_${action}`
  
  // Récupérer l'entrée existante
  const entry = rateLimitStore.get(key)
  
  if (!entry || now > entry.resetTime) {
    // Créer une nouvelle entrée
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    return true
  }
  
  if (entry.count >= maxAttempts) {
    return false
  }
  
  // Incrémenter le compteur
  entry.count++
  return true
}

// Nettoyage automatique des entrées expirées
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Nettoyage toutes les minutes
```

### 2. Service API Sécurisé (`src/services/secureApi.ts`)

#### Configuration des En-têtes
```typescript
export const addSecurityHeaders = (headers: Record<string, string> = {}): Record<string, string> => {
  const csrfToken = getCSRFToken()
  
  return {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
    ...headers
  }
}
```

#### Méthodes API Sécurisées
```typescript
export const secureApi = {
  // Inscription newsletter
  subscribeNewsletter: async (email: string) => {
    const sanitizedEmail = sanitizeString(email)
    const validatedData = newsletterFormSchema.parse({ email: sanitizedEmail })
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/newsletter`, {
      method: 'POST',
      headers: addSecurityHeaders(),
      body: JSON.stringify(validatedData)
    })
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  },

  // Connexion utilisateur
  login: async (email: string, password: string) => {
    const sanitizedEmail = sanitizeString(email)
    const validatedData = loginSchema.parse({ 
      email: sanitizedEmail, 
      password 
    })
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: addSecurityHeaders(),
      body: JSON.stringify(validatedData)
    })
    
    if (!response.ok) {
      throw new Error(`Erreur de connexion: ${response.statusText}`)
    }
    
    return response.json()
  },

  // Autres méthodes API...
}
```

### 3. Hook de Sécurité (`src/hooks/useSecurity.ts`)

#### État et Gestion des Erreurs
```typescript
interface SecurityError {
  field: string
  message: string
  timestamp: number
}

export const useSecurity = () => {
  const [errors, setErrors] = useState<SecurityError[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [resetTime, setResetTime] = useState<Date | null>(null)

  // Nettoyage automatique des erreurs
  useEffect(() => {
    const timer = setTimeout(() => {
      setErrors(prev => prev.filter(error => 
        Date.now() - error.timestamp < 5000
      ))
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [errors])

  // Fonctions de validation
  const validateEmailField = (value: string, field: string): boolean => {
    try {
      emailSchema.parse(value)
      clearFieldError(field)
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        addFieldError(field, error.errors[0].message)
      }
      return false
    }
  }

  const validatePasswordField = (value: string, field: string): boolean => {
    try {
      passwordSchema.parse(value)
      clearFieldError(field)
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        addFieldError(field, error.errors[0].message)
      }
      return false
    }
  }

  // Gestion des erreurs
  const addFieldError = (field: string, message: string) => {
    setErrors(prev => [
      ...prev.filter(e => e.field !== field),
      { field, message, timestamp: Date.now() }
    ])
  }

  const clearFieldError = (field: string) => {
    setErrors(prev => prev.filter(e => e.field !== field))
  }

  const clearErrors = () => setErrors([])

  // Rate limiting
  const checkRateLimitForAction = (action: string, maxAttempts: number, windowMs: number): boolean => {
    const isAllowed = checkRateLimitForAction(action, maxAttempts, windowMs)
    
    if (!isAllowed) {
      setIsRateLimited(true)
      setResetTime(new Date(Date.now() + windowMs))
    }
    
    return isAllowed
  }

  // Sanitisation
  const sanitizeInput = (input: string): string => {
    return sanitizeString(input)
  }

  // Gestion d'erreurs de sécurité
  const handleSecurityError = (error: any) => {
    console.error('Security Error:', error)
    
    // Logging sécurisé (en production, envoyer à un service de monitoring)
    if (import.meta.env.PROD) {
      // Envoyer à un service de monitoring
    }
  }

  return {
    // Validation
    validateEmailField,
    validatePasswordField,
    validateNameField: (value: string, field: string) => {
      try {
        nameSchema.parse(value)
        clearFieldError(field)
        return true
      } catch (error) {
        if (error instanceof z.ZodError) {
          addFieldError(field, error.errors[0].message)
        }
        return false
      }
    },
    
    // Rate limiting
    checkRateLimitForAction,
    isRateLimited,
    resetTime,
    
    // Sanitisation
    sanitizeInput,
    
    // Gestion d'erreurs
    handleSecurityError,
    clearSecurityError: () => setErrors([]),
    
    // État du formulaire
    isSubmitting,
    setIsSubmitting,
    errors,
    clearErrors
  }
}
```

---

## 🧪 Tests de Sécurité

### Tests des Utilitaires (`src/test/security.test.ts`)

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { 
  sanitizeString, 
  validateURL, 
  generateCSRFToken,
  validateCSRFToken,
  checkRateLimitForAction 
} from '@/utils/security'

describe('Security Utils', () => {
  beforeEach(() => {
    // Reset rate limiting
    localStorage.clear()
  })

  describe('XSS Protection', () => {
    it('should sanitize script tags', () => {
      const malicious = '<script>alert("xss")</script>Hello'
      const sanitized = sanitizeString(malicious)
      expect(sanitized).toBe('Hello')
    })

    it('should sanitize event handlers', () => {
      const malicious = '<img src="x" onerror="alert(\'xss\')">Image'
      const sanitized = sanitizeString(malicious)
      expect(sanitized).toBe('Image')
    })

    it('should sanitize javascript: URLs', () => {
      const malicious = 'javascript:alert("xss")'
      const sanitized = sanitizeString(malicious)
      expect(sanitized).toBe('')
    })
  })

  describe('URL Validation', () => {
    it('should allow valid domains', () => {
      expect(validateURL('https://espacecomedie.fr')).toBe(true)
      expect(validateURL('http://localhost:3000')).toBe(true)
    })

    it('should block malicious domains', () => {
      expect(validateURL('https://malicious-site.com')).toBe(false)
      expect(validateURL('javascript:alert("xss")')).toBe(false)
    })
  })

  describe('CSRF Protection', () => {
    it('should generate unique tokens', () => {
      const token1 = generateCSRFToken()
      const token2 = generateCSRFToken()
      expect(token1).not.toBe(token2)
    })

    it('should validate correct tokens', () => {
      const token = generateCSRFToken()
      expect(validateCSRFToken(token)).toBe(true)
    })

    it('should reject invalid tokens', () => {
      expect(validateCSRFToken('invalid-token')).toBe(false)
    })
  })

  describe('Rate Limiting', () => {
    it('should allow requests within limits', () => {
      expect(checkRateLimitForAction('test', 5, 60000)).toBe(true)
      expect(checkRateLimitForAction('test', 5, 60000)).toBe(true)
      expect(checkRateLimitForAction('test', 5, 60000)).toBe(true)
    })

    it('should block requests over limits', () => {
      // Premières tentatives autorisées
      for (let i = 0; i < 3; i++) {
        expect(checkRateLimitForAction('test', 3, 60000)).toBe(true)
      }
      
      // Tentative bloquée
      expect(checkRateLimitForAction('test', 3, 60000)).toBe(false)
    })
  })
})
```

### Tests des Composants (`src/test/components.test.tsx`)

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Newsletter from '@/components/Newsletter'

describe('Newsletter Component Security', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should validate email format', async () => {
    render(<Newsletter />)
    
    const emailInput = screen.getByPlaceholderText('Votre adresse email')
    const submitButton = screen.getByText('S\'abonner')
    
    // Email invalide
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Email invalide/)).toBeInTheDocument()
    })
  })

  it('should sanitize malicious input', async () => {
    render(<Newsletter />)
    
    const emailInput = screen.getByPlaceholderText('Votre adresse email')
    const submitButton = screen.getByText('S\'abonner')
    
    // Input malveillant
    fireEvent.change(emailInput, { 
      target: { value: '<script>alert("xss")</script>test@example.com' } 
    })
    fireEvent.click(submitButton)
    
    // Le composant devrait traiter l'email normalement
    await waitFor(() => {
      expect(emailInput).toHaveValue('test@example.com')
    })
  })

  it('should handle rate limiting', async () => {
    render(<Newsletter />)
    
    const emailInput = screen.getByPlaceholderText('Votre adresse email')
    const submitButton = screen.getByText('S\'abonner')
    
    // Simuler plusieurs soumissions rapides
    for (let i = 0; i < 5; i++) {
      fireEvent.change(emailInput, { target: { value: `test${i}@example.com` } })
      fireEvent.click(submitButton)
    }
    
    // Le composant devrait gérer le rate limiting
    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    })
  })
})
```

---

## 🔧 Configuration et Déploiement

### Variables d'Environnement
```env
# Sécurité
VITE_CSRF_ENABLED=true
VITE_RATE_LIMIT_ENABLED=true
VITE_XSS_PROTECTION_ENABLED=true

# API
VITE_API_URL=https://api.espacecomedie.fr

# Monitoring
VITE_SECURITY_LOGGING_ENABLED=true
VITE_ERROR_REPORTING_URL=https://errors.espacecomedie.fr
```

### Configuration TypeScript
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Configuration Vitest
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts'
      ]
    }
  }
})
```

---

## 📊 Monitoring et Logging

### Logging des Erreurs de Sécurité
```typescript
// src/utils/security.ts
export const logSecurityEvent = (event: string, details: any) => {
  if (import.meta.env.PROD) {
    // En production, envoyer à un service de monitoring
    fetch('/api/security/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        details,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    }).catch(console.error)
  } else {
    // En développement, log local
    console.warn('Security Event:', event, details)
  }
}
```

### Métriques de Sécurité
```typescript
// Métriques à collecter
interface SecurityMetrics {
  xssAttempts: number
  csrfViolations: number
  rateLimitViolations: number
  failedLogins: number
  suspiciousActivity: number
}
```

---

## 🚀 Extension du Système

### Ajout de Nouvelles Validations
```typescript
// src/utils/security.ts
export const phoneSchema = z
  .string()
  .regex(/^(\+33|0)[1-9](\d{8})$/, 'Format téléphone français invalide')

export const validatePhoneField = (value: string, field: string): boolean => {
  try {
    phoneSchema.parse(value)
    return true
  } catch {
    return false
  }
}
```

### Ajout de Nouvelles Protections
```typescript
// Protection contre les attaques par injection
export const sanitizeSQLInput = (input: string): string => {
  return input.replace(/['";\\]/g, '')
}

// Protection contre les attaques par timing
export const constantTimeCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return result === 0
}
```

---

## 📚 Ressources et Références

### Documentation Officielle
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security](https://react.dev/learn/security)
- [Zod Documentation](https://zod.dev/)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)

### Outils de Test
- [OWASP ZAP](https://owasp.org/www-project-zap/) - Scanner de vulnérabilités
- [Burp Suite](https://portswigger.net/burp) - Proxy de sécurité
- [Postman](https://www.postman.com/) - Tests d'API

### Bonnes Pratiques
- Validation côté client ET serveur
- Sanitisation de toutes les entrées
- Rate limiting par action
- Logging des événements de sécurité
- Tests automatisés réguliers

---

**Ce guide d'implémentation doit être maintenu à jour avec les nouvelles fonctionnalités et bonnes pratiques de sécurité.** 🛡️
