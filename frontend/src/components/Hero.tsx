import { useState, useEffect } from 'react';
import { buildImgSrc, onImgErrorSwap } from '@/utils/image';
import { Link } from 'react-router-dom';
import { FeaturedArtist } from '../services/types';

const Hero = () => {
  const [featuredArtist, setFeaturedArtist] = useState<FeaturedArtist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextShowAvailability, setNextShowAvailability] = useState<{ places_restantes: number; places_total: number } | null>(null);

  const formatTime = (time: string) => {
    return time.split(':').slice(0, 2).join(':');
  };

  useEffect(() => {
    const fetchFeaturedArtist = async () => {
      try {
        setLoading(true);
        setError(null);
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}/api/artistes/featured`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors du chargement de l\'artiste à l\'affiche');
        }

        const data = await response.json();
    
        setFeaturedArtist(data);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'artiste à l\'affiche:', error);
        setError(error instanceof Error ? error.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedArtist();
  }, []);

  // Charger la disponibilité du prochain spectacle mis en avant
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const id = featuredArtist?.next_show?.id;
        if (!id) return;
        const res = await fetch(`${API_URL}/api/reservations/availability/${id}`);
        if (!res.ok) return;
        const d = await res.json();
        setNextShowAvailability({ places_restantes: d.places_restantes, places_total: d.places_total });
      } catch {
        // ignore
      }
    };
    fetchAvailability();
  }, [featuredArtist]);

  if (loading) {
    return (
      <section id="hero" className="bg-black pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="relative overflow-hidden rounded-lg h-[500px] mb-12 bg-gray-800 animate-pulse"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="hero" className="bg-black pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="relative overflow-hidden rounded-lg h-[500px] mb-12 bg-gray-800 flex items-center justify-center">
            <p className="text-red-500 text-center">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!featuredArtist) {
    return (
      <section id="hero" className="bg-black pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="relative overflow-hidden rounded-lg h-[500px] mb-12 bg-gray-800 flex items-center justify-center">
            <p className="text-gray-400 text-center">Aucun artiste à l'affiche pour le moment</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="hero" className="bg-black pt-24 pb-16">
      <div className="container mx-auto px-6">
        <div className="relative overflow-hidden rounded-lg h-[500px] mb-12">
          <img 
            className="absolute inset-0 w-full h-full object-cover" 
            src={buildImgSrc('photo_featured', featuredArtist.photo_featured)} 
            alt={`${featuredArtist.name} performing on stage`} 
            onError={onImgErrorSwap}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 w-full md:w-2/3">
            <div className="flex items-center mb-4">
              <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold uppercase">À l'affiche</span>
              {featuredArtist.next_show && (
                <span className="ml-3 text-white text-sm">
                  {new Date(featuredArtist.next_show.date).toLocaleDateString('fr-FR', { 
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })} · {formatTime(featuredArtist.next_show.time)}
                </span>
              )}
              {nextShowAvailability && nextShowAvailability.places_restantes <= 0 && (
                <span className="ml-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">Complet</span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {featuredArtist.name}: <span className="text-yellow-400">{featuredArtist.next_show?.title || 'Prochain spectacle'}</span>
            </h1>
            <div className="flex flex-wrap gap-4">
              {featuredArtist.next_show && (
                <Link 
                  to={`/spectacles/${featuredArtist.next_show.id}`}
                  className="bg-yellow-400 text-black px-6 py-3 rounded hover:bg-yellow-300 transition duration-300 flex items-center"
                >
                <i className="fa-solid fa-ticket-alt mr-2"></i>
                Réserver maintenant
                </Link>
              )}
              <Link 
                to={`/artistes/${featuredArtist.id}`}
                className="border border-yellow-400 text-yellow-400 px-6 py-3 rounded hover:bg-yellow-400 hover:text-black transition duration-300 flex items-center"
              >
                <i className="fa-solid fa-circle-info mr-2"></i>
                Plus d'infos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
