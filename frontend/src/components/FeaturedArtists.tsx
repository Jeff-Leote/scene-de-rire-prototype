import { useEffect, useState } from 'react';
import { buildImgSrc, onImgErrorSwap } from '@/utils/image';
import { Link } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';
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
          <h2 className="text-3xl font-bold text-white mb-8">Artistes déjà venus</h2>
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
        <h2 className="text-3xl font-bold text-white mb-8">Artistes déjà venus</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...artists]
            .slice(0, 4)
            .map((artist) => (
              <div key={artist.id} className="group">
                <div className="relative overflow-hidden rounded-full aspect-square">
                  <OptimizedImage
                    category="photo_artiste"
                    filename={artist.photo || ''}
                    alt={`Portrait de ${artist.name}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    quality={80}
                  />
                  <div className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </div>
              </div>
            ))}
        </div>
        
        <div className="text-center mt-10">
          <Link 
            to="/artistes"
            className="inline-block bg-transparent border-2 border-red-500 text-red-500 px-6 py-3 rounded hover:bg-red-500 hover:text-black transition duration-300"
          >
            Découvrir tous les artistes
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedArtists;
