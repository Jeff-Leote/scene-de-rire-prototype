import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { fetchSpectacles, fetchSpectacleById } from "../services/spectacles";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { useCart } from "../contexts/AuthContext";
import { toast } from "@/components/ui/sonner";

const Reservation = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [spectacles, setSpectacles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedSpectacle, setSelectedSpectacle] = useState<any | null>(null);
  const [nbBillets, setNbBillets] = useState<{ [id: number]: number }>({});
  const location = useLocation();
  const params = useParams();
  const { addToCart, removeFromCart, cart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const stateSpectacle = location.state?.spectacle;
    const urlSpectacleId = params.id;
    
    // Vérifier si l'utilisateur revient d'une annulation de paiement
    const searchParams = new URLSearchParams(location.search);
    const payment = searchParams.get('payment');
    if (payment === 'cancel') {
      toast.error('Paiement annulé. Votre réservation n\'a pas été finalisée.');
    }
    
    if (stateSpectacle) {
      setSelectedSpectacle(stateSpectacle);
      setLoading(false);
      setSpectacles([stateSpectacle]);
    } else if (urlSpectacleId) {
      fetchSpectacleById(Number(urlSpectacleId))
        .then((sp) => {
          if (isMounted) {
            setSelectedSpectacle(sp);
            setSpectacles([sp]);
            setLoading(false);
          }
        })
        .catch(() => setError("Erreur lors du chargement du spectacle"));
    } else {
      fetchSpectacles()
        .then((spList) => {
          setSpectacles(spList);
          if (!selectedSpectacle && cart.length > 0) {
            const cartSpectacle = spList.find(s => s.id === cart[0].id);
            if (cartSpectacle) setSelectedSpectacle(cartSpectacle);
          }
        })
        .catch(() => setError("Erreur lors du chargement des spectacles"))
        .finally(() => setLoading(false));
    }
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, params.id, cart]);

  // Ajouter au panier à chaque sélection de spectacle (évite les doublons)
  useEffect(() => {
    if (selectedSpectacle && !cart.find(i => i.id === selectedSpectacle.id)) {
      addToCart({
        id: selectedSpectacle.id,
        title: selectedSpectacle.title,
        date_spectacle: selectedSpectacle.date_spectacle,
        heure_spectacle: selectedSpectacle.heure_spectacle,
        prix: selectedSpectacle.prix,
        img: selectedSpectacle.img,
        lieu: selectedSpectacle.lieu,
      });
      setNbBillets((prev) => ({ ...prev, [selectedSpectacle.id]: prev[selectedSpectacle.id] || 1 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSpectacle]);

  if (loading)
    return (
      <section id="upcoming-shows" className="bg-black py-12">
        <div className="container mx-auto px-6 text-white text-center">Chargement...</div>
      </section>
    );
  if (error) return <div>{error}</div>;

  // Calcul du total général du panier
  const totalPanier = cart.reduce((sum, item) => sum + (item.prix * (nbBillets[item.id] || 1)), 0);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header activeItem="Réservation" />
      <main className="pt-24 pb-16 min-h-[calc(100vh-80px)]">
        <div className="container mx-auto px-4">
          {/* Progress Bar */}
          <div id="progress-bar" className="mb-8">
            <div className="flex justify-between">
              <div className="w-1/3 text-center">
                <div className="relative">
                  <div className="w-10 h-10 mx-auto bg-yellow-400 rounded-full text-black flex items-center justify-center">
                    <i className="fa-solid fa-calendar-days"></i>
                  </div>
                  <div className="text-xs mt-2">Choix des places</div>
                </div>
              </div>
              <div className="w-1/3 text-center">
                <div className="relative">
                  <div className="w-10 h-10 mx-auto bg-gray-700 rounded-full text-white flex items-center justify-center">
                    <i className="fa-solid fa-user"></i>
                  </div>
                  <div className="text-xs mt-2 text-gray-400">Informations</div>
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
              <div className="absolute top-0 left-0 w-1/3 h-1 bg-yellow-400"></div>
            </div>
          </div>

          {/* Content */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column (2/3 width) */}
            <div id="booking-main-content" className="md:col-span-2">
              {/* Affichage de la liste des spectacles du panier */}
              <div className="flex flex-col gap-4 my-6">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-gray-900 rounded-lg p-4 cursor-pointer border-2 ${selectedSpectacle?.id === item.id ? 'border-yellow-400' : 'border-transparent'} transition flex items-center justify-between`}
                    onClick={() => setSelectedSpectacle(item)}
                  >
                    <div className="flex items-center">
                      <div className="mr-4 w-20 h-28 overflow-hidden rounded-md">
                        <img className="w-full h-full object-cover" src={item.img} alt={item.title} />
                      </div>
                    <div>
                        <h2 className="text-xl font-bold text-yellow-400">{item.title}</h2>
                        <div className="text-gray-300 text-sm mb-1">{item.date_spectacle} à {item.heure_spectacle}</div>
                        <div className="text-gray-400 text-sm mb-1">Lieu : {item.lieu}</div>
                        <div className="text-lg font-bold text-yellow-400">{item.prix} €</div>
                        {/* Contrôle du nombre de billets pour chaque spectacle */}
                        <div className="flex items-center mt-2">
                          <span className="text-white mr-2">Billets :</span>
                          <button
                            className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-white"
                            onClick={e => { e.stopPropagation(); setNbBillets(n => ({ ...n, [item.id]: Math.max(1, (n[item.id] || 1) - 1) })); }}
                          >
                            -
                        </button>
                          <span className="mx-2 w-6 text-center">{nbBillets[item.id] || 1}</span>
                          <button
                            className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-white"
                            onClick={e => { e.stopPropagation(); setNbBillets(n => ({ ...n, [item.id]: (n[item.id] || 1) + 1 })); }}
                          >
                            +
                        </button>
                        </div>
                      </div>
                    </div>
                    <button
                      className="ml-4 text-red-500 hover:text-red-700 p-2 rounded-full z-10"
                      onClick={e => {
                        e.stopPropagation();
                        removeFromCart(item.id);
                        setNbBillets((prev) => {
                          const newBillets = { ...prev };
                          delete newBillets[item.id];
                          return newBillets;
                        });
                        // Si on supprime le spectacle sélectionné
                        if (selectedSpectacle?.id === item.id) {
                          // On attend la mise à jour du panier (cart) au prochain render
                          setTimeout(() => {
                            if (cart.length === 1) {
                              setSelectedSpectacle(null);
                            } else {
                              const next = cart.find(s => s.id !== item.id);
                              setSelectedSpectacle(next || null);
                            }
                          }, 0);
                        }
                      }}
                      title="Supprimer ce spectacle"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                ))}
                  </div>
                  
            {/* Section Tarif/Prix unitaire/Nombre de billets/Total pour le spectacle sélectionné */}
            {selectedSpectacle && (
              <>
                <div className="bg-gray-900 rounded-lg p-6 my-6 max-w-md mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-medium text-white">Tarif</div>
                      <div className="text-sm text-gray-400">Prix unitaire</div>
                    </div>
                    <div className="text-xl font-bold text-yellow-400">{selectedSpectacle.prix} €</div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-medium text-white">Nombre de billets</div>
                    <div className="flex items-center">
                      <button
                        className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white"
                        onClick={() => setNbBillets(n => ({ ...n, [selectedSpectacle.id]: Math.max(1, (n[selectedSpectacle.id] || 1) - 1) }))}
                      >
                        -
                        </button>
                      <span className="mx-4 w-6 text-center">{nbBillets[selectedSpectacle.id] || 1}</span>
                      <button
                        className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white"
                        onClick={() => setNbBillets(n => ({ ...n, [selectedSpectacle.id]: (n[selectedSpectacle.id] || 1) + 1 }))}
                      >
                        +
                        </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <div className="font-bold text-lg text-white">Total</div>
                    <div className="text-2xl font-bold text-yellow-400">{selectedSpectacle.prix * (nbBillets[selectedSpectacle.id] || 1)} €</div>
                  </div>
                </div>
                {/* Bouton Continuer en dehors du cadre */}
                <div className="text-center mt-4 mb-8">
                  <button
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-full text-lg transition"
                    onClick={() => {
                      if (selectedSpectacle) {
                        navigate("/reservation/informations", {
                          state: {
                            cart,
                            nbBillets,
                          },
                        });
                      }
                    }}
                  >
                  Continuer
                  <i className="fa-solid fa-arrow-right ml-2"></i>
                </button>
              </div>
              </>
            )}
            </div>

            {/* Right Column (1/3 width) - Order Summary */}
            <div id="order-summary" className="md:col-span-1">
            {/* Résumé de la commande pour tout le panier */}
            {cart.length > 0 && (
              <div className="bg-gray-900 rounded-lg p-6 sticky top-24 mt-8 md:mt-0 md:col-span-1">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <i className="fa-solid fa-receipt mr-2 text-yellow-400"></i>
                  Résumé de votre commande
                </h2>
                {cart.map((item) => {
                  const totalSpectacle = item.prix * (nbBillets[item.id] || 1);
                  return (
                    <div key={item.id} className="mb-4 pb-4 border-b border-gray-700">
                  <div className="flex justify-between mb-2">
                    <div className="text-gray-300">Spectacle</div>
                        <div>{item.title}</div>
                  </div>
                  <div className="flex justify-between mb-2">
                    <div className="text-gray-300">Date</div>
                        <div>{item.date_spectacle}</div>
                  </div>
                      <div className="flex justify-between mb-2">
                    <div className="text-gray-300">Heure</div>
                        <div>{item.heure_spectacle}</div>
                  </div>
                  <div className="flex justify-between mb-2">
                        <div>Billet × {nbBillets[item.id] || 1}</div>
                        <div>{totalSpectacle} €</div>
                  </div>
                </div>
                  );
                })}
                <div className="flex justify-between items-center font-bold text-lg mb-4">
                  <div>Total</div>
                  <div className="text-yellow-400">{totalPanier} €</div>
                </div>
                <div className="mt-6 text-sm text-gray-400">
                  <div className="flex items-center mb-2">
                    <i className="fa-solid fa-shield-halved mr-2"></i>
                    Paiement 100% sécurisé
                  </div>
                  <div className="flex items-center mb-2">
                    <i className="fa-solid fa-ticket-simple mr-2"></i>
                    E-billet envoyé par email
                  </div>
                  <div className="flex items-center">
                    <i className="fa-solid fa-mobile-screen-button mr-2"></i>
                    Présentation sur mobile acceptée
                  </div>
                </div>
                <div className="mt-6 flex items-center">
                  <input type="text" placeholder="Code promo" className="bg-gray-800 border border-gray-700 rounded-l-md py-2 px-3 focus:outline-none focus:border-yellow-400 flex-grow" />
                  <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-r-md">
                    Appliquer
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
          
          {/* Help Section */}
          <div id="help-section" className="mt-12 bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">Besoin d'aide ?</h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition">
                <i className="fa-solid fa-phone text-yellow-400 text-2xl mb-2"></i>
                <h3 className="font-medium mb-1">Par téléphone</h3>
                <p className="text-sm text-gray-400">01 23 45 67 89<br/>Lun-Ven, 10h-19h</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition">
                <i className="fa-solid fa-envelope text-yellow-400 text-2xl mb-2"></i>
                <h3 className="font-medium mb-1">Par email</h3>
                <p className="text-sm text-gray-400">billetterie@comedieclub.fr<br/>Réponse sous 24h</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition">
                <i className="fa-solid fa-circle-question text-yellow-400 text-2xl mb-2"></i>
                <h3 className="font-medium mb-1">FAQ</h3>
                <p className="text-sm text-gray-400">Consultez notre aide en ligne<br/>et questions fréquentes</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default function ReservationProtected() {
  return (
    <ProtectedRoute requireAuth>
      <Reservation />
    </ProtectedRoute>
  );
}
