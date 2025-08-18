import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";

const ReservationInformations = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart = [], nbBillets = {}, appliedPromoCode } = location.state || {};
  const { user } = useAuth();

  const [prenom, setPrenom] = useState(user?.firstName || "");
  const [nom, setNom] = useState(user?.lastName || "");
  const [useAccountEmail, setUseAccountEmail] = useState(true);
  const [email, setEmail] = useState(user?.email || "");
  const [manualEmail, setManualEmail] = useState("");
  const [touched, setTouched] = useState(false);

  if (!cart.length) {
    // Si on accède à la page sans données, retour à la réservation
    navigate("/reservation");
    return null;
  }

  const emailToUse = useAccountEmail ? email : manualEmail;
  const isFormValid = prenom.trim() && nom.trim() && emailToUse.trim() && (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailToUse));
  const totalPanier = cart.reduce((sum, item) => sum + (item.prix * (nbBillets[item.id] || 1)), 0);

  // Calcul de la réduction appliquée
  const calculateDiscount = () => {
    if (!appliedPromoCode) return 0;

    switch (appliedPromoCode.type) {
      case 'percentage':
        return (totalPanier * appliedPromoCode.value) / 100;
      case 'fixed':
        return Math.min(appliedPromoCode.value, totalPanier);
      case 'free_ticket':
        const cheapestTicket = Math.min(...cart.map(item => item.prix));
        return Math.min(cheapestTicket, totalPanier);
      default:
        return 0;
    }
  };

  const discount = calculateDiscount();
  const totalFinal = totalPanier - discount;

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
                  <div className="w-10 h-10 mx-auto bg-yellow-400 rounded-full text-black flex items-center justify-center">
                    <i className="fa-solid fa-calendar-days"></i>
                  </div>
                  <div className="text-xs mt-2">Sélection</div>
                </div>
              </div>
              <div className="w-1/3 text-center">
                <div className="relative">
                  <div className="w-10 h-10 mx-auto bg-yellow-400 rounded-full text-black flex items-center justify-center">
                    <i className="fa-solid fa-user"></i>
                  </div>
                  <div className="text-xs mt-2">Informations</div>
                </div>
              </div>
              <div className="w-1/3 text-center">
                <div className="relative">
                  <div className="w-10 h-10 mx-auto bg-gray-700 rounded-full text-white flex items-center justify-center">
                    <i className="fa-solid fa-credit-card"></i>
                  </div>
                  <div className="text-xs mt-2 text-gray-400">Paiement</div>
                </div>
              </div>
            </div>
            <div className="relative mt-4">
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-700"></div>
              <div className="absolute top-0 left-0 w-2/3 h-1 bg-yellow-400"></div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="max-w-full mx-auto">
            <div className="bg-gray-900 rounded-lg p-8 w-full relative" style={{ paddingTop: '3.5rem' }}>
              {/* Flèche retour intégrée dans la card */}
              <button
                className="absolute top-4 left-4 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full text-lg transition flex items-center z-10"
                onClick={() => navigate('/reservation')}
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              {/* Récap du panier */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-yellow-400 mb-2 pl-10">Récapitulatif</h2>
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center mb-4">
                    <div className="mr-4 w-20 h-28 overflow-hidden rounded-md">
                      <img className="w-full h-full object-cover" src={item.img} alt={item.title} />
                    </div>
                    <div>
                      <div className="font-bold text-lg">{item.title}</div>
                      <div className="text-gray-300 text-sm mb-1">{item.date_spectacle} à {item.heure_spectacle}</div>
                      <div className="text-gray-400 text-sm mb-1">Lieu : {item.lieu}</div>
                      <div className="text-yellow-400 font-bold text-lg">{item.prix} € × {nbBillets[item.id] || 1} billets = {item.prix * (nbBillets[item.id] || 1)} €</div>
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

              {/* Formulaire infos */}
              <form className="space-y-6" onSubmit={e => {
                e.preventDefault();
                setTouched(true);
                if (!isFormValid) return;
                navigate("/reservation/paiement", {
                  state: {
                    cart,
                    nbBillets,
                    prenom,
                    nom,
                    email: emailToUse,
                    appliedPromoCode,
                  },
                });
              }}>
                <div>
                  <label className="block text-sm font-medium mb-1">Prénom</label>
                  <input
                    type="text"
                    className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                    value={prenom}
                    onChange={e => setPrenom(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nom</label>
                  <input
                    type="text"
                    className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                    value={nom}
                    onChange={e => setNom(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="use-account-email"
                      checked={useAccountEmail}
                      onChange={e => setUseAccountEmail(e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="use-account-email" className="text-sm select-none cursor-pointer">
                      Utiliser l'email de mon compte
                    </label>
                  </div>
                  {!useAccountEmail && (
                    <input
                      type="email"
                      className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                      value={manualEmail}
                      onChange={e => setManualEmail(e.target.value)}
                      required
                    />
                  )}
                </div>
                {touched && !isFormValid && (
                  <div className="text-red-500 text-sm">Veuillez remplir tous les champs correctement.</div>
                )}
                <div className="text-center mt-8">
                  <button
                    type="submit"
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-full text-lg transition"
                    disabled={!isFormValid}
                  >
                    Continuer
                    <i className="fa-solid fa-arrow-right ml-2"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReservationInformations; 