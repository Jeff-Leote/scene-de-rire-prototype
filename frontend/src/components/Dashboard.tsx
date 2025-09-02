import { useState, useEffect } from 'react';
import { buildImgSrc, onImgErrorSwap } from '@/utils/image';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from "@/components/ui/sonner";
import { Spectacle, Artist, ArtistFormData, Reservation, SpectacleFormData, FeaturedArtist, User, PromoCode, PromoCodeFormData } from '../services/types';

interface LieuImage {
  id: number;
  image_path: string;
  image_detail_path?: string;
  is_main: boolean;
}

interface AvailabilityData {
  places_total: number;
  places_reservees: number;
  places_restantes: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;
  const [spectacles, setSpectacles] = useState<Spectacle[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeTab, setActiveTab] = useState<'spectacles' | 'artists' | 'featured' | 'reservations' | 'lieu' | 'users' | 'promocodes' | 'newsletter' | 'settings'>('spectacles');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSpectacleModalOpen, setIsSpectacleModalOpen] = useState(false);
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);
  const [isAddingSpectacle, setIsAddingSpectacle] = useState(false);
  const [isAddingArtist, setIsAddingArtist] = useState(false);
  const [selectedSpectacle, setSelectedSpectacle] = useState<Spectacle | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'spectacle' | 'artist' | 'user' | 'promocode', id: number } | null>(null);
  const [spectacleFormData, setSpectacleFormData] = useState({
    title: '',
    img: '',
    description: '',
    date_spectacle: '',
    heure_spectacle: '',
    prix: '',
    artiste_id: '',
    lieu: '',
    places_disponibles: ''
  });
  const [artistFormData, setArtistFormData] = useState({
    name: '',
    photo: '',
    photo_featured: '',
    biographie: ''
  });
  const [featuredArtist, setFeaturedArtist] = useState<FeaturedArtist | null>(null);
  const [isFeaturedModalOpen, setIsFeaturedModalOpen] = useState(false);
  const [newArtist, setNewArtist] = useState<ArtistFormData>({
    name: '',
    biographie: '',
    photo: '',
    photo_featured: ''
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [lieuImages, setLieuImages] = useState<LieuImage[]>([]);
  const [isLieuModalOpen, setIsLieuModalOpen] = useState(false);

  const [selectedLieu, setSelectedLieu] = useState<LieuImage | null>(null);
  const [lieuFormData, setLieuFormData] = useState({ image_path: '', image_detail_path: '', is_main: false });
  const [users, setUsers] = useState<User[]>([]);
  const [availability, setAvailability] = useState<Record<number, AvailabilityData>>({});
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isPromoCodeModalOpen, setIsPromoCodeModalOpen] = useState(false);
  const [isAddingPromoCode, setIsAddingPromoCode] = useState(false);
  const [selectedPromoCode, setSelectedPromoCode] = useState<PromoCode | null>(null);
  const [promoCodeFormData, setPromoCodeFormData] = useState<PromoCodeFormData>({
    code: '',
    type: 'percentage',
    value: '',
    description: '',
    is_active: true,
    max_uses: '',
    valid_from: '',
    valid_until: ''
  });

  // Newsletter et emails
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<string[]>([]);
  const [emailFormData, setEmailFormData] = useState({
    subject: '',
    message: '',
    recipients: 'all' // 'all' ou 'newsletter'
  });
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Récupérer les spectacles
        const spectaclesResponse = await fetch(`${API_URL}/api/admin/spectacles`, { headers });
        if (!spectaclesResponse.ok) throw new Error('Erreur lors de la récupération des spectacles');
        const spectaclesData = await spectaclesResponse.json();
        setSpectacles(spectaclesData);

        // Charger les disponibilités pour chaque spectacle (jauge)
        try {
          const entries = await Promise.all(
            spectaclesData.map(async (s: Spectacle) => {
              try {
                const r = await fetch(`${API_URL}/api/reservations/availability/${s.id}`);
                if (!r.ok) return null;
                const d = await r.json();
                return [s.id, { places_total: d.places_total, places_reservees: d.places_reservees, places_restantes: d.places_restantes }] as const;
              } catch {
                return null;
              }
            })
          );
          const map: Record<number, AvailabilityData> = {};
          entries.forEach((e) => { if (e) map[e[0]] = e[1]; });
          setAvailability(map);
        } catch {
          setAvailability({});
        }

        // Récupérer les artistes
        const artistsResponse = await fetch(`${API_URL}/api/admin/artistes`, { headers });
        if (!artistsResponse.ok) throw new Error('Erreur lors de la récupération des artistes');
        const artistsData = await artistsResponse.json();
        setArtists(artistsData);

        // Récupérer l'artiste à l'affiche
        const featuredResponse = await fetch(`${API_URL}/api/admin/featured`, { headers });
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json();
          setFeaturedArtist(featuredData);
        }

        // Récupérer les réservations
        const reservationsResponse = await fetch(`${API_URL}/api/admin/reservations`, { headers });
        if (!reservationsResponse.ok) throw new Error('Erreur lors de la récupération des réservations');
        const reservationsData = await reservationsResponse.json();
        setReservations(reservationsData);

        // Récupérer les images du lieu
        fetch(`${API_URL}/api/lieu/images`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setLieuImages(data);
            else setLieuImages([]);
          })
          .catch(() => setLieuImages([]));

        // Récupérer les utilisateurs
        const usersResponse = await fetch(`${API_URL}/api/admin/users`, { headers });
        if (!usersResponse.ok) {
          console.error('Erreur lors de la récupération des utilisateurs:', usersResponse.status, usersResponse.statusText);
          throw new Error('Erreur lors de la récupération des utilisateurs');
        }
        const usersData = await usersResponse.json();
        setUsers(usersData);

        // Récupérer les codes promo
        const promoCodesResponse = await fetch(`${API_URL}/api/admin/promo-codes`, { headers });
        if (!promoCodesResponse.ok) throw new Error('Erreur lors de la récupération des codes promo');
        const promoCodesData = await promoCodesResponse.json();
        setPromoCodes(promoCodesData);

        // Récupérer les abonnés newsletter
        try {
          const newsletterResponse = await fetch(`${API_URL}/api/admin/newsletter/subscribers`, { headers });
          if (newsletterResponse.ok) {
            const newsletterData = await newsletterResponse.json();
            setNewsletterSubscribers(newsletterData);
          }
        } catch {
          // Ignorer les erreurs de récupération des abonnés
        }

        // Récupérer l'email de contact
        try {
          const settingsRes = await fetch(`${API_URL}/api/admin/settings/contact-email`, { headers });
          if (settingsRes.ok) {
            const s = await settingsRes.json();
            setContactEmail(s.email || '');
          }
        } catch {
          // Ignorer les erreurs de récupération des paramètres
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  // Polling: rafraîchir périodiquement les jauges sur l'onglet Spectacles
  useEffect(() => {
    if (activeTab !== 'spectacles' || spectacles.length === 0) return;
    const ids = spectacles.map(s => s.id);

    const tick = async () => {
      try {
        const entries = await Promise.all(
          ids.map(async (id) => {
            try {
              const r = await fetch(`${API_URL}/api/reservations/availability/${id}`);
              if (!r.ok) return null;
              const d = await r.json();
              return [id, { places_total: d.places_total, places_reservees: d.places_reservees, places_restantes: d.places_restantes }] as const;
            } catch { return null; }
          })
        );
        const map: Record<number, { places_total: number; places_reservees: number; places_restantes: number }> = {};
        entries.forEach((e) => { if (e) map[e[0]] = e[1]; });
        setAvailability((prev) => ({ ...prev, ...map }));
      } catch {
        // Ignorer les erreurs de polling
      }
    };

    const interval = setInterval(tick, 10000);
    // Premier tick immédiat
    tick();
    return () => clearInterval(interval);
  }, [activeTab, spectacles, API_URL]);

  const handleEditSpectacleClick = (spectacle: Spectacle) => {
    setSelectedSpectacle(spectacle);
    
    // Debug: afficher le format de date reçu
    console.log('🔍 Date reçue du spectacle:', {
      original: spectacle.date_spectacle,
      type: typeof spectacle.date_spectacle,
      heure: spectacle.heure_spectacle
    });
    
    // Formater la date pour l'input HTML (YYYY-MM-DD)
    const formatDateForInput = (dateString: string) => {
      if (!dateString) return '';
      // Si la date contient un T (format ISO), on prend juste la partie date
      const dateOnly = dateString.split('T')[0];
      console.log('📅 Date formatée:', { original: dateString, formatted: dateOnly });
      return dateOnly;
    };

    // Formater l'heure pour l'input HTML (HH:mm)
    const formatTimeForInput = (timeString: string) => {
      if (!timeString) return '';
      // Si l'heure contient des secondes, on ne garde que HH:mm
      const timeOnly = timeString.split(':').slice(0, 2).join(':');
      console.log('⏰ Heure formatée:', { original: timeString, formatted: timeOnly });
      return timeOnly;
    };

    setSpectacleFormData({
      title: spectacle.title,
      img: spectacle.img,
      description: spectacle.description,
      date_spectacle: formatDateForInput(spectacle.date_spectacle),
      heure_spectacle: formatTimeForInput(spectacle.heure_spectacle),
      prix: spectacle.prix.toString(),
      artiste_id: spectacle.artiste_id.toString(),
      lieu: spectacle.lieu,
      places_disponibles: spectacle.places_disponibles != null ? String(spectacle.places_disponibles) : ''
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
      lieu: '',
      places_disponibles: ''
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
        ? `${API_URL}/api/admin/spectacles`
        : `${API_URL}/api/admin/spectacles/${selectedSpectacle?.id}`;
      
      const requestBody = {
        ...spectacleFormData,
        prix: parseFloat(spectacleFormData.prix),
        artiste_id: parseInt(spectacleFormData.artiste_id),
        places_disponibles: spectacleFormData.places_disponibles ? parseInt(spectacleFormData.places_disponibles) : undefined
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
      // Rafraîchir la jauge du spectacle créé/modifié
      if (updatedSpectacle?.id) {
        try {
          const r = await fetch(`${API_URL}/api/reservations/availability/${updatedSpectacle.id}`);
          if (r.ok) {
            const d = await r.json();
            setAvailability(prev => ({
              ...prev,
              [updatedSpectacle.id]: {
                places_total: d.places_total,
                places_reservees: d.places_reservees,
                places_restantes: d.places_restantes,
              }
            }));
          }
        } catch {
          // Ignorer les erreurs de mise à jour des disponibilités
        }
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
        ? `${API_URL}/api/admin/artiste`
        : `${API_URL}/api/admin/artiste/${selectedArtist?.id}`;
      
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

  const handleDeleteClick = (type: 'spectacle' | 'artist' | 'lieu' | 'user', id: number) => {
    if (type === 'lieu') {
      if (!window.confirm('Supprimer cette image ?')) return;
      fetch(`${API_URL}/api/lieu/images/${id}`, { method: 'DELETE' })
        .then(res => {
          if (!res.ok) throw new Error('Erreur lors de la suppression');
          setLieuImages((prev: LieuImage[]) => prev.filter(image => image.id !== id));
          toast.success('Image supprimée');
        })
        .catch(err => toast.error(err.message || 'Erreur'));
      return;
    }
    setItemToDelete({ type, id });
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      const token = localStorage.getItem('token');
      let url = '';
      
      switch (itemToDelete.type) {
        case 'spectacle':
          url = `${API_URL}/api/admin/spectacles/${itemToDelete.id}`;
          break;
        case 'artist':
          url = `${API_URL}/api/admin/artistes/${itemToDelete.id}`;
          break;
        case 'user':
          url = `${API_URL}/api/admin/users/${itemToDelete.id}`;
          break;
        case 'promocode':
          url = `${API_URL}/api/admin/promo-codes/${itemToDelete.id}`;
          break;
        default:
          throw new Error('Type d\'élément non reconnu');
      }

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

      switch (itemToDelete.type) {
        case 'spectacle':
        setSpectacles(prev => prev.filter(s => s.id !== itemToDelete.id));
          break;
        case 'artist':
        setArtists(prev => prev.filter(a => a.id !== itemToDelete.id));
          break;
        case 'user':
          setUsers(prev => prev.filter(u => u.id !== itemToDelete.id));
          break;
        case 'promocode':
          setPromoCodes(prev => prev.filter(pc => pc.id !== itemToDelete.id));
          break;
      }

      toast.success(`${itemToDelete.type === 'spectacle' ? 'Spectacle' : itemToDelete.type === 'artist' ? 'Artiste' : itemToDelete.type === 'promocode' ? 'Code promo' : 'Utilisateur'} supprimé avec succès`);
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

      const response = await fetch(`${API_URL}/api/admin/featured`, {
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

      const response = await fetch(`${API_URL}/api/admin/artiste`, {
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

      const response = await fetch(`${API_URL}/api/admin/artiste/${selectedArtist.id}`, {
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



const handleEditLieuClick = (img: LieuImage) => {
  setSelectedLieu(img);
  setLieuFormData({
    image_path: img.image_path,
    image_detail_path: img.image_detail_path,
    is_main: img.is_main,
  });
  setIsLieuModalOpen(true);
};

const handleLieuInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setLieuFormData(prev => ({ ...prev, [name]: value }));
};

const handleLieuSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Session expirée. Veuillez vous reconnecter.');
      return;
    }

    const url = `${API_URL}/api/lieu/images/${selectedLieu?.id}`;
    const method = 'PUT';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(lieuFormData),
    });

    if (!response.ok) throw new Error('Erreur lors de la sauvegarde');
    const data = await response.json();

    setLieuImages(prev =>
      prev.map(img => (img.id === data.id ? data : img))
    );

    setIsLieuModalOpen(false);
    toast.success('Image enregistrée');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur';
    toast.error(errorMessage);
  }
};

const handleDeleteLieu = async (id: number) => {
  if (!window.confirm('Supprimer cette image ?')) return;
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Session expirée. Veuillez vous reconnecter.');
      return;
    }

    const response = await fetch(
      `${API_URL}/api/lieu/images/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) throw new Error('Erreur lors de la suppression');
    setLieuImages(prev => prev.filter(img => img.id !== id));
    toast.success('Image supprimée');
  } catch (err) {
    toast.error(
      err instanceof Error ? err.message : 'Une erreur est survenue'
    );
  }
};

  const handleToggleUserStatus = async (user: User) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      const newStatus = user.isActive !== false ? false : true;
      const action = newStatus ? 'réactiver' : 'suspendre';

      if (!window.confirm(`Êtes-vous sûr de vouloir ${action} cet utilisateur ?`)) {
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/users/${user.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: newStatus })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Erreur lors de la ${action} de l'utilisateur`);
      }

      // Mettre à jour l'utilisateur dans la liste
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, isActive: newStatus } : u
      ));

      toast.success(`Utilisateur ${action} avec succès`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleAddPromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeFormData.code || !promoCodeFormData.value || !promoCodeFormData.valid_from || !promoCodeFormData.valid_until) {
      toast.error('Tous les champs sont requis');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/promo-codes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(promoCodeFormData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
          return;
        }
        throw new Error(data.error || data.details || 'Erreur lors de l\'ajout du code promo');
      }

      setPromoCodes([...promoCodes, data]);
      setPromoCodeFormData({
        code: '',
        type: 'percentage',
        value: '',
        description: '',
        is_active: true,
        max_uses: '',
        valid_from: '',
        valid_until: ''
      });
      setIsPromoCodeModalOpen(false);
      toast.success('Code promo ajouté avec succès');
    } catch (err) {
      console.error('Erreur complète:', err);
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleEditPromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPromoCode) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/promo-codes/${selectedPromoCode.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(promoCodeFormData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
          return;
        }
        throw new Error(data.error || 'Erreur lors de la modification du code promo');
      }

      setPromoCodes(promoCodes.map(pc => pc.id === selectedPromoCode.id ? data : pc));
      setSelectedPromoCode(null);
      setIsEditModalOpen(false);
      toast.success('Code promo modifié avec succès');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handlePromoCodeInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPromoCodeFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePromoCodeTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPromoCodeFormData(prev => ({
      ...prev,
      type: e.target.value as PromoCode['type']
    }));
  };

  const handlePromoCodeStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromoCodeFormData(prev => ({
      ...prev,
      is_active: e.target.checked
    }));
  };

  const handlePromoCodeMaxUsesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromoCodeFormData(prev => ({
      ...prev,
      max_uses: e.target.value
    }));
  };

  const handlePromoCodeValidFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromoCodeFormData(prev => ({
      ...prev,
      valid_from: e.target.value
    }));
  };

  const handlePromoCodeValidUntilChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromoCodeFormData(prev => ({
      ...prev,
      valid_until: e.target.value
    }));
  };

  // Fonctions pour la newsletter et emails
  const handleEmailInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEmailFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailFormData.subject || !emailFormData.message) {
      toast.error('Le sujet et le message sont requis');
      return;
    }

    try {
      setIsSendingEmail(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/newsletter/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailFormData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
          return;
        }
        throw new Error(data.error || 'Erreur lors de l\'envoi de l\'email');
      }

      setIsEmailModalOpen(false);
      setEmailFormData({ subject: '', message: '', recipients: 'all' });
      toast.success(`Email envoyé avec succès à ${data.recipientsCount} destinataires`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleEditPromoCodeClick = (promoCode: PromoCode) => {
    setSelectedPromoCode(promoCode);
    setPromoCodeFormData({
      code: promoCode.code,
      type: promoCode.type,
      value: promoCode.value.toString(),
      description: promoCode.description,
      is_active: promoCode.is_active,
      max_uses: promoCode.max_uses?.toString() || '',
      valid_from: promoCode.valid_from || '',
      valid_until: promoCode.valid_until || ''
    });
    setIsPromoCodeModalOpen(true);
    setIsAddingPromoCode(false);
  };

  const handleDeletePromoCode = async (id: number) => {
    if (!window.confirm('Supprimer ce code promo ?')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      const response = await fetch(
        `${API_URL}/api/admin/promo-codes/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Erreur lors de la suppression');
      setPromoCodes(prev => prev.filter(pc => pc.id !== id));
      toast.success('Code promo supprimé');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Une erreur est survenue'
      );
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

  function handleDeleteReservation(reservation_id: number): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard Administrateur</h1>
          <Link 
            to="/" 
            className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition duration-300 flex items-center space-x-2 w-full sm:w-auto justify-center"
          >
            <i className="fa-solid fa-arrow-left"></i>
            <span>Retour au site</span>
          </Link>
        </div>
        
        {/* Onglets */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div className="flex overflow-x-auto whitespace-nowrap gap-2 -mx-4 px-4 md:mx-0 md:px-0">
            <button
              onClick={() => setActiveTab('spectacles')}
              className={`shrink-0 px-4 py-2 rounded text-sm md:text-base ${
                activeTab === 'spectacles'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              } transition duration-300`}
            >
              Spectacles
            </button>
            <button
              onClick={() => setActiveTab('artists')}
              className={`shrink-0 px-4 py-2 rounded text-sm md:text-base ${
                activeTab === 'artists'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              } transition duration-300`}
            >
              Artistes
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`shrink-0 px-4 py-2 rounded text-sm md:text-base ${
                activeTab === 'featured'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              } transition duration-300`}
            >
              L'affiche
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`shrink-0 px-4 py-2 rounded text-sm md:text-base ${
                activeTab === 'reservations'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              } transition duration-300`}
            >
              Réservations
            </button>
            <button
              onClick={() => setActiveTab('lieu')}
              className={`shrink-0 px-4 py-2 rounded text-sm md:text-base ${activeTab === 'lieu' ? 'bg-yellow-400 text-black' : 'bg-gray-800 text-white hover:bg-gray-700'} transition duration-300`}
            >
              Lieu
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`shrink-0 px-4 py-2 rounded text-sm md:text-base ${activeTab === 'users' ? 'bg-yellow-400 text-black' : 'bg-gray-800 text-white hover:bg-gray-700'} transition duration-300`}
            >
              Utilisateurs
            </button>
            <button
              onClick={() => setActiveTab('promocodes')}
              className={`shrink-0 px-4 py-2 rounded text-sm md:text-base ${
                activeTab === 'promocodes'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              } transition duration-300`}
            >
              Codes Promo
            </button>
            <button
              onClick={() => setActiveTab('newsletter')}
              className={`shrink-0 px-4 py-2 rounded text-sm md:text-base ${
                activeTab === 'newsletter'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              } transition duration-300`}
            >
              Newsletter
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`shrink-0 px-4 py-2 rounded text-sm md:text-base ${
                activeTab === 'settings'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              } transition duration-300`}
            >
              Paramètres
            </button>
          </div>
                      {/* Boutons d'ajout selon l'onglet actif */}
            {activeTab === 'spectacles' && (
            <button
                onClick={handleAddSpectacleClick}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 flex items-center space-x-2 w-full md:w-auto justify-center"
            >
              <i className="fa-solid fa-plus"></i>
                <span>Ajouter un spectacle</span>
              </button>
            )}
            {activeTab === 'artists' && (
              <button
                onClick={handleAddArtistClick}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 flex items-center space-x-2 w-full md:w-auto justify-center"
              >
                <i className="fa-solid fa-plus"></i>
                <span>Ajouter un artiste</span>
              </button>
            )}
            {activeTab === 'promocodes' && (
              <button
                onClick={() => {
                  setSelectedPromoCode(null);
                  setPromoCodeFormData({
                    code: '',
                    type: 'percentage',
                    value: '',
                    description: '',
                    is_active: true,
                    max_uses: '',
                    valid_from: '',
                    valid_until: ''
                  });
                  setIsPromoCodeModalOpen(true);
                  setIsAddingPromoCode(true);
                }}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 flex items-center space-x-2 w-full md:w-auto justify-center"
              >
                <i className="fa-solid fa-plus"></i>
                <span>Ajouter un code promo</span>
            </button>
          )}
            {activeTab === 'newsletter' && (
              <button
                onClick={() => {
                  setEmailFormData({
                    subject: '',
                    message: '',
                    recipients: 'all'
                  });
                  setIsEmailModalOpen(true);
                }}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 flex items-center space-x-2 w-full md:w-auto justify-center"
              >
                <i className="fa-solid fa-envelope"></i>
                <span>Envoyer un email</span>
            </button>
          )}
        </div>

        {/* Content */}
        {activeTab === 'featured' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Artiste à l'affiche (automatique)</h2>
            {featuredArtist ? (
              <div className="flex items-start space-x-6">
                <img 
                  src={buildImgSrc('photo_artiste', featuredArtist.photo)} 
                  alt={featuredArtist.name} 
                  className="w-48 h-48 object-cover rounded-lg"
                  onError={onImgErrorSwap}
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{featuredArtist.name}</h3>
                  <p className="text-gray-400 mb-4">{featuredArtist.biographie}</p>
                  {featuredArtist.next_show && (
                    <div className="mt-2 text-sm text-yellow-400">
                      Prochain spectacle : {featuredArtist.next_show.title} le {new Date(featuredArtist.next_show.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} à {featuredArtist.next_show.time?.slice(0,5)}
                    </div>
                  )}
                </div>
              </div>
            ) :
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">Aucun artiste n'est actuellement à l'affiche</p>
              </div>
            }
          </div>
        )}

        {activeTab === 'spectacles' && (
          spectacles.length === 0 ? (
            <p className="text-gray-400 text-center">Aucun spectacle</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spectacles.map((spectacle) => (
                <div key={spectacle.id} className="bg-gray-800 rounded-lg overflow-hidden">
                  <img src={buildImgSrc('spectacles', spectacle.img)} alt={spectacle.title} className="w-full h-48 object-cover" onError={onImgErrorSwap} />
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-white mb-2">{spectacle.title}</h3>
                    <p className="text-gray-400 mb-2">Artiste: {spectacle.artiste_name}</p>
                    <p className="text-gray-400 mb-2">
                        Date: {new Date(spectacle.date_spectacle).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-gray-400 mb-2">Prix: {spectacle.prix}€</p>
                    {/* Jauge de places restantes */}
                    {availability[spectacle.id] && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Places restantes</span>
                          <span>{availability[spectacle.id].places_restantes}/{availability[spectacle.id].places_total}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded h-2 overflow-hidden">
                          <div
                            className={`h-2 ${availability[spectacle.id].places_restantes > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.max(0, Math.min(100, (availability[spectacle.id].places_restantes / Math.max(1, availability[spectacle.id].places_total)) * 100))}%` }}
                          />
                        </div>
                        {availability[spectacle.id].places_restantes <= 0 && (
                          <div className="mt-2">
                            <span className="inline-block bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Complet</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button 
                        onClick={() => handleEditSpectacleClick(spectacle)}
                        className="w-full sm:w-auto bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition duration-300"
                      >
                        Modifier
                      </button>
                      <button 
                        onClick={() => handleDeleteClick('spectacle', spectacle.id)}
                        className="w-full sm:w-auto bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
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
                  <img src={buildImgSrc('photo_artiste', artist.photo)} alt={artist.name} className="w-full h-48 object-cover" onError={onImgErrorSwap} />
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-white mb-2">{artist.name}</h3>
                    <p className="text-gray-400 mb-2">
                      {artist.upcoming_shows} {artist.upcoming_shows > 1 ? 'spectacles' : 'spectacle'} à venir
                    </p>
                    <p className="text-gray-400 mb-4 line-clamp-3">{artist.biographie}</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button 
                        onClick={() => handleEditArtistClick(artist)}
                        className="w-full sm:w-auto bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition duration-300"
                      >
                        Modifier
                      </button>
                      <button 
                        onClick={() => handleDeleteClick('artist', artist.id)}
                        className="w-full sm:w-auto bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
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
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{reservation.title}</h3>
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
                        Réservation #{reservation.reservation_id}
                      </p>
                      <p className="text-gray-400 text-sm">ID: {reservation.reservation_id}</p>
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
                    <img 
                      src={buildImgSrc('image_path', img.image_path)} 
                      alt="lieu" 
                      className="w-full h-48 object-cover" 
                      onError={onImgErrorSwap}
                    />
                    <div className="p-4">
                      <p className="text-gray-400 mb-2 break-all"><b>Chemin:</b> {img.image_path}</p>
                      <p className="text-gray-400 mb-2"><b>Type:</b> {img.is_main ? <span className="text-green-400 font-bold">Principale</span> : <span className="text-blue-400">Galerie</span>}</p>
                      <div className="flex justify-center mt-2">
                        <button onClick={() => handleEditLieuClick(img)} className="w-full bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition duration-300">Modifier</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Gestion des utilisateurs</h2>
            {users.length === 0 ? (
              <p className="text-gray-400 text-center">Aucun utilisateur</p>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="bg-gray-900 rounded-lg p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {user.civility} {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-gray-400 mb-1">Email: {user.email}</p>
                        <p className="text-gray-400 mb-1">
                          Rôle: <span className={`font-semibold ${user.role === 'admin' ? 'text-yellow-400' : 'text-blue-400'}`}>
                            {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                          </span>
                        </p>
                        <p className="text-gray-400 mb-1">
                          Statut: <span className={`font-semibold ${user.isActive !== false ? 'text-green-400' : 'text-red-400'}`}>
                            {user.isActive !== false ? 'Actif' : 'Suspendu'}
                          </span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-700 rounded-lg p-3">
                        <p className="text-gray-400 text-sm">ID Utilisateur</p>
                        <p className="text-white font-semibold">{user.id}</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-3">
                        <p className="text-gray-400 text-sm">Civilité</p>
                        <p className="text-white font-semibold">{user.civility}</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-3">
                        <p className="text-gray-400 text-sm">Date de création</p>
                        <p className="text-white font-semibold">
                          {user.createdAt ? formatDate(user.createdAt) : 'Non disponible'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                      <div className="text-sm text-gray-400">
                        <p>Dernière connexion: {user.lastLogin ? formatDate(user.lastLogin) : 'Jamais connecté'}</p>
                      </div>
                      {user.role === 'admin' ? (
                        <span className="text-yellow-400 text-sm font-semibold">
                          ⚠️ Impossible de supprimer un administrateur
                        </span>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => handleToggleUserStatus(user)}
                            className={`w-full sm:w-auto px-4 py-2 rounded text-sm transition duration-300 ${
                              user.isActive !== false 
                                ? 'bg-orange-500 text-white hover:bg-orange-600' 
                                : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                          >
                            {user.isActive !== false ? 'Suspendre' : 'Réactiver'}
                          </button>
                          <button 
                            onClick={() => handleDeleteClick('user', user.id)}
                            className="w-full sm:w-auto bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
                          >
                            Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'promocodes' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Gestion des codes promo</h2>
            {promoCodes.length === 0 ? (
              <p className="text-gray-400 text-center">Aucun code promo</p>
            ) : (
              <div className="space-y-4">
                {promoCodes.map((promoCode) => (
                  <div key={promoCode.id} className="bg-gray-900 rounded-lg p-6">
                    <div className="mb-4">
                      <div>
                         <h3 className="text-xl font-bold text-white mb-2">Code: {promoCode.code}</h3>
                         <p className="text-gray-400 mb-1">
                           Type: <span className="text-yellow-400 font-semibold">
                             {promoCode.type === 'percentage' ? 'Pourcentage' : 
                              promoCode.type === 'fixed' ? 'Montant fixe' : 'Ticket gratuit'}
                           </span>
                         </p>
                         <p className="text-gray-400 mb-1">
                           Valeur: <span className="text-green-400 font-semibold">
                             {promoCode.type === 'percentage' ? `${promoCode.value}%` : 
                              promoCode.type === 'fixed' ? `${promoCode.value}€` : `${promoCode.value} ticket(s)`}
                           </span>
                         </p>
                         <p className="text-gray-400 mb-1">Description: {promoCode.description}</p>
                         <p className="text-gray-400 mb-1">
                           Statut: <span className={`font-semibold ${promoCode.is_active ? 'text-green-400' : 'text-red-400'}`}>
                             {promoCode.is_active ? 'Actif' : 'Inactif'}
                           </span>
                         </p>
                         <p className="text-gray-400 mb-1">
                           Utilisations: <span className="text-blue-400 font-semibold">
                             {promoCode.current_uses} / {promoCode.max_uses ? promoCode.max_uses : '∞'}
                           </span>
                         </p>
                         <p className="text-gray-400 mb-1">
                           Validité: {promoCode.valid_from ? formatDate(promoCode.valid_from) : 'Non définie'} - {promoCode.valid_until ? formatDate(promoCode.valid_until) : 'Non définie'}
                         </p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-700 flex justify-end">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleEditPromoCodeClick(promoCode)}
                          className="w-full sm:w-auto bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition duration-300"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeletePromoCode(promoCode.id)}
                          className="w-full sm:w-auto bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'newsletter' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Gestion de la Newsletter</h2>
            
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-400 text-black">
                    <i className="fa-solid fa-users text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-400 text-sm">Abonnés Newsletter</p>
                    <p className="text-white text-2xl font-bold">{newsletterSubscribers.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-400 text-black">
                    <i className="fa-solid fa-user text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-400 text-sm">Utilisateurs Totaux</p>
                    <p className="text-white text-2xl font-bold">{users.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-400 text-black">
                    <i className="fa-solid fa-envelope text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-400 text-sm">Taux d'Abonnement</p>
                    <p className="text-white text-2xl font-bold">
                      {users.length > 0 ? Math.round((newsletterSubscribers.length / users.length) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des abonnés */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Liste des abonnés à la newsletter</h3>
              {newsletterSubscribers.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Aucun abonné à la newsletter</p>
              ) : (
                <div className="space-y-3">
                  {newsletterSubscribers.map((email, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                          <i className="fa-solid fa-envelope text-black"></i>
                        </div>
                        <div className="ml-4">
                          <p className="text-white font-semibold">{email}</p>
                          <p className="text-gray-400 text-sm">Abonné à la newsletter</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <i className="fa-solid fa-check mr-1"></i>
                          Actif
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
                  <label className="block text-white mb-2">Places disponibles (capacité)</label>
                  <input
                    type="number"
                    name="places_disponibles"
                    value={spectacleFormData.places_disponibles}
                    onChange={handleSpectacleInputChange}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    min="0"
                    step="1"
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

        {activeTab === 'settings' && (
          <div className="bg-gray-800 rounded-lg p-6 max-w-xl">
            <h2 className="text-2xl font-bold text-white mb-6">Paramètres</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Email de réception des messages (Contact)</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded px-4 py-2"
                  placeholder="contact@exemple.com"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('token');
                      const res = await fetch(`${API_URL}/api/admin/settings/contact-email`, {
                        method: 'PUT',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email: contactEmail })
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || 'Erreur lors de la sauvegarde');
                      setContactEmail(data.email);
                      toast.success('Email de contact sauvegardé');
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue');
                    }
                  }}
                  className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition duration-300"
                >
                  Enregistrer
                </button>
              </div>
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
                Êtes-vous sûr de vouloir supprimer {
                  itemToDelete?.type === 'spectacle' ? 'ce spectacle' : 
                  itemToDelete?.type === 'artist' ? 'cet artiste' : 
                  itemToDelete?.type === 'promocode' ? 'ce code promo' : 
                  'cet utilisateur'
                } ? 
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
                      src={buildImgSrc('photo_artiste', artist.photo)}
                      alt={artist.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                      onError={onImgErrorSwap}
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
                  <button type="button" onClick={() => { setIsLieuModalOpen(false); }} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition duration-300">Annuler</button>
                  <button type="submit" className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition duration-300">Enregistrer</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal ajout/modif code promo */}
        {isPromoCodeModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">
                {isAddingPromoCode ? 'Ajouter un code promo' : 'Modifier le code promo'}
              </h2>
              <form onSubmit={isAddingPromoCode ? handleAddPromoCode : handleEditPromoCode} className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Code</label>
                  <input
                    type="text"
                    name="code"
                    value={promoCodeFormData.code}
                    onChange={handlePromoCodeInputChange}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Type</label>
                                     <select
                     name="type"
                     value={promoCodeFormData.type}
                     onChange={handlePromoCodeTypeChange}
                     className="w-full bg-gray-700 text-white rounded px-4 py-2"
                     required
                   >
                     <option value="percentage">Pourcentage (%)</option>
                     <option value="fixed">Montant fixe (€)</option>
                     <option value="free_ticket">Ticket gratuit</option>
                   </select>
                </div>
                <div>
                  <label className="block text-white mb-2">Valeur</label>
                  <input
                    type="number"
                    name="value"
                    value={promoCodeFormData.value}
                    onChange={handlePromoCodeInputChange}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Description</label>
                  <textarea
                    name="description"
                    value={promoCodeFormData.description}
                    onChange={handlePromoCodeInputChange}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    rows={4}
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={promoCodeFormData.is_active}
                    onChange={handlePromoCodeStatusChange}
                    className="mr-2"
                  />
                  <label className="text-white">Actif</label>
                </div>
                <div>
                  <label className="block text-white mb-2">Utilisations maximales</label>
                  <input
                    type="number"
                    name="max_uses"
                    value={promoCodeFormData.max_uses}
                    onChange={handlePromoCodeMaxUsesChange}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    min="0"
                    placeholder="0 pour illimité"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Date de début</label>
                  <input
                    type="date"
                    name="valid_from"
                    value={promoCodeFormData.valid_from}
                    onChange={handlePromoCodeValidFromChange}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Date de fin</label>
                  <input
                    type="date"
                    name="valid_until"
                    value={promoCodeFormData.valid_until}
                    onChange={handlePromoCodeValidUntilChange}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPromoCodeModalOpen(false);
                      setIsAddingPromoCode(false);
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition duration-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition duration-300"
                  >
                    {isAddingPromoCode ? 'Ajouter' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal d'envoi d'email */}
        {isEmailModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">Envoyer un email</h2>
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Destinataires</label>
                  <select
                    name="recipients"
                    value={emailFormData.recipients}
                    onChange={handleEmailInputChange}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    required
                  >
                    <option value="all">Tous les utilisateurs ({users.length})</option>
                    <option value="newsletter">Abonnés newsletter ({newsletterSubscribers.length})</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white mb-2">Sujet</label>
                  <input
                    type="text"
                    name="subject"
                    value={emailFormData.subject}
                    onChange={handleEmailInputChange}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    placeholder="Sujet de l'email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Message</label>
                  <textarea
                    name="message"
                    value={emailFormData.message}
                    onChange={handleEmailInputChange}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    rows={8}
                    placeholder="Contenu de votre message..."
                    required
                  />
                </div>
                <div className="bg-yellow-400 text-black p-4 rounded-lg">
                  <p className="font-semibold mb-2">⚠️ Attention</p>
                  <p className="text-sm">
                    Cet email sera envoyé à {emailFormData.recipients === 'all' ? users.length : newsletterSubscribers.length} destinataire(s).
                    Assurez-vous que votre message est approprié et respecte les règles de confidentialité.
                  </p>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEmailModalOpen(false);
                      setEmailFormData({ subject: '', message: '', recipients: 'all' });
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition duration-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingEmail}
                    className={`px-4 py-2 rounded transition duration-300 ${
                      isSendingEmail
                        ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                        : 'bg-yellow-400 text-black hover:bg-yellow-300'
                    }`}
                  >
                    {isSendingEmail ? (
                      <span className="flex items-center">
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                        Envoi en cours...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <i className="fa-solid fa-paper-plane mr-2"></i>
                        Envoyer
                      </span>
                    )}
                  </button>
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