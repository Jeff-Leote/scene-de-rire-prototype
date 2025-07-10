import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from "@/components/ui/sonner";
import { Spectacle, Artist, ArtistFormData, Reservation, SpectacleFormData } from '../services/types';

const Dashboard = () => {
  const { user } = useAuth();
  const [spectacles, setSpectacles] = useState<Spectacle[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeTab, setActiveTab] = useState<'spectacles' | 'artists' | 'featured' | 'reservations' | 'lieu'>('spectacles');
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
    photo_featured: '',
    biographie: ''
  });
  const [featuredArtist, setFeaturedArtist] = useState<Artist | null>(null);
  const [isFeaturedModalOpen, setIsFeaturedModalOpen] = useState(false);
  const [newArtist, setNewArtist] = useState<ArtistFormData>({
    name: '',
    biographie: '',
    photo: '',
    photo_featured: ''
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lieuImages, setLieuImages] = useState<any[]>([]);
  const [isLieuModalOpen, setIsLieuModalOpen] = useState(false);
  const [isAddingLieu, setIsAddingLieu] = useState(false);
  const [selectedLieu, setSelectedLieu] = useState(null);
  const [lieuFormData, setLieuFormData] = useState({ image_path: '', image_detail_path: '', is_main: false });

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

        // Récupérer l'artiste à l'affiche
        const featuredResponse = await fetch('http://localhost:5000/api/admin/featured', { headers });
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json();
          setFeaturedArtist(featuredData);
        }

        // Récupérer les réservations
        const reservationsResponse = await fetch('http://localhost:5000/api/admin/reservations', { headers });
        if (!reservationsResponse.ok) throw new Error('Erreur lors de la récupération des réservations');
        const reservationsData = await reservationsResponse.json();
        setReservations(reservationsData);

        // Récupérer les images du lieu
        fetch('http://localhost:5000/api/lieu/images')
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setLieuImages(data);
            else setLieuImages([]);
          })
          .catch(() => setLieuImages([]));
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
      photo_featured: artist.photo_featured,
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
      photo_featured: '',
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

