import { useState, useEffect, useCallback } from 'react';
import { generateCSRFToken, setCSRFToken, getCSRFToken, validateCSRFToken } from '@/utils/security';

/**
 * Hook global pour la gestion des tokens CSRF
 * Génère et maintient automatiquement un token CSRF valide
 */
export const useCSRF = () => {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Générer un nouveau token CSRF
  const generateToken = useCallback(() => {
    const token = generateCSRFToken();
    setCSRFToken(token);
    setCsrfToken(token);
    return token;
  }, []);

  // Récupérer le token CSRF actuel
  const getToken = useCallback(() => {
    let token = getCSRFToken();
    
    // Si pas de token ou token expiré, en générer un nouveau
    if (!token || !validateCSRFToken(token)) {
      token = generateToken();
    }
    
    setCsrfToken(token);
    return token;
  }, [generateToken]);

  // Valider un token CSRF
  const validateToken = useCallback((token: string): boolean => {
    return validateCSRFToken(token);
  }, []);

  // Rafraîchir le token (utile pour les sessions longues)
  const refreshToken = useCallback(() => {
    const newToken = generateToken();
    return newToken;
  }, [generateToken]);

  // Initialiser le token au montage du composant
  useEffect(() => {
    if (!isInitialized) {
      getToken();
      setIsInitialized(true);
    }
  }, [getToken, isInitialized]);

  // Rafraîchir le token toutes les heures pour la sécurité
  useEffect(() => {
    if (isInitialized) {
      const interval = setInterval(() => {
        refreshToken();
      }, 60 * 60 * 1000); // 1 heure

      return () => clearInterval(interval);
    }
  }, [isInitialized, refreshToken]);

  return {
    csrfToken,
    getToken,
    validateToken,
    refreshToken,
    isInitialized
  };
};
