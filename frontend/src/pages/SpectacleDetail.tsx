import { buildImgSrc, onImgErrorSwap } from '@/utils/image';
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Spectacle } from '../services/types';
import { toast } from "@/components/ui/sonner";


const SpectacleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [spectacle, setSpectacle] = useState<Spectacle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Availability removed with reservations
  const [extraPhotos, setExtraPhotos] = useState<Array<{ id: number; image_path: string }>>([]);

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

  // Charger toutes les photos additionnelles (pas liées à un spectacle spécifique)
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const { api } = await import('@/services/api');
        const photos = await api.get<Array<{ id: number; spectacle_id: number; image_path: string; sort_order: number | null }>>(`/api/photos`);
        setExtraPhotos((photos || []).slice(0, 3).map(p => ({ id: p.id, image_path: p.image_path })));
      } catch {
        setExtraPhotos([]);
      }
    };
    fetchPhotos();
  }, []);

  const isSoldOut = false;

  const handleReserve = () => {
    if (!spectacle) return;
    
    // Utiliser le lien de billetterie du spectacle s'il existe
    if (spectacle.lien_spectacle) {
      window.location.href = spectacle.lien_spectacle;
      return;
    }
    
    // Fallback vers la variable d'environnement
    const url = import.meta.env.VITE_TICKETING_URL as string | undefined;
    if (url && typeof url === 'string') {
      window.location.href = url;
      return;
    }
    
    toast.error("Lien de billetterie indisponible pour ce spectacle.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <section className="bg-black py-12">
          <div className="container mx-auto px-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto" />
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
            <div className="relative h-[700px] rounded-xl overflow-hidden mb-8 shadow-2xl">
              <img
                src={buildImgSrc('spectacles', spectacle.img || undefined) || "/assets/placeholder.jpg"}
                alt={spectacle.title}
                className="w-full h-full object-cover object-center"
                onError={onImgErrorSwap}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center mb-6">
                  <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide shadow-lg">
                    {format(new Date(spectacle.date_spectacle), "d MMM", {
                      locale: fr,
                    }).toUpperCase()}
                  </span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
                  {spectacle.title}
                </h1>
                <div className="flex items-center text-white/90 text-lg">
                  <i className="fa-solid fa-calendar-days mr-3 text-red-400"></i>
                  <span className="font-medium">
                    {format(new Date(spectacle.date_spectacle), "EEEE d MMMM yyyy", {
                      locale: fr,
                    })}
                  </span>
                  <i className="fa-solid fa-clock ml-6 mr-3 text-red-400"></i>
                  <span className="font-medium">{formatHeure(spectacle.heure_spectacle)}</span>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Main Content */
              }
              <div className="md:col-span-2">
                {/* Informations pratiques */}
                <div className="bg-gray-900 rounded-lg p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center">
                      <i className="fa-regular fa-calendar mr-3 text-red-500 text-xl"></i>
                      <div>
                        <p className="text-gray-400 text-sm">Date</p>
                        <p className="text-white">
                          {format(new Date(spectacle.date_spectacle), "EEEE d MMMM yyyy", {
                            locale: fr,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <i className="fa-regular fa-clock mr-3 text-red-500 text-xl"></i>
                      <div>
                        <p className="text-gray-400 text-sm">Heure</p>
                        <p className="text-white">{formatHeure(spectacle.heure_spectacle)}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <i className="fa-solid fa-location-dot mr-3 text-red-500 text-xl"></i>
                      <div>
                        <p className="text-gray-400 text-sm">Lieu</p>
                        <p className="text-white">{spectacle.lieu}</p>
                      </div>
                    </div>
                    {/* Prix retiré */}
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-900 rounded-lg p-6 mb-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Description</h2>
                  <p className="text-gray-300">{spectacle.description}</p>
                </div>

                {/* Additional Photos Section */}
                {extraPhotos.length > 0 && (
                  <div className="bg-gray-900 rounded-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Photos additionnelles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {extraPhotos.map((p) => (
                        <div key={p.id} className="rounded-lg overflow-hidden bg-black">
                          <img
                            src={buildImgSrc('photo_additionnel', p.image_path)}
                            alt={`Photo additionnelle ${p.id}`}
                            className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                            onError={onImgErrorSwap}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="md:col-span-1">
                <div className="bg-gray-900 rounded-lg p-6 sticky top-24">
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
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    <i className="fa-solid fa-ticket-alt mr-2"></i>
                    {isSoldOut ? 'Complet' : 'Réserver maintenant'}
                  </button>
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-gray-300 mb-2">
                      <span>Date</span>
                      <span>{format(new Date(spectacle.date_spectacle), "EEEE d MMM yyyy", { locale: fr })}</span>
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
