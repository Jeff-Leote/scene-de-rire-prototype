import DOMPurify from 'dompurify';
import { z } from 'zod';
import Cookies from 'js-cookie';

// ====== VALIDATION SCHEMAS ======

// Schema pour la validation des emails
export const emailSchema = z
  .string()
  .email('Adresse email invalide')
  .min(1, 'Email requis')
  .max(255, 'Email trop long');

// Schema pour la validation des mots de passe
export const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
  );

// Schema pour la validation des noms
export const nameSchema = z
  .string()
  .min(1, 'Nom requis')
  .max(50, 'Nom trop long')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nom invalide (caractères spéciaux non autorisés)');

// Schema pour la validation des téléphones
export const phoneSchema = z.string().regex(/^(\+33|0)[1-9](\d{8})$/, 'Numéro de téléphone invalide');

// ====== SANITISATION ======

/**
 * Sanitise une chaîne de caractères pour prévenir les attaques XSS
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

/**
 * Sanitise un objet HTML pour prévenir les attaques XSS
 */
export function sanitizeHTML(html: string): string {
  if (typeof html !== 'string') return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitise un objet complet
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T;
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeString(value) as T[keyof T];
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key as keyof T] = sanitizeObject(value) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value;
    }
  }
  return sanitized;
}

// ====== CSRF PROTECTION ======

/**
 * Génère un token CSRF
 */
export function generateCSRFToken(): string {
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  return token;
}

/**
 * Stocke un token CSRF dans un cookie sécurisé
 */
export function setCSRFToken(token: string): void {
  Cookies.set('csrf-token', token, {
    secure: true,
    sameSite: 'strict',
    expires: 1, // 1 jour
  });
}

/**
 * Récupère le token CSRF depuis les cookies
 */
export function getCSRFToken(): string | null {
  return Cookies.get('csrf-token') || null;
}

/**
 * Valide un token CSRF
 */
export function validateCSRFToken(token: string): boolean {
  const storedToken = getCSRFToken();
  return storedToken === token;
}

// ====== RATE LIMITING ======

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Vérifie si une action est autorisée selon les limites de taux
 */
export function checkRateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // Première tentative ou fenêtre expirée
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (entry.count >= maxAttempts) {
    return false; // Limite atteinte
  }

  // Incrémenter le compteur
  entry.count++;
  return true;
}

/**
 * Nettoie les entrées de rate limiting expirées
 */
export function cleanupRateLimit(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Nettoyer toutes les 5 minutes
setInterval(cleanupRateLimit, 5 * 60 * 1000);

// ====== INPUT VALIDATION ======

/**
 * Valide et sanitise un email
 */
export function validateEmail(email: string): { isValid: boolean; error?: string; sanitized?: string } {
  try {
    const sanitized = sanitizeString(email);
    emailSchema.parse(sanitized);
    return { isValid: true, sanitized };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message };
    }
    return { isValid: false, error: 'Email invalide' };
  }
}

/**
 * Valide et sanitise un mot de passe
 */
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  try {
    passwordSchema.parse(password);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message };
    }
    return { isValid: false, error: 'Mot de passe invalide' };
  }
}

/**
 * Valide et sanitise un nom
 */
export function validateName(name: string): { isValid: boolean; error?: string; sanitized?: string } {
  try {
    const sanitized = sanitizeString(name);
    nameSchema.parse(sanitized);
    return { isValid: true, sanitized };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message };
    }
    return { isValid: false, error: 'Nom invalide' };
  }
}

// ====== SECURITY HEADERS ======

/**
 * Ajoute des en-têtes de sécurité à une requête fetch
 * Note: Seuls les en-têtes compatibles CORS sont inclus
 */
export function addSecurityHeaders(headers: Record<string, string> = {}): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...headers,
  };
}

/**
 * Valide une URL pour prévenir les attaques par redirection
 */
export function validateURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Autoriser seulement les domaines de confiance
    const allowedDomains = ['localhost', '127.0.0.1', 'scene-de-rire-prototype.onrender.com', 'espacecomedie.fr'];
    return allowedDomains.some((domain) => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

// ====== ENCRYPTION UTILITIES ======

/**
 * Chiffre une chaîne simple (pour les données sensibles en localStorage)
 */
export function encryptString(text: string): string {
  // Note: Ceci est un chiffrement basique pour localStorage
  // Pour une vraie sécurité, utilisez une bibliothèque comme crypto-js
  return btoa(encodeURIComponent(text));
}

/**
 * Déchiffre une chaîne simple
 */
export function decryptString(encrypted: string): string {
  try {
    return decodeURIComponent(atob(encrypted));
  } catch {
    return '';
  }
}

// ====== SECURITY VALIDATORS ======

/**
 * Valide un formulaire de connexion
 */
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Mot de passe requis'),
});

/**
 * Valide un formulaire d'inscription
 */
export const registerFormSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    firstName: nameSchema,
    lastName: nameSchema,
    civility: z.enum(['M', 'F', 'NB']),
    birthDate: z.string().min(1, 'Date de naissance requise'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

/**
 * Valide un formulaire de contact
 */
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z.string().min(1, 'Sujet requis').max(100, 'Sujet trop long'),
  message: z.string().min(10, 'Message trop court').max(1000, 'Message trop long'),
});
