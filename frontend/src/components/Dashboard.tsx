import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface Spectacle {
  id: number;
  title: string;
  img: string;
  description: string;
  date: string;
  prix: number;
  lieu: string;
  artiste_name: string;
  artiste_photo: string;
}

interface Artist {
  id: number;
  name: string;
  photo: string;
  biographie: string;
  upcoming_shows: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [spectacles, setSpectacles] = useState<Spectacle[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [activeTab, setActiveTab] = useState<'spectacles' | 'artists'>('spectacles');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        if (activeTab === 'spectacles') {
          const response = await fetch('http://localhost:5000/api/admin/spectacles', { headers });
          if (!response.ok) throw new Error('Erreur lors de la récupération des spectacles');
          const data = await response.json();
          setSpectacles(data);
        } else {
          const response = await fetch('http://localhost:5000/api/artistes', { headers });
          if (!response.ok) throw new Error('Erreur lors de la récupération des artistes');
          const data = await response.json();
          setArtists(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 pt-24 pb-12">
        <div className="container mx-auto px-6">
          <div className="text-white text-center">Chargement...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 pt-24 pb-12">
        <div className="container mx-auto px-6">
          <div className="text-red-500 text-center">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-12">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard Administrateur</h1>
          <Link 
            to="/" 
            className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition duration-300 flex items-center space-x-2"
          >
            <i className="fa-solid fa-arrow-left"></i>
            <span>Retour au site</span>
          </Link>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('spectacles')}
            className={`px-4 py-2 rounded ${
              activeTab === 'spectacles'
                ? 'bg-yellow-400 text-black'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            } transition duration-300`}
          >
            Spectacles
          </button>
          <button
            onClick={() => setActiveTab('artists')}
            className={`px-4 py-2 rounded ${
              activeTab === 'artists'
                ? 'bg-yellow-400 text-black'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            } transition duration-300`}
          >
            Artistes
          </button>
        </div>

        {/* Content */}
        {activeTab === 'spectacles' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spectacles.map((spectacle) => (
              <div key={spectacle.id} className="bg-gray-800 rounded-lg overflow-hidden">
                <img src={spectacle.img} alt={spectacle.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-xl font-bold text-white mb-2">{spectacle.title}</h3>
                  <p className="text-gray-400 mb-2">Artiste: {spectacle.artiste_name}</p>
                  <p className="text-gray-400 mb-2">
                    Date: {new Date(spectacle.date).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-gray-400 mb-4">Prix: {spectacle.prix}€</p>
                  <div className="flex space-x-2">
                    <button className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition duration-300">
                      Modifier
                    </button>
                    <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300">
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artists.map((artist) => (
              <div key={artist.id} className="bg-gray-800 rounded-lg overflow-hidden">
                <img src={artist.photo} alt={artist.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-xl font-bold text-white mb-2">{artist.name}</h3>
                  <p className="text-gray-400 mb-2">
                    {artist.upcoming_shows} {artist.upcoming_shows > 1 ? 'spectacles' : 'spectacle'} à venir
                  </p>
                  <p className="text-gray-400 mb-4 line-clamp-3">{artist.biographie}</p>
                  <div className="flex space-x-2">
                    <button className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition duration-300">
                      Modifier
                    </button>
                    <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300">
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 