import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/connexion' 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    console.log('🛡️ ProtectedRoute - isAuthenticated:', isAuthenticated);
    console.log('🛡️ ProtectedRoute - isLoading:', isLoading);
    
    if (!isLoading && !isAuthenticated && !isRedirecting) {
      console.log('🚫 Accès refusé, redirection vers:', redirectTo);
      setIsRedirecting(true);
      
      // Utiliser setTimeout pour s'assurer que la redirection se fait après le rendu
      const redirectTimer = setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 100);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo, isRedirecting]);

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si non authentifié, afficher un message de redirection
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Redirection vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  // Si authentifié, afficher le contenu
  return <>{children}</>;
};

export default ProtectedRoute; 