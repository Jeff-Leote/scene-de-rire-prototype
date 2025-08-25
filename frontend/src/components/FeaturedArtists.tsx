import { useEffect, useState } from 'react';
import { buildImgSrc, onImgErrorSwap } from '@/utils/image';
import { Link } from 'react-router-dom';
import { Artist } from '../services/types';

const FeaturedArtists = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}/api/artistes`);
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
      <section id="featured-artists" className="bg-gray-950 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-8">Artistes déjà venu</h2>
          <div className="text-white text-center">Chargement...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="featured-artists" className="bg-gray-950 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-8">Artistes déjà venu</h2>
          <div className="text-red-500 text-center">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section id="featured-artists" className="bg-gray-950 py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-white mb-8">Artistes déjà venu</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
{[...artists]                               // clone first
  .sort((a, b) => b.upcoming_shows - a.upcoming_shows)
  .slice(0, 4)
  .map((artist) => (
            <div key={artist.id} className="group">
              <div className="relative overflow-hidden rounded-full aspect-square mb-4">
                <img 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                  src={buildImgSrc('photo_artiste', artist.photo)} 
                  alt={`Portrait de ${artist.name}`}
                  onError={onImgErrorSwap}
                />
                <div className="absolute inset-0 bg-yellow-400 bg-opacity-0 group-hover:bg-opacity-20 transition duration-300"></div>
              </div>
              <h3 className="text-xl font-bold text-white text-center">{artist.name}</h3>
              <p className="text-gray-400 text-center">
                {artist.upcoming_shows} {artist.upcoming_shows > 1 ? 'spectacles' : 'spectacle'} à venir
              </p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Link 
            to="/artistes"
            className="inline-block bg-transparent border-2 border-yellow-400 text-yellow-400 px-6 py-3 rounded hover:bg-yellow-400 hover:text-black transition duration-300"
          >
            Découvrir tous les artistes
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedArtists;
