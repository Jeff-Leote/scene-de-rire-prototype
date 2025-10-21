// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Toaster as Sonner } from '@/components/ui/sonner';

// Pages - Import dynamique pour optimiser le chargement
import { lazy, Suspense } from 'react';

// Page d'accueil - chargement prioritaire
import Index from './pages/Index';

// Autres pages - chargement paresseux
const Shows = lazy(() => import('./pages/Shows'));
const SpectacleDetail = lazy(() => import('./pages/SpectacleDetail'));
const Venue = lazy(() => import('./pages/Venue'));
const Artists = lazy(() => import('./pages/Artists'));
const Cours = lazy(() => import('./pages/Cours'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Contact = lazy(() => import('./pages/Contact'));
const Unsubscribe = lazy(() => import('./pages/Unsubscribe'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const Sponsorise = lazy(() => import('./pages/Sponsorise'));
import { useAuth } from './contexts/AuthContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, CartProvider } from './contexts/AuthContext';
import { CSRFProvider } from './contexts/CSRFContext';
import { MaintenanceProvider } from './contexts/MaintenanceContext';
import AutoLogout from './components/AutoLogout';
import { usePreloadData } from './hooks/usePreloadData';

// 🚀 Configuration React Query ultra-optimisée pour la production
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,
      retry: 5,
      retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 5000),
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      gcTime: 30 * 60 * 1000,
      placeholderData: (previousData) => previousData,
      ...(process.env.NODE_ENV === 'development' && {
        onSuccess: (data, query) => {
          console.log(`✅ Query réussie: ${query.queryKey.join(' -> ')}`);
        },
        onError: (error, query) => {
          console.error(`❌ Query échouée: ${query.queryKey.join(' -> ')}`, error);
        }
      })
    },
    mutations: {
      retry: 3,
      retryDelay: 1000,
      onSuccess: () => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Mutation réussie`);
        }
      }
    }
  }
});

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }>{
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    console.error('Erreur UI non interceptée:', error);
    console.error('Stack trace:', errorInfo.componentStack);
    console.error('Error Info:', errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-8 text-center">
          <div>
            <div className="text-2xl font-bold mb-2">Une erreur est survenue</div>
            <div className="text-gray-400 mb-6">Veuillez actualiser la page. Si le problème persiste, réessayez plus tard.</div>
            <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => window.location.reload()}>Actualiser</button>
          </div>
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

const AppContent = () => {
  usePreloadData();
  const [maintenance, setMaintenance] = React.useState(false);
  const { user } = useAuth();

  React.useEffect(() => {
    const check = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_URL}/api/settings/maintenance`, { credentials: 'include' });
        const data = await res.json();
        setMaintenance(Boolean(data?.maintenance_enabled));
      } catch {}
    };
    check();
  }, []);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<div className="loading"><div className="spinner"></div></div>}>
        <Routes>
          {maintenance && process.env.NODE_ENV === 'production' && (!user || user.role !== 'admin') ? (
            <>
              <Route path="*" element={<Maintenance />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Index />} />
              <Route path="/spectacles" element={<Shows />} />
              <Route path="/spectacles/:id" element={<SpectacleDetail />} />
              <Route path="/le-lieu" element={<Venue />} />
              <Route path="/cours" element={<Cours />} />
              <Route path="/artistes" element={<Artists />} />
              <Route path="/connexion" element={<Login />} />
              <Route path="/inscription" element={<Register />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute requireAuth requireAdmin>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/contact" element={<Contact />} />
              <Route path="/unsubscribe" element={<Unsubscribe />} />
              <Route path="/sponsorise/:slug" element={<Sponsorise />} />
              <Route path="*" element={<NotFound />} />
            </>
          )}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

const App = () => (
  <AppErrorBoundary>
    <AuthProvider>
      <CartProvider>
        <CSRFProvider>
          <MaintenanceProvider>
            <AutoLogout/>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <Sonner />
                <AppContent />
              </TooltipProvider>
            </QueryClientProvider>
          </MaintenanceProvider>
        </CSRFProvider>
      </CartProvider>
    </AuthProvider>
  </AppErrorBoundary>
);

export default App;
