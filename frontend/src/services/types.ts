// Interfaces pour les utilisateurs
export interface User {
  id: number;
  email: string;
  civility: string;
  firstName: string;
  lastName: string;
  role: string;
}

// Interfaces pour les spectacles
export interface Spectacle {
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

// Interfaces pour les artistes
export interface Artist {
  id: number;
  name: string;
  photo: string;
  photo_featured: string;
  biographie: string;
  upcoming_shows: number;
}

export interface ArtistFormData {
  name: string;
  biographie: string;
  photo: string;
  photo_featured: string;
}

// Interfaces pour les réservations
export interface Reservation {
  reservation_id: number;
  nb_places: number;
  reservation_date: string;
  spectacle_id: number;
  spectacle_title: string;
  title?: string; // Pour compatibilité avec MyAccount
  description?: string; // Pour compatibilité avec MyAccount
  img?: string; // Pour compatibilité avec MyAccount
  date_spectacle: string;
  heure_spectacle: string;
  prix: number;
  lieu: string;
  artiste_name: string;
  artiste_photo?: string; // Pour compatibilité avec MyAccount
  user_id: number;
  civility: string;
  user_firstname: string;
  user_lastname: string;
  user_email: string;
  montant_paye: number;
  paiement_statut: boolean;
  date_paiement: string;
}

// Interfaces pour le panier
export interface CartItem {
  id: number;
  title: string;
  date_spectacle: string;
  heure_spectacle: string;
  prix: number;
  img: string;
  lieu: string;
}

// Interfaces pour les avis
export interface Avis {
  id: number;
  user_id: number;
  spectacle_id: number;
  message: string;
  date: string;
  user_name?: string;
  spectacle_title?: string;
}

// Interfaces pour les paiements
export interface Paiement {
  id: number;
  montant: number;
  statut: boolean;
  date: string;
}

// Interfaces pour les formulaires
export interface SpectacleFormData {
  title: string;
  img: string;
  description: string;
  date_spectacle: string;
  heure_spectacle: string;
  prix: string;
  artiste_id: string;
  lieu: string;
}

// Interfaces pour les réponses API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Interfaces pour les contextes
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
}

// Interface pour l'artiste à l'affiche (Hero)
export interface FeaturedArtist {
  id: number;
  name: string;
  photo: string;
  photo_featured: string;
  biographie: string;
  next_show?: {
    id: number;
    date: string;
    time: string;
    title: string;
  };
}

// Interface pour la réponse du statut de paiement
export interface PaymentStatusResponse {
  status: 'paid' | 'failed' | 'pending' | 'cancelled';
  message: string;
  sessionId: string;
} 