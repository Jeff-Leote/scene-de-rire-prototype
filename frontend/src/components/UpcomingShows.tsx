import { useEffect, useState } from "react";
import { buildImgSrc, onImgErrorSwap } from '@/utils/image';
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Spectacle } from '../services/types';

const UpcomingShows = () => {
  const navigate = useNavigate();
  const [spectacles, setSpectacles] = useState<Spectacle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Record<number, { places_restantes: number; places_total: number }>>({});

  const formatHeure = (heure: string) => {
    // Si l'heure est au format HH:mm:ss, on ne garde que HH:mm
    return heure.split(':').slice(0, 2).join(':');
  };

  useEffect(() => {
    const fetchSpectacles = async () => {
      try {
        const { api } = await import('@/services/api');
        const data: Spectacle[] = await api.get('/api/spectacles/upcoming');

        const now = new Date();

        // 🔍 Combine date + heure et filtre
        const filtered = data.filter((spectacle) => {
          const fullDateTime = new Date(`${spectacle.date_spectacle.split("T")[0]}T${spectacle.heure_spectacle}`);
          return fullDateTime > now;
        });

        setSpectacles(filtered);

        // Charger la disponibilité de chaque spectacle pour afficher "Complet"
        try {
          const entries = await Promise.all(
            filtered.map(async (s) => {
              try {
                const d = await api.get<{ places_restantes: number; places_total: number }>(`/api/reservations/availability/${s.id}`);
                return [s.id, { places_restantes: d.places_restantes, places_total: d.places_total }] as const;
              } catch {
                return null;
              }
            })
          );
          const map: Record<number, { places_restantes: number; places_total: number }> = {};
          entries.forEach((e) => { if (e) map[e[0]] = e[1]; });
          setAvailability(map);
        } catch {
          setAvailability({});
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchSpectacles();
  }, []);

  if (loading)
    return (
      <section id="upcoming-shows" className="bg-black py-12">
        <div className="container mx-auto px-6 text-white text-center">Chargement...</div>
      </section>
    );

  if (error)
    return (
      <section id="upcoming-shows" className="bg-black py-12">
        <div className="container mx-auto px-6 text-red-500 text-center">{error}</div>
      </section>
    );

  return (
    <section id="upcoming-shows" className="bg-black py-12">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">Prochains spectacles</h2>
          <span 
            className="text-yellow-400 hover:text-yellow-300 cursor-pointer flex items-center transition duration-300"
            onClick={() => navigate('/spectacles')}
          >
            Voir le calendrier complet
            <i className="fa-solid fa-arrow-right ml-2"></i>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
          {spectacles.length === 0 && (
            <p className="text-gray-400 col-span-full text-center">
              Aucun spectacle à venir pour le moment.
            </p>
          )}

          {spectacles.map((spectacle) => (
            <div
              key={spectacle.id}
              className="w-full max-w-[300px] bg-gray-900 rounded-lg overflow-hidden hover:scale-[1.02] transition duration-300 cursor-pointer"
              onClick={() => navigate(`/spectacles/${spectacle.id}`)}
            >
              <div className="relative h-64">
                <img
                  src={buildImgSrc('spectacles', spectacle.img || undefined) || "/assets/placeholder.jpg"}
                  alt={spectacle.title}
                  className="w-full h-full object-cover"
                  onError={onImgErrorSwap}
                />
                <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                  {format(new Date(spectacle.date_spectacle), "d MMM", { locale: fr }).toUpperCase()}
                </div>
                {availability[spectacle.id] && availability[spectacle.id].places_restantes <= 0 && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    Complet
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{spectacle.title}</h3>
                <p className="text-gray-400 mb-4">{spectacle.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center">
                      <i className="fa-regular fa-calendar mr-2 text-yellow-400"></i>
                      <span className="text-gray-300">
                        {format(new Date(spectacle.date_spectacle), "d MMMM yyyy", { locale: fr })}
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      <i className="fa-regular fa-clock mr-2 text-yellow-400"></i>
                      <span className="text-gray-300">{formatHeure(spectacle.heure_spectacle)}</span>
                    </div>
                    <div className="mt-1 text-gray-300">
                      <i className="fa-solid fa-location-dot mr-2 text-yellow-400"></i>
                      <span>{spectacle.lieu || "Lieu non précisé"}</span>
                    </div>
                  </div>
                  <span className="text-white font-bold text-lg">{spectacle.prix}€</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-yellow-400 hover:text-yellow-300 cursor-pointer flex items-center transition duration-300">
                    Réserver <i className="fa-solid fa-arrow-right ml-2"></i>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpcomingShows;
