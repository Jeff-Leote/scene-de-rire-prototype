import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { fetchSpectacles, fetchSpectacleById } from "../services/spectacles";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { useCart, useAuth } from "../contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import { buildImgSrc, onImgErrorSwap } from "@/utils/image";
import { Spectacle } from "../services/types";

interface PromoCode {
  id: number;
  code: string;
  type: 'percentage' | 'fixed' | 'free_ticket';
  value: number;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  description: string;
}

const Reservation = () => {
  const [spectacles, setSpectacles] = useState<Spectacle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSpectacle, setSelectedSpectacle] = useState<Spectacle | null>(null);
  const [nbBillets, setNbBillets] = useState<{ [id: number]: number }>({});
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<PromoCode | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  
  const location = useLocation();
  const params = useParams();
  const { addToCart, removeFromCart, cart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const cartRef = useRef(cart);
  const didAutoAddRef = useRef(false);
  const API_URL = import.meta.env.VITE_API_URL;

  // Protection de la page - redirection si non connecté et panier vide
  useEffect(() => {
    if (!isAuthenticated && cart.length === 0) {
      navigate('/connexion');
    }
  }, [isAuthenticated, cart.length, navigate]);

  // Mettre à jour la référence quand le panier change
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);



  // Fonction helper sécurisée pour obtenir le nombre de billets
  const getNbBillets = useCallback((spectacleId: number): number => {
    try {
      if (typeof spectacleId !== 'number' || spectacleId <= 0) return 1;
      if (!nbBillets || typeof nbBillets !== 'object') return 1;
      
      const count = nbBillets[spectacleId];
      return (typeof count === 'number' && count > 0) ? count : 1;
    } catch (error) {
      console.error('Erreur lors de la récupération du nombre de billets:', error);
      return 1;
    }
  }, [nbBillets]);

  // Calculs memoizés pour éviter les recalculs inutiles
  const totalPanier = useMemo(() => {
    try {
      if (cart.length === 0) return 0;
      
      return cart.reduce((sum, item) => {
        // Vérifier que l'item et ses propriétés sont valides
        if (!item || typeof item.prix !== 'number' || item.prix < 0) {
          console.warn('Item invalide dans le panier:', item);
          return sum;
        }
        
        const quantity = getNbBillets(item.id);
        
        return sum + (item.prix * quantity);
      }, 0);
    } catch (error) {
      console.error('Erreur lors du calcul du total panier:', error);
      return 0;
    }
  }, [cart, getNbBillets]);

  const discount = useMemo(() => {
    try {
      if (!appliedPromoCode || cart.length === 0) {
        console.log('🔍 Calcul discount: pas de code promo ou panier vide');
        return 0;
      }

      console.log('🔍 Calcul discount pour:', appliedPromoCode.type, appliedPromoCode.value);

      // Vérifier que les valeurs sont valides
      if (typeof appliedPromoCode.value !== 'number' || appliedPromoCode.value < 0) {
        console.error('❌ Valeur de code promo invalide:', appliedPromoCode.value);
        return 0;
      }

      if (typeof totalPanier !== 'number' || totalPanier <= 0) {
        console.error('❌ Total panier invalide:', totalPanier);
        return 0;
      }

      switch (appliedPromoCode.type) {
        case 'percentage': {
          const percentageDiscount = (totalPanier * appliedPromoCode.value) / 100;
          console.log('📊 Discount percentage:', percentageDiscount);
          return Math.min(percentageDiscount, totalPanier);
        }
        case 'fixed':
          console.log('📊 Discount fixed:', appliedPromoCode.value);
          return Math.min(appliedPromoCode.value, totalPanier);
        case 'free_ticket': {
          // Pour free_ticket, on déduit le prix du billet le moins cher
          // Le value représente le nombre de billets gratuits (généralement 1)
          const validPrices = cart
            .filter(item => item && typeof item.prix === 'number' && item.prix > 0)
            .map(item => item.prix);
          
          console.log('🛒 Prix valides dans le panier:', validPrices);
          
          if (validPrices.length === 0) {
            console.warn('⚠️ Aucun prix valide trouvé dans le panier pour free_ticket');
            return 0;
          }
          
          const cheapestTicket = Math.min(...validPrices);
          const discountAmount = cheapestTicket * appliedPromoCode.value;
          console.log('📊 Billet le moins cher:', cheapestTicket);
          console.log('📊 Discount amount:', discountAmount);
          return Math.min(discountAmount, totalPanier);
        }
        default:
          console.warn('⚠️ Type de code promo non reconnu:', appliedPromoCode.type);
          return 0;
      }
    } catch (error) {
      console.error('❌ Erreur lors du calcul du discount:', error);
      return 0;
    }
  }, [appliedPromoCode, cart, totalPanier]);

  const totalFinal = useMemo(() => totalPanier - discount, [totalPanier, discount]);

  // Fonction helper sécurisée pour formater les prix
  const formatPrice = useCallback((price: unknown): string => {
    try {
      if (typeof price !== 'number' || price < 0) return '0.00';
      return price.toFixed(2);
    } catch (error) {
      console.error('Erreur lors du formatage du prix:', error);
      return '0.00';
    }
  }, []);

  // Fonctions utilitaires
  const formatDateFr = useCallback((value: string) => {
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
  }, []);

  const formatTimeFr = useCallback((value: string) => {
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
  }, []);

  // Chargement initial des spectacles
  useEffect(() => {
    let isMounted = true;
    const stateSpectacleId = location.state?.spectacleId;
    const urlSpectacleId = params.id;
    
    const loadSpectacles = async () => {
      try {
        if (stateSpectacleId) {
          const sp = await fetchSpectacleById(Number(stateSpectacleId));
          if (isMounted) {
            setSelectedSpectacle(sp);
            setSpectacles([sp]);
            setLoading(false);
          }
    } else if (urlSpectacleId) {
          const sp = await fetchSpectacleById(Number(urlSpectacleId));
          if (isMounted) {
            setSelectedSpectacle(sp);
            setSpectacles([sp]);
            setLoading(false);
          }
    } else {
          const spList = await fetchSpectacles();
          if (isMounted) {
          setSpectacles(spList);
            if (cartRef.current.length > 0) {
              const cartSpectacle = spList.find(s => s.id === cartRef.current[0].id);
            if (cartSpectacle) setSelectedSpectacle(cartSpectacle);
          }
            setLoading(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError("Erreur lors du chargement des spectacles");
          setLoading(false);
        }
      }
    };

    loadSpectacles();
    return () => { isMounted = false; };
  }, [location.state?.spectacleId, params.id]);

  // Gestion de l'ajout au panier
  const handleAddToCart = useCallback((spectacle: Spectacle) => {
    if (!spectacle || !spectacle.id || !spectacle.title || !spectacle.prix) return;
    
    if (!cartRef.current.find(i => i.id === spectacle.id)) {
      addToCart({
        id: spectacle.id,
        title: spectacle.title,
        date_spectacle: spectacle.date_spectacle,
        heure_spectacle: spectacle.heure_spectacle,
        prix: spectacle.prix,
        img: spectacle.img,
        lieu: spectacle.lieu,
      });
      setNbBillets((prev) => ({ ...prev, [spectacle.id]: prev[spectacle.id] || 1 }));
    }
  }, [addToCart]);

  // Ajouter automatiquement le spectacle au panier UNIQUEMENT lors d'une arrivée depuis un lien direct/détail
  useEffect(() => {
    if (!selectedSpectacle) return;
    // Ne faire l'ajout auto qu'une seule fois et uniquement si on vient d'une source explicite
    const cameFromDetail = Boolean(location.state?.spectacleId || params.id);
    if (didAutoAddRef.current || !cameFromDetail) return;
    if (!cartRef.current.find(i => i.id === selectedSpectacle.id)) {
      handleAddToCart(selectedSpectacle);
      didAutoAddRef.current = true;
    }
  }, [selectedSpectacle, handleAddToCart, location.state?.spectacleId, params.id]);

  // Gestion de la suppression du panier
  const handleRemoveFromCart = useCallback((itemId: number) => {
    // Supprimer du panier d'abord
    removeFromCart(itemId);
    
    // Nettoyer les billets
    setNbBillets((prev) => {
      const newBillets = { ...prev };
      delete newBillets[itemId];
      return newBillets;
    });

    // Si on supprime le spectacle sélectionné
    if (selectedSpectacle?.id === itemId) {
      const remainingCart = cartRef.current.filter(s => s.id !== itemId);
      if (remainingCart.length === 0) {
        // Panier vide - réinitialiser tout
        setSelectedSpectacle(null);
        setAppliedPromoCode(null);
        setPromoCode("");
      } else {
        // Sélectionner le premier spectacle restant en trouvant le spectacle complet
        const remainingSpectacle = spectacles.find(s => s.id === remainingCart[0].id);
        if (remainingSpectacle) {
          setSelectedSpectacle(remainingSpectacle);
        }
      }
    }
  }, [removeFromCart, selectedSpectacle, spectacles]);

  // Validation du code promo
  const validatePromoCode = useCallback(async () => {
    if (!promoCode.trim()) {
      toast.error("Veuillez saisir un code promo");
      return;
    }

    setIsValidatingPromo(true);
    try {
      console.log('🔍 Validation du code promo:', promoCode.trim());
      console.log('📊 Total panier:', totalPanier);
      console.log('🛒 Panier:', cartRef.current);

      const response = await fetch(`${API_URL}/api/reservations/validate-promo-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCode.trim(),
          totalAmount: totalPanier,
          cart: cartRef.current
        })
      });

      const data = await response.json();
      console.log('📡 Réponse API:', data);
      
      if (response.ok) {
        // Vérifier que les données reçues sont valides
        if (data?.promoCode && typeof data.promoCode === 'object') {
          console.log('✅ Code promo reçu:', data.promoCode);
          const normalized = {
            id: Number(data.promoCode.id),
            code: String(data.promoCode.code || ''),
            type: data.promoCode.type as PromoCode['type'],
            value: Number(data.promoCode.value) || 0,
            max_uses: Number(data.promoCode.max_uses ?? 0) || 0,
            current_uses: Number(data.promoCode.current_uses ?? 0) || 0,
            is_active: Boolean(data.promoCode.is_active),
            description: typeof data.promoCode.description === 'string' ? data.promoCode.description : ''
          } as PromoCode;
          setAppliedPromoCode(normalized);
          toast.success("Code promo appliqué avec succès !");
        } else {
          console.error('❌ Données de code promo invalides:', data);
          toast.error("Erreur: données de code promo invalides");
          setAppliedPromoCode(null);
        }
      } else {
        console.error('❌ Erreur API code promo:', data);
        toast.error(data.error || "Code promo invalide");
        setAppliedPromoCode(null);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la validation du code promo:', error);
      toast.error("Erreur lors de la validation du code promo");
      setAppliedPromoCode(null);
    } finally {
      setIsValidatingPromo(false);
    }
  }, [promoCode, totalPanier, API_URL]);

  // Suppression du code promo
  const removePromoCode = useCallback(() => {
    setAppliedPromoCode(null);
    setPromoCode("");
    toast.success("Code promo supprimé");
  }, []);

  // Gestion de la sélection de spectacle
  const handleSpectacleSelect = useCallback((spectacle: Spectacle) => {
    if (!spectacle || !spectacle.id) return;
    setSelectedSpectacle(spectacle);
  }, []);

  // Gestion de la navigation vers les informations
  const handleContinue = useCallback(() => {
    if (cart.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }

    navigate("/reservation/informations", {
      state: {
        cart,
        nbBillets,
        appliedPromoCode
      }
    });
  }, [cart, nbBillets, appliedPromoCode, navigate]);

  // Gestion du changement de nombre de billets
  const handleBilletChange = useCallback((spectacleId: number, newCount: number) => {
    try {
      // Validation des paramètres
      if (typeof spectacleId !== 'number' || spectacleId <= 0) {
        console.error('ID de spectacle invalide:', spectacleId);
        return;
      }
      
      if (typeof newCount !== 'number' || newCount < 1) {
        console.error('Nombre de billets invalide:', newCount);
        return;
      }
      
      setNbBillets(prev => {
        try {
          return {
            ...prev,
            [spectacleId]: newCount
          };
        } catch (error) {
          console.error('Erreur lors de la mise à jour du nombre de billets:', error);
          return prev;
        }
      });
    } catch (error) {
      console.error('Erreur dans handleBilletChange:', error);
    }
  }, []);

  // Si non connecté et panier vide, afficher un message de chargement pendant la redirection
  if (!isAuthenticated && cart.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        <Header activeItem="Réservation" />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header activeItem="Réservation" />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <Header activeItem="Réservation" />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <p className="text-red-400 text-lg">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-yellow-400 text-black px-6 py-2 rounded hover:bg-yellow-300 transition duration-300"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
                  <div className="text-xs mt-2">Choix des places</div>
                </div>
              </div>
              <div className="w-1/3 text-center">
                <div className="relative">
                  <div className="w-10 h-10 mx-auto bg-gray-800 rounded-full text-white flex items-center justify-center ring-2 ring-gray-900">
                    <i className="fa-solid fa-user"></i>
                  </div>
                  <div className="text-xs mt-2 text-gray-400">Informations</div>
                </div>
              </div>
              <div className="w-1/3 text-center">
                <div className="relative">
                  <div className="w-10 h-10 mx-auto bg-gray-800 rounded-full text-white flex items-center justify-center ring-2 ring-gray-900">
                    <i className="fa-solid fa-credit-card"></i>
                  </div>
                  <div className="text-xs mt-2 text-gray-400">Paiement</div>
                </div>
              </div>
            </div>
            <div className="relative mt-4">
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-800 rounded"></div>
              <div className="absolute top-0 left-0 w-1/3 h-1 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded"></div>
            </div>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">
                <i className="fa-solid fa-shopping-cart"></i>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-4">Votre panier est vide</h2>
              <p className="text-gray-400 mb-6">Choisissez un spectacle pour ajouter des billets.</p>
              <button 
                onClick={() => navigate('/spectacles')}
                className="bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-300 transition duration-300 font-medium"
              >
                Voir les spectacles
              </button>
            </div>
          ) : (
            /* Contenu principal avec spectacle sélectionné et résumé */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Sélection de spectacle */}
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 ring-1 ring-gray-800 shadow-lg">
                {selectedSpectacle && (
                  <>
                    <div className="flex items-start mb-6">
                      <div className="mr-6 w-24 h-32 overflow-hidden rounded-lg">
                        <img
                          className="w-full h-full object-cover"
                          src={buildImgSrc('spectacles', selectedSpectacle.img)}
                          alt={selectedSpectacle.title}
                          onError={onImgErrorSwap}
                        />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-yellow-400 mb-2">{selectedSpectacle.title || 'Titre non disponible'}</h2>
                        <p className="text-gray-300 text-sm mb-3">{selectedSpectacle.description || 'Description non disponible'}</p>
                        <div className="space-y-1 text-sm text-gray-400">
                          <div><i className="fa-regular fa-calendar mr-2"></i>{formatDateFr(selectedSpectacle.date_spectacle)}</div>
                          <div><i className="fa-regular fa-clock mr-2"></i>{formatTimeFr(selectedSpectacle.heure_spectacle)}</div>
                          <div><i className="fa-solid fa-location-dot mr-2"></i>{selectedSpectacle.lieu}</div>
                        </div>
                        <div className="text-3xl font-bold text-yellow-400 mt-4">{formatPrice(selectedSpectacle.prix)}€</div>
                      </div>
                    </div>
                    
                    {/* Contrôle des billets pour le spectacle sélectionné */}
                    {cart.find(item => item.id === selectedSpectacle.id) && (
                      <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-gray-400">Tarif</div>
                            <div className="text-white font-medium">Prix unitaire</div>
                          </div>
                          <div className="text-yellow-400 font-bold text-lg">{formatPrice(selectedSpectacle.prix)} €</div>
                      </div>
                        
                        <div className="flex items-center justify-between mt-4">
                    <div>
                            <div className="text-sm text-gray-400">Nombre de billets</div>
                          </div>
                          <div className="flex items-center space-x-3">
                          <button
                              onClick={() => handleBilletChange(selectedSpectacle.id, getNbBillets(selectedSpectacle.id) - 1)}
                              className="w-8 h-8 bg-gray-700 text-white rounded flex items-center justify-center hover:bg-gray-600 transition duration-200 text-lg"
                              disabled={getNbBillets(selectedSpectacle.id) <= 1}
                          >
                            -
                        </button>
                            <span className="text-white text-lg w-12 text-center font-medium">{getNbBillets(selectedSpectacle.id)}</span>
                          <button
                              onClick={() => handleBilletChange(selectedSpectacle.id, getNbBillets(selectedSpectacle.id) + 1)}
                              className="w-8 h-8 bg-gray-700 text-white rounded flex items-center justify-center hover:bg-gray-600 transition duration-200 text-lg"
                          >
                            +
                        </button>
                        </div>
                        </div>
                        
                        <div className="border-t border-gray-700 mt-4 pt-4">
                          <div className="flex items-center justify-between">
                            <div className="text-white font-medium">Total</div>
                            <div className="text-yellow-400 font-bold text-xl">{formatPrice(selectedSpectacle.prix * getNbBillets(selectedSpectacle.id))} €</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Résumé de votre commande */}
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 ring-1 ring-gray-800 shadow-lg">
                <h3 className="text-lg font-bold text-yellow-400 mb-4">
                  <i className="fa-solid fa-shopping-cart mr-2"></i>
                  Résumé de votre commande
                </h3>
                
                {/* Liste des items du panier */}
                <div className="space-y-3 mb-6">
                  {cart.map((item) => (
                    <div 
                      key={item.id} 
                      className={`bg-gray-800/50 rounded-lg p-4 border cursor-pointer ${
                        selectedSpectacle?.id === item.id
                          ? 'border-blue-400 shadow-[0_0_0_2px_rgba(59,130,246,0.15)]'
                          : 'border-gray-700 hover:border-gray-600'
                      } transition-all duration-200`}
                      onClick={() => {
                        const spectacle = spectacles.find(s => s.id === item.id);
                        if (spectacle) {
                          handleSpectacleSelect(spectacle);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-12 h-16 overflow-hidden rounded mr-3">
                            <img
                              className="w-full h-full object-cover"
                              src={buildImgSrc('spectacles', item.img)}
                              alt={item.title}
                              onError={onImgErrorSwap}
                            />
                          </div>
                          <div>
                            <h4 className="text-white font-medium text-sm">{item.title || 'Titre non disponible'}</h4>
                            <p className="text-gray-400 text-xs">{formatDateFr(item.date_spectacle)}</p>
                            <p className="text-yellow-400 text-sm">{formatPrice(item.prix)}€ par billet</p>
                      </div>
                    </div>
                    <button
                          onClick={(e) => {
                            e.stopPropagation(); // Empêcher la sélection du spectacle
                            handleRemoveFromCart(item.id);
                          }}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500 transition duration-300 text-xs font-medium"
                        >
                          Supprimer
                    </button>
                      </div>
                      
                      {/* Affichage de la quantité (non modifiable ici) */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400 text-sm">Quantité:</span>
                          <span className="text-white text-sm font-medium">{getNbBillets(item.id)}</span>
                          <span className="text-gray-400 text-xs">(modifiable dans les détails)</span>
                        </div>
                        <div className="text-yellow-400 font-semibold text-lg">{formatPrice(item.prix * getNbBillets(item.id))}€</div>
                      </div>
                  </div>
                ))}
                  </div>
                  
                {/* Code promo */}
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">Code promo</h4>
                  {appliedPromoCode ? (
                    <div className="bg-green-900/30 border border-green-500 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                    <div>
                          <p className="text-green-400 font-medium">{appliedPromoCode.code}</p>
                          <p className="text-green-300 text-sm">
                            {appliedPromoCode.type === 'percentage' && `${appliedPromoCode.value}% de réduction`}
                            {appliedPromoCode.type === 'fixed' && `${appliedPromoCode.value}€ de réduction`}
                            {appliedPromoCode.type === 'free_ticket' && 'Billet gratuit'}
                          </p>
                          {appliedPromoCode.description && appliedPromoCode.description.trim() !== "" && (
                            <p className="text-xs text-green-400 mt-1">{appliedPromoCode.description}</p>
                          )}
                  </div>
                      <button
                          onClick={removePromoCode}
                          className="text-red-400 hover:text-red-300"
                      >
                          <i className="fa-solid fa-times"></i>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Code promo"
                        className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:border-yellow-400"
                        onKeyPress={(e) => e.key === 'Enter' && validatePromoCode()}
                      />
                      <button
                        onClick={validatePromoCode}
                        disabled={isValidatingPromo || !promoCode.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isValidatingPromo ? (
                          <i className="fa-solid fa-spinner fa-spin"></i>
                        ) : (
                          'Appliquer'
                        )}
                        </button>
                    </div>
                  )}
                </div>

                {/* Totaux */}
                <div className="border-t border-gray-700 pt-4 mb-6">
                  <div className="flex justify-between text-gray-300 mb-2">
                    <span>Sous-total</span>
                    <span>{formatPrice(totalPanier)} €</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-400 mb-2">
                      <span>Réduction</span>
                      <span>-{formatPrice(discount)} €</span>
                  </div>
                  )}
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total</span>
                    <span className="text-yellow-400">{formatPrice(totalFinal)} €</span>
                  </div>
                </div>

                  <button
                  onClick={handleContinue}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-full text-lg transition shadow-lg"
                  >
                  Continuer
                  <i className="fa-solid fa-arrow-right ml-2"></i>
                </button>
                
                {/* Informations de sécurité */}
                <div className="mt-6 space-y-2">
                  <div className="flex items-center text-xs text-gray-400">
                    <i className="fa-solid fa-shield-halved text-green-400 mr-2"></i>
                    <span>Paiement 100% sécurisé</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400">
                    <i className="fa-solid fa-envelope text-blue-400 mr-2"></i>
                    <span>E-billet envoyé par email</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400">
                    <i className="fa-solid fa-mobile-screen-button text-yellow-400 mr-2"></i>
                    <span>Présentation sur mobile acceptée</span>
                  </div>
                </div>
                </div>
              </div>
            )}
          
          {/* Section d'aide en bas */}
          <div className="mt-16 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900/50 rounded-xl p-6 text-center">
                <div className="text-yellow-400 text-2xl mb-3">
                  <i className="fa-solid fa-phone"></i>
                </div>
                <h4 className="font-semibold text-white mb-2">Par téléphone</h4>
                <p className="text-sm text-gray-400">01 23 45 67 89</p>
                <p className="text-xs text-gray-500">Lun-Ven, 10h-19h</p>
            </div>
              <div className="bg-gray-900/50 rounded-xl p-6 text-center">
                <div className="text-yellow-400 text-2xl mb-3">
                  <i className="fa-solid fa-envelope"></i>
          </div>
                <h4 className="font-semibold text-white mb-2">Par email</h4>
                <p className="text-sm text-gray-400">billetterie@comedieclub.fr</p>
                <p className="text-xs text-gray-500">Réponse sous 24h</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-6 text-center">
                <div className="text-yellow-400 text-2xl mb-3">
                  <i className="fa-solid fa-circle-question"></i>
              </div>
                <h4 className="font-semibold text-white mb-2">FAQ</h4>
                <p className="text-sm text-gray-400">Consultez notre aide en ligne</p>
                <p className="text-xs text-gray-500">et questions fréquentes</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Reservation;
