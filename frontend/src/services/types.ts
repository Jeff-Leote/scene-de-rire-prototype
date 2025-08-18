// Interfaces pour les utilisateurs
export interface User {
  id: number;
  email: string;
  civility: string;
  firstName: string;
  lastName: string;
  role: string;
  birthDate?: string;
  isActive?: boolean;
  createdAt?: string;
  lastLogin?: string;
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
  places_disponibles?: number;
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
  qr_code_path?: string;
  spectacle_id: number;
  title: string;
  description: string;
  date_spectacle: string;
  heure_spectacle: string;
  prix: number;
  lieu: string;
  img: string;
  artiste_name: string;
  artiste_photo: string;
  montant_paye?: number;
  paiement_statut?: boolean;
  date_paiement?: string;
}

// Interface pour les props du composant QRCodeDisplay
export interface QRCodeDisplayProps {
  reservationId: number;
  qrCodePath?: string;
  spectacleTitle: string;
  dateSpectacle: string;
  heureSpectacle: string;
  nbPlaces: number;
}

// Interface pour les props du composant Header
export interface HeaderProps {
  activeItem?: string;
}

// Interface pour les props du composant ProtectedRoute
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
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
  prix: number;
  artiste_id: string;
  lieu: string;
  places_disponibles?: number;
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
  isLoading: boolean;
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
  status: 'paid' | 'failed' | 'pending';
  message: string;
  sessionId?: string;
}

export interface AvailabilityResponse {
  spectacle_id: number;
  spectacle_title: string;
  places_total: number;
  places_reservees: number;
  places_restantes: number;
  disponible: boolean;
} 