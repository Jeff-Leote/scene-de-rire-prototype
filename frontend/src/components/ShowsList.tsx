import { useEffect, useState } from "react";
import { buildImgSrc, onImgErrorSwap } from '@/utils/image';
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Spectacle } from '../services/types';

const ShowsList = () => {
  const navigate = useNavigate();
  const [allSpectacles, setAllSpectacles] = useState<Spectacle[]>([]);
  const [spectacles, setSpectacles] = useState<Spectacle[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const limit = 9;

  const formatHeure = (heure: string) => {
    // Si l'heure est au format HH:mm:ss, on ne garde que HH:mm
    return heure.split(':').slice(0, 2).join(':');
  };

  // Charger tous les spectacles à venir une seule fois
  useEffect(() => {
    const fetchAllSpectacles = async () => {
      try {
        setLoading(true);
        const { api } = await import('@/services/api');
        
        // Récupérer tous les spectacles (limite élevée)
        const response = await api.get(`/api/spectacles?page=1&limit=1000`) as any;
        const data = response.spectacles || response || [];

        if (Array.isArray(data)) {
          const now = new Date();

          const filtered = data.filter((spectacle: Spectacle) => {
            const datePart = spectacle.date_spectacle.split("T")[0];
            const fullDate = new Date(`${datePart}T${spectacle.heure_spectacle}`);
            return fullDate > now;
          });

          // Trier par date croissante
          filtered.sort((a, b) => {
            const dateA = new Date(`${a.date_spectacle.split("T")[0]}T${a.heure_spectacle}`);
            const dateB = new Date(`${b.date_spectacle.split("T")[0]}T${b.heure_spectacle}`);
            return dateA.getTime() - dateB.getTime();
          });

          setAllSpectacles(filtered);
          setTotal(filtered.length);
        } else {
          setError("Format de données inattendu - données non tableau");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAllSpectacles();
  }, []);

  // Mettre à jour les spectacles affichés quand la page change
  useEffect(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const pageSpectacles = allSpectacles.slice(startIndex, endIndex);
    setSpectacles(pageSpectacles);
  }, [page, allSpectacles]);

  const handlePrev = () => {
    if (page > 1) {
      setPage((p) => p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (page < Math.ceil(total / limit)) {
      setPage((p) => p + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-6 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">Liste des spectacles</h2>
        </div>

        {spectacles.length === 0 ? (
          <p className="text-gray-400 text-center">Aucun spectacle trouvé</p>
        ) : (
          <>
            <div className={`grid gap-4 sm:gap-6 mb-8 ${spectacles.length === 1 ? 'grid-cols-1 justify-center' : spectacles.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3'}`}>
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

            <div className="flex justify-center space-x-4">
              <button
                onClick={handlePrev}
                disabled={page === 1}
                className="bg-red-500 text-white font-bold py-2 px-4 rounded disabled:opacity-50 hover:bg-red-600 transition duration-300"
              >
                Précédent
              </button>
              <span className="text-white py-2 px-4">
                Page {page} / {Math.ceil(total / limit)}
              </span>
              <button
                onClick={handleNext}
                disabled={page === Math.ceil(total / limit)}
                className="bg-red-500 text-white font-bold py-2 px-4 rounded disabled:opacity-50 hover:bg-red-600 transition duration-300"
              >
                Suivant
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ShowsList;
