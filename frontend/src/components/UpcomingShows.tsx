import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export interface Spectacle {
  id: number;
  title: string;
  img: string;
  description: string;
  date_spectacle: string;
  heure_spectacle: string;
  prix: number;
  lieu: string;
  artiste_id: number;
  artiste_name: string;
  artiste_photo: string;
}

const UpcomingShows = () => {
  const [spectacles, setSpectacles] = useState<Spectacle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatHeure = (heure: string) => {
    // Si l'heure est au format HH:mm:ss, on ne garde que HH:mm
    return heure.split(':').slice(0, 2).join(':');
  };

  useEffect(() => {
    const fetchSpectacles = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/spectacles/upcoming");
        if (!res.ok) throw new Error("Erreur lors du chargement des spectacles");
        const data: Spectacle[] = await res.json();

        const now = new Date();

        // 🔍 Combine date + heure et filtre
        const filtered = data.filter((spectacle) => {
          const fullDateTime = new Date(`${spectacle.date_spectacle.split("T")[0]}T${spectacle.heure_spectacle}`);
          return fullDateTime > now;
        });

        setSpectacles(filtered);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message || "Erreur inconnue");
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
          <span className="text-yellow-400 hover:text-yellow-300 cursor-pointer flex items-center transition duration-300">
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
              className="w-full max-w-[300px] bg-gray-900 rounded-lg overflow-hidden hover:scale-[1.02] transition duration-300"
            >
              <div className="relative h-64">
                <img
                  src={spectacle.img || spectacle.artiste_photo || "https://via.placeholder.com/400x300"}
                  alt={spectacle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                  {format(new Date(spectacle.date_spectacle), "d MMM", { locale: fr }).toUpperCase()}
                  <br />
                  {formatHeure(spectacle.heure_spectacle)}
                </div>
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
