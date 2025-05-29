import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute = ({ children, requireAuth = false }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler un petit délai pour éviter le flash
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return null; // Ne rien afficher pendant le chargement
  }

  // Si requireAuth est false (page de connexion/inscription) et l'utilisateur est connecté
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Si requireAuth est true (page protégée) et l'utilisateur n'est pas connecté
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/connexion" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 