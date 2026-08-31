import { useQuery } from '@tanstack/react-query';
import { buildImgSrc, onImgErrorSwap } from '@/utils/image';
import { Link } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';
import { Artist } from '../services/types';
import { api } from '@/services/api';

const FeaturedArtists = () => {
  const {
    data: artists = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ['artistes'],
    queryFn: () => api.get<Artist[]>('/api/artistes'),
    staleTime: 30 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
  });
  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Une erreur est survenue') : null;

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
          {[...artists].slice(0, 4).map((artist) => (
            <div key={artist.id} className="group">
              <div className="relative overflow-hidden rounded-full aspect-square">
                <img
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  src={buildImgSrc('photo_artiste', artist.photo || '')}
                  alt={`Portrait de ${artist.name}`}
                  loading="lazy"
                  decoding="async"
                  onError={onImgErrorSwap}
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
