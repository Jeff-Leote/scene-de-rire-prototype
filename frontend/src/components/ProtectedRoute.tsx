import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRouteProps } from '@/services/types';

const ProtectedRoute = ({ children, requireAuth = false, requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Afficher un écran de chargement pendant l'initialisation de l'authentification
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si requireAuth est false (page de connexion/inscription) et l'utilisateur est connecté
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Si requireAuth est true (page protégée) et l'utilisateur n'est pas connecté
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/connexion" replace />;
  }

  // Si requireAdmin est true et l'utilisateur n'est pas admin
  if (requireAdmin && (!user || user.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 