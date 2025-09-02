// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Toaster as Sonner } from '@/components/ui/sonner';

// Pages
import Index from './pages/Index';
import Shows from './pages/Shows';
import SpectacleDetail from './pages/SpectacleDetail';
import Venue from './pages/Venue';
import Reservation from './pages/Reservation';
import ReservationInformations from './pages/ReservationInformations';
import ReservationPaiement from './pages/ReservationPaiement';
import PaymentStatus from './pages/PaymentStatus';
import ValidateTicket from './pages/ValidateTicket';
import Artists from './pages/Artists';
import Login from './pages/Login';
import Register from './pages/Register';
import MyAccount from './pages/MyAccount';
import Dashboard from './components/Dashboard';
import Contact from './pages/Contact';
import Unsubscribe from './pages/Unsubscribe';
import NotFound from './pages/NotFound';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, CartProvider } from './contexts/AuthContext';
import { CSRFProvider } from './contexts/CSRFContext';
import AutoLogout from './components/AutoLogout';

// Configuration React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Petit Error Boundary pour éviter les écrans blancs

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }>{
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    // Log l'erreur pour le debugging
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
            <button className="bg-yellow-400 text-black px-4 py-2 rounded" onClick={() => window.location.reload()}>Actualiser</button>
          </div>
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

const App = () => (
  <AppErrorBoundary>
    <AuthProvider>
      <CartProvider>
        <CSRFProvider>
          <AutoLogout/>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Sonner />
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/spectacles" element={<Shows />} />
                <Route path="/spectacles/:id" element={<SpectacleDetail />} />
                <Route path="/le-lieu" element={<Venue />} />
                <Route path="/reservation" element={<Reservation />} />
                <Route path="/reservation/informations" element={<ReservationInformations />} />
                <Route path="/reservation/paiement" element={<ReservationPaiement />} />
                <Route path="/payment-status" element={<PaymentStatus />} />
                <Route path="/validate-ticket/:reservationId" element={<ValidateTicket />} />

                <Route path="/artistes" element={<Artists />} />
                <Route 
                  path="/connexion" 
                  element={
                    <ProtectedRoute>
                      <Login />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/inscription" 
                  element={
                    <ProtectedRoute>
                      <Register />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/mon-compte" 
                  element={
                    <ProtectedRoute requireAuth>
                      <MyAccount />
                    </ProtectedRoute>
                  } 
                />
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
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
        </CSRFProvider>
      </CartProvider>
    </AuthProvider>
  </AppErrorBoundary>
);

export default App;
