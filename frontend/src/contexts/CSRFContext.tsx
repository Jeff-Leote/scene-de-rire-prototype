import React, { createContext, useContext, useEffect, useState } from 'react';
import { useCSRF } from '@/hooks/useCSRF';

interface CSRFContextType {
  csrfToken: string | null;
  isInitialized: boolean;
  refreshToken: () => string;
}

const CSRFContext = createContext<CSRFContextType | undefined>(undefined);

export const CSRFProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { csrfToken, isInitialized, refreshToken } = useCSRF();

  // Initialiser le token CSRF au démarrage de l'application
  useEffect(() => {
    if (isInitialized && csrfToken) {
      console.log('🔒 Token CSRF initialisé:', csrfToken.substring(0, 10) + '...');
    }
  }, [isInitialized, csrfToken]);

  const value: CSRFContextType = {
    csrfToken,
    isInitialized,
    refreshToken
  };

  return (
    <CSRFContext.Provider value={value}>
      {children}
    </CSRFContext.Provider>
  );
};

export const useCSRFContext = (): CSRFContextType => {
  const context = useContext(CSRFContext);
  if (context === undefined) {
    throw new Error('useCSRFContext doit être utilisé dans un CSRFProvider');
  }
  return context;
};
