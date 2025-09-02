import { buildImgSrc, onImgErrorSwap } from '@/utils/image';
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Spectacle, AvailabilityResponse } from '../services/types';
import { toast } from "@/components/ui/sonner";


const SpectacleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [spectacle, setSpectacle] = useState<Spectacle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);

  const formatHeure = (heure: string) => {
    return heure.split(":").slice(0, 2).join(":");
  };

  // Préchargement dynamique de l'image principale du spectacle
  useEffect(() => {
    if (!spectacle?.img) return;

    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = buildImgSrc('spectacles', spectacle.img);
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [spectacle?.img]);

  useEffect(() => {
    const fetchSpectacle = async () => {
      try {
        const { api } = await import('@/services/api');
        const data = await api.get<Spectacle>(`/api/spectacles/${id}`);
        setSpectacle(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchSpectacle();
  }, [id]);

  // Récupérer la disponibilité du spectacle pour bloquer la réservation si complet
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const { api } = await import('@/services/api');
        if (!id) return;
        const d = await api.get<AvailabilityResponse>(`/api/reservations/availability/${id}`);
        setAvailability(d);
      } catch {
        // silencieux
      }
    };
    fetchAvailability();
  }, [id]);

  const isSoldOut = availability?.places_restantes !== undefined && availability.places_restantes <= 0;

  const handleReserve = () => {
    if (isSoldOut) {
      toast.error("Spectacle complet, malheureusement vous êtes arrivés trop tard");
      return;
    }
    if (!spectacle) return;
    
    // Passer seulement l'ID et laisser Reservation.tsx récupérer les données
    navigate("/reservation", { state: { spectacleId: spectacle.id } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <section className="bg-black py-12">
          <div className="container mx-auto px-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto" />
          </div>
        </section>
      </div>
    );
  }

  if (error || !spectacle) {
    return (
      <div className="min-h-screen bg-black">
        <section className="bg-black py-12">
          <div className="container mx-auto px-6 text-center">
            <p className="text-red-500">{error || "Spectacle non trouvé"}</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-black py-12">
          <div className="container mx-auto px-6">
            {/* Hero Section */}
            <div className="relative h-[400px] rounded-lg overflow-hidden mb-8">
              <img
                src={buildImgSrc('spectacles', spectacle.img || undefined) || "/assets/placeholder.jpg"}
                alt={spectacle.title}
                className="w-full h-full object-cover object-[center_25%]"
                onError={onImgErrorSwap}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8">
                <div className="flex items-center mb-4">
                  <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold uppercase">
                    {format(new Date(spectacle.date_spectacle), "d MMM", {
                      locale: fr,
                    }).toUpperCase()}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {spectacle.title}
                </h1>
              </div>
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="md:col-span-2">
                <div className="bg-gray-900 rounded-lg p-6 mb-6">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    À propos du spectacle
                  </h2>
                  <p className="text-gray-300 mb-6">{spectacle.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center">
                      <i className="fa-regular fa-calendar mr-3 text-yellow-400 text-xl"></i>
                      <div>
                        <p className="text-gray-400 text-sm">Date</p>
                        <p className="text-white">
                          {format(new Date(spectacle.date_spectacle), "d MMMM yyyy", {
                            locale: fr,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <i className="fa-regular fa-clock mr-3 text-yellow-400 text-xl"></i>
                      <div>
                        <p className="text-gray-400 text-sm">Heure</p>
                        <p className="text-white">{formatHeure(spectacle.heure_spectacle)}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <i className="fa-solid fa-location-dot mr-3 text-yellow-400 text-xl"></i>
                      <div>
                        <p className="text-gray-400 text-sm">Lieu</p>
                        <p className="text-white">{spectacle.lieu}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <i className="fa-solid fa-ticket-alt mr-3 text-yellow-400 text-xl"></i>
                      <div>
                        <p className="text-gray-400 text-sm">Prix</p>
                        <p className="text-white">{spectacle.prix}€</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Artist Section */}
                <div className="bg-gray-900 rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">L'artiste</h2>
                  <div className="flex items-center">
                    <img
                      src={
                        buildImgSrc('photo_artiste', spectacle.artiste_photo || undefined) || "/assets/placeholder.jpg"
                      }
                      alt={spectacle.artiste_name}
                      className="w-24 h-24 rounded-full object-cover mr-6"
                      onError={onImgErrorSwap}
                    />
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{spectacle.artiste_name}</h3>
                      <p className="text-gray-300">Comédien professionnel</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="md:col-span-1">
                <div className="bg-gray-900 rounded-lg p-6 sticky top-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Réserver</h2>
                  <p className="text-gray-300 mb-6">
                    Ne manquez pas ce spectacle exceptionnel ! Réservez vos places dès maintenant.
                  </p>
                  <button
                    onClick={handleReserve}
                    disabled={isSoldOut}
                    className={`w-full font-bold py-3 px-6 rounded transition duration-300 flex items-center justify-center ${
                      isSoldOut
                        ? 'bg-red-600 text-white cursor-not-allowed'
                        : 'bg-yellow-400 text-black hover:bg-yellow-300'
                    }`}
                  >
                    <i className="fa-solid fa-ticket-alt mr-2"></i>
                    {isSoldOut ? 'Complet' : 'Réserver maintenant'}
                  </button>
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-gray-300 mb-2">
                      <span>Prix par place</span>
                      <span>{spectacle.prix}€</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-300 mb-2">
                      <span>Date</span>
                      <span>{format(new Date(spectacle.date_spectacle), "d MMM yyyy", { locale: fr })}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-300">
                      <span>Heure</span>
                      <span>{formatHeure(spectacle.heure_spectacle)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SpectacleDetail;
