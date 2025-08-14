// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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

const App = () => (
  <AuthProvider>
    <AutoLogout/>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
  </AuthProvider>
);

export default App;
