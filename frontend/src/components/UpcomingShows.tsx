import { useEffect, useState } from "react";
import { buildImgSrc, onImgErrorSwap } from '@/utils/image';
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Spectacle } from '../services/types';

const UpcomingShows = () => {
  const navigate = useNavigate();
  const [spectacles, setSpectacles] = useState<Spectacle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Disponibilités retirées
  const [availability] = useState<Record<number, { places_restantes: number; places_total: number }>>({});

  const formatHeure = (heure: string) => {
    return heure.split(':').slice(0, 2).join(':');
  };

  const formatDateComplete = (value: string) => {
    try {
      const d = new Date(value);
      const str = d.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      return str.charAt(0).toUpperCase() + str.slice(1);
    } catch {
      return value;
    }
  };

  useEffect(() => {
    const fetchSpectacles = async () => {
      try {
        const { api } = await import('@/services/api');
        
        // Récupérer plus de spectacles pour s'assurer d'avoir assez de spectacles à venir
        const response = await api.get('/api/spectacles?page=1&limit=50') as any;
        const data = response.spectacles || response || [];

        if (!Array.isArray(data)) {
          throw new Error('Format de données inattendu');
        }

        const now = new Date();
        const filtered = data.filter((spectacle) => {
          const fullDateTime = new Date(`${spectacle.date_spectacle.split("T")[0]}T${spectacle.heure_spectacle}`);
          return fullDateTime > now;
        });

        // Trier par date croissante
        filtered.sort((a, b) => {
          const dateA = new Date(`${a.date_spectacle.split("T")[0]}T${a.heure_spectacle}`);
          const dateB = new Date(`${b.date_spectacle.split("T")[0]}T${b.heure_spectacle}`);
          return dateA.getTime() - dateB.getTime();
        });

        // Prendre les 3 premiers spectacles à venir
        setSpectacles(filtered.slice(0, 3));

        // Disponibilités retirées
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
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Prochains spectacles</h2>
            <div className="flex items-center">
              <span 
                className="text-red-500 hover:text-red-400 cursor-pointer flex items-center transition duration-300 text-sm sm:text-base font-medium"
                onClick={() => navigate('/spectacles')}
              >
                Voir tous les spectacles
                <i className="fa-solid fa-arrow-right ml-2"></i>
              </span>
            </div>
          </div>
        </div>

        <div className={`grid gap-4 sm:gap-6 ${spectacles.length === 1 ? 'grid-cols-1 justify-center' : spectacles.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
          {spectacles.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 text-lg">Aucun spectacle à venir pour le moment.</p>
            </div>
          )}

          {spectacles.map((spectacle) => (
            <div
              key={spectacle.id}
              className="w-full bg-gray-900 rounded-lg overflow-hidden hover:scale-[1.02] transition duration-300 cursor-pointer shadow-lg hover:shadow-xl flex flex-col"
              onClick={() => navigate(`/spectacles/${spectacle.id}`)}
            >
              {/* Image qui occupe la majeure partie de la carte */}
              <div className="relative flex-1 min-h-[36rem] w-full">
                <img
                  src={buildImgSrc('spectacles', spectacle.img || undefined) || "/assets/placeholder.jpg"}
                  alt={spectacle.title}
                  className="w-full h-full object-cover"
                  onError={onImgErrorSwap}
                />
                {/* Badge de date en haut à droite */}
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xl font-bold">
                  {format(new Date(spectacle.date_spectacle), "d MMM", { locale: fr }).toUpperCase()}
                </div>
                {availability[spectacle.id] && availability[spectacle.id].places_restantes <= 0 && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    Complet
                  </div>
                )}
              </div>
              
              {/* Section texte compacte en bas */}
              <div className="p-4 bg-gray-900">
                <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">
                  {spectacle.title}
                </h3>
                <p className="text-gray-400 text-sm mb-3">
                  {format(new Date(spectacle.date_spectacle), "EEEE d MMMM", { locale: fr })} - {formatHeure(spectacle.heure_spectacle)}
                </p>
                <button 
                  className="w-full bg-black text-white py-2 px-4 rounded font-semibold hover:bg-red-500 transition duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/spectacles/${spectacle.id}`);
                  }}
                >
                  RÉSERVER
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpcomingShows;
