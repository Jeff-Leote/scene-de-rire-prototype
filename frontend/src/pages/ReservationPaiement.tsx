import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { createReservationCheckout } from "../services/reservation";
import { useAuth } from "../contexts/AuthContext";
import { buildImgSrc, onImgErrorSwap } from "@/utils/image";

const ReservationPaiement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const { cart = [], nbBillets = {}, prenom, nom, email, appliedPromoCode } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Protection de la page
  if (!isAuthenticated) {
    navigate("/connexion");
    return null;
  }

  if (!cart.length) {
    navigate("/reservation");
    return null;
  }

  const handlePayer = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await createReservationCheckout({
        spectacles: cart.map(item => ({
          id: item.id,
          billets: nbBillets[item.id] || 1,
        })),
        prenom,
        nom,
        email,
        promoCode: appliedPromoCode,
      }, token);
      
      if (res && res.url) {
        // Rediriger vers Stripe
        window.location.href = res.url;
      } else {
        setError("Erreur lors de la création de la session de paiement.");
      }
    } catch (e) {
      console.error("Erreur checkout:", e);
      setError("Erreur lors de la création de la session de paiement.");
    } finally {
      setLoading(false);
    }
  };

  const totalPanier = cart.reduce((sum, item) => sum + (item.prix * (nbBillets[item.id] || 1)), 0);

  // Calcul de la réduction appliquée
  const calculateDiscount = () => {
    if (!appliedPromoCode) return 0;

    switch (appliedPromoCode.type) {
      case 'percentage':
        return (totalPanier * appliedPromoCode.value) / 100;
      case 'fixed':
        return Math.min(appliedPromoCode.value, totalPanier);
      case 'free_ticket': {
        const cheapestTicket = Math.min(...cart.map(item => item.prix));
        return Math.min(cheapestTicket, totalPanier);
      }
      default:
        return 0;
    }
  };

  const discount = calculateDiscount();
  const totalFinal = totalPanier - discount;

  const formatDateFr = (value: string) => {
    try {
      const date = value?.includes('T') ? new Date(value) : new Date(`${value}T00:00:00`);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return value;
    }
  };

  const formatTimeFr = (value: string) => {
    if (!value) return '';
    try {
      if (value.includes('T')) {
        const d = new Date(value);
        return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      }
      const m = value.match(/^\d{2}:\d{2}/);
      return m ? m[0] : value;
    } catch {
      return value;
    }
  };

  const billetLabel = (count: number) => (count > 1 ? 'billets' : 'billet');

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header activeItem="Réservation" />
      <main className="flex-1">
        <div className="container mx-auto px-4 pt-24 pb-16">
          {/* Barre d'étapes */}
          <div id="progress-bar" className="mb-8">
            <div className="flex justify-between">
              <div className="w-1/3 text-center">
                <div className="relative">
                  <div className="w-10 h-10 mx-auto bg-yellow-400 rounded-full text-black flex items-center justify-center ring-2 ring-gray-900 shadow-lg">
                    <i className="fa-solid fa-calendar-days"></i>
                  </div>
                  <div className="text-xs mt-2">Sélection</div>
                </div>
              </div>
              <div className="w-1/3 text-center">
                <div className="relative">
                  <div className="w-10 h-10 mx-auto bg-yellow-400 rounded-full text-black flex items-center justify-center ring-2 ring-gray-900 shadow-lg">
                    <i className="fa-solid fa-user"></i>
                  </div>
                  <div className="text-xs mt-2">Informations</div>
                </div>
              </div>
              <div className="w-1/3 text-center">
                <div className="relative">
                  <div className="w-10 h-10 mx-auto bg-yellow-400 rounded-full text-black flex items-center justify-center ring-2 ring-gray-900 shadow-lg">
                    <i className="fa-solid fa-credit-card"></i>
                  </div>
                  <div className="text-xs mt-2">Paiement</div>
                </div>
              </div>
            </div>
            <div className="relative mt-4">
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-800 rounded"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded"></div>
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="max-w-full mx-auto mb-8">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-8 w-full relative ring-1 ring-gray-800 shadow-lg" style={{ paddingTop: '3.5rem' }}>
              {/* Flèche retour intégrée dans la card */}
              <button
                className="absolute top-4 left-4 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full text-lg transition flex items-center z-10"
                onClick={() => navigate('/reservation/informations', { state: { cart, nbBillets, prenom, nom, email } })}
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <h2 className="text-xl font-bold text-yellow-400 mb-2 pl-10">Récapitulatif</h2>
              {cart.map(item => (
                <div key={item.id} className="flex items-center mb-4">
                  <div className="mr-4 w-20 h-28 overflow-hidden rounded-md">
                    <img 
                      className="w-full h-full object-cover" 
                      src={buildImgSrc('spectacles', item.img)} 
                      alt={item.title}
                      onError={onImgErrorSwap}
                    />
                  </div>
                  <div>
                    <div className="font-bold text-lg">{item.title}</div>
                    <div className="text-gray-300 text-sm mb-1">{formatDateFr(item.date_spectacle)} à {formatTimeFr(item.heure_spectacle)}</div>
                    <div className="text-gray-400 text-sm mb-1">Lieu : {item.lieu}</div>
                    <div className="text-yellow-400 font-bold text-lg">{item.prix} € × {nbBillets[item.id] || 1} {billetLabel(nbBillets[item.id] || 1)} = {item.prix * (nbBillets[item.id] || 1)} €</div>
                  </div>
                </div>
              ))}
              {appliedPromoCode && (
                <div className="bg-green-900 border border-green-600 rounded-lg p-3 mb-4">
                  <div className="text-green-400 font-semibold mb-1">Code promo appliqué</div>
                  <div className="text-sm text-green-300">{appliedPromoCode.code}</div>
                  <div className="text-xs text-green-400">{appliedPromoCode.description}</div>
                </div>
              )}
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <div>Sous-total</div>
                  <div>{totalPanier} €</div>
                </div>
                {appliedPromoCode && (
                  <div className="flex justify-between items-center text-green-400">
                    <div>Réduction {appliedPromoCode.type === 'percentage' ? `(${appliedPromoCode.value}%)` : ''}</div>
                    <div>-{discount.toFixed(2)} €</div>
                  </div>
                )}
                <div className="flex justify-between items-center font-bold text-lg border-t border-gray-700 pt-2">
                  <div>Total</div>
                  <div className="text-yellow-400">{totalFinal.toFixed(2)} €</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton Payer */}
          <div className="text-center mt-8">
            <button
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-full text-lg transition shadow-lg"
              onClick={handlePayer}
              disabled={loading}
            >
              {loading ? "Redirection..." : "Payer"}
              <i className="fa-solid fa-arrow-right ml-2"></i>
            </button>
            {error && <div className="text-red-500 mt-2">{error}</div>}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReservationPaiement; 