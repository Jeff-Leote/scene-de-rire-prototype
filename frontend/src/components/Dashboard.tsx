import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from "@/components/ui/sonner";

interface Spectacle {
  id: number;
  title: string;
  img: string;
  description: string;
  date_spectacle: string;
  heure_spectacle: string;
  prix: number;
  lieu: string;
  artiste_name: string;
  artiste_photo: string;
  artiste_id: number;
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
  const [isSpectacleModalOpen, setIsSpectacleModalOpen] = useState(false);
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);
  const [isAddingSpectacle, setIsAddingSpectacle] = useState(false);
  const [isAddingArtist, setIsAddingArtist] = useState(false);
  const [selectedSpectacle, setSelectedSpectacle] = useState<Spectacle | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'spectacle' | 'artist', id: number } | null>(null);
  const [spectacleFormData, setSpectacleFormData] = useState({
    title: '',
    img: '',
    description: '',
    date_spectacle: '',
    heure_spectacle: '',
    prix: '',
    artiste_id: '',
    lieu: ''
  });
  const [artistFormData, setArtistFormData] = useState({
    name: '',
    photo: '',
    biographie: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Récupérer les spectacles
        const spectaclesResponse = await fetch('http://localhost:5000/api/admin/spectacles', { headers });
        if (!spectaclesResponse.ok) throw new Error('Erreur lors de la récupération des spectacles');
        const spectaclesData = await spectaclesResponse.json();
        setSpectacles(spectaclesData);

        // Récupérer les artistes
        const artistsResponse = await fetch('http://localhost:5000/api/admin/artistes', { headers });
        if (!artistsResponse.ok) throw new Error('Erreur lors de la récupération des artistes');
        const artistsData = await artistsResponse.json();
        setArtists(artistsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEditSpectacleClick = (spectacle: Spectacle) => {
    setSelectedSpectacle(spectacle);
    setSpectacleFormData({
      title: spectacle.title,
      img: spectacle.img,
      description: spectacle.description,
      date_spectacle: spectacle.date_spectacle,
      heure_spectacle: spectacle.heure_spectacle,
      prix: spectacle.prix.toString(),
      artiste_id: spectacle.artiste_id.toString(),
      lieu: spectacle.lieu
    });
    setIsSpectacleModalOpen(true);
  };

  const handleEditArtistClick = (artist: Artist) => {
    setSelectedArtist(artist);
    setArtistFormData({
      name: artist.name,
      photo: artist.photo,
      biographie: artist.biographie
    });
    setIsArtistModalOpen(true);
  };

  const handleSpectacleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSpectacleFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArtistInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setArtistFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSpectacleClick = () => {
    setIsAddingSpectacle(true);
    setSelectedSpectacle(null);
    setSpectacleFormData({
      title: '',
      img: '',
      description: '',
      date_spectacle: '',
      heure_spectacle: '',
      prix: '',
      artiste_id: '',
      lieu: ''
    });
    setIsSpectacleModalOpen(true);
  };

  const handleAddArtistClick = () => {
    setIsAddingArtist(true);
    setSelectedArtist(null);
    setArtistFormData({
      name: '',
      photo: '',
      biographie: ''
    });
    setIsArtistModalOpen(true);
  };

  const handleSpectacleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const url = isAddingSpectacle 
        ? 'http://localhost:5000/api/admin/spectacles'
        : `http://localhost:5000/api/admin/spectacles/${selectedSpectacle?.id}`;
      
      const requestBody = {
        ...spectacleFormData,
        prix: parseFloat(spectacleFormData.prix),
        artiste_id: parseInt(spectacleFormData.artiste_id)
      };

      console.log('Données envoyées au backend:', requestBody);
      
      const response = await fetch(url, {
        method: isAddingSpectacle ? 'POST' : 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Réponse d\'erreur du backend:', errorData);
        throw new Error(errorData.error || (isAddingSpectacle ? 'Erreur lors de l\'ajout du spectacle' : 'Erreur lors de la modification du spectacle'));
      }

      const updatedSpectacle = await response.json();
      if (isAddingSpectacle) {
        setSpectacles(prev => [...prev, updatedSpectacle]);
      } else {
        setSpectacles(prev => prev.map(s => s.id === updatedSpectacle.id ? updatedSpectacle : s));
      }
      setIsSpectacleModalOpen(false);
      setIsAddingSpectacle(false);
      toast.success(isAddingSpectacle ? 'Spectacle ajouté avec succès' : 'Spectacle modifié avec succès');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleArtistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const url = isAddingArtist 
        ? 'http://localhost:5000/api/admin/artistes'
        : `http://localhost:5000/api/admin/artistes/${selectedArtist?.id}`;
      
      const response = await fetch(url, {
        method: isAddingArtist ? 'POST' : 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(artistFormData)
      });

      if (!response.ok) throw new Error(isAddingArtist ? 'Erreur lors de l\'ajout de l\'artiste' : 'Erreur lors de la modification de l\'artiste');

      const updatedArtist = await response.json();
      if (isAddingArtist) {
        setArtists(prev => [...prev, updatedArtist]);
      } else {
        setArtists(prev => prev.map(a => a.id === updatedArtist.id ? updatedArtist : a));
      }
      setIsArtistModalOpen(false);
      setIsAddingArtist(false);
      toast.success(isAddingArtist ? 'Artiste ajouté avec succès' : 'Artiste modifié avec succès');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleDeleteClick = (type: 'spectacle' | 'artist', id: number) => {
    setItemToDelete({ type, id });
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const url = itemToDelete.type === 'spectacle'
        ? `http://localhost:5000/api/admin/spectacles/${itemToDelete.id}`
        : `http://localhost:5000/api/admin/artistes/${itemToDelete.id}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Erreur lors de la suppression de l'${itemToDelete.type}`);
      }

      if (itemToDelete.type === 'spectacle') {
        setSpectacles(prev => prev.filter(s => s.id !== itemToDelete.id));
      } else {
        setArtists(prev => prev.filter(a => a.id !== itemToDelete.id));
      }

      toast.success(`${itemToDelete.type === 'spectacle' ? 'Spectacle' : 'Artiste'} supprimé avec succès`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setShowDeleteConfirmation(false);
      setItemToDelete(null);
    }
  };

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
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-4">
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
          <button
            onClick={activeTab === 'spectacles' ? handleAddSpectacleClick : handleAddArtistClick}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 flex items-center space-x-2"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Ajouter {activeTab === 'spectacles' ? 'un spectacle' : 'un artiste'}</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'spectacles' ? (
          spectacles.length === 0 ? (
            <p className="text-gray-400 text-center">Aucun spectacle</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spectacles.map((spectacle) => (
                <div key={spectacle.id} className="bg-gray-800 rounded-lg overflow-hidden">
                  <img src={spectacle.img} alt={spectacle.title} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-white mb-2">{spectacle.title}</h3>
                    <p className="text-gray-400 mb-2">Artiste: {spectacle.artiste_name}</p>
                    <p className="text-gray-400 mb-2">
                      Date: {new Date(spectacle.date_spectacle).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-gray-400 mb-4">Prix: {spectacle.prix}€</p>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditSpectacleClick(spectacle)}
                        className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition duration-300"
                      >
                        Modifier
                      </button>
                      <button 
                        onClick={() => handleDeleteClick('spectacle', spectacle.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          artists.length === 0 ? (
            <p className="text-gray-400 text-center">Aucun artiste</p>
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
                      <button 
                        onClick={() => handleEditArtistClick(artist)}
                        className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition duration-300"
                      >
                        Modifier
                      </button>
                      <button 
                        onClick={() => handleDeleteClick('artist', artist.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Modal de modification/ajout de spectacle */}
        {isSpectacleModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">
                {isAddingSpectacle ? 'Ajouter un spectacle' : 'Modifier le spectacle'}
              </h2>
              <form onSubmit={handleSpectacleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Titre</label>
                  <input
                    type="text"
                    name="title"
                    value={spectacleFormData.title}
                    onChange={handleSpectacleInputChange}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Image URL</label>
                  <input
                    type="text"
                    name="img"
                    value={spectacleFormData.img}
                    onChange={handleSpectacleInputChange}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Description</label>
                  <textarea
                    name="description"
                    value={spectacleFormData.description}
                    onChange={handleSpectacleInputChange}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Date</label>
                  <input
                    type="date"
                    name="date_spectacle"
                    value={spectacleFormData.date_spectacle}
                    onChange={handleSpectacleInputChange}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Heure</label>
                  <input
                    type="time"
                    name="heure_spectacle"
                    value={spectacleFormData.heure_spectacle}
                    onChange={handleSpectacleInputChange}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Prix (€)</label>
                  <input
                    type="number"
                    name="prix"
                    value={spectacleFormData.prix}
                    onChange={handleSpectacleInputChange}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Lieu</label>
                  <input
                    type="text"
                    name="lieu"
                    value={spectacleFormData.lieu}
                    onChange={handleSpectacleInputChange}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Artiste</label>
                  <select
                    name="artiste_id"
                    value={spectacleFormData.artiste_id}
                    onChange={handleSpectacleInputChange}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    required
                  >
                    <option value="">Sélectionner un artiste</option>
                    {artists.map(artist => (
                      <option key={artist.id} value={artist.id}>
                        {artist.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSpectacleModalOpen(false);
                      setIsAddingSpectacle(false);
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition duration-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition duration-300"
                  >
                    {isAddingSpectacle ? 'Ajouter' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de modification/ajout d'artiste */}
        {isArtistModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">
                {isAddingArtist ? 'Ajouter un artiste' : 'Modifier l\'artiste'}
              </h2>
              <form onSubmit={handleArtistSubmit} className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Nom</label>
                  <input
                    type="text"
                    name="name"
                    value={artistFormData.name}
                    onChange={handleArtistInputChange}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Photo URL</label>
                  <input
                    type="text"
                    name="photo"
                    value={artistFormData.photo}
                    onChange={handleArtistInputChange}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Biographie</label>
                  <textarea
                    name="biographie"
                    value={artistFormData.biographie}
                    onChange={handleArtistInputChange}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    rows={6}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsArtistModalOpen(false);
                      setIsAddingArtist(false);
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition duration-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition duration-300"
                  >
                    {isAddingArtist ? 'Ajouter' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de confirmation de suppression */}
        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Confirmation de suppression</h3>
              <p className="text-gray-300 mb-6">
                Êtes-vous sûr de vouloir supprimer {itemToDelete?.type === 'spectacle' ? 'ce spectacle' : 'cet artiste'} ? 
                Cette action est irréversible.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirmation(false);
                    setItemToDelete(null);
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition duration-300"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 