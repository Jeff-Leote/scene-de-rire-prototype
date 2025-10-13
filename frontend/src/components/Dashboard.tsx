import { useState, useEffect } from 'react';
import { buildImgSrc, onImgErrorSwap } from '@/utils/image';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from "@/components/ui/sonner";
import { Spectacle, Artist, ArtistFormData, FeaturedArtist, User } from '../services/types';

interface LieuImage {
  id: number;
  image_path: string;
  image_detail_path?: string;
  is_main: boolean;
}

// Availability, reservations, promo codes removed

const Dashboard = () => {
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;
  const [spectacles, setSpectacles] = useState<Spectacle[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [activeTab, setActiveTab] = useState<'spectacles' | 'artists' | 'lieu' | 'users' | 'photos' | 'newsletter' | 'settings' | 'maintenance' | 'sponsorise'>('spectacles');
  const [maintenanceEnabled, setMaintenanceEnabled] = useState<boolean>(false);
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
  const [itemToDelete, setItemToDelete] = useState<{ type: 'spectacle' | 'artist' | 'user', id: number } | null>(null);
  const [spectacleFormData, setSpectacleFormData] = useState({
    title: '',
    img: '/assets/img/spectacles/',
    description: '',
    date_spectacle: '',
    heure_spectacle: '',
    lieu: '',
    lien_spectacle: '',
    recurrence_enabled: false,
    recurrence_weekday: 0,
    recurrence_time: '17:00',
    recurrence_start: '',
    recurrence_end: ''
  });
  const [artistFormData, setArtistFormData] = useState({
    name: '',
    photo: ''
  });
  // L'affiche retiré
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [lieuImages, setLieuImages] = useState<LieuImage[]>([]);
  const [isLieuModalOpen, setIsLieuModalOpen] = useState(false);

  const [selectedLieu, setSelectedLieu] = useState<LieuImage | null>(null);
  const [lieuFormData, setLieuFormData] = useState({ image_path: '', is_main: false });
  const [users, setUsers] = useState<User[]>([]);
  
  // Photos additionnels (admin)
  const [additionnalPhotos, setAdditionnalPhotos] = useState<Array<{ id: number; image_path: string; sort_order: number | null }>>([]);
  const [newPhotoPath, setNewPhotoPath] = useState<string>('');
  const [newPhotoOrder, setNewPhotoOrder] = useState<string>('');

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
        const { api } = await import('@/services/api');

        // Récupérer les spectacles
        const spectaclesData = await api.get<Spectacle[]>('/api/admin/spectacles');
        setSpectacles(spectaclesData);

        // Disponibilités supprimées

        // Récupérer les artistes
        const artistsData = await api.get<Artist[]>('/api/admin/artistes');
        setArtists(artistsData);

        // Section L'affiche retirée

        // Réservations supprimées

        // Récupérer les images du lieu
        try {
          const lieuData = await api.get<LieuImage[]>('/api/lieu/images');
          if (Array.isArray(lieuData)) setLieuImages(lieuData);
            else setLieuImages([]);
        } catch {
          setLieuImages([]);
        }

        // Récupérer les utilisateurs
        try {
          const usersData = await api.get<User[]>('/api/admin/users');
          setUsers(usersData);
        } catch (err) {
          console.error('Erreur lors de la récupération des utilisateurs:', err);
          setUsers([]);
        }

        // Codes promo supprimés

        // Récupérer les abonnés newsletter
        try {
          const newsletterData = await api.get<string[]>('/api/admin/newsletter/subscribers');
          setNewsletterSubscribers(newsletterData);
        } catch {
          // Ignorer les erreurs de récupération des abonnés
        }

        // Récupérer l'email de contact
        try {
          const s = await api.get<{ email: string }>('/api/admin/settings/contact-email');
          setContactEmail(s.email || '');
        } catch {
          // Ignorer les erreurs de récupération des paramètres
        }

        // Récupérer l'état maintenance (public)
        try {
          const m = await api.get<{ maintenance_enabled: boolean }>('/api/settings/maintenance');
          setMaintenanceEnabled(Boolean(m.maintenance_enabled));
        } catch {}

        // Charger les photos additionnelles
        await loadAdditionnalPhotos();

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  // Polling disponibilités supprimé

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
      lieu: spectacle.lieu,
      lien_spectacle: spectacle.lien_spectacle || '',
      recurrence_enabled: false,
      recurrence_weekday: 0,
      recurrence_time: '17:00',
      recurrence_start: '',
      recurrence_end: ''
    });
    setIsSpectacleModalOpen(true);
  };

  const handleEditArtistClick = (artist: Artist) => {
    setSelectedArtist(artist);
    setArtistFormData({
      name: artist.name,
      photo: artist.photo
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
      img: '/assets/img/spectacles/',
      description: '',
      date_spectacle: '',
      heure_spectacle: '',
      lieu: '',
      lien_spectacle: '',
      recurrence_enabled: false,
      recurrence_weekday: 0,
      recurrence_time: '17:00',
      recurrence_start: '',
      recurrence_end: ''
    });
    setIsSpectacleModalOpen(true);
  };

  const handleAddArtistClick = () => {
    setIsAddingArtist(true);
    setSelectedArtist(null);
    setArtistFormData({
      name: '',
      photo: ''
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
      
      const requestBody = spectacleFormData.recurrence_enabled ? {
        title: spectacleFormData.title,
        img: spectacleFormData.img,
        description: spectacleFormData.description,
        lieu: spectacleFormData.lieu,
        lien_spectacle: spectacleFormData.lien_spectacle || null,
        recurrence: {
          enabled: true,
          weekday: Number(spectacleFormData.recurrence_weekday),
          time: spectacleFormData.recurrence_time,
          startDate: spectacleFormData.recurrence_start,
          endDate: spectacleFormData.recurrence_end,
        }
      } : {
        title: spectacleFormData.title,
        img: spectacleFormData.img,
        description: spectacleFormData.description,
        date_spectacle: spectacleFormData.date_spectacle,
        heure_spectacle: spectacleFormData.heure_spectacle,
        lieu: spectacleFormData.lieu,
        lien_spectacle: spectacleFormData.lien_spectacle || null,
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
      // Disponibilités supprimées
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

      const artistData = {
        ...artistFormData
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
      }

      toast.success(`${itemToDelete.type === 'spectacle' ? 'Spectacle' : itemToDelete.type === 'artist' ? 'Artiste' : 'Utilisateur'} supprimé avec succès`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setShowDeleteConfirmation(false);
      setItemToDelete(null);
    }
  };

  // L'affiche: fonctionnalités retirées

  const handleEditArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArtist) return;

    try {
      const formData = new FormData();
      formData.append('name', selectedArtist.name);
      
      // Gestion des photos
      const photoInput = document.querySelector('input[name="photo"]') as HTMLInputElement;
      if (photoInput?.files?.[0]) {
        formData.append('photo', photoInput.files[0]);
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

  // ====== Admin Photos logic ======
  const loadAdditionnalPhotos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/photos/admin/spectacle/1`, { // Utilise un ID fictif car la route retourne toutes les photos
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur chargement photos');
      setAdditionnalPhotos(data);
    } catch (e) {
      setAdditionnalPhotos([]);
      toast.error(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const handleAddPhoto = async () => {
    try {
      if (!newPhotoPath) {
        toast.error('Indiquez le chemin de l\'image');
        return;
      }
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/photos/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ image_path: newPhotoPath, sort_order: newPhotoOrder ? parseInt(newPhotoOrder) : null })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur ajout photo');
      setNewPhotoPath('');
      setNewPhotoOrder('');
      await loadAdditionnalPhotos();
      toast.success('Photo ajoutée');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/photos/admin/${photoId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur suppression photo');
      await loadAdditionnalPhotos();
      toast.success('Photo supprimée');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    }
  };

  // Promo codes supprimés

  // Promo codes supprimés

  // Promo codes supprimés

  // Promo codes supprimés

  // Promo codes supprimés

  // Promo codes supprimés

  // Promo codes supprimés

  // Promo codes supprimés

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

  // Codes promo supprimés

  // Codes promo supprimés

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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard Administrateur</h1>
          <Link 
            to="/" 
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300 flex items-center space-x-2 w-full sm:w-auto justify-center"
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
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              } transition duration-300`}
            >
              Spectacles
            </button>
            <button
              onClick={() => setActiveTab('artists')}
              className={`shrink-0 px-4 py-2 rounded text-sm md:text-base ${
                activeTab === 'artists'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              } transition duration-300`}
            >
              Artistes
            </button>
            {/* Onglet L'affiche retiré */}
            {/* Onglet Réservations supprimé */}
            <button
              onClick={() => setActiveTab('lieu')}
              className={`shrink-0 px-4 py-2 rounded text-sm md:text-base ${activeTab === 'lieu' ? 'bg-red-500 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'} transition duration-300`}
            >
              Lieu
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`shrink-0 px-4 py-2 rounded text-sm md:text-base ${activeTab === 'users' ? 'bg-red-500 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'} transition duration-300`}
            >
              Utilisateurs
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`shrink-0 px-4 py-2 rounded text-sm md:text-base ${activeTab === 'photos' ? 'bg-red-500 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'} transition duration-300`}
            >
              Photos
            </button>
            {/* Onglet Codes Promo supprimé */}
            <button
              onClick={() => setActiveTab('newsletter')}
              className={`shrink-0 px-4 py-2 rounded text-sm md:text-base ${
                activeTab === 'newsletter'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              } transition duration-300`}
            >
              Newsletter
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`shrink-0 px-4 py-2 rounded text-sm md:text-base ${
                activeTab === 'settings'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              } transition duration-300`}
            >
              Paramètres
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`shrink-0 px-4 py-2 rounded text-sm md:text-base ${
                activeTab === 'maintenance'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              } transition duration-300`}
            >
              Maintenance
            </button>
            <button
              onClick={() => setActiveTab('sponsorise')}
              className={`shrink-0 px-4 py-2 rounded text-sm md:text-base ${
                activeTab === 'sponsorise'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              } transition duration-300`}
            >
              Sponsorisé
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
            {/* Bouton codes promo supprimé */}
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
        {/* Section L'affiche retirée */}

        {activeTab === 'spectacles' && (
          spectacles.length === 0 ? (
            <p className="text-gray-400 text-center">Aucun spectacle</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spectacles.map((spectacle) => (
                <div key={spectacle.id} className="bg-gray-800 rounded-lg overflow-hidden">
                  <img src={buildImgSrc('spectacles', (spectacle.img || '').replace(/\.(jpe?g)$/i, '.webp'))} alt={spectacle.title} className="w-full h-48 object-cover" onError={onImgErrorSwap} />
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-white mb-2">{spectacle.title}</h3>
                    <p className="text-gray-400 mb-2">
                        Date: {new Date(spectacle.date_spectacle).toLocaleDateString('fr-FR')}
                    </p>
                    {/* Prix et jauge de disponibilités supprimés */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button 
                        onClick={() => handleEditSpectacleClick(spectacle)}
                        className="w-full sm:w-auto bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
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
                  <img src={buildImgSrc('photo_artiste', (artist.photo || '').replace(/\.(jpe?g)$/i, '.webp'))} alt={artist.name} className="w-full h-48 object-cover" onError={onImgErrorSwap} />
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-white mb-2">{artist.name}</h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button 
                        onClick={() => handleEditArtistClick(artist)}
                        className="w-full sm:w-auto bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
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

        {/* Bloc Réservations supprimé */}

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
                        <button onClick={() => handleEditLieuClick(img)} className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300">Modifier</button>
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
                          Rôle: <span className={`font-semibold ${user.role === 'admin' ? 'text-red-500' : 'text-blue-400'}`}>
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
                        <span className="text-red-500 text-sm font-semibold">
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

        {activeTab === 'photos' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Photos additionnelles</h2>
            {additionnalPhotos.length === 0 ? (
              <p className="text-gray-400 text-center">Aucune photo additionnelle.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {additionnalPhotos.map(p => (
                  <div key={p.id} className="bg-gray-900 rounded-lg overflow-hidden">
                    <img 
                      src={buildImgSrc('photo_addictionnel', (p.image_path || '').replace(/\.(jpe?g)$/i, '.webp'))} 
                      alt="photo" 
                      className="w-full h-48 object-cover" 
                      onError={onImgErrorSwap} 
                    />
                    <div className="p-4">
                      <p className="text-gray-400 mb-2 break-all"><b>Chemin:</b> {p.image_path}</p>
                      <p className="text-gray-400 mb-2"><b>Ordre:</b> {p.sort_order || <span className="text-gray-500">Non défini</span>}</p>
                      <div className="flex justify-center mt-2">
                        <button className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300">Modifier</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bloc Codes Promo supprimé */}

        {activeTab === 'newsletter' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Gestion de la Newsletter</h2>
            
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-500 text-white">
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
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
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
                  <label className="block text-white mb-2">Image (WEBP recommandé)</label>
                  <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const token = localStorage.getItem('token');
                          const form = new FormData();
                          form.append('file', file);
                          const res = await fetch(`${API_URL}/api/admin/upload/spectacle-image`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` },
                            body: form
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || 'Upload échoué');
                          setSpectacleFormData(prev => ({ ...prev, img: data.path }));
                          toast.success('Image téléversée');
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : 'Erreur upload');
                        }
                      }}
                      className="bg-gray-700 text-white rounded px-4 py-2 w-full md:w-auto"
                    />
                  <input
                    type="text"
                    name="img"
                    value={spectacleFormData.img}
                    onChange={handleSpectacleInputChange}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                      placeholder="/assets/img/spectacles/mon_image.webp"
                    required
                  />
                  </div>
                  <p className="text-gray-400 text-xs mt-2">Max 5 Mo, conversion en .webp côté serveur.</p>
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
                <div className="bg-gray-900 rounded p-4 space-y-3">
                  <label className="inline-flex items-center gap-2 text-white">
                    <input
                      type="checkbox"
                      checked={spectacleFormData.recurrence_enabled}
                      onChange={(e) => setSpectacleFormData(prev => ({ ...prev, recurrence_enabled: e.target.checked }))}
                    />
                    Ajouter en récurrence (hebdomadaire)
                  </label>
                  {!spectacleFormData.recurrence_enabled ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                        <label className="block text-white mb-2">Jour de la semaine</label>
                        <select
                          value={spectacleFormData.recurrence_weekday}
                          onChange={(e) => setSpectacleFormData(prev => ({ ...prev, recurrence_weekday: Number(e.target.value) }))}
                          className="w-full bg-gray-700 text-white rounded px-4 py-2"
                        >
                          <option value={1}>Lundi</option>
                          <option value={2}>Mardi</option>
                          <option value={3}>Mercredi</option>
                          <option value={4}>Jeudi</option>
                          <option value={5}>Vendredi</option>
                          <option value={6}>Samedi</option>
                          <option value={0}>Dimanche</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-white mb-2">Heure</label>
                  <input
                          type="time"
                          value={spectacleFormData.recurrence_time}
                          onChange={(e) => setSpectacleFormData(prev => ({ ...prev, recurrence_time: e.target.value }))}
                          className="w-full bg-gray-700 text-white rounded px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-white mb-2">Début</label>
                        <input
                          type="date"
                          value={spectacleFormData.recurrence_start}
                          onChange={(e) => setSpectacleFormData(prev => ({ ...prev, recurrence_start: e.target.value }))}
                          className="w-full bg-gray-700 text-white rounded px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-white mb-2">Fin</label>
                        <input
                          type="date"
                          value={spectacleFormData.recurrence_end}
                          onChange={(e) => setSpectacleFormData(prev => ({ ...prev, recurrence_end: e.target.value }))}
                          className="w-full bg-gray-700 text-white rounded px-4 py-2"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-white mb-2">Lien vers la billetterie</label>
                  <input
                    type="url"
                    name="lien_spectacle"
                    value={spectacleFormData.lien_spectacle}
                    onChange={handleSpectacleInputChange}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    placeholder="https://billetterie.example.com/spectacle/1"
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
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
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
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="bg-gray-800 rounded-lg p-6 max-w-xl">
            <h2 className="text-2xl font-bold text-white mb-6">Maintenance</h2>
            <p className="text-gray-300 mb-4">
              Quand la maintenance est activée, seuls les administrateurs connectés peuvent voir le site. Les utilisateurs voient une page de maintenance.
            </p>
            <div className="flex items-center justify-between bg-gray-900 rounded-lg p-4">
              <span className="text-white font-semibold">Activer la maintenance</span>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={maintenanceEnabled} onChange={async (e) => {
                  try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_URL}/api/admin/settings/maintenance`, {
                      method: 'PUT',
                      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                      body: JSON.stringify({ enabled: e.target.checked })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Erreur lors de la mise à jour');
                    setMaintenanceEnabled(Boolean(data.maintenance_enabled));
                    toast.success(`Maintenance ${e.target.checked ? 'activée' : 'désactivée'}`);
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : 'Une erreur est survenue');
                  }
                }} />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute relative after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'sponsorise' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Pages Sponsorisées</h2>
            <p className="text-gray-300 mb-6">
              Ces pages sont accessibles via des liens directs mais ne s'affichent pas sur le site principal. 
              Copiez les liens pour partager les spectacles récurrents.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tchatcheur Comedy Club */}
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Tchatcheur Comedy Club</h3>
                <p className="text-gray-300 mb-4">Le lundi, mardi, mercredi et vendredi à 20h00</p>
                <div className="bg-gray-800 rounded p-3 mb-4">
                  <p className="text-gray-400 text-sm mb-2">Lien à copier :</p>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={`${window.location.origin}/sponsorise/tchatcheur-comedy-club`}
                      readOnly
                      className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/sponsorise/tchatcheur-comedy-club`);
                        toast.success('Lien copié !');
                      }}
                      className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition duration-300"
                    >
                      <i className="fa-solid fa-copy"></i>
                    </button>
                  </div>
                </div>
                <a 
                  href={`${window.location.origin}/sponsorise/tchatcheur-comedy-club`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-red-400 hover:text-red-300 transition duration-300"
                >
                  <i className="fa-solid fa-external-link-alt mr-2"></i>
                  Ouvrir la page
                </a>
              </div>

              {/* Un Ado peut en cacher un autre */}
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Un Ado peut en cacher un autre</h3>
                <p className="text-gray-300 mb-4">Le dimanche à 17h00</p>
                <div className="bg-gray-800 rounded p-3 mb-4">
                  <p className="text-gray-400 text-sm mb-2">Lien à copier :</p>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={`${window.location.origin}/sponsorise/un-ado-peut-en-cacher-un-autre`}
                      readOnly
                      className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/sponsorise/un-ado-peut-en-cacher-un-autre`);
                        toast.success('Lien copié !');
                      }}
                      className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition duration-300"
                    >
                      <i className="fa-solid fa-copy"></i>
                    </button>
                  </div>
                </div>
                <a 
                  href={`${window.location.origin}/sponsorise/un-ado-peut-en-cacher-un-autre`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-red-400 hover:text-red-300 transition duration-300"
                >
                  <i className="fa-solid fa-external-link-alt mr-2"></i>
                  Ouvrir la page
                </a>
              </div>

              {/* Chéri je t'ai trompé */}
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Chéri je t'ai trompé (et c'est pas ça le pire...)</h3>
                <p className="text-gray-300 mb-4">Le dimanche à 18h30</p>
                <div className="bg-gray-800 rounded p-3 mb-4">
                  <p className="text-gray-400 text-sm mb-2">Lien à copier :</p>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={`${window.location.origin}/sponsorise/cheri-je-tai-trompe`}
                      readOnly
                      className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/sponsorise/cheri-je-tai-trompe`);
                        toast.success('Lien copié !');
                      }}
                      className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition duration-300"
                    >
                      <i className="fa-solid fa-copy"></i>
                    </button>
                  </div>
                </div>
                <a 
                  href={`${window.location.origin}/sponsorise/cheri-je-tai-trompe`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-red-400 hover:text-red-300 transition duration-300"
                >
                  <i className="fa-solid fa-external-link-alt mr-2"></i>
                  Ouvrir la page
                </a>
              </div>

              {/* Kaci dans La connerie humaine */}
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Kaci dans La connerie humaine</h3>
                <p className="text-gray-300 mb-4">Le dimanche à 20h00</p>
                <div className="bg-gray-800 rounded p-3 mb-4">
                  <p className="text-gray-400 text-sm mb-2">Lien à copier :</p>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={`${window.location.origin}/sponsorise/kaci-dans-la-connerie-humaine`}
                      readOnly
                      className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/sponsorise/kaci-dans-la-connerie-humaine`);
                        toast.success('Lien copié !');
                      }}
                      className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition duration-300"
                    >
                      <i className="fa-solid fa-copy"></i>
                    </button>
                  </div>
                </div>
                <a 
                  href={`${window.location.origin}/sponsorise/kaci-dans-la-connerie-humaine`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-red-400 hover:text-red-300 transition duration-300"
                >
                  <i className="fa-solid fa-external-link-alt mr-2"></i>
                  Ouvrir la page
                </a>
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
                  <div className="flex flex-col md:flex-row gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const token = localStorage.getItem('token');
                          const form = new FormData();
                          form.append('file', file);
                          const res = await fetch(`${API_URL}/api/admin/upload/artiste-image`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` },
                            body: form
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || 'Upload échoué');
                          setArtistFormData(prev => ({ ...prev, photo: data.path }));
                          toast.success('Image téléversée');
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : 'Erreur upload');
                        }
                      }}
                      className="bg-gray-700 text-white rounded px-4 py-2 w-full md:w-auto"
                    />
                  <input
                    type="text"
                    name="photo"
                    value={artistFormData.photo}
                    onChange={handleArtistInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-red-500"
                      placeholder="/assets/img/photo_artiste/mon_image.webp"
                  />
                </div>
                  <p className="text-gray-400 text-xs mt-2">Max 5 Mo, conversion en .webp côté serveur.</p>
                </div>
                {/* Champ Biographie retiré */}
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
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
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

        {/* Modal L'affiche retiré */}

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
                  <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300">Enregistrer</button>
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
                <div className="bg-red-500 text-white p-4 rounded-lg">
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
                        : 'bg-red-500 text-white hover:bg-red-600'
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