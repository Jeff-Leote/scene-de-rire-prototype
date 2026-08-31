import { useState, useCallback, useEffect } from 'react';
import {
  validateEmail,
  validatePassword,
  validateName,
  checkRateLimit,
  generateCSRFToken,
  setCSRFToken,
  getCSRFToken,
  validateCSRFToken,
  sanitizeString,
  sanitizeHTML,
} from '@/utils/security';

// Types pour les erreurs de validation
interface ValidationError {
  field: string;
  message: string;
}

// Types pour les résultats de validation
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  sanitizedData?: any;
}

/**
 * Hook pour gérer la sécurité des formulaires
 */
export function useFormSecurity() {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation d'un champ email
  const validateEmailField = useCallback((email: string, fieldName: string = 'email'): boolean => {
    const result = validateEmail(email);
    if (!result.isValid) {
      setErrors((prev) => [
        ...prev.filter((e) => e.field !== fieldName),
        {
          field: fieldName,
          message: result.error || 'Email invalide',
        },
      ]);
      return false;
    }
    setErrors((prev) => prev.filter((e) => e.field !== fieldName));
    return true;
  }, []);

  // Validation d'un champ mot de passe
  const validatePasswordField = useCallback((password: string, fieldName: string = 'password'): boolean => {
    const result = validatePassword(password);
    if (!result.isValid) {
      setErrors((prev) => [
        ...prev.filter((e) => e.field !== fieldName),
        {
          field: fieldName,
          message: result.error || 'Mot de passe invalide',
        },
      ]);
      return false;
    }
    setErrors((prev) => prev.filter((e) => e.field !== fieldName));
    return true;
  }, []);

  // Validation d'un champ nom
  const validateNameField = useCallback((name: string, fieldName: string): boolean => {
    const result = validateName(name);
    if (!result.isValid) {
      setErrors((prev) => [
        ...prev.filter((e) => e.field !== fieldName),
        {
          field: fieldName,
          message: result.error || 'Nom invalide',
        },
      ]);
      return false;
    }
    setErrors((prev) => prev.filter((e) => e.field !== fieldName));
    return true;
  }, []);

  // Validation complète d'un formulaire
  const validateForm = useCallback(
    (data: Record<string, any>, schema: Record<string, (value: any, field: string) => boolean>): ValidationResult => {
      const newErrors: ValidationError[] = [];
      let isValid = true;

      for (const [field, validator] of Object.entries(schema)) {
        if (!validator(data[field], field)) {
          isValid = false;
        }
      }

      return {
        isValid,
        errors: newErrors,
        sanitizedData: isValid ? data : undefined,
      };
    },
    []
  );

  // Nettoyage des erreurs
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Nettoyage d'une erreur spécifique
  const clearError = useCallback((fieldName: string) => {
    setErrors((prev) => prev.filter((e) => e.field !== fieldName));
  }, []);

  return {
    errors,
    isSubmitting,
    setIsSubmitting,
    validateEmailField,
    validatePasswordField,
    validateNameField,
    validateForm,
    clearErrors,
    clearError,
  };
}

/**
 * Hook pour gérer le rate limiting
 */
export function useRateLimit() {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [resetTime, setResetTime] = useState<Date | null>(null);

  const checkRateLimitForAction = useCallback((action: string, maxAttempts: number, windowMs: number): boolean => {
    const isAllowed = checkRateLimit(action, maxAttempts, windowMs);
    setIsRateLimited(!isAllowed);

    if (!isAllowed) {
      const now = Date.now();
      const reset = new Date(now + windowMs);
      setResetTime(reset);
      setRemainingAttempts(0);
    } else {
      setRemainingAttempts(maxAttempts - 1); // Approximation
      setResetTime(null);
    }

    return isAllowed;
  }, []);

  const resetRateLimit = useCallback(() => {
    setIsRateLimited(false);
    setRemainingAttempts(null);
    setResetTime(null);
  }, []);

  return {
    isRateLimited,
    remainingAttempts,
    resetTime,
    checkRateLimitForAction,
    resetRateLimit,
  };
}

/**
 * Hook pour gérer les tokens CSRF
 */
export function useCSRF() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // Générer et stocker un nouveau token CSRF
  const generateToken = useCallback(() => {
    const token = generateCSRFToken();
    setCSRFToken(token);
    setCsrfToken(token);
    return token;
  }, []);

  // Récupérer le token CSRF actuel
  const getToken = useCallback(() => {
    const token = getCSRFToken();
    setCsrfToken(token);
    return token;
  }, []);

  // Valider un token CSRF
  const validateToken = useCallback((token: string): boolean => {
    return validateCSRFToken(token);
  }, []);

  // Initialiser le token au montage du composant
  useEffect(() => {
    getToken();
  }, [getToken]);

  return {
    csrfToken,
    generateToken,
    getToken,
    validateToken,
  };
}

/**
 * Hook pour la sanitisation des données
 */
export function useSanitization() {
  const sanitizeInput = useCallback((input: string): string => {
    return sanitizeString(input);
  }, []);

  const sanitizeHTMLContent = useCallback((html: string): string => {
    return sanitizeHTML(html);
  }, []);

  const sanitizeObject = useCallback(<T extends Record<string, any>>(obj: T): T => {
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
  }, []);

  return {
    sanitizeInput,
    sanitizeHTMLContent,
    sanitizeObject,
  };
}

/**
 * Hook pour la gestion des erreurs de sécurité
 */
export function useSecurityError() {
  const [securityError, setSecurityError] = useState<string | null>(null);

  const handleSecurityError = useCallback((error: Error | string) => {
    const message = typeof error === 'string' ? error : error.message;
    setSecurityError(message);

    // Auto-nettoyage après 5 secondes
    setTimeout(() => {
      setSecurityError(null);
    }, 5000);
  }, []);

  const clearSecurityError = useCallback(() => {
    setSecurityError(null);
  }, []);

  return {
    securityError,
    handleSecurityError,
    clearSecurityError,
  };
}

/**
 * Hook combiné pour la sécurité
 */
export function useSecurity() {
  const formSecurity = useFormSecurity();
  const rateLimit = useRateLimit();
  const csrf = useCSRF();
  const sanitization = useSanitization();
  const securityError = useSecurityError();

  return {
    ...formSecurity,
    ...rateLimit,
    ...csrf,
    ...sanitization,
    ...securityError,
  };
}
