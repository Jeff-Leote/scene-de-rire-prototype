// src/App.tsx
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, CartProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AutoLogout from "./components/AutoLogout";
import Index from "./pages/Index";
import Shows from "./pages/Shows";
import Venue from "./pages/Venue";
import Reservation from "./pages/Reservation";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import MyAccount from "./pages/MyAccount";
import Dashboard from "./components/Dashboard";
import SpectacleDetail from "./pages/SpectacleDetail";
import Artists from "./pages/Artists";
import ReservationInformations from "./pages/ReservationInformations";
import ReservationPaiement from "./pages/ReservationPaiement";
import PaymentStatus from "./pages/PaymentStatus";
import ValidateTicket from "./pages/ValidateTicket";


const queryClient = new QueryClient();

// Petit Error Boundary pour éviter les écrans blancs
import React from 'react';

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }>{
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Erreur UI non interceptée:', error);
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
  <AuthProvider>
    <CartProvider>
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </CartProvider>
  </AuthProvider>
);

export default App;
