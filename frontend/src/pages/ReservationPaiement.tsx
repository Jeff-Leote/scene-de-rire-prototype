import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { createReservationCheckout } from "../services/reservation";

const ReservationPaiement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { spectacle, nbBillets, prenom, nom, email } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!spectacle) {
    navigate("/reservation");
    return null;
  }

  const handlePayer = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await createReservationCheckout({
        spectacleId: spectacle.id,
        date: spectacle.date_spectacle,
        time: spectacle.heure_spectacle,
        billets: nbBillets,
        prenom,
        nom,
        email,
      });
      if (res && res.url) {
        window.location.href = res.url;
      } else {
        setError("Erreur lors de la création de la session de paiement.");
      }
    } catch (e) {
      setError("Erreur lors de la création de la session de paiement.");
    } finally {
      setLoading(false);
    }
  };

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
                  <div className="w-10 h-10 mx-auto bg-yellow-400 rounded-full text-black flex items-center justify-center">
                    <i className="fa-solid fa-credit-card"></i>
                  </div>
                  <div className="text-xs mt-2">Paiement</div>
                </div>
              </div>
            </div>
            <div className="relative mt-4">
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-700"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400"></div>
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="max-w-full mx-auto mb-8">
            <div className="bg-gray-900 rounded-lg p-8 w-full relative" style={{ paddingTop: '3.5rem' }}>
              {/* Flèche retour intégrée dans la card */}
              <button
                className="absolute top-4 left-4 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full text-lg transition flex items-center z-10"
                onClick={() => navigate('/reservation/informations', { state: { spectacle, nbBillets, prenom, nom, email } })}
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <h2 className="text-xl font-bold text-yellow-400 mb-2 pl-10">Récapitulatif</h2>
              <div className="flex items-center">
                <div className="mr-4 w-20 h-28 overflow-hidden rounded-md">
                  <img className="w-full h-full object-cover" src={spectacle.img} alt={spectacle.title} />
                </div>
                <div>
                  <div className="font-bold text-lg">{spectacle.title}</div>
                  <div className="text-gray-300 text-sm mb-1">{spectacle.date_spectacle} à {spectacle.heure_spectacle}</div>
                  <div className="text-gray-400 text-sm mb-1">Lieu : {spectacle.lieu}</div>
                  <div className="text-yellow-400 font-bold text-lg">{spectacle.prix} € × {nbBillets} billets</div>
                  <div className="text-white font-bold text-lg mt-2">Total : {spectacle.prix * nbBillets} €</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton Payer */}
          <div className="text-center mt-8">
            <button
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-full text-lg transition"
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