// Avoid logging credentials in plain text.
console.debug('Spectacle request:', {
  url,
  method: isAddingSpectacle ? 'POST' : 'PUT',
  body: requestBody   // header & token intentionally omitted
});
      
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
      if (!token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      // S'assurer que photo_featured a une valeur
      const artistData = {
        ...artistFormData,
        photo_featured: artistFormData.photo_featured || artistFormData.photo
      };

      const url = isAddingArtist 
        ? 'http://localhost:5000/api/admin/artiste'
        : `http://localhost:5000/api/admin/artiste/${selectedArtist?.id}`;
      
      const response = await fetch(url, {
        method: isAddingArtist ? 'POST' : 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(artistData)
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
          return;
        }
        throw new Error(data.error || (isAddingArtist ? 'Erreur lors de l\'ajout de l\'artiste' : 'Erreur lors de la modification de l\'artiste'));
      }

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

  const handleSetFeaturedArtist = async (artist: Artist) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/admin/featured', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ artist_id: artist.id })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
          return;
        }
        throw new Error(data.error || 'Erreur lors de la mise à jour de l\'artiste à l\'affiche');
      }

      setFeaturedArtist(data);
      toast.success('Artiste à l\'affiche mis à jour avec succès');
      setIsFeaturedModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleAddArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArtist.name || !newArtist.biographie || !newArtist.photo) {
      toast.error('Tous les champs sont requis');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      // Utiliser la même photo pour photo_featured si non spécifiée
      const artistData = {
        ...newArtist,
        photo_featured: newArtist.photo_featured || newArtist.photo
      };

      const response = await fetch('http://localhost:5000/api/admin/artiste', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(artistData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
          return;
        }
        throw new Error(data.error || data.details || 'Erreur lors de l\'ajout de l\'artiste');
      }

      setArtists([...artists, data]);
      setNewArtist({ name: '', biographie: '', photo: '', photo_featured: '' });
      setIsAddModalOpen(false);
      toast.success('Artiste ajouté avec succès');
    } catch (err) {
      console.error('Erreur complète:', err);
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleEditArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArtist) return;

    try {
      const formData = new FormData();
      formData.append('name', selectedArtist.name);
      formData.append('biographie', selectedArtist.biographie);
      
      // Gestion des photos
      const photoInput = document.querySelector('input[name="photo"]') as HTMLInputElement;
      const photoFeaturedInput = document.querySelector('input[name="photo_featured"]') as HTMLInputElement;
      
      if (photoInput?.files?.[0]) {
        formData.append('photo', photoInput.files[0]);
      }
      if (photoFeaturedInput?.files?.[0]) {
        formData.append('photo_featured', photoFeaturedInput.files[0]);
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/admin/artiste/${selectedArtist.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
          return;
        }
        throw new Error(data.error || 'Erreur lors de la modification de l\'artiste');
      }

      const data = await response.json();
      setArtists(artists.map(a => a.id === selectedArtist.id ? data : a));
      setSelectedArtist(null);
      setIsEditModalOpen(false);
      toast.success('Artiste modifié avec succès');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleDeleteArtist = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet artiste ?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/admin/artiste/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
          return;
        }
        throw new Error(data.error || 'Erreur lors de la suppression de l\'artiste');
      }

      setArtists(artists.filter(a => a.id !== id));
      toast.success('Artiste supprimé avec succès');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleDeleteReservation = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/admin/reservations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
          return;
        }
        throw new Error(data.error || 'Erreur lors de la suppression de la réservation');
      }

      setReservations(reservations.filter(r => r.reservation_id !== id));
      toast.success('Réservation supprimée avec succès');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleAddLieuClick = () => {
    setIsAddingLieu(true);
    setSelectedLieu(null);
    setLieuFormData({ image_path: '', image_detail_path: '', is_main: false });
    setIsLieuModalOpen(true);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditLieuClick = (img: any) => {
    setSelectedLieu(img);
    setLieuFormData({ image_path: img.image_path, image_detail_path: img.image_detail_path, is_main: img.is_main });
    setIsLieuModalOpen(true);
  };
  const handleLieuInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLieuFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleLieuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isAddingLieu
        ? 'http://localhost:5000/api/lieu/images'
        : `http://localhost:5000/api/lieu/images/${selectedLieu?.id}`;
      const method = isAddingLieu ? 'POST' : 'PUT';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lieuFormData)
      });
      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');
      const data = await response.json();
      if (isAddingLieu) setLieuImages(prev => [...prev, data]);
      else setLieuImages(prev => prev.map(img => img.id === data.id ? data : img));
      setIsLieuModalOpen(false);
      setIsAddingLieu(false);
      toast.success(isAddingLieu ? 'Image ajoutée' : 'Image modifiée');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || 'Erreur');
    }
  };
  const handleDeleteLieu = async (id: number) => {
    if (!window.confirm('Supprimer cette image ?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/lieu/images/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      setLieuImages(prev => prev.filter(img => img.id !== id));
      toast.success('Image supprimée');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || 'Erreur');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Retourne HH:MM
  };

  const getStatusBadge = (paiementStatut: boolean, montantPaye: number) => {
    // Si le paiement est marqué comme réussi et qu'il y a un montant payé
    if (paiementStatut && montantPaye > 0) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-500 text-white shadow-sm">
          <span className="mr-1">✓</span>
          Payé
        </span>
      );
    }
    // Si le paiement est marqué comme échoué ou montant = 0
    else if (!paiementStatut && montantPaye > 0) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-500 text-white shadow-sm">
          <span className="mr-1">✗</span>
          Annulé
        </span>
      );
    }
    // Si pas de paiement associé (réservation sans paiement)
    else if (montantPaye === 0 || montantPaye === null) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-500 text-white shadow-sm">
          <span className="mr-1">?</span>
          Sans paiement
        </span>
      );
    }
    // Sinon, en attente
    else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-500 text-white shadow-sm">
          <span className="mr-1">⏱</span>
          En attente
        </span>
      );
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
        
        {/* Onglets */}
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
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-4 py-2 rounded ${
                activeTab === 'featured'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              } transition duration-300`}
            >
              L'affiche
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-4 py-2 rounded ${
                activeTab === 'reservations'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              } transition duration-300`}
            >
              Réservations
            </button>
            <button
              onClick={() => setActiveTab('lieu')}
              className={`px-4 py-2 rounded ${activeTab === 'lieu' ? 'bg-yellow-400 text-black' : 'bg-gray-800 text-white hover:bg-gray-700'} transition duration-300`}
            >
              Lieu
            </button>
          </div>
          {/* Retirer le bouton d'ajout d'image pour la catégorie lieu */}
          {activeTab !== 'featured' && activeTab !== 'reservations' && activeTab !== 'lieu' && (
            <button
              onClick={activeTab === 'spectacles' ? handleAddSpectacleClick : handleAddArtistClick}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 flex items-center space-x-2"
            >
              <i className="fa-solid fa-plus"></i>
              <span>Ajouter {activeTab === 'spectacles' ? 'un spectacle' : 'un artiste'}</span>
            </button>
          )}
        </div>

        {/* Content */}
        {activeTab === 'featured' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Artiste à l'affiche</h2>
            {featuredArtist ? (
              <div className="flex items-start space-x-6">
                <img 
                  src={featuredArtist.photo ? `/src/assets/img/photo_artiste/${featuredArtist.photo}` : ''} 
                  alt={featuredArtist.name} 
                  className="w-48 h-48 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{featuredArtist.name}</h3>
                  <p className="text-gray-400 mb-4">{featuredArtist.biographie}</p>
                  <button
                    onClick={() => setIsFeaturedModalOpen(true)}
                    className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition duration-300"
                  >
                    Changer l'artiste à l'affiche
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">Aucun artiste n'est actuellement à l'affiche</p>
                <button
                  onClick={() => setIsFeaturedModalOpen(true)}
                  className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition duration-300"
                >
                  Définir un artiste à l'affiche
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'spectacles' && (
          spectacles.length === 0 ? (
            <p className="text-gray-400 text-center">Aucun spectacle</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spectacles.map((spectacle) => (
                <div key={spectacle.id} className="bg-gray-800 rounded-lg overflow-hidden">
                  <img src={spectacle.img ? `/src/assets/img/spectacles/${spectacle.img}` : ''} alt={spectacle.title} className="w-full h-48 object-cover" />
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
        )}

        {activeTab === 'artists' && (
          artists.length === 0 ? (
            <p className="text-gray-400 text-center">Aucun artiste</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artists.map((artist) => (
                <div key={artist.id} className="bg-gray-800 rounded-lg overflow-hidden">
                  <img src={artist.photo ? `/src/assets/img/photo_artiste/${artist.photo}` : ''} alt={artist.name} className="w-full h-48 object-cover" />
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

        {activeTab === 'reservations' && (
          reservations.length === 0 ? (
            <p className="text-gray-400 text-center">Aucune réservation</p>
          ) : (
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <div key={reservation.reservation_id} className="bg-gray-800 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{reservation.spectacle_title}</h3>
                      <p className="text-gray-400 mb-1">Artiste: {reservation.artiste_name}</p>
                      <p className="text-gray-400 mb-1">
                        Date: {formatDate(reservation.date_spectacle)} à {formatTime(reservation.heure_spectacle)}
                      </p>
                      <p className="text-gray-400 mb-1">Lieu: {reservation.lieu}</p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(reservation.paiement_statut, reservation.montant_paye || 0)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-700 rounded-lg p-3">
                      <p className="text-gray-400 text-sm">Client</p>
                      <p className="text-white font-semibold">
                        {reservation.civility} {reservation.user_firstname} {reservation.user_lastname}
                      </p>
                      <p className="text-gray-400 text-sm">{reservation.user_email}</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <p className="text-gray-400 text-sm">Places réservées</p>
                      <p className="text-white font-semibold text-lg">{reservation.nb_places}</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <p className="text-gray-400 text-sm">Prix unitaire</p>
                      <p className="text-white font-semibold">{reservation.prix}€</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <p className="text-gray-400 text-sm">Montant total</p>
                      <p className={`font-semibold text-lg ${
                        reservation.paiement_statut ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {reservation.montant_paye || reservation.prix * reservation.nb_places}€
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                    <div className="text-sm text-gray-400">
                      <p>Réservé le: {formatDate(reservation.reservation_date)}</p>
                      {reservation.date_paiement && (
                        <p>Payé le: {formatDate(reservation.date_paiement)}</p>
                      )}
                    </div>
                    <button 
                      onClick={() => handleDeleteReservation(reservation.reservation_id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'lieu' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Images du lieu</h2>
            {lieuImages.length === 0 ? (
              <p className="text-gray-400 text-center">Aucune image</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lieuImages.map(img => (
                  <div key={img.id} className="bg-gray-900 rounded-lg overflow-hidden">
                    <img src={img.image_path} alt="lieu" className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <p className="text-gray-400 mb-2 break-all"><b>Chemin:</b> {img.image_path}</p>
                      <p className="text-gray-400 mb-2"><b>Type:</b> {img.is_main ? <span className="text-green-400 font-bold">Principale</span> : <span className="text-blue-400">Galerie</span>}</p>
                      <div className="flex space-x-2 mt-2">
                        <button onClick={() => handleEditLieuClick(img)} className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition duration-300">Modifier</button>
                        <button onClick={() => handleDeleteLieu(img.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300">Supprimer</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
                  <select
                    name="lieu"
                    value={spectacleFormData.lieu}
                    onChange={handleSpectacleInputChange}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    required
                  >
                    <option value="">Sélectionner un lieu</option>
                    <option value="L'espace comédie">L'espace comédie</option>
                  </select>
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
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Photo de profil</label>
                  <input
                    type="text"
                    name="photo"
                    value={artistFormData.photo}
                    onChange={handleArtistInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
                    placeholder="Nom du fichier (ex: tamere.jpg)"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Photo à l'affiche</label>
                  <input
                    type="text"
                    name="photo_featured"
                    value={artistFormData.photo_featured}
                    onChange={handleArtistInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
                    placeholder="Nom du fichier (ex: tamere.jpg)"
                  />
                  <p className="text-sm text-gray-500 mt-1">Cette photo sera utilisée lorsque l'artiste est mis en avant sur la page d'accueil. Si non spécifiée, la photo de profil sera utilisée.</p>
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

        {/* Modal de sélection de l'artiste à l'affiche */}
        {isFeaturedModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">Sélectionner l'artiste à l'affiche</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                {artists.map((artist) => (
                  <div
                    key={artist.id}
                    className={`bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition duration-300 ${
                      artist.upcoming_shows === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => {
                      if (artist.upcoming_shows > 0) {
                        handleSetFeaturedArtist(artist);
                      } else {
                        toast.error('Cet artiste n\'a pas de spectacles à venir');
                      }
                    }}
                  >
                    <img
                      src={artist.photo ? `/src/assets/img/photo_artiste/${artist.photo}` : ''}
                      alt={artist.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h3 className="text-lg font-bold text-white">{artist.name}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{artist.biographie}</p>
                    <div className="mt-2 text-sm">
                      <span className={`${artist.upcoming_shows > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {artist.upcoming_shows} {artist.upcoming_shows > 1 ? 'spectacles' : 'spectacle'} à venir
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setIsFeaturedModalOpen(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition duration-300"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal ajout/modif image lieu */}
        {isLieuModalOpen && selectedLieu && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold text-white mb-4">Modifier l'image</h2>
              <form onSubmit={handleLieuSubmit} className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Chemin image</label>
                  <input type="text" name="image_path" value={lieuFormData.image_path} onChange={handleLieuInputChange} className="w-full bg-gray-700 text-white rounded px-4 py-2" required />
                </div>
                <div className="flex items-center space-x-3">
                  <input type="checkbox" id="is_main" name="is_main" checked={!!lieuFormData.is_main} onChange={e => setLieuFormData(prev => ({ ...prev, is_main: e.target.checked }))} />
                  <label htmlFor="is_main" className="text-white">Image principale (affichée sur l'accueil)</label>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button type="button" onClick={() => { setIsLieuModalOpen(false); setIsAddingLieu(false); }} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition duration-300">Annuler</button>
                  <button type="submit" className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition duration-300">Enregistrer</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 