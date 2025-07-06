import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Spectacle } from '../services/types';

const ShowsList = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    const fetchSpectacles = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/spectacles?page=${page}&limit=${limit}`);
        if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);

        const data = await res.json();

        if (data.spectacles && Array.isArray(data.spectacles)) {
          const now = new Date();

          const filtered = data.spectacles.filter((spectacle: Spectacle) => {
            const datePart = spectacle.date_spectacle.split("T")[0]; // assure compatibilité format ISO
            const fullDate = new Date(`${datePart}T${spectacle.heure_spectacle}`);
            return fullDate > now;
          });

          setSpectacles(filtered);
          setTotal(data.pagination.total);
        } else {
          setError("Format de données inattendu");
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchSpectacles();
  }, [page]);

  const handlePrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const handleNext = () => {
    if (page < Math.ceil(total / limit)) setPage((p) => p + 1);
  };

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {spectacles.map((spectacle) => (
                <div
                  key={spectacle.id}
                  className="bg-gray-900 rounded-lg overflow-hidden hover:scale-[1.02] transition duration-300 cursor-pointer"
                  onClick={() => navigate(`/spectacles/${spectacle.id}`)}
                >
                  <div className="relative h-64">
                    <img
                      src={spectacle.img ? `/src/assets/img/spectacles/${spectacle.img}` : "/placeholder.jpg"}
                      alt={spectacle.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                      {format(new Date(spectacle.date_spectacle), "d MMM", { locale: fr }).toUpperCase()}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{spectacle.title}</h3>
                    <p className="text-gray-400 mb-4">{spectacle.description}</p>
                    <div className="flex justify-between items-center mb-4">
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
                          <span>{spectacle.lieu}</span>
                        </div>
                      </div>
                      <span className="text-white font-bold text-lg">{spectacle.prix}€</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-yellow-400 hover:text-yellow-300 cursor-pointer flex items-center transition duration-300">
                        Réserver <i className="fa-solid fa-arrow-right ml-2"></i>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={handlePrev}
                disabled={page === 1}
                className="bg-yellow-400 text-black font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                Précédent
              </button>
              <span className="text-white py-2 px-4">
                Page {page} / {Math.ceil(total / limit)}
              </span>
              <button
                onClick={handleNext}
                disabled={page === Math.ceil(total / limit)}
                className="bg-yellow-400 text-black font-bold py-2 px-4 rounded disabled:opacity-50"
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
