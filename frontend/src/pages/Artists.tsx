import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Artist {
  id: number;
  name: string;
  photo: string;
  biographie: string;
  upcoming_shows: number;
}

const Artists = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/artistes');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des artistes');
        }
        const data = await response.json();
        setArtists(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  if (loading) {
    return (
      <section className="bg-gray-950 min-h-screen py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-8">Nos Artistes</h2>
          <div className="text-white text-center">Chargement...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gray-950 min-h-screen py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-8">Nos Artistes</h2>
          <div className="text-red-500 text-center">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-950 min-h-screen py-16">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">Nos Artistes</h2>
          <Link 
            to="/" 
            className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition duration-300 flex items-center space-x-2"
          >
            <i className="fa-solid fa-arrow-left"></i>
            <span>Retour à l'accueil</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artists.map((artist) => (
            <div key={artist.id} className="group relative">
              <div className="relative overflow-hidden rounded-lg aspect-[3/4]">
                <img 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  src={artist.photo} 
                  alt={`Portrait de ${artist.name}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 flex flex-col justify-end p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-2xl font-bold text-white mb-2">{artist.name}</h3>
                  <p className="text-gray-300 mb-4 line-clamp-3">{artist.biographie}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-400">
                      {artist.upcoming_shows} {artist.upcoming_shows > 1 ? 'spectacles' : 'spectacle'} à venir
                    </span>
                    <Link 
                      to={`/spectacles?artiste=${artist.id}`}
                      className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition duration-300"
                    >
                      Voir les spectacles
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Artists; 